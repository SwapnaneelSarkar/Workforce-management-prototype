"use client"

import Link from "next/link"
import { Header, Card, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { checkJobReadiness } from "@/lib/readiness-engine"

export default function CandidateDashboardPage() {
  const { candidate, organization } = useDemoData()

  // Check if onboarding is complete
  const onboardingData = {
    personal: candidate.onboarding.personal || {},
    skills: candidate.onboarding.skills || {},
    availability: candidate.onboarding.availability || {},
  }

  const isOnboardingComplete = () => {
    const hasPersonal = !!(onboardingData.personal.firstName && onboardingData.personal.lastName && onboardingData.personal.email)
    const hasSpecialty = !!(onboardingData.skills.specialty || candidate.profile.specialties.length > 0)
    const hasSkills = Object.keys(onboardingData.skills).length > 0 || candidate.profile.skills.length > 0
    const hasPreferences = !!(onboardingData.availability.shift || candidate.profile.shiftPreference)
    return hasPersonal && hasSpecialty && hasSkills && hasPreferences
  }

  const isComplianceComplete = () => {
    const requiredDocs = candidate.onboarding.requiredDocuments || []
    if (requiredDocs.length === 0) return false
    return requiredDocs.every((docType) =>
      candidate.documents.some((doc) => doc.type === docType && doc.status === "Completed"),
    )
  }

  // Check readiness using a sample job
  const sampleJob = organization.jobs[0]
  const readiness = sampleJob
    ? checkJobReadiness(candidate.profile, sampleJob, onboardingData)
    : null

  const isJobReady = readiness?.status === "Ready"

  const completedDocs = candidate.documents.filter((doc) => doc.status === "Completed").length
  const totalDocs = candidate.documents.length
  const progressPercent = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

  const quickActions = [
    { label: "Browse jobs", description: "Review matches and new postings", href: "/candidate/jobs", cta: "See roles" },
    { label: "Upload credentials", description: "Keep wallet green", href: "/candidate/documents", cta: "Update docs" },
    { label: "View applications", description: "Check statuses and next steps", href: "/candidate/applications", cta: "Open tracker" },
  ]

  return (
    <>
      <Header
        title="Candidate Command Center"
        subtitle="Track onboarding, credentials, and upcoming activity in one view."
        breadcrumbs={[
          { label: "Candidate", href: "/candidate/dashboard" },
          { label: "Overview" },
        ]}
      />

      {/* Readiness Status Banner */}
      {!isJobReady && (
        <div className="rounded-2xl border-2 border-warning/50 bg-gradient-to-r from-warning/15 via-warning/10 to-warning/5 px-6 py-5 shadow-xl backdrop-blur-sm animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-warning">Complete your profile to access job marketplace</p>
              <p className="text-sm text-warning/80 mt-1">
                {!isComplianceComplete()
                  ? "Upload all required documents to become job ready."
                  : "Complete all onboarding steps to unlock job applications."}
              </p>
            </div>
            <Link href={!isComplianceComplete() ? "/candidate/documents" : "/candidate/onboarding"} className="ph5-button-primary">
              {!isComplianceComplete() ? "Upload Documents" : "Complete Onboarding"}
            </Link>
          </div>
        </div>
      )}

      {isJobReady && (
        <div className="rounded-2xl border-2 border-success/50 bg-gradient-to-r from-success/15 via-success/10 to-success/5 px-6 py-5 shadow-xl backdrop-blur-sm animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-success">You're job ready!</p>
              <p className="text-sm text-success/80 mt-1">All requirements are complete. Start applying to jobs now.</p>
            </div>
            <Link href="/candidate/jobs" className="ph5-button-primary">
              Browse Jobs
            </Link>
          </div>
        </div>
      )}

      <section className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Card key={action.label} className="shadow-[0_2px_8px_rgba(16,24,40,0.08)] hover:shadow-[0_8px_24px_rgba(16,24,40,0.12)]">
              <div className="ph5-label">{action.label}</div>
              <p className="text-sm text-muted-foreground">{action.description}</p>
              <Link href={action.href} className="text-sm font-semibold text-[#3182CE] underline-offset-4 hover:underline">
                {action.cta}
              </Link>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr]">
          <Card title="Onboarding progress" subtitle={`${completedDocs} of ${totalDocs} requirements`}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <CircularProgress value={progressPercent} />
              <div className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your compliance coach reviews new uploads within 24 hours. Keep the wheel green to unlock instant job submissions.
                </p>
                <div className="ph5-progress">
                  <div className="ph5-progress-bar" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex gap-3">
                  <Link href="/candidate/onboarding" className="ph5-button-primary">
                    Review checklist
                  </Link>
                  <Link href="/candidate/documents" className="ph5-button-secondary">
                    Upload document
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Profile snapshot" subtitle="Your key identifiers">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="ph5-label mb-1">Name</dt>
                <dd className="font-semibold text-foreground">{candidate.profile.name}</dd>
              </div>
              <div>
                <dt className="ph5-label mb-1">Role</dt>
                <dd className="font-semibold text-foreground">{candidate.profile.role}</dd>
              </div>
              <div>
                <dt className="ph5-label mb-1">Home facility</dt>
                <dd className="text-muted-foreground">{candidate.profile.location}</dd>
              </div>
              <div>
                <dt className="ph5-label mb-1">Shift preference</dt>
                <dd className="text-muted-foreground">{candidate.profile.shiftPreference}</dd>
              </div>
              <div className="col-span-2">
                <dt className="ph5-label mb-1">Contact</dt>
                <dd className="text-muted-foreground">{candidate.profile.email}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
          <Card title="Recent jobs for you" subtitle="High-signal roles based on your profile.">
            <div className="space-y-3">
              {organization.jobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  className="flex items-start justify-between rounded-xl border border-border px-4 py-3 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.location} • {job.shift} • {job.hours}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{job.department}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <span className="text-sm font-semibold text-foreground">{job.billRate}</span>
                    <StatusChip label={job.status} tone={job.status === "Open" ? "success" : "neutral"} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Next best actions" subtitle="Quick jumps based on your recent activity.">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Review your onboarding checklist and keep your profile fresh.</li>
              <li>Upload any missing compliance docs in your wallet.</li>
              <li>Browse open roles and save a few favorites for later.</li>
            </ul>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <Card title="Recent activity" subtitle="Last 5 updates">
            <div className="divide-y divide-border">
              {candidate.notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.subtitle}</p>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{notif.time}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Document wallet" subtitle="Expiring soon">
            <div className="space-y-3">
              {candidate.documents.slice(0, 3).map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
              <Link href="/candidate/documents" className="text-sm font-semibold text-[#3182CE] underline-offset-4 hover:underline">
                View full wallet
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </>
  )
}

function CircularProgress({ value }: { value: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(Math.max(value, 0), 100)
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90 transition-all duration-500" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} stroke="#E2E8F0" strokeWidth="12" fill="transparent" className="opacity-30" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3182CE" />
            <stop offset="50%" stopColor="#4A9EFF" />
            <stop offset="100%" stopColor="#2D3748" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold text-foreground bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">{clamped}%</span>
        <span className="text-xs font-medium text-muted-foreground mt-1">Complete</span>
      </div>
    </div>
  )
}

function DocumentCard({
  doc,
}: {
  doc: {
    name: string
    type: string
    status: "Completed" | "Pending" | "Expired"
    expiresOn: string
  }
}) {
  const chipTone =
    doc.status === "Completed"
      ? "success"
      : doc.status === "Pending Verification" || doc.status === "Pending Upload"
        ? "warning"
        : "danger"

  return (
    <div className="rounded-xl border-2 border-border px-5 py-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex rounded-full bg-[#EDF2F7] px-2 py-0.5 font-semibold uppercase text-muted-foreground">{doc.type}</span>
        <StatusChip label={doc.status} tone={chipTone} />
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{doc.name}</p>
      <p className="text-xs text-muted-foreground">Expires {doc.expiresOn}</p>
    </div>
  )
}
