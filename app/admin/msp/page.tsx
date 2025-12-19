"use client"

import { Header, Card } from "@/components/system"

export default function MSPPage() {
  return (
    <>
      <Header
        title="MSPs"
        subtitle="Manage Managed Service Providers"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "MSPs" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              MSP management functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}




