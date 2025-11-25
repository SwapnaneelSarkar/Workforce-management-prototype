"use client"

import { useMemo, useState } from "react"
import { notFound, useParams } from "next/navigation"
import { ClipboardCheck, Pencil, Plus, Trash2 } from "lucide-react"
import { Header, Card, StatusChip, Modal } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useToast } from "@/components/system"

const templateDescriptions: Record<string, string> = {
  "RN Traveler Template": "Used for travel RNs entering ICU, ER, and Med Surg pods. Includes rolling license updates.",
  "Acute Care Template": "Acute care bundle covering telemetry + PCU teams plus facility-specific skills grid.",
}

const expiryRules = [
  { label: "Fixed date", value: "fixed" },
  { label: "Rolling (6 months)", value: "rolling" },
  { label: "No expiration", value: "none" },
]

type FormState = {
  id?: string
  type: string
  name: string
  expirationType: "fixed" | "rolling" | "none"
  requiredAtSubmission: boolean
}

export default function ComplianceTemplateEditorPage() {
  const params = useParams<{ id: string }>()
  const { organization, actions } = useDemoData()
  const template = organization.templates.find((entry) => entry.id === params?.id)
  const { toast } = useToast()

  const [metaName, setMetaName] = useState(template?.name ?? "")
  const [metaDescription, setMetaDescription] = useState(templateDescriptions[template?.name ?? ""] ?? "")
  const [metaExpiry, setMetaExpiry] = useState(expiryRules[0].value)
  const [metaError, setMetaError] = useState<string | null>(null)

  const [modalState, setModalState] = useState<{ mode: "add" | "edit" | null; form: FormState }>({
    mode: null,
    form: { type: "License", name: "", expirationType: "fixed", requiredAtSubmission: true },
  })
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string }>()

  const requirements = useMemo(() => template?.items ?? [], [template?.items])

  if (!template) {
    return notFound()
  }

  const openAddModal = () => {
    setModalState({
      mode: "add",
      form: { type: "License", name: "", expirationType: "fixed", requiredAtSubmission: true },
    })
  }

  const openEditModal = (item: FormState) => {
    setModalState({
      mode: "edit",
      form: item,
    })
  }

  const handleSaveMetadata = () => {
    if (!metaName.trim() || !metaDescription.trim()) {
      setMetaError("Name and description cannot be empty.")
      return
    }
    setMetaError(null)
    toast({ title: "Template metadata saved", description: "Changes are available to recruiters immediately." })
  }

  const handleRequirementSave = () => {
    if (!modalState.form.name.trim()) {
      toast({ title: "Add a requirement name", description: "Every requirement needs a readable label.", variant: "destructive" })
      return
    }
    if (modalState.mode === "add") {
      actions.addTemplateItem(template.id, { ...modalState.form, id: crypto.randomUUID() })
      toast({ title: "Requirement added", description: modalState.form.name })
    } else if (modalState.mode === "edit" && modalState.form.id) {
      actions.updateTemplateItem(template.id, modalState.form.id, modalState.form)
      toast({ title: "Requirement updated", description: modalState.form.name })
    }
    setModalState((prev) => ({ ...prev, mode: null }))
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    actions.removeTemplateItem(template.id, deleteTarget.id)
    toast({ title: "Requirement removed", description: deleteTarget.name })
    setDeleteTarget(undefined)
  }

  return (
    <div className="space-y-6">
      <Header
        title="Compliance template"
        subtitle="Update requirements and publishing rules."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance", href: "/organization/compliance/templates" },
          { label: template.name },
        ]}
        actions={[
          {
            id: "add",
            label: "Add requirement",
            icon: <Plus className="h-4 w-4" />,
            variant: "primary",
            onClick: openAddModal,
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card title="Template metadata" subtitle="Name, description, and expiration rule.">
          <div className="space-y-4">
            <div>
              <label htmlFor="template-name" className="text-xs font-semibold uppercase text-muted-foreground">
                Name
              </label>
              <Input id="template-name" value={metaName} onChange={(event) => setMetaName(event.target.value)} aria-invalid={!!metaError && !metaName} />
            </div>
            <div>
              <label htmlFor="template-description" className="text-xs font-semibold uppercase text-muted-foreground">
                Description
              </label>
              <Textarea
                id="template-description"
                value={metaDescription}
                onChange={(event) => setMetaDescription(event.target.value)}
                aria-invalid={!!metaError && !metaDescription}
              />
            </div>
            <div>
              <label htmlFor="template-expiry" className="text-xs font-semibold uppercase text-muted-foreground">
                Expiration rule
              </label>
              <select
                id="template-expiry"
                className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                value={metaExpiry}
                onChange={(event) => setMetaExpiry(event.target.value as FormState["expirationType"])}
              >
                {expiryRules.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {metaError ? <p className="text-sm text-destructive">{metaError}</p> : null}
            <Button onClick={handleSaveMetadata}>Save changes</Button>
          </div>
        </Card>

        <Card title="Publishing rules">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Auto-expire assignments</p>
                <p className="text-xs">Require refresh when assignment extends past 90 days.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Vendor visibility</p>
                <p className="text-xs">Allow vendors to view checklist status.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
              <p>Created {template.createdDate}</p>
              <p>Template ID · {template.id}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Requirements" subtitle="Drag to reorder or edit inline." actions={<Button onClick={openAddModal}>Add requirement</Button>} bleed>
        <div className="overflow-x-auto">
          <table className="ph5-table min-w-[680px]" aria-label="Compliance requirements">
            <thead>
              <tr>
                <th>Type</th>
                <th>Requirement</th>
                <th>Expiration</th>
                <th>Required @ submission</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {requirements.map((item) => (
                <tr key={item.id}>
                  <td className="font-semibold text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
                      {item.type}
                    </span>
                  </td>
                  <td>{item.name}</td>
                  <td className="text-sm text-muted-foreground">{renderExpiry(item.expirationType)}</td>
                  <td>
                    <StatusChip label={item.requiredAtSubmission ? "Required" : "Optional"} tone={item.requiredAtSubmission ? "success" : "warning"} />
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                        <Pencil className="h-4 w-4" aria-hidden />
                        <span className="sr-only">Edit requirement</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: item.id, name: item.name })}>
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
                        <span className="sr-only">Delete requirement</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalState.mode !== null}
        onClose={() => setModalState((prev) => ({ ...prev, mode: null }))}
        title={modalState.mode === "add" ? "Add requirement" : "Edit requirement"}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Type</label>
            <Input value={modalState.form.type} onChange={(event) => setModalState((prev) => ({ ...prev, form: { ...prev.form, type: event.target.value } }))} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Requirement</label>
            <Input
              value={modalState.form.name}
              onChange={(event) => setModalState((prev) => ({ ...prev, form: { ...prev.form, name: event.target.value } }))}
              aria-invalid={!modalState.form.name}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Expiration</label>
            <select
              className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
              value={modalState.form.expirationType}
              onChange={(event) =>
                setModalState((prev) => ({ ...prev, form: { ...prev.form, expirationType: event.target.value as FormState["expirationType"] } }))
              }
            >
              {expiryRules.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
            Required at submission
            <Switch
              checked={modalState.form.requiredAtSubmission}
              onCheckedChange={(checked) => setModalState((prev) => ({ ...prev, form: { ...prev.form, requiredAtSubmission: checked } }))}
            />
          </label>
          <Button className="w-full" onClick={handleRequirementSave}>
            Save requirement
          </Button>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(undefined)} title="Remove requirement" description={deleteTarget?.name}>
        <p className="text-sm text-muted-foreground">This removes the requirement for future submissions. Past assignments stay untouched.</p>
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteTarget(undefined)}>
            Cancel
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete}>
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function renderExpiry(type: string) {
  if (type === "rolling") return "Rolling • 6 mo"
  if (type === "none") return "No expiry"
  return "Fixed date"
}
