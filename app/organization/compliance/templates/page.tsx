"use client"

import { Header, Card } from "@/components/system"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

export default function ComplianceTemplatesPage() {
  const router = useRouter()

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Compliance Templates"
        subtitle="Legacy compliance templates (placeholder - coming soon)."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance", href: "/organization/compliance" },
          { label: "Templates" },
        ]}
      />

      <Tabs defaultValue="legacy" onValueChange={(value) => {
        if (value === "wallet") {
          router.push("/organization/compliance/wallet-templates")
        } else if (value === "requisition") {
          router.push("/organization/compliance/requisition-templates")
        } else {
          router.push("/organization/compliance/templates")
        }
      }}>
        <TabsList>
          <TabsTrigger value="wallet">Compliance Wallet Templates</TabsTrigger>
          <TabsTrigger value="requisition">Requisition Templates</TabsTrigger>
          <TabsTrigger value="legacy">Legacy Templates</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <div className="p-8 text-center">
          <p className="text-lg font-semibold text-foreground mb-2">Legacy Templates</p>
          <p className="text-sm text-muted-foreground mb-4">
            This section is a placeholder for legacy compliance templates.
          </p>
          <p className="text-xs text-muted-foreground">
            Note: Requisition Templates (under Hiring section) are used when creating jobs.
          </p>
        </div>
      </Card>
    </div>
  )
}





