"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  getTimecardById,
  updateTimecardStatus,
  type LocalDbTimecard,
  type LocalDbTimecardStatus,
} from "@/lib/local-db"
import { ArrowLeft, Download, FilePenLine, CheckCircle2, XCircle, User, Briefcase } from "lucide-react"

type RouteParams = {
  timecardId: string
}

export default function TimecardDetailPage() {
  const params = useParams<RouteParams>()
  const router = useRouter()
  const { pushToast } = useToast()
  const timecardId = params?.timecardId

  const [timecard, setTimecard] = useState<LocalDbTimecard | null>(null)
  const [loadingAction, setLoadingAction] = useState<LocalDbTimecardStatus | null>(null)

  useEffect(() => {
    if (!timecardId) return
    const tc = getTimecardById(String(timecardId))
    if (tc) {
      setTimecard(tc)
    }
  }, [timecardId])

  const statusMeta = useMemo(() => {
    if (!timecard) return null
    switch (timecard.status) {
      case "approved":
        return { label: "Approved", tone: "success" as const }
      case "rejected":
        return { label: "Rejected", tone: "error" as const }
      case "submitted":
      default:
        return { label: "Submitted", tone: "info" as const }
    }
  }, [timecard])

  if (!timecard) {
    return (
      <div className="space-y-6 p-8">
        <Header
          title="Timecard not found"
          subtitle="The requested timecard could not be located."
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Timekeeping", href: "/organization/timekeeping" },
            { label: "Detail" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Timecard not found.</p>
            <Button
              variant="outline"
              onClick={() => router.push("/organization/timekeeping")}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Timekeeping
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const payPeriodLabel = (() => {
    const start = new Date(timecard.payPeriodStart)
    const end = new Date(timecard.payPeriodEnd)
    const format = (d: Date) =>
      d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })
    const year = end.getFullYear()
    return `${format(start)} - ${format(end)}, ${year}`
  })()

  const handleStatusChange = async (nextStatus: LocalDbTimecardStatus) => {
    setLoadingAction(nextStatus)
    try {
      const updated = updateTimecardStatus(timecard.id, nextStatus)
      if (updated) {
        setTimecard(updated)
        pushToast({
          title: "Success",
          description: `Timecard ${nextStatus} successfully`,
          type: "success",
        })
      } else {
        pushToast({
          title: "Error",
          description: "Failed to update timecard status",
          type: "error",
        })
      }
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to update timecard status",
        type: "error",
      })
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="space-y-6 p-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.push("/organization/timekeeping")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Timekeeping
      </Button>

      <Header
        title="Timecard Detail"
        subtitle="Organization Portal > Time & Billing > Timekeeping > Detail"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Timekeeping", href: "/organization/timekeeping" },
          { label: "Detail" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timecard Summary */}
          <Card title="Timecard Summary" subtitle={`Pay Period: ${payPeriodLabel}`}>
            <div className="space-y-6">
              {statusMeta && (
                <div className="pb-4 border-b">
                  <StatusChip label={statusMeta.label} tone={statusMeta.tone} />
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Regular Hours</Label>
                  <p className="text-2xl font-bold text-foreground">{timecard.regularHours}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Overtime Hours</Label>
                  <p className="text-2xl font-bold text-foreground">{timecard.overtimeHours}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Total Hours</Label>
                  <p className="text-2xl font-bold text-foreground">{timecard.totalHours}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Bill Rate</Label>
                  <p className="text-lg font-semibold text-foreground">
                    ${timecard.billRate.toFixed(2)}/hr
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Total Amount</Label>
                  <p className="text-lg font-semibold text-foreground">
                    ${timecard.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Daily Hours Breakdown */}
          <Card title="Daily Hours Breakdown">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Day
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Start
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      End
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Hours
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {timecard.days.length ? (
                    timecard.days.map((day) => (
                      <tr key={day.date}>
                        <td className="px-4 py-3 text-sm text-foreground">{day.label}</td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {day.startTime || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {day.endTime || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {day.hours} hrs
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {day.note || "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-muted-foreground"
                      >
                        No daily breakdown data available.
                      </td>
                    </tr>
                  )}
                  {timecard.days.length > 0 ? (
                    <tr className="bg-muted/20 font-semibold">
                      <td className="px-4 py-3 text-sm text-foreground">Week Total</td>
                      <td className="px-4 py-3 text-sm text-foreground">—</td>
                      <td className="px-4 py-3 text-sm text-foreground">—</td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {timecard.totalHours} hours
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">—</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Approval Actions */}
          <Card title="Approval Actions">
            <div className="space-y-4">
              <Button
                className="w-full ph5-button-primary"
                disabled={timecard.status === "approved" || !!loadingAction}
                onClick={() => handleStatusChange("approved")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {timecard.status === "approved" ? "Timecard Approved" : "Approve Timecard"}
              </Button>
              <Button
                className="w-full"
                variant="destructive"
                disabled={timecard.status === "rejected" || !!loadingAction}
                onClick={() => handleStatusChange("rejected")}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {timecard.status === "rejected" ? "Timecard Rejected" : "Reject Timecard"}
              </Button>
            </div>
          </Card>

          {/* Candidate */}
          <Card title="Candidate">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {timecard.candidateInitials}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-foreground">
                    {timecard.candidateName}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <User className="mr-2 h-4 w-4" />
                View Profile
              </Button>
            </div>
          </Card>

          {/* Assignment */}
          <Card title="Assignment">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {timecard.jobTitle}
                </p>
                <p className="text-xs text-muted-foreground">{timecard.assignmentName}</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Briefcase className="mr-2 h-4 w-4" />
                View Assignment Details
              </Button>
            </div>
          </Card>

          {/* Submission Details */}
          <Card title="Submission Details">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Status</Label>
                {statusMeta ? (
                  <StatusChip label={statusMeta.label} tone={statusMeta.tone} />
                ) : null}
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Submitted On</Label>
                <p className="text-sm font-medium text-foreground">
                  {timecard.submittedOn
                    ? new Date(timecard.submittedOn).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Not recorded"}
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="space-y-3">
              <Button variant="outline" className="w-full" type="button">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="ghost" className="w-full" type="button">
                <FilePenLine className="mr-2 h-4 w-4" />
                Request Revision
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

