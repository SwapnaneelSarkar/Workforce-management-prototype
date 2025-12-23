"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { DataTable } from "@/components/system/table"
import {
  getAdminWalletTemplateById,
  getComplianceListItemById,
  getAllComplianceListItems,
  getOccupationById,
  getSpecialtyById,
  type AdminWalletTemplate,
  type ComplianceListItem,
} from "@/lib/admin-local-db"

export default function WalletTemplateDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const templateId = params?.id

  const [template, setTemplate] = useState<AdminWalletTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [complianceItems, setComplianceItems] = useState<ComplianceListItem[]>([])

  useEffect(() => {
    if (typeof window === "undefined" || !templateId) return
    
    try {
      const tmpl = getAdminWalletTemplateById(templateId)
      if (!tmpl) {
        console.warn("Template not found:", templateId)
        return
      }
      
      setTemplate(tmpl)
      
      // Load all compliance items for this template
      const allItems = getAllComplianceListItems()
      const templateItems = tmpl.listItemIds
        .map((id) => allItems.find((item) => item.id === id))
        .filter((item): item is ComplianceListItem => item !== undefined)
      
      setComplianceItems(templateItems)
    } catch (error) {
      console.error("Failed to load template:", error)
    } finally {
      setLoading(false)
    }
  }, [templateId])

  const occupation = template?.occupationId ? getOccupationById(template.occupationId) : null
  const specialty = template?.specialtyId ? getSpecialtyById(template.specialtyId) : null

  const requiredCount = useMemo(() => {
    return complianceItems.filter((item) => {
      // Check if item has requiredAtSubmission field (if we add it later)
      // For now, we'll use a heuristic: items that are typically required
      const requiredCategories = ["Licenses", "Certifications"]
      const requiredNames = [
        "Background Check",
        "Drug Screening",
        "TB Test",
        "Hepatitis B Vaccination",
        "Physical Exam",
        "RN License",
        "LPN License",
        "BLS Certification",
        "ACLS Certification",
      ]
      return (
        requiredCategories.some((cat) => item.category.includes(cat)) ||
        requiredNames.some((name) => item.name.includes(name))
      )
    }).length
  }, [complianceItems])

  const expirableCount = useMemo(() => {
    return complianceItems.filter(
      (item) => item.expirationType !== "Non-Expirable"
    ).length
  }, [complianceItems])

  const formatExpirationType = (item: ComplianceListItem) => {
    if (item.expirationType === "Non-Expirable") {
      return "—"
    }
    if (item.expirationType === "Expiration Date") {
      return "Yes"
    }
    if (item.expirationType === "Expiration Rule") {
      const value = item.expirationRuleValue || 0
      const interval = item.expirationRuleInterval || "Days"
      return `${value} ${interval}`
    }
    return "Yes"
  }

  const isItemRequired = (item: ComplianceListItem): boolean => {
    // Heuristic to determine if item is required
    const requiredCategories = ["Licenses", "Certifications"]
    const requiredNames = [
      "Background Check",
      "Drug Screening",
      "TB Test",
      "Hepatitis B Vaccination",
      "Physical Exam",
      "RN License",
      "LPN License",
      "BLS Certification",
      "ACLS Certification",
    ]
    return (
      requiredCategories.some((cat) => item.category.includes(cat)) ||
      requiredNames.some((name) => item.name.includes(name))
    )
  }

  const columns = [
    {
      id: "name",
      label: "Item Name",
      sortable: true,
      render: (item: ComplianceListItem) => (
        <span className="text-sm font-medium text-foreground">{item.name}</span>
      ),
    },
    {
      id: "category",
      label: "Category",
      sortable: true,
      render: (item: ComplianceListItem) => (
        <span className="text-sm text-foreground">{item.category}</span>
      ),
    },
    {
      id: "expiration",
      label: "Expiration Required",
      sortable: true,
      render: (item: ComplianceListItem) => (
        <span className="text-sm text-foreground">{formatExpirationType(item)}</span>
      ),
    },
    {
      id: "required",
      label: "Required at Submission",
      sortable: true,
      render: (item: ComplianceListItem) => {
        const required = isItemRequired(item)
        return (
          <span className="text-sm font-medium text-foreground">
            {required ? "Required" : "Optional"}
          </span>
        )
      },
    },
    {
      id: "display",
      label: "Display to Candidate",
      sortable: true,
      render: (item: ComplianceListItem) => (
        <div className="flex items-center gap-2">
          {item.displayToCandidate ? (
            <>
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Visible</span>
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Hidden</span>
            </>
          )}
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <Card>
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        </Card>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="space-y-6 p-8">
        <Header
          title="Template Not Found"
          subtitle="The requested compliance template could not be found."
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Admin", href: "/organization/admin" },
            { label: "Compliance Wallet", href: "/organization/compliance/wallet-templates" },
            { label: "Template Detail" },
          ]}
        />
        <Card>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                This template may have been deleted or is not available.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/organization/compliance/wallet-templates")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/organization/compliance/wallet-templates")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Button>
      </div>

      <Header
        title={template.name}
        subtitle={
          `${occupation?.name || template.occupationCode || "N/A"}${specialty ? ` • ${specialty.name || specialty.code}` : ""}`
        }
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Admin", href: "/organization/admin" },
          { label: "Compliance Wallet", href: "/organization/compliance/wallet-templates" },
          { label: template.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Summary */}
          <Card title="Template Summary">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                    Occupation
                  </p>
                  <p className="text-sm text-foreground">
                    {occupation?.name || template.occupationCode || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                    Specialty
                  </p>
                  <p className="text-sm text-foreground">
                    {specialty?.name || specialty?.code || "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                    Total Compliance Items
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {complianceItems.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                    Required at Submission
                  </p>
                  <p className="text-sm font-semibold text-foreground">{requiredCount}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm text-foreground">
                  Compliance requirements for {occupation?.name || template.occupationCode || "this role"}
                  {specialty && ` in ${specialty.name || specialty.code}`} departments.
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Compliance items are managed by Admin and cannot be edited by the organization.
                </p>
              </div>
            </div>
          </Card>

          {/* Compliance Items Table */}
          <Card
            title={`Compliance Items (${complianceItems.length})`}
          >
            <DataTable
              columns={columns}
              rows={complianceItems}
              rowKey={(row) => row.id}
              emptyState={
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No compliance items found in this template.
                  </p>
                </div>
              }
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Summary">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                  Total Items
                </p>
                <p className="text-2xl font-bold text-foreground">{complianceItems.length}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                  Required at Submission
                </p>
                <p className="text-2xl font-bold text-foreground">{requiredCount}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                  Expirable Items
                </p>
                <p className="text-2xl font-bold text-foreground">{expirableCount}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-2">
              <StatusChip
                status={template.isActive ? "success" : "warning"}
                label={template.isActive ? "Active" : "Inactive"}
              />
              <p className="text-xs text-muted-foreground">
                Template status is managed by Admin.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
