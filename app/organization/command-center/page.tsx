"use client"

import { Header, Card } from "@/components/system"

export default function CommandCenterPage() {
  return (
    <div className="space-y-6 p-8">
      <Header
        title="Command Center"
        subtitle="Central command and control dashboard"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Command Center" },
        ]}
      />
      <Card>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Command Center content coming soon</p>
        </div>
      </Card>
    </div>
  )
}

