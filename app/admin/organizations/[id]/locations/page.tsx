"use client"

import { Header, Card } from "@/components/system"
import { MapPin } from "lucide-react"
import { useParams } from "next/navigation"

export default function OrganizationLocationsPage() {
  const params = useParams()
  const organizationId = params.id as string

  return (
    <>
      <Header
        title="Locations"
        subtitle="Manage organization locations"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Locations" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              Location management functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}


