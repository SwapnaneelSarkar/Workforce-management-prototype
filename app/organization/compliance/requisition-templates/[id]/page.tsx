"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDemoData } from "@/components/providers/demo-data-provider"
import type { RequisitionTemplate } from "@/components/providers/demo-data-provider"
import { AddItemModal } from "@/components/compliance/add-item-modal"
import type { ComplianceItem } from "@/lib/compliance-templates-store"
import {
  getAllComplianceListItems,
  getComplianceListItemById,
  type ComplianceListItem,
} from "@/lib/admin-local-db"

export default function RequisitionTemplateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const { organization, actions } = useDemoData()
  const templateId = params.id as string

  const template = organization.requisitionTemplates.find((t) => t.id === templateId)
  const [draftTemplate, setDraftTemplate] = useState<RequisitionTemplate | null>(null)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)

  const activeTab = pathname?.includes("wallet-templates")
    ? "wallet"
    : pathname?.includes("requisition-templates")
    ? "requisition"
    : "legacy"

  useEffect(() => {
    if (template) {
      setDraftTemplate({ ...template })
    } else if (templateId) {
      // Only redirect if we have a templateId but no template found
      router.push("/organization/compliance/requisition-templates")
    }
  }, [template, templateId, router])

  // Load compliance list items from IDs
  const templateListItems = useMemo(() => {
    if (!draftTemplate) return []
    return draftTemplate.listItemIds
      .map((id) => {
        try {
          return getComplianceListItemById(id)
        } catch (error) {
          console.warn(`Failed to load compliance list item ${id}`, error)
          return null
        }
      })
      .filter((item): item is ComplianceListItem => item !== null && item.isActive)
  }, [draftTemplate])

  if (!draftTemplate) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Loading template...</p>
      </div>
    )
  }

  const handleFieldChange = (field: keyof Omit<RequisitionTemplate, "id" | "listItemIds">, value: string) => {
    setDraftTemplate({ ...draftTemplate, [field]: value })
  }

  const handleSave = () => {
    if (!draftTemplate) return
    actions.updateRequisitionTemplate(templateId, {
      name: draftTemplate.name,
      department: draftTemplate.department,
    })
  }

  const handleAddItem = (item: ComplianceItem) => {
    actions.addRequisitionTemplateItem(templateId, item)
    // Update local state - add the list item ID
    if (item.id && !draftTemplate.listItemIds.includes(item.id)) {
      setDraftTemplate({ ...draftTemplate, listItemIds: [...draftTemplate.listItemIds, item.id] })
    }
  }

  const handleRemoveItem = (listItemId: string) => {
    actions.removeRequisitionTemplateItem(templateId, listItemId)
    // Update local state
    setDraftTemplate({ ...draftTemplate, listItemIds: draftTemplate.listItemIds.filter((id) => id !== listItemId) })
  }

  const existingItemIds = draftTemplate.listItemIds

  // Group items by category
  const itemsByCategory = useMemo(() => {
    return templateListItems.reduce((acc, item) => {
      const category = item.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    }, {} as Record<string, ComplianceListItem[]>)
  }, [templateListItems])

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Edit Requisition Template"
        subtitle="Manage template details and compliance items."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance templates", href: "/organization/compliance/templates" },
          { label: "Requisition Templates", href: "/organization/compliance/requisition-templates" },
          { label: draftTemplate.name },
        ]}
      />

      <Tabs value={activeTab} onValueChange={(value) => {
        if (value === "wallet") {
          router.push("/organization/compliance/wallet-templates")
        } else if (value === "requisition") {
          router.push("/organization/compliance/requisition-templates")
        } else {
          router.push("/organization/compliance/templates")
        }
      }}>
        <TabsList>
          <TabsTrigger value="wallet">Compliance Wallet Templates</TabsTrigger>
          <TabsTrigger value="requisition">Requisition Templates</TabsTrigger>
          <TabsTrigger value="legacy">Legacy Templates</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <Card title="Template Info">
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Template Name</label>
              <Input
                value={draftTemplate.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Department (optional)</label>
              <Input
                value={draftTemplate.department || ""}
                onChange={(e) => handleFieldChange("department", e.target.value)}
                placeholder="e.g., ICU, Med Surg"
                className="text-sm"
              />
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Items</p>
              <p className="text-sm font-semibold text-foreground">{draftTemplate.listItemIds.length}</p>
            </div>
            <button type="button" className="ph5-button-primary w-full text-xs" onClick={handleSave}>
              Save Changes
            </button>
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
                Add Item
              </button>
            </div>

            {Object.keys(itemsByCategory).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No items yet. Click &quot;Add Item&quot; to add compliance items from the list.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(itemsByCategory).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-md border border-border p-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">{item.name}</span>
                              <StatusChip label={item.category} />
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Expiration: {item.expirationType}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="ph5-button-ghost text-xs ml-2"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            Remove
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

      <AddItemModal
        open={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAdd={handleAddItem}
        existingItemIds={existingItemIds}
      />
    </div>
  )
}
