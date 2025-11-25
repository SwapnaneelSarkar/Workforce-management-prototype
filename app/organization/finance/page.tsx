"use client"

import { Card, Header, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import Link from "next/link"

export default function OrganizationFinancePage() {
  const { organization } = useDemoData()
  const pendingTotal = organization.invoices.filter((invoice) => invoice.status === "Pending").reduce((sum, invoice) => sum + invoice.amount, 0)
  const overdueTotal = organization.invoices.filter((invoice) => invoice.status === "Overdue").reduce((sum, invoice) => sum + invoice.amount, 0)

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Finance overview"
        subtitle="Monitor invoice status and vendor spend."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Finance" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pending" value={`$${pendingTotal.toLocaleString()}`} />
        <StatCard label="Overdue" value={`$${overdueTotal.toLocaleString()}`} />
        <StatCard label="Open requisitions" value={organization.jobs.filter((job) => job.status === "Open").length} />
      </div>

      <Card title="Recent invoices">
        <div className="space-y-3">
          {organization.invoices.slice(0, 5).map((invoice) => (
            <div key={invoice.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{invoice.description}</p>
                <p className="text-xs text-muted-foreground">
                  Invoice {invoice.id} • Due {invoice.dueDate}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">${invoice.amount.toLocaleString()}</span>
                <StatusChip label={invoice.status} tone={invoice.status === "Paid" ? "success" : invoice.status === "Overdue" ? "danger" : "warning"} />
                <Link href="/organization/finance/invoices" className="text-sm text-primary underline-offset-4 hover:underline">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </Card>
  )
}

