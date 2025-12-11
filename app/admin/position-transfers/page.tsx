"use client"

import { Header, Card } from "@/components/system"

export default function PositionTransfersPage() {
  return (
    <>
      <Header
        title="Position Transfer List"
        subtitle="Manage position transfers"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Position Transfer List" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              Position transfer functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}


