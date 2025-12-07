"use client"

import { Header, Card } from "@/components/system"
import { Briefcase } from "lucide-react"

export default function OrganizationOccupationsPage() {
  return (
    <>
      <Header
        title="Occupations"
        subtitle="Manage organization occupations"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Occupations" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              Occupation management functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}

