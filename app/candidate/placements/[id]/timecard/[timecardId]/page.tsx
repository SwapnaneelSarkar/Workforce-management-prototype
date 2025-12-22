"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, Header, StatusChip } from "@/components/system"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { getPlacementById } from "@/lib/organization-local-db"
import { getTimecardById, type LocalDbTimecard } from "@/lib/local-db"

export default function TimecardDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const placementId = params?.id as string
  const timecardId = params?.timecardId as string
  const [timecard, setTimecard] = useState<LocalDbTimecard | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && timecardId) {
      try {
        const found = getTimecardById(timecardId)
        if (found) {
          setTimecard(found)
        }
      } catch (error) {
        console.warn("Failed to load timecard", error)
      }
    }
  }, [timecardId])

  if (!timecard) {
    return (
      <div className="space-y-6 p-8">
        <Header title="Timecard Details" />
        <Card>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Timecard not found.
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

  const formatTime = (time24?: string): string => {
    if (!time24) return "--:--"
    const [hours, minutes] = time24.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12.toString().padStart(2, "0")}:${minutes} ${ampm}`
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
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

  const getStatusTone = (status: string) => {
    switch (status) {
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

  const placement = placementId ? getPlacementById(placementId) : null

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Header
          title="Timecard Details"
          breadcrumbs={[
            { label: "Candidate Portal", href: "/candidate/dashboard" },
            { label: "Placements", href: "/candidate/placements" },
            { label: "Timecard", href: `/candidate/placements/${placementId}/timecard` },
            { label: "Details" },
          ]}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/candidate/placements/${placementId}/timecard`)}
        >
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>

      <Card>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Week Ending: {formatDate(timecard.payPeriodEnd)}
            </h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Assignment</h3>
            <p className="text-sm text-foreground">{timecard.assignmentName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
            <StatusChip label={getStatusLabel(timecard.status)} tone={getStatusTone(timecard.status)} />
          </div>
          {timecard.status === "approved" && timecard.lastUpdated && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Approved On</h3>
              <p className="text-sm text-foreground">{formatDate(timecard.lastUpdated)}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Hours</h3>
            <p className="text-sm text-foreground font-semibold">{timecard.totalHours} hours</p>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Time Entries</h3>
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
                {timecard.days.filter((day) => day.hours > 0).map((day) => (
                  <tr key={day.date} className="border-b border-border">
                    <td className="py-3 px-4 text-sm text-foreground">{day.label}</td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {formatTime(day.startTime)}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {formatTime(day.endTime)}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {day.breakMinutes || 0}
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
                  <td className="py-3 px-4 text-sm text-foreground">{timecard.totalHours.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {timecard.notes && (
          <div className="border-t border-border pt-6 mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{timecard.notes}</p>
          </div>
        )}
      </Card>
    </div>
  )
}

