"use client"

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import {
  getWorkforceGroupById,
  updateWorkforceGroup,
  type WorkforceGroup,
} from "@/lib/admin-local-db"

export default function EditWorkforceGroupPage() {
  const params = useParams()
  const router = useRouter()
  const { pushToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [group, setGroup] = useState<WorkforceGroup | null>(null)
  const [formData, setFormData] = useState({
    modality: "",
    name: "",
    limitShiftVisibility: false,
    shiftVisibilityHours: "",
    routingPosition: "",
    isActive: true,
  })

  useEffect(() => {
    const groupId = params.id as string
    const existingGroup = getWorkforceGroupById(groupId)
    if (existingGroup) {
      setGroup(existingGroup)
      setFormData({
        modality: existingGroup.modality,
        name: existingGroup.name,
        limitShiftVisibility: existingGroup.limitShiftVisibility,
        shiftVisibilityHours: existingGroup.shiftVisibilityHours?.toString() || "",
        routingPosition: existingGroup.routingPosition.toString(),
        isActive: existingGroup.isActive,
      })
    }
    setLoading(false)
  }, [params.id])

  const handleInputChange = (field: keyof typeof formData) => (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const value = field === "limitShiftVisibility" || field === "isActive"
      ? (e.target as HTMLInputElement).checked
      : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!group) return

    if (!formData.modality || !formData.name || !formData.routingPosition) {
      pushToast({ title: "Validation Error", description: "Please fill in all required fields (Modality, Name, Routing Position)." })
      return
    }

    const routingPosition = parseInt(formData.routingPosition, 10)
    if (isNaN(routingPosition) || routingPosition < 1) {
      pushToast({ title: "Validation Error", description: "Routing Position must be a positive number." })
      return
    }

    setIsSubmitting(true)

    try {
      const updated = updateWorkforceGroup(group.id, {
        modality: formData.modality,
        name: formData.name.trim(),
        limitShiftVisibility: formData.limitShiftVisibility,
        shiftVisibilityHours: formData.limitShiftVisibility && formData.shiftVisibilityHours
          ? parseInt(formData.shiftVisibilityHours, 10)
          : undefined,
        routingPosition: routingPosition,
        isActive: formData.isActive,
      })

      if (updated) {
        pushToast({ title: "Success", description: `Workforce group "${updated.name}" has been updated successfully.` })
        router.push("/admin/workforce-groups")
      } else {
        pushToast({ title: "Error", description: "Failed to update workforce group. Please try again." })
      }
    } catch (error) {
      pushToast({ title: "Error", description: "Failed to update workforce group. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header
          title="Loading..."
          subtitle=""
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Workforce Groups", href: "/admin/workforce-groups" },
            { label: "Edit" },
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
          title="Workforce Group Not Found"
          subtitle=""
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Workforce Groups", href: "/admin/workforce-groups" },
            { label: "Not Found" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Workforce group not found.</p>
            <Link href="/admin/workforce-groups" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Back to Workforce Groups
            </Link>
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      <Header
        title="Edit Workforce Group"
        subtitle="Groups or Workers and routing rules."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Workforce Groups", href: "/admin/workforce-groups" },
          { label: group.name },
        ]}
      />

      <section className="space-y-6">
        <div className="flex gap-3">
          <Link href="/admin/workforce-groups" className="ph5-button-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workforce Groups
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Workforce Group</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Manage Routing for this organization.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">Status:</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleInputChange("isActive")}
                      className="rounded border-border"
                    />
                    <span className={`text-sm font-semibold ${formData.isActive ? "text-success" : "text-muted-foreground"}`}>
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Modality <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.modality}
                    onChange={handleInputChange("modality")}
                    required
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select modality</option>
                    <option value="Clinical">Clinical</option>
                    <option value="Support Services">Support Services</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Workforce Group Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    className="w-full"
                    placeholder="e.g., Permanent - Full Time"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.limitShiftVisibility}
                      onChange={handleInputChange("limitShiftVisibility")}
                      className="rounded border-border"
                    />
                    <span className="text-sm font-medium text-foreground">Limit Shift Visibility</span>
                  </label>
                </div>

                {formData.limitShiftVisibility && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Shift Visibility (hours to shift start)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.shiftVisibilityHours}
                      onChange={handleInputChange("shiftVisibilityHours")}
                      className="w-full"
                      placeholder="Enter hours"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Routing Position <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={formData.routingPosition}
                    onChange={handleInputChange("routingPosition")}
                    className="w-full"
                    placeholder="e.g., 1"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Order for shift distribution routing</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ph5-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Updating..." : "Update Workforce Group"}
                </button>
                <Link href="/admin/workforce-groups" className="ph5-button-secondary">
                  Cancel
                </Link>
              </div>
            </div>
          </Card>
        </form>
      </section>
    </>
  )
}
