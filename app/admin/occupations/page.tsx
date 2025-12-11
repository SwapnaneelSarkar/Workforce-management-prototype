"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2 } from "lucide-react"
import {
  getAllOccupations,
  addOccupation,
  updateOccupation,
  deleteOccupation,
  getAllSpecialtiesAdmin,
  addSpecialty,
  getOccupationSpecialtiesByOccupation,
  addOccupationSpecialty,
  removeOccupationSpecialty,
  deleteOccupationSpecialtyById,
  type Occupation,
  type Specialty,
} from "@/lib/admin-local-db"

export default function OccupationsPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [occupations, setOccupations] = useState<Occupation[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    industry: "",
    modality: "",
    acronym: "",
    isActive: true,
  })
  const [hasSpecialties, setHasSpecialties] = useState(false)
  const [occupationSpecialties, setOccupationSpecialties] = useState<Array<{
    id: string
    specialtyId: string
    specialty: Specialty
  }>>([])
  const [availableSpecialties, setAvailableSpecialties] = useState<Specialty[]>([])
  const [isAddingSpecialty, setIsAddingSpecialty] = useState(false)
  const [newSpecialtyData, setNewSpecialtyData] = useState({
    name: "",
    code: "",
    acronym: "",
    isActive: true,
  })

  useEffect(() => {
    loadOccupations()
    loadAvailableSpecialties()
  }, [])

  const loadAvailableSpecialties = () => {
    try {
      const specialties = getAllSpecialtiesAdmin()
      setAvailableSpecialties(specialties)
    } catch (error) {
      console.warn("Failed to load specialties", error)
    }
  }

  const loadOccupations = () => {
    setLoading(true)
    const allOccs = getAllOccupations()
    setOccupations(allOccs)
    setLoading(false)
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value = field === "isActive" ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      industry: "",
      modality: "",
      acronym: "",
      isActive: true,
    })
    setHasSpecialties(false)
    setOccupationSpecialties([])
    setIsAddingSpecialty(false)
    setNewSpecialtyData({ name: "", code: "", acronym: "", isActive: true })
    setEditingId(null)
    setIsCreating(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.code.trim()) {
      pushToast({ title: "Validation Error", description: "Name and code are required." })
      return
    }

    // Check for duplicate code
    const existing = occupations.find((occ) => occ.code === formData.code.trim() && occ.id !== editingId)
    if (existing) {
      pushToast({ title: "Validation Error", description: "An occupation with this code already exists." })
      return
    }

    if (editingId) {
      const updated = updateOccupation(editingId, {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim() || undefined,
        industry: formData.industry || undefined,
        modality: formData.modality || undefined,
        acronym: formData.acronym || undefined,
        isActive: formData.isActive,
      })
      if (updated) {
        // Save occupation-specialty relationships
        if (hasSpecialties) {
          // Get current relationships
          const currentOccSpecs = getOccupationSpecialtiesByOccupation(editingId)
          const currentSpecialtyIds = new Set(currentOccSpecs.map(os => os.specialtyId))
          const newSpecialtyIds = new Set(occupationSpecialties.map(os => os.specialtyId))
          
          // Remove relationships that are no longer selected
          currentOccSpecs.forEach((occSpec) => {
            if (!newSpecialtyIds.has(occSpec.specialtyId)) {
              deleteOccupationSpecialtyById(occSpec.id)
            }
          })
          
          // Add new relationships
          occupationSpecialties.forEach((occSpec) => {
            if (!currentSpecialtyIds.has(occSpec.specialtyId)) {
              addOccupationSpecialty(editingId, occSpec.specialtyId)
            }
          })
        } else {
          // Remove all relationships if hasSpecialties is false
          const currentOccSpecs = getOccupationSpecialtiesByOccupation(editingId)
          currentOccSpecs.forEach((occSpec) => {
            deleteOccupationSpecialtyById(occSpec.id)
          })
        }
        
        pushToast({ title: "Success", description: "Occupation updated successfully." })
        loadOccupations()
        resetForm()
      } else {
        pushToast({ title: "Error", description: "Failed to update occupation." })
      }
    } else {
      const newOcc = addOccupation({
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim() || undefined,
        industry: formData.industry || undefined,
        modality: formData.modality || undefined,
        acronym: formData.acronym || undefined,
        isActive: formData.isActive,
      })
      
      // Save occupation-specialty relationships if hasSpecialties is true
      if (hasSpecialties && occupationSpecialties.length > 0) {
        occupationSpecialties.forEach((occSpec) => {
          addOccupationSpecialty(newOcc.id, occSpec.specialtyId)
        })
      }
      
      pushToast({ title: "Success", description: "Occupation added successfully." })
      loadOccupations()
      resetForm()
    }
  }

  const handleEdit = (occ: Occupation) => {
    setFormData({
      name: occ.name,
      code: occ.code,
      description: occ.description || "",
      industry: occ.industry || "",
      modality: occ.modality || "",
      acronym: occ.acronym || "",
      isActive: occ.isActive,
    })
    setEditingId(occ.id)
    setIsCreating(true)
    
    // Load existing specialties for this occupation
    try {
      const occSpecialties = getOccupationSpecialtiesByOccupation(occ.id)
      if (occSpecialties.length > 0) {
        setHasSpecialties(true)
        // Load full specialty details
        const { getSpecialtyById } = require("@/lib/admin-local-db")
        const specialtiesWithDetails = occSpecialties.map((occSpec) => {
          const specialty = getSpecialtyById(occSpec.specialtyId)
          return {
            id: occSpec.id,
            specialtyId: occSpec.specialtyId,
            specialty: specialty!,
          }
        }).filter((item): item is NonNullable<typeof item> => item.specialty !== null)
        setOccupationSpecialties(specialtiesWithDetails)
      } else {
        setHasSpecialties(false)
        setOccupationSpecialties([])
      }
    } catch (error) {
      console.warn("Failed to load occupation specialties", error)
      setHasSpecialties(false)
      setOccupationSpecialties([])
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This will also remove any associated requisition templates.`)) {
      const success = deleteOccupation(id)
      if (success) {
        pushToast({ title: "Success", description: "Occupation deleted successfully." })
        loadOccupations()
        if (editingId === id) {
          resetForm()
        }
      } else {
        pushToast({ title: "Error", description: "Failed to delete occupation." })
      }
    }
  }

  return (
    <>
      <Header
        title="Occupations"
        subtitle="Manage occupations available for candidate sign-up and create occupation-based requisition templates."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Occupations" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {isCreating ? (editingId ? "Edit Occupation" : "Create New Occupation") : "Occupations"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isCreating
                    ? editingId
                      ? "Update occupation details below."
                      : "Add a new occupation that candidates can select during sign-up."
                    : `${occupations.length} ${occupations.length === 1 ? "occupation" : "occupations"}`}
                </p>
              </div>
              {!isCreating && (
                <button type="button" className="ph5-button-primary" onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Occupation
                </button>
              )}
            </div>

            {isCreating ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={handleInputChange("name")}
                      placeholder="e.g., Registered Nurse"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Code <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={formData.code}
                      onChange={handleInputChange("code")}
                      placeholder="e.g., RN"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Short code used in templates and system</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Industry</label>
                    <select
                      value={formData.industry}
                      onChange={handleInputChange("industry")}
                      className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                    >
                      <option value="">Select industry</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Retail">Retail</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Modality</label>
                    <Input
                      value={formData.modality}
                      onChange={handleInputChange("modality")}
                      placeholder="e.g., Travel, Permanent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Acronym</label>
                    <Input
                      value={formData.acronym}
                      onChange={handleInputChange("acronym")}
                      placeholder="e.g., RN, LPN"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={handleInputChange("description")}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange("isActive")}
                    className="rounded border-border"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-foreground">
                    Active (visible in candidate sign-up)
                  </label>
                </div>
                
                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasSpecialties"
                      checked={hasSpecialties}
                      onChange={(e) => {
                        setHasSpecialties(e.target.checked)
                        if (!e.target.checked) {
                          setOccupationSpecialties([])
                        }
                      }}
                      className="rounded border-border"
                    />
                    <label htmlFor="hasSpecialties" className="text-sm font-semibold text-foreground">
                      Does this occupation have any specialty?
                    </label>
                  </div>
                  
                  {hasSpecialties && (
                    <div className="ml-6 space-y-4 border-l-2 border-border pl-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">Specialties for this occupation</p>
                        
                        {occupationSpecialties.length > 0 && (
                          <div className="space-y-2">
                            {occupationSpecialties.map((occSpec) => (
                              <div
                                key={occSpec.id}
                                className="flex items-center justify-between rounded-md border border-border p-3 bg-muted/30"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">{occSpec.specialty.name}</span>
                                    {occSpec.specialty.code && (
                                      <span className="text-xs text-muted-foreground font-mono">({occSpec.specialty.code})</span>
                                    )}
                                    {occSpec.specialty.acronym && (
                                      <span className="text-xs text-muted-foreground">- {occSpec.specialty.acronym}</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="p-1 rounded-md hover:bg-destructive/10 transition-colors"
                                  onClick={() => {
                                    setOccupationSpecialties(occupationSpecialties.filter((os) => os.id !== occSpec.id))
                                  }}
                                  title="Remove specialty"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {isAddingSpecialty ? (
                          <div className="space-y-3 border border-border rounded-lg p-4 bg-background">
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground">Specialty Name</label>
                                <Input
                                  value={newSpecialtyData.name}
                                  onChange={(e) => setNewSpecialtyData({ ...newSpecialtyData, name: e.target.value })}
                                  placeholder="e.g., Intensive Care Unit"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground">Code</label>
                                <Input
                                  value={newSpecialtyData.code}
                                  onChange={(e) => setNewSpecialtyData({ ...newSpecialtyData, code: e.target.value })}
                                  placeholder="e.g., ICU"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground">Acronym (optional)</label>
                                <Input
                                  value={newSpecialtyData.acronym}
                                  onChange={(e) => setNewSpecialtyData({ ...newSpecialtyData, acronym: e.target.value })}
                                  placeholder="e.g., ICU"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                className="ph5-button-primary text-xs"
                                onClick={() => {
                                  if (!newSpecialtyData.name.trim() || !newSpecialtyData.code.trim()) {
                                    pushToast({ title: "Validation Error", description: "Specialty name and code are required." })
                                    return
                                  }
                                  
                                  // Create new specialty
                                  const newSpecialty = addSpecialty({
                                    name: newSpecialtyData.name.trim(),
                                    code: newSpecialtyData.code.trim(),
                                    acronym: newSpecialtyData.acronym.trim() || undefined,
                                    isActive: newSpecialtyData.isActive,
                                  })
                                  
                                  // Add to occupation specialties list
                                  setOccupationSpecialties([
                                    ...occupationSpecialties,
                                    {
                                      id: `temp-${Date.now()}`,
                                      specialtyId: newSpecialty.id,
                                      specialty: newSpecialty,
                                    },
                                  ])
                                  
                                  setNewSpecialtyData({ name: "", code: "", acronym: "", isActive: true })
                                  setIsAddingSpecialty(false)
                                  loadAvailableSpecialties()
                                  pushToast({ title: "Success", description: "Specialty added and linked to occupation." })
                                }}
                              >
                                Add Specialty
                              </button>
                              <button
                                type="button"
                                className="ph5-button-secondary text-xs"
                                onClick={() => {
                                  setIsAddingSpecialty(false)
                                  setNewSpecialtyData({ name: "", code: "", acronym: "", isActive: true })
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <select
                              value=""
                              onChange={(e) => {
                                const specialtyId = e.target.value
                                if (!specialtyId) return
                                
                                const specialty = availableSpecialties.find((s) => s.id === specialtyId)
                                if (!specialty) return
                                
                                // Check if already added
                                if (occupationSpecialties.some((os) => os.specialtyId === specialtyId)) {
                                  pushToast({ title: "Info", description: "This specialty is already added." })
                                  return
                                }
                                
                                setOccupationSpecialties([
                                  ...occupationSpecialties,
                                  {
                                    id: `temp-${Date.now()}`,
                                    specialtyId: specialty.id,
                                    specialty,
                                  },
                                ])
                                e.target.value = ""
                              }}
                              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                            >
                              <option value="">Select existing specialty or create new...</option>
                              {availableSpecialties.map((spec) => (
                                <option key={spec.id} value={spec.id}>
                                  {spec.name} {spec.code && `(${spec.code})`}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="ph5-button-secondary text-xs w-full"
                              onClick={() => setIsAddingSpecialty(true)}
                            >
                              <Plus className="h-4 w-4 mr-2 inline" />
                              Create New Specialty
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t">
                  <button type="submit" className="ph5-button-primary">
                    {editingId ? "Update Occupation" : "Create Occupation"}
                  </button>
                  <button type="button" className="ph5-button-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {loading ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : occupations.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No occupations yet. Create one to get started.</p>
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
                                <button
                                  type="button"
                                  className="p-2 rounded-md hover:bg-muted transition-colors"
                                  onClick={() => handleEdit(occ)}
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4 text-muted-foreground" />
                                </button>
                                <button
                                  type="button"
                                  className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                                  onClick={() => handleDelete(occ.id, occ.name)}
                                  title="Delete"
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
              </>
            )}
          </div>
        </Card>
      </section>
    </>
  )
}


