"use client"

import { useState, useEffect } from "react"
import { Header, Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  useComplianceTemplatesStore,
  type ComplianceItem,
  type ComplianceTemplate,
} from "@/lib/compliance-templates-store"

export default function ComplianceTemplatesPage() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useComplianceTemplatesStore()
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(templates[0]?.id ?? null)
  const [draftTemplate, setDraftTemplate] = useState<ComplianceTemplate | null>(null)

  const activeTemplate = templates.find((template) => template.id === activeTemplateId) ?? null

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

  const handleAddItem = () => {
    if (!draftTemplate) return
    const newItem: ComplianceItem = {
      id: crypto.randomUUID(),
      name: "",
      type: "Other",
      expirationType: "None",
      requiredAtSubmission: false,
    }
    setDraftTemplate({ ...draftTemplate, items: [...draftTemplate.items, newItem] })
  }

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
        title="Compliance checklist templates"
        subtitle="Create and maintain reusable compliance checklists for jobs."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance templates" },
        ]}
      />

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
                  <button type="button" className="ph5-button-secondary text-xs" onClick={handleAddItem}>
                    Add item
                  </button>
                </div>
                {draftTemplate.items.map((item) => (
                  <div key={item.id} className="space-y-2 rounded-md border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={item.name}
                        onChange={(event) => handleItemChange(item.id, { name: event.target.value })}
                        placeholder="RN License"
                      />
                      <button
                        type="button"
                        className="ph5-button-ghost text-xs"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-2 md:grid-cols-3">
                      <select
                        className="rounded-md border border-border bg-input px-2 py-1 text-xs"
                        value={item.type}
                        onChange={(event) =>
                          handleItemChange(item.id, { type: event.target.value as ComplianceItem["type"] })
                        }
                      >
                        <option value="License">License</option>
                        <option value="Certification">Certification</option>
                        <option value="Background">Background</option>
                        <option value="Training">Training</option>
                        <option value="Other">Other</option>
                      </select>
                      <select
                        className="rounded-md border border-border bg-input px-2 py-1 text-xs"
                        value={item.expirationType}
                        onChange={(event) =>
                          handleItemChange(item.id, {
                            expirationType: event.target.value as ComplianceItem["expirationType"],
                          })
                        }
                      >
                        <option value="None">No expiration</option>
                        <option value="Fixed Date">Fixed date</option>
                        <option value="Recurring">Recurring</option>
                      </select>
                      <label className="inline-flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={item.requiredAtSubmission}
                          onChange={(event) =>
                            handleItemChange(item.id, { requiredAtSubmission: event.target.checked })
                          }
                        />
                        Required at submission
                      </label>
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
    </div>
  )
}





