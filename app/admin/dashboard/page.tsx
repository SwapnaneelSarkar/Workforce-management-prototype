"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Building2, Plus, MapPin } from "lucide-react"
import { readOrganizations, type Organization } from "@/lib/organizations-store"
// Note: organizations-store.ts re-exports from admin-local-db.ts which follows the same pattern as local-db.ts

export default function AdminDashboardPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const pathname = usePathname()

  useEffect(() => {
    setOrganizations(readOrganizations())
  }, [pathname])

  const totalOrganizations = organizations.length
  const totalLocations = organizations.reduce((sum, org) => sum + org.locations.length, 0)

  return (
    <>
      <Header
        title="Admin Dashboard"
        subtitle="Manage organizations and monitor platform operations."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Dashboard" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/organizations/add" className="ph5-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Organization
            </Link>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <p className="ph5-label mb-2">Total Organizations</p>
            <p className="text-3xl font-semibold text-foreground">{totalOrganizations}</p>
          </Card>
          <Card>
            <p className="ph5-label mb-2">Total Locations</p>
            <p className="text-3xl font-semibold text-foreground">{totalLocations}</p>
          </Card>
          <Card>
            <p className="ph5-label mb-2">Active Organizations</p>
            <p className="text-3xl font-semibold text-foreground">{totalOrganizations}</p>
          </Card>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Organizations</h2>
            </div>
            {organizations.length === 0 ? (
              <div className="py-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">No organizations found.</p>
                <Link href="/admin/organizations/add" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
                  Add your first organization
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {organizations.map((org) => (
                  <Link
                    key={org.id}
                    href={`/admin/organizations/${org.id}`}
                    className="block rounded-lg border border-border bg-card p-4 transition hover:bg-accent"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <h3 className="font-semibold text-foreground">{org.name}</h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{org.email}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {org.locations.length} {org.locations.length === 1 ? "location" : "locations"}
                          </span>
                          {org.industry && <span>{org.industry}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>
    </>
  )
}

