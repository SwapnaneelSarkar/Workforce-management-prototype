"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDemoData } from "@/components/providers/demo-data-provider"
import type { RequisitionTemplate } from "@/components/providers/demo-data-provider"
import { AdminAddItemModal } from "@/components/compliance/admin-add-item-modal"
import type { ComplianceItem } from "@/lib/compliance-templates-store"
import { complianceItemsByCategory } from "@/lib/compliance-items"
import { getAllDepartments } from "@/lib/organizations-store"
import { getActiveOccupations } from "@/lib/admin-local-db"
import { Trash2, Edit } from "lucide-react"
import { useToast } from "@/components/system"

// Map internal categories to display names
const categoryDisplayNames: Record<string, string> = {
  Background: "Background & Identification",
  Licenses: "Professional Licenses",
  Certifications: "Certifications",
  Training: "Skills & Additional Training",
  Other: "Other",
}

const getExpirationTypeDisplay = (type: string) => {
  switch (type) {
    case "None":
      return "Non-expiring"
    case "Fixed Date":
      return "Expiration Date"
    case "Recurring":
      return "Completion Date"
    default:
      return type
  }
}

export default function AdminRequisitionTemplateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { organization, actions } = useDemoData()
  const { pushToast } = useToast()
  const templateId = params.id as string

  const template = organization.requisitionTemplates.find((t) => t.id === templateId)
  const [draftTemplate, setDraftTemplate] = useState<RequisitionTemplate | null>(null)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDepartment, setIsEditingDepartment] = useState(false)
  const [isEditingOccupation, setIsEditingOccupation] = useState(false)
  const [departments, setDepartments] = useState<string[]>([])
  const [occupations, setOccupations] = useState<Array<{ label: string; value: string }>>([])

  useEffect(() => {
    const allDepartments = getAllDepartments()
    setDepartments(allDepartments)
    
    if (typeof window !== "undefined") {
      try {
        const occs = getActiveOccupations()
        setOccupations(occs.map((occ) => ({ label: occ.name, value: occ.code })))
      } catch (error) {
        console.warn("Failed to load occupations", error)
      }
    }
  }, [])

  useEffect(() => {
    if (template) {
      setDraftTemplate({ ...template })
    } else if (templateId) {
      router.push("/admin/compliance/templates")
    }
  }, [template, templateId, router])

  if (!draftTemplate) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Loading template...</p>
      </div>
    )
  }

  const handleFieldChange = (field: keyof Omit<RequisitionTemplate, "id" | "items">, value: string) => {
    setDraftTemplate({ ...draftTemplate, [field]: value })
  }

  const handleSaveName = () => {
    if (!draftTemplate.name.trim()) {
      pushToast({ title: "Validation Error", description: "Template name is required." })
      return
    }
    actions.updateRequisitionTemplate(templateId, {
      name: draftTemplate.name,
    })
    setIsEditingName(false)
    pushToast({ title: "Success", description: "Template name updated." })
  }

  const handleSaveDepartment = () => {
    if (!draftTemplate.department) {
      pushToast({ title: "Validation Error", description: "Department is required." })
      return
    }
    actions.updateRequisitionTemplate(templateId, {
      department: draftTemplate.department,
    })
    setIsEditingDepartment(false)
    pushToast({ title: "Success", description: "Department updated." })
  }

  const handleSaveOccupation = () => {
    if (!draftTemplate.occupation) {
      pushToast({ title: "Validation Error", description: "Occupation is required." })
      return
    }
    actions.updateRequisitionTemplate(templateId, {
      occupation: draftTemplate.occupation,
    })
    setIsEditingOccupation(false)
    pushToast({ title: "Success", description: "Occupation updated." })
  }

  const handleAddItem = (item: ComplianceItem) => {
    actions.addRequisitionTemplateItem(templateId, item)
    setDraftTemplate({ ...draftTemplate, items: [...draftTemplate.items, item] })
  }

  const handleRemoveItem = (itemId: string) => {
    actions.removeRequisitionTemplateItem(templateId, itemId)
    setDraftTemplate({ ...draftTemplate, items: draftTemplate.items.filter((item) => item.id !== itemId) })
  }

  const existingItemIds = draftTemplate.items.map((item) => {
    // Find the original item ID from compliance items list
    for (const items of Object.values(complianceItemsByCategory)) {
      const originalItem = items.find((i) => i.name === item.name && i.type === item.type)
      if (originalItem) return originalItem.id
    }
    return item.id
  })

  // Group items by category with proper display names
  const itemsByCategory = draftTemplate.items.reduce((acc, item) => {
    const displayCategory = categoryDisplayNames[item.type] || item.type
    if (!acc[displayCategory]) {
      acc[displayCategory] = []
    }
    acc[displayCategory].push(item)
    return acc
  }, {} as Record<string, ComplianceItem[]>)

  // Sort categories in the specified order
  const categoryOrder = [
    "Background & Identification",
    "Professional Licenses",
    "Certifications",
    "Skills & Additional Training",
    "Other",
  ]

  const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  return (
    <div className="space-y-6 p-8">
      <Header
        title={draftTemplate.name}
        subtitle="Manage template details and compliance items."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Compliance Templates", href: "/admin/compliance/templates" },
          { label: draftTemplate.name },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <Card title="Template Info">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">Template Name</Label>
                {!isEditingName && (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="p-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <Edit className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              {isEditingName ? (
                <div className="space-y-2">
                  <Input
                    value={draftTemplate.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    className="text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="ph5-button-primary text-xs"
                      onClick={handleSaveName}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="ph5-button-secondary text-xs"
                      onClick={() => {
                        setIsEditingName(false)
                        setDraftTemplate({ ...draftTemplate, name: template?.name || "" })
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground">{draftTemplate.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">Occupation</Label>
                {!isEditingOccupation && (
                  <button
                    type="button"
                    onClick={() => setIsEditingOccupation(true)}
                    className="p-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <Edit className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              {isEditingOccupation ? (
                <div className="space-y-2">
                  <select
                    value={draftTemplate.occupation || ""}
                    onChange={(e) => handleFieldChange("occupation", e.target.value)}
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  >
                    <option value="">Select occupation</option>
                    {occupations.map((occ) => (
                      <option key={occ.value} value={occ.value}>
                        {occ.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="ph5-button-primary text-xs"
                      onClick={handleSaveOccupation}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="ph5-button-secondary text-xs"
                      onClick={() => {
                        setIsEditingOccupation(false)
                        setDraftTemplate({ ...draftTemplate, occupation: template?.occupation || "" })
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground">{draftTemplate.occupation || "—"}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">Department</Label>
                {!isEditingDepartment && (
                  <button
                    type="button"
                    onClick={() => setIsEditingDepartment(true)}
                    className="p-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <Edit className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              {isEditingDepartment ? (
                <div className="space-y-2">
                  {departments.length === 0 ? (
                    <Input
                      value={draftTemplate.department || ""}
                      onChange={(e) => handleFieldChange("department", e.target.value)}
                      placeholder="Enter department name"
                      className="text-sm"
                      autoFocus
                    />
                  ) : (
                    <select
                      value={draftTemplate.department || ""}
                      onChange={(e) => handleFieldChange("department", e.target.value)}
                      className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="ph5-button-primary text-xs"
                      onClick={handleSaveDepartment}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="ph5-button-secondary text-xs"
                      onClick={() => {
                        setIsEditingDepartment(false)
                        setDraftTemplate({ ...draftTemplate, department: template?.department || "" })
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground">{draftTemplate.department || "—"}</p>
              )}
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Items</p>
              <p className="text-sm font-semibold text-foreground">{draftTemplate.items.length}</p>
            </div>
          </div>
        </Card>

        <Card title="Compliance Items">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Items</p>
              <button
                type="button"
                className="ph5-button-secondary text-xs"
                onClick={() => setIsAddItemModalOpen(true)}
              >
                + Add Item
              </button>
            </div>

            {sortedCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No items yet. Click &quot;+ Add Item&quot; to add compliance items from the list.
              </p>
            ) : (
              <div className="space-y-6">
                {sortedCategories.map((category) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {itemsByCategory[category].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-md border border-border p-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Expiration Type: {getExpirationTypeDisplay(item.expirationType)}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="p-2 rounded-md hover:bg-destructive/10 transition-colors ml-2"
                            onClick={() => handleRemoveItem(item.id)}
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <AdminAddItemModal
        open={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAdd={handleAddItem}
        existingItemIds={existingItemIds}
      />
    </div>
  )
}
