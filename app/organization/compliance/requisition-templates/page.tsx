"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDemoData } from "@/components/providers/demo-data-provider"
import type { RequisitionTemplate } from "@/components/providers/demo-data-provider"
import Link from "next/link"

export default function RequisitionTemplatesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { organization, actions } = useDemoData()
  const [templateName, setTemplateName] = useState("")
  const [department, setDepartment] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const activeTab = pathname?.includes("wallet-templates")
    ? "wallet"
    : pathname?.includes("requisition-templates")
    ? "requisition"
    : "legacy"

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) return
    setIsCreating(true)
    try {
      const template = await actions.createRequisitionTemplate({
        name: templateName,
        department: department || undefined,
      })
      router.push(`/organization/compliance/requisition-templates/${template.id}`)
    } catch (error) {
      console.error("Failed to create template:", error)
    } finally {
      setIsCreating(false)
      setTemplateName("")
      setDepartment("")
    }
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Requisition Compliance Templates"
        subtitle="Create job-based templates for requisition compliance requirements."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance templates", href: "/organization/compliance/templates" },
          { label: "Requisition Templates" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={(value) => {
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <Card title="Templates">
          <div className="space-y-3">
            <div className="space-y-2 p-3 border border-border rounded-md bg-muted/30">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name"
                className="w-full rounded-md border border-border bg-input px-2 py-1.5 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateTemplate()
                  }
                }}
              />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Department (optional)"
                className="w-full rounded-md border border-border bg-input px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                className="ph5-button-primary w-full text-xs"
                onClick={handleCreateTemplate}
                disabled={!templateName.trim() || isCreating}
              >
                {isCreating ? "Creating..." : "Create Template"}
              </button>
            </div>
            <div className="space-y-1">
              {organization.requisitionTemplates.map((template) => (
                <Link
                  key={template.id}
                  href={`/organization/compliance/requisition-templates/${template.id}`}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{template.name}</div>
                      {template.department && (
                        <div className="text-xs text-muted-foreground">{template.department}</div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{template.listItemIds.length} items</span>
                  </div>
                </Link>
              ))}
              {organization.requisitionTemplates.length === 0 && (
                <p className="text-sm text-muted-foreground px-3 py-2">
                  No templates yet. Create one to get started.
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card title="Create New Template">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Requisition Compliance Templates are job-based templates that define which compliance items are required
              for specific job requisitions. These templates can be selected when creating jobs.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., ICU Core Requirements"
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateTemplate()
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Department (optional)</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., ICU, Med Surg, ER"
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              className="ph5-button-primary"
              onClick={handleCreateTemplate}
              disabled={!templateName.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Create Template"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
