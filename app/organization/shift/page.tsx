"use client"

import { Header, Card } from "@/components/system"

export default function ShiftPage() {
  return (
    <div className="space-y-6 p-8">
      <Header
        title="Shift"
        subtitle="Yet to be updated"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Active Workforce", href: "/organization/active-workforce" },
          { label: "Shift" },
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


