"use client"

import { Header, Card } from "@/components/system"
import { CreditCard, DollarSign } from "lucide-react"

export default function OrganizationBillingPage() {
  // Mock billing data
  const billingData = {
    currentMonth: 125000,
    yearToDate: 1500000,
    outstandingInvoices: 3,
    totalPaid: 1375000,
  }

  return (
    <>
      <Header
        title="Billing"
        subtitle="Manage organization billing"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Billing" },
        ]}
      />

      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Current Month</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${(billingData.currentMonth / 1000).toFixed(0)}K</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Year to Date</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${(billingData.yearToDate / 1000000).toFixed(1)}M</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Outstanding</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{billingData.outstandingInvoices}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Paid</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${(billingData.totalPaid / 1000000).toFixed(1)}M</p>
          </Card>
        </div>

        <Card>
          <div className="py-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              Billing Details
            </p>
            <p className="text-sm text-muted-foreground">
              Detailed billing information will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}



