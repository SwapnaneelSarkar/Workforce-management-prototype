"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Building2, MapPin, Globe, Calendar, Network } from "lucide-react"
import { readOrganizations, type Organization } from "@/lib/organizations-store"
import { vendors } from "@/lib/mock-data"

// Helper function to get organization logo initials
function getLogoInitials(name: string): string {
  const words = name.split(" ")
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
}

// Helper function to get vendor count (placeholder - vendors not directly linked to orgs)
function getVendorCount(orgId: string): number {
  // For now, return a placeholder count based on org ID
  // In a real system, this would query vendors associated with the organization
  const hash = orgId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return (hash % 30) + 5 // Return a number between 5 and 35
}

// Map industry to display name
function getIndustryDisplayName(industry?: string): string {
  if (!industry) return "Other"
  
  const industryLower = industry.toLowerCase()
  
  // Map to display categories
  if (industryLower.includes("healthcare") || industryLower.includes("health") || 
      industryLower.includes("pharmaceutical") || industryLower.includes("medical") ||
      industryLower.includes("hospital")) {
    return "Healthcare & Pharmaceuticals"
  }
  
  if (industryLower.includes("technology") || industryLower.includes("tech") ||
      industryLower.includes("software") || industryLower.includes("it") ||
      industryLower.includes("cyber") || industryLower.includes("cloud") ||
      industryLower.includes("digital")) {
    return "Technology & Software"
  }
  
  if (industryLower.includes("manufacturing") || industryLower.includes("industrial") ||
      industryLower.includes("logistics") || industryLower.includes("freight") ||
      industryLower.includes("shipping") || industryLower.includes("supply")) {
    return "Manufacturing & Logistics"
  }
  
  // Return capitalized version if no match
  return industry
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

type OrganizationCardProps = {
  organization: Organization
}

function OrganizationCard({ organization }: OrganizationCardProps) {
  const logoInitials = getLogoInitials(organization.name)
  const vendorCount = getVendorCount(organization.id)
  const headquarters = organization.locations[0]
    ? `${organization.locations[0].city}, ${organization.locations[0].state}`
    : "N/A"

  return (
    <Link
      href={`/admin/organizations/${organization.id}`}
      className="block rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/30"
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          {organization.logo ? (
            <img
              src={organization.logo}
              alt={organization.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {logoInitials}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-foreground mb-1">{organization.name}</h3>
            {organization.orgType && (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {organization.orgType}
              </span>
            )}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            {organization.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="truncate">{organization.website.replace(/^https?:\/\//, "")}</span>
              </div>
            )}
            {headquarters !== "N/A" && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Headquarters: {headquarters}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created Date: {formatDate(organization.createdAt)}</span>
            </div>
            {organization.agreementRenewalDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Renewal Date: {formatDate(organization.agreementRenewalDate)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Number of Locations: {organization.locations.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span>Number of Vendors: {vendorCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const pathname = usePathname()

  useEffect(() => {
    setOrganizations(readOrganizations())
  }, [pathname])

  // Group organizations by industry
  const groupedOrganizations = useMemo(() => {
    const groups: Record<string, Organization[]> = {}
    
    organizations.forEach((org) => {
      const industryKey = getIndustryDisplayName(org.industry)
      if (!groups[industryKey]) {
        groups[industryKey] = []
      }
      groups[industryKey].push(org)
    })

    // Sort industries alphabetically
    const sortedIndustries = Object.keys(groups).sort()
    const result: Record<string, Organization[]> = {}
    sortedIndustries.forEach((industry) => {
      result[industry] = groups[industry]
    })

    return result
  }, [organizations])

  return (
    <>
      <Header
        title="Organizations"
        subtitle="Manage and view all organizations in the platform."
        breadcrumbs={[
          { label: "Admin Portal", href: "/admin/dashboard" },
          { label: "Organizations" },
        ]}
      />

      <section className="space-y-8">
        {Object.keys(groupedOrganizations).length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">No organizations found.</p>
              <Link
                href="/admin/organizations/add"
                className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Add your first organization
              </Link>
            </div>
          </Card>
        ) : (
          Object.entries(groupedOrganizations).map(([industry, orgs]) => (
            <div key={industry} className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">{industry}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {orgs.map((org) => (
                  <OrganizationCard key={org.id} organization={org} />
                ))}
              </div>
            </div>
          ))
        )}

        {/* Footer */}
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">©2024 ClientFlow. All rights reserved.</p>
        </div>
      </section>
    </>
  )
}

