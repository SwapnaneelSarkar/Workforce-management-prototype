"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, FileText } from "lucide-react"
import {
  getAllOccupations,
  addOccupation,
  updateOccupation,
  deleteOccupation,
  type Occupation,
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
    isActive: true,
  })

  useEffect(() => {
    loadOccupations()
  }, [])

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
        isActive: formData.isActive,
      })
      if (updated) {
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
        isActive: formData.isActive,
      })
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
      isActive: occ.isActive,
    })
    setEditingId(occ.id)
    setIsCreating(true)
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
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Code</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {occupations.map((occ) => (
                          <tr key={occ.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4">
                              <div>
                                <span className="text-sm font-medium text-foreground">{occ.name}</span>
                                {occ.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{occ.description}</p>
                                )}
                              </div>
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
                                  title="Manage Requisition Template"
                                >
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                </Link>
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


