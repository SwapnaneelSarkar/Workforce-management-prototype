"use client"

import { Header, Card } from "@/components/system"
import { Shield } from "lucide-react"

export default function OrganizationPermissionsPage() {
  return (
    <>
      <Header
        title="Permissions"
        subtitle="Manage organization permissions"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Permissions" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              Permission management functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}





