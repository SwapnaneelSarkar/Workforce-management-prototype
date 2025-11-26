"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Building2, Clock3, MapPin, Star } from "lucide-react"
import { Header, Card, StatusChip, SkeletonLoader } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CandidateApplicationsPage() {
  const { candidate, organization } = useDemoData()
  const [activeId, setActiveId] = useState(candidate.applications[0]?.id)
  const [panelLoading, setPanelLoading] = useState(false)

  useEffect(() => {
    if (!activeId && candidate.applications.length) {
      setActiveId(candidate.applications[0].id)
    }
  }, [candidate.applications, activeId])

  const selectedApplication = candidate.applications.find((application) => application.id === activeId)
  const selectedJob = organization.jobs.find((job) => job.id === selectedApplication?.jobId)
  const insight = organization.insights.find((entry) => entry.applicationId === activeId)


  const handleSelect = (applicationId: string) => {
    setActiveId(applicationId)
    setPanelLoading(true)
    window.setTimeout(() => setPanelLoading(false), 250)
  }

  const applicationList = candidate.applications

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Application tracker"
        subtitle="Live status across every requisition."
        breadcrumbs={[
          { label: "Candidate portal", href: "/candidate/dashboard" },
          { label: "Applications" },
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card title="Applications" subtitle="Tap a card to view the latest details.">
          <div className="grid gap-3 md:grid-cols-2">
            {applicationList.map((application) => {
              const job = organization.jobs.find((j) => j.id === application.jobId)
              return (
                <button
                  key={application.id}
                  type="button"
                  onClick={() => handleSelect(application.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left shadow-sm transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    activeId === application.id ? "border-primary bg-primary/5" : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{job?.title || "Role"}</p>
                      <p className="text-xs text-muted-foreground">Applied {application.submittedRelative}</p>
                    </div>
                    <StatusChip label={application.status} tone={statusTone(application.status)} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Match score</span>
                    <span className="font-semibold text-foreground">{application.matchScore ?? 0}%</span>
                  </div>
                  <div className="ph5-progress mt-1 h-2">
                    <div className="ph5-progress-bar" style={{ width: `${application.matchScore ?? 0}%` }} />
                  </div>
                </button>
              )
            })}
            {!applicationList.length && <p className="text-xs text-muted-foreground col-span-2">No applications yet.</p>}
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Overview" subtitle="Status, insights, and next steps.">
            {panelLoading ? (
              <SkeletonLoader lines={8} />
            ) : selectedApplication ? (
              <div className="space-y-5">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-base font-semibold text-foreground">{selectedJob?.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedJob?.location}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <Info label="Department" value={selectedJob?.department ?? "—"} icon={<Building2 className="h-3.5 w-3.5" aria-hidden />} />
                    <Info label="Shift" value={selectedJob?.shift ?? "—"} icon={<Clock3 className="h-3.5 w-3.5" aria-hidden />} />
                    <Info label="Location" value={selectedJob?.location ?? "—"} icon={<MapPin className="h-3.5 w-3.5" aria-hidden />} />
                    <Info label="Match" value={`${selectedApplication.matchScore ?? 0}%`} icon={<Star className="h-3.5 w-3.5" aria-hidden />} />
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3" aria-hidden />
                    Submitted {selectedApplication.submittedRelative ?? selectedApplication.submittedAt}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5" aria-hidden />
                    {selectedApplication.documentStatus} docs
                  </div>
                </div>

                {/* Compliance Status */}
                {insight?.compliance && insight.compliance.length > 0 && (
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-sm font-semibold text-foreground mb-3">Compliance Status</p>
                    <div className="space-y-2">
                      {insight.compliance.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{item.requirement}</span>
                          <StatusChip
                            label={item.status}
                            tone={item.status === "Completed" ? "success" : item.status === "Expired" ? "danger" : "warning"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="secondary"
                  onClick={() => {
                    window.location.href = `/candidate/jobs/${selectedApplication.jobId}`
                  }}
                  className="w-full"
                >
                  View job details
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select an application to view the details.</p>
            )}
          </Card>
        </div>
      </section>
    </div>
  )
}

function Info({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  )
}

function statusTone(status: string): "success" | "warning" | "danger" | "info" {
  if (["Offer", "Accepted"].includes(status)) return "success"
  if (status === "Rejected") return "danger"
  if (status === "Interview") return "info"
  return "warning"
}
