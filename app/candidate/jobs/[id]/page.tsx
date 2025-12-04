"use client"

import React, { useMemo, useState } from "react"
import { CalendarDays, Clock3, DollarSign, MapPin, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, Header, Modal, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { useToast } from "@/components/system"
import { getJobById } from "@/lib/organization-local-db"

type PageProps = {
  params: Promise<{ id: string }>
}

type RequirementStatus = {
  id: string
  name: string
  type: string
  requiredAtSubmission: boolean
  status: "completed" | "missing"
}

export default function JobDetailsPage({ params }: PageProps) {
  const { id } = React.use(params)
  const { allJobs, candidate, actions, organization } = useDemoData()
  const { data: localDb, markJobApplied } = useLocalDb()
  const { pushToast } = useToast()

  const [requirementsModalOpen, setRequirementsModalOpen] = useState(false)
  const [uploadTarget, setUploadTarget] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // First try to find in allJobs (Open jobs), then try to get from DB (in case job was closed but user has direct link)
  const job = useMemo(() => {
    let foundJob = allJobs.find((item) => item.id === id)
    if (!foundJob && mounted) {
      try {
        const dbJob = getJobById(id)
        if (dbJob) {
          foundJob = {
            id: dbJob.id,
            title: dbJob.title,
            location: dbJob.location,
            department: dbJob.department,
            unit: dbJob.unit,
            shift: dbJob.shift,
            hours: dbJob.hours,
            billRate: dbJob.billRate,
            description: dbJob.description,
            requirements: dbJob.requirements,
            tags: dbJob.tags,
            status: dbJob.status,
            complianceItems: dbJob.complianceItems,
            complianceTemplateId: dbJob.complianceTemplateId,
            startDate: dbJob.startDate,
            occupation: dbJob.occupation,
          }
        }
      } catch (error) {
        // Silently fail, will show "Job not found"
      }
    }
    return foundJob
  }, [id, allJobs, mounted])

  if (!job) {
    return (
      <div className="space-y-6 p-8">
        <Card title="Job not found" subtitle="Please return to the marketplace and choose another role." />
      </div>
    )
  }

  // Get job-specific compliance requirements
  // Priority 1: Use job.complianceItems (job-specific requirements)
  // Priority 2: Use compliance template if complianceTemplateId exists
  // Priority 3: Fall back to job requirements array
  const complianceTemplate = useMemo(() => {
    if (!job.complianceTemplateId || !mounted) {
      return null
    }
    try {
      const { getCurrentOrganization, getLegacyTemplatesByOrganization } = require("@/lib/organization-local-db")
      const currentOrgId = getCurrentOrganization() || "admin"
      const templates = getLegacyTemplatesByOrganization(currentOrgId)
      return templates.find((t) => t.id === job.complianceTemplateId) || null
    } catch (error) {
      console.warn("Failed to load compliance template", error)
      return null
    }
  }, [job.complianceTemplateId, mounted])

  const jobRequirements = useMemo(() => {
    // Priority 1: Use job-specific compliance items (new flow)
    if (job.complianceItems && job.complianceItems.length > 0) {
      return job.complianceItems.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        requiredAtSubmission: item.requiredAtSubmission ?? true,
      }))
    }
    // Priority 2: Use compliance template
    if (complianceTemplate) {
      return complianceTemplate.items.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        requiredAtSubmission: item.requiredAtSubmission ?? true,
      }))
    }
    // Priority 3: Fall back to job requirements array
    return (job.requirements ?? []).map((requirement, index) => ({
      id: `${job.id}-${index}`,
      name: requirement,
      type: "Other",
      requiredAtSubmission: true,
    }))
  }, [job.id, job.requirements, job.complianceItems, complianceTemplate])

  // Get candidate's wallet items (from admin wallet templates)
  const walletItems = useMemo(() => {
    const occupationCode = (localDb.onboardingDetails.occupation as string | undefined) || ""
    if (!occupationCode || !mounted) {
      return []
    }
    
    const itemSet = new Set<string>()
    
    // Get admin wallet templates for this occupation
    try {
      const {
        getAdminWalletTemplatesByOccupation,
        getComplianceListItemById,
      } = require("@/lib/admin-local-db")
      
      const templates = getAdminWalletTemplatesByOccupation(occupationCode)
      templates.forEach((template) => {
        template.listItemIds.forEach((listItemId) => {
          const listItem = getComplianceListItemById(listItemId)
          if (listItem && listItem.isActive) {
            itemSet.add(listItem.name)
          }
        })
      })
    } catch (error) {
      console.warn("Failed to load admin wallet templates", error)
    }

    return Array.from(itemSet)
  }, [localDb.onboardingDetails.occupation, mounted])

  // Compare job requirements with wallet items
  // Items in job requirements that are NOT in wallet need to be uploaded
  const checklist = useMemo(() => {
    return jobRequirements.map((req) => {
      const inWallet = walletItems.includes(req.name)
      return {
        ...req,
        inWallet, // Whether this item is already in the candidate's wallet
      }
    })
  }, [jobRequirements, walletItems])

  const requirementStatuses: RequirementStatus[] = useMemo(() => {
    return checklist.map((item) => {
      // Check if candidate has this document uploaded (in wallet or job-specific)
      // Accept both "Completed" and "Pending Verification" as valid uploaded documents
      const hasDocument = candidate.documents.some(
        (doc) => doc.type === item.name && (doc.status === "Completed" || doc.status === "Pending Verification")
      )
      return { 
        ...item, 
        status: hasDocument ? "completed" : "missing",
        inWallet: item.inWallet || false,
      }
    })
  }, [candidate.documents, checklist])

  // Check ALL items from compliance template - all documents must be uploaded before applying
  // The requiredAtSubmission flag is used for display purposes only (showing "Required at submission" vs "Required before start")
  const missingRequiredDocuments = requirementStatuses.filter((item) => item.status === "missing").map((item) => item.name)
  const allRequirementsMet = missingRequiredDocuments.length === 0
  
  // Separate required items for display purposes (to show count of required at submission vs all)
  const requiredItems = requirementStatuses.filter((item) => item.requiredAtSubmission !== false)
  const hasApplied = Boolean(localDb.jobApplications[job.id]) || candidate.applications.some((app) => app.jobId === job.id)

  const infoRows = [
    { label: "Department", value: job.department },
    { label: "Unit", value: job.unit },
    { label: "Shift", value: job.shift },
    { label: "Hours", value: job.hours },
    { label: "Bill rate", value: job.billRate },
    { label: "Location", value: job.location },
    { label: "Start date", value: job.startDate ?? "To be announced" },
  ]

  const handleApply = async () => {
    if (hasApplied) {
      return
    }
    // Only allow applying to Open jobs
    if (job.status !== "Open") {
      pushToast({ title: "Job not available", description: "This job is no longer accepting applications.", type: "error" })
      return
    }
    if (!allRequirementsMet) {
      setRequirementsModalOpen(true)
      return
    }
    setApplying(true)
    try {
      await actions.submitJobApplication(job.id)
      markJobApplied(job.id)
      pushToast({ title: "Application submitted", description: `${job.title} • ${job.location}`, type: "success" })
    } catch (error) {
      pushToast({ title: "Unable to apply", description: "Please try again.", type: "error" })
    } finally {
      setApplying(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadTarget) return
    setUploading(true)
    try {
      await actions.uploadDocument({ name: `${uploadTarget}.pdf`, type: uploadTarget })
      pushToast({ title: `${uploadTarget} uploaded`, type: "success" })
      setUploadTarget(null)
    } catch {
      pushToast({ title: "Upload failed", description: "Try again in a moment.", type: "error" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title={job.title}
        subtitle={`${job.department} • ${job.location}`}
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Jobs", href: "/candidate/jobs" },
          { label: job.title },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <Card>
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Job information</p>
              <h1 className="mt-1 text-2xl font-semibold text-foreground">{job.title}</h1>
              <p className="text-sm text-muted-foreground">{job.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {infoRows.map((row) => (
                <div key={row.label} className="rounded-xl border border-border px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{row.label}</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{row.value}</p>
                </div>
              ))}
            </div>
            {job.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Submission readiness</p>
                <p className="text-sm text-muted-foreground">
                  Complete every checklist item below before applying.
                </p>
              </div>
              <StatusChip label={allRequirementsMet ? "Ready" : "Missing docs"} tone={allRequirementsMet ? "success" : "warning"} />
            </div>
            <Button
              size="lg"
              className="w-full"
              variant={allRequirementsMet && !hasApplied && job.status === "Open" ? "default" : "outline"}
              onClick={allRequirementsMet ? handleApply : () => setRequirementsModalOpen(true)}
              disabled={hasApplied || applying || job.status !== "Open" || !allRequirementsMet}
            >
              {hasApplied 
                ? "Applied" 
                : job.status !== "Open" 
                  ? "Job Not Available" 
                  : !allRequirementsMet 
                    ? "Upload Required Documents" 
                    : applying 
                      ? "Submitting..." 
                      : "Apply Now"}
            </Button>
            <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden />
                {job.location}
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" aria-hidden />
                Start {job.startDate ?? "TBD"}
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4" aria-hidden />
                {job.shift} • {job.hours}
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" aria-hidden />
                {job.billRate}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">Job Compliance Requirements</p>
            <p className="text-sm text-muted-foreground">
              Documents required specifically for this job. Items already in your wallet are marked.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload any missing documents before you can apply for this job.
            </p>
          </div>
          <StatusChip 
            label={`${requirementStatuses.length - missingRequiredDocuments.length}/${requirementStatuses.length} documents completed`} 
            tone={allRequirementsMet ? "success" : "warning"} 
          />
        </div>
        <div className="mt-4 space-y-3">
          {requirementStatuses.map((item) => {
            const isInWallet = (item as any).inWallet
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-border p-4 transition hover:border-primary/60"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      {isInWallet && (
                        <span className="text-xs px-2 py-0.5 rounded bg-success/10 text-success">
                          In Wallet
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.requiredAtSubmission ? "Required at submission" : "Required before start"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusChip 
                      label={item.status === "completed" ? "Completed" : "Missing"} 
                      tone={item.status === "completed" ? "success" : "danger"} 
                    />
                    {item.status === "missing" && (
                      <Button size="sm" variant="outline" onClick={() => setUploadTarget(item.name)} className="inline-flex items-center gap-2">
                        <Upload className="h-4 w-4" aria-hidden />
                        Upload document
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Modal
        open={requirementsModalOpen}
        onClose={() => setRequirementsModalOpen(false)}
        title="Documents Required Before Application"
        description="Upload these required documents to your compliance wallet before you can apply for this job."
      >
        <div className="space-y-3">
          {missingRequiredDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground">All required documents are uploaded. You can now apply!</p>
          ) : (
            missingRequiredDocuments.map((doc) => (
              <div key={doc} className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span className="text-sm font-medium text-foreground">{doc}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setRequirementsModalOpen(false)
                    setUploadTarget(doc)
                  }}
                >
                  Upload
                </Button>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setRequirementsModalOpen(false)}>
            Close
          </Button>
          <Button onClick={() => (window.location.href = "/candidate/documents")}>Go to Document Wallet</Button>
        </div>
      </Modal>

      <Modal
        open={uploadTarget !== null}
        onClose={() => {
          if (!uploading) {
            setUploadTarget(null)
          }
        }}
        title={`Upload ${uploadTarget ?? ""}`}
        description="Simulate adding this document to your wallet."
      >
        <p className="text-sm text-muted-foreground">
          This action adds a placeholder file for the selected requirement.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload document"}
          </Button>
          <Button variant="outline" onClick={() => setUploadTarget(null)} disabled={uploading}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  )
}
