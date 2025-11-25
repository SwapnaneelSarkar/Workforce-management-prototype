"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, Header, MultiStepForm, StatusChip } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useDemoData } from "@/components/providers/demo-data-provider"

type JobDraft = {
  title: string
  location: string
  department: string
  unit: string
  shift: string
  hours: string
  billRate: string
  complianceTemplateId: string
  description: string
  requirements: string[]
  benefits: string[]
  tags: string[]
  vendors: string
}

const initialDraft: JobDraft = {
  title: "",
  location: "",
  department: "",
  unit: "",
  shift: "Night",
  hours: "36 hrs/week",
  billRate: "",
  complianceTemplateId: "",
  description: "",
  requirements: [],
  benefits: [],
  tags: [],
  vendors: "",
}

export default function CreateJobPage() {
  const { organization, actions } = useDemoData()
  const [draft, setDraft] = useState<JobDraft>(() => ({
    ...initialDraft,
    complianceTemplateId: organization.templates[0]?.id ?? "",
  }))
  const [activeStep, setActiveStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [publishedJobId, setPublishedJobId] = useState<string | null>(null)

  const steps = [
    {
      id: "general",
      title: "General",
      description: "Basic role info visible to all vendors.",
      content: (
        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="Job title" value={draft.title} onChange={(value) => setDraft((prev) => ({ ...prev, title: value }))} />
          <InputField label="Location" value={draft.location} onChange={(value) => setDraft((prev) => ({ ...prev, location: value }))} />
          <InputField label="Department" value={draft.department} onChange={(value) => setDraft((prev) => ({ ...prev, department: value }))} />
          <InputField label="Unit" value={draft.unit} onChange={(value) => setDraft((prev) => ({ ...prev, unit: value }))} />
        </div>
      ),
    },
    {
      id: "details",
      title: "Details",
      description: "Rates, shifts, templates, and requirements.",
      content: (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <select
              value={draft.shift}
              onChange={(event) => setDraft((prev) => ({ ...prev, shift: event.target.value }))}
              className="rounded-lg border border-border bg-input px-3 py-2 text-sm"
            >
              {["Day", "Evening", "Night"].map((label) => (
                <option key={label}>{label}</option>
              ))}
            </select>
            <InputField
              label="Weekly hours"
              value={draft.hours}
              onChange={(value) => setDraft((prev) => ({ ...prev, hours: value }))}
            />
            <InputField label="Bill rate" value={draft.billRate} onChange={(value) => setDraft((prev) => ({ ...prev, billRate: value }))} placeholder="$80/hr" />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Compliance template</label>
            <select
              value={draft.complianceTemplateId}
              onChange={(event) => setDraft((prev) => ({ ...prev, complianceTemplateId: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
            >
              {organization.templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <Textarea
            placeholder="Key requirements, responsibilities, and expectations."
            value={draft.description}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            rows={4}
          />
        </div>
      ),
    },
    {
      id: "vendors",
      title: "Invite vendors",
      description: "Share this requisition with preferred vendor partners.",
      content: (
        <div className="space-y-3">
          <Textarea
            rows={4}
            placeholder="List vendor emails or IDs separated by commas."
            value={draft.vendors}
            onChange={(event) => setDraft((prev) => ({ ...prev, vendors: event.target.value }))}
          />
          <p className="text-xs text-muted-foreground">Vendors receive an email with compliance templates and due dates.</p>
        </div>
      ),
    },
    {
      id: "review",
      title: "Review & publish",
      description: "Double-check everything before pushing to the marketplace.",
      content: (
        <Card title="Summary">
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Role:</strong> {draft.title || "—"}
            </li>
            <li>
              <strong>Rate:</strong> {draft.billRate || "—"}
            </li>
            <li>
              <strong>Shift:</strong> {draft.shift}
            </li>
            <li>
              <strong>Template:</strong> {organization.templates.find((t) => t.id === draft.complianceTemplateId)?.name ?? "—"}
            </li>
          </ul>
        </Card>
      ),
    },
  ]

  const saveStep = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 400))
    if (activeStep === steps.length - 1) {
      const job = await actions.createJob({
        title: draft.title || "New requisition",
        location: draft.location || "TBD",
        department: draft.department || "General",
        unit: draft.unit || "General",
        shift: draft.shift,
        hours: draft.hours,
        billRate: draft.billRate || "$0/hr",
        complianceTemplateId: draft.complianceTemplateId || organization.templates[0]?.id || "",
        description: draft.description || "To be provided.",
        requirements: draft.requirements.length ? draft.requirements : ["Active license"],
        benefits: draft.benefits.length ? draft.benefits : ["Medical", "401k"],
        tags: draft.tags.length ? draft.tags : [draft.shift, draft.hours],
        status: "Published",
      })
      setPublishedJobId(job.id)
    }
    setSaving(false)
  }

  if (publishedJobId) {
    return (
      <div className="space-y-6 p-8">
        <Header
          title="Job published"
          subtitle="Your requisition is now visible to vendor partners."
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Jobs", href: "/organization/jobs" },
            { label: "Create" },
          ]}
        />
        <Card title="What's next">
          <p className="text-sm text-muted-foreground">Track submissions under Applications or invite more vendors.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/organization/jobs`} className="rounded-full border border-primary px-4 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10">
              View requisitions
            </Link>
            <StatusChip label="Published" tone="success" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Create requisition"
        subtitle="Four quick steps to launch a new request."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Jobs", href: "/organization/jobs" },
          { label: "Create" },
        ]}
      />

      <MultiStepForm
        steps={steps}
        activeStep={activeStep}
        onBack={() => setActiveStep((prev) => Math.max(0, prev - 1))}
        onNext={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
        onSave={saveStep}
        saving={saving}
        finishLabel="Publish job"
      />
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      {label ? <label className="text-sm font-semibold text-foreground">{label}</label> : null}
      <Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
