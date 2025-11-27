"use client"

import { useState } from "react"
import { Header, Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  useComplianceTemplatesStore,
  type ComplianceItem,
  type ComplianceTemplate,
} from "@/lib/compliance-templates-store"

export default function ComplianceTemplatesPage() {
  const { templates, addTemplate, updateTemplate } = useComplianceTemplatesStore()
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(templates[0]?.id ?? null)

  const activeTemplate = templates.find((template) => template.id === activeTemplateId) ?? templates[0] ?? null

  const handleSelectTemplate = (id: string) => {
    setActiveTemplateId(id)
  }

  const handleFieldChange = (field: keyof Omit<ComplianceTemplate, "id" | "items">, value: string) => {
    if (!activeTemplate) return
    updateTemplate(activeTemplate.id, { [field]: value })
  }

  const handleItemChange = (itemId: string, updates: Partial<ComplianceItem>) => {
    if (!activeTemplate) return
    const items = activeTemplate.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    updateTemplate(activeTemplate.id, { items })
  }

  const handleAddItem = () => {
    if (!activeTemplate) return
    const newItem: ComplianceItem = {
      id: crypto.randomUUID(),
      name: "",
      type: "Other",
      expirationType: "None",
      requiredAtSubmission: false,
    }
    updateTemplate(activeTemplate.id, { items: [...activeTemplate.items, newItem] })
  }

  const handleRemoveItem = (itemId: string) => {
    if (!activeTemplate) return
    updateTemplate(activeTemplate.id, { items: activeTemplate.items.filter((item) => item.id !== itemId) })
  }

  const handleCreateTemplate = () => {
    const next = addTemplate({
      name: "New compliance template",
      description: "",
      items: [],
    })
    setActiveTemplateId(next.id)
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
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                    activeTemplate?.id === template.id ? "bg-muted font-semibold" : "hover:bg-muted/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{template.name}</span>
                    <span className="text-xs text-muted-foreground">{template.items.length} items</span>
                  </div>
                </button>
              ))}
              {!templates.length && (
                <p className="text-sm text-muted-foreground">No templates yet. Create one to get started.</p>
              )}
            </div>
          </div>
        </Card>

        <Card title="Template details">
          {activeTemplate ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Template name</label>
                <Input
                  value={activeTemplate.name}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  placeholder="ICU Core Checklist"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Description (optional)</label>
                <Textarea
                  value={activeTemplate.description ?? ""}
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
                {activeTemplate.items.map((item) => (
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
                {!activeTemplate.items.length && (
                  <p className="text-sm text-muted-foreground">
                    No items yet. Add compliance items such as &quot;RN License&quot; or &quot;BLS Certificate&quot;.
                  </p>
                )}
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




