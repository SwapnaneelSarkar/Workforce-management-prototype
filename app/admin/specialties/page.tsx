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
  getAllSpecialtiesAdmin,
  addSpecialty,
  updateSpecialty,
  deleteSpecialty,
  type Specialty,
} from "@/lib/admin-local-db"

export default function SpecialtiesPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    acronym: "",
    description: "",
    group: "",
    isActive: true,
  })

  useEffect(() => {
    loadSpecialties()
  }, [])

  const loadSpecialties = () => {
    setLoading(true)
    const allSpecs = getAllSpecialtiesAdmin()
    setSpecialties(allSpecs)
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
      acronym: "",
      description: "",
      group: "",
      isActive: true,
    })
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
    const existing = specialties.find((spec) => spec.code === formData.code.trim() && spec.id !== editingId)
    if (existing) {
      pushToast({ title: "Validation Error", description: "A specialty with this code already exists." })
      return
    }

    if (editingId) {
      const updated = updateSpecialty(editingId, {
        name: formData.name.trim(),
        code: formData.code.trim(),
        acronym: formData.acronym.trim() || undefined,
        description: formData.description.trim() || undefined,
        group: formData.group.trim() || undefined,
        isActive: formData.isActive,
      })
      if (updated) {
        pushToast({ title: "Success", description: "Specialty updated successfully." })
        loadSpecialties()
        resetForm()
      } else {
        pushToast({ title: "Error", description: "Failed to update specialty." })
      }
    } else {
      const newSpec = addSpecialty({
        name: formData.name.trim(),
        code: formData.code.trim(),
        acronym: formData.acronym.trim() || undefined,
        description: formData.description.trim() || undefined,
        group: formData.group.trim() || undefined,
        isActive: formData.isActive,
      })
      pushToast({ title: "Success", description: "Specialty added successfully." })
      loadSpecialties()
      resetForm()
    }
  }

  const handleEdit = (spec: Specialty) => {
    setFormData({
      name: spec.name,
      code: spec.code,
      acronym: spec.acronym || "",
      description: spec.description || "",
      group: spec.group || "",
      isActive: spec.isActive,
    })
    setEditingId(spec.id)
    setIsCreating(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = deleteSpecialty(id)
      if (success) {
        pushToast({ title: "Success", description: "Specialty deleted successfully." })
        loadSpecialties()
        if (editingId === id) {
          resetForm()
        }
      } else {
        pushToast({ title: "Error", description: "Failed to delete specialty." })
      }
    }
  }

  return (
    <>
      <Header
        title="Specialties"
        subtitle="Manage specialties available for occupation-specialty combinations."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Specialties" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {isCreating ? (editingId ? "Edit Specialty" : "Create New Specialty") : "Specialties"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isCreating
                    ? editingId
                      ? "Update specialty details below."
                      : "Add a new specialty that can be combined with occupations."
                    : `${specialties.length} ${specialties.length === 1 ? "specialty" : "specialties"}`}
                </p>
              </div>
              {!isCreating && (
                <button type="button" className="ph5-button-primary" onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Specialty
                </button>
              )}
            </div>

            {isCreating ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Specialty Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={handleInputChange("name")}
                      placeholder="e.g., ICU, ER, TELE"
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
                      placeholder="e.g., ICU, ER, TELE"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Short code used in system</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Acronym</label>
                    <Input
                      value={formData.acronym}
                      onChange={handleInputChange("acronym")}
                      placeholder="e.g., ICU, ER"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Group</label>
                    <Input
                      value={formData.group}
                      onChange={handleInputChange("group")}
                      placeholder="e.g., Critical Care, Medical, Surgical, Support Services"
                    />
                    <p className="text-xs text-muted-foreground">Group name for organizing specialties (optional)</p>
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
                    Active (visible in system)
                  </label>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <button type="submit" className="ph5-button-primary">
                    {editingId ? "Update Specialty" : "Create Specialty"}
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
                ) : specialties.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No specialties yet. Create one to get started.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Specialty Name</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Code</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Acronym</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {specialties.map((spec) => (
                          <tr key={spec.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4">
                              <div>
                                <span className="text-sm font-medium text-foreground">{spec.name}</span>
                                {spec.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{spec.description}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-muted-foreground font-mono">{spec.code}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-muted-foreground font-mono">{spec.acronym || "—"}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                  spec.isActive
                                    ? "bg-success/10 text-success"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {spec.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="p-2 rounded-md hover:bg-muted transition-colors"
                                  onClick={() => handleEdit(spec)}
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4 text-muted-foreground" />
                                </button>
                                <button
                                  type="button"
                                  className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                                  onClick={() => handleDelete(spec.id, spec.name)}
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








