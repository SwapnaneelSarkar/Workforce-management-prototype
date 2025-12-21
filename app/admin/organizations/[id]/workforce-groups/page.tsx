"use client"

import { Header } from "@/components/system"
import { useParams } from "next/navigation"
import WorkforceGroupsTab from "../workforce-groups-tab"

export default function OrganizationWorkforceGroupsPage() {
  const params = useParams()
  const organizationId = params.id as string

  return (
    <>
      <Header
        title="Workforce Groups"
        subtitle="Manage workforce groups"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Workforce Groups" },
        ]}
      />

      <section className="space-y-6">
        <WorkforceGroupsTab organizationId={organizationId} />
      </section>
    </>
  )
}





