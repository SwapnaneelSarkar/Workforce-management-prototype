"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Trash2, Edit, Plus } from "lucide-react"
import { useToast } from "@/components/system"

export default function AdminComplianceTemplatesPage() {
  const router = useRouter()
  const { organization, actions } = useDemoData()
  const { pushToast } = useToast()
  const [templates, setTemplates] = useState(organization.requisitionTemplates)

  useEffect(() => {
    setTemplates(organization.requisitionTemplates)
  }, [organization.requisitionTemplates])

  // Force initialize templates if none exist
  const handleInitializeTemplates = () => {
    if (typeof window !== "undefined") {
      try {
        const { readOrganizationLocalDb, persistOrganizationLocalDb, createDefaultRequisitionTemplates } = require("@/lib/organization-local-db")
        const state = readOrganizationLocalDb()
        const adminTemplates = Object.values(state.requisitionTemplates || {}).filter(
          (t: any) => t && t.organizationId === "admin"
        )
        
        if (adminTemplates.length === 0) {
          const defaultTemplates = createDefaultRequisitionTemplates("admin")
          const updatedState = {
            ...state,
            requisitionTemplates: { ...state.requisitionTemplates, ...defaultTemplates },
          }
          persistOrganizationLocalDb(updatedState)
          pushToast({ 
            title: "Templates Initialized", 
            description: "Default requisition templates have been created. Please refresh the page.", 
            type: "success" 
          })
          // Refresh page after a short delay
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          pushToast({ 
            title: "Templates Already Exist", 
            description: `${adminTemplates.length} templates found.`, 
            type: "info" 
          })
        }
      } catch (error) {
        console.error("Error initializing templates:", error)
        pushToast({ title: "Error", description: "Failed to initialize templates.", type: "error" })
      }
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this template?")) {
      actions.deleteRequisitionTemplate(id)
      pushToast({ title: "Success", description: "Template deleted successfully." })
    }
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Compliance Templates"
        subtitle="Manage universal requisition templates that can be reused by any organization."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Compliance Templates" },
        ]}
      />

      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Requisition Templates</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {templates.length} {templates.length === 1 ? "template" : "templates"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {templates.length === 0 && (
                <button
                  onClick={handleInitializeTemplates}
                  className="ph5-button-secondary"
                  type="button"
                >
                  Initialize Mock Templates
                </button>
              )}
              <Link href="/admin/compliance/templates/create" className="ph5-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Link>
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground mb-4">No templates yet. Create one to get started.</p>
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Number of Items</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr
                      key={template.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/compliance/templates/${template.id}`)}
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-foreground">{template.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{template.occupation || "—"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{template.department || "—"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{template.items.length}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
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
                            onClick={(e) => handleDelete(template.id, e)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
