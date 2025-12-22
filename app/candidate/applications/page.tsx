"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/system"
import { Eye, X } from "lucide-react"
import { getJobById } from "@/lib/organization-local-db"

type StatusFilter = "all" | "Submitted" | "Qualified" | "Interview" | "Offer" | "Accepted" | "Rejected"

export default function CandidateApplicationsPage() {
  const router = useRouter()
  const { candidate, allJobs } = useDemoData()
  const { data: localDb, withdrawApplication } = useLocalDb()
  const { pushToast } = useToast()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  // Combine applications from candidate.applications and localDb.jobApplications
  const allApplications = useMemo(() => {
    const appsFromCandidate = candidate.applications.map((app) => ({
      ...app,
      appliedAt: app.submittedAt,
    }))
    
    const appsFromLocalDb = Object.entries(localDb.jobApplications).map(([jobId, entry]) => {
      const existingApp = candidate.applications.find((app) => app.jobId === jobId)
      if (existingApp) {
        return null // Already included from candidate.applications
      }
      // Create application from local DB entry
      const job = allJobs.find((j) => j.id === jobId) || getJobById(jobId)
      if (!job) return null
      
      return {
        id: `local-${jobId}`,
        jobId,
        candidateId: candidate.profile.id,
        candidateName: candidate.profile.name,
        status: (entry as any).status || "Submitted" as const,
        submittedAt: entry.appliedAt,
        lastUpdated: (entry as any).lastUpdated,
        documentStatus: "Complete" as const,
        withdrawn: (entry as any).withdrawn || false,
      }
    }).filter(Boolean)
    
    return [...appsFromCandidate, ...appsFromLocalDb]
  }, [candidate.applications, candidate.profile.id, candidate.profile.name, localDb.jobApplications, allJobs])

  // Filter applications by status
  const filteredApplications = useMemo(() => {
    if (statusFilter === "all") {
      return allApplications.filter((app) => !(app as any).withdrawn)
    }
    if (statusFilter === "Qualified") {
      return allApplications.filter((app) => (app.status === "Qualified" || app.status === "In Review") && !(app as any).withdrawn)
    }
    return allApplications.filter((app) => app.status === statusFilter && !(app as any).withdrawn)
  }, [allApplications, statusFilter])

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: allApplications.filter((app) => !(app as any).withdrawn).length,
      Submitted: allApplications.filter((app) => app.status === "Submitted").length,
      Qualified: allApplications.filter((app) => app.status === "Qualified" || app.status === "In Review").length,
      Interview: allApplications.filter((app) => app.status === "Interview").length,
      Offer: allApplications.filter((app) => app.status === "Offer").length,
      Accepted: allApplications.filter((app) => app.status === "Accepted").length,
      Rejected: allApplications.filter((app) => app.status === "Rejected").length,
    }
    return counts
  }, [allApplications])

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

  const handleViewDetails = (applicationId: string, jobId: string) => {
    router.push(`/candidate/applications/${applicationId}`)
  }

  const handleWithdraw = (applicationId: string, jobId: string) => {
    if (!confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) {
      return
    }
    
    withdrawApplication(jobId)
    pushToast({
      title: "Application withdrawn",
      description: "Your application has been withdrawn.",
      type: "success",
    })
  }

  // Get job details for each application
  const applicationsWithJobs = useMemo(() => {
    return filteredApplications.map((app) => {
      const job = allJobs.find((j) => j.id === app.jobId) || getJobById(app.jobId)
      return {
        ...app,
        job: job || null,
      }
    })
  }, [filteredApplications, allJobs])

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Submissions"
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Submissions" },
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

      {/* Status Filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            All Applications ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter("Submitted")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "Submitted"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Submitted ({statusCounts.Submitted})
          </button>
          <button
            onClick={() => setStatusFilter("Qualified")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "Qualified"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            In Review ({statusCounts.Qualified})
          </button>
          <button
            onClick={() => setStatusFilter("Interview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "Interview"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Interview ({statusCounts.Interview})
          </button>
          <button
            onClick={() => setStatusFilter("Offer")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "Offer"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Offer ({statusCounts.Offer})
          </button>
          <button
            onClick={() => setStatusFilter("Accepted")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "Accepted"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Accepted ({statusCounts.Accepted})
          </button>
          <button
            onClick={() => setStatusFilter("Rejected")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "Rejected"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Rejected ({statusCounts.Rejected})
          </button>
        </div>
      </Card>

      {/* Applications List */}
      <Card>
        {applicationsWithJobs.length > 0 ? (
          <div className="space-y-4">
            {applicationsWithJobs.map((app) => {
              const job = app.job
              if (!job) return null
              
              return (
                <div
                  key={app.id}
                  className="rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{job.location}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Applied {formatDate(app.submittedAt)}</span>
                        {app.lastUpdated && (
                          <span>Updated {formatDate(app.lastUpdated)}</span>
                        )}
                      </div>
                    </div>
                    <StatusChip label={app.status === "Qualified" ? "In Review" : app.status} tone={getStatusTone(app.status)} />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <span className="font-medium">Pay Rate: {job.billRate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(app.status === "Submitted" || app.status === "Qualified") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWithdraw(app.id, app.jobId)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Withdraw
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(app.id, app.jobId)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No applications found.
          </p>
        )}
      </Card>
    </div>
  )
}
