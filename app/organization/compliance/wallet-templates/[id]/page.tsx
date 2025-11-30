"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDemoData } from "@/components/providers/demo-data-provider"
import type { WalletTemplate } from "@/components/providers/demo-data-provider"
import { AddItemModal } from "@/components/compliance/add-item-modal"
import type { ComplianceItem } from "@/lib/compliance-templates-store"
import { complianceItemsByCategory } from "@/lib/compliance-items"

export default function WalletTemplateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const { organization, actions } = useDemoData()
  const templateId = params.id as string

  const template = organization.walletTemplates.find((t) => t.id === templateId)
  const [draftTemplate, setDraftTemplate] = useState<WalletTemplate | null>(null)
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
      router.push("/organization/compliance/wallet-templates")
    }
  }, [template, templateId, router])

  if (!draftTemplate) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Loading template...</p>
      </div>
    )
  }

  const handleFieldChange = (field: keyof Omit<WalletTemplate, "id" | "items">, value: string) => {
    setDraftTemplate({ ...draftTemplate, [field]: value })
  }

  const handleSave = () => {
    if (!draftTemplate) return
    actions.updateWalletTemplate(templateId, {
      name: draftTemplate.name,
      occupation: draftTemplate.occupation,
    })
  }

  const handleAddItem = (item: ComplianceItem) => {
    actions.addWalletTemplateItem(templateId, item)
    // Update local state
    setDraftTemplate({ ...draftTemplate, items: [...draftTemplate.items, item] })
  }

  const handleRemoveItem = (itemId: string) => {
    actions.removeWalletTemplateItem(templateId, itemId)
    // Update local state
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

  const occupations = ["RN", "LPN", "CNA", "PT", "OT", "RT", "ST", "MT"]

  // Group items by category
  const itemsByCategory = draftTemplate.items.reduce((acc, item) => {
    const category = item.type
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, ComplianceItem[]>)

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Edit Wallet Template"
        subtitle="Manage template details and compliance items."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance templates", href: "/organization/compliance/templates" },
          { label: "Document Wallet Templates", href: "/organization/compliance/wallet-templates" },
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
          <TabsTrigger value="wallet">Document Wallet Templates</TabsTrigger>
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
              <label className="text-xs font-semibold text-foreground">Occupation</label>
              <select
                value={draftTemplate.occupation || ""}
                onChange={(e) => handleFieldChange("occupation", e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              >
                <option value="">Select occupation</option>
                {occupations.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Items</p>
              <p className="text-sm font-semibold text-foreground">{draftTemplate.items.length}</p>
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
                              <StatusChip label={item.type} />
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Expiration: {item.expirationType}</span>
                              {item.requiredAtSubmission && (
                                <span className="text-primary font-medium">Required at submission</span>
                              )}
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
