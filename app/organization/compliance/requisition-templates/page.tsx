"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2, MoreVertical } from "lucide-react"
import { DataTable } from "@/components/system/table"
import {
  getCurrentOrganization,
  getRequisitionTemplatesByOrganization,
  deleteRequisitionTemplate,
  type OrganizationLocalDbRequisitionTemplate,
} from "@/lib/organization-local-db"
import { useToast } from "@/components/system"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getOccupationByCode } from "@/lib/admin-local-db"

export default function RequisitionTemplatesPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [orgId, setOrgId] = useState<string | null>(null)
  const [templates, setTemplates] = useState<OrganizationLocalDbRequisitionTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const current = getCurrentOrganization() || "admin"
      setOrgId(current)
      const orgTemplates = getRequisitionTemplatesByOrganization(current)
      setTemplates(orgTemplates)
    } catch (error) {
      console.warn("Failed to load requisition templates", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      template.name.toLowerCase().includes(query) ||
      template.occupation?.toLowerCase().includes(query) ||
      template.specialty?.toLowerCase().includes(query) ||
      template.department?.toLowerCase().includes(query)
    )
  })

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this requisition template?")) {
      const deleted = deleteRequisitionTemplate(id)
      if (deleted) {
        setTemplates(templates.filter((t) => t.id !== id))
        pushToast({
          title: "Success",
          description: "Requisition template deleted successfully",
          type: "success",
        })
      } else {
        pushToast({
          title: "Error",
          description: "Failed to delete requisition template",
          type: "error",
        })
      }
    }
  }

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case "long-term":
        return "Long-term Order/Assignment"
      case "permanent":
        return "Permanent Job"
      case "per-diem":
        return "Per Diem Job"
      default:
        return "N/A"
    }
  }

  const columns = [
    {
      id: "name",
      label: "Template Name",
      sortable: true,
      render: (template: OrganizationLocalDbRequisitionTemplate) => (
        <div>
          <p className="font-medium text-foreground">{template.name}</p>
          <p className="text-xs text-muted-foreground">{getTypeLabel(template.type)}</p>
        </div>
      ),
    },
    {
      id: "occupation",
      label: "Occupation",
      sortable: true,
      render: (template: OrganizationLocalDbRequisitionTemplate) => {
        if (!template.occupation) return <span className="text-sm text-muted-foreground">—</span>
        const occ = getOccupationByCode(template.occupation)
        return <span className="text-sm text-foreground">{occ?.name || template.occupation}</span>
      },
    },
    {
      id: "specialty",
      label: "Specialty",
      sortable: true,
      render: (template: OrganizationLocalDbRequisitionTemplate) => (
        <span className="text-sm text-muted-foreground">{template.specialty || "—"}</span>
      ),
    },
    {
      id: "department",
      label: "Department",
      sortable: true,
      render: (template: OrganizationLocalDbRequisitionTemplate) => (
        <span className="text-sm text-muted-foreground">{template.department || "—"}</span>
      ),
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (template: OrganizationLocalDbRequisitionTemplate) => (
        <StatusChip
          status={template.status === "Active" ? "success" : "warning"}
          label={template.status || "Draft"}
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      render: (template: OrganizationLocalDbRequisitionTemplate) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="backdrop-blur-sm bg-card/95">
            <DropdownMenuItem onClick={() => router.push(`/organization/compliance/requisition-templates/${template.id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(template.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Requisition Templates"
        subtitle="Create and manage requisition templates for job postings"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Admin", href: "/organization/admin" },
          { label: "Requisition Templates" },
        ]}
        actions={[
          {
            id: "add-template",
            label: "Add Template",
            icon: <Plus className="h-4 w-4" />,
            variant: "primary",
            onClick: () => router.push("/organization/compliance/requisition-templates/create"),
          },
        ]}
      />

      {loading ? (
        <Card>
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search templates..."
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
                  <p className="text-sm text-muted-foreground mb-4">No requisition templates found.</p>
                  <Button
                    onClick={() => router.push("/organization/compliance/requisition-templates/create")}
                    className="ph5-button-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Template
                  </Button>
                </div>
              }
            />
          </Card>
        </div>
      )}
    </div>
  )
}
