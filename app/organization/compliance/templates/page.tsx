"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Eye, Edit, Trash2 } from "lucide-react"
import {
  getCurrentOrganization,
  getRequisitionTemplatesByOrganization,
  getLegacyTemplatesByOrganization,
  getWalletTemplatesByOrganization,
  getJobsByOrganization,
  deleteRequisitionTemplate,
  deleteLegacyTemplate,
  deleteWalletTemplate,
} from "@/lib/organization-local-db"
import {
  getAllAdminWalletTemplates,
} from "@/lib/admin-local-db"
import { useToast } from "@/components/system"
import Link from "next/link"

type TemplateDisplay = {
  id: string
  name: string
  type: "Requisition Compliance" | "Requisition" | "Legacy"
  linkedJobs: number
  lastUpdated: string
  isAdminTemplate?: boolean
}

export default function ComplianceTemplatesPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [activeTab, setActiveTab] = useState<"all" | "requisition-compliance" | "requisition" | "legacy">("all")
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<TemplateDisplay[]>([])

  useEffect(() => {
    loadTemplates()
    // Create mock templates if none exist
    createMockTemplatesIfNeeded()
  }, [])

  const createMockTemplatesIfNeeded = () => {
    if (typeof window === "undefined") return

    try {
      const organizationId = getCurrentOrganization() || "admin"
      
      // Check if we need to create mock data
      const requisitionTemplates = getRequisitionTemplatesByOrganization(organizationId)
      const legacyTemplates = getLegacyTemplatesByOrganization(organizationId)
      const walletTemplates = getWalletTemplatesByOrganization(organizationId)

      // If we have templates, don't create mock data
      if (requisitionTemplates.length > 0 || legacyTemplates.length > 0 || walletTemplates.length > 0) {
        return
      }

      // The default templates should already be created by the system
      // This is just a safety check
      console.log("Templates should be auto-created on first load")
    } catch (error) {
      console.warn("Failed to check/create mock templates:", error)
    }
  }

  const loadTemplates = () => {
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    try {
      const organizationId = getCurrentOrganization() || "admin"
      const jobs = getJobsByOrganization(organizationId)

      // Get all template types
      const requisitionTemplates = getRequisitionTemplatesByOrganization(organizationId)
      const legacyTemplates = getLegacyTemplatesByOrganization(organizationId)
      const walletTemplates = getWalletTemplatesByOrganization(organizationId)
      const adminWalletTemplates = getAllAdminWalletTemplates()

      // Count linked jobs for each template
      const countLinkedJobs = (templateId: string): number => {
        return jobs.filter((job) => {
          // Jobs link to templates via complianceTemplateId
          return job.complianceTemplateId === templateId
        }).length
      }

      // Convert requisition templates
      const requisitionDisplay: TemplateDisplay[] = requisitionTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        type: "Requisition",
        linkedJobs: countLinkedJobs(template.id),
        lastUpdated: template.updatedAt,
        isAdminTemplate: false,
      }))

      // Convert legacy templates
      const legacyDisplay: TemplateDisplay[] = legacyTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        type: "Legacy",
        linkedJobs: countLinkedJobs(template.id),
        lastUpdated: template.updatedAt,
        isAdminTemplate: false,
      }))

      // Convert wallet templates (Requisition Compliance - org created)
      const walletDisplay: TemplateDisplay[] = walletTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        type: "Requisition Compliance",
        linkedJobs: countLinkedJobs(template.id),
        lastUpdated: template.updatedAt,
        isAdminTemplate: false,
      }))

      // Convert admin wallet templates (Requisition Compliance - from admin)
      const adminWalletDisplay: TemplateDisplay[] = adminWalletTemplates.map((template) => ({
        id: template.id,
        name: template.name,
        type: "Requisition Compliance",
        linkedJobs: countLinkedJobs(template.id),
        lastUpdated: template.updatedAt,
        isAdminTemplate: true,
      }))

      // Combine all templates
      const allTemplates = [
        ...requisitionDisplay,
        ...legacyDisplay,
        ...walletDisplay,
        ...adminWalletDisplay,
      ]

      setTemplates(allTemplates)
    } catch (error) {
      console.error("Failed to load templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = useMemo(() => {
    if (activeTab === "all") {
      return templates
    } else if (activeTab === "requisition-compliance") {
      return templates.filter((t) => t.type === "Requisition Compliance")
    } else if (activeTab === "requisition") {
      return templates.filter((t) => t.type === "Requisition")
    } else {
      return templates.filter((t) => t.type === "Legacy")
    }
  }, [templates, activeTab])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return "—"
    }
  }

  const handleDelete = (template: TemplateDisplay) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return
    }

    try {
      let success = false
      if (template.type === "Requisition") {
        success = deleteRequisitionTemplate(template.id)
      } else if (template.type === "Legacy") {
        success = deleteLegacyTemplate(template.id)
      } else if (template.type === "Requisition Compliance" && !template.isAdminTemplate) {
        success = deleteWalletTemplate(template.id)
      }

      if (success) {
        pushToast({
          title: "Success",
          description: "Template deleted successfully.",
          type: "success",
        })
        loadTemplates()
      } else {
        pushToast({
          title: "Error",
          description: template.isAdminTemplate
            ? "Admin templates cannot be deleted from the organization portal."
            : "Failed to delete template.",
          type: "error",
        })
      }
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to delete template.",
        type: "error",
      })
    }
  }

  const getTemplateUrl = (template: TemplateDisplay) => {
    if (template.type === "Requisition") {
      return `/organization/compliance/requisition-templates/${template.id}`
    } else if (template.type === "Legacy") {
      return `/organization/compliance/templates/${template.id}`
    } else if (template.type === "Requisition Compliance") {
      if (template.isAdminTemplate) {
        return `/admin/compliance/templates/${template.id}`
      }
      return `/organization/compliance/wallet-templates/${template.id}`
    }
    return "#"
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Compliance Templates"
        subtitle="Manage job and compliance templates"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance", href: "/organization/compliance" },
          { label: "Templates" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="all">All Templates ({templates.length})</TabsTrigger>
          <TabsTrigger value="requisition-compliance">
            Requisition Compliance ({templates.filter((t) => t.type === "Requisition Compliance").length})
          </TabsTrigger>
          <TabsTrigger value="requisition">
            Requisition ({templates.filter((t) => t.type === "Requisition").length})
          </TabsTrigger>
          <TabsTrigger value="legacy">
            Legacy ({templates.filter((t) => t.type === "Legacy").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => router.push("/organization/compliance/wallet-templates/create")}
            className="ph5-button-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Requisition Compliance
          </Button>
          <Button
            onClick={() => router.push("/organization/compliance/requisition-templates/create")}
            className="ph5-button-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Requisition Template
          </Button>
          <Button
            onClick={() => router.push("/organization/compliance/templates/create")}
            className="ph5-button-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Legacy Template
          </Button>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Requisition Compliance:</strong> What documents do we need?</p>
          <p><strong>Requisition Template:</strong> Full job template + workflow + doc requirements</p>
          <p><strong>Legacy Template:</strong> Basic old-style job template (very simple)</p>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No templates found.</p>
            <Button
              onClick={() =>
                router.push(
                  activeTab === "requisition-compliance"
                    ? "/organization/compliance/wallet-templates/create"
                    : activeTab === "requisition"
                    ? "/organization/compliance/requisition-templates/create"
                    : "/organization/compliance/templates/create",
                )
              }
              className="ph5-button-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Linked Jobs</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs rounded bg-muted text-foreground">
                      {template.type}
                    </span>
                  </TableCell>
                  <TableCell>{template.linkedJobs} jobs</TableCell>
                  <TableCell>{formatDate(template.lastUpdated)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link href={getTemplateUrl(template)}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {!template.isAdminTemplate && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`${getTemplateUrl(template)}?edit=true`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(template)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
