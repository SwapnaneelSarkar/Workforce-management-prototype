"use client"

import { Header, Card, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"

export default function CandidateApplicationsPage() {
  const { candidate, organization } = useDemoData()

  const applications = candidate.applications.map((application) => {
    const job = organization.jobs.find((entry) => entry.id === application.jobId)
    return {
      id: application.id,
      jobTitle: job?.title ?? "Job role",
      submittedAt: formatDate(application.submittedAt),
      status: normalizeStatus(application.status),
    }
  })

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Applications"
        subtitle="Track every submission at a glance."
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Applications" },
        ]}
      />

      <Card title="Submitted applications" subtitle="Job, status, and submission date.">
        {applications.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-semibold">Job</th>
                  <th className="py-2 pr-4 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Submission date</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} className="border-t border-border/70">
                    <td className="py-3 pr-4 text-foreground">{application.jobTitle}</td>
                    <td className="py-3 pr-4">
                      <StatusChip
                        label={application.status}
                        tone={
                          application.status === "Accepted"
                            ? "success"
                            : application.status === "Rejected"
                              ? "danger"
                              : "info"
                        }
                      />
                    </td>
                    <td className="py-3 text-foreground">{application.submittedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No applications yet. Apply to a job to see it here.</p>
        )}
      </Card>
    </div>
  )
}

function normalizeStatus(status: string) {
  if (status === "Accepted") return "Accepted"
  if (status === "Rejected") return "Rejected"
  return "Submitted"
}

function formatDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}
