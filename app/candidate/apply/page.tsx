"use client"

import Link from "next/link"
import { Card, Header, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { cn } from "@/lib/utils"

export default function ApplyJobPage() {
  const { candidate } = useDemoData()
  const profileReady = candidate.profile.profileCompletePct >= 80
  const requiredDocs = candidate.onboarding.requiredDocuments
  const documentReady = requiredDocs.every((doc) => candidate.documents.some((walletDoc) => walletDoc.type === doc))
  const onboardingReady =
    Object.keys(candidate.onboarding.personal ?? {}).length > 0 &&
    Object.keys(candidate.onboarding.workHistory ?? {}).length > 0 &&
    Object.keys(candidate.onboarding.availability ?? {}).length > 0
  const allReady = profileReady && documentReady && onboardingReady

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Application readiness"
        subtitle="Close each gap below to unlock instant apply on any job."
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Apply" },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <ReadinessCard
          title="Profile Completion Check"
          statusLabel={profileReady ? "Ready" : "Not Ready"}
          tone={profileReady ? "success" : "warning"}
          description="Keep your contact details and experience up to date."
          href="/candidate/profile"
          linkLabel="Go to profile"
        />
        <ReadinessCard
          title="Document Wallet Check"
          statusLabel={documentReady ? "Completed" : "Not Completed"}
          tone={documentReady ? "success" : "warning"}
          description={`${requiredDocs.length} required documents must be on file.`}
          href="/candidate/documents"
          linkLabel="Manage documents"
        />
        <ReadinessCard
          title="Onboarding Answers Check"
          statusLabel={onboardingReady ? "Ready" : "Not Ready"}
          tone={onboardingReady ? "success" : "warning"}
          description="Finish the onboarding questionnaire so recruiters can submit you."
          href="/candidate/onboarding"
          linkLabel="Open onboarding"
        />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-foreground">Next step</p>
            <p className="text-sm text-muted-foreground">
              All three checks must read “Ready” before applying to jobs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusChip label={allReady ? "Ready" : "Not Ready"} tone={allReady ? "success" : "warning"} />
            <Link
              href={allReady ? "/candidate/jobs" : "/candidate/onboarding"}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                allReady
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "border border-primary text-primary hover:bg-primary/10",
              )}
            >
              {allReady ? "Browse Jobs" : "Complete Requirements"}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ReadinessCard({
  title,
  statusLabel,
  tone,
  description,
  href,
  linkLabel,
}: {
  title: string
  statusLabel: string
  tone: "success" | "warning"
  description: string
  href: string
  linkLabel: string
}) {
  return (
    <Card title={title} subtitle={description}>
      <StatusChip label={statusLabel} tone={tone} />
      <Link href={href} className="mt-3 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline">
        {linkLabel}
      </Link>
    </Card>
  )
}
