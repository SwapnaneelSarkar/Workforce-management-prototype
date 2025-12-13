"use client"

import { Header, Card } from "@/components/system"
import { Network } from "lucide-react"

export default function OrganizationVendorsPage() {
  return (
    <>
      <Header
        title="Vendors"
        subtitle="Manage organization vendors"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Vendors" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <Network className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              Vendor management functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}



