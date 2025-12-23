"use client"

import { Header, Card } from "@/components/system"

export default function FinancePage() {
  return (
    <div className="space-y-6 p-8">
      <Header
        title="Finance"
        subtitle="Financial management and analytics"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Finance" },
        ]}
      />
      <Card>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Finance overview coming soon</p>
        </div>
      </Card>
    </div>
  )
}


