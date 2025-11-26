"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useComplianceTemplatesStore } from "@/lib/compliance-templates-store"

type JobDraft = {
  title: string
  location: string
  payRange: string
  description: string
  complianceTemplateId: string
}

const initialDraft: JobDraft = {
  title: "",
  location: "",
  payRange: "",
  description: "",
  complianceTemplateId: "",
}

export default function CreateJobPage() {
  const router = useRouter()
  const { actions } = useDemoData()
  const { templates } = useComplianceTemplatesStore()
  const [draft, setDraft] = useState<JobDraft>(initialDraft)
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange =
    (field: keyof JobDraft) =>
    (value: string) => {
      setDraft((prev) => ({ ...prev, [field]: value }))
      if (error) setError(null)
    }

  const handleSubmit = async (nextStatus: "Draft" | "Published") => {
    if (!draft.title.trim() || !draft.location.trim() || !draft.payRange.trim() || !draft.complianceTemplateId) {
      setError("Job title, location, pay range, and compliance template are required.")
      return
    }

    setError(null)
    setSaving(nextStatus === "Draft" ? "draft" : "publish")

    await actions.createJob({
      title: draft.title.trim(),
      location: draft.location.trim(),
      department: "N/A",
      unit: "N/A",
      shift: "N/A",
      hours: "N/A",
      billRate: draft.payRange.trim(),
      description: draft.description.trim() || "To be provided.",
      requirements: [],
      tags: [],
      status: nextStatus === "Draft" ? "Draft" : "Open",
      complianceTemplateId: draft.complianceTemplateId,
    })

    setSaving(null)
    router.push("/organization/jobs")
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Create job"
        subtitle="Capture the basics and attach a compliance checklist template."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Jobs", href: "/organization/jobs" },
          { label: "Create" },
        ]}
      />

      <Card>
        <div className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Job title">
              <Input
                value={draft.title}
                onChange={(event) => handleChange("title")(event.target.value)}
                placeholder="ICU RN - Main Campus"
              />
            </Field>
            <Field label="Location">
              <select
                value={draft.location}
                onChange={(event) => handleChange("location")(event.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              >
                <option value="">Select a location</option>
                <option value="Memorial - Main Campus">Memorial - Main Campus</option>
                <option value="Memorial - Downtown">Memorial - Downtown</option>
                <option value="Memorial - Satellite Clinic">Memorial - Satellite Clinic</option>
              </select>
            </Field>
          </div>

          <Field label="Pay range">
            <Input
              value={draft.payRange}
              onChange={(event) => handleChange("payRange")(event.target.value)}
              placeholder="$80–$90/hr"
            />
          </Field>

          <Field label="Job description (optional)">
            <Textarea
              value={draft.description}
              onChange={(event) => handleChange("description")(event.target.value)}
              rows={4}
              placeholder="Summary of responsibilities and expectations."
            />
          </Field>

          <Field label="Compliance checklist template">
            <select
              value={draft.complianceTemplateId}
              onChange={(event) => handleChange("complianceTemplateId")(event.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex flex-wrap gap-3 pt-4">
            <button
              type="button"
              onClick={() => handleSubmit("Draft")}
              disabled={saving !== null}
              className="ph5-button-secondary"
            >
              {saving === "draft" ? "Saving..." : "Save as draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("Published")}
              disabled={saving !== null}
              className="ph5-button-primary"
            >
              {saving === "publish" ? "Publishing..." : "Publish job"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {children}
    </div>
  )
}

