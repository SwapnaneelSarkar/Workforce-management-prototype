"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/system"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getVendorById, getOrganizationById, type Vendor } from "@/lib/admin-local-db"
import VendorDocumentsReadOnly from "./documents-readonly"
import VendorNotesReadOnly from "./notes-readonly"

export default function OrganizationVendorDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string
  const vendorId = params.vendorId as string
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("documents")
  const [organizationName, setOrganizationName] = useState<string>("Organization")

  useEffect(() => {
    const loadData = () => {
      const foundVendor = getVendorById(vendorId)
      setVendor(foundVendor)
      
      // Get organization name
      const org = getOrganizationById(organizationId)
      if (org) {
        setOrganizationName(org.name)
      }
      
      setLoading(false)
    }
    
    loadData()
    
    // Reload vendor data when page becomes visible (e.g., after navigation)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const foundVendor = getVendorById(vendorId)
        setVendor(foundVendor)
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [vendorId, organizationId])

  if (loading) {
    return (
      <>
        <Header
          title="Vendors"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Organizations", href: "/admin/organizations" },
            { label: organizationName, href: `/admin/organizations/${organizationId}` },
            { label: "Vendors", href: `/admin/organizations/${organizationId}/vendors` },
            { label: "Loading..." },
          ]}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </>
    )
  }

  if (!vendor) {
    return (
      <>
        <Header
          title="Vendor Not Found"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Organizations", href: "/admin/organizations" },
            { label: organizationName, href: `/admin/organizations/${organizationId}` },
            { label: "Vendors", href: `/admin/organizations/${organizationId}/vendors` },
            { label: "Not Found" },
          ]}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Vendor not found.</p>
          <Link 
            href={`/admin/organizations/${organizationId}/vendors`} 
            className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Back to Vendors
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="Vendors"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organizationName, href: `/admin/organizations/${organizationId}` },
          { label: "Vendors", href: `/admin/organizations/${organizationId}/vendors` },
          { label: vendor.name },
        ]}
      />

      <section className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
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

          <TabsContent value="documents" className="mt-6">
            <VendorDocumentsReadOnly vendorId={vendorId} />
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <VendorNotesReadOnly vendorId={vendorId} />
          </TabsContent>
        </Tabs>
      </section>
    </>
  )
}



