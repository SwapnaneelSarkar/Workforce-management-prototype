"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, Header, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/system"
import { ArrowLeft, Calendar, MapPin, Clock, DollarSign, FileText, CheckCircle2, Circle, Mail, Phone } from "lucide-react"
import { getPlacementById, getJobById, type OrganizationPlacement } from "@/lib/organization-local-db"
import { getOrganizationById } from "@/lib/admin-local-db"
import type { LocalDbPlacementOnboarding, PlacementOnboardingTask } from "@/lib/local-db"

export default function PlacementDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const placementId = params?.id as string
  const { candidate } = useDemoData()
  const { data: localDb, getPlacementOnboarding, updatePlacementOnboarding } = useLocalDb()
  const { pushToast } = useToast()
  const [placement, setPlacement] = useState<OrganizationPlacement | null>(null)
  const [onboarding, setOnboarding] = useState<LocalDbPlacementOnboarding | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && placementId) {
      try {
        const foundPlacement = getPlacementById(placementId)
        if (foundPlacement) {
          setPlacement(foundPlacement)
          // Initialize or get onboarding status
          let currentOnboarding = getPlacementOnboarding(placementId)
          if (!currentOnboarding) {
            // Create default onboarding tasks
            const defaultTasks: PlacementOnboardingTask[] = [
              { id: "orientation", label: "Complete Orientation", completed: false },
              { id: "employment-agreement", label: "Sign Employment Agreement", completed: false },
              { id: "facility-tour", label: "Complete Facility Tour", completed: false },
              { id: "meet-manager", label: "Meet with Manager", completed: false },
            ]
            currentOnboarding = {
              placementId,
              tasks: defaultTasks,
              progress: 0,
              lastUpdated: new Date().toISOString(),
            }
            updatePlacementOnboarding(placementId, currentOnboarding)
          }
          setOnboarding(currentOnboarding)
        }
      } catch (error) {
        console.warn("Failed to load placement", error)
      }
    }
  }, [placementId, getPlacementOnboarding, updatePlacementOnboarding])

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

  if (!placement) {
    return (
      <div className="space-y-6 p-8">
        <Header title="Placement Details" />
        <Card>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Placement not found.
          </p>
        </Card>
      </div>
    )
  }

  const org = getOrganizationById(placement.organizationId)
  const orgName = org?.name || "Unknown Organization"
  const job = getJobById(placement.jobId)
  const location = placement.location || job?.location || "Not specified"

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

  const formatShiftTime = (shiftType?: string) => {
    if (!shiftType) return "Not specified"
    if (shiftType.includes("PM") || shiftType.includes("AM") || shiftType.includes("-")) {
      return shiftType
    }
    const shiftMap: Record<string, string> = {
      "Day Shift": "Day Shift (7AM - 7PM)",
      "Night Shift": "Night Shift (7PM - 7AM)",
      "Evening Shift": "Evening Shift (3PM - 11PM)",
    }
    return shiftMap[shiftType] || shiftType
  }


  const handleSubmitTimecard = () => {
    router.push(`/candidate/placements/${placementId}/timecard`)
  }

  const handleViewLocation = () => {
    // Open location in maps
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    window.open(mapsUrl, "_blank")
  }

  // Mock contact information - in real app, this would come from organization/job data
  const contacts = {
    hiringManager: {
      name: "Sarah Johnson",
      email: "sjohnson@mainhospital.com",
      phone: "(555) 123-4567",
    },
    unitCoordinator: {
      name: "Mike Davis",
      email: "mdavis@mainhospital.com",
      phone: "(555) 987-6543",
    },
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Placements"
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Placements", href: "/candidate/placements" },
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
        onClick={() => router.push("/candidate/placements")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Placements
      </Button>

      {/* Placement Header */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {placement.jobTitle}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">{orgName}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatShiftTime(placement.shiftType)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(placement.startDate)} - {formatDate(placement.endDate)}
                </span>
              </div>
            </div>
          </div>
          <StatusChip label={placement.status} tone={placement.status === "Active" ? "success" : placement.status === "Upcoming" ? "info" : "neutral"} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Key Information */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Key Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p className="text-sm text-foreground mt-1">{formatDate(placement.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <p className="text-sm text-foreground mt-1">{formatDate(placement.endDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pay Rate</label>
                <p className="text-sm text-foreground mt-1">{placement.billRate || "$0/hr"}</p>
              </div>
            </div>
          </Card>

          {/* Onboarding Status */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Onboarding Status</h2>
            {onboarding ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{onboarding.progress}% Complete</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${onboarding.progress}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  {onboarding.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={`text-sm flex-1 ${task.completed ? "text-foreground" : "text-muted-foreground"}`}>
                        {task.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading onboarding status...</p>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSubmitTimecard}
              >
                <FileText className="h-4 w-4 mr-2" />
                Submit Timecard
                <span className="ml-auto text-xs text-muted-foreground">Log your work hours</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleViewLocation}
              >
                <MapPin className="h-4 w-4 mr-2" />
                View Location
                <span className="ml-auto text-xs text-muted-foreground">Get directions</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Hiring Manager</h3>
                <div className="space-y-2">
                  <p className="text-sm text-foreground">{contacts.hiringManager.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${contacts.hiringManager.email}`} className="hover:text-primary">
                      {contacts.hiringManager.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${contacts.hiringManager.phone}`} className="hover:text-primary">
                      {contacts.hiringManager.phone}
                    </a>
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-2">Unit Coordinator</h3>
                <div className="space-y-2">
                  <p className="text-sm text-foreground">{contacts.unitCoordinator.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${contacts.unitCoordinator.email}`} className="hover:text-primary">
                      {contacts.unitCoordinator.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${contacts.unitCoordinator.phone}`} className="hover:text-primary">
                      {contacts.unitCoordinator.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

