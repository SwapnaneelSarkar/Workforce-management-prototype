"use client"

import { Header, Card } from "@/components/system"
import { FileBarChart } from "lucide-react"

export default function OrganizationReportsLibraryPage() {
  return (
    <>
      <Header
        title="Reports Library"
        subtitle="Access organization reports"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Reports Library" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <FileBarChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              Reports library functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}




