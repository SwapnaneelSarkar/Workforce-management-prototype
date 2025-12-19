"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Plus, Edit, Trash2 } from "lucide-react"
import {
  getVendorOrganizationsByVendorId,
  getAllOrganizations,
  getOrganizationById,
  addVendorOrganization,
  updateVendorOrganization,
  deleteVendorOrganization,
  getVendorOrganizationByVendorAndOrg,
  type VendorOrganization,
  type AdminLocalDbOrganizationEntry,
} from "@/lib/admin-local-db"

type AssociatedOrganizationsProps = {
  vendorId: string
  isEditMode?: boolean
}

type OrganizationWithAssociation = {
  organizationId: string
  organizationName: string
  association: VendorOrganization
}

export default function AssociatedOrganizations({ vendorId, isEditMode = true }: AssociatedOrganizationsProps) {
  const router = useRouter()
  const { pushToast } = useToast()
  const [organizations, setOrganizations] = useState<OrganizationWithAssociation[]>([])
  const [allOrganizations, setAllOrganizations] = useState<AdminLocalDbOrganizationEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    organizationId: "",
    status: "Active" as "Active" | "Inactive" | "Pending",
    startDate: "",
    endDate: "",
    notes: "",
  })

  useEffect(() => {
    if (vendorId && vendorId !== "add") {
      loadData()
    } else {
      setLoading(false)
    }
  }, [vendorId])

  const loadData = () => {
    try {
      const associations = getVendorOrganizationsByVendorId(vendorId)
      const orgsWithAssociations: OrganizationWithAssociation[] = associations
        .map((assoc) => {
          const org = getOrganizationById(assoc.organizationId)
          return {
            organizationId: assoc.organizationId,
            organizationName: org?.name || assoc.organizationId,
            association: assoc,
          }
        })
        .filter((org) => org.organizationName)
      
      setOrganizations(orgsWithAssociations)
      
      const allOrgs = getAllOrganizations()
      setAllOrganizations(allOrgs)
    } catch (error) {
      console.error("Error loading associated organizations:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAvailableOrganizations = () => {
    const associatedOrgIds = new Set(organizations.map((o) => o.association.organizationId))
    return allOrganizations.filter((org) => {
      // If editing, include the current organization
      if (editingId) {
        const editing = organizations.find((o) => o.association.id === editingId)
        if (editing && org.id === editing.association.organizationId) {
          return true
        }
      }
      return !associatedOrgIds.has(org.id)
    })
  }

  const handleAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData({
      organizationId: "",
      status: "Active",
      startDate: "",
      endDate: "",
      notes: "",
    })
  }

  const handleEdit = (association: VendorOrganization) => {
    setEditingId(association.id)
    setIsAdding(false)
    setFormData({
      organizationId: association.organizationId,
      status: association.status,
      startDate: association.startDate || "",
      endDate: association.endDate || "",
      notes: association.notes || "",
    })
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      organizationId: "",
      status: "Active",
      startDate: "",
      endDate: "",
      notes: "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.organizationId) {
      pushToast({ title: "Error", description: "Please select an organization." })
      return
    }

    try {
      if (editingId) {
        // Update existing association
        const updated = updateVendorOrganization(editingId, {
          status: formData.status,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          notes: formData.notes || undefined,
        })
        
        if (updated) {
          pushToast({ title: "Success", description: "Organization association updated successfully." })
          loadData()
          handleCancel()
        } else {
          pushToast({ title: "Error", description: "Failed to update association." })
        }
      } else {
        // Check if association already exists
        const existing = getVendorOrganizationByVendorAndOrg(vendorId, formData.organizationId)
        if (existing) {
          pushToast({ title: "Error", description: "This vendor is already associated with this organization." })
          return
        }

        // Add new association
        addVendorOrganization({
          vendorId,
          organizationId: formData.organizationId,
          status: formData.status,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          notes: formData.notes || undefined,
        })
        
        pushToast({ title: "Success", description: "Organization association added successfully." })
        loadData()
        handleCancel()
      }
    } catch (error: any) {
      console.error("Error saving association:", error)
      pushToast({ 
        title: "Error", 
        description: error.message || "Failed to save association." 
      })
    }
  }

  const handleDelete = (id: string) => {
    const orgWithAssoc = organizations.find((o) => o.association.id === id)
    
    if (confirm(`Are you sure you want to remove the association with ${orgWithAssoc?.organizationName || "this organization"}?`)) {
      try {
        const success = deleteVendorOrganization(id)
        if (success) {
          pushToast({ title: "Success", description: "Association removed successfully." })
          loadData()
        } else {
          pushToast({ title: "Error", description: "Failed to remove association." })
        }
      } catch (error) {
        console.error("Error deleting association:", error)
        pushToast({ title: "Error", description: "Failed to remove association." })
      }
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
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading organizations...</p>
        </div>
      </Card>
    )
  }

  const availableOrgs = getAvailableOrganizations()

  return (
    <Card className="p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Associated Organizations</h3>
            <p className="text-sm text-muted-foreground">Organizations this vendor is working with</p>
          </div>
          {isEditMode && !isAdding && !editingId && (
            <Button onClick={handleAdd} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Organization
            </Button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && isEditMode && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-border rounded-md space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Organization {editingId && "(cannot be changed)"}
              </Label>
              <Select
                value={formData.organizationId}
                onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
                disabled={!!editingId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {editingId ? (
                    <SelectItem value={formData.organizationId}>
                      {getOrganizationById(formData.organizationId)?.name || formData.organizationId}
                    </SelectItem>
                  ) : (
                    availableOrgs.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as "Active" | "Inactive" | "Pending" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Start Date</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">End Date</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this association..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? "Update" : "Add"} Association
            </Button>
          </div>
        </form>
      )}

      {/* Associations List */}
      {organizations.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <p>No organizations associated with this vendor.</p>
          {isEditMode && !isAdding && (
            <Button onClick={handleAdd} variant="outline" size="sm" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Add Organization
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {organizations.map((org) => (
            <div
              key={org.association.id}
              className="flex items-start gap-3 p-3 border border-border rounded-md hover:bg-muted/50 transition-colors"
            >
              <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/admin/organizations/${org.organizationId}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {org.organizationName}
                  </Link>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      org.association.status === "Active"
                        ? "bg-primary/10 text-primary"
                        : org.association.status === "Pending"
                        ? "bg-yellow-500/10 text-yellow-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {org.association.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {org.association.startDate && (
                    <div>Start Date: {formatDate(org.association.startDate)}</div>
                  )}
                  {org.association.endDate && (
                    <div>End Date: {formatDate(org.association.endDate)}</div>
                  )}
                  {org.association.notes && (
                    <div className="mt-1">{org.association.notes}</div>
                  )}
                </div>
              </div>
              {isEditMode && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(org.association)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(org.association.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

