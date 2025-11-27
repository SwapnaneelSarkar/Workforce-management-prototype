"use client"

import React, { useMemo, useState } from "react"
import { CalendarDays, Clock3, DollarSign, MapPin, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, Header, Modal, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useComplianceTemplatesStore } from "@/lib/compliance-templates-store"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { useToast } from "@/components/system"

type PageProps = {
  params: Promise<{ id: string }>
}

type RequirementStatus = {
  id: string
  name: string
  type: string
  requiredAtSubmission: boolean
  status: "completed" | "missing"
}

export default function JobDetailsPage({ params }: PageProps) {
  const { id } = React.use(params)
  const { organization, candidate, actions } = useDemoData()
  const { data: localDb, markJobApplied } = useLocalDb()
  const templates = useComplianceTemplatesStore((state) => state.templates)
  const { pushToast } = useToast()

  const job = organization.jobs.find((item) => item.id === id)

  const [requirementsModalOpen, setRequirementsModalOpen] = useState(false)
  const [uploadTarget, setUploadTarget] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [applying, setApplying] = useState(false)

  if (!job) {
    return (
      <div className="p-8">
        <Card title="Job not found" subtitle="Please return to the marketplace and choose another role." />
      </div>
    )
  }

  const template = job.complianceTemplateId ? templates.find((item) => item.id === job.complianceTemplateId) : undefined

  const checklist = useMemo(() => {
    if (template) {
      return template.items.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        requiredAtSubmission: item.requiredAtSubmission,
      }))
    }
    return (job.requirements ?? []).map((requirement, index) => ({
      id: `${job.id}-${index}`,
      name: requirement,
      type: "Other",
      requiredAtSubmission: true,
    }))
  }, [job.id, job.requirements, template])

  const requirementStatuses: RequirementStatus[] = useMemo(() => {
    return checklist.map((item) => {
      const hasDocument = candidate.documents.some((doc) => doc.type === item.name)
      return { ...item, status: hasDocument ? "completed" : "missing" }
    })
  }, [candidate.documents, checklist])

  const missingDocuments = requirementStatuses.filter((item) => item.status === "missing").map((item) => item.name)
  const allRequirementsMet = missingDocuments.length === 0
  const hasApplied = Boolean(localDb.jobApplications[job.id]) || candidate.applications.some((app) => app.jobId === job.id)

  const infoRows = [
    { label: "Department", value: job.department },
    { label: "Unit", value: job.unit },
    { label: "Shift", value: job.shift },
    { label: "Hours", value: job.hours },
    { label: "Bill rate", value: job.billRate },
    { label: "Location", value: job.location },
    { label: "Start date", value: job.startDate ?? "To be announced" },
  ]

  const handleApply = async () => {
    if (hasApplied) {
      return
    }
    if (!allRequirementsMet) {
      setRequirementsModalOpen(true)
      return
    }
    setApplying(true)
    try {
      await actions.submitJobApplication(job.id)
      markJobApplied(job.id)
      pushToast({ title: "Application submitted", description: `${job.title} • ${job.location}`, type: "success" })
    } catch (error) {
      pushToast({ title: "Unable to apply", description: "Please try again.", type: "error" })
    } finally {
      setApplying(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadTarget) return
    setUploading(true)
    try {
      await actions.uploadDocument({ name: `${uploadTarget}.pdf`, type: uploadTarget })
      pushToast({ title: `${uploadTarget} uploaded`, type: "success" })
      setUploadTarget(null)
    } catch {
      pushToast({ title: "Upload failed", description: "Try again in a moment.", type: "error" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title={job.title}
        subtitle={`${job.department} • ${job.location}`}
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Jobs", href: "/candidate/jobs" },
          { label: job.title },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <Card>
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Job information</p>
              <h1 className="mt-1 text-2xl font-semibold text-foreground">{job.title}</h1>
              <p className="text-sm text-muted-foreground">{job.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {infoRows.map((row) => (
                <div key={row.label} className="rounded-xl border border-border px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{row.label}</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{row.value}</p>
                </div>
              ))}
            </div>
            {job.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Submission readiness</p>
                <p className="text-sm text-muted-foreground">
                  Complete every checklist item below before applying.
                </p>
              </div>
              <StatusChip label={allRequirementsMet ? "Ready" : "Missing docs"} tone={allRequirementsMet ? "success" : "warning"} />
            </div>
            <Button
              size="lg"
              className="w-full"
              variant={allRequirementsMet && !hasApplied ? "default" : "outline"}
              onClick={allRequirementsMet ? handleApply : () => setRequirementsModalOpen(true)}
              disabled={hasApplied || applying}
            >
              {hasApplied ? "Applied" : allRequirementsMet ? (applying ? "Submitting..." : "Apply Now") : "Review Requirements"}
            </Button>
            <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden />
                {job.location}
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" aria-hidden />
                Start {job.startDate ?? "TBD"}
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" aria-hidden />
                {job.shift} • {job.hours}
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" aria-hidden />
                {job.billRate}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">Compliance requirements</p>
            <p className="text-sm text-muted-foreground">
              Attached checklist: {template?.name ?? "Job specific requirements"}
            </p>
          </div>
          <StatusChip label={`${requirementStatuses.length - missingDocuments.length}/${requirementStatuses.length} completed`} tone={allRequirementsMet ? "success" : "warning"} />
        </div>
        <div className="mt-4 space-y-3">
          {requirementStatuses.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border p-4 transition hover:border-primary/60"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.requiredAtSubmission ? "Required at submission" : "Required before start"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusChip label={item.status === "completed" ? "Completed" : "Missing"} tone={item.status === "completed" ? "success" : "danger"} />
                  {item.status === "missing" && (
                    <Button size="sm" variant="outline" onClick={() => setUploadTarget(item.name)} className="inline-flex items-center gap-2">
                      <Upload className="h-4 w-4" aria-hidden />
                      Upload document
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        open={requirementsModalOpen}
        onClose={() => setRequirementsModalOpen(false)}
        title="Documents required before apply"
        description="Upload these items into your document wallet to unlock instant apply."
      >
        <div className="space-y-3">
          {missingDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground">All requirements are satisfied.</p>
          ) : (
            missingDocuments.map((doc) => (
              <div key={doc} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span className="text-sm font-medium text-foreground">{doc}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setRequirementsModalOpen(false)
                    setUploadTarget(doc)
                  }}
                >
                  Upload
                </Button>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setRequirementsModalOpen(false)}>
            Close
          </Button>
          <Button onClick={() => (window.location.href = "/candidate/documents")}>Go to Document Wallet</Button>
        </div>
      </Modal>

      <Modal
        open={uploadTarget !== null}
        onClose={() => {
          if (!uploading) {
            setUploadTarget(null)
          }
        }}
        title={`Upload ${uploadTarget ?? ""}`}
        description="Simulate adding this document to your wallet."
      >
        <p className="text-sm text-muted-foreground">
          This action adds a placeholder file for the selected requirement.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload document"}
          </Button>
          <Button variant="outline" onClick={() => setUploadTarget(null)} disabled={uploading}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  )
}
