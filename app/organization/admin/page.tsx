"use client"

import { Header, Card } from "@/components/system"

export default function AdminPage() {
  return (
    <div className="space-y-6 p-8">
      <Header
        title="Admin"
        subtitle="Administrative settings and management"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Admin" },
        ]}
      />
      <Card>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Admin overview coming soon</p>
        </div>
      </Card>
    </div>
  )
}

