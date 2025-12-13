"use client"

import { Header, Card } from "@/components/system"
import { FileText } from "lucide-react"

export default function OrganizationGeneralQuestionnairePage() {
  return (
    <>
      <Header
        title="General Questionnaire"
        subtitle="Manage general questionnaire"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "General Questionnaire" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              In the next phase
            </p>
            <p className="text-sm text-muted-foreground">
              General questionnaire management functionality will be available in a future release.
            </p>
          </div>
        </Card>
      </section>
    </>
  )
}



