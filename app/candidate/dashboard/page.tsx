"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Header, Card } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { getQuestionnaireByOccupationId, getOccupationByCode } from "@/lib/admin-local-db"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign, ArrowRight, Upload, FileText, Briefcase, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CandidateDashboardPage() {
  const { candidate, allJobs } = useDemoData()
  const { data: localDb } = useLocalDb()

  // Calculate stats
  const openJobsCount = useMemo(() => {
    return allJobs.filter((job) => job.status === "Open").length
  }, [allJobs])

  const applicationsCount = useMemo(() => {
    return Object.keys(localDb.jobApplications).length + candidate.applications.length
  }, [localDb.jobApplications, candidate.applications])

  const activePlacementsCount = useMemo(() => {
    // Count timecards with active status (submitted or approved)
    return Object.values(localDb.timecards).filter(
      (tc) => tc.status === "submitted" || tc.status === "approved"
    ).length
  }, [localDb.timecards])

  const documentsPendingCount = useMemo(() => {
    return candidate.documents.filter(
      (doc) => doc.status === "Pending Upload" || doc.status === "Pending Verification"
    ).length
  }, [candidate.documents])

  // Calculate compliance snapshot
  const complianceSnapshot = useMemo(() => {
    const approved = candidate.documents.filter((doc) => doc.status === "Completed").length
    const pending = candidate.documents.filter(
      (doc) => doc.status === "Pending Verification" || doc.status === "Pending Upload"
    ).length
    const missing = candidate.documents.filter((doc) => doc.status === "Pending Upload").length
    const expired = candidate.documents.filter((doc) => doc.status === "Expired").length

    return { approved, pending, missing, expired }
  }, [candidate.documents])

  // Calculate profile completion based on profile setup steps
  const onboardingAnswers = localDb.onboardingDetails
  
  // Check if basic profile setup is complete
  const hasBasicInfo = Boolean(onboardingAnswers.phoneNumber)
  const hasProfessionalInfo = Boolean(onboardingAnswers.occupation)
  
  // Get required documents based on selected occupation
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
      console.warn("Failed to load required documents for occupation", error)
      return []
    }
  }, [onboardingAnswers.occupation])

  // Check document completion - check both localDB uploaded documents and candidate.documents
  const uploadedDocSet = new Set(Object.keys(localDb.uploadedDocuments))
  // Also check candidate.documents for completed/pending verification status
  const candidateDocSet = new Set(
    candidate.documents
      .filter((doc) => doc.status === "Completed" || doc.status === "Pending Verification")
      .map((doc) => doc.type)
  )
  
  // A document is considered uploaded if it's in either localDB or candidate.documents
  const completedDocs = requiredDocs.filter((doc) => 
    uploadedDocSet.has(doc) || candidateDocSet.has(doc)
  ).length
  const totalDocs = requiredDocs.length

  // Profile is complete if:
  // 1. Basic info is filled (phone number)
  // 2. Professional info is filled (occupation)
  // 3. All required documents are uploaded (if occupation is selected and has required docs)
  const isProfileComplete = hasBasicInfo && 
                           hasProfessionalInfo && 
                           (totalDocs === 0 || (totalDocs > 0 && completedDocs === totalDocs))

  // Get recommended jobs with match scores
  const recommendedJobs = useMemo(() => {
    const openJobs = allJobs.filter((job) => job.status === "Open").slice(0, 3)
    
    return openJobs.map((job) => {
      // Calculate match score based on job requirements and candidate profile
      let matchScore = 85 + Math.floor(Math.random() * 15) // 85-100% for demo
      
      // Check if candidate has required documents
      const hasRequiredDocs = job.requirements?.every((req) => 
        candidate.documents.some((doc) => 
          doc.type === req && (doc.status === "Completed" || doc.status === "Pending Verification")
        )
      ) ?? true

      if (!hasRequiredDocs) {
        matchScore = Math.max(75, matchScore - 10)
      }

      // Check if applied
      const hasApplied = Boolean(localDb.jobApplications[job.id]) || 
                        candidate.applications.some((app) => app.jobId === job.id)

      return {
        ...job,
        matchScore,
        hasApplied,
        missingDocs: job.requirements?.filter((req) => 
          !candidate.documents.some((doc) => 
            doc.type === req && (doc.status === "Completed" || doc.status === "Pending Verification")
          )
        ) ?? [],
      }
    })
  }, [allJobs, candidate.documents, candidate.applications, localDb.jobApplications])

  // Mock announcements
  const announcements = [
    {
      id: "1",
      title: "New Benefits Program Available",
      description: "Check out our enhanced benefits package for active candidates.",
      date: "2 days ago",
    },
    {
      id: "2",
      title: "Document Upload Reminder",
      description: "Please ensure all your certifications are up to date before applying.",
      date: "5 days ago",
    },
    {
      id: "3",
      title: "Holiday Schedule Updates",
      description: "Review the holiday pay rates for upcoming assignments.",
      date: "1 week ago",
    },
  ]

  return (
    <>
      <Header
        title="Dashboard"
        breadcrumbs={[
          { label: "Candidate", href: "/candidate/dashboard" },
          { label: "Dashboard" },
        ]}
      />

      {/* Profile Completion Banner */}
      {!isProfileComplete && (
        <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-blue-50/50 to-blue-50/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Complete your profile to unlock more job matches</h3>
              <p className="text-sm text-muted-foreground">
                {!hasProfessionalInfo 
                  ? "Add your professional information and upload required documents to increase your visibility to employers."
                  : !hasBasicInfo
                    ? "Complete your basic information and upload required documents to increase your visibility to employers."
                    : totalDocs > 0 && completedDocs < totalDocs
                      ? `Upload ${totalDocs - completedDocs} more required document${totalDocs - completedDocs > 1 ? "s" : ""} to increase your visibility to employers.`
                      : "Add your professional information and upload required documents to increase your visibility to employers."}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {!hasProfessionalInfo || !hasBasicInfo ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/candidate/profile-setup">
                    Complete Profile <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              {hasProfessionalInfo && totalDocs > 0 && (
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/candidate/documents">
                    Upload Documents <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Open Jobs</p>
              <p className="text-3xl font-bold text-foreground">{openJobsCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Applications Submitted</p>
              <p className="text-3xl font-bold text-foreground">{applicationsCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Active Placements</p>
              <p className="text-3xl font-bold text-foreground">{activePlacementsCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Documents Pending</p>
              <p className="text-3xl font-bold text-foreground">{documentsPendingCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr] mb-6">
        {/* Compliance Snapshot */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Compliance Snapshot</h3>
              <p className="text-sm text-muted-foreground">Keep your documents up to date</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/candidate/documents">Go to Document Wallet</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-2xl font-bold text-green-700">{complianceSnapshot.approved}</p>
              <p className="text-sm font-medium text-green-600 mt-1">Approved</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-2xl font-bold text-yellow-700">{complianceSnapshot.pending}</p>
              <p className="text-sm font-medium text-yellow-600 mt-1">Pending</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-2xl font-bold text-red-700">{complianceSnapshot.missing}</p>
              <p className="text-sm font-medium text-red-600 mt-1">Missing</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
              <p className="text-2xl font-bold text-orange-700">{complianceSnapshot.expired}</p>
              <p className="text-sm font-medium text-orange-600 mt-1">Expired</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/candidate/jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Browse Open Jobs
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/candidate/applications">
                <FileText className="mr-2 h-4 w-4" />
                View Applications
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/candidate/documents">
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" disabled>
              <Link href="#">
                <Calendar className="mr-2 h-4 w-4" />
                Submit Timecard
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Recommended Jobs */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recommended Jobs</h3>
          <Button asChild variant="ghost" size="sm">
            <Link href="/candidate/jobs">View All</Link>
          </Button>
        </div>
        <div className="space-y-4">
          {recommendedJobs.map((job) => (
            <Link
              key={job.id}
              href={`/candidate/jobs/${job.id}`}
              className="block rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-base font-semibold text-foreground">{job.title}</h4>
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      job.matchScore >= 90 ? "bg-green-100 text-green-700" :
                      job.matchScore >= 80 ? "bg-blue-100 text-blue-700" :
                      "bg-yellow-100 text-yellow-700"
                    )}>
                      {job.matchScore}% Match
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{job.location}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.shift}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {job.billRate}
                    </span>
                  </div>
                  {job.missingDocs.length > 0 && (
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      {job.missingDocs.length} required document{job.missingDocs.length > 1 ? "s" : ""} missing. Upload now
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <span>View Job</span>
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Announcements */}
      <Card>
        <h3 className="text-lg font-semibold text-foreground mb-4">Announcements</h3>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <h4 className="text-sm font-semibold text-foreground mb-1">{announcement.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{announcement.description}</p>
              <p className="text-xs text-muted-foreground">{announcement.date}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
