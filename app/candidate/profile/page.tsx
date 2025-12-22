"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, Header, Avatar, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/system"
import { Edit2, CheckCircle2, ChevronRight, MapPin, FileText, Bell, Shield, HelpCircle, LogOut, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { getOccupationByCode, getActiveOccupations } from "@/lib/admin-local-db"
import { getAllPlacements, type OrganizationPlacement } from "@/lib/organization-local-db"
import { getAllTimecards, type LocalDbTimecard } from "@/lib/local-db"

export default function CandidateProfilePage() {
  const router = useRouter()
  const { candidate, actions, allJobs } = useDemoData()
  const { data: localDb, saveOnboardingDetails } = useLocalDb()
  const { pushToast } = useToast()
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [isEditingProfessional, setIsEditingProfessional] = useState(false)
  const [saving, setSaving] = useState(false)
  const onboardingAnswers = localDb.onboardingDetails
  const currentOccupationCode = (onboardingAnswers.occupation as string | undefined) || ""
  
  const [personalFormData, setPersonalFormData] = useState({
    name: candidate.profile.name,
    email: candidate.profile.email,
    phone: candidate.profile.phone || (onboardingAnswers.phoneNumber as string) || "",
    location: candidate.profile.location,
  })

  const [professionalFormData, setProfessionalFormData] = useState({
    occupation: currentOccupationCode,
    specialties: candidate.profile.specialties.join(", "),
    skills: candidate.profile.skills.join(", "),
    certifications: candidate.profile.skills.filter(s => s.includes("Certification") || s.includes("License")).join(", ") || "BLS, ACLS, CCRN",
    experience: onboardingAnswers.yearsOfExperience as string || "5 years",
    preferredShifts: candidate.profile.shiftPreference || (onboardingAnswers.preferredShift as string) || "Night Shift, Day Shift",
    preferredLocations: (onboardingAnswers.city as string) && (onboardingAnswers.state as string) 
      ? `${onboardingAnswers.city}, ${onboardingAnswers.state}` 
      : candidate.profile.location || "Boston, MA",
  })
  
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(candidate.profile.specialties)
  
  // Get occupation options
  const occupationOptions = useMemo(() => {
    try {
      const occupations = getActiveOccupations()
      return occupations.map((occ) => ({ label: occ.name, value: occ.code }))
    } catch (error) {
      return []
    }
  }, [])

  // Get candidate's placements
  const candidatePlacements = useMemo(() => {
    try {
      const allPlacements = getAllPlacements()
      return allPlacements.filter((p) => p.candidateId === candidate.profile.id)
    } catch (error) {
      return []
    }
  }, [candidate.profile.id])

  const currentAssignment = useMemo(() => {
    return candidatePlacements.find((p) => p.status === "Active" || p.status === "Ending Soon")
  }, [candidatePlacements])

  const pastAssignments = useMemo(() => {
    return candidatePlacements.filter((p) => p.status === "Completed")
  }, [candidatePlacements])

  // Get candidate's timecards
  const candidateTimecards = useMemo(() => {
    try {
      const allTimecards = getAllTimecards()
      return allTimecards.filter((tc) => tc.candidateId === candidate.profile.id)
    } catch (error) {
      return []
    }
  }, [candidate.profile.id])

  // Get applied jobs
  const appliedJobs = useMemo(() => {
    const appliedJobIds = new Set([
      ...Object.keys(localDb.jobApplications),
      ...candidate.applications.map((app) => app.jobId),
    ])
    return allJobs.filter((job) => appliedJobIds.has(job.id))
  }, [localDb.jobApplications, candidate.applications, allJobs])

  // Get first 3 documents
  const firstThreeDocuments = useMemo(() => {
    return candidate.documents.slice(0, 3)
  }, [candidate.documents])

  // Calculate profile completion
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

  // Update form data when candidate profile changes
  useEffect(() => {
    if (!isEditingPersonal) {
      setPersonalFormData({
        name: candidate.profile.name,
        email: candidate.profile.email,
        phone: candidate.profile.phone || (onboardingAnswers.phoneNumber as string) || "",
        location: candidate.profile.location,
      })
    }
  }, [candidate.profile, isEditingPersonal, onboardingAnswers.phoneNumber])

  useEffect(() => {
    if (!isEditingProfessional) {
      const currentOcc = (localDb.onboardingDetails.occupation as string | undefined) || ""
      setProfessionalFormData({
        occupation: currentOcc,
        specialties: candidate.profile.specialties.join(", "),
        skills: candidate.profile.skills.join(", "),
        certifications: candidate.profile.skills.filter(s => s.includes("Certification") || s.includes("License")).join(", ") || "BLS, ACLS, CCRN",
        experience: onboardingAnswers.yearsOfExperience as string || "5 years",
        preferredShifts: candidate.profile.shiftPreference || (onboardingAnswers.preferredShift as string) || "Night Shift, Day Shift",
        preferredLocations: (onboardingAnswers.city as string) && (onboardingAnswers.state as string) 
          ? `${onboardingAnswers.city}, ${onboardingAnswers.state}` 
          : candidate.profile.location || "Boston, MA",
      })
      setSelectedSpecialties(candidate.profile.specialties)
    }
  }, [candidate.profile, isEditingProfessional, localDb.onboardingDetails, onboardingAnswers])

  const handleSavePersonal = async () => {
    setSaving(true)
    try {
      await actions.updateProfile({
        name: personalFormData.name,
        email: personalFormData.email,
        phone: personalFormData.phone,
        location: personalFormData.location,
      })
      if (personalFormData.phone) {
        saveOnboardingDetails({ phoneNumber: personalFormData.phone })
      }
      pushToast({ title: "Profile updated", description: "Your personal information has been saved.", type: "success" })
      setIsEditingPersonal(false)
    } catch (error) {
      pushToast({ title: "Update failed", description: "Please try again.", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProfessional = async () => {
    setSaving(true)
    try {
      await actions.updateProfile({
        specialties: selectedSpecialties,
        skills: professionalFormData.skills.split(",").map(s => s.trim()).filter(s => s.length > 0),
        shiftPreference: professionalFormData.preferredShifts.split(",")[0].trim(),
      })
      if (professionalFormData.occupation) {
        saveOnboardingDetails({ occupation: professionalFormData.occupation })
      }
      pushToast({ title: "Profile updated", description: "Your professional information has been saved.", type: "success" })
      setIsEditingProfessional(false)
    } catch (error) {
      pushToast({ title: "Update failed", description: "Please try again.", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const getStatusTone = (status: string) => {
    switch (status) {
      case "Completed":
      case "Approved":
        return "success"
      case "Pending Verification":
        return "warning"
      case "Expired":
        return "danger"
      case "Pending Upload":
        return "info"
      default:
        return "neutral"
    }
  }

  const occupation = currentOccupationCode ? getOccupationByCode(currentOccupationCode) : null
  const occupationName = occupation ? occupation.name : candidate.profile.role
  const specialtyDisplay = candidate.profile.specialties.length > 0 
    ? candidate.profile.specialties.join(" / ") 
    : "Not specified"
  
  const locationDisplay = (onboardingAnswers.city as string) && (onboardingAnswers.state as string)
    ? `${onboardingAnswers.city}, ${onboardingAnswers.state}`
    : candidate.profile.location || "Not specified"
  
  const additionalLocations = locationDisplay !== "Not specified" ? ["Cambridge, MA", "Brookline, MA"] : []

  const SPECIALTY_OPTIONS = [
    "ICU", "Critical Care", "ER", "Emergency", "Med-Surg", "Medical-Surgical",
    "Pediatrics", "OB/GYN", "Oncology", "Cardiac", "Telemetry", "Progressive Care",
    "PCU", "Long-term Care", "Rehabilitation", "Home Health", "Surgery",
    "Operating Room", "Orthopedics", "Neurological", "Geriatric", "Mental Health",
    "Hand Therapy", "Sports Medicine", "Cardiopulmonary", "Family Practice", "Urgent Care",
  ]

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Profile"
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Profile" },
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

      {/* Profile Card */}
        <Card>
        <div className="flex items-start gap-4">
          <Avatar
            initials={candidate.profile.avatar}
            alt={candidate.profile.name}
            size="lg"
            className="bg-yellow-100 text-yellow-800"
          />
            <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold text-foreground">{candidate.profile.name}</h2>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{occupationName}</p>
            <p className="text-sm text-muted-foreground mb-2">{specialtyDisplay}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{locationDisplay}</span>
              {additionalLocations.length > 0 && (
                <>
                  {additionalLocations.map((loc, idx) => (
                    <span key={idx}>, {loc}</span>
                  ))}
                  <span className="ml-1">+{additionalLocations.length} more</span>
                </>
              )}
            </div>
          </div>
          </div>
        </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
              {!isEditingPersonal && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingPersonal(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                {isEditingPersonal ? (
                  <Input
                    value={personalFormData.name}
                    onChange={(e) => setPersonalFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm text-foreground mt-1">{candidate.profile.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                {isEditingPersonal ? (
                  <div className="mt-1">
                    <p className="text-sm text-foreground">{candidate.profile.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">(Email cannot be edited)</p>
                  </div>
                ) : (
                  <p className="text-sm text-foreground mt-1">{candidate.profile.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                {isEditingPersonal ? (
                  <Input
                    value={personalFormData.phone}
                    onChange={(e) => setPersonalFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="mt-1"
                    placeholder="(555) 123-4567"
                  />
                ) : (
                  <p className="text-sm text-foreground mt-1">{personalFormData.phone || "Not provided"}</p>
                )}
              </div>
                <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                {isEditingPersonal ? (
                      <Input
                    value={personalFormData.location}
                    onChange={(e) => setPersonalFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="mt-1"
                    placeholder="Boston, MA 02101"
                  />
                ) : (
                  <p className="text-sm text-foreground mt-1">{locationDisplay}</p>
                )}
              </div>
              {isEditingPersonal && (
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingPersonal(false)
                      setPersonalFormData({
                        name: candidate.profile.name,
                        email: candidate.profile.email,
                        phone: candidate.profile.phone || (onboardingAnswers.phoneNumber as string) || "",
                        location: candidate.profile.location,
                      })
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePersonal}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Professional Information */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Professional Information</h3>
              {!isEditingProfessional && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingProfessional(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Occupation & Specialty</label>
                {isEditingProfessional ? (
                  <div className="mt-1 space-y-2">
                    <select
                      value={professionalFormData.occupation}
                      onChange={(e) => setProfessionalFormData((prev) => ({ ...prev, occupation: e.target.value }))}
                      className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                    >
                      <option value="">Select occupation</option>
                      {occupationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-left font-normal"
                            >
                              <span className={selectedSpecialties.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                                {selectedSpecialties.length > 0
                                  ? `${selectedSpecialties.length} selected`
                                  : "Select specialties"}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto">
                            {SPECIALTY_OPTIONS.map((specialty) => {
                              const isSelected = selectedSpecialties.includes(specialty)
                              return (
                                <DropdownMenuCheckboxItem
                                  key={specialty}
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                  setSelectedSpecialties([...selectedSpecialties, specialty])
                                    } else {
                                  setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty))
                                    }
                                  }}
                                >
                                  {specialty}
                                </DropdownMenuCheckboxItem>
                              )
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  ) : (
                  <p className="text-sm text-foreground mt-1">
                    {occupationName} • {specialtyDisplay}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Skills</label>
                {isEditingProfessional ? (
                  <Input
                    value={professionalFormData.skills}
                    onChange={(e) => setProfessionalFormData((prev) => ({ ...prev, skills: e.target.value }))}
                    className="mt-1"
                    placeholder="IV Therapy, Ventilator Management, ECMO"
                  />
                ) : (
                  <p className="text-sm text-foreground mt-1">
                    {candidate.profile.skills.join(", ") || "Not specified"}
                  </p>
              )}
            </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Certifications</label>
                {isEditingProfessional ? (
                  <Input
                    value={professionalFormData.certifications}
                    onChange={(e) => setProfessionalFormData((prev) => ({ ...prev, certifications: e.target.value }))}
                    className="mt-1"
                    placeholder="BLS, ACLS, CCRN"
                  />
                ) : (
                  <p className="text-sm text-foreground mt-1">
                    {professionalFormData.certifications}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Experience</label>
                {isEditingProfessional ? (
                  <Input
                    value={professionalFormData.experience}
                    onChange={(e) => setProfessionalFormData((prev) => ({ ...prev, experience: e.target.value }))}
                    className="mt-1"
                    placeholder="5 years"
                  />
                ) : (
                  <p className="text-sm text-foreground mt-1">{professionalFormData.experience}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preferred Shift Types</label>
                {isEditingProfessional ? (
                  <Input
                    value={professionalFormData.preferredShifts}
                    onChange={(e) => setProfessionalFormData((prev) => ({ ...prev, preferredShifts: e.target.value }))}
                    className="mt-1"
                    placeholder="Night Shift, Day Shift"
                  />
                ) : (
                  <p className="text-sm text-foreground mt-1">{professionalFormData.preferredShifts}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preferred Locations</label>
                {isEditingProfessional ? (
                  <Input
                    value={professionalFormData.preferredLocations}
                    onChange={(e) => setProfessionalFormData((prev) => ({ ...prev, preferredLocations: e.target.value }))}
                    className="mt-1"
                    placeholder="Boston, MA, Cambridge, MA"
                  />
                ) : (
                  <p className="text-sm text-foreground mt-1">{professionalFormData.preferredLocations}</p>
                )}
              </div>
              {isEditingProfessional && (
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfessional(false)
                      const currentOcc = (localDb.onboardingDetails.occupation as string | undefined) || ""
                      setProfessionalFormData({
                        occupation: currentOcc,
                        specialties: candidate.profile.specialties.join(", "),
                        skills: candidate.profile.skills.join(", "),
                        certifications: candidate.profile.skills.filter(s => s.includes("Certification") || s.includes("License")).join(", ") || "BLS, ACLS, CCRN",
                        experience: onboardingAnswers.yearsOfExperience as string || "5 years",
                        preferredShifts: candidate.profile.shiftPreference || (onboardingAnswers.preferredShift as string) || "Night Shift, Day Shift",
                        preferredLocations: (onboardingAnswers.city as string) && (onboardingAnswers.state as string) 
                          ? `${onboardingAnswers.city}, ${onboardingAnswers.state}` 
                          : candidate.profile.location || "Boston, MA",
                      })
                      setSelectedSpecialties(candidate.profile.specialties)
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfessional}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Document Wallet */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Document Wallet</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/candidate/documents")}
              >
                View All
              </Button>
            </div>
            {firstThreeDocuments.length > 0 ? (
              <div className="space-y-3">
                {firstThreeDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{doc.type}</span>
                    </div>
                    <StatusChip label={doc.status} tone={getStatusTone(doc.status)} />
                  </div>
                ))}
              </div>
              ) : (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
              )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Saved Jobs */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Saved Jobs</h3>
            </div>
            <div className="text-center py-8">
              <p className="text-sm font-medium text-foreground mb-1">0 Saved</p>
              <p className="text-sm text-muted-foreground mb-4">
                No saved jobs yet
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Save jobs you're interested in to review them later
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/candidate/jobs")}
              >
                Browse Jobs
              </Button>
            </div>
          </Card>

          {/* Assignments & Job Activity */}
          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-4">Assignments & Job Activity</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Applied Jobs</h4>
                {appliedJobs.length > 0 ? (
            <div className="space-y-2">
                    {appliedJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/candidate/jobs/${job.id}`)}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{job.title}</p>
                          <p className="text-xs text-muted-foreground">{job.location}</p>
                    </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    ))}
                    {appliedJobs.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => router.push("/candidate/applications")}
                      >
                        View All ({appliedJobs.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No applications yet.</p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Current Assignment</h4>
                {currentAssignment ? (
                  <div className="rounded-lg border border-border px-3 py-2">
                    <p className="text-sm font-medium text-foreground">{currentAssignment.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">{currentAssignment.location}</p>
                    <StatusChip label={currentAssignment.status} tone="success" className="mt-2" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active assignment.</p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Past Assignments</h4>
                {pastAssignments.length > 0 ? (
                  <div className="space-y-2">
                    {pastAssignments.slice(0, 3).map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{assignment.jobTitle}</p>
                          <p className="text-xs text-muted-foreground">{assignment.location}</p>
                        </div>
                        <StatusChip label={assignment.status} tone="neutral" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No past assignments.</p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Timecard History</h4>
                {candidateTimecards.length > 0 ? (
                  <div className="space-y-2">
                    {candidateTimecards.slice(0, 3).map((timecard) => (
                      <div
                        key={timecard.id}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{timecard.assignmentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(timecard.payPeriodStart).toLocaleDateString()} - {new Date(timecard.payPeriodEnd).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusChip label={timecard.status} tone={timecard.status === "approved" ? "success" : "warning"} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No timecard history.</p>
                )}
              </div>
            </div>
          </Card>

          {/* Settings */}
          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-4">Settings</h3>
            <div className="space-y-2">
              <button className="flex items-center gap-3 w-full text-left rounded-lg border border-border px-4 py-3 hover:bg-muted/50 transition-colors">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Notification Preferences</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </button>
              <button className="flex items-center gap-3 w-full text-left rounded-lg border border-border px-4 py-3 hover:bg-muted/50 transition-colors">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Account Security</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </button>
              <button className="flex items-center gap-3 w-full text-left rounded-lg border border-border px-4 py-3 hover:bg-muted/50 transition-colors">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Help & Support</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </button>
              <button className="flex items-center gap-3 w-full text-left rounded-lg border border-border px-4 py-3 hover:bg-muted/50 transition-colors">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Privacy & Terms</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </button>
              <button className="flex items-center gap-3 w-full text-left rounded-lg border border-border px-4 py-3 hover:bg-muted/50 transition-colors text-muted-foreground">
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
              <button className="flex items-center gap-3 w-full text-left rounded-lg border border-destructive/50 px-4 py-3 hover:bg-destructive/10 transition-colors text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="text-sm">Delete Account</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
