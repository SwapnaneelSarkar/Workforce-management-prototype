"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, Header, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, DollarSign, CheckCircle2 } from "lucide-react"
import { getJobById } from "@/lib/organization-local-db"

export default function ApplicationDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const applicationId = params?.id as string
  const { candidate, allJobs } = useDemoData()
  const { data: localDb } = useLocalDb()
  const [application, setApplication] = useState<any>(null)
  const [job, setJob] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && applicationId) {
      // Find application from candidate.applications or localDb
      const appFromCandidate = candidate.applications.find((app) => app.id === applicationId)
      
      if (appFromCandidate) {
        setApplication(appFromCandidate)
        const foundJob = allJobs.find((j) => j.id === appFromCandidate.jobId) || getJobById(appFromCandidate.jobId)
        setJob(foundJob || null)
      } else {
        // Try to find from localDb
        const jobId = Object.keys(localDb.jobApplications).find((jid) => {
          const entry = localDb.jobApplications[jid]
          return `local-${jid}` === applicationId
        })
        
        if (jobId) {
          const entry = localDb.jobApplications[jobId]
          const foundJob = allJobs.find((j) => j.id === jobId) || getJobById(jobId)
          setApplication({
            id: applicationId,
            jobId,
            candidateId: candidate.profile.id,
            candidateName: candidate.profile.name,
            status: (entry as any).status || "Submitted",
            submittedAt: entry.appliedAt,
            lastUpdated: (entry as any).lastUpdated,
            documentStatus: "Complete",
          })
          setJob(foundJob || null)
        }
      }
    }
  }, [applicationId, candidate.applications, candidate.profile.id, candidate.profile.name, localDb.jobApplications, allJobs])

  // Calculate profile completion
  const onboardingAnswers = localDb.onboardingDetails
  const hasBasicInfo = Boolean(onboardingAnswers.phoneNumber)
  const hasProfessionalInfo = Boolean(onboardingAnswers.occupation)
  
  const requiredDocs = useMemo(() => {
    const occupationCode = onboardingAnswers.occupation as string | undefined
    if (!occupationCode) {
      return []
    }
    try {
      const {
        getAdminWalletTemplatesByOccupation,
        getComplianceListItemById,
      } = require("@/lib/admin-local-db")
      const templates = getAdminWalletTemplatesByOccupation(occupationCode)
      const itemSet = new Set<string>()
      templates.forEach((template: any) => {
        template.listItemIds.forEach((listItemId: string) => {
          const listItem = getComplianceListItemById(listItemId)
          if (listItem && listItem.isActive) {
            itemSet.add(listItem.name)
          }
        })
      })
      return Array.from(itemSet)
    } catch (error) {
      return []
    }
  }, [onboardingAnswers.occupation])

  const uploadedDocSet = new Set(Object.keys(localDb.uploadedDocuments))
  const candidateDocSet = new Set(
    candidate.documents
      .filter((doc) => doc.status === "Completed" || doc.status === "Pending Verification")
      .map((doc) => doc.type)
  )
  
  const completedDocs = requiredDocs.filter((doc) => 
    uploadedDocSet.has(doc) || candidateDocSet.has(doc)
  ).length
  const totalDocs = requiredDocs.length

  const isProfileComplete = hasBasicInfo && 
                           hasProfessionalInfo && 
                           (totalDocs === 0 || (totalDocs > 0 && completedDocs === totalDocs))

  if (!application || !job) {
    return (
      <div className="space-y-6 p-8">
        <Header title="Application Details" />
        <Card>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Application not found.
          </p>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
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

  const formatDateTime = (dateString: string, timeString?: string) => {
    try {
      const date = new Date(dateString)
      const dateStr = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      if (timeString) {
        return `${dateStr} at ${timeString}`
      }
      return dateStr
    } catch (error) {
      return dateString
    }
  }

  const getStatusTone = (status: string) => {
    switch (status) {
      case "Accepted":
        return "success" as const
      case "Rejected":
        return "danger" as const
      case "Interview":
      case "Offer":
        return "warning" as const
      case "Qualified":
        return "info" as const
      default:
        return "neutral" as const
    }
  }

  // Use timeline from application or generate based on status
  const timeline = useMemo(() => {
    // If application has timeline, use it
    if ((application as any).timeline && Array.isArray((application as any).timeline)) {
      return (application as any).timeline.map((event: any) => ({
        status: event.status,
        date: event.date,
        note: event.note,
      }))
    }
    
    // Otherwise generate timeline dynamically
    const events: Array<{ status: string; date: string; note?: string }> = []
    
    events.push({
      status: "Application Submitted",
      date: application.submittedAt,
    })
    
    if (application.status !== "Submitted") {
      // Estimate dates based on status
      const submittedDate = new Date(application.submittedAt)
      
      if (application.status === "Qualified" || application.status === "Interview" || application.status === "Offer" || application.status === "Accepted" || application.status === "Rejected") {
        const reviewDate = new Date(submittedDate)
        reviewDate.setDate(reviewDate.getDate() + 2)
        events.push({
          status: "Under Review",
          date: reviewDate.toISOString().split("T")[0],
        })
      }
      
      if (application.status === "Interview" || application.status === "Offer" || application.status === "Accepted") {
        const interviewDate = (application as any).interviewDate || (() => {
          const date = new Date(submittedDate)
          date.setDate(date.getDate() + 9)
          return date.toISOString().split("T")[0]
        })()
        const interviewTime = (application as any).interviewTime
        events.push({
          status: "Interview Scheduled",
          date: interviewDate,
          note: interviewTime ? `Interview scheduled for ${formatDateTime(interviewDate, interviewTime)}` : undefined,
        })
      }
    }
    
    return events
  }, [application])

  const getNextSteps = () => {
    // Use nextSteps from application if available
    if ((application as any).nextSteps) {
      return (application as any).nextSteps
    }
    
    // Otherwise generate based on status
    switch (application.status) {
      case "Submitted":
        return "Your application is being reviewed. You'll be notified of any updates."
      case "Qualified":
        return "Your application has been reviewed and qualified. You may be contacted for an interview."
      case "Interview":
        return (application as any).interviewDate 
          ? `Your interview is scheduled. Please review the job description and prepare questions for the hiring manager.`
          : "Your interview is scheduled. Please review the job description and prepare questions for the hiring manager."
      case "Offer":
        return "You have received an offer. Please review the details and respond accordingly."
      case "Accepted":
        return "Congratulations! Your application has been accepted. You'll be contacted with next steps."
      case "Rejected":
        return "Thank you for your interest. This position has been filled or your application was not selected at this time."
      default:
        return "Your application is being processed."
    }
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Submissions"
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Submissions", href: "/candidate/applications" },
          { label: "Details" },
        ]}
      />

      {/* Profile Completion Banner */}
      {!isProfileComplete && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Complete your profile to unlock more job matches
              </h3>
              <p className="text-sm text-muted-foreground">
                Add your professional information and upload required documents to increase your visibility to employers.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/candidate/profile-setup")}
              >
                Complete Profile →
              </Button>
              <Button
                onClick={() => router.push("/candidate/documents")}
              >
                Upload Documents →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/candidate/applications")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Applications
      </Button>

      {/* Application Header */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground mb-2">{job.title}</h1>
            <p className="text-lg text-muted-foreground mb-2">{job.location}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Applied {formatDate(application.submittedAt)}</span>
            </div>
          </div>
          <StatusChip 
            label={application.status === "Qualified" ? "In Review" : application.status} 
            tone={getStatusTone(application.status)} 
          />
        </div>

        {/* Key Information */}
        <div className="grid gap-4 md:grid-cols-3 pt-4 border-t border-border">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Submitted</label>
            <p className="text-sm text-foreground mt-1">{formatDate(application.submittedAt)}</p>
          </div>
          {application.lastUpdated && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Update</label>
              <p className="text-sm text-foreground mt-1">{formatDate(application.lastUpdated)}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Pay Rate</label>
            <p className="text-sm text-foreground mt-1 font-semibold">{job.billRate}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Application Timeline */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Application Timeline</h2>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{event.status}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(event.date)}</p>
                    {event.note && (
                      <p className="text-xs text-muted-foreground mt-1">{event.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Next Steps */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Next Steps</h2>
            <p className="text-sm text-foreground">{getNextSteps()}</p>
            {application.status === "Interview" && application.interviewDate && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Navigate to interview details or show modal
                    router.push(`/candidate/applications/${applicationId}/interview`)
                  }}
                >
                  View Interview Details
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Job Summary */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Job Summary</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Position</label>
                <p className="text-sm text-foreground mt-1">{job.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="text-sm text-foreground mt-1">{job.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Department</label>
                <p className="text-sm text-foreground mt-1">{job.department}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Shift</label>
                <p className="text-sm text-foreground mt-1">{job.shift}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pay Rate</label>
                <p className="text-sm text-foreground mt-1 font-semibold">{job.billRate}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/candidate/jobs/${job.id}`)}
              >
                View Job Details
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

