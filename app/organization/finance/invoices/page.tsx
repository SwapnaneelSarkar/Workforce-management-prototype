"use client"

import { useState } from "react"
import { Card, Header, Modal, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Button } from "@/components/ui/button"

export default function OrganizationInvoicesPage() {
  const { organization, actions } = useDemoData()
  const [openId, setOpenId] = useState<string | null>(null)
  const invoice = organization.invoices.find((inv) => inv.id === openId)

  const markPaid = (id: string) => {
    actions.updateInvoiceStatus(id, "Paid")
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Invoice register"
        subtitle="Track payables across staffing partners."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Finance", href: "/organization/finance" },
          { label: "Invoices" },
        ]}
      />

      <Card title="Invoices">
        <div className="space-y-3">
          {organization.invoices.map((inv) => (
            <div key={inv.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{inv.description}</p>
                <p className="text-xs text-muted-foreground">
                  {inv.id} • Due {inv.dueDate}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">${inv.amount.toLocaleString()}</span>
                <StatusChip label={inv.status} tone={inv.status === "Paid" ? "success" : inv.status === "Overdue" ? "danger" : "warning"} />
                <Button variant="outline" size="sm" onClick={() => setOpenId(inv.id)}>
                  Details
                </Button>
                {inv.status !== "Paid" ? (
                  <Button size="sm" onClick={() => markPaid(inv.id)}>
                    Mark paid
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={Boolean(invoice)} onClose={() => setOpenId(null)} title="Invoice details">
        {invoice ? (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Vendor</span>
              <span>{invoice.description}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span>${invoice.amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Due</span>
              <span>{invoice.dueDate}</span>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

