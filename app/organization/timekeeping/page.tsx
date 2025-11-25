"use client"

import { Card, Header, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Button } from "@/components/ui/button"

export default function OrganizationTimekeepingPage() {
  const { organization, actions } = useDemoData()

  const approve = (id: string) => actions.updateTimesheetStatus(id, "Approved")
  const reject = (id: string) => actions.updateTimesheetStatus(id, "Rejected")

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Timekeeping"
        subtitle="Review and approve clinician time for payroll."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Timekeeping" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pending" value={organization.timesheets.filter((sheet) => sheet.status === "Pending").length} />
        <StatCard label="Approved" value={organization.timesheets.filter((sheet) => sheet.status === "Approved").length} />
        <StatCard label="Rejected" value={organization.timesheets.filter((sheet) => sheet.status === "Rejected").length} />
      </div>

      <Card title="Timesheet queue">
        <div className="space-y-3">
          {organization.timesheets.map((sheet) => (
            <div key={sheet.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{sheet.staff}</p>
                <p className="text-xs text-muted-foreground">{sheet.date} • {sheet.hours} hrs • {sheet.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusChip label={sheet.status} tone={sheet.status === "Approved" ? "success" : sheet.status === "Rejected" ? "danger" : "warning"} />
                {sheet.status === "Pending" ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => reject(sheet.id)}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => approve(sheet.id)}>
                      Approve
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </Card>
  )
}

