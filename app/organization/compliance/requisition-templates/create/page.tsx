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
  addRequisitionTemplate,
} from "@/lib/organization-local-db"
import { getAllComplianceListItems } from "@/lib/admin-local-db"

const TEMPLATE_TYPES = [
  {
    id: "long-term",
    title: "Long-term Order/Assignment",
    summary: "Temporary assignments with defined start and end dates, typically 8-26 weeks",
    bullets: [
      "Fixed duration contract",
      "Defined start and end dates",
      "Full-time or part-time schedules",
      "Compliance requirements tracked",
    ],
  },
  {
    id: "permanent",
    title: "Permanent Job",
    summary: "Full-time permanent positions with no defined end date",
    bullets: [
      "Indefinite employment",
      "Full benefits package",
      "Standard work schedule",
      "Long-term career opportunity",
    ],
  },
  {
    id: "per-diem",
    title: "Per Diem Job",
    summary: "Flexible shifts on an as-needed basis, paid per shift",
    bullets: [
      "Shift-by-shift basis",
      "Flexible scheduling",
      "No guaranteed hours",
      "Quick onboarding",
    ],
  },
]

interface ComplianceListItem {
  id: string
  name: string
  category?: string
  expirationType?: string
}

export default function CreateRequisitionTemplatePage() {
  const router = useRouter()
  const { pushToast } = useToast()

  const [orgId, setOrgId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>("long-term")
  const [templateName, setTemplateName] = useState("PT Standard Job Template")
  const [description, setDescription] = useState("Full job template + workflow + doc requirements")
  const [occupation, setOccupation] = useState("PT")
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

      const defaultNames = ["Active PT License", "CPR Certification", "Background Check"]
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
      const templateType = TEMPLATE_TYPES.find((t) => t.id === selectedType)?.title || "Requisition"
      const created = addRequisitionTemplate(orgId, {
        name: templateName.trim(),
        department: templateType,
        occupation: occupation || undefined,
        listItemIds: Array.from(selectedItemIds),
        description: description || undefined,
      } as any)

      pushToast({ title: "Template created", description: "Requisition template saved." })
      router.push(`/organization/compliance/requisition-templates/${created.id}`)
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
          title="Create Requisition Template"
          subtitle="Choose the type of requisition template you want to create"
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Compliance", href: "/organization/compliance" },
            { label: "Requisition Templates", href: "/organization/compliance/requisition-templates" },
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
        title="Create Requisition Template"
        subtitle="Choose the type of requisition template you want to create"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance", href: "/organization/compliance" },
          { label: "Requisition Templates", href: "/organization/compliance/requisition-templates" },
          { label: "Create" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card title="Select Type">
          <div className="space-y-3">
            {TEMPLATE_TYPES.map((type) => (
              <button
                key={type.id}
                className={`w-full rounded-lg border p-4 text-left transition hover:border-primary ${selectedType === type.id ? "border-primary bg-primary/5" : "border-border"}`}
                onClick={() => setSelectedType(type.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-foreground">{type.title}</p>
                    <p className="text-sm text-muted-foreground">{type.summary}</p>
                  </div>
                  <span className="text-sm text-primary font-semibold">Select this type</span>
                </div>
                <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {type.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Template Details">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Template Name *</label>
                <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full job template + workflow + doc requirements"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Occupation (optional)</label>
                <Input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g., PT" />
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

          <Card title="Select Compliance Items">
            <p className="text-sm text-muted-foreground mb-3">Choose items from the Admin Master List.</p>
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
    </div>
  )
}

