"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { DataTable } from "@/components/system/table"
import { StatusChip } from "@/components/system/status-chip"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  getAllTimecards,
  type LocalDbTimecard,
  type LocalDbTimecardStatus,
} from "@/lib/local-db"
import { getCurrentOrganization } from "@/lib/organization-local-db"
import { Clock } from "lucide-react"

type StatusFilter = "all" | LocalDbTimecardStatus

export default function OrganizationTimeBillingTimekeepingPage() {
  const [orgId, setOrgId] = useState<string | null>(null)
  const [timecards, setTimecards] = useState<LocalDbTimecard[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [periodFilter, setPeriodFilter] = useState<"last7" | "last30" | "all">("all")

  useEffect(() => {
    if (typeof window === "undefined") return
    const currentOrg = getCurrentOrganization()
    setOrgId(currentOrg)

    const all = getAllTimecards().filter((tc) =>
      currentOrg ? tc.organizationId === currentOrg : true,
    )
    setTimecards(all)
  }, [])

  const filteredTimecards = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const withinPeriod = (tc: LocalDbTimecard) => {
      if (periodFilter === "all") return true
      const payPeriodEnd = new Date(tc.payPeriodEnd)
      const diffMs = startOfToday.getTime() - payPeriodEnd.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      if (periodFilter === "last7") return diffDays <= 7
      if (periodFilter === "last30") return diffDays <= 30
      return true
    }

    return timecards
      .filter(withinPeriod)
      .filter((tc) => {
        if (statusFilter === "all") return true
        return tc.status === statusFilter
      })
      .filter((tc) => {
        if (!search.trim()) return true
        const needle = search.toLowerCase()
        return (
          tc.candidateName.toLowerCase().includes(needle) ||
          tc.assignmentName.toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => {
        // Sort by most recent pay period end first
        return new Date(b.payPeriodEnd).getTime() - new Date(a.payPeriodEnd).getTime()
      })
  }, [timecards, statusFilter, search, periodFilter])

  const summary = useMemo(() => {
    const total = timecards.length
    const pending = timecards.filter((tc) => tc.status === "submitted").length
    const approved = timecards.filter((tc) => tc.status === "approved").length
    const rejected = timecards.filter((tc) => tc.status === "rejected").length
    return { total, pending, approved, rejected }
  }, [timecards])

  const statusToTone = (status: LocalDbTimecardStatus) => {
    switch (status) {
      case "approved":
        return { label: "Approved", tone: "success" as const }
      case "rejected":
        return { label: "Rejected", tone: "danger" as const }
      case "submitted":
      default:
        return { label: "Submitted", tone: "info" as const }
    }
  }

  return (
    <>
      <Header
        title="Timekeeping"
        subtitle="Review and approve timecards submitted by candidates for your organization."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Time & Billing", href: "/organization/time-billing" },
          { label: "Timekeeping" },
        ]}
      />

      <section className="space-y-6">
        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Total Timecards
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">{summary.total}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Pending Review
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">{summary.pending}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Approved
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">{summary.approved}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Rejected
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">{summary.rejected}</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full max-w-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Search
              </p>
              <Input
                placeholder="Search by candidate or assignment..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Status
                </span>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                >
                  <SelectTrigger className="min-w-[160px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Pay Period
                </span>
                <Select
                  value={periodFilter}
                  onValueChange={(value) =>
                    setPeriodFilter(value as "last7" | "last30" | "all")
                  }
                >
                  <SelectTrigger className="min-w-[160px]">
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7">Last 7 days</SelectItem>
                    <SelectItem value="last30">Last 30 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Timecards table */}
        <Card title="Timecards" subtitle="Review, approve, or reject submitted timecards.">
          <DataTable<LocalDbTimecard>
            columns={[
              {
                id: "candidate",
                label: "Candidate",
                render: (tc) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {tc.candidateInitials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {tc.candidateName}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                id: "assignmentName",
                label: "Assignment",
                render: (tc) => (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {tc.assignmentName}
                    </span>
                    <span className="text-xs text-muted-foreground">{tc.jobTitle}</span>
                  </div>
                ),
              },
              {
                id: "payPeriod",
                label: "Pay Period",
                render: (tc) => {
                  const start = new Date(tc.payPeriodStart)
                  const end = new Date(tc.payPeriodEnd)
                  const format = (d: Date) =>
                    d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  const year = end.getFullYear()
                  return (
                    <span className="text-sm text-foreground">
                      {format(start)} - {format(end)}, {year}
                    </span>
                  )
                },
              },
              {
                id: "totalHours",
                label: "Total Hours",
                align: "right",
                render: (tc) => (
                  <span className="text-sm font-semibold text-foreground">
                    {tc.totalHours} hrs
                  </span>
                ),
              },
              {
                id: "status",
                label: "Status",
                render: (tc) => {
                  const { label, tone } = statusToTone(tc.status)
                  return <StatusChip label={label} tone={tone} />
                },
              },
              {
                id: "actions",
                label: "Actions",
                align: "right",
                render: (tc) => (
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/organization/time-billing/timekeeping/${tc.id}`}
                    >
                      View
                    </Link>
                  </Button>
                ),
              },
            ]}
            rows={filteredTimecards}
          />
        </Card>
      </section>
    </>
  )
}
