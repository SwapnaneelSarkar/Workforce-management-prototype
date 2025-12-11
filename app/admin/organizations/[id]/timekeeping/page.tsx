"use client"

import { Header, Card } from "@/components/system"
import { Clock } from "lucide-react"

export default function OrganizationTimekeepingPage() {
  return (
    <>
      <Header
        title="Timekeeping"
        subtitle="Manage timekeeping"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Timekeeping" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              Timekeeping functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}


