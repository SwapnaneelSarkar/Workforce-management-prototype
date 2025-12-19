"use client"

import { Header, Card } from "@/components/system"
import { ClipboardCheck } from "lucide-react"

export default function OrganizationDocumentWalletTemplatesPage() {
  return (
    <>
      <Header
        title="Document Wallet Templates"
        subtitle="Manage document wallet templates"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Document Wallet Templates" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              Document wallet template management functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}




