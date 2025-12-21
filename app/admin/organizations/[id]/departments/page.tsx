"use client"

import { Header } from "@/components/system"
import { useParams } from "next/navigation"
import DepartmentsTab from "../departments-tab"

export default function OrganizationDepartmentsPage() {
  const params = useParams()
  const organizationId = params.id as string

  return (
    <>
      <Header
        title="Departments"
        subtitle="Manage organization departments"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Departments" },
        ]}
      />

      <section className="space-y-6">
        <DepartmentsTab organizationId={organizationId} />
      </section>
    </>
  )
}





