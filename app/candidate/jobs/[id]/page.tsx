"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, DollarSign, MapPin, CheckCircle2, XCircle, Heart, HeartOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
  const router = useRouter()
  const { id } = React.use(params)
  const { allJobs, candidate, actions } = useDemoData()
  const { data: localDb, markJobApplied } = useLocalDb()
  const { pushToast } = useToast()

  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [applying, setApplying] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())

  // Handle client-side mounting to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
    // Load saved jobs from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("candidate_saved_jobs")
      if (saved) {
        try {
          setSavedJobs(new Set(JSON.parse(saved)))
        } catch (error) {
          console.warn("Failed to load saved jobs", error)
        }
      }
    }
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
            specialty: (dbJob as any).specialty,
            duration: (dbJob as any).duration,
            contractType: (dbJob as any).contractType,
            numberOfOpenPositions: (dbJob as any).numberOfOpenPositions,
            expectedWeeklyHours: (dbJob as any).expectedWeeklyHours,
            shiftPattern: (dbJob as any).shiftPattern,
            startDateFlexibility: (dbJob as any).startDateFlexibility,
            whoCanApply: (dbJob as any).whoCanApply,
            interviewRequired: (dbJob as any).interviewRequired,
            jobOverview: (dbJob as any).jobOverview,
            responsibilities: (dbJob as any).responsibilities,
            jobRequirements: (dbJob as any).jobRequirements,
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

  // Calculate match score
  const matchScore = useMemo(() => {
    let score = 85 + Math.floor(Math.random() * 15) // 85-100% base
    
    // Check if candidate has required documents
    const jobReq = job.complianceItems?.map((item) => item.name) || job.requirements || []
    const hasRequiredDocs = jobReq.every((req) => 
      candidate.documents.some((doc) => 
        doc.type === req && (doc.status === "Completed" || doc.status === "Pending Verification")
      )
    )
    
    if (!hasRequiredDocs) {
      score = Math.max(75, score - 10)
    }
    
    // Check occupation match
    const candidateOccupation = (localDb.onboardingDetails.occupation as string | undefined) || ""
    if (job.occupation && candidateOccupation === job.occupation) {
      score = Math.min(100, score + 5)
    }
    
    return score
  }, [job, candidate.documents, localDb.onboardingDetails.occupation])

  // Get job-specific compliance requirements
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
    if (job.complianceItems && job.complianceItems.length > 0) {
      return job.complianceItems.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        requiredAtSubmission: item.requiredAtSubmission ?? true,
      }))
    }
    if (complianceTemplate) {
      return complianceTemplate.items.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        requiredAtSubmission: item.requiredAtSubmission ?? true,
      }))
    }
    return (job.requirements ?? []).map((requirement, index) => ({
      id: `${job.id}-${index}`,
      name: requirement,
      type: "Other",
      requiredAtSubmission: true,
    }))
  }, [job.id, job.requirements, job.complianceItems, complianceTemplate])

  const requirementStatuses: RequirementStatus[] = useMemo(() => {
    return jobRequirements.map((item) => {
      const hasDocument = candidate.documents.some(
        (doc) => doc.type === item.name && (doc.status === "Completed" || doc.status === "Pending Verification")
      )
      return { 
        ...item, 
        status: hasDocument ? "completed" : "missing",
      }
    })
  }, [candidate.documents, jobRequirements])

  const missingRequiredDocuments = requirementStatuses.filter((item) => item.status === "missing").map((item) => item.name)
  const allRequirementsMet = missingRequiredDocuments.length === 0
  
  const hasApplied = Boolean(localDb.jobApplications[job.id]) || candidate.applications.some((app) => app.jobId === job.id)
  const isSaved = savedJobs.has(job.id)

  const handleSaveJob = () => {
    const newSavedJobs = new Set(savedJobs)
    if (isSaved) {
      newSavedJobs.delete(job.id)
      pushToast({ title: "Job unsaved", description: "Job removed from saved jobs.", type: "success" })
    } else {
      newSavedJobs.add(job.id)
      pushToast({ title: "Job saved", description: "Job added to saved jobs.", type: "success" })
    }
    setSavedJobs(newSavedJobs)
    if (typeof window !== "undefined") {
      localStorage.setItem("candidate_saved_jobs", JSON.stringify(Array.from(newSavedJobs)))
    }
  }

  const handleApplyClick = () => {
    if (hasApplied) {
      return
    }
    if (job.status !== "Open") {
      pushToast({ title: "Job not available", description: "This job is no longer accepting applications.", type: "error" })
      return
    }
    if (!allRequirementsMet) {
      pushToast({ 
        title: "Documents Required", 
        description: "Please upload all required documents before applying.", 
        type: "error" 
      })
      return
    }
    setConfirmModalOpen(true)
  }

  const handleSubmitApplication = async () => {
    setApplying(true)
    try {
      await actions.submitJobApplication(job.id)
      markJobApplied(job.id)
      setConfirmModalOpen(false)
      setCoverLetter("")
      pushToast({ title: "Application submitted", description: `${job.title} • ${job.location}`, type: "success" })
    } catch (error) {
      pushToast({ title: "Unable to apply", description: "Please try again.", type: "error" })
    } finally {
      setApplying(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "To be announced"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    } catch (error) {
      return dateString
    }
  }

  const formatShift = (shift?: string) => {
    if (!shift) return "Not specified"
    // If already formatted with times, return as is
    if (shift.includes("PM") || shift.includes("AM") || shift.includes("-") || shift.includes("Shift")) {
      return shift
    }
    // Map common shift types
    const shiftMap: Record<string, string> = {
      "Night": "Night Shift (7PM - 7AM)",
      "Day": "Day Shift (7AM - 7PM)",
      "Evening": "Evening Shift (3PM - 11PM)",
      "Variable": "Variable Shift",
    }
    return shiftMap[shift] || shift
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Jobs"
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Jobs", href: "/candidate/jobs" },
          { label: job.title },
        ]}
      />

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/candidate/jobs")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      {/* Job Header */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground mb-2">{job.title}</h1>
            <p className="text-lg text-muted-foreground mb-2">{job.location}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatShift(job.shift)}</span>
              </div>
              {job.duration && (
                <span>{job.duration}</span>
              )}
              <StatusChip label={`${matchScore}% Match`} tone="success" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSaveJob}
            >
              {isSaved ? (
                <>
                  <Heart className="h-4 w-4 mr-2 fill-current" />
                  Saved
                </>
              ) : (
                <>
                  <HeartOff className="h-4 w-4 mr-2" />
                  Save Job
                </>
              )}
            </Button>
            <Button
              onClick={handleApplyClick}
              disabled={hasApplied || job.status !== "Open" || !allRequirementsMet}
              className="min-w-[120px]"
            >
              {hasApplied ? "Applied" : "Apply Now"}
            </Button>
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6 pt-6 border-t border-border">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Unit</label>
            <p className="text-sm text-foreground mt-1">{job.unit || job.department}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Specialty</label>
            <p className="text-sm text-foreground mt-1">{job.specialty || job.unit || "Not specified"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Start Date</label>
            <p className="text-sm text-foreground mt-1">{formatDate(job.startDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Pay Rate</label>
            <p className="text-sm text-foreground mt-1 font-semibold">{job.billRate}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Facility Information */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Facility Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="text-sm text-foreground mt-1">{job.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Department</label>
                <p className="text-sm text-foreground mt-1">{job.department}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                <p className="text-sm text-foreground mt-1">{job.occupation || "Not specified"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Specialty</label>
                <p className="text-sm text-foreground mt-1">{job.specialty || job.unit || "Not specified"}</p>
              </div>
            </div>
          </Card>

          {/* Job Overview */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Job Overview</h2>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {job.jobOverview || job.description || "No overview available."}
            </p>
          </Card>

          {/* Job Description */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Job Description</h2>
            {job.responsibilities && job.responsibilities.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Responsibilities</h3>
                <ul className="space-y-2">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {job.jobRequirements && job.jobRequirements.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {job.jobRequirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {(!job.responsibilities || job.responsibilities.length === 0) && 
             (!job.jobRequirements || job.jobRequirements.length === 0) && (
              <p className="text-sm text-muted-foreground">{job.description || "No description available."}</p>
            )}
          </Card>

          {/* Schedule & Pay */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Schedule & Pay</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Shift</label>
                <p className="text-sm text-foreground mt-1">{formatShift(job.shift)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <p className="text-sm text-foreground mt-1">{job.duration || job.tags?.find(t => t.includes("weeks")) || "Not specified"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bill Rate</label>
                <p className="text-sm text-foreground mt-1 font-semibold">{job.billRate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contract Type</label>
                <p className="text-sm text-foreground mt-1">{job.contractType || "Not specified"}</p>
              </div>
            </div>
          </Card>

          {/* Assignment Details */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Assignment Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contract Type</label>
                <p className="text-sm text-foreground mt-1">{job.contractType || "Not specified"}</p>
              </div>
              {job.numberOfOpenPositions && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Number of Open Positions</label>
                  <p className="text-sm text-foreground mt-1">{job.numberOfOpenPositions} positions</p>
                </div>
              )}
              {job.expectedWeeklyHours && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expected Weekly Hours</label>
                  <p className="text-sm text-foreground mt-1">{job.expectedWeeklyHours}</p>
                </div>
              )}
              {job.shiftPattern && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Shift Pattern</label>
                  <p className="text-sm text-foreground mt-1">{job.shiftPattern}</p>
                </div>
              )}
              {job.startDateFlexibility && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date Flexibility</label>
                  <p className="text-sm text-foreground mt-1">{job.startDateFlexibility}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Who Can Apply */}
          {job.whoCanApply && (
            <Card>
              <h2 className="text-lg font-semibold text-foreground mb-4">Who Can Apply</h2>
              <p className="text-sm text-foreground">{job.whoCanApply}</p>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Required Documents */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Required Documents</h2>
            {requirementStatuses.length > 0 ? (
              <div className="space-y-3">
                {requirementStatuses.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <span className="text-sm text-foreground">{item.name}</span>
                    {item.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                ))}
                {allRequirementsMet && (
                  <p className="text-sm text-success mt-3 font-medium">
                    You meet all required compliance for this job
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific requirements listed.</p>
            )}
          </Card>

          {/* What Happens Next */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">What Happens Next</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Application submitted</p>
                  <p className="text-xs text-muted-foreground">Your application is reviewed by our team</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Profile review</p>
                  <p className="text-xs text-muted-foreground">2–3 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Interview (if required)</p>
                  <p className="text-xs text-muted-foreground">Video or phone interview with hiring manager</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Offer decision</p>
                  <p className="text-xs text-muted-foreground">You'll receive notification of the decision</p>
                </div>
              </div>
            </div>
            {job.interviewRequired && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground">Interview Required: Yes</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Job Compliance Requirements */}
      <Card>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Job Compliance Requirements</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Documents required specifically for this job. Upload any missing documents before you can apply.
            </p>
          </div>
          <StatusChip 
            label={`${requirementStatuses.length - missingRequiredDocuments.length}/${requirementStatuses.length} documents completed`} 
            tone={allRequirementsMet ? "success" : "warning"} 
          />
        </div>
        <div className="space-y-3">
          {requirementStatuses.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.requiredAtSubmission ? "Required at submission" : "Required before start"}
                  </p>
                </div>
                <StatusChip 
                  label={item.status === "completed" ? "Verified" : "Missing"} 
                  tone={item.status === "completed" ? "success" : "danger"} 
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        open={confirmModalOpen}
        onClose={() => {
          if (!applying) {
            setConfirmModalOpen(false)
            setCoverLetter("")
          }
        }}
        title="Confirm Application"
        description={`You're applying for ${job.title}`}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Position:</p>
            <p className="text-sm text-muted-foreground">{job.title}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Location:</p>
            <p className="text-sm text-muted-foreground">{job.location}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Pay Rate:</p>
            <p className="text-sm text-muted-foreground">{job.billRate}</p>
          </div>
          <div className="space-y-2 pt-4 border-t border-border">
            <label className="text-sm font-medium text-foreground">Cover Letter (Optional)</label>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Add a personal message to the hiring manager..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setConfirmModalOpen(false)
              setCoverLetter("")
            }}
            disabled={applying}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitApplication}
            disabled={applying}
          >
            {applying ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
