"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, Plus, Edit, X } from "lucide-react"
import {
  getOrganizationById,
  getVendorOrganizationsByOrganizationId,
  getAllVendors,
  getVendorUsersByVendorId,
  getVendorById,
  getPortalUsers,
  addPortalUser,
  updatePortalUser,
  getPortalUserAffiliationsByOrganization,
  addPortalUserAffiliation,
  updatePortalUserAffiliation,
  deletePortalUserAffiliation,
  type PortalUser,
  type PortalUserAffiliation,
  type VendorUser,
} from "@/lib/admin-local-db"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type TabKey = "Program" | "Vendor" | "Organization"

type VendorUserWithRole = {
  vendorUser: VendorUser
  vendorName: string
  vendorId: string
  affiliation?: PortalUserAffiliation
  portalUserId?: string
  uniqueKey: string // For React key
}

const ORGANIZATION_ROLES = [
  "Administrator",
  "Contributor",
  "Viewer",
  "Hiring Manager",
  "Compliance Manager",
  "Billing Manager",
]

export default function OrganizationUsersPage() {
  const params = useParams()
  const { pushToast } = useToast()
  const organizationId = params.id as string
  const [organization, setOrganization] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabKey>("Program")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Vendor users state
  const [vendorUsers, setVendorUsers] = useState<VendorUserWithRole[]>([])
  const [isVendorUserModalOpen, setIsVendorUserModalOpen] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState<string>("")
  const [selectedVendorUserId, setSelectedVendorUserId] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [editingAffiliation, setEditingAffiliation] = useState<PortalUserAffiliation | null>(null)

  // Portal users state
  const [programUsers, setProgramUsers] = useState<PortalUser[]>([])
  const [organizationUsers, setOrganizationUsers] = useState<PortalUser[]>([])
  
  // Organization user add state
  const [isAddOrganizationUserOpen, setIsAddOrganizationUserOpen] = useState(false)
  const [newOrgUserForm, setNewOrgUserForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    officePhone: "",
    mobilePhone: "",
    role: "",
    status: "Active" as "Active" | "Inactive",
  })

  useEffect(() => {
    loadData()
  }, [organizationId])

  const loadData = () => {
    try {
      const org = getOrganizationById(organizationId)
      setOrganization(org)

      // Load Program Users
      const program = getPortalUsers({ userType: "Program" })
      setProgramUsers(program)

      // Load Organization Users
      const orgUsers = getPortalUsers({ userType: "Organization" }).filter(
        (u) => u.groupName === org?.name
      )
      setOrganizationUsers(orgUsers)

      // Load Vendor Users
      loadVendorUsers(org)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadVendorUsers = (org: any) => {
    // Get all vendors associated with this organization
    const vendorAssociations = getVendorOrganizationsByOrganizationId(organizationId)
    const allVendors = getAllVendors()
    
    // Get all vendor users from associated vendors, deduplicated by email
    const usersMap = new Map<string, VendorUserWithRole>()
    const orgName = org?.name || ""
    const affiliations = getPortalUserAffiliationsByOrganization(orgName)
    
    vendorAssociations.forEach((assoc) => {
      const vendor = allVendors.find((v) => v.id === assoc.vendorId)
      if (vendor) {
        const vendorUsers = getVendorUsersByVendorId(assoc.vendorId)
        
        vendorUsers.forEach((vendorUser) => {
          // Use email as unique key to avoid duplicates
          const uniqueKey = `${vendorUser.email}-${organizationId}`
          
          // Only add if not already in map (deduplicate by email)
          if (!usersMap.has(vendorUser.email)) {
            // Check if there's a portal user for this vendor user
            const portalUsers = getPortalUsers({ userType: "Vendor" }).filter(
              (pu) => pu.email === vendorUser.email
            )
            
            let affiliation: PortalUserAffiliation | undefined
            let portalUserId: string | undefined
            
            if (portalUsers.length > 0) {
              portalUserId = portalUsers[0].id
              affiliation = affiliations.find((a) => a.userId === portalUsers[0].id)
            }
            
            usersMap.set(vendorUser.email, {
              vendorUser,
              vendorName: vendor.name,
              vendorId: vendor.id,
              affiliation,
              portalUserId,
              uniqueKey,
            })
          }
        })
      }
    })
    
    setVendorUsers(Array.from(usersMap.values()))
  }

  const getAvailableVendorUsers = () => {
    if (!selectedVendorId) return []
    
    const vendorUsers = getVendorUsersByVendorId(selectedVendorId)
    const orgName = organization?.name || ""
    const affiliations = getPortalUserAffiliationsByOrganization(orgName)
    const affiliatedUserIds = new Set(affiliations.map((a) => a.userId))
    
    // Filter out users that already have affiliations
    return vendorUsers.filter((vu) => {
      const portalUsers = getPortalUsers({ userType: "Vendor" }).filter(
        (pu) => pu.email === vu.email
      )
      return !portalUsers.some((pu) => affiliatedUserIds.has(pu.id))
    })
  }

  const handleAddOrganizationUser = () => {
    if (!newOrgUserForm.firstName || !newOrgUserForm.lastName || !newOrgUserForm.email || !newOrgUserForm.title) {
      pushToast({ title: "Error", description: "Please fill in all required fields." })
      return
    }

    try {
      const orgName = organization?.name || ""
      const newUser = addPortalUser({
        userType: "Organization",
        groupName: orgName,
        firstName: newOrgUserForm.firstName,
        lastName: newOrgUserForm.lastName,
        title: newOrgUserForm.title,
        email: newOrgUserForm.email,
        officePhone: newOrgUserForm.officePhone,
        mobilePhone: newOrgUserForm.mobilePhone,
        role: newOrgUserForm.role,
        status: newOrgUserForm.status,
      })

      pushToast({ title: "Success", description: "Organization user added successfully." })
      setIsAddOrganizationUserOpen(false)
      setNewOrgUserForm({
        firstName: "",
        lastName: "",
        title: "",
        email: "",
        officePhone: "",
        mobilePhone: "",
        role: "",
        status: "Active",
      })
      loadData()
    } catch (error: any) {
      pushToast({ 
        title: "Error", 
        description: error.message || "Failed to add organization user." 
      })
    }
  }

  const handleEditRole = (affiliation: PortalUserAffiliation) => {
    setEditingAffiliation(affiliation)
    const portalUser = getPortalUsers().find((pu) => pu.id === affiliation.userId)
    if (portalUser) {
      // Find the vendor user
      const vendorUser = vendorUsers.find(
        (vu) => vu.portalUserId === affiliation.userId
      )
      if (vendorUser) {
        setSelectedVendorId(vendorUser.vendorId)
        setSelectedVendorUserId(vendorUser.vendorUser.id)
      }
    }
    setSelectedRole(affiliation.roleAtOrganization)
    setIsVendorUserModalOpen(true)
  }

  const handleSaveVendorUser = () => {
    if (!selectedVendorUserId || !selectedRole) {
      pushToast({ title: "Error", description: "Please select a vendor user and role." })
      return
    }

    try {
      const vendorUser = getVendorUsersByVendorId(selectedVendorId).find(
        (vu) => vu.id === selectedVendorUserId
      )
      if (!vendorUser) {
        pushToast({ title: "Error", description: "Vendor user not found." })
        return
      }

      const orgName = organization?.name || ""
      
      if (editingAffiliation) {
        // Update existing affiliation
        const updated = updatePortalUserAffiliation(editingAffiliation.id, {
          roleAtOrganization: selectedRole,
        })
        
        if (updated) {
          pushToast({ title: "Success", description: "Vendor user role updated successfully." })
          loadData()
          setIsVendorUserModalOpen(false)
          setEditingAffiliation(null)
        } else {
          pushToast({ title: "Error", description: "Failed to update role." })
        }
      } else {
        // Check if portal user exists, create if not
        let portalUser = getPortalUsers({ userType: "Vendor" }).find(
          (pu) => pu.email === vendorUser.email
        )
        
        if (!portalUser) {
          // Create portal user
          portalUser = addPortalUser({
            userType: "Vendor",
            groupName: getVendorById(selectedVendorId)?.name || "",
            firstName: vendorUser.firstName,
            lastName: vendorUser.lastName,
            title: vendorUser.title,
            email: vendorUser.email,
            officePhone: vendorUser.officePhone,
            mobilePhone: vendorUser.mobilePhone,
            status: vendorUser.status,
          })
        }
        
        // Create affiliation
        addPortalUserAffiliation({
          userId: portalUser.id,
          organizationName: orgName,
          roleAtOrganization: selectedRole,
          status: "Added",
        })
        
        pushToast({ title: "Success", description: "Vendor user added successfully." })
        loadData()
        setIsVendorUserModalOpen(false)
      }
    } catch (error: any) {
      console.error("Error saving vendor user:", error)
      pushToast({ 
        title: "Error", 
        description: error.message || "Failed to save vendor user." 
      })
    }
  }

  const handleDeleteAffiliation = (affiliationId: string) => {
    if (!confirm("Are you sure you want to remove this vendor user's access to this organization?")) {
      return
    }

    try {
      const success = deletePortalUserAffiliation(affiliationId)
      if (success) {
        pushToast({ title: "Success", description: "Vendor user removed successfully." })
        loadData()
      } else {
        pushToast({ title: "Error", description: "Failed to remove vendor user." })
      }
    } catch (error) {
      pushToast({ title: "Error", description: "Failed to remove vendor user." })
    }
  }

  const getAssociatedVendors = () => {
    const vendorAssociations = getVendorOrganizationsByOrganizationId(organizationId)
    const allVendors = getAllVendors()
    return vendorAssociations
      .map((assoc) => allVendors.find((v) => v.id === assoc.vendorId))
      .filter((v): v is NonNullable<typeof v> => v !== undefined)
  }

  const filteredProgramUsers = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return programUsers.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      return fullName.includes(query) || user.email.toLowerCase().includes(query)
    })
  }, [programUsers, searchQuery])

  const filteredVendorUsers = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return vendorUsers.filter((item) => {
      const fullName = `${item.vendorUser.firstName} ${item.vendorUser.lastName}`.toLowerCase()
      return fullName.includes(query) || 
             item.vendorUser.email.toLowerCase().includes(query) ||
             item.vendorName.toLowerCase().includes(query)
    })
  }, [vendorUsers, searchQuery])

  const filteredOrganizationUsers = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return organizationUsers.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      return fullName.includes(query) || user.email.toLowerCase().includes(query)
    })
  }, [organizationUsers, searchQuery])

  if (loading) {
    return (
      <>
        <Header
          title="Users"
          subtitle={`Manage users for ${organization?.name || "Organization"}`}
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Organizations", href: "/admin/organizations" },
            { label: organization?.name || "Organization", href: `/admin/organizations/${organizationId}` },
            { label: "Users" },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="Users"
        subtitle={`Manage users for ${organization?.name || "Organization"}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organization?.name || "Organization", href: `/admin/organizations/${organizationId}` },
          { label: "Users" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">User Management</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === "Vendor" && "Assign roles to vendor users for this organization"}
                  {activeTab === "Program" && "Program users with access to this organization"}
                  {activeTab === "Organization" && "Organization users"}
                </p>
              </div>
              {activeTab === "Organization" && (
                <Button onClick={() => setIsAddOrganizationUserOpen(true)} className="ph5-button-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)}>
              <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
                <TabsTrigger
                  value="Program"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-3"
                >
                  Program Users ({filteredProgramUsers.length})
                </TabsTrigger>
                <TabsTrigger
                  value="Vendor"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-3"
                >
                  Vendor Users ({filteredVendorUsers.length})
                </TabsTrigger>
                <TabsTrigger
                  value="Organization"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-3"
                >
                  Organization Users ({filteredOrganizationUsers.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="Program" className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">NAME</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">EMAIL</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">TITLE</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">ROLE</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProgramUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            {searchQuery ? "No program users found matching your search." : "No program users available."}
                          </td>
                        </tr>
                      ) : (
                        filteredProgramUsers.map((user) => (
                          <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4 text-sm text-foreground">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="py-3 px-4 text-sm text-foreground">{user.email}</td>
                            <td className="py-3 px-4 text-sm text-foreground">{user.title}</td>
                            <td className="py-3 px-4 text-sm text-foreground">{user.role || "-"}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${
                                user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}>
                                {user.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="Vendor" className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">VENDOR</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">NAME</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">EMAIL</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">TITLE</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">ROLE</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVendorUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            {searchQuery ? "No vendor users found matching your search." : "No vendor users available."}
                          </td>
                        </tr>
                      ) : (
                        filteredVendorUsers.map((item) => (
                          <tr key={item.uniqueKey} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4 text-sm text-foreground">{item.vendorName}</td>
                            <td className="py-3 px-4 text-sm text-foreground">
                              {item.vendorUser.firstName} {item.vendorUser.lastName}
                            </td>
                            <td className="py-3 px-4 text-sm text-foreground">{item.vendorUser.email}</td>
                            <td className="py-3 px-4 text-sm text-foreground">{item.vendorUser.title}</td>
                            <td className="py-3 px-4 text-sm">
                              {item.affiliation ? (
                                <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                                  {item.affiliation.roleAtOrganization}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Not assigned</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                {item.affiliation ? (
                                  <>
                                    <button
                                      onClick={() => handleEditRole(item.affiliation!)}
                                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Role
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAffiliation(item.affiliation!.id)}
                                      className="inline-flex items-center gap-2 text-sm text-destructive hover:underline"
                                    >
                                      <X className="h-4 w-4" />
                                      Remove
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedVendorId(item.vendorId)
                                      setSelectedVendorUserId(item.vendorUser.id)
                                      setEditingAffiliation(null)
                                      setIsVendorUserModalOpen(true)
                                    }}
                                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                  >
                                    <Plus className="h-4 w-4" />
                                    Assign Role
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="Organization" className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">NAME</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">EMAIL</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">TITLE</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">ROLE</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrganizationUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            {searchQuery ? "No organization users found matching your search." : "No organization users available."}
                          </td>
                        </tr>
                      ) : (
                        filteredOrganizationUsers.map((user) => (
                          <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4 text-sm text-foreground">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="py-3 px-4 text-sm text-foreground">{user.email}</td>
                            <td className="py-3 px-4 text-sm text-foreground">{user.title}</td>
                            <td className="py-3 px-4 text-sm text-foreground">{user.role || "-"}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${
                                user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }`}>
                                {user.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </section>

      {/* Add/Edit Vendor User Modal */}
      <Dialog open={isVendorUserModalOpen} onOpenChange={setIsVendorUserModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAffiliation ? "Edit Vendor User Role" : "Add Vendor User"}</DialogTitle>
            <DialogDescription>
              {editingAffiliation ? "Update the role for this vendor user." : "Select a vendor user and assign a role for this organization. Role selection is required."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!editingAffiliation && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="vendor-select">Vendor *</Label>
                  <Select
                    value={selectedVendorId}
                    onValueChange={(value) => {
                      setSelectedVendorId(value)
                      setSelectedVendorUserId("")
                    }}
                  >
                    <SelectTrigger id="vendor-select" className="bg-background">
                      <SelectValue placeholder="Select a vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAssociatedVendors().map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-select">Vendor User *</Label>
                  <Select
                    value={selectedVendorUserId}
                    onValueChange={setSelectedVendorUserId}
                    disabled={!selectedVendorId}
                  >
                    <SelectTrigger id="user-select" className="bg-background">
                      <SelectValue placeholder={selectedVendorId ? "Select a vendor user" : "Select vendor first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableVendorUsers().map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="role-select">Role at Organization *</Label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger id="role-select" className="bg-background">
                  <SelectValue placeholder="Select a role (required)" />
                </SelectTrigger>
                <SelectContent>
                  {ORGANIZATION_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Role selection is required to grant access</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsVendorUserModalOpen(false)
              setEditingAffiliation(null)
              setSelectedVendorId("")
              setSelectedVendorUserId("")
              setSelectedRole("")
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveVendorUser} 
              className="ph5-button-primary"
              disabled={!selectedRole || (!editingAffiliation && (!selectedVendorId || !selectedVendorUserId))}
            >
              {editingAffiliation ? "Update" : "Add"} User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Organization User Modal */}
      <Dialog open={isAddOrganizationUserOpen} onOpenChange={setIsAddOrganizationUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Organization User</DialogTitle>
            <DialogDescription>
              Add a new user for this organization. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-first-name">First Name *</Label>
                <Input
                  id="org-first-name"
                  value={newOrgUserForm.firstName}
                  onChange={(e) => setNewOrgUserForm({ ...newOrgUserForm, firstName: e.target.value })}
                  placeholder="First Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-last-name">Last Name *</Label>
                <Input
                  id="org-last-name"
                  value={newOrgUserForm.lastName}
                  onChange={(e) => setNewOrgUserForm({ ...newOrgUserForm, lastName: e.target.value })}
                  placeholder="Last Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-title">Title *</Label>
                <Input
                  id="org-title"
                  value={newOrgUserForm.title}
                  onChange={(e) => setNewOrgUserForm({ ...newOrgUserForm, title: e.target.value })}
                  placeholder="Job Title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-email">Email *</Label>
                <Input
                  id="org-email"
                  type="email"
                  value={newOrgUserForm.email}
                  onChange={(e) => setNewOrgUserForm({ ...newOrgUserForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-role">Role</Label>
                <Select
                  value={newOrgUserForm.role}
                  onValueChange={(value) => setNewOrgUserForm({ ...newOrgUserForm, role: value })}
                >
                  <SelectTrigger id="org-role" className="bg-background">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGANIZATION_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-status">Status</Label>
                <Select
                  value={newOrgUserForm.status}
                  onValueChange={(value) => setNewOrgUserForm({ ...newOrgUserForm, status: value as "Active" | "Inactive" })}
                >
                  <SelectTrigger id="org-status" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-office-phone">Office Phone</Label>
                <Input
                  id="org-office-phone"
                  value={newOrgUserForm.officePhone}
                  onChange={(e) => setNewOrgUserForm({ ...newOrgUserForm, officePhone: e.target.value })}
                  placeholder="555-123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-mobile-phone">Mobile Phone</Label>
                <Input
                  id="org-mobile-phone"
                  value={newOrgUserForm.mobilePhone}
                  onChange={(e) => setNewOrgUserForm({ ...newOrgUserForm, mobilePhone: e.target.value })}
                  placeholder="555-987-6543"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddOrganizationUserOpen(false)
              setNewOrgUserForm({
                firstName: "",
                lastName: "",
                title: "",
                email: "",
                officePhone: "",
                mobilePhone: "",
                role: "",
                status: "Active",
              })
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddOrganizationUser} 
              className="ph5-button-primary"
              disabled={!newOrgUserForm.firstName || !newOrgUserForm.lastName || !newOrgUserForm.email || !newOrgUserForm.title}
            >
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
