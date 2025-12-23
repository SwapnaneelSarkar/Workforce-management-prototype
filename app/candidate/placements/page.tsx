"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, Header, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/system"
import { Calendar, MapPin, Clock, DollarSign, Eye, FileText, CheckCircle2 } from "lucide-react"
import { getAllPlacements, getPlacementsByCandidate, getJobById, type OrganizationPlacement } from "@/lib/organization-local-db"
import { getOrganizationById } from "@/lib/admin-local-db"
import { getAllTimecards } from "@/lib/local-db"

export default function CandidatePlacementsPage() {
  const router = useRouter()
  const { candidate, allJobs } = useDemoData()
  const { data: localDb } = useLocalDb()
  const { pushToast } = useToast()
  const [placements, setPlacements] = useState<OrganizationPlacement[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const candidatePlacements = getPlacementsByCandidate(candidate.profile.id)
        // If no placements exist, create some mock data for demo
        if (candidatePlacements.length === 0) {
          const mockPlacements = createMockPlacements(candidate.profile.id)
          setPlacements(mockPlacements)
        } else {
          setPlacements(candidatePlacements)
        }
      } catch (error) {
        console.warn("Failed to load placements", error)
        setPlacements([])
      }
    }
  }, [candidate.profile.id])

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

  // Filter placements by status
  const activePlacements = useMemo(() => {
    return placements.filter((p) => p.status === "Active" || p.status === "Ending Soon")
  }, [placements])

  const upcomingPlacements = useMemo(() => {
    return placements.filter((p) => p.status === "Upcoming")
  }, [placements])

  const pastPlacements = useMemo(() => {
    return placements.filter((p) => p.status === "Completed")
  }, [placements])

  // Helper function to get organization name
  const getOrganizationName = (organizationId: string) => {
    try {
      const org = getOrganizationById(organizationId)
      return org?.name || "Unknown Organization"
    } catch (error) {
      return "Unknown Organization"
    }
  }

  // Helper function to format date
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

  // Helper function to format shift time
  const formatShiftTime = (shiftType?: string) => {
    if (!shiftType) return "Not specified"
    // If shiftType contains time info, return as is, otherwise add default times
    if (shiftType.includes("PM") || shiftType.includes("AM") || shiftType.includes("-")) {
      return shiftType
    }
    // Map common shift types to time ranges
    const shiftMap: Record<string, string> = {
      "Day Shift": "Day Shift (7AM - 7PM)",
      "Night Shift": "Night Shift (7PM - 7AM)",
      "Evening Shift": "Evening Shift (3PM - 11PM)",
    }
    return shiftMap[shiftType] || shiftType
  }

  // Calculate onboarding completion percentage
  const calculateOnboardingCompletion = (placement: OrganizationPlacement) => {
    // Mock calculation - in real app, this would check actual onboarding status
    if (placement.complianceStatus === "Complete") return 100
    if (placement.complianceStatus === "Expiring") return 80
    return 60
  }

  const handleSubmitTimecard = (placementId: string) => {
    pushToast({
      title: "Timecard Submission",
      description: "Timecard submission feature will be available soon.",
      type: "info",
    })
    // TODO: Navigate to timecard submission page when implemented
  }

  const handleViewDetails = (placement: OrganizationPlacement) => {
    // Navigate to placement details page
    router.push(`/candidate/placements/${placement.id}`)
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Placements"
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Placements" },
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

      {/* Active Placements */}
      <Card>
        <h2 className="text-xl font-semibold text-foreground mb-4">Active Placements</h2>
        {activePlacements.length > 0 ? (
          <div className="space-y-4">
            {activePlacements.map((placement) => {
              const orgName = getOrganizationName(placement.organizationId)
              const job = getJobById(placement.jobId)
              const location = placement.location || job?.location || "Not specified"
              
              return (
                <div
                  key={placement.id}
                  className="rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {placement.jobTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{orgName}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(placement.startDate)} - {formatDate(placement.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatShiftTime(placement.shiftType)}</span>
                        </div>
                      </div>
                    </div>
                    <StatusChip label={placement.status} tone={placement.status === "Active" ? "success" : "warning"} />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Pay Rate: {placement.billRate || "$0/hr"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSubmitTimecard(placement.id)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Submit Timecard
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(placement)}
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
            No active placements at this time.
          </p>
        )}
      </Card>

      {/* Upcoming Placements */}
      <Card>
        <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Placements</h2>
        {upcomingPlacements.length > 0 ? (
          <div className="space-y-4">
            {upcomingPlacements.map((placement) => {
              const orgName = getOrganizationById(placement.organizationId)?.name || "Unknown Organization"
              const job = getJobById(placement.jobId)
              const location = placement.location || job?.location || "Not specified"
              const completionPercent = calculateOnboardingCompletion(placement)
              
              return (
                <div
                  key={placement.id}
                  className="rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {placement.jobTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{orgName}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Starts {formatDate(placement.startDate)}</span>
                        </div>
                      </div>
                      {completionPercent < 100 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Complete your onboarding ({completionPercent}% done)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${completionPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <StatusChip label={placement.status} tone="info" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Pay Rate: {placement.billRate || "$0/hr"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(placement)}
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
            No upcoming placements scheduled.
          </p>
        )}
      </Card>

      {/* Past Placements */}
      <Card>
        <h2 className="text-xl font-semibold text-foreground mb-4">Past Placements</h2>
        {pastPlacements.length > 0 ? (
          <div className="space-y-4">
            {pastPlacements.map((placement) => {
              const orgName = getOrganizationById(placement.organizationId)?.name || "Unknown Organization"
              const job = getJobById(placement.jobId)
              const location = placement.location || job?.location || "Not specified"
              
              return (
                <div
                  key={placement.id}
                  className="rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {placement.jobTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{orgName}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(placement.startDate)} - {formatDate(placement.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <StatusChip label={placement.status} tone="neutral" />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No past placements found.
          </p>
        )}
      </Card>
    </div>
  )
}

// Mock data generator for demo purposes
function createMockPlacements(candidateId: string): OrganizationPlacement[] {
  const mockPlacements: OrganizationPlacement[] = [
    {
      id: `placement-active-${Date.now()}`,
      organizationId: "org_1",
      candidateId,
      candidateName: "Jane Doe",
      candidateEmail: "jane.doe@email.com",
      candidateAvatar: "JD",
      jobId: "job_1",
      jobTitle: "Registered Nurse (RN) - ICU",
      location: "Nova Health – Main Campus",
      startDate: "2024-12-01",
      endDate: "2025-03-01",
      shiftType: "Night Shift (7PM - 7AM)",
      billRate: "$87/hr",
      status: "Active",
      complianceStatus: "Complete",
      createdAt: new Date("2024-11-15").toISOString(),
      updatedAt: new Date("2024-11-15").toISOString(),
    },
    {
      id: `placement-upcoming-${Date.now()}`,
      organizationId: "org_2",
      candidateId,
      candidateName: "Jane Doe",
      candidateEmail: "jane.doe@email.com",
      candidateAvatar: "JD",
      jobId: "job_2",
      jobTitle: "Registered Nurse (RN) - Pediatrics",
      location: "Children's Hospital - Boston",
      startDate: "2025-01-15",
      endDate: "2025-04-15",
      shiftType: "Day Shift",
      billRate: "$78/hr",
      status: "Upcoming",
      complianceStatus: "Expiring",
      createdAt: new Date("2024-12-01").toISOString(),
      updatedAt: new Date("2024-12-01").toISOString(),
    },
    {
      id: `placement-past-1-${Date.now()}`,
      organizationId: "org_1",
      candidateId,
      candidateName: "Jane Doe",
      candidateEmail: "jane.doe@email.com",
      candidateAvatar: "JD",
      jobId: "job_3",
      jobTitle: "Registered Nurse (RN) - Emergency",
      location: "Nova Health – Main Campus",
      startDate: "2024-06-01",
      endDate: "2024-09-01",
      shiftType: "Night Shift",
      billRate: "$85/hr",
      status: "Completed",
      complianceStatus: "Complete",
      createdAt: new Date("2024-05-15").toISOString(),
      updatedAt: new Date("2024-09-01").toISOString(),
    },
    {
      id: `placement-past-2-${Date.now()}`,
      organizationId: "org_3",
      candidateId,
      candidateName: "Jane Doe",
      candidateEmail: "jane.doe@email.com",
      candidateAvatar: "JD",
      jobId: "job_4",
      jobTitle: "Registered Nurse (RN) - Medical-Surgical",
      location: "Regional Medical Center - Boston",
      startDate: "2024-03-01",
      endDate: "2024-06-01",
      shiftType: "Day Shift",
      billRate: "$75/hr",
      status: "Completed",
      complianceStatus: "Complete",
      createdAt: new Date("2024-02-15").toISOString(),
      updatedAt: new Date("2024-06-01").toISOString(),
    },
  ]
  
  // Save mock placements to local DB (only if they don't exist)
  if (typeof window !== "undefined") {
    try {
      const { addPlacement } = require("@/lib/organization-local-db")
      const existingPlacements = getAllPlacements()
      
      mockPlacements.forEach((placement) => {
        // Only add if it doesn't exist
        const existing = existingPlacements.find((p) => 
          p.candidateId === placement.candidateId && 
          p.jobId === placement.jobId &&
          p.startDate === placement.startDate
        )
        if (!existing) {
          try {
            addPlacement(placement.organizationId, {
              candidateId: placement.candidateId,
              candidateName: placement.candidateName,
              candidateEmail: placement.candidateEmail,
              candidateAvatar: placement.candidateAvatar,
              jobId: placement.jobId,
              jobTitle: placement.jobTitle,
              location: placement.location,
              startDate: placement.startDate,
              endDate: placement.endDate,
              shiftType: placement.shiftType,
              billRate: placement.billRate,
              status: placement.status,
              complianceStatus: placement.complianceStatus,
            })
          } catch (error) {
            console.warn("Failed to add mock placement", error)
          }
        }
      })
    } catch (error) {
      console.warn("Failed to save mock placements", error)
    }
  }
  
  return mockPlacements
}

