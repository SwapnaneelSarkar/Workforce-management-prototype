"use client"

import { Download } from "lucide-react"
import { Card, Header, FloatingActionButton, useToast } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"

export default function OrganizationReportsPage() {
  const { organization } = useDemoData()
  const { pushToast } = useToast()

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Reporting overview"
        subtitle="Quick stats for requisitions, applications, and approvals."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Reports" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Open requisitions</p>
          <p className="text-2xl font-semibold text-foreground">{organization.jobs.filter((job) => job.status === "Open").length}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Applications</p>
          <p className="text-2xl font-semibold text-foreground">{organization.applications.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Approvals pending</p>
          <p className="text-2xl font-semibold text-foreground">
            {organization.approvals.reduce((sum, chain) => sum + chain.approvers.filter((step) => step.status === "Pending").length, 0)}
          </p>
        </Card>
      </div>
      <FloatingActionButton icon={<Download className="h-4 w-4" aria-hidden />} label="Export report" onClick={() => pushToast({ title: "Report export queued" })} />
    </div>
  )
}

