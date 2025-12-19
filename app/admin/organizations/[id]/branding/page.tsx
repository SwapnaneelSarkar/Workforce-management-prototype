"use client"

import { Header, Card } from "@/components/system"
import { Palette } from "lucide-react"

export default function OrganizationBrandingPage() {
  return (
    <>
      <Header
        title="Branding"
        subtitle="Manage organization branding"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Branding" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <Palette className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              Branding management functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}




