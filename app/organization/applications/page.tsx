"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, Header, Modal, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useComplianceTemplatesStore } from "@/lib/compliance-templates-store"

export default function ApplicationsListPage() {
  const searchParams = useSearchParams()
  const jobIdFilter = searchParams.get("jobId")
  const { organization, actions } = useDemoData()
  const { templates } = useComplianceTemplatesStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const applicationList = useMemo(
    () =>
      organization.applications.filter((app) =>
        jobIdFilter ? app.jobId === jobIdFilter : true,
      ),
    [organization.applications, jobIdFilter],
  )

  return (
    <div className="space-y-6">
      <Header
        title="Applications"
        subtitle="View applications per job and take basic actions."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Applications" },
        ]}
      />

      <Card title="Applications" subtitle="Simple list of candidates and when they applied.">
        <div className="space-y-3">
          {applicationList.map((app) => (
            <div key={app.id} className="flex flex-wrap items-center gap-4 rounded-[12px] border border-border px-4 py-3">
              <div className="flex min-w-[200px] flex-1 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2F7] text-sm font-semibold text-muted-foreground">
                  {initials(app.candidateName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{app.candidateName}</p>
                  <p className="text-xs text-muted-foreground">{app.submittedRelative ?? app.submittedAt}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => actions.updateApplicationStatus(app.id, "Accepted")}
                >
                  Accept
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => actions.rejectApplication(app.id)}
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedId(app.id)}
                >
                  View candidate
                </Button>
              </div>
            </div>
          ))}
          {!applicationList.length ? <p className="text-sm text-muted-foreground">No applications yet.</p> : null}
        </div>
      </Card>

      <CandidateDetailsModal
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        applicationId={selectedId}
        organization={organization}
        templates={templates}
      />
    </div>
  )
}

function mapStatus(status: string): "Submitted" | "Accepted" | "Rejected" {
  if (status === "Accepted") return "Accepted"
  if (status === "Rejected") return "Rejected"
  return "Submitted"
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
}

function statusTone(status: string) {
  if (status === "Accepted") return "success"
  if (status === "Rejected") return "danger"
  return "warning"
}

type CandidateDetailsModalProps = {
  open: boolean
  onClose: () => void
  applicationId: string | null
  organization: ReturnType<typeof useDemoData>["organization"]
  templates: ReturnType<typeof useComplianceTemplatesStore>["templates"]
}

function CandidateDetailsModal({ open, onClose, applicationId, organization, templates }: CandidateDetailsModalProps) {
  if (!applicationId) return null

  const application = organization.applications.find((app) => app.id === applicationId)
  if (!application) return null

  const candidate = organization.candidates.find((cand) => cand.id === application.candidateId)
  const job = organization.jobs.find((posting) => posting.id === application.jobId)
  const templateId = (job as any)?.complianceTemplateId as string | undefined
  const template = templates.find((t) => t.id === templateId)
  const documents = candidate?.documents ?? []

  const missingDocuments =
    template?.items.filter(
      (item) => !documents.some((doc) => doc.type === item.name && doc.status === "Completed"),
    ) ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Candidate details"
      description="Basic profile, documents, and any missing checklist items."
    >
      <div className="space-y-4">
        <section className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{candidate?.name ?? application.candidateName}</p>
          <p className="text-xs text-muted-foreground">{job?.title ?? "Role"}</p>
          <p className="text-xs text-muted-foreground">
            {candidate?.email ?? "No email"} • {candidate?.phone ?? "No phone"}
          </p>
        </section>

        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Document wallet</p>
          <div className="space-y-1 rounded-md border border-border p-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between text-xs">
                <span>{doc.name}</span>
                <StatusChip label={doc.status} tone={doc.status === "Completed" ? "success" : "warning"} />
              </div>
            ))}
            {!documents.length && <p className="text-xs text-muted-foreground">No documents uploaded.</p>}
          </div>
        </section>

        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Missing compliance items</p>
          <div className="space-y-1 rounded-md border border-border p-2">
            {missingDocuments.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs text-destructive">
                <span>{item.name}</span>
                <span>Missing</span>
              </div>
            ))}
            {!missingDocuments.length && (
              <p className="text-xs text-muted-foreground">No missing items based on the attached template.</p>
            )}
          </div>
        </section>
      </div>
    </Modal>
  )
}

