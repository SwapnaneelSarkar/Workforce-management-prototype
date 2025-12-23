"use client"

import Link from "next/link"
import React, { useMemo, useState, useEffect } from "react"
import { Header, Card } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { getQuestionnaireByOccupationId, getOccupationByCode } from "@/lib/admin-local-db"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign, ArrowRight, Upload, FileText, Briefcase, Calendar, User, BriefcaseIcon, CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CandidateDashboardPage() {
  const { candidate, allJobs } = useDemoData()
  const { data: localDb, hydrated } = useLocalDb()
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate stats from localDB (only after hydration to avoid mismatch)
  const openJobsCount = useMemo(() => {
    if (!mounted || !hydrated) {
      // Return demo data count during SSR/initial render
      return allJobs.filter((job) => job.status === "Open").length
    }
    
    // Try to get from organization-local-db first (more accurate)
    try {
      const { getAllJobs } = require("@/lib/organization-local-db")
      const allOrgJobs = getAllJobs()
      const orgOpenJobs = allOrgJobs.filter((job) => job.status === "Open").length
      if (orgOpenJobs > 0) {
        return orgOpenJobs
      }
    } catch (error) {
      // Silently fail if organization-local-db is not available
    }
    
    // Fallback to demo data
    return allJobs.filter((job) => job.status === "Open").length
  }, [allJobs, mounted, hydrated])

  const applicationsCount = useMemo(() => {
    if (!mounted || !hydrated) {
      // Return demo data count during SSR/initial render
      return candidate.applications.length
    }
    
    // Count from localDB (excluding withdrawn applications)
    const localDbApps = Object.keys(localDb.jobApplications).filter(
      (jobId) => {
        const entry = localDb.jobApplications[jobId]
        return !entry.withdrawn
      }
    ).length
    
    // Also count from candidate.applications that aren't already in localDB
    const candidateAppsNotInLocalDb = candidate.applications.filter(
      (app) => !localDb.jobApplications[app.jobId]
    ).length
    
    return localDbApps + candidateAppsNotInLocalDb
  }, [localDb.jobApplications, candidate.applications, mounted, hydrated])

  const activePlacementsCount = useMemo(() => {
    if (!mounted || !hydrated) {
      // Return 0 during SSR/initial render
      return 0
    }
    
    // Try to get from organization-local-db first
    try {
      const { getPlacementsByCandidate } = require("@/lib/organization-local-db")
      const candidateId = candidate.profile.id
      const placements = getPlacementsByCandidate(candidateId)
      const activePlacements = placements.filter(
        (p) => p.status === "Active" || p.status === "Ending Soon"
      ).length
      if (activePlacements > 0) {
        return activePlacements
      }
    } catch (error) {
      // Silently fail if organization-local-db is not available
    }
    
    // Fallback: Count timecards with active status
    return Object.values(localDb.timecards).filter(
      (tc) => tc.status === "submitted" || tc.status === "approved"
    ).length
  }, [localDb.timecards, candidate.profile.id, mounted, hydrated])

  const documentsPendingCount = useMemo(() => {
    if (!mounted || !hydrated) {
      // Return demo data count during SSR/initial render
      return candidate.documents.filter(
        (doc) => doc.status === "Pending Upload" || doc.status === "Pending Verification"
      ).length
    }
    
    // Count from candidate.documents with pending status
    // This is the source of truth for document status
    const pendingDocs = candidate.documents.filter(
      (doc) => doc.status === "Pending Upload" || doc.status === "Pending Verification"
    ).length
    
    // Also check if there are documents in localDB that aren't in candidate.documents yet
    const localDbOnlyDocs = Object.keys(localDb.uploadedDocuments).filter(
      (docType) => !candidate.documents.some((doc) => doc.type === docType)
    )
    
    // For localDB-only docs, we assume they might be pending if they were just uploaded
    // But we'll primarily rely on candidate.documents status
    return pendingDocs
  }, [localDb.uploadedDocuments, candidate.documents, mounted, hydrated])

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

  // Determine if onboarding was skipped (incomplete basic or professional info)
  const isOnboardingSkipped = !hasBasicInfo || !hasProfessionalInfo

  // Get incomplete onboarding steps
  const incompleteSteps = useMemo(() => {
    const steps: Array<{ id: string; label: string; href: string; icon: React.ReactNode }> = []
    
    if (!hasBasicInfo) {
      steps.push({
        id: "basic-info",
        label: "Complete Basic Information",
        href: "/candidate/profile-setup",
        icon: <User className="h-4 w-4" />
      })
    }
    
    if (!hasProfessionalInfo) {
      steps.push({
        id: "professional-info",
        label: "Add Professional Information",
        href: "/candidate/profile-setup",
        icon: <BriefcaseIcon className="h-4 w-4" />
      })
    }
    
    if (hasProfessionalInfo && totalDocs > 0 && completedDocs < totalDocs) {
      steps.push({
        id: "documents",
        label: `Upload ${totalDocs - completedDocs} Required Document${totalDocs - completedDocs > 1 ? "s" : ""}`,
        href: "/candidate/documents",
        icon: <Upload className="h-4 w-4" />
      })
    }
    
    return steps
  }, [hasBasicInfo, hasProfessionalInfo, totalDocs, completedDocs])

  // Calculate profile completion percentage
  const profileCompletionPercent = useMemo(() => {
    let completed = 0
    let total = 3 // Basic info, Professional info, Documents
    
    if (hasBasicInfo) completed++
    if (hasProfessionalInfo) completed++
    if (totalDocs === 0 || (totalDocs > 0 && completedDocs === totalDocs)) completed++
    
    return Math.round((completed / total) * 100)
  }, [hasBasicInfo, hasProfessionalInfo, totalDocs, completedDocs])

  // Check if preferences questionnaire is complete
  const questionnaireAnswers = onboardingAnswers.questionnaireAnswers as Record<string, any> | undefined
  const hasPreferencesQuestionnaire = useMemo(() => {
    if (!questionnaireAnswers) return false
    // Check if general questionnaire fields are filled
    const hasEmploymentType = Boolean(
      questionnaireAnswers.preferredWorkTypes || 
      questionnaireAnswers.employmentTypes ||
      (Array.isArray(onboardingAnswers.employmentTypes) && onboardingAnswers.employmentTypes.length > 0)
    )
    const hasShiftPreference = Boolean(
      questionnaireAnswers.preferredShifts || 
      onboardingAnswers.preferredShift
    )
    const hasTravelPreference = Boolean(
      questionnaireAnswers.willingToTravel || 
      onboardingAnswers.willingToTravel
    )
    return hasEmploymentType && hasShiftPreference && hasTravelPreference
  }, [questionnaireAnswers, onboardingAnswers])

  // Calculate document approval percentage (for Tier 2)
  const documentApprovalPercent = useMemo(() => {
    if (totalDocs === 0) return 100
    const approvedDocs = requiredDocs.filter((doc) => 
      candidate.documents.some((d) => d.type === doc && d.status === "Completed")
    ).length
    return Math.round((approvedDocs / totalDocs) * 100)
  }, [requiredDocs, candidate.documents, totalDocs])

  // Check Tier 1: Minimum Ready (Profile required fields complete)
  const tier1Complete = hasBasicInfo && hasProfessionalInfo

  // Check Tier 2: Submission Ready (80%+ documents approved + preferences questionnaire)
  const tier2Complete = tier1Complete && documentApprovalPercent >= 80 && hasPreferencesQuestionnaire

  // Check Tier 3: Priority Ready (No missing or expired documents)
  const tier3Complete = tier2Complete && complianceSnapshot.missing === 0 && complianceSnapshot.expired === 0

  // Get submission ready status
  const submissionStatus = useMemo(() => {
    if (tier3Complete) return { status: "Priority Ready", color: "green" }
    if (tier2Complete) return { status: "Submission Ready", color: "blue" }
    if (tier1Complete) return { status: "Minimum Ready", color: "yellow" }
    return { status: "Pending", color: "gray" }
  }, [tier1Complete, tier2Complete, tier3Complete])

  // Get recommended jobs with match scores
  const recommendedJobs = useMemo(() => {
    if (!mounted || !hydrated) {
      // Return empty array during SSR to avoid hydration mismatch
      return []
    }
    
    const openJobs = allJobs.filter((job) => job.status === "Open").slice(0, 3)
    
    return openJobs.map((job) => {
      // Calculate match score deterministically based on job ID and candidate profile
      // Use a simple hash of job ID to get consistent score between server and client
      const jobIdHash = job.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const baseScore = 85 + (jobIdHash % 15) // 85-100% range, deterministic
      
      // Check if candidate has required documents
      const hasRequiredDocs = job.requirements?.every((req) => 
        candidate.documents.some((doc) => 
          doc.type === req && (doc.status === "Completed" || doc.status === "Pending Verification")
        )
      ) ?? true

      let matchScore = baseScore
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
  }, [allJobs, candidate.documents, candidate.applications, localDb.jobApplications, mounted, hydrated])

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
      description: "Review the holiday pay rates for upcoming placements.",
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

      {/* Profile Completion Banner - Enhanced for skipped onboarding */}
      {!isProfileComplete && (
        <Card className={cn(
          "mb-6 border-2",
          isOnboardingSkipped 
            ? "border-amber-300 bg-gradient-to-r from-amber-50/80 to-amber-50/40" 
            : "border-primary/20 bg-gradient-to-r from-blue-50/50 to-blue-50/30"
        )}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {isOnboardingSkipped 
                    ? "Complete your onboarding to get started" 
                    : "Complete your profile to unlock more job matches"}
                </h3>
                {isOnboardingSkipped && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-200 text-amber-800">
                    Onboarding Incomplete
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {!hasProfessionalInfo 
                  ? "Add your professional information and upload required documents to increase your visibility to employers."
                  : !hasBasicInfo
                    ? "Complete your basic information and upload required documents to increase your visibility to employers."
                    : totalDocs > 0 && completedDocs < totalDocs
                      ? `Upload ${totalDocs - completedDocs} more required document${totalDocs - completedDocs > 1 ? "s" : ""} to increase your visibility to employers.`
                      : "Add your professional information and upload required documents to increase your visibility to employers."}
              </p>
              {incompleteSteps.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {incompleteSteps.map((step) => (
                    <Button 
                      key={step.id} 
                      asChild 
                      variant={isOnboardingSkipped ? "default" : "outline"} 
                      size="sm"
                      className="text-xs"
                    >
                      <Link href={step.href}>
                        {step.icon}
                        <span className="ml-1.5">{step.label}</span>
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Profile Completion Status */}
      {!isProfileComplete && (
        <Card className="mb-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Complete your profile to unlock more matches</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your status is <span className="font-medium text-foreground">{submissionStatus.status}</span> because required profile items are incomplete.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {/* Profile Completion Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Profile Completion</span>
                <span className="text-sm font-semibold text-foreground">{profileCompletionPercent}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${profileCompletionPercent}%` }}
                />
              </div>
            </div>

            {/* Required Steps */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Occupation & Specialty</h4>
                  <p className="text-xs text-muted-foreground">Required for job matching</p>
                </div>
                {hasProfessionalInfo ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/candidate/profile-setup">Continue</Link>
                  </Button>
                )}
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Preferences (General Questionnaire)</h4>
                  <p className="text-xs text-muted-foreground">Employment type, shift, travel preferences</p>
                </div>
                {hasPreferencesQuestionnaire ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/candidate/questionnaire">Continue</Link>
                  </Button>
                )}
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Compliance Documents (Document Wallet)</h4>
                  <p className="text-xs text-muted-foreground">Licenses, certifications, health records</p>
                </div>
                {totalDocs > 0 && completedDocs === totalDocs ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/candidate/documents">Continue</Link>
                  </Button>
                )}
              </div>
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
        {/* Submission Ready Status */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground mb-1">Submission Ready Status</h3>
            <p className="text-sm text-muted-foreground">
              Completing required items improves your ability to apply and be submitted quickly.
            </p>
          </div>
          <div className="space-y-4">
            {/* Tier 1: Minimum Ready */}
            <div className={cn(
              "p-4 rounded-lg border-2",
              tier1Complete 
                ? "border-green-200 bg-green-50/50" 
                : "border-border bg-muted/30"
            )}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">Tier 1: Minimum Ready</h4>
                  {tier1Complete && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                </div>
                {tier1Complete && (
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    Complete
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">Profile required fields complete</p>
              {!tier1Complete && (
                <div className="mt-2">
                  {!hasBasicInfo && (
                    <p className="text-xs text-muted-foreground mb-1">• Complete basic information</p>
                  )}
                  {!hasProfessionalInfo && (
                    <p className="text-xs text-muted-foreground mb-1">• Add occupation & specialty</p>
                  )}
                </div>
              )}
            </div>

            {/* Tier 2: Submission Ready */}
            <div className={cn(
              "p-4 rounded-lg border-2",
              tier2Complete 
                ? "border-blue-200 bg-blue-50/50" 
                : tier1Complete
                  ? "border-yellow-200 bg-yellow-50/30"
                  : "border-border bg-muted/30"
            )}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">Tier 2: Submission Ready</h4>
                  {tier2Complete && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                {tier2Complete ? (
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Complete
                  </span>
                ) : tier1Complete ? (
                  <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                    In Progress
                  </span>
                ) : null}
              </div>
              {tier2Complete ? (
                <p className="text-xs text-muted-foreground">Required documents at {documentApprovalPercent}% approved</p>
              ) : tier1Complete ? (
                <div className="space-y-2">
                  {documentApprovalPercent < 80 && totalDocs > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Required documents at {documentApprovalPercent}% approved (need 80%+)
                      </p>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/candidate/documents">
                          Upload required documents ({documentApprovalPercent}% approved, need 80%+)
                        </Link>
                      </Button>
                    </div>
                  )}
                  {!hasPreferencesQuestionnaire && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Complete Preferences Questionnaire</p>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/candidate/questionnaire">Fix now</Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Complete Tier 1 requirements first</p>
              )}
            </div>

            {/* Tier 3: Priority Ready */}
            <div className={cn(
              "p-4 rounded-lg border-2",
              tier3Complete 
                ? "border-purple-200 bg-purple-50/50" 
                : tier2Complete
                  ? "border-yellow-200 bg-yellow-50/30"
                  : "border-border bg-muted/30"
            )}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">Tier 3: Priority Ready</h4>
                  {tier3Complete && (
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  )}
                </div>
                {tier3Complete ? (
                  <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    Complete
                  </span>
                ) : tier2Complete ? (
                  <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                    In Progress
                  </span>
                ) : null}
              </div>
              {tier3Complete ? (
                <p className="text-xs text-muted-foreground">Extra documents completed / high compliance % (no missing or expired)</p>
              ) : tier2Complete && (complianceSnapshot.missing > 0 || complianceSnapshot.expired > 0) ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Resolve {complianceSnapshot.missing + complianceSnapshot.expired} missing and expired document{complianceSnapshot.missing + complianceSnapshot.expired > 1 ? "s" : ""}
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/candidate/documents">Fix now</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Extra documents completed / high compliance % (no missing or expired)</p>
              )}
            </div>
          </div>
        </Card>

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
            {/* Show incomplete onboarding steps first if onboarding was skipped */}
            {isOnboardingSkipped && incompleteSteps.length > 0 && (
              <>
                <div className="border-b border-border pb-3 mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Complete Your Profile
                  </p>
                  {incompleteSteps.map((step) => (
                    <Button 
                      key={step.id} 
                      asChild 
                      variant="outline" 
                      className="w-full justify-start mb-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50"
                    >
                      <Link href={step.href}>
                        {step.icon}
                        <span className="ml-2">{step.label}</span>
                        <ArrowRight className="ml-auto h-4 w-4" />
                      </Link>
                    </Button>
                  ))}
                </div>
              </>
            )}
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
