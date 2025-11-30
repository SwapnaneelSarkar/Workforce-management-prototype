"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, Header, Avatar } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/system"
import { Edit2, CheckCircle2, AlertTriangle, ChevronRight, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { getQuestionnaireByOccupationId, getOccupationByCode, getActiveOccupations } from "@/lib/admin-local-db"

export default function CandidateProfilePage() {
  const { candidate, actions } = useDemoData()
  const { data: localDb, saveOnboardingDetails } = useLocalDb()
  const { pushToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const onboardingAnswers = localDb.onboardingDetails
  const currentOccupationCode = (onboardingAnswers.occupation as string | undefined) || ""
  
  const [formData, setFormData] = useState({
    name: candidate.profile.name,
    email: candidate.profile.email,
    phone: candidate.profile.phone,
    location: candidate.profile.location,
    role: candidate.profile.role,
    occupation: currentOccupationCode,
    shiftPreference: candidate.profile.shiftPreference,
    summary: candidate.profile.summary || "",
    specialties: candidate.profile.specialties.join(", "),
    skills: candidate.profile.skills.join(", "),
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

  // Update formData when candidate profile changes
  useEffect(() => {
    if (!isEditing) {
      const currentOcc = (localDb.onboardingDetails.occupation as string | undefined) || ""
      setFormData({
        name: candidate.profile.name,
        email: candidate.profile.email,
        phone: candidate.profile.phone,
        location: candidate.profile.location,
        role: candidate.profile.role,
        occupation: currentOcc,
        shiftPreference: candidate.profile.shiftPreference,
        summary: candidate.profile.summary || "",
        specialties: candidate.profile.specialties.join(", "),
        skills: candidate.profile.skills.join(", "),
      })
      setSelectedSpecialties(candidate.profile.specialties)
    }
  }, [candidate.profile, isEditing])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update profile with all form data
      await actions.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        role: formData.role,
        shiftPreference: formData.shiftPreference,
        summary: formData.summary,
        specialties: selectedSpecialties,
        skills: formData.skills.split(",").map(s => s.trim()).filter(s => s.length > 0),
      })
      // Save occupation to onboarding details
      if (formData.occupation) {
        saveOnboardingDetails({ occupation: formData.occupation })
      }
      pushToast({ title: "Profile updated", description: "Your changes have been saved.", type: "success" })
      setIsEditing(false)
    } catch (error) {
      pushToast({ title: "Update failed", description: "Please try again.", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  // Calculate document completion
  const fallbackRequiredDocs = ["Resume", "Date of birth proof", "Certifications", "References", "License"]
  const requiredDocs =
    candidate.onboarding.requiredDocuments.length > 0 ? candidate.onboarding.requiredDocuments : fallbackRequiredDocs
  const uploadedDocSet = new Set(Object.keys(localDb.uploadedDocuments))
  const docsCompleted = requiredDocs.filter((doc) => uploadedDocSet.has(doc)).length
  const docTotal = requiredDocs.length

  // Calculate questionnaire completion (only occupation questionnaires count, general are skippable)
  const questionnaireCompletion = useMemo(() => {
    const occupationCode = onboardingAnswers.occupation as string | undefined
    if (!occupationCode) {
      return { completed: 0, total: 0 }
    }

    const occupation = getOccupationByCode(occupationCode)
    const occupationQuestionnaire = occupation ? getQuestionnaireByOccupationId(occupation.id) : null

    // Only count occupation questionnaire questions (general questionnaires are skippable)
    const occupationQuestions = occupationQuestionnaire?.questions || []

    if (occupationQuestions.length === 0) {
      return { completed: 0, total: 0 }
    }

    const questionnaireAnswers = (localDb.onboardingDetails?.questionnaireAnswers || {}) as Record<string, string | string[]>
    const requiredQuestions = occupationQuestions.filter((q) => q.required)
    const totalRequired = requiredQuestions.length

    if (totalRequired === 0) {
      // If no required questions, check if all occupation questions are answered
      const allAnswered = occupationQuestions.every((q) => {
        const answer = questionnaireAnswers[q.id]
        return answer !== undefined && answer !== null && answer !== "" && 
               (!Array.isArray(answer) || answer.length > 0)
      })
      return { completed: allAnswered ? occupationQuestions.length : 0, total: occupationQuestions.length }
    }

    const completedRequired = requiredQuestions.filter((q) => {
      const answer = questionnaireAnswers[q.id]
      return answer !== undefined && answer !== null && answer !== "" && 
             (!Array.isArray(answer) || answer.length > 0)
    }).length

    return { completed: completedRequired, total: totalRequired }
  }, [onboardingAnswers.occupation, localDb.onboardingDetails?.questionnaireAnswers])

  // Calculate combined progress (questionnaires + documents only)
  const totalCompleted = docsCompleted + questionnaireCompletion.completed
  const totalRequirements = docTotal + questionnaireCompletion.total || 1
  const onboardingPercent = Math.round((totalCompleted / totalRequirements) * 100)

  // Profile categories with completion status
  const profileCategories = [
    {
      name: "Questionnaires",
      completed: questionnaireCompletion.completed,
      total: questionnaireCompletion.total,
    },
    ...requiredDocs.map((doc) => ({
      name: doc,
      completed: uploadedDocSet.has(doc) ? 1 : 0,
      total: 1,
    })),
  ]

  // Update profile action items
  const outstandingItems = [
    ...(questionnaireCompletion.completed < questionnaireCompletion.total ? ["Complete questionnaires"] : []),
    ...requiredDocs.filter((doc) => !uploadedDocSet.has(doc)),
  ]
  const updateProfileItems = outstandingItems.slice(0, 3)

  // Format birthday from email or use default
  const birthday = "Jul 2, 1990"

  // Options for dropdowns
  const SHIFT_OPTIONS = ["Day Shift", "Night Shift", "Rotational Shift", "Weekend Shift", "Evening Shift", "Variable Shift"]
  const SPECIALTY_OPTIONS = [
    "ICU",
    "Critical Care",
    "ER",
    "Emergency",
    "Med-Surg",
    "Medical-Surgical",
    "Pediatrics",
    "OB/GYN",
    "Oncology",
    "Cardiac",
    "Telemetry",
    "Progressive Care",
    "PCU",
    "Long-term Care",
    "Rehabilitation",
    "Home Health",
    "Surgery",
    "Operating Room",
    "Orthopedics",
    "Neurological",
    "Geriatric",
    "Mental Health",
    "Hand Therapy",
    "Sports Medicine",
    "Cardiopulmonary",
    "Family Practice",
    "Urgent Care",
  ]

  return (
    <div className="space-y-6 p-8">
      <Header
        title="My Profile"
        subtitle="Manage your personal information and professional details."
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Profile" },
        ]}
        actions={[
          {
            id: "edit",
            label: isEditing ? "Cancel" : "Edit",
            variant: "secondary",
            onClick: () => {
              if (isEditing) {
                const currentOcc = (localDb.onboardingDetails.occupation as string | undefined) || ""
                setFormData({
                  name: candidate.profile.name,
                  email: candidate.profile.email,
                  phone: candidate.profile.phone,
                  location: candidate.profile.location,
                  role: candidate.profile.role,
                  occupation: currentOcc,
                  shiftPreference: candidate.profile.shiftPreference,
                  summary: candidate.profile.summary || "",
                  specialties: candidate.profile.specialties.join(", "),
                  skills: candidate.profile.skills.join(", "),
                })
                setSelectedSpecialties(candidate.profile.specialties)
              }
              setIsEditing(!isEditing)
            },
          },
        ]}
      />

      {/* Profile Progress Section */}
      {questionnaireCompletion.completed < questionnaireCompletion.total ? (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">Your Profile Progress</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {totalRequirements > 0
                  ? `You're ${onboardingPercent}% complete (${totalCompleted}/${totalRequirements}). Keep going to unlock applications.`
                  : "Start your profile checklist to unlock job submissions."}
              </p>
              <Button
                variant="outline"
                className="bg-gray-800 text-white hover:bg-gray-700"
                onClick={() => {
                  window.location.href = "/candidate/onboarding"
                }}
              >
                Review checklist
              </Button>
            </div>
            <CircularProgress value={totalCompleted} total={totalRequirements} />
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">Your Profile Progress</h3>
              <p className="text-sm text-success mb-4">
                🎉 Congratulations! Your profile is 100% complete ({totalCompleted}/{totalRequirements}). You're ready to apply for jobs.
              </p>
            </div>
            <CircularProgress value={totalCompleted} total={totalRequirements} />
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        {/* Left Column - Profile Details */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar
                  initials={candidate.profile.avatar}
                  alt={isEditing ? formData.name : candidate.profile.name}
                  size="lg"
                  className="bg-yellow-100 text-yellow-800"
                />
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Full name"
                        className="text-lg font-semibold"
                      />
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Specialties</label>
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
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto !bg-background !opacity-100 border border-border shadow-lg">
                            {SPECIALTY_OPTIONS.map((specialty) => {
                              const isSelected = selectedSpecialties.includes(specialty)
                              return (
                                <DropdownMenuCheckboxItem
                                  key={specialty}
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      const updated = [...selectedSpecialties, specialty]
                                      setSelectedSpecialties(updated)
                                      setFormData((prev) => ({ ...prev, specialties: updated.join(", ") }))
                                    } else {
                                      const updated = selectedSpecialties.filter(s => s !== specialty)
                                      setSelectedSpecialties(updated)
                                      setFormData((prev) => ({ ...prev, specialties: updated.join(", ") }))
                                    }
                                  }}
                                >
                                  {specialty}
                                </DropdownMenuCheckboxItem>
                              )
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {selectedSpecialties.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {selectedSpecialties.map((specialty) => (
                              <span key={specialty} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                {specialty}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = selectedSpecialties.filter(s => s !== specialty)
                                    setSelectedSpecialties(updated)
                                    setFormData((prev) => ({ ...prev, specialties: updated.join(", ") }))
                                  }}
                                  className="hover:text-destructive"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">Occupation</label>
                        <select
                          value={formData.occupation}
                          onChange={(e) => setFormData((prev) => ({ ...prev, occupation: e.target.value }))}
                          className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                        >
                          <option value="">Select occupation</option>
                          {occupationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{candidate.profile.name}</h3>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{candidate.profile.specialties.join(", ")}</p>
                      <p className="text-sm font-semibold text-foreground">
                        {(() => {
                          const occCode = (onboardingAnswers.occupation as string | undefined) || ""
                          const occupation = occCode ? getOccupationByCode(occCode) : null
                          return occupation ? occupation.name : candidate.profile.role
                        })()}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {!isEditing && (
                <Edit2 
                  className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" 
                  onClick={() => setIsEditing(true)}
                />
              )}
            </div>
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Birthday:</span>
                {isEditing ? (
                  <Input
                    type="date"
                    value={birthday ? new Date(birthday).toISOString().split('T')[0] : ""}
                    onChange={(e) => {
                      // Birthday is read-only for now, could be made editable if needed
                    }}
                    className="w-48"
                    disabled
                  />
                ) : (
                  <span className="text-foreground font-medium">{birthday}</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">{candidate.profile.email}</span>
                    <span className="text-xs text-muted-foreground">(Email cannot be edited)</span>
                  </div>
                ) : (
                  <span className="text-foreground font-medium">{candidate.profile.email}</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Phone number:</span>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    type="tel"
                    className="w-64"
                  />
                ) : (
                  <span className="text-foreground font-medium">{candidate.profile.phone}</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shift Preference:</span>
                {isEditing ? (
                  <select
                    value={formData.shiftPreference}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shiftPreference: e.target.value }))}
                    className="w-64 rounded-md border border-border bg-input px-3 py-2 text-sm"
                  >
                    <option value="">Select shift preference</option>
                    {SHIFT_OPTIONS.map((shift) => (
                      <option key={shift} value={shift}>
                        {shift}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-foreground font-medium">{candidate.profile.shiftPreference || "Not set"}</span>
                )}
              </div>
              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentOcc = (localDb.onboardingDetails.occupation as string | undefined) || ""
                      setFormData({
                        name: candidate.profile.name,
                        email: candidate.profile.email,
                        phone: candidate.profile.phone,
                        location: candidate.profile.location,
                        role: candidate.profile.role,
                        occupation: currentOcc,
                        shiftPreference: candidate.profile.shiftPreference,
                        summary: candidate.profile.summary || "",
                        specialties: candidate.profile.specialties.join(", "),
                        skills: candidate.profile.skills.join(", "),
                      })
                      setSelectedSpecialties(candidate.profile.specialties)
                      setIsEditing(false)
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="ph5-button-primary"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Update Profile Section */}
          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-1">Update your profile</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {updateProfileItems.length > 0
                ? "Your profile needs your attention, update the sections below."
                : questionnaireCompletion.completed === questionnaireCompletion.total && docsCompleted === docTotal
                  ? "All onboarding tasks are complete. Great work!"
                  : "Questionnaires are complete. Upload remaining documents to finish your profile."}
            </p>
            <div className="space-y-2">
              {updateProfileItems.length > 0 ? (
                updateProfileItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground bg-muted/30">
                  Nothing pending right now.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Profile Categories */}
        <div className="space-y-6">
          <Card>
            <div className="space-y-2">
              {profileCategories.map((category) => {
                const isComplete = category.completed === category.total
                return (
                  <div
                    key={category.name}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {!isComplete && <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                      <span className="text-sm text-foreground">{category.name}</span>
                      <span className="text-xs text-muted-foreground">({category.completed}/{category.total})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CircularProgress({ value, total }: { value: number; total: number }) {
  const percent = Math.round((value / total) * 100)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative h-36 w-36 flex-shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} stroke="#E2E8F0" strokeWidth="12" fill="transparent" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="#3182CE"
          strokeWidth="12"
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-semibold text-foreground">{value}/{total}</span>
      </div>
    </div>
  )
}
