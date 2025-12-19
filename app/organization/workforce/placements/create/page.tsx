"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header, Card, MultiStepForm, type StepDefinition, Avatar, StatusChip } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getCurrentOrganization,
  getJobsByOrganization,
  addPlacement,
} from "@/lib/organization-local-db"
import { getApplicationsByOrganization } from "@/lib/organization-local-db"
import { candidates } from "@/lib/mock-data"

type FormData = {
  candidateId: string
  jobId: string
  startDate: string
  endDate: string
  shiftType: string
  billRate: string
  notes: string
}

export default function CreateAssignmentPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    candidateId: "",
    jobId: "",
    startDate: "",
    endDate: "",
    shiftType: "",
    billRate: "",
    notes: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orgId = getCurrentOrganization()
      setCurrentOrgId(orgId)
    }
  }, [])

  // Get available candidates (from accepted applications)
  const availableCandidates = useMemo(() => {
    if (!currentOrgId) return []
    const applications = getApplicationsByOrganization(currentOrgId)
    const acceptedAppIds = applications
      .filter((app) => app.status === "Accepted" || app.status === "Offer")
      .map((app) => app.candidateId)
    return candidates.filter((c) => acceptedAppIds.includes(c.id))
  }, [currentOrgId])

  // Filter candidates by search
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return availableCandidates
    const query = searchQuery.toLowerCase()
    return availableCandidates.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
    )
  }, [availableCandidates, searchQuery])

  // Get organization jobs
  const orgJobs = useMemo(() => {
    if (!currentOrgId) return []
    return getJobsByOrganization(currentOrgId)
  }, [currentOrgId])

  // Get selected candidate and job
  const selectedCandidate = useMemo(() => {
    return candidates.find((c) => c.id === formData.candidateId)
  }, [formData.candidateId])

  const selectedJob = useMemo(() => {
    return orgJobs.find((j) => j.id === formData.jobId)
  }, [orgJobs, formData.jobId])

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (step === 0) {
      if (!formData.candidateId) {
        newErrors.candidateId = "Please select a worker"
      }
    } else if (step === 1) {
      if (!formData.jobId) {
        newErrors.jobId = "Please select a job/requisition"
      }
    } else if (step === 2) {
      if (!formData.startDate) {
        newErrors.startDate = "Start date is required"
      }
      if (!formData.endDate) {
        newErrors.endDate = "End date is required"
      }
      if (!formData.shiftType) {
        newErrors.shiftType = "Shift type is required"
      }
      if (!formData.billRate) {
        newErrors.billRate = "Bill rate is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      router.back()
    }
  }

  const handleCreateAssignment = async () => {
    if (!currentOrgId || !selectedCandidate || !selectedJob) {
      pushToast({
        title: "Error",
        description: "Missing required information.",
        type: "error",
      })
      return
    }

    setSaving(true)

    try {
      // Get candidate avatar initials
      const nameParts = selectedCandidate.name.split(" ")
      const avatar = nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : selectedCandidate.name.substring(0, 2).toUpperCase()

      // Determine status based on dates
      const today = new Date()
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      let status: "Active" | "Upcoming" | "Completed" | "Ending Soon" = "Active"
      
      if (startDate > today) {
        status = "Upcoming"
      } else if (endDate < today) {
        status = "Completed"
      } else {
        const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntilEnd <= 30) {
          status = "Ending Soon"
        }
      }

      // Check compliance status from candidate documents
      const completedDocs = selectedCandidate.documents.filter(
        (doc) => doc.status === "Completed"
      )
      const requiredDocs = selectedJob.requirements || []
      const hasAllDocs = requiredDocs.every((req) =>
        completedDocs.some((doc) => doc.type === req)
      )
      const complianceStatus: "Complete" | "Expiring" | "Missing" = hasAllDocs
        ? "Complete"
        : "Missing"

      addPlacement(currentOrgId, {
        candidateId: formData.candidateId,
        candidateName: selectedCandidate.name,
        candidateEmail: selectedCandidate.email,
        candidateAvatar: avatar,
        jobId: formData.jobId,
        jobTitle: selectedJob.title,
        requisitionId: `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
        location: selectedJob.location,
        department: selectedJob.department,
        startDate: formData.startDate,
        endDate: formData.endDate,
        shiftType: formData.shiftType,
        billRate: formData.billRate,
        notes: formData.notes,
        status,
        complianceStatus,
      })

      pushToast({
        title: "Success",
        description: "Assignment created successfully.",
        type: "success",
      })

      router.push("/organization/workforce/placements")
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to create assignment.",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  // Step 1: Select Worker
  const step1Content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search Workers</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Only candidates with "Accepted" status are available for assignment.
        </p>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredCandidates.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {searchQuery ? "No workers found matching your search." : "No accepted candidates available."}
          </div>
        ) : (
          filteredCandidates.map((candidate) => {
            const nameParts = candidate.name.split(" ")
            const avatar = nameParts.length >= 2
              ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
              : candidate.name.substring(0, 2).toUpperCase()

            const completedDocs = candidate.documents.filter(
              (doc) => doc.status === "Completed"
            )
            const complianceStatus = completedDocs.length > 0 ? "Complete" : "Missing"

            return (
              <button
                key={candidate.id}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, candidateId: candidate.id })
                  setErrors({ ...errors, candidateId: undefined })
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                  formData.candidateId === candidate.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <Avatar name={avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{candidate.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{candidate.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusChip status="Accepted" variant="success" />
                  <StatusChip status={complianceStatus} variant={complianceStatus === "Complete" ? "success" : "error"} />
                  {formData.candidateId === candidate.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
      {errors.candidateId && (
        <p className="text-sm text-destructive">{errors.candidateId}</p>
      )}
    </div>
  )

  // Step 2: Select Job/Requisition
  const step2Content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="job">Select Job / Requisition *</Label>
        <Select
          value={formData.jobId}
          onValueChange={(value) => {
            setFormData({ ...formData, jobId: value })
            setErrors({ ...errors, jobId: undefined })
          }}
        >
          <SelectTrigger id="job" className="w-full bg-background">
            <SelectValue placeholder="Select a job or requisition" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {orgJobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title} - {job.location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.jobId && (
          <p className="text-sm text-destructive">{errors.jobId}</p>
        )}
      </div>

      {selectedJob && (
        <Card className="p-4 bg-muted/30">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-foreground">Job Title: </span>
              <span className="text-sm text-foreground">{selectedJob.title}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Location: </span>
              <span className="text-sm text-foreground">{selectedJob.location}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Department: </span>
              <span className="text-sm text-foreground">{selectedJob.department}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Unit: </span>
              <span className="text-sm text-foreground">{selectedJob.unit}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )

  // Step 3: Assignment Details
  const step3Content = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">
            Start Date *
          </Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              setFormData({ ...formData, startDate: e.target.value })
              setErrors({ ...errors, startDate: undefined })
            }}
            className={errors.startDate ? "border-destructive" : ""}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">
            End Date *
          </Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => {
              setFormData({ ...formData, endDate: e.target.value })
              setErrors({ ...errors, endDate: undefined })
            }}
            className={errors.endDate ? "border-destructive" : ""}
          />
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shiftType">
            Shift Type *
          </Label>
          <Select
            value={formData.shiftType}
            onValueChange={(value) => {
              setFormData({ ...formData, shiftType: value })
              setErrors({ ...errors, shiftType: undefined })
            }}
          >
            <SelectTrigger id="shiftType" className={errors.shiftType ? "border-destructive" : ""}>
              <SelectValue placeholder="Select shift type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Day Shift">Day Shift</SelectItem>
              <SelectItem value="Night Shift">Night Shift</SelectItem>
              <SelectItem value="Evening Shift">Evening Shift</SelectItem>
              <SelectItem value="Variable Shift">Variable Shift</SelectItem>
              <SelectItem value="Rotational Shift">Rotational Shift</SelectItem>
            </SelectContent>
          </Select>
          {errors.shiftType && (
            <p className="text-sm text-destructive">{errors.shiftType}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="billRate">
            Bill Rate *
          </Label>
          <Input
            id="billRate"
            type="text"
            placeholder="e.g., $75.00/hr"
            value={formData.billRate}
            onChange={(e) => {
              setFormData({ ...formData, billRate: e.target.value })
              setErrors({ ...errors, billRate: undefined })
            }}
            className={errors.billRate ? "border-destructive" : ""}
          />
          {errors.billRate && (
            <p className="text-sm text-destructive">{errors.billRate}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes about this assignment..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  )

  // Step 4: Review & Confirm
  const step4Content = (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Worker Information</h3>
          {selectedCandidate && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={
                    selectedCandidate.name.split(" ").length >= 2
                      ? `${selectedCandidate.name.split(" ")[0][0]}${selectedCandidate.name.split(" ")[1][0]}`.toUpperCase()
                      : selectedCandidate.name.substring(0, 2).toUpperCase()
                  }
                  size="sm"
                />
                <div>
                  <div className="font-medium text-foreground">{selectedCandidate.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedCandidate.email}</div>
                </div>
                <div className="ml-auto">
                  <StatusChip
                    status="Complete"
                    variant="success"
                    label="Compliance: Complete"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Job Information</h3>
          {selectedJob && (
            <Card className="p-4 space-y-2">
              <div>
                <span className="text-sm font-medium text-foreground">Job Title: </span>
                <span className="text-sm text-foreground">{selectedJob.title}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">Requisition ID: </span>
                <span className="text-sm text-foreground">
                  REQ-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 1000)).padStart(3, "0")}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">Location: </span>
                <span className="text-sm text-foreground">{selectedJob.location}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">Department: </span>
                <span className="text-sm text-foreground">{selectedJob.department}</span>
              </div>
            </Card>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Assignment Details</h3>
          <Card className="p-4 space-y-2">
            <div>
              <span className="text-sm font-medium text-foreground">Start Date: </span>
              <span className="text-sm text-foreground">{formData.startDate}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">End Date: </span>
              <span className="text-sm text-foreground">{formData.endDate}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Shift Type: </span>
              <span className="text-sm text-foreground">{formData.shiftType}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Bill Rate: </span>
              <span className="text-sm text-foreground">{formData.billRate}</span>
            </div>
            {formData.notes && (
              <div>
                <span className="text-sm font-medium text-foreground">Notes: </span>
                <span className="text-sm text-foreground">{formData.notes}</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )

  const steps: StepDefinition[] = [
    {
      id: "select-worker",
      title: "Select Worker",
      content: step1Content,
    },
    {
      id: "select-job",
      title: "Select Job / Requisition",
      content: step2Content,
    },
    {
      id: "assignment-details",
      title: "Assignment Details",
      content: step3Content,
    },
    {
      id: "review",
      title: "Review & Confirm",
      content: step4Content,
    },
  ]

  return (
    <>
      <Header
        title="Create New Assignment"
        subtitle="Create assignments for accepted candidates to connect workers with job requisitions."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Workforce", href: "/organization/workforce" },
          { label: "Placements", href: "/organization/workforce/placements" },
          { label: "Create Assignment" },
        ]}
      />

      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                  index <= currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1",
                    index < currentStep ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <MultiStepForm
          steps={steps}
          activeStep={currentStep}
          onBack={handleBack}
          onNext={handleNext}
          onSave={currentStep === 3 ? handleCreateAssignment : undefined}
          saving={saving}
          nextLabel="Next"
          finishLabel="Create Assignment"
          primaryDisabled={
            (currentStep === 0 && !formData.candidateId) ||
            (currentStep === 1 && !formData.jobId) ||
            (currentStep === 2 && (!formData.startDate || !formData.endDate || !formData.shiftType || !formData.billRate))
          }
        />
      </section>
    </>
  )
}
