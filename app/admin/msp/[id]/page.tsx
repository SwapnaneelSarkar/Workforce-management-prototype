"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/system"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getMSPById } from "@/lib/admin-local-db"
import MSPProfileTab from "./profile-tab"
import MSPDocumentsTab from "./documents-tab"
import MSPNotesTab from "./notes-tab"

export default function MSPDetailPage() {
  const params = useParams()
  const mspId = params.id as string
  const [msp, setMSP] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    loadMSP()
  }, [mspId])

  const loadMSP = () => {
    setLoading(true)
    const mspData = getMSPById(mspId)
    setMSP(mspData)
    setLoading(false)
  }

  if (loading) {
    return (
      <>
        <Header
          title="MSP Profile"
          subtitle="Loading..."
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "MSPs", href: "/admin/msp" },
            { label: "Loading..." },
          ]}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading MSP profile...</p>
        </div>
      </>
    )
  }

  if (!msp) {
    return (
      <>
        <Header
          title="MSP Not Found"
          subtitle=""
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "MSPs", href: "/admin/msp" },
            { label: "Not Found" },
          ]}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">MSP not found.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title={`MSP Profile - Tab ${activeTab === "profile" ? "1" : activeTab === "documents" ? "2" : "3"}: ${activeTab === "profile" ? "Profile" : activeTab === "documents" ? "Documents" : "Notes"}`}
        subtitle={activeTab === "profile" ? "Manage template details and compliance items." : ""}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "MSPs", href: "/admin/msp" },
          { label: msp.name },
        ]}
      />

      <section className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
            <TabsTrigger
              value="profile"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground px-6 py-3"
            >
              Profile
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
            <MSPProfileTab mspId={mspId} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <MSPDocumentsTab mspId={mspId} />
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <MSPNotesTab mspId={mspId} />
          </TabsContent>
        </Tabs>
      </section>
    </>
  )
}

