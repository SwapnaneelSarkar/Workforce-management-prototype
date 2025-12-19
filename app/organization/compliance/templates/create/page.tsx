"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/system"
import {
  getCurrentOrganization,
  addLegacyTemplate,
} from "@/lib/organization-local-db"
import { getAllComplianceListItems } from "@/lib/admin-local-db"

interface ComplianceListItem {
  id: string
  name: string
  category?: string
  expirationType?: string
}

export default function CreateLegacyTemplatePage() {
  const router = useRouter()
  const { pushToast } = useToast()

  const [orgId, setOrgId] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState("CNA Simple Template")
  const [description, setDescription] = useState("Basic Job Description")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<ComplianceListItem[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const current = getCurrentOrganization() || "admin"
      setOrgId(current)
      const listItems = getAllComplianceListItems()
      const normalized: ComplianceListItem[] = listItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category || "General",
        expirationType: item.expirationType,
      }))
      setItems(normalized)

      const defaultNames = ["Valid License", "Background Check", "Physical Exam"]
      const defaults = new Set(
        normalized.filter((i) => defaultNames.includes(i.name)).map((i) => i.id),
      )
      setSelectedItemIds(defaults)
    } catch (error) {
      console.warn("Failed to load compliance list items", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const groupedItems = useMemo(() => {
    const groups: Record<string, ComplianceListItem[]> = {}
    items.forEach((item) => {
      const key = item.category || "Other"
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    return groups
  }, [items])

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = () => {
    if (!templateName.trim()) {
      pushToast({ title: "Validation", description: "Template name is required", type: "error" })
      return
    }
    if (!orgId) {
      pushToast({ title: "Error", description: "No organization selected", type: "error" })
      return
    }

    setSaving(true)
    try {
      const selectedItems = items
        .filter((item) => selectedItemIds.has(item.id))
        .map((item) => ({
          id: item.id,
          name: item.name,
          type: item.category,
          expirationType: item.expirationType,
          requiredAtSubmission: false,
        }))

      const created = addLegacyTemplate(orgId, {
        name: templateName.trim(),
        description: description || undefined,
        notes: notes || undefined,
        items: selectedItems,
      } as any)

      pushToast({ title: "Template created", description: "Legacy template saved." })
      router.push(`/organization/compliance/templates`)
    } catch (error) {
      console.error(error)
      pushToast({ title: "Error", description: "Failed to create template", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <Header
          title="Create Legacy Template"
          subtitle="Simple job template without complex compliance workflows"
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Compliance", href: "/organization/compliance" },
            { label: "Legacy Templates", href: "/organization/compliance/templates" },
            { label: "Create" },
          ]}
        />
        <Card>
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Legacy Template"
        subtitle="Simple job template without complex compliance workflows"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance", href: "/organization/compliance" },
          { label: "Legacy Templates", href: "/organization/compliance/templates" },
          { label: "Create" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Card title="Template Details">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Template Name *</label>
              <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Basic Job Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter basic job details and requirements..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes or comments"
              />
            </div>
            <div className="pt-2 flex gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="ph5-button-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Basic Compliance Items (Optional)">
          <p className="text-sm text-muted-foreground mb-3">
            You can optionally specify basic compliance requirements without the full automation.
          </p>
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([category, list]) => (
              <div key={category} className="space-y-2">
                <p className="text-sm font-semibold text-foreground">{category}</p>
                <div className="space-y-2 border border-border rounded-lg p-3">
                  {list.map((item) => (
                    <label key={item.id} className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedItemIds.has(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        {item.expirationType && (
                          <p className="text-xs text-muted-foreground">Expires: {item.expirationType}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
