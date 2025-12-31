"use client"

import { Suspense, useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, ArrowLeft, MoreVertical, Eye, User, Upload, Calendar, Plus, X, UserPlus, FileText } from "lucide-react"
import { DatePicker } from "@/components/system"
import { DataTable } from "@/components/system/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getCurrentOrganization,
  getApplicationsByOrganization,
  updateApplication,
  getApplicationById,
  getJobById,
} from "@/lib/organization-local-db"
import { candidates } from "@/lib/mock-data"
import { useLocalDb } from "@/components/providers/local-db-provider"
import {
  getOccupationByCode,
  getQuestionnaireByOccupationId,
  getGeneralQuestionnaire,
} from "@/lib/admin-local-db"

type ApplicationStatus = "Submitted" | "Qualified" | "Shortlisted" | "Offer" | "Accepted" | "Withdrawn" | "Rejected"

type SubmissionListItem = {
  id: string
  candidateName: string
  candidateEmail: string
  jobTitle: string
  occupation: string
  specialty: string
  applicationDate: string
  status: ApplicationStatus
}

// Mock data - in production, this would come from the database
const mockSubmissions: SubmissionListItem[] = [
  {
    id: "app-1",
    candidateName: "Maria Garcia",
    candidateEmail: "maria.garcia@email.com",
    jobTitle: "ICU Registered Nurse",
    occupation: "Registered Nurse (RN)",
    specialty: "ICU",
    applicationDate: "Dec 15, 2024",
    status: "Submitted",
  },
  {
    id: "app-2",
    candidateName: "David Wilson",
    candidateEmail: "d.wilson@email.com",
    jobTitle: "Oncology RN",
    occupation: "Registered Nurse (RN)",
    specialty: "Oncology",
    applicationDate: "Dec 17, 2024",
    status: "Submitted",
  },
]

export default function SubmissionsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 p-8">
          <Header
            title="Submissions"
            subtitle="Manage and review candidate submissions"
            breadcrumbs={[
              { label: "Organization", href: "/organization/dashboard" },
              { label: "Submissions" },
            ]}
          />
          <Card>
            <div className="h-64 animate-pulse rounded-md bg-muted" />
          </Card>
        </div>
      }
    >
      <SubmissionsPageInner />
    </Suspense>
  )
}

function SubmissionsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { pushToast } = useToast()
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(
    searchParams.get("id") || null
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">("All")
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orgId = getCurrentOrganization()
      setCurrentOrgId(orgId)
      if (orgId) {
        const orgApplications = getApplicationsByOrganization(orgId)
        setApplications(orgApplications)
      }
    }
  }, [])

  const statusCounts = useMemo(() => {
    const counts: Record<ApplicationStatus, number> = {
      Submitted: 0,
      Qualified: 0,
      Shortlisted: 0,
      Offer: 0,
      Accepted: 0,
      Withdrawn: 0,
      Rejected: 0,
    }
    applications.forEach((app) => {
      if (app.status in counts) {
        counts[app.status as ApplicationStatus]++
      }
    })
    return counts
  }, [applications])

  const filteredSubmissions = useMemo(() => {
    let filtered = applications.length > 0 ? applications.map((app) => {
      const candidate = candidates.find((c) => c.id === app.candidateId)
      const job = getJobById(app.jobId)
      return {
        id: app.id,
        candidateName: app.candidateName || candidate?.name || "Unknown",
        candidateEmail: candidate?.email || "",
        jobTitle: job?.title || "Unknown Job",
        occupation: candidate?.role || "Unknown",
        specialty: candidate?.specialty || "",
        applicationDate: new Date(app.submittedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: app.status as ApplicationStatus,
      }
    }) : mockSubmissions

    if (statusFilter !== "All") {
      filtered = filtered.filter((s) => s.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.candidateName.toLowerCase().includes(query) ||
          s.candidateEmail.toLowerCase().includes(query) ||
          s.jobTitle.toLowerCase().includes(query) ||
          s.occupation.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [applications, statusFilter, searchQuery])

  const handleViewDetails = (id: string) => {
    router.push(`/organization/applications?id=${id}`)
    setSelectedSubmissionId(id)
  }

  const handleViewProfile = (id: string) => {
    const app = applications.find((a) => a.id === id) || mockSubmissions.find((s) => s.id === id)
    if (app) {
      const candidate = candidates.find((c) => c.id === app.candidateId)
      if (candidate) {
        setSelectedCandidateId(candidate.id)
        setIsProfileModalOpen(true)
      }
    }
  }

  const columns = [
    {
      id: "candidate",
      label: "Candidate",
      sortable: true,
      render: (submission: SubmissionListItem) => (
        <div>
          <p className="font-medium text-foreground">{submission.candidateName}</p>
          <p className="text-sm text-muted-foreground">{submission.candidateEmail}</p>
        </div>
      ),
    },
    { id: "jobTitle", label: "Job Title", sortable: true },
    { id: "occupation", label: "Occupation", sortable: true },
    {
      id: "specialty",
      label: "",
      sortable: false,
      render: (submission: SubmissionListItem) => (
        <span className="text-sm text-muted-foreground">{submission.specialty}</span>
      ),
    },
    { id: "applicationDate", label: "Application Date", sortable: true },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (submission: SubmissionListItem) => (
        <StatusChip
          status={
            submission.status === "Accepted"
              ? "success"
              : submission.status === "Rejected" || submission.status === "Withdrawn"
              ? "error"
              : "info"
          }
          label={submission.status}
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      sortable: false,
      render: (submission: SubmissionListItem) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="backdrop-blur-sm bg-card/95">
            <DropdownMenuItem onClick={() => handleViewDetails(submission.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewProfile(submission.id)}>
              <User className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  if (selectedSubmissionId) {
    return (
      <SubmissionDetailView
        submissionId={selectedSubmissionId}
        onBack={() => {
          setSelectedSubmissionId(null)
          router.push("/organization/applications")
        }}
        currentOrgId={currentOrgId}
      />
    )
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Submissions"
        subtitle="Manage and review candidate submissions"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Submissions" },
        ]}
      />

      <Card>
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("All")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                statusFilter === "All"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All ({applications.length || mockSubmissions.length})
            </button>
            {(["Submitted", "Qualified", "Shortlisted", "Offer", "Accepted", "Withdrawn", "Rejected"] as ApplicationStatus[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    statusFilter === status
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {status} ({statusCounts[status] || 0})
                </button>
              )
            )}
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            rows={filteredSubmissions}
            rowKey={(row) => row.id}
          />
        </div>
      </Card>

      {/* Candidate Profile Modal */}
      <CandidateProfileModal
        open={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false)
          setSelectedCandidateId(null)
        }}
        candidateId={selectedCandidateId}
        applications={applications}
      />
    </div>
  )
}

function SubmissionDetailView({
  submissionId,
  onBack,
  currentOrgId,
}: {
  submissionId: string
  onBack: () => void
  currentOrgId: string | null
}) {
  const { pushToast } = useToast()
  const { data: localDb } = useLocalDb()
  const [status, setStatus] = useState<ApplicationStatus>("Submitted")
  const [summaryNote, setSummaryNote] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [rtoEntries, setRtoEntries] = useState<Array<{ type: "Single Date" | "Date Range"; date?: string; startDate?: string; endDate?: string }>>([])
  const [newRtoType, setNewRtoType] = useState<"Single Date" | "Date Range">("Single Date")
  const [newRtoDate, setNewRtoDate] = useState("")
  const [newRtoStartDate, setNewRtoStartDate] = useState("")
  const [newRtoEndDate, setNewRtoEndDate] = useState("")
  const [application, setApplication] = useState<any>(null)
  const [candidate, setCandidate] = useState<any>(null)
  const [job, setJob] = useState<any>(null)

  // Load application and related data
  useEffect(() => {
    if (currentOrgId) {
      const app = getApplicationById(submissionId)
      if (app) {
        setApplication(app)
        setStatus(app.status as ApplicationStatus)
        
        // Load candidate
        const cand = candidates.find((c) => c.id === app.candidateId)
        if (cand) {
          setCandidate(cand)
        }
        
        // Load job
        const jobData = getJobById(app.jobId)
        if (jobData) {
          setJob(jobData)
        }
      }
    }
  }, [submissionId, currentOrgId])

  // Get candidate data from localDB if available
  const candidateLocalDb = candidate ? localDb.candidates?.[candidate.id] : null
  const onboardingDetails = candidateLocalDb?.onboardingDetails || {}
  const questionnaireAnswers = onboardingDetails.questionnaireAnswers as Record<string, any> || {}
  const occupationCode = onboardingDetails.occupation as string || candidate?.role || ""
  const occupation = occupationCode ? getOccupationByCode(occupationCode) : null
  const occupationQuestionnaire = occupation ? getQuestionnaireByOccupationId(occupation.id) : null

  // Build questionnaire responses from stored answers
  const buildQuestionnaireResponses = (questions: any[] | null, answers: Record<string, any>) => {
    if (!questions) return []
    return questions
      .filter((q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== "")
      .map((q) => {
        const answer = answers[q.id]
        let displayAnswer = ""
        if (Array.isArray(answer)) {
          displayAnswer = answer.join(", ")
        } else if (answer instanceof File) {
          displayAnswer = answer.name
        } else {
          displayAnswer = String(answer)
        }
        return { question: q.question, answer: displayAnswer }
      })
  }

  const occupationalQuestionnaireResponses = buildQuestionnaireResponses(
    occupationQuestionnaire?.questions || [],
    questionnaireAnswers
  )

  // Build submission data from loaded application, candidate, and localDB
  const submissionData = {
    id: submissionId,
    candidateName: candidate?.name || application?.candidateName || "Unknown",
    workforceGroup: "Agency Worker", // TODO: Get from candidate profile or application
    email: candidate?.email || "",
    phone: candidate?.phone || (onboardingDetails.phoneNumber as string) || "",
    address: `${onboardingDetails.address || ""} ${onboardingDetails.city || ""}, ${onboardingDetails.state || ""} ${onboardingDetails.zipCode || ""}`.trim() || "Not provided",
    occupation: occupation?.name || candidate?.role || job?.occupation || "Unknown",
    specialty: candidate?.specialties?.[0] || job?.specialty || "",
    preferredShifts: Array.isArray(onboardingDetails.preferredShift) 
      ? onboardingDetails.preferredShift.join(", ")
      : (onboardingDetails.preferredShift as string) || candidate?.shiftPreference || "Not specified",
    shiftTypes: Array.isArray(onboardingDetails.preferredWorkType)
      ? onboardingDetails.preferredWorkType.join(", ")
      : (onboardingDetails.preferredWorkType as string) || "Not specified",
    availableStartDate: onboardingDetails.availableStart ? new Date(onboardingDetails.availableStart as string).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "Not specified",
    mostRecentJobTitle: onboardingDetails.recentJobTitle as string || "Not provided",
    totalYearsExperience: onboardingDetails.yearsOfExperience ? `${onboardingDetails.yearsOfExperience} years` : candidate?.experienceYears ? `${candidate.experienceYears} years` : "Not provided",
    dateOfBirth: onboardingDetails.dateOfBirth ? new Date(onboardingDetails.dateOfBirth as string).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "Not provided",
    ssnLastFour: onboardingDetails.ssnLast4 ? `****${onboardingDetails.ssnLast4}` : "Not provided",
    occupationalQuestionnaire: occupationalQuestionnaireResponses.length > 0
      ? occupationalQuestionnaireResponses
      : [
          { question: "Do you have experience with ventilator management?", answer: "Yes, 5+ years" },
          {
            question: "Are you certified in CRRT (Continuous Renal Replacement Therapy)?",
            answer: "Yes, certified in 2020",
          },
          { question: "Have you worked with ECMO patients?", answer: "Yes, extensive experience" },
          {
            question: "Do you have experience with post-operative cardiac care?",
            answer: "Yes, 3 years in cardiac ICU",
          },
        ],
    specialtyQuestionnaire: [], // TODO: Load specialty-specific questionnaire if available
    requestedTimeOff: [
      ...(onboardingDetails.requestedTimeOff1
        ? [{ type: "Single Date" as const, date: new Date(onboardingDetails.requestedTimeOff1 as string).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) }]
        : []),
      ...(onboardingDetails.requestedTimeOff2
        ? [{ type: "Single Date" as const, date: new Date(onboardingDetails.requestedTimeOff2 as string).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) }]
        : []),
      // Fallback to mock data if no RTO in onboarding
      ...(onboardingDetails.requestedTimeOff1 || onboardingDetails.requestedTimeOff2
        ? []
        : [
            { type: "Single Date" as const, date: "03/15/2025" },
            { type: "Date Range" as const, startDate: "04/10/2025", endDate: "04/12/2025" },
          ]),
    ],
    compliancePercentage: 43, // TODO: Calculate from compliance checklist
    locationsWillingToWork: Array.isArray(onboardingDetails.preferredLocations)
      ? onboardingDetails.preferredLocations.join(", ")
      : (onboardingDetails.preferredLocations as string) || "Not specified",
    floatingPreference: (onboardingDetails.floatingPreference as string) || "Not specified",
    flexibleShiftTypes: Array.isArray(onboardingDetails.preferredShift)
      ? onboardingDetails.preferredShift.join(", ")
      : (onboardingDetails.preferredShift as string) || "Not specified",
    extensionWillingness: (onboardingDetails.extensionWillingness as string) || "Not specified",
    complianceChecklist: candidate?.documents
      ? candidate.documents.map((doc) => ({
          item: doc.name || doc.type,
          status: doc.status === "Completed" ? ("Uploaded" as const) : ("Missing" as const),
          uploadDate: doc.lastUpdated
            ? new Date(doc.lastUpdated).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : undefined,
        }))
      : [
          { item: "Resume / CV", status: "Uploaded" as const, uploadDate: "12/15/2024" },
          { item: "Professional License (RN)", status: "Uploaded" as const, uploadDate: "12/10/2024" },
          { item: "Skills Checklist", status: "Missing" as const },
        ],
    existingSummaryNote:
      (onboardingDetails.summaryNote as string) ||
      candidate?.summary ||
      "Experienced ICU nurse with extensive trauma care background. Worked at Level 1 trauma centers for the past 5 years.",
  }

  useEffect(() => {
    setSummaryNote(submissionData.existingSummaryNote)
    setStatus("Submitted")
    setRtoEntries(submissionData.requestedTimeOff)
    
    // Load actual application data if available
    if (currentOrgId) {
      const app = getApplicationById(submissionId)
      if (app) {
        setStatus(app.status as ApplicationStatus)
        // TODO: Load actual candidate data, questionnaire responses, RTO, etc. from database
      }
    }
  }, [submissionId, currentOrgId])

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!currentOrgId) {
      pushToast({
        title: "Error",
        description: "No organization selected",
        type: "error",
      })
      return
    }

    setIsSaving(true)
    try {
      const updated = updateApplication(submissionId, { status: newStatus })
      if (updated) {
        setStatus(newStatus)
        pushToast({
          title: "Success",
          description: `Status updated to ${newStatus}`,
          type: "success",
        })
      } else {
        pushToast({
          title: "Error",
          description: "Failed to update status",
          type: "error",
        })
      }
    } catch (error) {
      console.error(error)
      pushToast({
        title: "Error",
        description: "Failed to update status",
        type: "error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSummaryNote = async () => {
    if (!currentOrgId) return

    setIsSaving(true)
    try {
      // TODO: Save summary note to application
      pushToast({
        title: "Success",
        description: "Summary note saved",
        type: "success",
      })
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to save summary note",
        type: "error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Submissions
        </Button>
        <Select value={status} onValueChange={(value) => handleStatusChange(value as ApplicationStatus)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="backdrop-blur-sm bg-card/95">
            {(["Submitted", "Qualified", "Shortlisted", "Offer", "Accepted", "Withdrawn", "Rejected"] as ApplicationStatus[]).map(
              (s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <Header
        title="Submission Details"
        subtitle="View candidate submission information"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Submissions", href: "/organization/applications" },
          { label: "Details" },
        ]}
        actions={[
          {
            id: "status",
            label: status,
            variant: "secondary",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card title={submissionData.candidateName}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Workforce Group</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.workforceGroup}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Phone</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.phone}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.email}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Address</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.address}</p>
              </div>
            </div>
          </Card>

          {/* Occupation & Specialty */}
          <Card title="Occupation & Specialty">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Occupation</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.occupation}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Specialty</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.specialty}</p>
              </div>
            </div>
          </Card>

          {/* Core Candidate Information */}
          <Card title="Core Candidate Information">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Preferred Shifts</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.preferredShifts}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Shift Types</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.shiftTypes}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Available Start Date</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.availableStartDate}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Most Recent Job Title</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.mostRecentJobTitle}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Total Years of Experience</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.totalYearsExperience}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Date of Birth</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.dateOfBirth}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">SSN Last Four</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.ssnLastFour}</p>
              </div>
            </div>
          </Card>

          {/* Occupational Questionnaire */}
          <Card title="Occupational Questionnaire Responses">
            <div className="space-y-4">
              {submissionData.occupationalQuestionnaire.map((q, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{q.question}</p>
                  <p className="text-sm text-muted-foreground">{q.answer}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Specialty Questionnaire */}
          <Card title={`Specialty Questionnaire Responses (${submissionData.specialty})`}>
            <div className="space-y-4">
              {submissionData.specialtyQuestionnaire.map((q, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{q.question}</p>
                  <p className="text-sm text-muted-foreground">{q.answer}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Requested Time Off */}
          <Card title="Requested Time Off (RTO)">
            <div className="space-y-4">
              {rtoEntries.map((rto, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{rto.type}:</span>
                    {rto.type === "Single Date" ? (
                      <span className="text-sm font-medium text-foreground">{rto.date}</span>
                    ) : (
                      <span className="text-sm font-medium text-foreground">
                        {rto.startDate} - {rto.endDate}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRtoEntries(rtoEntries.filter((_, i) => i !== idx))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="space-y-3 rounded-lg border border-border p-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Select value={newRtoType} onValueChange={(value) => setNewRtoType(value as "Single Date" | "Date Range")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-card/95">
                      <SelectItem value="Single Date">Single Date</SelectItem>
                      <SelectItem value="Date Range">Date Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newRtoType === "Single Date" ? (
                  <DatePicker
                    label=""
                    value={newRtoDate}
                    onChange={setNewRtoDate}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <DatePicker
                      label=""
                      value={newRtoStartDate}
                      onChange={setNewRtoStartDate}
                    />
                    <DatePicker
                      label=""
                      value={newRtoEndDate}
                      onChange={setNewRtoEndDate}
                    />
                  </div>
                )}
                
                <Button
                  onClick={() => {
                    if (newRtoType === "Single Date" && newRtoDate) {
                      setRtoEntries([...rtoEntries, { type: "Single Date", date: newRtoDate }])
                      setNewRtoDate("")
                    } else if (newRtoType === "Date Range" && newRtoStartDate && newRtoEndDate) {
                      setRtoEntries([...rtoEntries, { type: "Date Range", startDate: newRtoStartDate, endDate: newRtoEndDate }])
                      setNewRtoStartDate("")
                      setNewRtoEndDate("")
                    }
                  }}
                  className="ph5-button-primary"
                  disabled={
                    (newRtoType === "Single Date" && !newRtoDate) ||
                    (newRtoType === "Date Range" && (!newRtoStartDate || !newRtoEndDate))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add RTO
                </Button>
              </div>
            </div>
          </Card>

          {/* Priority Factors */}
          <Card title="Priority Factors">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Compliance: {submissionData.compliancePercentage}%</Label>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Locations Willing to Work</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.locationsWillingToWork}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Floating Preference</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.floatingPreference}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Flexible Shift Types</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.flexibleShiftTypes}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Extension Willingness</Label>
                <p className="text-sm font-medium text-foreground">{submissionData.extensionWillingness}</p>
              </div>
            </div>
          </Card>

          {/* Compliance Checklist */}
          <Card title="Compliance Checklist (At Time of Submission)">
            <div className="space-y-3">
              {submissionData.complianceChecklist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.item}</p>
                    {item.uploadDate && (
                      <p className="text-xs text-muted-foreground">Uploaded: {item.uploadDate}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "Uploaded" ? (
                      <StatusChip status="success" label="Uploaded" />
                    ) : (
                      <>
                        <StatusChip status="error" label="Missing" />
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Candidate Summary Note */}
          <Card title="Candidate Summary Note">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Existing Summary Note</Label>
                <p className="text-sm text-foreground">{submissionData.existingSummaryNote}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Enter or update summary note (optional)
                </Label>
                <Textarea
                  value={summaryNote}
                  onChange={(e) => setSummaryNote(e.target.value)}
                  placeholder="Enter summary note..."
                  rows={4}
                />
              </div>
              <Button onClick={handleSaveSummaryNote} disabled={isSaving} className="ph5-button-primary">
                Save Note
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
    <div className="space-y-6">
          <Card title="Submission Status">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Select New Status</Label>
                <Select value={status} onValueChange={(value) => handleStatusChange(value as ApplicationStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm bg-card/95">
                    {(["Submitted", "Qualified", "Shortlisted", "Offer", "Accepted", "Withdrawn", "Rejected"] as ApplicationStatus[]).map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CandidateProfileModal({
  open,
  onClose,
  candidateId,
  applications,
}: {
  open: boolean
  onClose: () => void
  candidateId: string | null
  applications: any[]
}) {
  const { pushToast } = useToast()
  const candidate = candidateId ? candidates.find((c) => c.id === candidateId) : null
  const application = candidate ? applications.find((app) => app.candidateId === candidate.id) : null
  const job = application ? getJobById(application.jobId) : null

  if (!candidate || !application) return null

  const handleAddToTalentCommunity = () => {
    // TODO: Implement add to talent community functionality
    pushToast({
      title: "Success",
      description: "Candidate added to talent community",
      type: "success",
    })
    onClose()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Candidate Profile</DialogTitle>
          <DialogDescription>Job Application</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{candidate.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {candidate.role || "Unknown"} • {candidate.specialties?.[0] || "N/A"}
              </p>
            </div>
            <Button onClick={handleAddToTalentCommunity} className="ph5-button-primary">
              <UserPlus className="mr-2 h-4 w-4" />
              Add to Talent Community
            </Button>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="text-sm font-medium text-foreground">{candidate.email || "Not provided"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Phone</Label>
                <p className="text-sm font-medium text-foreground">{candidate.phone || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Professional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Occupation</Label>
                <p className="text-sm font-medium text-foreground">{candidate.role || "Not provided"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Specialty</Label>
                <p className="text-sm font-medium text-foreground">{candidate.specialties?.[0] || "Not provided"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Workforce Group</Label>
                <p className="text-sm font-medium text-foreground">
                  {job?.department || job?.unit || "Nursing Staff"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Location</Label>
                <p className="text-sm font-medium text-foreground">
                  {job?.location || candidate.location || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Application Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Application Date</Label>
                <p className="text-sm font-medium text-foreground">{formatDate(application.submittedAt)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Status</Label>
                <StatusChip
                  status={
                    application.status === "Accepted"
                      ? "success"
                      : application.status === "Rejected" || application.status === "Withdrawn"
                      ? "error"
                      : "info"
                  }
                  label={application.status}
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Documents</h3>
            <div className="space-y-3">
              {candidate.documents && candidate.documents.length > 0 ? (
                candidate.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.name || doc.type}</p>
                        {doc.lastUpdated && (
                          <p className="text-xs text-muted-foreground">
                            Uploaded {new Date(doc.lastUpdated).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusChip
                        status={doc.status === "Completed" ? "success" : "warning"}
                        label={doc.status === "Completed" ? "Uploaded" : doc.status}
                      />
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
