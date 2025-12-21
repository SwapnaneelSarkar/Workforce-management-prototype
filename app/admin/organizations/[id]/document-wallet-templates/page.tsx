"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { Trash2, Edit, Eye, Plus } from "lucide-react"
import { useToast } from "@/components/system"
import {
  getAllAdminWalletTemplates,
  deleteAdminWalletTemplate,
  getAllComplianceListItems,
  getOccupationByCode,
  getSpecialtyById,
  getOrganizationById,
  type AdminWalletTemplate,
} from "@/lib/admin-local-db"

export default function OrganizationDocumentWalletTemplatesPage() {
  const params = useParams()
  const router = useRouter()
  const { pushToast } = useToast()
  const organizationId = params.id as string
  const [templates, setTemplates] = useState<AdminWalletTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [organizationId])

  const loadData = () => {
    setLoading(true)
    const org = getOrganizationById(organizationId)
    setOrganization(org)
    const allTemplates = getAllAdminWalletTemplates()
    setTemplates(allTemplates)
    setLoading(false)
  }

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = deleteAdminWalletTemplate(id)
      if (success) {
        pushToast({ title: "Success", description: "Wallet template deleted successfully." })
        loadData()
      } else {
        pushToast({ title: "Error", description: "Failed to delete wallet template." })
      }
    }
  }

  const getTemplateDisplayInfo = (template: AdminWalletTemplate) => {
    const occupation = template.occupationCode
      ? getOccupationByCode(template.occupationCode)
      : null
    const specialty = template.specialtyId
      ? getSpecialtyById(template.specialtyId)
      : null
    
    const allListItems = getAllComplianceListItems()
    const itemCount = template.listItemIds.filter((id) => {
      const item = allListItems.find((li) => li.id === id)
      return item && item.isActive
    }).length

    return {
      occupationName: occupation?.name || template.occupationCode || "—",
      specialtyName: specialty?.name || template.specialtyCode || "—",
      itemCount,
    }
  }

  return (
    <>
      <Header
        title="Document Wallet Templates"
        subtitle="Manage universal job title templates that can be reused by any organization."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organization?.name || "Organization", href: `/admin/organizations/${organizationId}` },
          { label: "Document Wallet Templates" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Compliance Wallet Templates</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {templates.length} {templates.length === 1 ? "template" : "templates"}
                </p>
              </div>
              <Link href="/admin/compliance/templates/create" className="ph5-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Now that list items have been created a wallet template can be created.
                </p>
                <Link href="/admin/compliance/templates/create" className="ph5-button-primary inline-flex">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Template Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Occupation</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Specialty</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Number of Items</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((template) => {
                      const info = getTemplateDisplayInfo(template)
                      return (
                        <tr
                          key={template.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/admin/compliance/templates/${template.id}`)}
                        >
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-foreground">{template.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">{info.occupationName}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">{info.specialtyName}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">{info.itemCount}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/admin/compliance/templates/${template.id}`}
                                className="p-2 rounded-md hover:bg-muted transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </Link>
                              <Link
                                href={`/admin/compliance/templates/${template.id}`}
                                className="p-2 rounded-md hover:bg-muted transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Edit className="h-4 w-4 text-muted-foreground" />
                              </Link>
                              <button
                                type="button"
                                className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                                onClick={(e) => handleDelete(template.id, template.name, e)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </section>
    </>
  )
}
