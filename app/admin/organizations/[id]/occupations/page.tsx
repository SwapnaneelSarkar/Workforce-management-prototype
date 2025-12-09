"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, FileText, Search, ChevronRight, ChevronLeft } from "lucide-react"
import {
  getAllOccupations,
  getOrganizationById,
  getOrganizationOccupations,
  updateOrganizationOccupations,
  type Occupation,
} from "@/lib/admin-local-db"

export default function OrganizationOccupationsPage() {
  const params = useParams()
  const router = useRouter()
  const { pushToast } = useToast()
  const organizationId = params.id as string

  const [occupations, setOccupations] = useState<Occupation[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  useEffect(() => {
    loadOccupations()
  }, [organizationId])

  const loadOccupations = () => {
    setLoading(true)
    const orgOccs = getOrganizationOccupations(organizationId)
    setOccupations(orgOccs)
    setLoading(false)
  }

  const handleRemoveFromOrg = (occupationId: string, occupationName: string) => {
    if (confirm(`Are you sure you want to remove "${occupationName}" from this organization? This will not delete the occupation from the system.`)) {
      const org = getOrganizationById(organizationId)
      if (!org) {
        pushToast({ title: "Error", description: "Organization not found." })
        return
      }

      const updatedOccupationIds = (org.occupationIds || []).filter((id) => id !== occupationId)
      const success = updateOrganizationOccupations(organizationId, updatedOccupationIds)
      
      if (success) {
        pushToast({ title: "Success", description: "Occupation removed from organization." })
        loadOccupations()
      } else {
        pushToast({ title: "Error", description: "Failed to remove occupation from organization." })
      }
    }
  }

  const getOrganizationName = () => {
    const org = getOrganizationById(organizationId)
    return org?.name || "Organization"
  }

  if (loading) {
    return (
      <>
        <Header
          title="Occupations"
          subtitle="Manage occupations for this organization"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Organizations", href: "/admin/organizations" },
            { label: getOrganizationName(), href: `/admin/organizations/${organizationId}` },
            { label: "Occupations" },
          ]}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="Occupations"
        subtitle="Manage occupations available for candidate sign-up and create occupation-based requisition templates."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: getOrganizationName(), href: `/admin/organizations/${organizationId}` },
          { label: "Occupations" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Occupations</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {occupations.length} {occupations.length === 1 ? "occupation" : "occupations"}
                </p>
              </div>
              <button
                type="button"
                className="ph5-button-primary"
                onClick={() => setShowUpdateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Update Occupations
              </button>
            </div>

            {occupations.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No occupations assigned to this organization yet.</p>
                <button
                  type="button"
                  className="mt-4 ph5-button-primary"
                  onClick={() => setShowUpdateModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Occupations
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Modality</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Acronym</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Code</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {occupations.map((occ) => (
                      <tr key={occ.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">{occ.modality || "—"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="text-sm font-medium text-foreground">{occ.name}</span>
                            {occ.acronym && (
                              <p className="text-xs text-muted-foreground mt-1">{occ.acronym}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground font-mono">{occ.acronym || "—"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground font-mono">{occ.code}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              occ.isActive
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {occ.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/occupations/${occ.id}/questionnaire`}
                              className="p-2 rounded-md hover:bg-muted transition-colors"
                              title="Manage Questionnaire"
                            >
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            <button
                              type="button"
                              className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                              onClick={() => handleRemoveFromOrg(occ.id, occ.name)}
                              title="Remove from Organization"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Update Occupations Modal - Reuse the multi-add component */}
      {showUpdateModal && (
        <UpdateOccupationsModal
          organizationId={organizationId}
          onClose={() => setShowUpdateModal(false)}
          onSave={() => {
            setShowUpdateModal(false)
            loadOccupations()
          }}
        />
      )}
    </>
  )
}

// Multi-add modal component for updating occupations
function UpdateOccupationsModal({
  organizationId,
  onClose,
  onSave,
}: {
  organizationId: string
  onClose: () => void
  onSave: () => void
}) {
  const { pushToast } = useToast()
  const [allOccupations, setAllOccupations] = useState<Occupation[]>([])
  const [selectedOccupationIds, setSelectedOccupationIds] = useState<string[]>([])
  const [availableSearch, setAvailableSearch] = useState("")
  const [selectedSearch, setSelectedSearch] = useState("")
  const [checkedAvailable, setCheckedAvailable] = useState<Set<string>>(new Set())
  const [checkedSelected, setCheckedSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    const allOccs = getAllOccupations().filter((occ) => occ.isActive)
    setAllOccupations(allOccs)

    const org = getOrganizationById(organizationId)
    const orgOccIds = org?.occupationIds || []
    setSelectedOccupationIds(orgOccIds)
  }, [organizationId])

  const availableOccupations = allOccupations.filter(
    (occ) =>
      !selectedOccupationIds.includes(occ.id) &&
      (occ.name.toLowerCase().includes(availableSearch.toLowerCase()) ||
        occ.acronym?.toLowerCase().includes(availableSearch.toLowerCase()) ||
        occ.code.toLowerCase().includes(availableSearch.toLowerCase()))
  )

  const selectedOccupations = allOccupations
    .filter((occ) => selectedOccupationIds.includes(occ.id))
    .filter(
      (occ) =>
        occ.name.toLowerCase().includes(selectedSearch.toLowerCase()) ||
        occ.acronym?.toLowerCase().includes(selectedSearch.toLowerCase()) ||
        occ.code.toLowerCase().includes(selectedSearch.toLowerCase())
    )

  const toggleAvailableCheck = (id: string) => {
    const newChecked = new Set(checkedAvailable)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedAvailable(newChecked)
  }

  const toggleSelectedCheck = (id: string) => {
    const newChecked = new Set(checkedSelected)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedSelected(newChecked)
  }

  const addSelected = () => {
    const toAdd = Array.from(checkedAvailable)
    setSelectedOccupationIds((prev) => [...prev, ...toAdd])
    setCheckedAvailable(new Set())
  }

  const removeSelected = () => {
    const toRemove = Array.from(checkedSelected)
    setSelectedOccupationIds((prev) => prev.filter((id) => !toRemove.includes(id)))
    setCheckedSelected(new Set())
  }

  const handleSave = () => {
    const success = updateOrganizationOccupations(organizationId, selectedOccupationIds)
    if (success) {
      pushToast({ title: "Success", description: "Organization occupations updated successfully." })
      onSave()
    } else {
      pushToast({ title: "Error", description: "Failed to update organization occupations." })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Update Occupations</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6">
            {/* Available Occupations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {availableOccupations.length} Items Available
                </h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search here"
                  value={availableSearch}
                  onChange={(e) => setAvailableSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="border border-border rounded-lg">
                <div className="border-b border-border bg-muted/30 px-4 py-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Occupation Name</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {availableOccupations.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No occupations available
                    </div>
                  ) : (
                    availableOccupations.map((occ) => (
                      <label
                        key={occ.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checkedAvailable.has(occ.id)}
                          onChange={() => toggleAvailableCheck(occ.id)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-foreground flex-1">{occ.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Transfer Buttons */}
            <div className="flex flex-col items-center justify-center gap-4">
              <button
                type="button"
                onClick={addSelected}
                disabled={checkedAvailable.size === 0}
                className="p-2 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Add selected"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
              <button
                type="button"
                onClick={removeSelected}
                disabled={checkedSelected.size === 0}
                className="p-2 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Remove selected"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
            </div>

            {/* Selected Occupations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {selectedOccupationIds.length} Items Selected
                </h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search here"
                  value={selectedSearch}
                  onChange={(e) => setSelectedSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="border border-border rounded-lg">
                <div className="border-b border-border bg-muted/30 px-4 py-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Occupation Name</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {selectedOccupations.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No occupations selected
                    </div>
                  ) : (
                    selectedOccupations.map((occ) => (
                      <label
                        key={occ.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checkedSelected.has(occ.id)}
                          onChange={() => toggleSelectedCheck(occ.id)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-foreground flex-1">{occ.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
