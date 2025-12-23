"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X, Edit, Plus, Search, MoreVertical } from "lucide-react"
import { DataTable } from "@/components/system/table"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getCurrentOrganization,
  getWorkforceGroupById,
  updateWorkforceGroup,
  type OrganizationWorkforceGroup,
} from "@/lib/organization-local-db"
import { getAllOccupations, getAllSpecialties, getComplianceListItemById } from "@/lib/admin-local-db"
import { getPlacementsByOrganization } from "@/lib/organization-local-db"
import { getWalletTemplatesByOrganization } from "@/lib/organization-local-db"
import { candidates } from "@/lib/mock-data"

export default function WorkforceGroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { pushToast } = useToast()
  const groupId = params.id as string
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [group, setGroup] = useState<OrganizationWorkforceGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [memberSearchQuery, setMemberSearchQuery] = useState("")
  const [isChangeTemplateDialogOpen, setIsChangeTemplateDialogOpen] = useState(false)
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    occupationCodes: [] as string[],
    specialtyCodes: [] as string[],
    complianceTemplateId: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orgId = getCurrentOrganization()
      setCurrentOrgId(orgId)
      loadGroup(groupId)
    }
  }, [groupId])

  const loadGroup = (id: string) => {
    const loadedGroup = getWorkforceGroupById(id)
    if (loadedGroup) {
      setGroup(loadedGroup)
      setFormData({
        name: loadedGroup.name,
        description: loadedGroup.description,
        occupationCodes: loadedGroup.occupationCodes || [],
        specialtyCodes: loadedGroup.specialtyCodes || [],
        complianceTemplateId: loadedGroup.complianceTemplateId || "",
      })
    }
    setLoading(false)
  }

  // Get all available occupations and specialties
  const allOccupations = useMemo(() => getAllOccupations(), [])
  const allSpecialties = useMemo(() => getAllSpecialties(), [])

  // Get available compliance templates
  const complianceTemplates = useMemo(() => {
    if (!currentOrgId) return []
    return getWalletTemplatesByOrganization(currentOrgId)
  }, [currentOrgId])

  // Calculate group statistics
  const stats = useMemo(() => {
    if (!group || !currentOrgId) {
      return { memberCount: 0, occupationCount: 0, compliancePercentage: 0 }
    }

    const placements = getPlacementsByOrganization(currentOrgId)
    const matchingOccupations = allOccupations.filter((occ) =>
      group.occupationCodes.includes(occ.code)
    )

    // Count members (candidates with matching occupations)
    const memberCount = candidates.filter((c) => {
      const candidateRole = c.role.toLowerCase()
      return matchingOccupations.some((occ) =>
        candidateRole.includes(occ.name.toLowerCase()) ||
        candidateRole.includes(occ.code.toLowerCase())
      )
    }).length

    const occupationCount = group.occupationCodes.length

    // Calculate compliance percentage (mock calculation based on candidate documents)
    const groupCandidates = candidates.filter((c) => {
      const candidateRole = c.role.toLowerCase()
      return matchingOccupations.some((occ) =>
        candidateRole.includes(occ.name.toLowerCase()) ||
        candidateRole.includes(occ.code.toLowerCase())
      )
    })

    if (groupCandidates.length === 0) {
      return { memberCount, occupationCount, compliancePercentage: 0 }
    }

    const totalDocs = groupCandidates.reduce((sum, c) => sum + c.documents.length, 0)
    const completedDocs = groupCandidates.reduce(
      (sum, c) => sum + c.documents.filter((d) => d.status === "Completed").length,
      0
    )
    const compliancePercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

    return { memberCount, occupationCount, compliancePercentage }
  }, [group, currentOrgId, allOccupations])

  // Get occupation names
  const occupationNames = useMemo(() => {
    if (!group) return []
    return group.occupationCodes
      .map((code) => {
        const occ = allOccupations.find((o) => o.code === code)
        return occ?.name || code
      })
      .filter(Boolean)
  }, [group, allOccupations])

  // Get specialty names
  const specialtyNames = useMemo(() => {
    if (!group) return []
    return (group.specialtyCodes || [])
      .map((code) => {
        const spec = allSpecialties.find((s) => s.code === code)
        return spec?.name || code
      })
      .filter(Boolean)
  }, [group, allSpecialties])

  // Get compliance template name
  const complianceTemplateName = useMemo(() => {
    if (!group?.complianceTemplateId) return null
    const template = complianceTemplates.find((t) => t.id === group.complianceTemplateId)
    return template?.name || null
  }, [group, complianceTemplates])

  // Get compliance template item count
  const complianceTemplateItemCount = useMemo(() => {
    if (!group?.complianceTemplateId) return 0
    const template = complianceTemplates.find((t) => t.id === group.complianceTemplateId)
    if (!template) return 0
    // Count required items
    const allListItems = template.listItemIds.map((id) => getComplianceListItemById(id)).filter(Boolean)
    return allListItems.filter((item) => item?.isRequired).length
  }, [group, complianceTemplates])

  // Get group members (candidates matching the group's occupations)
  const groupMembers = useMemo(() => {
    if (!group || !currentOrgId) return []
    
    const matchingOccupations = allOccupations.filter((occ) =>
      group.occupationCodes.includes(occ.code)
    )

    const members = candidates
      .filter((c) => {
        const candidateRole = c.role.toLowerCase()
        return matchingOccupations.some((occ) =>
          candidateRole.includes(occ.name.toLowerCase()) ||
          candidateRole.includes(occ.code.toLowerCase())
        )
      })
      .map((c) => {
        // Calculate compliance percentage
        const totalDocs = c.documents.length
        const completedDocs = c.documents.filter((d) => d.status === "Completed").length
        const compliancePercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0
        
        // Determine compliance status
        let complianceStatus: "Complete" | "Pending" | "Missing" = "Complete"
        if (compliancePercentage === 100) {
          complianceStatus = "Complete"
        } else if (compliancePercentage >= 50) {
          complianceStatus = "Pending"
        } else {
          complianceStatus = "Missing"
        }

        return {
          id: c.id,
          name: c.name,
          occupation: c.role || "Unknown",
          specialty: c.specialties?.[0] || "N/A",
          status: group.name,
          complianceStatus,
          compliancePercentage,
        }
      })

    // Filter by search query
    if (memberSearchQuery.trim()) {
      const query = memberSearchQuery.toLowerCase()
      return members.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.occupation.toLowerCase().includes(query) ||
          m.specialty.toLowerCase().includes(query)
      )
    }

    return members
  }, [group, currentOrgId, allOccupations, memberSearchQuery])

  const handleSave = () => {
    if (!group) return

    if (!formData.name.trim()) {
      pushToast({
        title: "Validation Error",
        description: "Group name is required.",
        type: "error",
      })
      return
    }

    try {
      updateWorkforceGroup(group.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        occupationCodes: formData.occupationCodes,
        specialtyCodes: formData.specialtyCodes.length > 0 ? formData.specialtyCodes : undefined,
        complianceTemplateId: formData.complianceTemplateId || undefined,
      })

      pushToast({
        title: "Success",
        description: "Workforce group updated successfully.",
        type: "success",
      })

      setIsEditing(false)
      loadGroup(groupId)
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to update workforce group.",
        type: "error",
      })
    }
  }

  const toggleOccupation = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      occupationCodes: prev.occupationCodes.includes(code)
        ? prev.occupationCodes.filter((c) => c !== code)
        : [...prev.occupationCodes, code],
    }))
  }

  const toggleSpecialty = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      specialtyCodes: prev.specialtyCodes.includes(code)
        ? prev.specialtyCodes.filter((c) => c !== code)
        : [...prev.specialtyCodes, code],
    }))
  }

  if (loading) {
    return (
      <>
        <Header
          title="Workforce Group"
          subtitle="View and edit workforce group details"
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Workforce", href: "/organization/workforce" },
            { label: "Workforce Groups", href: "/organization/workforce/workforce-groups" },
            { label: "Details" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Card>
      </>
    )
  }

  if (!group) {
    return (
      <>
        <Header
          title="Workforce Group"
          subtitle="Workforce group not found"
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Workforce", href: "/organization/workforce" },
            { label: "Workforce Groups", href: "/organization/workforce/workforce-groups" },
            { label: "Details" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Workforce group not found.</p>
            <Button onClick={() => router.push("/organization/workforce/workforce-groups")} className="mt-4">
              Back to Workforce Groups
            </Button>
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      <Header
        title={isEditing ? "Edit Workforce Group" : group.name}
        subtitle={isEditing ? "Update workforce group details" : group.description}
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Workforce", href: "/organization/workforce" },
          { label: "Workforce Groups", href: "/organization/workforce/workforce-groups" },
          { label: group.name },
        ]}
      />

      <section className="space-y-6">
        {!isEditing ? (
          <>
            {/* Header Section */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{group.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
              </div>
              <Button onClick={() => setIsEditing(true)} className="ph5-button-primary">
                <Edit className="h-4 w-4 mr-2" />
                Edit Group
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Members</p>
                <p className="text-3xl font-bold text-foreground">{stats.memberCount}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Occupations</p>
                <p className="text-3xl font-bold text-foreground">{stats.occupationCount}</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Compliance</p>
                <p className="text-3xl font-bold text-foreground">{stats.compliancePercentage}%</p>
              </Card>
            </div>

            {/* Compliance Template Section */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Compliance Template</h3>
                  {complianceTemplateName ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{complianceTemplateName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {complianceTemplateItemCount} required items
                          </p>
                        </div>
                        <StatusChip status="success" label="Active" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No template assigned</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangeTemplateDialogOpen(true)}
                >
                  Change Template
                </Button>
              </div>
            </Card>

            {/* Group Members Section */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Group Members</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddMembersDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Members
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search members..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Members Table */}
                <DataTable
                  columns={[
                    {
                      id: "name",
                      label: "Name",
                      sortable: true,
                      render: (member: any) => (
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                        </div>
                      ),
                    },
                    { id: "occupation", label: "Occupation", sortable: true },
                    { id: "specialty", label: "Specialty", sortable: true },
                    {
                      id: "status",
                      label: "Status",
                      sortable: true,
                      render: (member: any) => (
                        <span className="text-sm text-muted-foreground">{member.status}</span>
                      ),
                    },
                    {
                      id: "compliance",
                      label: "Compliance",
                      sortable: true,
                      render: (member: any) => (
                        <StatusChip
                          status={
                            member.complianceStatus === "Complete"
                              ? "success"
                              : member.complianceStatus === "Pending"
                              ? "warning"
                              : "error"
                          }
                          label={member.complianceStatus === "Complete" ? `${member.compliancePercentage}%` : `${member.complianceStatus} ${member.compliancePercentage}%`}
                        />
                      ),
                    },
                    {
                      id: "actions",
                      label: "Actions",
                      sortable: false,
                      render: (member: any) => (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="backdrop-blur-sm bg-card/95">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ),
                    },
                  ]}
                  rows={groupMembers}
                  rowKey={(row) => row.id}
                />
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Group Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter group name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter group description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Occupations *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border border-border rounded-lg max-h-[200px] overflow-y-auto">
                  {allOccupations.map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => toggleOccupation(occ.code)}
                      className={cn(
                        "p-2 text-left rounded-md border transition-colors text-sm",
                        formData.occupationCodes.includes(occ.code)
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border hover:bg-muted/50 text-foreground"
                      )}
                    >
                      {occ.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specialties (Optional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border border-border rounded-lg max-h-[200px] overflow-y-auto">
                  {allSpecialties.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => toggleSpecialty(spec.code)}
                      className={cn(
                        "p-2 text-left rounded-md border transition-colors text-sm",
                        formData.specialtyCodes.includes(spec.code)
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border hover:bg-muted/50 text-foreground"
                      )}
                    >
                      {spec.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complianceTemplate">Compliance Template</Label>
                <Select
                  value={formData.complianceTemplateId}
                  onValueChange={(value) => setFormData({ ...formData, complianceTemplateId: value })}
                >
                  <SelectTrigger id="complianceTemplate" className="w-full bg-background">
                    <SelectValue placeholder="Select a compliance template (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    <SelectItem value="none">None</SelectItem>
                    {complianceTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setIsEditing(false)
                  loadGroup(groupId)
                }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="ph5-button-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        )}
      </section>

      {/* Change Template Dialog */}
      <Dialog open={isChangeTemplateDialogOpen} onOpenChange={setIsChangeTemplateDialogOpen}>
        <DialogContent className="backdrop-blur-sm bg-card/95">
          <DialogHeader>
            <DialogTitle>Change Compliance Template</DialogTitle>
            <DialogDescription>
              Select a compliance template for this workforce group
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={formData.complianceTemplateId}
              onValueChange={(value) => setFormData({ ...formData, complianceTemplateId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a compliance template" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-sm bg-card/95">
                <SelectItem value="none">None</SelectItem>
                {complianceTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsChangeTemplateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleSave()
                  setIsChangeTemplateDialogOpen(false)
                }}
                className="ph5-button-primary"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog open={isAddMembersDialogOpen} onOpenChange={setIsAddMembersDialogOpen}>
        <DialogContent className="backdrop-blur-sm bg-card/95 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Members</DialogTitle>
            <DialogDescription>
              Add candidates to this workforce group
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Member addition functionality will be implemented here.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddMembersDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  pushToast({
                    title: "Success",
                    description: "Members added successfully",
                    type: "success",
                  })
                  setIsAddMembersDialogOpen(false)
                }}
                className="ph5-button-primary"
              >
                Add Selected
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


