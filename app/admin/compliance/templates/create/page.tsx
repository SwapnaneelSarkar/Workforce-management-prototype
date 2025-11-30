"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { getAllDepartments } from "@/lib/organizations-store"
import { useToast } from "@/components/system"

export default function CreateRequisitionTemplatePage() {
  const router = useRouter()
  const { actions } = useDemoData()
  const { pushToast } = useToast()
  const [templateName, setTemplateName] = useState("")
  const [department, setDepartment] = useState<string>("")
  const [departments, setDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const allDepartments = getAllDepartments()
    setDepartments(allDepartments)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!templateName.trim()) {
      pushToast({ title: "Validation Error", description: "Template name is required." })
      return
    }

    if (!department) {
      pushToast({ title: "Validation Error", description: "Department is required." })
      return
    }

    setLoading(true)
    try {
      const template = await actions.createRequisitionTemplate({
        name: templateName.trim(),
        department: department,
      })
      pushToast({ title: "Success", description: "Template created successfully." })
      router.push(`/admin/compliance/templates/${template.id}`)
    } catch (error) {
      pushToast({ title: "Error", description: "Failed to create template. Please try again." })
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Create Requisition Template"
        subtitle="Create a new universal compliance template for job requisitions."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Compliance Templates", href: "/admin/compliance/templates" },
          { label: "Create Template" },
        ]}
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="templateName" className="text-sm font-semibold text-foreground">
              Template Name
            </Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., ICU Core Requirements"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-semibold text-foreground">
              Department <span className="text-destructive">*</span>
            </Label>
            {departments.length === 0 ? (
              <div className="space-y-2">
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Enter department name"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  No departments found. You can add departments in Admin → Locations.
                </p>
              </div>
            ) : (
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              className="ph5-button-secondary"
              onClick={() => router.push("/admin/compliance/templates")}
            >
              Cancel
            </button>
            <button type="submit" className="ph5-button-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Template"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
