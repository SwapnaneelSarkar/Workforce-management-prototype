"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDemoData } from "@/components/providers/demo-data-provider"
import type { WalletTemplate } from "@/components/providers/demo-data-provider"
import Link from "next/link"

export default function WalletTemplatesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { organization, actions } = useDemoData()
  const [templateName, setTemplateName] = useState("")
  const [occupation, setOccupation] = useState("")
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
      const template = await actions.createWalletTemplate({
        name: templateName,
        occupation: occupation || undefined,
      })
      router.push(`/organization/compliance/wallet-templates/${template.id}`)
    } catch (error) {
      console.error("Failed to create template:", error)
    } finally {
      setIsCreating(false)
      setTemplateName("")
      setOccupation("")
    }
  }

  // Get occupations from admin-managed list
  const [occupations, setOccupations] = useState<string[]>([])
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const { getActiveOccupations } = require("@/lib/admin-local-db")
        const occs = getActiveOccupations()
        setOccupations(occs.map((occ) => occ.code))
      } catch (error) {
        // Fallback to default occupations
        setOccupations(["RN", "LPN", "CNA", "PT", "OT", "RT", "ST", "MT"])
      }
    }
  }, [])

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Compliance Wallet Templates"
        subtitle="Create occupation-based templates for compliance wallets."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance templates", href: "/organization/compliance/templates" },
          { label: "Compliance Wallet Templates" },
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
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-2 py-1.5 text-sm"
              >
                <option value="">Select occupation</option>
                {occupations.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
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
              {organization.walletTemplates.map((template) => (
                <Link
                  key={template.id}
                  href={`/organization/compliance/wallet-templates/${template.id}`}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{template.name}</div>
                      {template.occupation && (
                        <div className="text-xs text-muted-foreground">{template.occupation}</div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{template.items.length} items</span>
                  </div>
                </Link>
              ))}
              {organization.walletTemplates.length === 0 && (
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
              Compliance Wallet Templates are occupation-based templates that define which compliance items are required
              for candidates in specific occupations (e.g., RN, LPN, CNA).
            </p>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., RN Core Requirements"
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateTemplate()
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Occupation</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              >
                <option value="">Select occupation (optional)</option>
                {occupations.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
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
