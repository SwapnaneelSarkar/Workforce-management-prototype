"use client"

import { Header, Card } from "@/components/system"
import { Plug } from "lucide-react"

export default function OrganizationIntegrationsPage() {
  return (
    <>
      <Header
        title="Integrations / API"
        subtitle="Manage integrations and API access"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Integrations / API" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <Plug className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              Integrations and API management functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}

