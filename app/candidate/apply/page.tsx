"use client"

import Link from "next/link"
import { Card, Header, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"

export default function ApplyJobPage() {
  const { candidate } = useDemoData()
  const profileComplete = candidate.profile.profileCompletePct >= 70
  const documentsComplete = candidate.documents.every((doc) => doc.status === "Completed")
  const complianceComplete = candidate.onboarding.requiredDocuments.every((doc) =>
    candidate.documents.some((walletDoc) => walletDoc.type === doc && walletDoc.status === "Completed"),
  )
  const canSubmit = profileComplete && documentsComplete && complianceComplete

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Application readiness"
        subtitle="Complete each checklist below, then apply directly from any job card."
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Apply" },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <ChecklistCard
          title="Profile"
          status={profileComplete ? "Complete" : "Missing info"}
          tone={profileComplete ? "success" : "warning"}
          action={{ label: "Edit profile", href: "/candidate/profile" }}
        >
          Keep contact details, work history, and preferences current.
        </ChecklistCard>
        <ChecklistCard
          title="Document wallet"
          status={`${candidate.documents.filter((doc) => doc.status === "Completed").length}/${candidate.documents.length} verified`}
          tone={documentsComplete ? "success" : "warning"}
          action={{ label: "Manage documents", href: "/candidate/documents" }}
        >
          Upload licenses, screenings, and certifications.
        </ChecklistCard>
        <ChecklistCard
          title="Onboarding"
          status={`${candidate.onboarding.requiredDocuments.length} requirements`}
          tone={complianceComplete ? "success" : "warning"}
          action={{ label: "Open onboarding", href: "/candidate/onboarding" }}
        >
          Complete questionnaires to unlock instant apply.
        </ChecklistCard>
      </div>

      <Card title="Ready to apply?">
        <p className="text-sm text-muted-foreground">Once all three checks are green, head back to the job marketplace and tap “Apply”.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <StatusChip label={canSubmit ? "Ready" : "Not ready"} tone={canSubmit ? "success" : "warning"} />
          <Link
            href="/candidate/jobs"
            className="rounded-full border border-primary px-4 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            Browse jobs
          </Link>
        </div>
      </Card>
    </div>
  )
}

function ChecklistCard({
  title,
  status,
  tone,
  action,
  children,
}: {
  title: string
  status: string
  tone: "success" | "warning"
  action: { label: string; href: string }
  children: React.ReactNode
}) {
  return (
    <Card title={title} subtitle={children as string}>
      <StatusChip label={status} tone={tone} />
      <Link href={action.href} className="mt-3 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline">
        {action.label}
      </Link>
    </Card>
  )
}
