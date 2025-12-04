"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Edit, Plus } from "lucide-react"
import { useToast } from "@/components/system"
import {
  getAdminWalletTemplateById,
  updateAdminWalletTemplate,
  addAdminWalletTemplateListItem,
  removeAdminWalletTemplateListItem,
  getAllComplianceListItems,
  getComplianceListItemById,
  getOccupationByCode,
  getSpecialtyById,
  getActiveOccupations,
  getAllSpecialties,
  getOccupationSpecialtiesByOccupation,
  type AdminWalletTemplate,
  type ComplianceListItem,
} from "@/lib/admin-local-db"

export default function AdminWalletTemplateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { pushToast } = useToast()
  const templateId = params.id as string

  const [template, setTemplate] = useState<AdminWalletTemplate | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingOccupation, setIsEditingOccupation] = useState(false)
  const [isEditingSpecialty, setIsEditingSpecialty] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [allListItems, setAllListItems] = useState<ComplianceListItem[]>([])
  const [availableListItems, setAvailableListItems] = useState<ComplianceListItem[]>([])
  const [occupations, setOccupations] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [specialties, setSpecialties] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [availableSpecialties, setAvailableSpecialties] = useState<Array<{ id: string; name: string; code: string }>>([])

  useEffect(() => {
    loadTemplate()
    loadListItems()
    loadOccupations()
  }, [templateId])

  useEffect(() => {
    if (template) {
      // Filter out items already in template
      const existingIds = new Set(template.listItemIds)
      const available = allListItems.filter((item) => !existingIds.has(item.id) && item.isActive)
      setAvailableListItems(available)

      // Load specialties for the occupation
      if (template.occupationId) {
        const occSpecialties = getOccupationSpecialtiesByOccupation(template.occupationId)
        const specialtyIds = occSpecialties.map((os) => os.specialtyId)
        const filtered = specialties.filter((s) => specialtyIds.includes(s.id))
        setAvailableSpecialties(filtered)
      } else {
        setAvailableSpecialties([])
      }
    }
  }, [template, allListItems, specialties])

  const loadTemplate = () => {
    const loaded = getAdminWalletTemplateById(templateId)
    if (!loaded) {
      pushToast({ title: "Error", description: "Template not found." })
      router.push("/admin/compliance/templates")
      return
    }
    setTemplate(loaded)
  }

  const loadListItems = () => {
    const items = getAllComplianceListItems()
    setAllListItems(items)
  }

  const loadOccupations = () => {
    if (typeof window !== "undefined") {
      try {
        const occs = getActiveOccupations()
        setOccupations(occs.map((occ) => ({ id: occ.id, name: occ.name, code: occ.code })))
        const specs = getAllSpecialties()
        setSpecialties(specs.map((spec) => ({ id: spec.id, name: spec.name, code: spec.code })))
      } catch (error) {
        console.warn("Failed to load occupations/specialties", error)
      }
    }
  }

  if (!template) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Loading template...</p>
      </div>
    )
  }

  const handleSaveName = () => {
    if (!template.name.trim()) {
      pushToast({ title: "Validation Error", description: "Template name is required." })
      return
    }
    const updated = updateAdminWalletTemplate(templateId, { name: template.name })
    if (updated) {
      setTemplate(updated)
      setIsEditingName(false)
      pushToast({ title: "Success", description: "Template name updated." })
    }
  }

  const handleSaveOccupation = () => {
    if (!template.occupationId) {
      pushToast({ title: "Validation Error", description: "Occupation is required." })
      return
    }
    const occupation = occupations.find((occ) => occ.id === template.occupationId)
    const updated = updateAdminWalletTemplate(templateId, {
      occupationId: template.occupationId,
      occupationCode: occupation?.code,
      specialtyId: undefined, // Reset specialty when occupation changes
      specialtyCode: undefined,
    })
    if (updated) {
      setTemplate(updated)
      setIsEditingOccupation(false)
      pushToast({ title: "Success", description: "Occupation updated." })
    }
  }

  const handleSaveSpecialty = () => {
    const specialty = specialties.find((spec) => spec.id === template.specialtyId)
    const updated = updateAdminWalletTemplate(templateId, {
      specialtyId: template.specialtyId || undefined,
      specialtyCode: specialty?.code,
    })
    if (updated) {
      setTemplate(updated)
      setIsEditingSpecialty(false)
      pushToast({ title: "Success", description: "Specialty updated." })
    }
  }

  const handleAddItem = (listItemId: string) => {
    const success = addAdminWalletTemplateListItem(templateId, listItemId)
    if (success) {
      loadTemplate()
      pushToast({ title: "Success", description: "Item added to template." })
      setIsAddItemModalOpen(false)
    } else {
      pushToast({ title: "Error", description: "Failed to add item." })
    }
  }

  const handleRemoveItem = (listItemId: string) => {
    const success = removeAdminWalletTemplateListItem(templateId, listItemId)
    if (success) {
      loadTemplate()
      pushToast({ title: "Success", description: "Item removed from template." })
    } else {
      pushToast({ title: "Error", description: "Failed to remove item." })
    }
  }

  const templateListItems = template.listItemIds
    .map((id) => getComplianceListItemById(id))
    .filter((item): item is ComplianceListItem => item !== null)
    .filter((item) => item.isActive)

  // Group items by category
  const itemsByCategory = templateListItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ComplianceListItem[]>)

  const categoryOrder = [
    "Background & Identification",
    "License",
    "Certification",
    "Training",
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

  const occupation = template.occupationCode
    ? getOccupationByCode(template.occupationCode)
    : null
  const specialty = template.specialtyId ? getSpecialtyById(template.specialtyId) : null

  return (
    <div className="space-y-6 p-8">
      <Header
        title={template.name}
        subtitle="Manage template details and compliance items."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Compliance Wallet", href: "/admin/compliance/templates" },
          { label: template.name },
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
                    value={template.name}
                    onChange={(e) => setTemplate({ ...template, name: e.target.value })}
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
                        loadTemplate()
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground">{template.name}</p>
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
                    value={template.occupationId || ""}
                    onChange={(e) =>
                      setTemplate({ ...template, occupationId: e.target.value || undefined })
                    }
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  >
                    <option value="">Select occupation</option>
                    {occupations.map((occ) => (
                      <option key={occ.id} value={occ.id}>
                        {occ.name} ({occ.code})
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
                        loadTemplate()
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground">{occupation?.name || template.occupationCode || "—"}</p>
              )}
            </div>

            {template.occupationId && availableSpecialties.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">Specialty</Label>
                  {!isEditingSpecialty && (
                    <button
                      type="button"
                      onClick={() => setIsEditingSpecialty(true)}
                      className="p-1 rounded-md hover:bg-muted transition-colors"
                    >
                      <Edit className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {isEditingSpecialty ? (
                  <div className="space-y-2">
                    <select
                      value={template.specialtyId || ""}
                      onChange={(e) =>
                        setTemplate({ ...template, specialtyId: e.target.value || undefined })
                      }
                      className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    >
                      <option value="">No specialty</option>
                      {availableSpecialties.map((spec) => (
                        <option key={spec.id} value={spec.id}>
                          {spec.name} ({spec.code})
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="ph5-button-primary text-xs"
                        onClick={handleSaveSpecialty}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="ph5-button-secondary text-xs"
                        onClick={() => {
                          setIsEditingSpecialty(false)
                          loadTemplate()
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground">{specialty?.name || template.specialtyCode || "—"}</p>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Items</p>
              <p className="text-sm font-semibold text-foreground">{templateListItems.length}</p>
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
            <p className="text-xs text-destructive">
              When you click add item, the items should be populating from the list items table.
            </p>

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
                              <span>Expiration Type: {item.expirationType}</span>
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

      {/* Add Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg border border-border shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Add Compliance Item</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select an item from the list items table to add to this template.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {availableListItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No available items. All items are already in this template.
                </p>
              ) : (
                <div className="space-y-4">
                  {categoryOrder.map((category) => {
                    const items = availableListItems.filter((item) => item.category === category)
                    if (items.length === 0) return null
                    return (
                      <div key={category} className="space-y-2">
                        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">
                          {category}
                        </h3>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleAddItem(item.id)}
                              className="w-full text-left rounded-md border border-border p-3 hover:bg-muted transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Expiration: {item.expirationType}
                                  </p>
                                </div>
                                <Plus className="h-4 w-4 text-primary" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-border flex justify-end">
              <button
                type="button"
                className="ph5-button-secondary"
                onClick={() => setIsAddItemModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
