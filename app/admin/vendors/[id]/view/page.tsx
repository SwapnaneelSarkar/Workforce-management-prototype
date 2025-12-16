"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Edit } from "lucide-react"
import { getVendorById, type Vendor } from "@/lib/admin-local-db"
import VendorProfileReadOnly from "@/app/admin/organizations/[id]/vendors/[vendorId]/profile-readonly"
import VendorOccupationsReadOnly from "@/app/admin/organizations/[id]/vendors/[vendorId]/occupations-readonly"
import VendorUsersReadOnly from "@/app/admin/organizations/[id]/vendors/[vendorId]/vendor-users-readonly"
import VendorDocumentsReadOnly from "@/app/admin/organizations/[id]/vendors/[vendorId]/documents-readonly"
import VendorNotesReadOnly from "@/app/admin/organizations/[id]/vendors/[vendorId]/notes-readonly"
import AssociatedOrganizations from "../associated-organizations"

export default function VendorViewPage() {
  const params = useParams()
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    const loadVendor = () => {
      const vendorId = params.id as string
      const foundVendor = getVendorById(vendorId)
      setVendor(foundVendor)
      setLoading(false)
    }
    
    loadVendor()
    
    // Reload vendor data when page becomes visible (e.g., after navigation)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
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

  if (!vendor) {
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
          { label: vendor.name },
        ]}
        actions={[
          {
            id: "edit",
            label: "Edit",
            variant: "default",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => router.push(`/admin/vendors/${vendor.id}`),
          },
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
            <VendorProfileReadOnly vendor={vendor} vendorId={params.id as string} />
            <AssociatedOrganizations vendorId={params.id as string} isEditMode={false} />
          </TabsContent>

          <TabsContent value="occupations" className="mt-6">
            <VendorOccupationsReadOnly vendor={vendor} vendorId={params.id as string} />
          </TabsContent>

          <TabsContent value="vendor-users" className="mt-6">
            <VendorUsersReadOnly vendorId={params.id as string} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <VendorDocumentsReadOnly vendorId={params.id as string} />
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <VendorNotesReadOnly vendorId={params.id as string} />
          </TabsContent>
        </Tabs>
      </section>
    </>
  )
}
