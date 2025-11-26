"use client"

import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { Header, Card, StatusChip } from "@/components/system"
import { mockRequisitions, mockApplications } from "@/lib/mock-data"

export default function OrganizationDashboardPage() {
  const kpis = [
    { label: "Open positions", value: mockRequisitions.reduce((sum, req) => sum + req.openPositions, 0) },
    { label: "Active requisitions", value: mockRequisitions.length },
    { label: "Candidates in pipeline", value: mockApplications.length },
    { label: "Fill-rate", value: "92%" },
  ]

  return (
    <>
      <Header
        title="Command Center"
        subtitle="Monitor requisitions, fill progress, and recent applications."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Command Center" },
        ]}
      />

      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <div className="ph5-label">{kpi.label}</div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-semibold text-foreground">{kpi.value}</p>
                <Sparkline />
              </div>
            </Card>
          ))}
        </div>

        <Card title="Open requisitions" subtitle="Track approvals, fill-rate, and compliance status.">
          <div className="overflow-x-auto">
            <table className="ph5-table">
              <thead>
                <tr>
                  <th>Requisition</th>
                  <th>Department</th>
                  <th>Fill rate</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {mockRequisitions.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="font-semibold text-foreground">{req.title}</div>
                      <p className="text-xs text-muted-foreground">{req.openPositions} open roles</p>
                    </td>
                    <td className="text-sm text-muted-foreground">{req.department}</td>
                    <td className="min-w-[180px]">
                      <div className="ph5-progress h-[6px]">
                        <div className="ph5-progress-bar" style={{ width: `${Math.min(req.openPositions * 15, 100)}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Internal target {req.openPositions * 4} days</p>
                    </td>
                    <td>
                      <StatusChip label={req.status} tone={req.status === "Open" ? "info" : "warning"} />
                    </td>
                    <td className="text-right">
                      <button className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Recommended actions" subtitle="Keep momentum across the workflow.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/organization/jobs/create" className="rounded-xl border-2 border-border px-5 py-4 text-sm font-semibold text-foreground hover:border-[#3182CE] hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 bg-card/50 backdrop-blur-sm">
                Create new requisition
              </Link>
              <Link href="/organization/compliance/templates" className="rounded-xl border-2 border-border px-5 py-4 text-sm font-semibold text-foreground hover:border-[#3182CE] hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 bg-card/50 backdrop-blur-sm">
                Manage compliance templates
              </Link>
              <Link href="/organization/applications" className="rounded-xl border-2 border-border px-5 py-4 text-sm font-semibold text-foreground hover:border-[#3182CE] hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 bg-card/50 backdrop-blur-sm">
                Review applications
              </Link>
              <Link href="/organization/reports" className="rounded-xl border-2 border-border px-5 py-4 text-sm font-semibold text-foreground hover:border-[#3182CE] hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 bg-card/50 backdrop-blur-sm">
                Export report
              </Link>
            </div>
          </Card>

          <Card title="Recent applications" subtitle="Live feed across requisitions.">
            <div className="space-y-3">
              {mockApplications.slice(0, 4).map((app) => (
                <div key={app.id} className="rounded-xl border-2 border-border px-4 py-3 hover:shadow-md hover:border-primary/20 transition-all duration-200 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{app.candidateName}</p>
                      <p className="text-xs text-muted-foreground">{app.jobTitle}</p>
                    </div>
                    <StatusChip label={app.status} tone={getStatusTone(app.status)} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Submitted {app.appliedDate}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </>
  )
}

function Sparkline() {
  return (
    <div className="h-10 w-20 rounded-full bg-gradient-to-r from-[#E2E8F0] via-[#CBD5F5] to-[#3182CE]/30 relative overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    </div>
  )
}

function getStatusTone(status: string) {
  if (status === "Offer" || status === "Accepted") return "success"
  if (status === "Rejected") return "danger"
  return "warning"
}
