"use client"

import { Header, Card, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { getJobById } from "@/lib/organization-local-db"

export default function CandidateApplicationsPage() {
  const { candidate, allJobs } = useDemoData()

  const applications = candidate.applications.map((application) => {
    // First try to find in allJobs (Open jobs), then try to get from DB (in case job was closed)
    let job = allJobs.find((entry) => entry.id === application.jobId)
    if (!job && typeof window !== "undefined") {
      try {
        const dbJob = getJobById(application.jobId)
        if (dbJob) {
          job = {
            id: dbJob.id,
            title: dbJob.title,
            location: dbJob.location,
            department: dbJob.department,
            unit: dbJob.unit,
            shift: dbJob.shift,
            hours: dbJob.hours,
            billRate: dbJob.billRate,
            description: dbJob.description,
            requirements: dbJob.requirements,
            tags: dbJob.tags,
            status: dbJob.status,
            complianceTemplateId: dbJob.complianceTemplateId,
            startDate: dbJob.startDate,
          }
        }
      } catch (error) {
        // Silently fail, will use fallback
      }
    }
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
