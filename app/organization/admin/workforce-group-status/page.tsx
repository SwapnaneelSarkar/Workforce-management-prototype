"use client"

import { Header, Card } from "@/components/system"

export default function WorkforceGroupStatusPage() {
  return (
    <div className="space-y-6 p-8">
      <Header
        title="Workforce Group Status"
        subtitle="Yet to be updated"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Admin", href: "/organization/admin" },
          { label: "Workforce Group Status" },
        ]}
      />
      <Card>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">This section is yet to be updated.</p>
        </div>
      </Card>
    </div>
  )
}


