"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddItemModal } from "@/components/compliance/add-item-modal"
import {
  useComplianceTemplatesStore,
  type ComplianceItem,
  type ComplianceTemplate,
} from "@/lib/compliance-templates-store"

export default function ComplianceTemplatesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { templates, addTemplate, updateTemplate, deleteTemplate, loadTemplates } = useComplianceTemplatesStore()
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)
  const [draftTemplate, setDraftTemplate] = useState<ComplianceTemplate | null>(null)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  
  // Determine active tab based on pathname
  const activeTab = pathname?.includes("wallet-templates")
    ? "wallet"
    : pathname?.includes("requisition-templates")
    ? "requisition"
    : "legacy"

  const activeTemplate = templates.find((template) => template.id === activeTemplateId) ?? null

  // Load templates from local DB on mount
  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  // Set active template ID when templates are loaded
  useEffect(() => {
    if (templates.length > 0 && !activeTemplateId) {
      setActiveTemplateId(templates[0]?.id ?? null)
    }
  }, [templates, activeTemplateId])

  // Sync draft with active template when it changes (only for existing templates, not temp ones)
  useEffect(() => {
    if (activeTemplateId?.startsWith("temp-")) {
      // Don't sync temp templates - they're already in draft state
      return
    }
    if (activeTemplate) {
      setDraftTemplate({ ...activeTemplate })
    } else {
      setDraftTemplate(null)
    }
  }, [activeTemplateId, activeTemplate])

  const handleSelectTemplate = (id: string) => {
    setActiveTemplateId(id)
  }

  const handleFieldChange = (field: keyof Omit<ComplianceTemplate, "id" | "items">, value: string) => {
    if (!draftTemplate) return
    setDraftTemplate({ ...draftTemplate, [field]: value })
  }

  const handleItemChange = (itemId: string, updates: Partial<ComplianceItem>) => {
    if (!draftTemplate) return
    const items = draftTemplate.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    setDraftTemplate({ ...draftTemplate, items })
  }

  const handleAddItem = (item: ComplianceItem) => {
    if (!draftTemplate) return
    setDraftTemplate({ ...draftTemplate, items: [...draftTemplate.items, item] })
    setIsAddItemModalOpen(false)
  }

  const existingItemIds = draftTemplate?.items.map((item) => {
    // Try to find the original ComplianceListItem ID by name
    if (typeof window !== "undefined") {
      try {
        const { getAllComplianceListItems } = require("@/lib/admin-local-db")
        const listItems = getAllComplianceListItems()
        const listItem = listItems.find((li) => li.name === item.name && li.isActive)
        if (listItem) return listItem.id
      } catch (error) {
        console.warn("Failed to load compliance list items", error)
      }
    }
    // Fallback: use item name as identifier
    return item.name
  }) || []

  const handleRemoveItem = (itemId: string) => {
    if (!draftTemplate) return
    setDraftTemplate({ ...draftTemplate, items: draftTemplate.items.filter((item) => item.id !== itemId) })
  }

  const handleSave = () => {
    if (!draftTemplate) return
    
    // Check if this is a new template (temp ID) or an existing one
    if (activeTemplateId?.startsWith("temp-")) {
      // Create new template
      const newTemplate = addTemplate({
        name: draftTemplate.name,
        description: draftTemplate.description,
        items: draftTemplate.items,
      })
      setActiveTemplateId(newTemplate.id)
    } else if (activeTemplateId) {
      // Update existing template
      updateTemplate(activeTemplateId, {
        name: draftTemplate.name,
        description: draftTemplate.description,
        items: draftTemplate.items,
      })
    }
  }

  const handleCreateTemplate = () => {
    // Create a temporary template that won't be saved until user clicks Save
    const tempId = `temp-${crypto.randomUUID()}`
    const tempTemplate: ComplianceTemplate = {
      id: tempId,
      name: "",
      description: "",
      items: [],
    }
    setDraftTemplate(tempTemplate)
    setActiveTemplateId(tempId)
  }

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeTemplateId === id) {
      // If deleting the active template, switch to another one or null
      const remainingTemplates = templates.filter((t) => t.id !== id)
      setActiveTemplateId(remainingTemplates[0]?.id ?? null)
    }
    deleteTemplate(id)
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Compliance Templates"
        subtitle="Create and maintain reusable compliance templates for compliance wallets and requisitions."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance templates" },
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

      {activeTab === "legacy" && (
        <>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <Card title="Templates">
          <div className="space-y-3">
            <button type="button" className="ph5-button-secondary w-full" onClick={handleCreateTemplate}>
              Create new template
            </button>
            <div className="space-y-1">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`group flex items-center gap-2 rounded-md ${
                    activeTemplate?.id === template.id ? "bg-muted" : "hover:bg-muted/80"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate(template.id)}
                    className={`flex-1 rounded-md px-3 py-2 text-left text-sm ${
                      activeTemplate?.id === template.id ? "font-semibold" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{template.name || "New compliance template"}</span>
                      <span className="text-xs text-muted-foreground">{template.items.length} items</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteTemplate(template.id, e)}
                    className="mr-2 rounded-md px-2 py-1 text-xs text-destructive opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                    title="Delete template"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {!templates.length && (
                <p className="text-sm text-muted-foreground">No templates yet. Create one to get started.</p>
              )}
            </div>
          </div>
        </Card>

        <Card title="Template details">
          {draftTemplate ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Template name</label>
                <Input
                  value={draftTemplate.name}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  placeholder="New compliance template"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Description (optional)</label>
                <Textarea
                  value={draftTemplate.description ?? ""}
                  onChange={(event) => handleFieldChange("description", event.target.value)}
                  rows={3}
                  placeholder="Short description for how and when this template is used."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Compliance items</p>
                  <button 
                    type="button" 
                    className="ph5-button-secondary text-xs" 
                    onClick={() => setIsAddItemModalOpen(true)}
                  >
                    Add item
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select compliance items from the admin's compliance list items table.
                </p>
                {draftTemplate.items.map((item) => (
                  <div key={item.id} className="space-y-2 rounded-md border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.type} • Expiration: {item.expirationType}
                          {item.requiredAtSubmission && " • Required at submission"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="ph5-button-ghost text-xs"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {!draftTemplate.items.length && (
                  <p className="text-sm text-muted-foreground">
                    No items yet. Add compliance items such as &quot;RN License&quot; or &quot;BLS Certificate&quot;.
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button type="button" className="ph5-button-primary" onClick={handleSave}>
                  Save template
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a template or create a new one to begin.</p>
          )}
        </Card>
      </div>

      <AddItemModal
        open={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAdd={handleAddItem}
        existingItemIds={existingItemIds}
      />
        </>
      )}
    </div>
  )
}





