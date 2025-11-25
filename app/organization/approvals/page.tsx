"use client"

import { Card, Header, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Button } from "@/components/ui/button"

export default function OrganizationApprovalsPage() {
  const { organization, actions } = useDemoData()
  const chain = organization.approvals[0]
  const job = organization.jobs.find((job) => job.id === chain?.requisitionId)

  const handleDecision = (stepId: string, status: "Approved" | "Rejected") => {
    if (!chain) return
    actions.updateApprovalStep(chain.id, stepId, status)
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Approval workbench"
        subtitle="Track requisition approvals and move blockers forward."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Approvals" },
        ]}
      />

      {chain ? (
        <Card title={job?.title ?? "Requisition"} subtitle={job ? `${job.department} • ${job.location}` : undefined}>
          <div className="space-y-3">
            {chain.approvers.map((step) => (
              <div key={step.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.name}</p>
                  <p className="text-xs text-muted-foreground">{step.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusChip label={step.status} tone={step.status === "Approved" ? "success" : step.status === "Rejected" ? "danger" : "warning"} />
                  {step.status === "Pending" ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDecision(step.id, "Rejected")}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleDecision(step.id, "Approved")}>
                        Approve
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">{step.decisionAt ?? "Awaiting record"}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card title="No approval chains" subtitle="All requisitions have been approved." />
      )}
    </div>
  )
}

