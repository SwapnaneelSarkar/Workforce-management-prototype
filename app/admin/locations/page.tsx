"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { MapPin, Building2 } from "lucide-react"
import { getAllLocations } from "@/lib/organizations-store"

type LocationWithOrg = {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone?: string
  email?: string
  departments: string[]
  organizationId: string
  organizationName: string
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationWithOrg[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const allLocations = getAllLocations()
    setLocations(allLocations)
    setLoading(false)
  }, [])

  return (
    <>
      <Header
        title="Locations"
        subtitle="Manage all organization locations and their departments."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Locations" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="py-12 text-center">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No locations found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">All Locations</h2>
                <p className="mt-1 text-sm text-muted-foreground">{locations.length} location(s) across all organizations.</p>
              </div>

              <div className="space-y-4">
                {locations.map((location) => (
                  <Link
                    key={location.id}
                    href={`/admin/locations/${location.id}`}
                    className="block rounded-lg border border-border p-4 transition hover:bg-accent"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <h3 className="font-semibold text-foreground">{location.name}</h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {location.address}, {location.city}, {location.state} {location.zipCode}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {location.organizationName}
                          </span>
                          <span>
                            {location.departments.length} {location.departments.length === 1 ? "department" : "departments"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Card>
      </section>
    </>
  )
}
