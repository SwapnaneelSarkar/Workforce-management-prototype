"use client"

import { Header, Card } from "@/components/system"
import { Settings } from "lucide-react"

export default function OrganizationSettingsPage() {
  return (
    <>
      <Header
        title="Settings"
        subtitle="Manage organization settings"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Settings" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              Settings management functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}






