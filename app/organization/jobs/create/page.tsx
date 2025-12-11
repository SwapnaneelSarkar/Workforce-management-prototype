"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { getActiveOccupations } from "@/lib/admin-local-db"
import type { ComplianceItem } from "@/lib/compliance-templates-store"

type JobDraft = {
  title: string
  location: string
  payRangeMin: string
  payRangeMax: string
  description: string
  requisitionTemplateId: string
  occupation: string
  department: string
  unit: string
  shift: string
  hours: string
}

type FieldErrors = {
  title?: string
  location?: string
  payRangeMin?: string
  payRangeMax?: string
  requisitionTemplateId?: string
  occupation?: string
  department?: string
  unit?: string
  shift?: string
  hours?: string
}

const initialDraft: JobDraft = {
  title: "",
  location: "",
  payRangeMin: "",
  payRangeMax: "",
  description: "",
  requisitionTemplateId: "",
  occupation: "",
  department: "",
  unit: "",
  shift: "",
  hours: "",
}

export default function CreateJobPage() {
  const router = useRouter()
  const { actions, organization } = useDemoData()
  const [draft, setDraft] = useState<JobDraft>(initialDraft)
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [occupationOptions, setOccupationOptions] = useState<Array<{ label: string; value: string }>>([
    { label: "Select occupation", value: "" },
  ])
  const [availableTemplates, setAvailableTemplates] = useState<Array<{
    id: string
    name: string
    description?: string
    itemCount: number
    type: 'legacy' | 'requisition'
  }>>([])

  // Get selected template - load directly from DB to ensure we get the right template
  // Check both legacy templates and requisition templates
  const selectedTemplate = useMemo(() => {
    if (!draft.requisitionTemplateId) return null
    
    // Try to get from DB first (check both legacy and requisition templates)
    if (typeof window !== "undefined") {
      try {
        const { 
          getCurrentOrganization, 
          getRequisitionTemplatesByOrganization,
          getLegacyTemplatesByOrganization 
        } = require("@/lib/organization-local-db")
        const currentOrgId = getCurrentOrganization() || "admin"
        
        // Check legacy templates first
        const legacyTemplates = getLegacyTemplatesByOrganization(currentOrgId)
        const legacyTemplate = legacyTemplates.find((t) => t.id === draft.requisitionTemplateId)
        if (legacyTemplate && legacyTemplate.organizationId === currentOrgId) {
          return {
            id: legacyTemplate.id,
            name: legacyTemplate.name,
            department: legacyTemplate.description,
            occupation: undefined,
            items: legacyTemplate.items,
          }
        }
        
        // Check requisition templates - convert listItemIds to ComplianceItem[]
        const { getComplianceListItemById } = require("@/lib/admin-local-db")
        const reqTemplates = getRequisitionTemplatesByOrganization(currentOrgId)
        const reqTemplate = reqTemplates.find((t) => t.id === draft.requisitionTemplateId)
        if (reqTemplate && reqTemplate.organizationId === currentOrgId) {
          // Convert listItemIds to ComplianceItem[] for job creation
          const complianceItems = reqTemplate.listItemIds
            .map((listItemId) => {
              try {
                const listItem = getComplianceListItemById(listItemId)
                if (!listItem || !listItem.isActive) return null
                
                // Convert ComplianceListItem to ComplianceItem format
                let type: "License" | "Certification" | "Background" | "Training" | "Other" = "Other"
                if (listItem.category === "Licenses") {
                  type = "License"
                } else if (listItem.category === "Certifications") {
                  type = "Certification"
                } else if (listItem.category === "Background and Identification") {
                  type = "Background"
                } else if (listItem.category === "Education and Assessments") {
                  type = "Training"
                }
                
                let expirationType: "None" | "Fixed Date" | "Recurring" = "None"
                if (listItem.expirationType === "Expiration Date") {
                  expirationType = "Fixed Date"
                } else if (listItem.expirationType === "Expiration Rule") {
                  expirationType = "Recurring"
                }
                
                return {
                  id: listItem.id,
                  name: listItem.name,
                  type,
                  expirationType,
                  requiredAtSubmission: false,
                }
              } catch (error) {
                console.warn(`Failed to convert compliance list item ${listItemId}`, error)
                return null
              }
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
          
          return {
            id: reqTemplate.id,
            name: reqTemplate.name,
            department: reqTemplate.department,
            occupation: reqTemplate.occupation,
            items: complianceItems,
          }
        }
      } catch (error) {
        console.warn("Failed to load template from DB", error)
      }
    }
    
    // Fallback: try compliance templates store
    try {
      const { useComplianceTemplatesStore } = require("@/lib/compliance-templates-store")
      const legacyTemplate = useComplianceTemplatesStore.getState().templates.find(
        (t) => t.id === draft.requisitionTemplateId
      )
      if (legacyTemplate) {
        return {
          id: legacyTemplate.id,
          name: legacyTemplate.name,
          department: legacyTemplate.description,
          occupation: undefined,
          items: legacyTemplate.items,
        }
      }
    } catch (error) {
      // Continue to next fallback
    }
    
    // Fallback to provider templates - convert listItemIds to ComplianceItem[]
    const reqTemplate = organization.requisitionTemplates.find((t) => t.id === draft.requisitionTemplateId)
    if (reqTemplate && typeof window !== "undefined") {
      try {
        const { getComplianceListItemById } = require("@/lib/admin-local-db")
        const complianceItems = reqTemplate.listItemIds
          .map((listItemId) => {
            try {
              const listItem = getComplianceListItemById(listItemId)
              if (!listItem || !listItem.isActive) return null
              
              let type: "License" | "Certification" | "Background" | "Training" | "Other" = "Other"
              if (listItem.category === "Licenses") {
                type = "License"
              } else if (listItem.category === "Certifications") {
                type = "Certification"
              } else if (listItem.category === "Background and Identification") {
                type = "Background"
              } else if (listItem.category === "Education and Assessments") {
                type = "Training"
              }
              
              let expirationType: "None" | "Fixed Date" | "Recurring" = "None"
              if (listItem.expirationType === "Expiration Date") {
                expirationType = "Fixed Date"
              } else if (listItem.expirationType === "Expiration Rule") {
                expirationType = "Recurring"
              }
              
              return {
                id: listItem.id,
                name: listItem.name,
                type,
                expirationType,
                requiredAtSubmission: false,
              }
            } catch (error) {
              return null
            }
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
        
        return {
          ...reqTemplate,
          items: complianceItems,
        }
      } catch (error) {
        console.warn("Failed to convert template items", error)
      }
    }
    return reqTemplate || null
  }, [draft.requisitionTemplateId, organization.requisitionTemplates])

  // Load available templates for the current organization
  useEffect(() => {
    if (typeof window === "undefined") return
    
    const loadTemplates = () => {
      try {
        const { 
          getCurrentOrganization, 
          getRequisitionTemplatesByOrganization,
          getLegacyTemplatesByOrganization,
          setCurrentOrganization 
        } = require("@/lib/organization-local-db")
        
        let currentOrgId = getCurrentOrganization()
        
        // If no organization is set, try to get from provider or default to admin
        if (!currentOrgId) {
          // Try to get from demo data provider
          if (organization && (organization as any).id) {
            currentOrgId = (organization as any).id
            setCurrentOrganization(currentOrgId)
          } else {
            currentOrgId = "admin"
            setCurrentOrganization("admin")
          }
        }
        
        console.log("[Job Create] Loading templates for organization:", currentOrgId)
        
        // Ensure templates are created if missing
        if (currentOrgId && currentOrgId !== "admin") {
          setCurrentOrganization(currentOrgId)
        }
        
        // Get legacy templates (from /organization/compliance/templates page)
        const legacyTemplates = getLegacyTemplatesByOrganization(currentOrgId)
        console.log("[Job Create] Legacy templates:", legacyTemplates.length)
        
        // Get requisition templates (from /organization/compliance/requisition-templates page)
        const requisitionTemplates = getRequisitionTemplatesByOrganization(currentOrgId)
        console.log("[Job Create] Requisition templates:", requisitionTemplates.length, requisitionTemplates.map(t => ({
          id: t.id,
          name: t.name,
          orgId: t.organizationId,
          itemCount: t.listItemIds.length
        })))
        
        // Combine both types of templates
        const templates = [
          ...legacyTemplates.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            itemCount: t.items.length,
            type: 'legacy' as const,
          })),
          ...requisitionTemplates.map(t => ({
            id: t.id,
            name: t.name,
            description: t.department,
            itemCount: t.listItemIds.length,
            type: 'requisition' as const,
          }))
        ]
        
        // Filter to only show organization templates (not admin templates if org is not admin)
        const orgTemplates = templates.filter((template) => {
          const legacyTemplate = legacyTemplates.find(lt => lt.id === template.id)
          const reqTemplate = requisitionTemplates.find(rt => rt.id === template.id)
          const originalTemplate = legacyTemplate || reqTemplate
          
          if (!originalTemplate) return false
          
          // If current org is not "admin", never show admin templates
          if (currentOrgId !== "admin" && originalTemplate.organizationId === "admin") {
            return false
          }
          // Only show templates that match the current organization
          return originalTemplate.organizationId === currentOrgId
        })
        
        console.log("[Job Create] Filtered templates for dropdown:", orgTemplates.length)
        setAvailableTemplates(orgTemplates)
        
        // If no templates exist, log a warning
        if (orgTemplates.length === 0) {
          console.warn(`[Job Create] WARNING: No templates found for organization ${currentOrgId}.`)
          if (currentOrgId !== "admin") {
            console.warn(`[Job Create] Templates should have been created on login. Re-triggering setCurrentOrganization...`)
            setCurrentOrganization(currentOrgId)
            // Try loading again after a short delay
            setTimeout(loadTemplates, 500)
          }
        }
      } catch (error) {
        console.error("[Job Create] Error loading templates:", error)
        setAvailableTemplates([])
      }
    }
    
    loadTemplates()
    
    // Also listen for storage events to reload when templates change
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "wf_organization_local_db") {
        loadTemplates()
      }
    }
    
    window.addEventListener("storage", handleStorageChange)
    
    // Poll every 2 seconds to catch updates (as a fallback)
    const interval = setInterval(loadTemplates, 2000)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [organization])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const occupations = getActiveOccupations()
        const options = [{ label: "Select occupation", value: "" }]
        occupations.forEach((occ) => {
          options.push({ label: occ.name, value: occ.code })
        })
        setOccupationOptions(options)
      } catch (error) {
        console.warn("Failed to load occupations", error)
      }
    }
  }, [])

  const handleChange =
    (field: keyof JobDraft) =>
    (value: string) => {
      setDraft((prev) => ({ ...prev, [field]: value }))
      // Clear error for this field when user starts typing
      if (errors[field as keyof FieldErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {}

    if (!draft.title.trim()) {
      newErrors.title = "Job title is required"
    }
    if (!draft.location.trim()) {
      newErrors.location = "Location is required"
    }
    if (!draft.payRangeMin.trim()) {
      newErrors.payRangeMin = "Minimum pay is required"
    } else if (parseFloat(draft.payRangeMin) < 0) {
      newErrors.payRangeMin = "Amount cannot be negative"
    }
    if (!draft.payRangeMax.trim()) {
      newErrors.payRangeMax = "Maximum pay is required"
    } else if (parseFloat(draft.payRangeMax) < 0) {
      newErrors.payRangeMax = "Amount cannot be negative"
    }

    if (!draft.requisitionTemplateId) {
      newErrors.requisitionTemplateId = "Requisition template is required"
    }
    if (!draft.occupation.trim()) {
      newErrors.occupation = "Occupation is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (nextStatus: "Draft" | "Published") => {
    if (!validateForm()) {
      return
    }

    setSaving(nextStatus === "Draft" ? "draft" : "publish")

    const payRange = `$${draft.payRangeMin}–$${draft.payRangeMax}/hr`

    await actions.createJob({
      title: draft.title.trim(),
      location: draft.location.trim(),
      department: draft.department.trim() || "N/A",
      unit: draft.unit.trim() || "N/A",
      shift: draft.shift.trim() || "N/A",
      hours: draft.hours.trim() || "N/A",
      billRate: payRange,
      description: draft.description.trim() || "To be provided.",
      requirements: [],
      tags: [],
      status: nextStatus === "Draft" ? "Draft" : "Open",
      complianceTemplateId: draft.requisitionTemplateId,
      complianceItems: selectedTemplate?.items || [],
      occupation: draft.occupation.trim(),
    })

    setSaving(null)
    router.push("/organization/jobs")
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Create job"
        subtitle="Capture the basics and select a requisition compliance template."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Jobs", href: "/organization/jobs" },
          { label: "Create" },
        ]}
      />

      <Card>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Job title" error={errors.title}>
              <Input
                value={draft.title}
                onChange={(event) => handleChange("title")(event.target.value)}
                placeholder="ICU RN - Main Campus"
              />
            </Field>
            <Field label="Location" error={errors.location}>
              <select
                value={draft.location}
                onChange={(event) => handleChange("location")(event.target.value)}
                className="h-11 w-full rounded-[10px] border-2 border-[#E2E8F0] bg-gradient-to-b from-white to-[#fafbfc] px-4 py-2.5 text-sm text-[#2D3748] transition-all duration-200 shadow-sm hover:border-[#3182CE]/30 hover:shadow-md focus:border-[#3182CE] focus:outline-none focus:ring-4 focus:ring-[#3182CE]/20 focus:shadow-lg focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#F7F7F9] disabled:text-[#A0AEC0] disabled:opacity-60"
              >
                <option value="">Select a location</option>
                <option value="Memorial - Main Campus">Memorial - Main Campus</option>
                <option value="Memorial - Downtown">Memorial - Downtown</option>
                <option value="Memorial - Satellite Clinic">Memorial - Satellite Clinic</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Pay range (min)" error={errors.payRangeMin}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#718096] pointer-events-none">USD</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.payRangeMin}
                  onChange={(event) => {
                    const value = event.target.value
                    // Prevent negative values - allow empty string or non-negative numbers
                    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && !value.startsWith("-"))) {
                      handleChange("payRangeMin")(value)
                    }
                  }}
                  placeholder="80"
                  className="pl-16"
                />
              </div>
            </Field>
            <Field label="Pay range (max)" error={errors.payRangeMax}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#718096] pointer-events-none">USD</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.payRangeMax}
                  onChange={(event) => {
                    const value = event.target.value
                    // Prevent negative values - allow empty string or non-negative numbers
                    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && !value.startsWith("-"))) {
                      handleChange("payRangeMax")(value)
                    }
                  }}
                  placeholder="90"
                  className="pl-16"
                />
              </div>
            </Field>
          </div>

          <Field label="Job description (optional)">
            <Textarea
              value={draft.description}
              onChange={(event) => handleChange("description")(event.target.value)}
              rows={4}
              placeholder="Summary of responsibilities and expectations."
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Occupation" error={errors.occupation}>
              <select
                value={draft.occupation}
                onChange={(event) => handleChange("occupation")(event.target.value)}
                className="h-11 w-full rounded-[10px] border-2 border-[#E2E8F0] bg-gradient-to-b from-white to-[#fafbfc] px-4 py-2.5 text-sm text-[#2D3748] transition-all duration-200 shadow-sm hover:border-[#3182CE]/30 hover:shadow-md focus:border-[#3182CE] focus:outline-none focus:ring-4 focus:ring-[#3182CE]/20 focus:shadow-lg focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#F7F7F9] disabled:text-[#A0AEC0] disabled:opacity-60"
              >
                {occupationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Department" error={errors.department}>
              <Input
                value={draft.department}
                onChange={(event) => handleChange("department")(event.target.value)}
                placeholder="e.g., Emergency, ICU, Med-Surg"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Unit" error={errors.unit}>
              <Input
                value={draft.unit}
                onChange={(event) => handleChange("unit")(event.target.value)}
                placeholder="e.g., 3A, ICU-1, ER-Bay"
              />
            </Field>
            <Field label="Shift" error={errors.shift}>
              <select
                value={draft.shift}
                onChange={(event) => handleChange("shift")(event.target.value)}
                className="h-11 w-full rounded-[10px] border-2 border-[#E2E8F0] bg-gradient-to-b from-white to-[#fafbfc] px-4 py-2.5 text-sm text-[#2D3748] transition-all duration-200 shadow-sm hover:border-[#3182CE]/30 hover:shadow-md focus:border-[#3182CE] focus:outline-none focus:ring-4 focus:ring-[#3182CE]/20 focus:shadow-lg focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#F7F7F9] disabled:text-[#A0AEC0] disabled:opacity-60"
              >
                <option value="">Select shift</option>
                <option value="Day Shift">Day Shift</option>
                <option value="Night Shift">Night Shift</option>
                <option value="Evening Shift">Evening Shift</option>
                <option value="Rotational Shift">Rotational Shift</option>
                <option value="Weekend Shift">Weekend Shift</option>
                <option value="Variable Shift">Variable Shift</option>
              </select>
            </Field>
          </div>

          <Field label="Hours" error={errors.hours}>
            <Input
              value={draft.hours}
              onChange={(event) => handleChange("hours")(event.target.value)}
              placeholder="e.g., 40/week, 12-hour shifts, Part-time"
            />
          </Field>

          <Field label="Compliance Template" error={errors.requisitionTemplateId}>
            <select
              value={draft.requisitionTemplateId}
              onChange={(event) => handleChange("requisitionTemplateId")(event.target.value)}
              className="h-11 w-full rounded-[10px] border-2 border-[#E2E8F0] bg-gradient-to-b from-white to-[#fafbfc] px-4 py-2.5 text-sm text-[#2D3748] transition-all duration-200 shadow-sm hover:border-[#3182CE]/30 hover:shadow-md focus:border-[#3182CE] focus:outline-none focus:ring-4 focus:ring-[#3182CE]/20 focus:shadow-lg focus:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#F7F7F9] disabled:text-[#A0AEC0] disabled:opacity-60"
            >
              <option value="">Select a requisition template</option>
              {availableTemplates.length === 0 ? (
                <option value="" disabled>
                  {typeof window !== "undefined" ? "Loading templates..." : "No templates available"}
                </option>
              ) : (
                availableTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} {template.description ? `(${template.description})` : ""} - {template.itemCount} items
                  </option>
                ))
              )}
            </select>
            {draft.requisitionTemplateId && selectedTemplate && (
              <div className="mt-3 rounded-lg border border-border p-4 bg-muted/30">
                <p className="text-sm font-semibold text-foreground mb-2">
                  Selected Template: {selectedTemplate.name}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  This template includes {selectedTemplate.items.length} compliance requirement{selectedTemplate.items.length !== 1 ? "s" : ""}.
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedTemplate.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 bg-background"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                            {item.type}
                          </span>
                          {item.requiredAtSubmission && (
                            <span className="text-xs px-2 py-0.5 rounded bg-warning/10 text-warning">
                              Required at submission
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  <a
                    href="/organization/compliance/templates"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Manage templates
                  </a>
                </p>
              </div>
            )}
            {(() => {
              // Check if there are any templates available (both legacy and requisition)
              if (typeof window !== "undefined") {
                try {
                  const { 
                    getCurrentOrganization, 
                    getRequisitionTemplatesByOrganization,
                    getLegacyTemplatesByOrganization,
                    setCurrentOrganization 
                  } = require("@/lib/organization-local-db")
                  let currentOrgId = getCurrentOrganization()
                  if (!currentOrgId) {
                    currentOrgId = "admin"
                    setCurrentOrganization("admin")
                  }
                  
                  const legacyTemplates = getLegacyTemplatesByOrganization(currentOrgId)
                  const reqTemplates = getRequisitionTemplatesByOrganization(currentOrgId)
                  
                  const allOrgTemplates = [
                    ...legacyTemplates.filter((t) => {
                      if (currentOrgId !== "admin" && t.organizationId === "admin") return false
                      return t.organizationId === currentOrgId
                    }),
                    ...reqTemplates.filter((t) => {
                      if (currentOrgId !== "admin" && t.organizationId === "admin") return false
                      return t.organizationId === currentOrgId
                    })
                  ]
                  
                  if (allOrgTemplates.length === 0) {
                    return (
                      <div className="mt-3 rounded-lg border-2 border-dashed border-border p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          No compliance templates found for your organization.
                        </p>
                        <a
                          href="/organization/compliance/templates"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Create a compliance template first
                        </a>
                      </div>
                    )
                  }
                  return null
                } catch (error) {
                  // Fall through to check provider templates
                }
              }
              
              // Fallback check
              try {
                const { useComplianceTemplatesStore } = require("@/lib/compliance-templates-store")
                const legacyTemplates = useComplianceTemplatesStore.getState().templates
                if (legacyTemplates.length === 0 && organization.requisitionTemplates.length === 0) {
                  return (
                      <div className="mt-3 rounded-lg border-2 border-dashed border-border p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          No compliance templates found.
                        </p>
                        <a
                          href="/organization/compliance/templates"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Create a template first
                        </a>
                      </div>
                  )
                }
              } catch (error) {
                // Ignore
              }
              
              return null
            })()}
          </Field>

          <div className="flex flex-wrap gap-3 pt-4">
            <button
              type="button"
              onClick={() => handleSubmit("Draft")}
              disabled={saving !== null}
              className="ph5-button-secondary"
            >
              {saving === "draft" ? "Saving..." : "Save as draft"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("Published")}
              disabled={saving !== null}
              className="ph5-button-primary"
            >
              {saving === "publish" ? "Publishing..." : "Publish job"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

