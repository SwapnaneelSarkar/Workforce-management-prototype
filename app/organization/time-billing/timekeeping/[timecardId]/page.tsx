"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Button } from "@/components/ui/button"
import { StatusChip } from "@/components/system/status-chip"
import {
  getTimecardById,
  updateTimecardStatus,
  type LocalDbTimecard,
  type LocalDbTimecardStatus,
} from "@/lib/local-db"
import { ArrowLeft, Download, FilePenLine, CheckCircle2, XCircle } from "lucide-react"

type RouteParams = {
  timecardId: string
}

export default function OrganizationTimekeepingDetailPage() {
  const params = useParams<RouteParams>()
  const router = useRouter()

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
        return { label: "Rejected", tone: "danger" as const }
      case "submitted":
      default:
        return { label: "Submitted", tone: "info" as const }
    }
  }, [timecard])

  if (!timecard) {
    return (
      <>
        <Header
          title="Timecard not found"
          subtitle="The requested timecard could not be located in local storage."
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Time & Billing", href: "/organization/time-billing" },
            { label: "Timekeeping", href: "/organization/time-billing/timekeeping" },
            { label: "Timecard" },
          ]}
        />
        <section className="space-y-6">
          <Card>
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  This timecard may have been deleted or is not available in the local DB.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  router.push("/organization/time-billing/timekeeping")
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Timekeeping
              </Button>
            </div>
          </Card>
        </section>
      </>
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
      }
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <>
      <Header
        title="Timecard Summary"
        subtitle={`Review and approve timecard for ${timecard.candidateName}.`}
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Time & Billing", href: "/organization/time-billing" },
          { label: "Timekeeping", href: "/organization/time-billing/timekeeping" },
          { label: "Timecard Summary" },
        ]}
        actions={[
          {
            id: "back",
            label: "Back to Timekeeping",
            variant: "secondary",
            icon: <ArrowLeft className="h-4 w-4" />,
            onClick: () => router.push("/organization/time-billing/timekeeping"),
          },
        ]}
      />

      <section className="space-y-6">
        {/* Overview */}
        <div className="grid gap-4 md:grid-cols-[2fr,1.5fr]">
          <Card
            title="Timecard Summary"
            subtitle={`Pay Period: ${payPeriodLabel}`}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Status
                </p>
                {statusMeta ? (
                  <StatusChip label={statusMeta.label} tone={statusMeta.tone} />
                ) : null}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Regular Hours
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {timecard.regularHours}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Overtime Hours
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {timecard.overtimeHours}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Total Hours
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {timecard.totalHours}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Bill Rate
                </p>
                <p className="text-lg font-semibold text-foreground">
                  ${timecard.billRate.toFixed(2)}/hr
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Total Amount
                </p>
                <p className="text-lg font-semibold text-foreground">
                  ${timecard.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Approval Actions" subtitle="Approve or reject this timecard.">
            <div className="space-y-4">
              <Button
                className="w-full"
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
            <div className="mt-6 grid gap-3 md:grid-cols-2">
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

        {/* Daily breakdown */}
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
                        {day.startTime ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {day.endTime ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {day.hours} hrs
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {day.note ?? "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      No daily breakdown data stored for this timecard in the local DB.
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

        {/* Candidate / assignment / submission details */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Candidate">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {timecard.candidateInitials}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-foreground">
                  {timecard.candidateName}
                </p>
                <Button asChild variant="link" size="sm" className="px-0 text-xs">
                  <Link href="#">View Profile</Link>
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Assignment">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {timecard.jobTitle}
              </p>
              <p className="text-xs text-muted-foreground">{timecard.assignmentName}</p>
              <Button asChild variant="link" size="sm" className="px-0 text-xs">
                <Link href="#">View Assignment Details</Link>
              </Button>
            </div>
          </Card>

          <Card title="Submission Details">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Status
                </p>
                {statusMeta ? (
                  <StatusChip label={statusMeta.label} tone={statusMeta.tone} />
                ) : null}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Submitted On
                </p>
                <p className="text-sm text-foreground">
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
        </div>
      </section>
    </>
  )
}
