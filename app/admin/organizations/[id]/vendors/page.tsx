"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, ArrowUpDown, Eye, Plus, X, Trash2 } from "lucide-react"
import { 
  getAllVendors, 
  getOrganizationById, 
  getVendorOrganizationsByOrganizationId,
  getVendorById,
  addVendorOrganization,
  getVendorOrganizationByVendorAndOrg,
  updateVendorOrganization,
  deleteVendorOrganization,
  type Vendor,
  type VendorOrganization
} from "@/lib/admin-local-db"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type SortField = "name" | "status" | "activationDate" | "inactivationDate"
type SortDirection = "asc" | "desc"

export default function OrganizationVendorsPage() {
  const params = useParams()
  const router = useRouter()
  const { pushToast } = useToast()
  const organizationId = params.id as string
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorAssociations, setVendorAssociations] = useState<VendorOrganization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [organizationName, setOrganizationName] = useState<string>("Organization")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAssociation, setEditingAssociation] = useState<VendorOrganization | null>(null)
  const [formData, setFormData] = useState({
    vendorId: "",
    status: "Active" as "Active" | "Inactive" | "Pending",
    startDate: "",
    endDate: "",
    notes: "",
  })
  const itemsPerPage = 10
  const [selectedVendorIds, setSelectedVendorIds] = useState<Set<string>>(new Set())
  const [bulkVendorIds, setBulkVendorIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
    // Reload vendors when page becomes visible (e.g., after navigation back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [organizationId])

  const loadData = () => {
    try {
      // Get vendors associated with this organization
      const associations = getVendorOrganizationsByOrganizationId(organizationId)
      setVendorAssociations(associations)
      const associatedVendorIds = new Set(associations.map((va) => va.vendorId))
      
      // Get all vendors and filter to only those associated with this organization
      const allVendors = getAllVendors()
      const filteredVendors = allVendors.filter((vendor) => associatedVendorIds.has(vendor.id))
      
      setVendors(filteredVendors)
      setSelectedVendorIds(new Set())
      
      // Get organization name
      const org = getOrganizationById(organizationId)
      if (org) {
        setOrganizationName(org.name)
      }
    } catch (error) {
      console.error("Error loading vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAvailableVendors = () => {
    const allVendors = getAllVendors()
    const associatedVendorIds = new Set(vendorAssociations.map((va) => va.vendorId))
    return allVendors.filter((vendor) => !associatedVendorIds.has(vendor.id))
  }

  const handleAddVendor = () => {
    setEditingAssociation(null)
    setFormData({
      vendorId: "",
      status: "Active",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      notes: "",
    })
    setBulkVendorIds(new Set())
    setIsAddModalOpen(true)
  }

  const handleEditAssociation = (association: VendorOrganization) => {
    setEditingAssociation(association)
    setFormData({
      vendorId: association.vendorId,
      status: association.status,
      startDate: association.startDate || "",
      endDate: association.endDate || "",
      notes: association.notes || "",
    })
    setIsAddModalOpen(true)
  }

  const handleSaveAssociation = () => {
    try {
      if (editingAssociation) {
        if (!formData.vendorId) {
          pushToast({ title: "Error", description: "Please select a vendor." })
          return
        }

        // Update existing association
        const updated = updateVendorOrganization(editingAssociation.id, {
          status: formData.status,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          notes: formData.notes || undefined,
        })
        
        if (updated) {
          pushToast({ title: "Success", description: "Vendor association updated successfully." })
          loadData()
          setIsAddModalOpen(false)
          setEditingAssociation(null)
        } else {
          pushToast({ title: "Error", description: "Failed to update association." })
        }
      } else {
        if (bulkVendorIds.size === 0) {
          pushToast({ title: "Error", description: "Please select at least one vendor." })
          return
        }

        let createdCount = 0

        bulkVendorIds.forEach((vendorId) => {
          // Guard against any race conditions where an association might have been created meanwhile
          const existing = getVendorOrganizationByVendorAndOrg(vendorId, organizationId)
          if (existing) {
            return
          }

          addVendorOrganization({
            vendorId,
            organizationId: organizationId,
            status: formData.status,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
            notes: formData.notes || undefined,
          })
          createdCount += 1
        })
        
        if (createdCount > 0) {
          pushToast({
            title: "Vendors added",
            description: `${createdCount} vendor${createdCount > 1 ? "s" : ""} added successfully.`,
          })
        } else {
          pushToast({
            title: "No vendors added",
            description: "No new vendors were added to this organization.",
          })
        }

        loadData()
        setIsAddModalOpen(false)
      }
    } catch (error: any) {
      console.error("Error saving association:", error)
      pushToast({ 
        title: "Error", 
        description: error.message || "Failed to save association." 
      })
    }
  }

  const handleDeleteAssociation = (id: string) => {
    if (!confirm("Are you sure you want to remove this vendor from the organization?")) {
      return
    }

    try {
      const success = deleteVendorOrganization(id)
      if (success) {
        pushToast({ title: "Success", description: "Vendor removed successfully." })
        loadData()
      } else {
        pushToast({ title: "Error", description: "Failed to remove vendor." })
      }
    } catch (error) {
      pushToast({ title: "Error", description: "Failed to remove vendor." })
    }
  }

  const getAssociationForVendor = (vendorId: string): VendorOrganization | undefined => {
    return vendorAssociations.find((va) => va.vendorId === vendorId)
  }

  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendors.filter((vendor) => {
      const query = searchQuery.toLowerCase()
      return vendor.name.toLowerCase().includes(query)
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "status":
          comparison = a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1
          break
        case "activationDate":
          const dateA = a.activationDate ? new Date(a.activationDate).getTime() : 0
          const dateB = b.activationDate ? new Date(b.activationDate).getTime() : 0
          comparison = dateA - dateB
          break
        case "inactivationDate":
          const inactDateA = a.inactivationDate ? new Date(a.inactivationDate).getTime() : 0
          const inactDateB = b.inactivationDate ? new Date(b.inactivationDate).getTime() : 0
          comparison = inactDateA - inactDateB
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [vendors, searchQuery, sortField, sortDirection])

  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedVendors.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedVendors, currentPage])

  const totalPages = Math.ceil(filteredAndSortedVendors.length / itemsPerPage)

  const toggleSelectAll = () => {
    setSelectedVendorIds((prev) => {
      if (paginatedVendors.length === 0) return new Set()
      const allSelected = paginatedVendors.every((vendor) => prev.has(vendor.id))
      if (allSelected) {
        const next = new Set(prev)
        paginatedVendors.forEach((vendor) => next.delete(vendor.id))
        return next
      }
      const next = new Set(prev)
      paginatedVendors.forEach((vendor) => next.add(vendor.id))
      return next
    })
  }

  const toggleVendorSelection = (vendorId: string) => {
    setSelectedVendorIds((prev) => {
      const next = new Set(prev)
      if (next.has(vendorId)) {
        next.delete(vendorId)
      } else {
        next.add(vendorId)
      }
      return next
    })
  }

  const handleBulkRemove = () => {
    if (selectedVendorIds.size === 0) return
    if (
      !confirm(
        `Are you sure you want to remove ${selectedVendorIds.size} vendor${
          selectedVendorIds.size > 1 ? "s" : ""
        } from this organization?`,
      )
    ) {
      return
    }

    let successCount = 0
    let failureCount = 0

    selectedVendorIds.forEach((vendorId) => {
      const association = getAssociationForVendor(vendorId)
      if (!association) return
      try {
        const success = deleteVendorOrganization(association.id)
        if (success) {
          successCount += 1
        } else {
          failureCount += 1
        }
      } catch (error) {
        console.error("Error removing vendor association:", error)
        failureCount += 1
      }
    })

    if (successCount > 0) {
      pushToast({
        title: "Vendors removed",
        description: `${successCount} vendor${successCount > 1 ? "s" : ""} removed from organization.${
          failureCount ? ` ${failureCount} failed.` : ""
        }`,
      })
    } else if (failureCount > 0) {
      pushToast({ title: "Error", description: "Failed to remove selected vendors." })
    }

    loadData()
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <>
        <Header
          title="Vendors"
          subtitle={`Vendors for ${organizationName}`}
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Organizations", href: "/admin/organizations" },
            { label: organizationName, href: `/admin/organizations/${organizationId}` },
            { label: "Vendors" },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading vendors...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="Vendors"
        subtitle={`Vendors for ${organizationName}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organizationName, href: `/admin/organizations/${organizationId}` },
          { label: "Vendors" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Vendor List</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage vendors associated with this organization</p>
              </div>
              <Button onClick={handleAddVendor} className="ph5-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search here"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>

            {/* Bulk actions + Vendor Table */}
            {selectedVendorIds.size > 0 && (
              <div className="flex items-center justify-between rounded-md border border-border bg-muted px-4 py-2 text-sm">
                <span className="text-muted-foreground">
                  {selectedVendorIds.size} vendor{selectedVendorIds.size > 1 ? "s" : ""} selected
                </span>
                <button
                  onClick={handleBulkRemove}
                  className="inline-flex items-center gap-2 text-sm text-destructive hover:underline"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove selected
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">
                      <Checkbox
                        aria-label="Select all vendors on this page"
                        checked={
                          paginatedVendors.length > 0 &&
                          paginatedVendors.every((vendor) => selectedVendorIds.has(vendor.id))
                        }
                        indeterminate={
                          paginatedVendors.some((vendor) => selectedVendorIds.has(vendor.id)) &&
                          !paginatedVendors.every((vendor) => selectedVendorIds.has(vendor.id))
                        }
                        onCheckedChange={toggleSelectAll}
                        className="border-border data-[state=checked]:bg-primary"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        VENDOR NAME
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      <button
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        STATUS
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      <button
                        onClick={() => handleSort("activationDate")}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        ACTIVATION DATE
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      <button
                        onClick={() => handleSort("inactivationDate")}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        INACTIVATION DATE
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">ASSOCIATION STATUS</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVendors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        {searchQuery ? "No vendors found matching your search." : "No vendors available."}
                      </td>
                    </tr>
                  ) : (
                    paginatedVendors.map((vendor) => {
                      const association = getAssociationForVendor(vendor.id)
                      return (
                        <tr key={vendor.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <Checkbox
                              aria-label={`Select vendor ${vendor.name}`}
                              checked={selectedVendorIds.has(vendor.id)}
                              onCheckedChange={() => toggleVendorSelection(vendor.id)}
                              className="border-border data-[state=checked]:bg-primary"
                            />
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground">{vendor.name}</td>
                          <td className="py-3 px-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  vendor.isActive ? "bg-primary" : "bg-muted-foreground"
                                }`}
                              />
                              <span className={vendor.isActive ? "text-foreground" : "text-muted-foreground"}>
                                {vendor.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground">{formatDate(vendor.activationDate)}</td>
                          <td className="py-3 px-4 text-sm text-foreground">{formatDate(vendor.inactivationDate)}</td>
                          <td className="py-3 px-4 text-sm">
                            {association && (
                              <span className={`px-2 py-1 rounded text-xs ${
                                association.status === "Active" ? "bg-green-100 text-green-800" :
                                association.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {association.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              {association && (
                                <button
                                  onClick={() => handleEditAssociation(association)}
                                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                  Edit
                                </button>
                              )}
                              <Link
                                href={`/admin/organizations/${organizationId}/vendors/${vendor.id}`}
                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                              {association && (
                                <button
                                  onClick={() => handleDeleteAssociation(association.id)}
                                  className="inline-flex items-center gap-2 text-sm text-destructive hover:underline"
                                >
                                  <X className="h-4 w-4" />
                                  Remove
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt; Previous
                </button>
                <span className="px-4 py-1 text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next &gt;
                </button>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Add/Edit Vendor Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAssociation ? "Edit Vendor Association" : "Add Vendors to Organization"}
            </DialogTitle>
            <DialogDescription>
              {editingAssociation
                ? "Update the vendor association details."
                : "Select one or more vendors to associate with this organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingAssociation ? (
              <div className="space-y-2">
                <Label htmlFor="vendor-select">Vendor *</Label>
                <Select
                  value={formData.vendorId}
                  onValueChange={(value) => setFormData({ ...formData, vendorId: value })}
                  disabled
                >
                  <SelectTrigger id="vendor-select" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={formData.vendorId}>
                      {getVendorById(formData.vendorId)?.name || formData.vendorId}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Vendors *</Label>
                <div className="rounded-md border border-border bg-background">
                  <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs text-muted-foreground">
                    <span>
                      {bulkVendorIds.size} selected
                    </span>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => {
                        const available = getAvailableVendors()
                        if (bulkVendorIds.size === available.length) {
                          setBulkVendorIds(new Set())
                        } else {
                          setBulkVendorIds(new Set(available.map((v) => v.id)))
                        }
                      }}
                    >
                      {bulkVendorIds.size === getAvailableVendors().length ? "Clear all" : "Select all"}
                    </button>
                  </div>
                  <div className="max-h-64 space-y-1 overflow-y-auto p-3">
                    {getAvailableVendors().length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        All vendors are already associated with this organization.
                      </p>
                    ) : (
                      getAvailableVendors().map((vendor) => (
                        <label
                          key={vendor.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted"
                        >
                          <Checkbox
                            checked={bulkVendorIds.has(vendor.id)}
                            onCheckedChange={() => {
                              setBulkVendorIds((prev) => {
                                const next = new Set(prev)
                                if (next.has(vendor.id)) {
                                  next.delete(vendor.id)
                                } else {
                                  next.add(vendor.id)
                                }
                                return next
                              })
                            }}
                            className="border-border data-[state=checked]:bg-primary"
                          />
                          <span>{vendor.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as "Active" | "Inactive" | "Pending" })}
              >
                <SelectTrigger id="status" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about this vendor association..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddModalOpen(false)
              setEditingAssociation(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveAssociation} className="ph5-button-primary">
              {editingAssociation ? "Update" : "Add"} Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


