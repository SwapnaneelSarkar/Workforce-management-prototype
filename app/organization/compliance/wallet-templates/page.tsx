"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, CheckCircle2 } from "lucide-react"
import { DataTable } from "@/components/system/table"
import {
  getCurrentOrganization,
  getActiveAdminWalletTemplateId,
  setActiveAdminWalletTemplateId,
} from "@/lib/organization-local-db"
import {
  getAllAdminWalletTemplates,
  getOccupationById,
  getSpecialtyById,
  getAllComplianceListItems,
  type AdminWalletTemplate,
} from "@/lib/admin-local-db"
import { useToast } from "@/components/system"

export default function WalletTemplatesPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [orgId, setOrgId] = useState<string | null>(null)
  const [templates, setTemplates] = useState<AdminWalletTemplate[]>([])
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const current = getCurrentOrganization() || "admin"
      setOrgId(current)
      
      // Load admin wallet templates
      const adminTemplates = getAllAdminWalletTemplates()
      setTemplates(adminTemplates)
      
      // Load active template ID
      const activeId = getActiveAdminWalletTemplateId()
      setActiveTemplateId(activeId)
    } catch (error) {
      console.warn("Failed to load wallet templates", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates
    const query = searchQuery.toLowerCase()
    return templates.filter((template) => {
      const occupation = template.occupationId ? getOccupationById(template.occupationId) : null
      const specialty = template.specialtyId ? getSpecialtyById(template.specialtyId) : null
      return (
        template.name.toLowerCase().includes(query) ||
        occupation?.name.toLowerCase().includes(query) ||
        occupation?.code.toLowerCase().includes(query) ||
        specialty?.name.toLowerCase().includes(query) ||
        specialty?.code.toLowerCase().includes(query)
      )
    })
  }, [templates, searchQuery])

  const handleApplyTemplate = (templateId: string) => {
    setActiveAdminWalletTemplateId(templateId)
    setActiveTemplateId(templateId)
    pushToast({
      title: "Success",
      description: "Compliance template applied successfully",
      type: "success",
    })
  }

  const activeTemplate = activeTemplateId
    ? templates.find((t) => t.id === activeTemplateId)
    : null

  const allListItems = getAllComplianceListItems()

  const getRequiredCount = (template: AdminWalletTemplate) => {
    const templateItems = allListItems.filter((item) =>
      template.listItemIds.includes(item.id)
    )
    return templateItems.filter((item) => item.isRequired).length
  }

  const columns = [
    {
      id: "name",
      label: "Template Name",
      sortable: true,
      render: (template: AdminWalletTemplate) => (
        <div>
          <p className="font-medium text-foreground">{template.name}</p>
        </div>
      ),
    },
    {
      id: "occupation",
      label: "Occupation",
      sortable: true,
      render: (template: AdminWalletTemplate) => {
        if (!template.occupationId) return <span className="text-sm text-muted-foreground">—</span>
        const occ = getOccupationById(template.occupationId)
        return <span className="text-sm text-foreground">{occ?.name || template.occupationCode || "—"}</span>
      },
    },
    {
      id: "specialty",
      label: "Specialty",
      sortable: true,
      render: (template: AdminWalletTemplate) => {
        if (!template.specialtyId) return <span className="text-sm text-muted-foreground">—</span>
        const spec = getSpecialtyById(template.specialtyId)
        return <span className="text-sm text-foreground">{spec?.name || template.specialtyCode || "—"}</span>
      },
    },
    {
      id: "totalItems",
      label: "Total Items",
      sortable: true,
      render: (template: AdminWalletTemplate) => (
        <span className="text-sm text-foreground">{template.listItemIds.length} items</span>
      ),
    },
    {
      id: "requiredItems",
      label: "Required at Submission",
      sortable: true,
      render: (template: AdminWalletTemplate) => {
        const requiredCount = getRequiredCount(template)
        return (
          <span className="text-sm text-foreground">{requiredCount} required</span>
        )
      },
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (template: AdminWalletTemplate) => {
        const isActive = activeTemplateId === template.id
        return (
          <StatusChip
            status={isActive ? "success" : "warning"}
            label={isActive ? "Active" : "Inactive"}
          />
        )
      },
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      render: (template: AdminWalletTemplate) => {
        const isActive = activeTemplateId === template.id
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/organization/compliance/wallet-templates/${template.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
            {!isActive && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleApplyTemplate(template.id)}
                className="ph5-button-primary"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Apply Template
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Compliance Wallet Templates"
        subtitle="Compliance templates are created by Admin and define required documents for candidates."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Admin", href: "/organization/admin" },
          { label: "Compliance Wallet" },
        ]}
      />

      {loading ? (
        <Card>
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Template Banner */}
          {activeTemplate && (
            <Card className="bg-primary/5 border-primary/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Active Compliance Template
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{activeTemplate.name}</span> is currently applied to your requisitions and jobs.
                  </p>
                </div>
                <StatusChip status="success" label="Active" />
              </div>
            </Card>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search templates by name, occupation, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Templates Table */}
          <Card>
            <DataTable
              columns={columns}
              rows={filteredTemplates}
              rowKey={(row) => row.id}
              emptyState={
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No compliance templates found.
                  </p>
                </div>
              }
            />
          </Card>

          {/* Note */}
          <Card className="bg-muted/30">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Compliance templates are managed by Admin and cannot be edited by the organization. You can only select and apply templates to your requisitions and jobs.
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
