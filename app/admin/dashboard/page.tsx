"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Building2, MapPin, Users, Network, Handshake } from "lucide-react"
import { readOrganizations, type Organization } from "@/lib/organizations-store"
import { getAllUsers } from "@/lib/admin-local-db"
import { vendors } from "@/lib/mock-data"
// Note: organizations-store.ts re-exports from admin-local-db.ts which follows the same pattern as local-db.ts

export default function AdminDashboardPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<ReturnType<typeof getAllUsers>>([])
  const pathname = usePathname()

  useEffect(() => {
    setOrganizations(readOrganizations())
    setUsers(getAllUsers())
  }, [pathname])

  const totalOrganizations = organizations.length
  const totalLocations = organizations.reduce((sum, org) => sum + org.locations.length, 0)
  const totalVendors = vendors.length
  const totalUsers = users.length
  const totalChannelPartners = 3 // Placeholder - channel partners not yet in data model

  // Annual Spend Progress - placeholder data
  const currentSpend = 25000
  const expectedAnnualSpend = 100000
  const spendPercentage = Math.round((currentSpend / expectedAnnualSpend) * 100)

  return (
    <>
      <Header
        title="Admin Overview"
        breadcrumbs={[
          { label: "Admin Portal", href: "/admin/dashboard" },
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Nova Health" },
        ]}
      />

      <section className="space-y-6">
        {/* Summary Count Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalOrganizations}</p>
                <p className="text-sm text-muted-foreground">Organizations</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalLocations}</p>
                <p className="text-sm text-muted-foreground">Locations</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Network className="h-5 w-5 text-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalVendors}</p>
                <p className="text-sm text-muted-foreground">Vendors</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Users</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Handshake className="h-5 w-5 text-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalChannelPartners}</p>
                <p className="text-sm text-muted-foreground">Channel Partners</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Expected Annual Spend Section */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Expected Annual Spend Progress</h2>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  ${currentSpend.toLocaleString()}
                </span>
                <span className="text-lg text-muted-foreground">
                  ${expectedAnnualSpend.toLocaleString()}
                </span>
              </div>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all duration-300"
                  style={{ width: `${spendPercentage}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground min-w-[3rem] text-right">
                {spendPercentage}%
              </span>
            </div>
          </Card>
        </div>
      </section>
    </>
  )
}

