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
  addWalletTemplate,
} from "@/lib/organization-local-db"
import { getAllComplianceListItems } from "@/lib/admin-local-db"

// Minimal shape for compliance items stored in wallet templates
// These mirror admin compliance list items for demo purposes
interface ComplianceItemOption {
  id: string
  name: string
  category: string
  expirationType?: string
}

export default function CreateWalletTemplatePage() {
  const router = useRouter()
  const { pushToast } = useToast()

  const [orgId, setOrgId] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState("RN Compliance Template")
  const [description, setDescription] = useState("Compliance requirements for Registered Nurse positions")
  const [occupation, setOccupation] = useState("RN")
  const [items, setItems] = useState<ComplianceItemOption[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const current = getCurrentOrganization() || "admin"
      setOrgId(current)
      const listItems = getAllComplianceListItems()
      const normalized: ComplianceItemOption[] = listItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category || "General",
        expirationType: item.expirationType,
      }))
      setItems(normalized)

      // Preselect a common RN set to match the example
      const defaultNames = [
        "Active RN License",
        "CPR Certification",
        "Background Check",
        "TB Test",
        "Physical Exam",
        "Immunization Record",
        "Drug Screening",
        "Professional References",
      ]
      const defaults = new Set(
        normalized.filter((i) => defaultNames.includes(i.name)).map((i) => i.id),
      )
      setSelectedItemIds(defaults)
    } catch (error) {
      console.warn("Failed to load compliance items", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const groupedItems = useMemo(() => {
    const groups: Record<string, ComplianceItemOption[]> = {}
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

      const created = addWalletTemplate(orgId, {
        name: templateName.trim(),
        occupation: occupation || undefined,
        items: selectedItems,
        description: description || undefined,
      } as any)

      pushToast({ title: "Template created", description: "Requisition compliance template saved." })
      router.push(`/organization/compliance/wallet-templates/${created.id}`)
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
          title="Create Requisition Compliance Template"
          subtitle="Define compliance requirements from Master List items"
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Compliance", href: "/organization/compliance" },
            { label: "Requisition Compliance", href: "/organization/compliance/wallet-templates" },
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
        title="Requisition Compliance Template"
        subtitle="Define compliance requirements from Master List items"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance", href: "/organization/compliance" },
          { label: "Requisition Compliance", href: "/organization/compliance/wallet-templates" },
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
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Compliance requirements for Registered Nurse positions"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Occupation (optional)</label>
              <Input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g., RN" />
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
  )
}


