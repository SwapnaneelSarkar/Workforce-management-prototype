"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/system"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getOrganizationById, type Organization } from "@/lib/organizations-store"
import OrganizationProfile from "./profile"
import OrganizationDocuments from "./documents"
import OrganizationNotes from "./notes"

export default function OrganizationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

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
            { label: "Organizations", href: "/admin/organizations" },
            { label: "View Organization" },
          ]}
        />
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
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
            { label: "Organizations", href: "/admin/organizations" },
            { label: "Not Found" },
          ]}
        />
          <div className="py-12 text-center">
          <p className="text-muted-foreground">Organization not found.</p>
          <Link href="/admin/organizations" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            Back to Organizations
            </Link>
          </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="View Organization"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "View Organization" },
        ]}
      />

      <section className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
            <TabsTrigger
              value="profile"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-3"
            >
              Organization Profile
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-3"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-3"
            >
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <OrganizationProfile organization={organization} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <OrganizationDocuments organizationId={organization.id} />
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <OrganizationNotes organizationId={organization.id} />
          </TabsContent>
        </Tabs>
      </section>
    </>
  )
}

