"use client"

import { useMemo, useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, Header, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/system"
import { ArrowLeft, Calendar, Clock, Eye } from "lucide-react"
import { getPlacementById, getJobById, type OrganizationPlacement } from "@/lib/organization-local-db"
import { getOrganizationById } from "@/lib/admin-local-db"
import { getAllTimecards, upsertTimecard, getTimecardById, type LocalDbTimecard, type LocalDbTimecardDay, type LocalDbTimecardStatus } from "@/lib/local-db"

export default function TimecardPage() {
  const router = useRouter()
  const params = useParams()
  const placementId = params?.id as string
  const { candidate } = useDemoData()
  const { data: localDb } = useLocalDb()
  const { pushToast } = useToast()
  const [placement, setPlacement] = useState<OrganizationPlacement | null>(null)
  const [currentTimecard, setCurrentTimecard] = useState<LocalDbTimecard | null>(null)
  const [timecardHistory, setTimecardHistory] = useState<LocalDbTimecard[]>([])
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined" && placementId) {
      try {
        const foundPlacement = getPlacementById(placementId)
        if (foundPlacement) {
          setPlacement(foundPlacement)
          
          // Get all timecards for this placement
          const allTimecards = getAllTimecards()
          const placementTimecards = allTimecards.filter(
            (tc) => tc.assignmentId === foundPlacement.id || tc.candidateId === candidate.profile.id
          )
          
          // Get current week's timecard (week ending today or next Sunday)
          const today = new Date()
          const dayOfWeek = today.getDay()
          const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
          const weekEndDate = new Date(today)
          weekEndDate.setDate(today.getDate() + daysUntilSunday)
          weekEndDate.setHours(23, 59, 59, 999)
          
          const weekStartDate = new Date(weekEndDate)
          weekStartDate.setDate(weekEndDate.getDate() - 6)
          weekStartDate.setHours(0, 0, 0, 0)
          
          const weekEndStr = weekEndDate.toISOString().split("T")[0]
          const weekStartStr = weekStartDate.toISOString().split("T")[0]
          
          // Find or create current week's timecard
          let current = placementTimecards.find(
            (tc) => tc.payPeriodEnd === weekEndStr && tc.assignmentId === foundPlacement.id
          )
          
          if (!current) {
            // Create a draft timecard for current week
            const timecardId = `tc_${candidate.profile.id}_${weekEndStr}`
            const days: LocalDbTimecardDay[] = []
            for (let i = 0; i < 7; i++) {
              const date = new Date(weekStartDate)
              date.setDate(weekStartDate.getDate() + i)
              const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
              const monthDay = date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
              days.push({
                date: date.toISOString().split("T")[0],
                label: `${date.toISOString().split("T")[0]} (${dayName})`,
                hours: 0,
                breakMinutes: 0,
              })
            }
            
            current = {
              id: timecardId,
              organizationId: foundPlacement.organizationId,
              candidateId: candidate.profile.id,
              candidateName: candidate.profile.name,
              candidateInitials: candidate.profile.avatar,
              assignmentId: foundPlacement.id,
              assignmentName: foundPlacement.jobTitle,
              jobTitle: foundPlacement.jobTitle,
              payPeriodStart: weekStartStr,
              payPeriodEnd: weekEndStr,
              status: "submitted" as LocalDbTimecardStatus,
              regularHours: 0,
              overtimeHours: 0,
              totalHours: 0,
              billRate: parseFloat(foundPlacement.billRate?.replace("$", "").replace("/hr", "") || "0"),
              totalAmount: 0,
              days,
              notes: "",
            }
            
            upsertTimecard(current)
          }
          
          setCurrentTimecard(current)
          setNotes(current.notes || "")
          
          // Get history (excluding current week)
          const history = placementTimecards
            .filter((tc) => tc.payPeriodEnd !== weekEndStr)
            .sort((a, b) => new Date(b.payPeriodEnd).getTime() - new Date(a.payPeriodEnd).getTime())
          setTimecardHistory(history)
        }
      } catch (error) {
        console.warn("Failed to load timecard data", error)
      }
    }
  }, [placementId, candidate.profile.id, candidate.profile.name, candidate.profile.avatar])

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

  if (!placement || !currentTimecard) {
    return (
      <div className="space-y-6 p-8">
        <Header title="Timecard" />
        <Card>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Loading timecard data...
          </p>
        </Card>
      </div>
    )
  }

  const org = getOrganizationById(placement.organizationId)
  const orgName = org?.name || "Unknown Organization"

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

  const formatWeekEnding = (dateString: string) => {
    return formatDate(dateString)
  }

  const getStatusLabel = (timecard: LocalDbTimecard) => {
    if (timecard.totalHours === 0 && !timecard.submittedOn) {
      return "Draft"
    }
    switch (timecard.status) {
      case "approved":
        return "Approved"
      case "submitted":
        return "Submitted"
      case "rejected":
        return "Rejected"
      default:
        return "Draft"
    }
  }

  const getStatusTone = (timecard: LocalDbTimecard) => {
    if (timecard.totalHours === 0 && !timecard.submittedOn) {
      return "neutral" as const
    }
    switch (timecard.status) {
      case "approved":
        return "success" as const
      case "submitted":
        return "warning" as const
      case "rejected":
        return "danger" as const
      default:
        return "neutral" as const
    }
  }

  // Calculate hours from start time, end time, and break
  const calculateHours = (startTime?: string, endTime?: string, breakMinutes: number = 0): number => {
    if (!startTime || !endTime) return 0
    
    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)
    
    let startMinutes = startHour * 60 + startMin
    let endMinutes = endHour * 60 + endMin
    
    // Handle overnight shifts (end time is next day)
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60 // Add 24 hours
    }
    
    const totalMinutes = endMinutes - startMinutes - breakMinutes
    return Math.round((totalMinutes / 60) * 100) / 100 // Round to 2 decimal places
  }

  const handleTimeChange = (dayIndex: number, field: "startTime" | "endTime" | "breakMinutes", value: string) => {
    if (!currentTimecard) return
    
    const updatedDays = [...currentTimecard.days]
    const day = updatedDays[dayIndex]
    
    if (field === "breakMinutes") {
      const breakMins = parseInt(value) || 0
      updatedDays[dayIndex] = {
        ...day,
        breakMinutes: breakMins,
        hours: calculateHours(day.startTime, day.endTime, breakMins),
      }
    } else if (field === "startTime" || field === "endTime") {
      // HTML time input already provides 24-hour format (HH:MM)
      const time24 = value || undefined
      updatedDays[dayIndex] = {
        ...day,
        [field]: time24,
        hours: calculateHours(
          field === "startTime" ? time24 : day.startTime,
          field === "endTime" ? time24 : day.endTime,
          day.breakMinutes || 0
        ),
      }
    }
    
    const totalHours = updatedDays.reduce((sum, d) => sum + d.hours, 0)
    const regularHours = Math.min(totalHours, 40)
    const overtimeHours = Math.max(0, totalHours - 40)
    
    const updated: LocalDbTimecard = {
      ...currentTimecard,
      days: updatedDays,
      totalHours,
      regularHours,
      overtimeHours,
      totalAmount: totalHours * currentTimecard.billRate,
      notes,
    }
    
    setCurrentTimecard(updated)
  }

  const handleSaveDraft = () => {
    if (!currentTimecard) return
    
    const draft: LocalDbTimecard = {
      ...currentTimecard,
      notes,
      status: "submitted" as LocalDbTimecardStatus, // Keep as draft (not submitted)
    }
    
    upsertTimecard(draft)
    setCurrentTimecard(draft)
    
    pushToast({
      title: "Draft saved",
      description: "Your timecard has been saved as draft.",
      type: "success",
    })
  }

  const handleSubmit = () => {
    if (!currentTimecard) return
    
    if (currentTimecard.totalHours === 0) {
      pushToast({
        title: "Cannot submit",
        description: "Please enter at least some hours before submitting.",
        type: "error",
      })
      return
    }
    
    const submitted: LocalDbTimecard = {
      ...currentTimecard,
      status: "submitted",
      submittedOn: new Date().toISOString(),
      notes,
    }
    
    upsertTimecard(submitted)
    setCurrentTimecard(submitted)
    
    pushToast({
      title: "Timecard submitted",
      description: "Your timecard has been submitted for approval.",
      type: "success",
    })
  }

  const handleViewDetails = (timecardId: string) => {
    router.push(`/candidate/placements/${placementId}/timecard/${timecardId}`)
  }

  const handleContinueEntry = (timecardId: string) => {
    const timecard = getTimecardById(timecardId)
    if (timecard) {
      setCurrentTimecard(timecard)
      setNotes(timecard.notes || "")
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Timecard"
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Placements", href: "/candidate/placements" },
          { label: "Timecard" },
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
        onClick={() => router.push(`/candidate/placements/${placementId}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Placement Details
      </Button>

      {/* Current Assignment */}
      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-2">Current Assignment</h2>
        <p className="text-sm text-foreground">{placement.jobTitle} - {orgName}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Week Ending: {formatWeekEnding(currentTimecard.payPeriodEnd)}
        </p>
      </Card>

      {/* Weekly Time Entry */}
      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-4">Weekly Time Entry</h2>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-foreground">Start Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-foreground">End Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-foreground">Break (min)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-foreground">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {currentTimecard.days.map((day, index) => (
                  <tr key={day.date} className="border-b border-border">
                    <td className="py-3 px-4 text-sm text-foreground">{day.label}</td>
                    <td className="py-3 px-4">
                      <Input
                        type="time"
                        value={day.startTime || ""}
                        onChange={(e) => {
                          const time24 = e.target.value
                          handleTimeChange(index, "startTime", time24)
                        }}
                        className="w-32"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Input
                        type="time"
                        value={day.endTime || ""}
                        onChange={(e) => {
                          const time24 = e.target.value
                          handleTimeChange(index, "endTime", time24)
                        }}
                        className="w-32"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Input
                        type="number"
                        min="0"
                        max="480"
                        value={day.breakMinutes || ""}
                        onChange={(e) => handleTimeChange(index, "breakMinutes", e.target.value)}
                        className="w-24"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground font-medium">
                      {day.hours.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/20 font-semibold">
                  <td className="py-3 px-4 text-sm text-foreground">Total Hours:</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-sm text-foreground">{currentTimecard.totalHours.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Notes */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this week's hours..."
              className="min-h-[100px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
            >
              Save as Draft
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={currentTimecard.totalHours === 0}
            >
              Submit Timecard
            </Button>
          </div>
        </div>
      </Card>

      {/* Timecard History */}
      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-4">Timecard History</h2>
        {timecardHistory.length > 0 ? (
          <div className="space-y-4">
            {timecardHistory.map((timecard) => (
              <div
                key={timecard.id}
                className="rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {timecard.assignmentName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Week Ending: {formatWeekEnding(timecard.payPeriodEnd)}
                    </p>
                  </div>
                  <StatusChip label={getStatusLabel(timecard)} tone={getStatusTone(timecard)} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{timecard.totalHours} hours</span>
                    {timecard.status === "approved" && timecard.lastUpdated && (
                      <span>Approved on {formatDate(timecard.lastUpdated)}</span>
                    )}
                    {timecard.status === "submitted" && timecard.submittedOn && (
                      <span className="text-warning">Awaiting approval</span>
                    )}
                    {((timecard.totalHours === 0 && !timecard.submittedOn) || (timecard.status !== "approved" && timecard.status !== "submitted" && !timecard.submittedOn)) && (
                      <span>Not yet submitted</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {((timecard.totalHours === 0 && !timecard.submittedOn) || (timecard.status !== "approved" && timecard.status !== "submitted" && !timecard.submittedOn)) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleContinueEntry(timecard.id)}
                      >
                        Continue Entry
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(timecard.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No timecard history yet.
          </p>
        )}
      </Card>
    </div>
  )
}
