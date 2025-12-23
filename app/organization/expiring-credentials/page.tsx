"use client"

import { Header, Card } from "@/components/system"

export default function ExpiringCredentialsPage() {
  return (
    <div className="space-y-6 p-8">
      <Header
        title="Expiring Credentials"
        subtitle="Yet to be updated"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Expiring Credentials" },
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

