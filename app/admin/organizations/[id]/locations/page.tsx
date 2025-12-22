"use client"

import { Header } from "@/components/system"
import { useParams } from "next/navigation"
import LocationsTab from "../locations-tab"

export default function OrganizationLocationsPage() {
  const params = useParams()
  const organizationId = params.id as string

  return (
    <>
      <Header
        title="Locations"
        subtitle="Manage organization locations and their departments"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Locations" },
        ]}
      />

      <section className="space-y-6">
        <LocationsTab organizationId={organizationId} />
      </section>
    </>
  )
}





