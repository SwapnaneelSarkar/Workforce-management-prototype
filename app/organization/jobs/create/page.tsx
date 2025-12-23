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
  description: string
  requisitionTemplateId: string
  occupation: string
  specialty: string
  department: string
  unit: string
  shift: string
  hours: string
  startDate: string
  endDate: string
  lengthWeeks: string
  startTime: string
  endTime: string
  shiftHours: string
  shiftsPerWeek: string
  billRate: string
  numberOfOpenPositions: string
  interviewType: string
  hiringManager: string
}

type RequisitionType = "Long-term Order/Assignment" | "Fixed duration contract" | "Permanent Job" | "Per Diem Job"

type SelectedTemplate = {
  id: string
  name: string
  department?: string
  occupation?: string
  items: ComplianceItem[]
}

type FieldErrors = {
  title?: string
  location?: string
  billRate?: string
  requisitionTemplateId?: string
  occupation?: string
  specialty?: string
  department?: string
  unit?: string
  shift?: string
  hours?: string
  startDate?: string
  lengthWeeks?: string
  shiftsPerWeek?: string
}

const initialDraft: JobDraft = {
  title: "",
  location: "",
  description: "",
  requisitionTemplateId: "",
  occupation: "",
  specialty: "",
  department: "",
  unit: "",
  shift: "",
  hours: "",
  startDate: "",
  endDate: "",
  lengthWeeks: "",
  startTime: "",
  endTime: "",
  shiftHours: "",
  shiftsPerWeek: "",
  billRate: "",
  numberOfOpenPositions: "",
  interviewType: "Client Interview",
  hiringManager: "Admin",
}

export default function CreateJobPage() {
  const router = useRouter()
  const { actions, organization, vendor } = useDemoData()
  const [step, setStep] = useState<"type" | "template" | "details">("type")
  const [wizardStep, setWizardStep] = useState<"job_details" | "submission_settings" | "publish_settings" | "review_confirm">("job_details")
  const [selectedType, setSelectedType] = useState<RequisitionType | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [draft, setDraft] = useState<JobDraft>(initialDraft)
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submissionType, setSubmissionType] = useState<"Vendor & Candidate" | "Vendor Only" | "Candidate Only">("Vendor & Candidate")
  const [vendorAccess, setVendorAccess] = useState<"All Vendors" | "Selected Vendors">("All Vendors")
  const [allowedVendorIds, setAllowedVendorIds] = useState<string[]>([])
  const [vendorNotes, setVendorNotes] = useState("")
  const [enabledComplianceIds, setEnabledComplianceIds] = useState<string[]>([])

  const [publishVisibility, setPublishVisibility] = useState<"Public" | "Internal" | "Private">("Public")
  const [publishStartDate, setPublishStartDate] = useState("")
  const [publishEndDate, setPublishEndDate] = useState("")
  const [notifyVendorsOnPublish, setNotifyVendorsOnPublish] = useState(true)
  const [notifyCandidatesOnPublish, setNotifyCandidatesOnPublish] = useState(false)
  const [occupationOptions, setOccupationOptions] = useState<Array<{ label: string; value: string }>>([
    { label: "Select occupation", value: "" },
  ])
  const [availableTemplates, setAvailableTemplates] = useState<Array<{
    id: string
    name: string
    description?: string
    department?: string
    occupation?: string
    itemCount: number
    type: 'requisition'
  }>>([])

  const [templateSearch, setTemplateSearch] = useState("")

  const occupationLabelByCode = useMemo(() => {
    const map = new Map<string, string>()
    occupationOptions.forEach((opt) => {
      if (!opt.value) return
      map.set(opt.value, opt.label)
    })
    return map
  }, [occupationOptions])

  const templatePreviewById = useMemo(() => {
    const jobs = organization.jobs
    const preview: Record<
      string,
      {
        title?: string
        occupation?: string
        specialty?: string
        location?: string
        department?: string
        unit?: string
        shift?: string
        duration?: string
        billRate?: string
        description?: string
        startDate?: string
        endDate?: string
        startTime?: string
        endTime?: string
        lengthWeeks?: number
        shiftHours?: number
        shiftsPerWeek?: number
        numberOfOpenPositions?: number
        interviewType?: string
        hiringManager?: string
        _ts?: string
      }
    > = {}

    jobs.forEach((job) => {
      const templateId = (job as { complianceTemplateId?: string }).complianceTemplateId
      if (!templateId) return
      const candidateTimestamp = (job as { startDate?: string }).startDate || new Date().toISOString()
      const existingTimestamp = preview[templateId]?._ts || ""

      if (!existingTimestamp || new Date(candidateTimestamp).getTime() >= new Date(existingTimestamp).getTime()) {
        preview[templateId] = {
          title: job.title,
          occupation: job.occupation,
          specialty: (job as { specialty?: string }).specialty,
          location: job.location,
          department: job.department,
          unit: job.unit,
          shift: job.shift,
          duration: (job as { duration?: string }).duration,
          billRate: job.billRate,
          description: job.description,
          startDate: (job as { startDate?: string }).startDate,
          endDate: (job as { endDate?: string }).endDate,
          startTime: (job as { startTime?: string }).startTime,
          endTime: (job as { endTime?: string }).endTime,
          lengthWeeks: (job as { lengthWeeks?: number }).lengthWeeks,
          shiftHours: (job as { shiftHours?: number }).shiftHours,
          shiftsPerWeek: (job as { shiftsPerWeek?: number }).shiftsPerWeek,
          numberOfOpenPositions: (job as { numberOfOpenPositions?: number }).numberOfOpenPositions,
          interviewType: (job as { interviewType?: string }).interviewType,
          hiringManager: (job as { hiringManager?: string }).hiringManager,
          _ts: candidateTimestamp,
        }
      }
    })

    return preview
  }, [organization.jobs])

  const currentJob = useMemo(() => {
    if (!jobId) return null
    return organization.jobs.find((job) => job.id === jobId) ?? null
  }, [jobId, organization.jobs])

  useEffect(() => {
    if (!currentJob) return

    const jobSubmissionType = (currentJob as { submissionType?: "Vendor & Candidate" | "Vendor Only" | "Candidate Only" }).submissionType
    const jobVendorAccess = (currentJob as { vendorAccess?: "All Vendors" | "Selected Vendors" }).vendorAccess
    const jobAllowedVendorIds = (currentJob as { allowedVendorIds?: string[] }).allowedVendorIds
    const jobVendorNotes = (currentJob as { vendorNotes?: string }).vendorNotes
    const jobComplianceItems = (currentJob as { complianceItems?: Array<{ id: string }> }).complianceItems

    if (jobSubmissionType) setSubmissionType(jobSubmissionType)
    if (jobVendorAccess) setVendorAccess(jobVendorAccess)
    if (Array.isArray(jobAllowedVendorIds)) setAllowedVendorIds(jobAllowedVendorIds)
    if (typeof jobVendorNotes === "string") setVendorNotes(jobVendorNotes)

    if (Array.isArray(jobComplianceItems) && jobComplianceItems.length) {
      setEnabledComplianceIds(jobComplianceItems.map((item) => item.id))
    }

    const jobPublishVisibility = (currentJob as { publishVisibility?: "Public" | "Internal" | "Private" }).publishVisibility
    const jobPublishStartDate = (currentJob as { publishStartDate?: string }).publishStartDate
    const jobPublishEndDate = (currentJob as { publishEndDate?: string }).publishEndDate
    const jobNotifyVendors = (currentJob as { notifyVendorsOnPublish?: boolean }).notifyVendorsOnPublish
    const jobNotifyCandidates = (currentJob as { notifyCandidatesOnPublish?: boolean }).notifyCandidatesOnPublish

    if (jobPublishVisibility) setPublishVisibility(jobPublishVisibility)
    if (typeof jobPublishStartDate === "string") setPublishStartDate(jobPublishStartDate)
    if (typeof jobPublishEndDate === "string") setPublishEndDate(jobPublishEndDate)
    if (typeof jobNotifyVendors === "boolean") setNotifyVendorsOnPublish(jobNotifyVendors)
    if (typeof jobNotifyCandidates === "boolean") setNotifyCandidatesOnPublish(jobNotifyCandidates)
  }, [currentJob])

  // Get selected template - load directly from DB to ensure we get the right template
  const selectedTemplate = useMemo<SelectedTemplate | null>(() => {
    if (!draft.requisitionTemplateId) return null
    
    // Try to get from org LocalDB requisition templates only
    if (typeof window !== "undefined") {
      try {
        const {
          getCurrentOrganization,
          getRequisitionTemplatesByOrganization,
        } = require("@/lib/organization-local-db") as typeof import("@/lib/organization-local-db")
        const currentOrgId = getCurrentOrganization() || "admin"
        
        // Check requisition templates - convert listItemIds to ComplianceItem[]
        const { getComplianceListItemById } = require("@/lib/admin-local-db") as typeof import("@/lib/admin-local-db")
        const reqTemplates = getRequisitionTemplatesByOrganization(currentOrgId)
        const reqTemplate = reqTemplates.find((t: { id: string }) => t.id === draft.requisitionTemplateId)
        if (reqTemplate && reqTemplate.organizationId === currentOrgId) {
          // Convert listItemIds to ComplianceItem[] for job creation
          const complianceItems = reqTemplate.listItemIds
            .map((listItemId: string) => {
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
    return null
  }, [draft.requisitionTemplateId])

  // Load available templates for the current organization
  useEffect(() => {
    if (typeof window === "undefined") return
    
    const loadTemplates = () => {
      try {
        const {
          getCurrentOrganization,
          getRequisitionTemplatesByOrganization,
          setCurrentOrganization,
        } = require("@/lib/organization-local-db") as typeof import("@/lib/organization-local-db")

        const currentOrgId = getCurrentOrganization() || (organization && (organization as any).id) || "admin"
        setCurrentOrganization(currentOrgId)
        
        console.log("[Job Create] Loading templates for organization:", currentOrgId)
        
        // Ensure templates are created if missing
        if (currentOrgId && currentOrgId !== "admin") {
          setCurrentOrganization(currentOrgId)
        }
        
        // Get requisition templates (from /organization/compliance/requisition-templates page)
        const requisitionTemplates = getRequisitionTemplatesByOrganization(currentOrgId)
        console.log("[Job Create] Requisition templates:", requisitionTemplates.length, requisitionTemplates.map(t => ({
          id: t.id,
          name: t.name,
          orgId: t.organizationId,
          itemCount: t.listItemIds.length
        })))
        
        const orgTemplates = requisitionTemplates
          .filter((t: { organizationId: string }) => {
            if (currentOrgId !== "admin" && t.organizationId === "admin") return false
            return t.organizationId === currentOrgId
          })
          .map((t) => ({
            id: t.id,
            name: t.name,
            description: t.department,
            department: t.department,
            occupation: t.occupation,
            itemCount: t.listItemIds.length,
            type: 'requisition' as const,
          }))
        
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

  const filteredTemplates = useMemo(() => {
    const query = templateSearch.trim().toLowerCase()
    if (!query) return availableTemplates
    return availableTemplates.filter((t) => {
      const hay = `${t.name} ${t.description ?? ""}`.toLowerCase()
      return hay.includes(query)
    })
  }, [availableTemplates, templateSearch])

  const templateUsage = useMemo(() => {
    const usage: Record<string, { count: number; lastUsed?: string }> = {}
    organization.jobs.forEach((job) => {
      const templateId = (job as { complianceTemplateId?: string }).complianceTemplateId
      if (!templateId) return
      usage[templateId] ??= { count: 0, lastUsed: undefined }
      usage[templateId].count += 1
      const candidateTimestamp = (job as { startDate?: string }).startDate || new Date().toISOString()
      if (!usage[templateId].lastUsed || new Date(candidateTimestamp).getTime() > new Date(usage[templateId].lastUsed!).getTime()) {
        usage[templateId].lastUsed = candidateTimestamp
      }
    })
    return usage
  }, [organization.jobs])

  const formatLastUsed = (iso?: string) => {
    if (!iso) return "Never used"
    const diffMs = Date.now() - new Date(iso).getTime()
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
    if (diffDays === 0) return "Last used today"
    if (diffDays === 1) return "Last used 1 day ago"
    return `Last used ${diffDays} days ago`
  }

  const handleBackToTypeSelection = () => {
    if (typeof window !== "undefined" && jobId) {
      try {
        const { deleteJob } = require("@/lib/organization-local-db") as typeof import("@/lib/organization-local-db")
        deleteJob(jobId)
      } catch (error) {
        // ignore
      }
    }
    setErrors({})
    setDraft(initialDraft)
    setJobId(null)
    setSelectedType(null)
    setTemplateSearch("")
    setStep("type")
    setWizardStep("job_details")
    setSubmissionType("Vendor & Candidate")
    setVendorAccess("All Vendors")
    setAllowedVendorIds([])
    setVendorNotes("")
    setEnabledComplianceIds([])
    setPublishVisibility("Public")
    setPublishStartDate("")
    setPublishEndDate("")
    setNotifyVendorsOnPublish(true)
    setNotifyCandidatesOnPublish(false)
  }

  const handleSelectTemplate = async (templateId: string) => {
    if (!jobId) {
      return
    }
    setSaving("draft")
    try {
      const {
        getCurrentOrganization,
        getRequisitionTemplatesByOrganization,
      } = require("@/lib/organization-local-db") as typeof import("@/lib/organization-local-db")
      const currentOrgId = getCurrentOrganization() || "admin"
      const template = getRequisitionTemplatesByOrganization(currentOrgId).find((t) => t.id === templateId)
      const occupation = template?.occupation ?? ""
      const department = template?.department ?? ""

      const complianceItems: ComplianceItem[] = []
      if (template) {
        try {
          const { getComplianceListItemById } = require("@/lib/admin-local-db") as typeof import("@/lib/admin-local-db")
          template.listItemIds.forEach((listItemId) => {
            try {
              const listItem = getComplianceListItemById(listItemId)
              if (!listItem || !listItem.isActive) return

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

              complianceItems.push({
                id: listItem.id,
                name: listItem.name,
                type,
                expirationType,
                requiredAtSubmission: false,
              })
            } catch (error) {
              // ignore
            }
          })
        } catch (error) {
          // ignore
        }
      }

      actions.updateJob(jobId, {
        complianceTemplateId: templateId,
        complianceItems,
        contractType: selectedType ?? undefined,
      })

      const preview = templatePreviewById[templateId]
      setDraft((prev) => {
        const next = {
          ...prev,
          requisitionTemplateId: templateId,
          occupation: prev.occupation || occupation,
          department: prev.department || department,
        }
        if (preview) {
          return {
            ...next,
            title: next.title || preview.title || next.title,
            location: next.location || preview.location || next.location,
            unit: next.unit || preview.unit || next.unit,
            shift: next.shift || preview.shift || next.shift,
            billRate: next.billRate || preview.billRate || next.billRate,
            description: next.description || preview.description || next.description,
            specialty: next.specialty || preview.specialty || next.specialty,
            startDate: next.startDate || preview.startDate || next.startDate,
            endDate: next.endDate || preview.endDate || next.endDate,
            startTime: next.startTime || preview.startTime || next.startTime,
            endTime: next.endTime || preview.endTime || next.endTime,
            lengthWeeks: next.lengthWeeks || (preview.lengthWeeks ? String(preview.lengthWeeks) : next.lengthWeeks),
            shiftHours: next.shiftHours || (preview.shiftHours ? String(preview.shiftHours) : next.shiftHours),
            shiftsPerWeek: next.shiftsPerWeek || (preview.shiftsPerWeek ? String(preview.shiftsPerWeek) : next.shiftsPerWeek),
            numberOfOpenPositions: next.numberOfOpenPositions || (preview.numberOfOpenPositions ? String(preview.numberOfOpenPositions) : next.numberOfOpenPositions),
            interviewType: next.interviewType || preview.interviewType || next.interviewType,
            hiringManager: next.hiringManager || preview.hiringManager || next.hiringManager,
          }
        }
        return next
      })

      setWizardStep("job_details")

      const templateItems = selectedTemplate?.items
      if (templateItems && templateItems.length) {
        setEnabledComplianceIds(templateItems.map((item) => item.id))
      } else {
        setEnabledComplianceIds(complianceItems.map((item) => item.id))
      }

      actions.updateJob(jobId, {
        submissionType: "Vendor & Candidate",
        vendorAccess: "All Vendors",
        allowedVendorIds: [],
        vendorNotes: "",
        publishVisibility: "Public",
        publishStartDate: "",
        publishEndDate: "",
        notifyVendorsOnPublish: true,
        notifyCandidatesOnPublish: false,
      })
      setStep("details")
    } finally {
      setSaving(null)
    }
  }

  const handleBackToTemplateSelection = () => {
    setErrors((prev) => ({
      ...prev,
      requisitionTemplateId: undefined,
    }))
    setStep("template")
    setWizardStep("job_details")
  }

  const persistSubmissionSettings = (updates?: Partial<{
    submissionType: "Vendor & Candidate" | "Vendor Only" | "Candidate Only"
    vendorAccess: "All Vendors" | "Selected Vendors"
    allowedVendorIds: string[]
    vendorNotes: string
    enabledComplianceIds: string[]
  }>) => {
    if (!jobId) return
    const nextSubmissionType = updates?.submissionType ?? submissionType
    const nextVendorAccess = updates?.vendorAccess ?? vendorAccess
    const nextAllowedVendorIds = updates?.allowedVendorIds ?? allowedVendorIds
    const nextVendorNotes = updates?.vendorNotes ?? vendorNotes
    const nextEnabledComplianceIds = updates?.enabledComplianceIds ?? enabledComplianceIds

    const templateItems = selectedTemplate?.items ?? []
    const complianceItems = templateItems.filter((item) => nextEnabledComplianceIds.includes(item.id))

    actions.updateJob(jobId, {
      submissionType: nextSubmissionType,
      vendorAccess: nextVendorAccess,
      allowedVendorIds: nextVendorAccess === "Selected Vendors" ? nextAllowedVendorIds : [],
      vendorNotes: nextVendorNotes,
      complianceItems,
    })
  }

  const persistPublishSettings = (updates?: Partial<{
    publishVisibility: "Public" | "Internal" | "Private"
    publishStartDate: string
    publishEndDate: string
    notifyVendorsOnPublish: boolean
    notifyCandidatesOnPublish: boolean
  }>) => {
    if (!jobId) return
    actions.updateJob(jobId, {
      publishVisibility: updates?.publishVisibility ?? publishVisibility,
      publishStartDate: updates?.publishStartDate ?? publishStartDate,
      publishEndDate: updates?.publishEndDate ?? publishEndDate,
      notifyVendorsOnPublish: updates?.notifyVendorsOnPublish ?? notifyVendorsOnPublish,
      notifyCandidatesOnPublish: updates?.notifyCandidatesOnPublish ?? notifyCandidatesOnPublish,
    })
  }

  const persistDraftToJob = (updates: Partial<JobDraft>) => {
    if (!jobId) return
    const hoursPerWeek = (() => {
      const shiftsPerWeek = parseFloat((updates.shiftsPerWeek ?? draft.shiftsPerWeek) || "")
      const shiftHours = parseFloat((updates.shiftHours ?? draft.shiftHours) || "")
      if (Number.isFinite(shiftsPerWeek) && Number.isFinite(shiftHours)) {
        return shiftsPerWeek * shiftHours
      }
      return undefined
    })()

    actions.updateJob(jobId, {
      title: (updates.title ?? draft.title) || "New Job Posting",
      location: updates.location ?? draft.location,
      department: updates.department ?? draft.department,
      unit: updates.unit ?? draft.unit,
      shift: updates.shift ?? draft.shift,
      hours: updates.hours ?? draft.hours,
      billRate: updates.billRate ?? draft.billRate,
      description: updates.description ?? draft.description,
      occupation: updates.occupation ?? draft.occupation,
      specialty: updates.specialty ?? draft.specialty,
      contractType: selectedType ?? undefined,
      complianceTemplateId: draft.requisitionTemplateId,
      startDate: updates.startDate ?? draft.startDate,
      endDate: updates.endDate ?? draft.endDate,
      startTime: updates.startTime ?? draft.startTime,
      endTime: updates.endTime ?? draft.endTime,
      lengthWeeks: (updates.lengthWeeks ?? draft.lengthWeeks) ? parseInt((updates.lengthWeeks ?? draft.lengthWeeks) as string, 10) : undefined,
      shiftHours: (updates.shiftHours ?? draft.shiftHours) ? parseFloat((updates.shiftHours ?? draft.shiftHours) as string) : undefined,
      shiftsPerWeek: (updates.shiftsPerWeek ?? draft.shiftsPerWeek) ? parseFloat((updates.shiftsPerWeek ?? draft.shiftsPerWeek) as string) : undefined,
      hoursPerWeek,
      numberOfOpenPositions: (updates.numberOfOpenPositions ?? draft.numberOfOpenPositions) ? parseInt((updates.numberOfOpenPositions ?? draft.numberOfOpenPositions) as string, 10) : undefined,
      interviewType: updates.interviewType ?? draft.interviewType,
      interviewRequired: (updates.interviewType ?? draft.interviewType) ? true : undefined,
      hiringManager: updates.hiringManager ?? draft.hiringManager,
    })
  }

  const handleChange =
    (field: keyof JobDraft) =>
    (value: string) => {
      setDraft((prev) => ({ ...prev, [field]: value }))
      persistDraftToJob({ [field]: value } as Partial<JobDraft>)
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
    if (!draft.billRate.trim()) {
      newErrors.billRate = "Bill rate is required"
    }

    if (!draft.requisitionTemplateId) {
      newErrors.requisitionTemplateId = "Requisition template is required"
    }
    if (!draft.occupation.trim()) {
      newErrors.occupation = "Occupation is required"
    }

    if (!draft.specialty.trim()) {
      newErrors.specialty = "Specialty is required"
    }

    if (!draft.startDate.trim()) {
      newErrors.startDate = "Start date is required"
    }

    if (!draft.lengthWeeks.trim()) {
      newErrors.lengthWeeks = "Length (weeks) is required"
    }

    if (!draft.shiftsPerWeek.trim()) {
      newErrors.shiftsPerWeek = "Shifts per week is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (nextStatus: "Draft" | "Published") => {
    if (!validateForm()) {
      return
    }

    setSaving(nextStatus === "Draft" ? "draft" : "publish")

    if (jobId) {
      actions.updateJob(jobId, {
        title: draft.title.trim(),
        location: draft.location.trim(),
        department: draft.department.trim() || "N/A",
        unit: draft.unit.trim() || "N/A",
        shift: draft.shift.trim() || "N/A",
        hours: draft.hours.trim() || "N/A",
        billRate: draft.billRate.trim() || "N/A",
        description: draft.description.trim() || "To be provided.",
        requirements: [],
        tags: [],
        status: nextStatus === "Draft" ? "Draft" : "Open",
        complianceTemplateId: draft.requisitionTemplateId,
        complianceItems: selectedTemplate?.items || [],
        occupation: draft.occupation.trim(),
        specialty: draft.specialty.trim(),
        contractType: selectedType ?? undefined,
        startDate: draft.startDate,
        endDate: draft.endDate,
        startTime: draft.startTime,
        endTime: draft.endTime,
        lengthWeeks: draft.lengthWeeks ? parseInt(draft.lengthWeeks, 10) : undefined,
        shiftHours: draft.shiftHours ? parseFloat(draft.shiftHours) : undefined,
        shiftsPerWeek: draft.shiftsPerWeek ? parseFloat(draft.shiftsPerWeek) : undefined,
        hoursPerWeek: (() => {
          const spw = parseFloat(draft.shiftsPerWeek)
          const sh = parseFloat(draft.shiftHours)
          if (Number.isFinite(spw) && Number.isFinite(sh)) return spw * sh
          return undefined
        })(),
        numberOfOpenPositions: draft.numberOfOpenPositions ? parseInt(draft.numberOfOpenPositions, 10) : undefined,
        interviewType: draft.interviewType,
        interviewRequired: true,
        hiringManager: draft.hiringManager,
      })
    } else {
      await actions.createJob({
        title: draft.title.trim(),
        location: draft.location.trim(),
        department: draft.department.trim() || "N/A",
        unit: draft.unit.trim() || "N/A",
        shift: draft.shift.trim() || "N/A",
        hours: draft.hours.trim() || "N/A",
        billRate: draft.billRate.trim() || "N/A",
        description: draft.description.trim() || "To be provided.",
        requirements: [],
        tags: [],
        status: nextStatus === "Draft" ? "Draft" : "Open",
        complianceTemplateId: draft.requisitionTemplateId,
        complianceItems: selectedTemplate?.items || [],
        occupation: draft.occupation.trim(),
        contractType: selectedType ?? undefined,
      })
    }

    setSaving(null)
    router.push("/organization/jobs")
  }

  const handleSelectType = async (type: RequisitionType) => {
    setSaving("draft")
    try {
      const job = await actions.createJob({
        title: "New Job Posting",
        location: "",
        department: "",
        unit: "",
        shift: "",
        hours: "",
        billRate: "",
        description: "",
        requirements: [],
        tags: [],
        status: "Draft",
        complianceTemplateId: "",
        complianceItems: [],
        occupation: "",
        contractType: type,
      })
      setSelectedType(type)
      setJobId(job.id)
      setStep("template")
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title={
          step === "type"
            ? "Create New Job Posting"
            : step === "template"
              ? "Select a Requisition Template"
              : "Create Job Posting"
        }
        subtitle={
          step === "type"
            ? "Select the type of requisition you want to create"
            : step === "template"
              ? selectedType
                ? `Creating: ${selectedType}`
                : "Select a requisition template"
              : "All fields are pre-filled from the selected template. You can customize any field for this specific job posting."
        }
      />

      {step === "type" ? (
        <Card>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border p-5">
                <div className="space-y-2">
                  <div className="text-base font-semibold text-foreground">Long-term Order/Assignment</div>
                  <div className="text-sm text-muted-foreground">
                    Temporary assignments with defined start and end dates, typically 8-26 weeks
                  </div>
                  <button
                    type="button"
                    className="ph5-button-primary"
                    disabled={saving !== null}
                    onClick={() => handleSelectType("Long-term Order/Assignment")}
                  >
                    Select this type
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-border p-5">
                <div className="space-y-2">
                  <div className="text-base font-semibold text-foreground">Fixed duration contract</div>
                  <div className="text-sm text-muted-foreground">Defined start and end dates</div>
                  <div className="text-sm text-muted-foreground">Full-time or part-time schedules</div>
                  <div className="text-sm text-muted-foreground">Compliance requirements tracked</div>
                  <button
                    type="button"
                    className="ph5-button-primary"
                    disabled={saving !== null}
                    onClick={() => handleSelectType("Fixed duration contract")}
                  >
                    Select this type
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-border p-5">
                <div className="space-y-2">
                  <div className="text-base font-semibold text-foreground">Permanent Job</div>
                  <div className="text-sm text-muted-foreground">Full-time permanent positions with no defined end date</div>
                  <div className="text-sm text-muted-foreground">Indefinite employment</div>
                  <div className="text-sm text-muted-foreground">Full benefits package</div>
                  <div className="text-sm text-muted-foreground">Standard work schedule</div>
                  <div className="text-sm text-muted-foreground">Long-term career opportunity</div>
                  <button
                    type="button"
                    className="ph5-button-primary"
                    disabled={saving !== null}
                    onClick={() => handleSelectType("Permanent Job")}
                  >
                    Select this type
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-border p-5">
                <div className="space-y-2">
                  <div className="text-base font-semibold text-foreground">Per Diem Job</div>
                  <div className="text-sm text-muted-foreground">Flexible shifts on an as-needed basis, paid per shift</div>
                  <div className="text-sm text-muted-foreground">Shift-by-shift basis</div>
                  <div className="text-sm text-muted-foreground">Flexible scheduling</div>
                  <div className="text-sm text-muted-foreground">No guaranteed hours</div>
                  <div className="text-sm text-muted-foreground">Quick onboarding</div>
                  <button
                    type="button"
                    className="ph5-button-primary"
                    disabled={saving !== null}
                    onClick={() => handleSelectType("Per Diem Job")}
                  >
                    Select this type
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {step === "template" ? (
        <Card>
          <div className="space-y-4">
            <div>
              <button type="button" className="ph5-button-ghost" onClick={handleBackToTypeSelection}>
                Back to Type Selection
              </button>
            </div>

            <div>
              <Input
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates by occupation, location, department..."
              />
              <div className="mt-2 text-sm text-muted-foreground">{filteredTemplates.length} templates found</div>
            </div>

            <div className="grid gap-4">
              {filteredTemplates.map((template) => {
                const usage = templateUsage[template.id]
                const preview = templatePreviewById[template.id]
                const occupationLabel = preview?.occupation ? (occupationLabelByCode.get(preview.occupation) ?? preview.occupation) : (template.occupation || "—")
                return (
                  <button
                    key={template.id}
                    type="button"
                    disabled={saving !== null}
                    onClick={() => handleSelectTemplate(template.id)}
                    className="text-left rounded-lg border border-border p-5 hover:bg-muted/30 transition"
                  >
                    <div className="space-y-3">
                      <div className="text-base font-semibold text-foreground">{preview?.title || template.name}</div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <div className="text-xs text-muted-foreground">Occupation</div>
                          <div className="text-sm text-foreground">{occupationLabel}</div>
                          <div className="text-sm text-foreground">{preview?.specialty || template.department || "—"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Location</div>
                          <div className="text-sm text-foreground">{preview?.location || "—"}</div>
                          <div className="text-sm text-foreground">{preview?.department || template.department || "—"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Shift & Duration</div>
                          <div className="text-sm text-foreground">{preview?.shift || "—"}</div>
                          <div className="text-sm text-foreground">{preview?.duration || "—"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Bill Rate</div>
                          <div className="text-sm text-foreground">{preview?.billRate || "—"}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        <div>{formatLastUsed(usage?.lastUsed)}</div>
                        <div>Used {usage?.count ?? 0} times</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{template.name}</div>
                    </div>
                  </button>
                )
              })}
              {!filteredTemplates.length ? (
                <div className="text-sm text-muted-foreground">No templates found.</div>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}

      {step === "details" ? (
      <div className="space-y-4">
        <button type="button" className="ph5-button-ghost" onClick={handleBackToTemplateSelection}>
          Back to Template Selection
        </button>

        <Card>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Create Job Posting</div>
            <div className="text-sm">
              <span className="font-semibold">Type:</span> {selectedType || "—"}
              <span className="px-2 text-muted-foreground">•</span>
              <span className="font-semibold">Template:</span> {selectedTemplate?.name || "—"}
            </div>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <Card>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-foreground">Requisition Type</div>
              <div className="text-sm font-semibold text-foreground">Select Template</div>
              <div className={`text-sm font-semibold ${wizardStep === "job_details" ? "text-foreground" : "text-muted-foreground"}`}>Job Details</div>
              <div className={`text-sm font-semibold ${wizardStep === "submission_settings" ? "text-foreground" : "text-muted-foreground"}`}>Submission Settings</div>
              <div className={`text-sm font-semibold ${wizardStep === "publish_settings" ? "text-foreground" : "text-muted-foreground"}`}>Publish Settings</div>
              <div className={`text-sm font-semibold ${wizardStep === "review_confirm" ? "text-foreground" : "text-muted-foreground"}`}>Review & Confirm</div>
            </div>
          </Card>

          <Card>
            <div className="space-y-6">
              {wizardStep === "job_details" ? (
                <>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-foreground">Job Details</div>
                    <div className="text-sm text-muted-foreground">
                      All fields are pre-filled from the selected template. You can customize any field for this specific job posting.
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-foreground">General Information</div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Requisition Name" error={errors.title}>
                        <Input value={draft.title} onChange={(e) => handleChange("title")(e.target.value)} />
                      </Field>
                      <Field label="Location" error={errors.location}>
                        <Input value={draft.location} onChange={(e) => handleChange("location")(e.target.value)} />
                      </Field>
                      <Field label="Department" error={errors.department}>
                        <Input value={draft.department} onChange={(e) => handleChange("department")(e.target.value)} />
                      </Field>
                      <Field label="Unit Name" error={errors.unit}>
                        <Input value={draft.unit} onChange={(e) => handleChange("unit")(e.target.value)} />
                      </Field>
                      <Field label="Required Occupation" error={errors.occupation}>
                        <select
                          value={draft.occupation}
                          onChange={(e) => handleChange("occupation")(e.target.value)}
                          className="h-11 w-full rounded-[10px] border-2 border-[#E2E8F0] bg-gradient-to-b from-white to-[#fafbfc] px-4 py-2.5 text-sm text-[#2D3748] transition-all duration-200 shadow-sm hover:border-[#3182CE]/30 hover:shadow-md focus:border-[#3182CE] focus:outline-none focus:ring-4 focus:ring-[#3182CE]/20 focus:shadow-lg focus:-translate-y-0.5"
                        >
                          {occupationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Required Specialty" error={errors.specialty}>
                        <Input value={draft.specialty} onChange={(e) => handleChange("specialty")(e.target.value)} />
                      </Field>
                      <Field label="Shift Type" error={errors.shift}>
                        <Input value={draft.shift} onChange={(e) => handleChange("shift")(e.target.value)} />
                      </Field>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-foreground">Shift & Schedule</div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Start Date" error={errors.startDate}>
                        <Input value={draft.startDate} onChange={(e) => handleChange("startDate")(e.target.value)} placeholder="dd/mm/yyyy" />
                      </Field>
                      <Field label="End Date">
                        <Input value={draft.endDate} onChange={(e) => handleChange("endDate")(e.target.value)} placeholder="dd/mm/yyyy" />
                      </Field>
                      <Field label="Length (Weeks)" error={errors.lengthWeeks}>
                        <Input value={draft.lengthWeeks} onChange={(e) => handleChange("lengthWeeks")(e.target.value)} />
                      </Field>
                      <Field label="Start Time">
                        <Input value={draft.startTime} onChange={(e) => handleChange("startTime")(e.target.value)} placeholder="--:-- --" />
                      </Field>
                      <Field label="End Time">
                        <Input value={draft.endTime} onChange={(e) => handleChange("endTime")(e.target.value)} placeholder="--:-- --" />
                      </Field>
                      <Field label="Shift Hours">
                        <Input value={draft.shiftHours} onChange={(e) => handleChange("shiftHours")(e.target.value)} />
                      </Field>
                      <Field label="Shifts Per Week" error={errors.shiftsPerWeek}>
                        <Input value={draft.shiftsPerWeek} onChange={(e) => handleChange("shiftsPerWeek")(e.target.value)} />
                      </Field>
                      <Field label="Hours Per Week">
                        <Input
                          value={(() => {
                            const spw = parseFloat(draft.shiftsPerWeek)
                            const sh = parseFloat(draft.shiftHours)
                            if (Number.isFinite(spw) && Number.isFinite(sh)) return String(spw * sh)
                            return ""
                          })()}
                          readOnly
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-foreground">Compensation & Hiring</div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Bill Rate" error={errors.billRate}>
                        <Input value={draft.billRate} onChange={(e) => handleChange("billRate")(e.target.value)} placeholder="$75.00/hr" />
                      </Field>
                      <Field label="# of Open Positions">
                        <Input value={draft.numberOfOpenPositions} onChange={(e) => handleChange("numberOfOpenPositions")(e.target.value)} />
                      </Field>
                      <Field label="Interview Required">
                        <Input value={draft.interviewType} onChange={(e) => handleChange("interviewType")(e.target.value)} />
                      </Field>
                      <Field label="Hiring Manager">
                        <Input value={draft.hiringManager} onChange={(e) => handleChange("hiringManager")(e.target.value)} />
                      </Field>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-foreground">Job Description</div>
                    <Field label="Description">
                      <Textarea value={draft.description} onChange={(e) => handleChange("description")(e.target.value)} rows={4} />
                    </Field>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-foreground">Compliance</div>
                    <div className="rounded-lg border border-border p-4">
                      <div className="text-sm text-muted-foreground">Compliance Checklist Template</div>
                      <div className="text-sm font-semibold text-foreground">{selectedTemplate?.name || "—"}</div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" className="ph5-button-secondary" onClick={handleBackToTemplateSelection}>
                      Back
                    </button>
                    <button type="button" className="ph5-button-primary" onClick={() => setWizardStep("submission_settings")}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : null}

              {wizardStep === "submission_settings" ? (
                <>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-foreground">Submission Settings</div>
                    <div className="text-sm text-muted-foreground">
                      Configure workflow settings, vendor submission rules and acceptance criteria
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">Workflow Settings</div>

                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-foreground">Submission Type <span className="text-destructive">*</span></div>
                        <div className="space-y-2">
                          <label className="flex items-start gap-3 rounded-lg border border-border p-4">
                            <input
                              type="radio"
                              name="submissionType"
                              checked={submissionType === "Vendor & Candidate"}
                              onChange={() => {
                                setSubmissionType("Vendor & Candidate")
                                persistSubmissionSettings({ submissionType: "Vendor & Candidate" })
                              }}
                            />
                            <div>
                              <div className="text-sm font-semibold text-foreground">Vendor & Candidate</div>
                              <div className="text-sm text-muted-foreground">Both vendors and candidates can submit applications for this job.</div>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 rounded-lg border border-border p-4">
                            <input
                              type="radio"
                              name="submissionType"
                              checked={submissionType === "Vendor Only"}
                              onChange={() => {
                                setSubmissionType("Vendor Only")
                                persistSubmissionSettings({ submissionType: "Vendor Only" })
                              }}
                            />
                            <div>
                              <div className="text-sm font-semibold text-foreground">Vendor Only</div>
                              <div className="text-sm text-muted-foreground">Only vendors can submit candidates for this job.</div>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 rounded-lg border border-border p-4">
                            <input
                              type="radio"
                              name="submissionType"
                              checked={submissionType === "Candidate Only"}
                              onChange={() => {
                                setSubmissionType("Candidate Only")
                                persistSubmissionSettings({ submissionType: "Candidate Only" })
                              }}
                            />
                            <div>
                              <div className="text-sm font-semibold text-foreground">Candidate Only</div>
                              <div className="text-sm text-muted-foreground">Only candidates can apply directly for this job.</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">Vendor Submission Rules</div>

                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-foreground">Vendor Access <span className="text-destructive">*</span></div>
                        <div className="space-y-2">
                          <label className="flex items-start gap-3 rounded-lg border border-border p-4">
                            <input
                              type="radio"
                              name="vendorAccess"
                              checked={vendorAccess === "All Vendors"}
                              onChange={() => {
                                setVendorAccess("All Vendors")
                                setAllowedVendorIds([])
                                persistSubmissionSettings({ vendorAccess: "All Vendors", allowedVendorIds: [] })
                              }}
                            />
                            <div>
                              <div className="text-sm font-semibold text-foreground">All Vendors</div>
                              <div className="text-sm text-muted-foreground">All active vendors in this organization can submit candidates.</div>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 rounded-lg border border-border p-4">
                            <input
                              type="radio"
                              name="vendorAccess"
                              checked={vendorAccess === "Selected Vendors"}
                              onChange={() => {
                                setVendorAccess("Selected Vendors")
                                persistSubmissionSettings({ vendorAccess: "Selected Vendors" })
                              }}
                            />
                            <div className="w-full">
                              <div className="text-sm font-semibold text-foreground">Selected Vendors</div>
                              <div className="text-sm text-muted-foreground">Choose specific vendors who can submit.</div>

                              {vendorAccess === "Selected Vendors" ? (
                                <div className="mt-3 grid gap-2">
                                  {vendor.vendors.map((v) => {
                                    const checked = allowedVendorIds.includes(v.id)
                                    return (
                                      <label key={v.id} className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => {
                                            const next = checked ? allowedVendorIds.filter((id) => id !== v.id) : [...allowedVendorIds, v.id]
                                            setAllowedVendorIds(next)
                                            persistSubmissionSettings({ allowedVendorIds: next })
                                          }}
                                        />
                                        <div className="flex-1">
                                          <div className="text-sm font-medium text-foreground">{v.name}</div>
                                          <div className="text-xs text-muted-foreground">{v.tier}</div>
                                        </div>
                                      </label>
                                    )
                                  })}
                                </div>
                              ) : null}
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-foreground">Notes for Vendors (Optional)</div>
                        <Textarea
                          value={vendorNotes}
                          onChange={(e) => {
                            setVendorNotes(e.target.value)
                            persistSubmissionSettings({ vendorNotes: e.target.value })
                          }}
                          rows={3}
                          placeholder="Add any special instructions or requirements for vendors submitting candidates..."
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">Acceptance Criteria</div>
                      <div className="text-sm text-muted-foreground">
                        The following criteria are inherited from the compliance template. All items are pre-checked. Uncheck items to exclude them for this job only.
                      </div>

                      <div className="grid gap-2">
                        {(selectedTemplate?.items ?? []).map((item) => {
                          const checked = enabledComplianceIds.includes(item.id)
                          return (
                            <label key={item.id} className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const next = checked
                                    ? enabledComplianceIds.filter((id) => id !== item.id)
                                    : [...enabledComplianceIds, item.id]
                                  setEnabledComplianceIds(next)
                                  persistSubmissionSettings({ enabledComplianceIds: next })
                                }}
                              />
                              <div className="text-sm text-foreground">{item.name}</div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" className="ph5-button-secondary" onClick={() => setWizardStep("job_details")}>Back</button>
                    <button type="button" className="ph5-button-primary" onClick={() => setWizardStep("publish_settings")}>Next</button>
                  </div>
                </>
              ) : null}

              {wizardStep === "publish_settings" ? (
                <>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-foreground">Publish Settings</div>
                    <div className="text-sm text-muted-foreground">
                      Configure visibility, schedule, and notifications.
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">Visibility</div>
                      <div className="space-y-2">
                        {([
                          { value: "Public", label: "Public", desc: "Visible to candidates and vendors." },
                          { value: "Internal", label: "Internal", desc: "Visible internally only." },
                          { value: "Private", label: "Private", desc: "Hidden until you publish." },
                        ] as const).map((opt) => (
                          <label key={opt.value} className="flex items-start gap-3 rounded-lg border border-border p-4">
                            <input
                              type="radio"
                              name="publishVisibility"
                              checked={publishVisibility === opt.value}
                              onChange={() => {
                                setPublishVisibility(opt.value)
                                persistPublishSettings({ publishVisibility: opt.value })
                              }}
                            />
                            <div>
                              <div className="text-sm font-semibold text-foreground">{opt.label}</div>
                              <div className="text-sm text-muted-foreground">{opt.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">Schedule</div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Publish Start Date">
                          <Input
                            value={publishStartDate}
                            onChange={(e) => {
                              setPublishStartDate(e.target.value)
                              persistPublishSettings({ publishStartDate: e.target.value })
                            }}
                            placeholder="dd/mm/yyyy"
                          />
                        </Field>
                        <Field label="Publish End Date">
                          <Input
                            value={publishEndDate}
                            onChange={(e) => {
                              setPublishEndDate(e.target.value)
                              persistPublishSettings({ publishEndDate: e.target.value })
                            }}
                            placeholder="dd/mm/yyyy"
                          />
                        </Field>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">Notifications</div>
                      <label className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
                        <input
                          type="checkbox"
                          checked={notifyVendorsOnPublish}
                          onChange={() => {
                            const next = !notifyVendorsOnPublish
                            setNotifyVendorsOnPublish(next)
                            persistPublishSettings({ notifyVendorsOnPublish: next })
                          }}
                        />
                        <div className="text-sm text-foreground">Notify vendors when this job is published</div>
                      </label>
                      <label className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
                        <input
                          type="checkbox"
                          checked={notifyCandidatesOnPublish}
                          onChange={() => {
                            const next = !notifyCandidatesOnPublish
                            setNotifyCandidatesOnPublish(next)
                            persistPublishSettings({ notifyCandidatesOnPublish: next })
                          }}
                        />
                        <div className="text-sm text-foreground">Notify candidates when this job is published</div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" className="ph5-button-secondary" onClick={() => setWizardStep("submission_settings")}>Back</button>
                    <button type="button" className="ph5-button-primary" onClick={() => setWizardStep("review_confirm")}>Next</button>
                  </div>
                </>
              ) : null}

              {wizardStep === "review_confirm" ? (
                <>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-foreground">Review & Confirm</div>
                    <div className="text-sm text-muted-foreground">Review all job settings before saving or publishing.</div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                      <div className="text-sm text-muted-foreground">Submission Type</div>
                      <div className="text-sm font-semibold text-foreground">{submissionType}</div>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <div className="text-sm text-muted-foreground">Vendor Access</div>
                      <div className="text-sm font-semibold text-foreground">{vendorAccess}</div>
                      {vendorAccess === "Selected Vendors" ? (
                        <div className="text-xs text-muted-foreground mt-1">
                          {allowedVendorIds.length} vendor{allowedVendorIds.length === 1 ? "" : "s"} selected
                        </div>
                      ) : null}
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <div className="text-sm text-muted-foreground">Publish Visibility</div>
                      <div className="text-sm font-semibold text-foreground">{publishVisibility}</div>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <div className="text-sm text-muted-foreground">Acceptance Criteria</div>
                      <div className="text-sm font-semibold text-foreground">{enabledComplianceIds.length} item(s) enabled</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button type="button" className="ph5-button-secondary" onClick={() => setWizardStep("publish_settings")}>Back</button>
                    <button type="button" onClick={() => handleSubmit("Draft")} disabled={saving !== null} className="ph5-button-secondary">
                      {saving === "draft" ? "Saving..." : "Save as draft"}
                    </button>
                    <button type="button" onClick={() => handleSubmit("Published")} disabled={saving !== null} className="ph5-button-primary">
                      {saving === "publish" ? "Publishing..." : "Publish job"}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
      ) : null}
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

