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
  payRangeMin: string
  payRangeMax: string
  description: string
  complianceTemplateId: string
}

type FieldErrors = {
  title?: string
  location?: string
  payRangeMin?: string
  payRangeMax?: string
  complianceTemplateId?: string
}

const initialDraft: JobDraft = {
  title: "",
  location: "",
  payRangeMin: "",
  payRangeMax: "",
  description: "",
  complianceTemplateId: "",
}

export default function CreateJobPage() {
  const router = useRouter()
  const { actions } = useDemoData()
  const { templates } = useComplianceTemplatesStore()
  const [draft, setDraft] = useState<JobDraft>(initialDraft)
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})

  const handleChange =
    (field: keyof JobDraft) =>
    (value: string) => {
      setDraft((prev) => ({ ...prev, [field]: value }))
      // Clear error for this field when user starts typing
      if (errors[field as keyof FieldErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {}

    if (!draft.title.trim()) {
      newErrors.title = "Job title is required"
    }
    if (!draft.location.trim()) {
      newErrors.location = "Location is required"
    }
    if (!draft.payRangeMin.trim()) {
      newErrors.payRangeMin = "Minimum pay is required"
    } else if (parseFloat(draft.payRangeMin) < 0) {
      newErrors.payRangeMin = "Amount cannot be negative"
    }
    if (!draft.payRangeMax.trim()) {
      newErrors.payRangeMax = "Maximum pay is required"
    } else if (parseFloat(draft.payRangeMax) < 0) {
      newErrors.payRangeMax = "Amount cannot be negative"
    }

    if (!draft.complianceTemplateId) {
      newErrors.complianceTemplateId = "Compliance template is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (nextStatus: "Draft" | "Published") => {
    if (!validateForm()) {
      return
    }

    setSaving(nextStatus === "Draft" ? "draft" : "publish")

    const payRange = `$${draft.payRangeMin}–$${draft.payRangeMax}/hr`

    await actions.createJob({
      title: draft.title.trim(),
      location: draft.location.trim(),
      department: "N/A",
      unit: "N/A",
      shift: "N/A",
      hours: "N/A",
      billRate: payRange,
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
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Job title" error={errors.title}>
              <Input
                value={draft.title}
                onChange={(event) => handleChange("title")(event.target.value)}
                placeholder="ICU RN - Main Campus"
              />
            </Field>
            <Field label="Location" error={errors.location}>
              <select
                value={draft.location}
                onChange={(event) => handleChange("location")(event.target.value)}
                className="h-11 w-full rounded-[10px] border-2 border-[#E2E8F0] bg-gradient-to-b from-white to-[#fafbfc] px-4 py-2.5 text-sm text-[#2D3748] transition-all duration-200 shadow-sm hover:border-[#3182CE]/30 hover:shadow-md focus:border-[#3182CE] focus:outline-none focus:ring-4 focus:ring-[#3182CE]/20 focus:shadow-lg focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#F7F7F9] disabled:text-[#A0AEC0] disabled:opacity-60"
              >
                <option value="">Select a location</option>
                <option value="Memorial - Main Campus">Memorial - Main Campus</option>
                <option value="Memorial - Downtown">Memorial - Downtown</option>
                <option value="Memorial - Satellite Clinic">Memorial - Satellite Clinic</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Pay range (min)" error={errors.payRangeMin}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#718096] pointer-events-none">USD</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.payRangeMin}
                  onChange={(event) => {
                    const value = event.target.value
                    // Prevent negative values - allow empty string or non-negative numbers
                    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && !value.startsWith("-"))) {
                      handleChange("payRangeMin")(value)
                    }
                  }}
                  placeholder="80"
                  className="pl-16"
                />
              </div>
            </Field>
            <Field label="Pay range (max)" error={errors.payRangeMax}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#718096] pointer-events-none">USD</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.payRangeMax}
                  onChange={(event) => {
                    const value = event.target.value
                    // Prevent negative values - allow empty string or non-negative numbers
                    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && !value.startsWith("-"))) {
                      handleChange("payRangeMax")(value)
                    }
                  }}
                  placeholder="90"
                  className="pl-16"
                />
              </div>
            </Field>
          </div>

          <Field label="Job description (optional)">
            <Textarea
              value={draft.description}
              onChange={(event) => handleChange("description")(event.target.value)}
              rows={4}
              placeholder="Summary of responsibilities and expectations."
            />
          </Field>

          <Field label="Compliance checklist template" error={errors.complianceTemplateId}>
            <select
              value={draft.complianceTemplateId}
              onChange={(event) => handleChange("complianceTemplateId")(event.target.value)}
              className="h-11 w-full rounded-[10px] border-2 border-[#E2E8F0] bg-gradient-to-b from-white to-[#fafbfc] px-4 py-2.5 text-sm text-[#2D3748] transition-all duration-200 shadow-sm hover:border-[#3182CE]/30 hover:shadow-md focus:border-[#3182CE] focus:outline-none focus:ring-4 focus:ring-[#3182CE]/20 focus:shadow-lg focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#F7F7F9] disabled:text-[#A0AEC0] disabled:opacity-60"
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

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

