"use client"

import { Header, Card } from "@/components/system"
import { Rss } from "lucide-react"

export default function OrganizationPostingFeedPage() {
  return (
    <>
      <Header
        title="Posting Feed"
        subtitle="Manage posting feed"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Posting Feed" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <Rss className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              Posting feed functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}






