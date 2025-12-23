"use client"

import { Header, Card } from "@/components/system"
import { FileBarChart } from "lucide-react"

export default function ReportsPage() {
  return (
    <>
      <Header
        title="Report Library"
        subtitle="Access and manage system reports"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Report Library" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Reports</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Available system reports
                </p>
              </div>
            </div>

            <div className="py-12 text-center border-2 border-dashed border-border rounded-lg">
              <FileBarChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">
                In the next phase
              </p>
              <p className="text-sm text-muted-foreground">
                Report library functionality will be available in a future release.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}






