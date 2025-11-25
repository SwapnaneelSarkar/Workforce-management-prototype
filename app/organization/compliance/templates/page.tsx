"use client"

import { useState } from "react"
import { Card, Header, StatusChip } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { cn } from "@/lib/utils"

export default function ComplianceTemplatesPage() {
  const { organization, actions } = useDemoData()
  const [selectedId, setSelectedId] = useState(organization.templates[0]?.id ?? "")
  const [newItem, setNewItem] = useState({ name: "", type: "License", expires: "fixed", required: true })
  const template = organization.templates.find((tpl) => tpl.id === selectedId)

  if (!template) {
    return (
      <div className="space-y-6">
        <Header title="Compliance templates" subtitle="No templates available." />
      </div>
    )
  }

  const addItem = () => {
    if (!newItem.name.trim()) return
    actions.addTemplateItem(template.id, {
      id: crypto.randomUUID(),
      name: newItem.name,
      type: newItem.type,
      expirationType: newItem.expires as "fixed" | "rolling" | "none",
      requiredAtSubmission: newItem.required,
    })
    setNewItem({ name: "", type: "License", expires: "fixed", required: true })
  }

  const removeItem = (itemId: string) => {
    actions.removeTemplateItem(template.id, itemId)
  }

  return (
    <div className="space-y-6">
      <Header
        title="Compliance templates"
        subtitle="Add or remove required documents with instant preview."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <Card title="Templates" subtitle="Select a checklist to edit.">
          <div className="space-y-2">
            {organization.templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedId(tpl.id)}
                className={cn(
                  "w-full rounded-[10px] border px-4 py-3 text-left text-sm transition",
                  tpl.id === selectedId ? "border-[#3182CE] bg-[#F0F6FF] text-[#0F172A]" : "border-border hover:border-[#3182CE]",
                )}
              >
                <div className="font-semibold">{tpl.name}</div>
                <div className="text-xs text-muted-foreground">{tpl.items.length} items • {tpl.createdDate}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card title={template.name} subtitle="Toggle requirements and expiration rules.">
          <div className="space-y-3">
            {template.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-[12px] border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type} • {item.expirationType === "none" ? "No expiry" : item.expirationType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.requiredAtSubmission}
                    onCheckedChange={(checked) => actions.updateTemplateItem(template.id, item.id, { requiredAtSubmission: checked })}
                    aria-label="Required at submission"
                  />
                  <button className="text-xs font-semibold text-danger" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {!template.items.length ? <p className="text-sm text-muted-foreground">No requirements yet.</p> : null}
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-border p-4">
            <p className="text-sm font-semibold text-foreground">Add requirement</p>
            <div className="grid gap-3 pt-3 md:grid-cols-2">
              <Input placeholder="Document name" value={newItem.name} onChange={(event) => setNewItem((prev) => ({ ...prev, name: event.target.value }))} />
              <select
                value={newItem.type}
                onChange={(event) => setNewItem((prev) => ({ ...prev, type: event.target.value }))}
                className="ph5-input"
              >
                {["License", "Certification", "Screening", "Immunization"].map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
              <select
                value={newItem.expires}
                onChange={(event) => setNewItem((prev) => ({ ...prev, expires: event.target.value }))}
                className="ph5-input"
              >
                <option value="fixed">Fixed</option>
                <option value="rolling">Rolling</option>
                <option value="none">No expiration</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={newItem.required} onCheckedChange={(checked) => setNewItem((prev) => ({ ...prev, required: checked }))} />
                Required at submission
              </label>
            </div>
            <button className="ph5-button-primary mt-4 disabled:cursor-not-allowed" onClick={addItem} disabled={!newItem.name.trim()}>
              Add item
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <StatusChip label={`${template.items.length} requirements`} tone="info" />
            <p>Changes are saved instantly.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
