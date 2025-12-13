"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/system"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getVendorById, type Vendor } from "@/lib/admin-local-db"
import VendorProfile from "./profile"
import VendorOccupations from "./occupations"
import VendorUsers from "./vendor-users"
import VendorDocuments from "./documents"
import VendorNotes from "./notes"

export default function VendorDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    const loadVendor = () => {
      const vendorId = params.id as string
      if (vendorId === "add") {
        // Handle add new vendor case
        setVendor(null)
        setLoading(false)
        return
      }
      const foundVendor = getVendorById(vendorId)
      setVendor(foundVendor)
      setLoading(false)
    }
    
    loadVendor()
    
    // Reload vendor data when page becomes visible (e.g., after save)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && params.id !== "add") {
        const vendorId = params.id as string
        const foundVendor = getVendorById(vendorId)
        setVendor(foundVendor)
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [params.id])

  if (loading) {
    return (
      <>
        <Header
          title="Vendors"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Vendors", href: "/admin/vendors" },
            { label: "Loading..." },
          ]}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </>
    )
  }

  if (!vendor && params.id !== "add") {
    return (
      <>
        <Header
          title="Vendor Not Found"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Vendors", href: "/admin/vendors" },
            { label: "Not Found" },
          ]}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Vendor not found.</p>
          <Link href="/admin/vendors" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
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
          { label: "Vendors", href: "/admin/vendors" },
          { label: vendor ? vendor.name : "Add Vendor" },
        ]}
      />

      <section className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
            <TabsTrigger
              value="profile"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-3"
            >
              Vendor Profile
            </TabsTrigger>
            <TabsTrigger
              value="occupations"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-3"
            >
              Occupations
            </TabsTrigger>
            <TabsTrigger
              value="vendor-users"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-3"
            >
              Vendor Users
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
            <VendorProfile vendor={vendor} vendorId={params.id as string} />
          </TabsContent>

          <TabsContent value="occupations" className="mt-6">
            <VendorOccupations vendor={vendor} vendorId={params.id as string} />
          </TabsContent>

          <TabsContent value="vendor-users" className="mt-6">
            <VendorUsers vendorId={params.id as string} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <VendorDocuments vendorId={params.id as string} />
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <VendorNotes vendorId={params.id as string} />
          </TabsContent>
        </Tabs>
      </section>
    </>
  )
}
