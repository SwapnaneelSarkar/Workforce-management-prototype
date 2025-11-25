"use client"

import { useState } from "react"
import { Card, Header, StatusChip, Avatar } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/system"
import { Edit2, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react"

export default function CandidateProfilePage() {
  const { candidate, actions } = useDemoData()
  const { pushToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: candidate.profile.name,
    email: candidate.profile.email,
    phone: candidate.profile.phone,
    location: candidate.profile.location,
    role: candidate.profile.role,
    shiftPreference: candidate.profile.shiftPreference,
    summary: candidate.profile.summary || "",
    specialties: candidate.profile.specialties.join(", "),
    skills: candidate.profile.skills.join(", "),
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await actions.updateEmail(formData.email)
      pushToast({ title: "Profile updated", description: "Your changes have been saved.", type: "success" })
      setIsEditing(false)
    } catch (error) {
      pushToast({ title: "Update failed", description: "Please try again.", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  // Calculate onboarding progress (26/30 based on image)
  const onboardingCompleted = 26
  const onboardingTotal = 30
  const onboardingPercent = Math.round((onboardingCompleted / onboardingTotal) * 100)

  // Profile categories with completion status
  const profileCategories = [
    { name: "Background and Identification", completed: 12, total: 12 },
    { name: "Employee Health", completed: 12, total: 12 },
    { name: "Professional Credentials/License", completed: 12, total: 12 },
    { name: "Immigration", completed: 12, total: 12 },
    { name: "Education/Training", completed: 12, total: 12 },
    { name: "Human Resources", completed: 12, total: 12 },
    { name: "Other", completed: 12, total: 12 },
    { name: "Certification", completed: 4, total: 12 },
    { name: "Assessment", completed: 4, total: 12 },
  ]

  // Update profile action items
  const updateProfileItems = [
    "Provide 2 recent references",
    "Skills checklist",
    "Certification",
  ]

  // Format birthday from email or use default
  const birthday = "Jul 2, 1990"

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
                setFormData({
                  name: candidate.profile.name,
                  email: candidate.profile.email,
                  phone: candidate.profile.phone,
                  location: candidate.profile.location,
                  role: candidate.profile.role,
                  shiftPreference: candidate.profile.shiftPreference,
                  summary: candidate.profile.summary || "",
                  specialties: candidate.profile.specialties.join(", "),
                  skills: candidate.profile.skills.join(", "),
                })
              }
              setIsEditing(!isEditing)
            },
          },
        ]}
      />

      {/* Onboarding Progress Section */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">Your Onboarding Progress</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You have completed your onboarding progress, View Details to see more
            </p>
            <Button variant="outline" className="bg-gray-800 text-white hover:bg-gray-700">
              View detail
            </Button>
          </div>
          <CircularProgress value={onboardingCompleted} total={onboardingTotal} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        {/* Left Column - Profile Details */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar
                  initials={candidate.profile.avatar}
                  alt={candidate.profile.name}
                  size="lg"
                  className="bg-yellow-100 text-yellow-800"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground">{candidate.profile.name}</h3>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{candidate.profile.specialties.join(", ")}</p>
                  <p className="text-sm font-semibold text-foreground">{candidate.profile.role}</p>
                </div>
              </div>
              <Edit2 className="h-4 w-4 text-muted-foreground cursor-pointer" />
            </div>
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Birthday:</span>
                <span className="text-foreground font-medium">{birthday}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-foreground font-medium">{candidate.profile.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Phone number:</span>
                <span className="text-foreground font-medium">{candidate.profile.phone}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shift Preference:</span>
                <span className="text-foreground font-medium">{candidate.profile.shiftPreference}</span>
              </div>
            </div>
          </Card>

          {/* Update Profile Section */}
          <Card>
            <h3 className="text-lg font-semibold text-foreground mb-1">Update your profile</h3>
            <p className="text-sm text-muted-foreground mb-4">Your profile needs your attention, update the sections below.</p>
            <div className="space-y-2">
              {updateProfileItems.map((item) => (
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
              ))}
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
