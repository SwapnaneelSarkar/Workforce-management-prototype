"use client"

import { Header, Card } from "@/components/system"
import { Plus } from "lucide-react"

export default function AdminVendorsPage() {
  return (
    <>
      <Header
        title="Vendors"
        subtitle="Manage vendor relationships and information"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Vendors" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Vendors</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vendor management module
                </p>
              </div>
              <button className="ph5-button-primary" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </button>
            </div>

            <div className="py-12 text-center border-2 border-dashed border-border rounded-lg">
              <p className="text-lg font-semibold text-foreground mb-2">
                In the next phase
              </p>
              <p className="text-sm text-muted-foreground">
                Vendor management functionality will be available in a future release.
              </p>
            </div>

            {/* Placeholder table structure */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Vendor Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Service</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No vendors available (placeholder)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}




