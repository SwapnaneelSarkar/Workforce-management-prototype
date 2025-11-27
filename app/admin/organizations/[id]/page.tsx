"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { Building2, MapPin, Mail, Phone, Globe, ArrowLeft } from "lucide-react"
import { getOrganizationById, type Organization } from "@/lib/organizations-store"
// Note: organizations-store.ts re-exports from admin-local-db.ts which follows the same pattern as local-db.ts

export default function OrganizationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orgId = params.id as string
    const org = getOrganizationById(orgId)
    setOrganization(org)
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <>
        <Header
          title="Organization Details"
          subtitle="View organization information and locations."
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Organizations", href: "/admin/dashboard" },
            { label: "Details" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Card>
      </>
    )
  }

  if (!organization) {
    return (
      <>
        <Header
          title="Organization Not Found"
          subtitle="The requested organization could not be found."
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Organizations", href: "/admin/dashboard" },
            { label: "Not Found" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Organization not found.</p>
            <Link href="/admin/dashboard" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      <Header
        title={organization.name}
        subtitle="Organization details and locations."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/dashboard" },
          { label: organization.name },
        ]}
      />

      <section className="space-y-6">
        <div className="flex gap-3">
          <Link href="/admin/dashboard" className="ph5-button-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Organization Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">Basic details about the organization.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Name</p>
                  <p className="text-sm font-semibold text-foreground">{organization.name}</p>
                </div>
              </div>

              {organization.industry && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Industry</p>
                    <p className="text-sm font-semibold text-foreground">{organization.industry}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Email</p>
                  <a href={`mailto:${organization.email}`} className="text-sm font-semibold text-primary hover:underline">
                    {organization.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Phone</p>
                  <a href={`tel:${organization.phone}`} className="text-sm font-semibold text-primary hover:underline">
                    {organization.phone}
                  </a>
                </div>
              </div>

              {organization.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Website</p>
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {organization.website}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Locations</p>
                  <p className="text-sm font-semibold text-foreground">{organization.locations.length}</p>
                </div>
              </div>
            </div>

            {organization.description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm text-foreground">{organization.description}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Created</p>
              <p className="text-sm text-foreground">
                {new Date(organization.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Locations</h2>
              <p className="mt-1 text-sm text-muted-foreground">{organization.locations.length} location(s) for this organization.</p>
            </div>

            <div className="space-y-4">
              {organization.locations.map((location) => (
                <div key={location.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground">{location.name}</h3>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Address</p>
                      <p className="text-sm text-foreground">
                        {location.address}
                        <br />
                        {location.city}, {location.state} {location.zipCode}
                      </p>
                    </div>

                    {location.phone && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Phone</p>
                        <a href={`tel:${location.phone}`} className="text-sm text-primary hover:underline">
                          {location.phone}
                        </a>
                      </div>
                    )}

                    {location.email && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
                        <a href={`mailto:${location.email}`} className="text-sm text-primary hover:underline">
                          {location.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}

