"use client"

import { Header, Card } from "@/components/system"

export default function DocumentWalletTemplatesPage() {
  return (
    <>
      <Header
        title="Document Wallet Templates"
        subtitle="Configure which document types appear in the candidate document wallet."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Document Wallet Templates" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This prototype page represents the navigation item shown in the designs. In a
              full implementation you would manage document types, expirations, and
              requirements here.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}










