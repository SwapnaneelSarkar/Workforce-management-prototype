"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { DataTable } from "@/components/system/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import {
  getAllTimecards,
  type LocalDbTimecard,
  type LocalDbTimecardStatus,
} from "@/lib/local-db"
import { getCurrentOrganization } from "@/lib/organization-local-db"

type StatusFilter = "All" | LocalDbTimecardStatus

export default function TimekeepingPage() {
  const router = useRouter()
  const [orgId, setOrgId] = useState<string | null>(null)
  const [timecards, setTimecards] = useState<LocalDbTimecard[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [periodFilter, setPeriodFilter] = useState<"Last 7 days" | "Last 30 days" | "All time">("Last 7 days")

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
      if (periodFilter === "All time") return true
      const payPeriodEnd = new Date(tc.payPeriodEnd)
      const diffMs = startOfToday.getTime() - payPeriodEnd.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      if (periodFilter === "Last 7 days") return diffDays <= 7
      if (periodFilter === "Last 30 days") return diffDays <= 30
      return true
    }

    return timecards
      .filter(withinPeriod)
      .filter((tc) => {
        if (statusFilter === "All") return true
        return tc.status === statusFilter.toLowerCase() as LocalDbTimecardStatus
      })
      .filter((tc) => {
        if (!searchQuery.trim()) return true
        const needle = searchQuery.toLowerCase()
        return (
          tc.candidateName.toLowerCase().includes(needle) ||
          tc.assignmentName.toLowerCase().includes(needle) ||
          tc.jobTitle.toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => {
        // Sort by most recent pay period end first
        return new Date(b.payPeriodEnd).getTime() - new Date(a.payPeriodEnd).getTime()
      })
  }, [timecards, statusFilter, searchQuery, periodFilter])

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
        return { label: "Rejected", tone: "error" as const }
      case "submitted":
      default:
        return { label: "Submitted", tone: "info" as const }
    }
  }

  const formatPayPeriod = (tc: LocalDbTimecard) => {
    const start = new Date(tc.payPeriodStart)
    const end = new Date(tc.payPeriodEnd)
    const format = (d: Date) =>
      d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    const year = end.getFullYear()
    return `${format(start)} - ${format(end)}, ${year}`
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Timekeeping"
        subtitle="Organization Portal > Time & Billing > Timekeeping"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Time & Billing", href: "/organization/time-billing" },
          { label: "Timekeeping" },
        ]}
      />

      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Organization Role:</strong> Review and approve timecards submitted by candidates. Timecards are linked to assignments and support invoicing. Candidates submit timecards; Organization approves them.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total Timecards</p>
            <p className="text-3xl font-bold text-foreground">{summary.total}</p>
          </div>
        </Card>
        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Pending Review</p>
            <p className="text-3xl font-bold text-foreground">{summary.pending}</p>
          </div>
        </Card>
        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Approved</p>
            <p className="text-3xl font-bold text-foreground">{summary.approved}</p>
          </div>
        </Card>
        <Card className="p-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Rejected</p>
            <p className="text-3xl font-bold text-foreground">{summary.rejected}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by candidate or assignment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="min-w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-sm bg-card/95">
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={periodFilter}
              onValueChange={(value) =>
                setPeriodFilter(value as "Last 7 days" | "Last 30 days" | "All time")
              }
            >
              <SelectTrigger className="min-w-[140px]">
                <SelectValue placeholder="Last 7 days" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-sm bg-card/95">
                <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                <SelectItem value="All time">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Timecards Table */}
      <Card className="p-6">
        <DataTable<LocalDbTimecard>
          columns={[
            {
              id: "candidate",
              label: "Candidate",
              sortable: true,
              render: (tc) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
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
              id: "assignment",
              label: "Assignment",
              sortable: true,
              render: (tc) => (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {tc.assignmentName}
                  </span>
                </div>
              ),
            },
            {
              id: "payPeriod",
              label: "Pay Period",
              sortable: true,
              render: (tc) => (
                <span className="text-sm text-foreground">
                  {formatPayPeriod(tc)}
                </span>
              ),
            },
            {
              id: "totalHours",
              label: "Total Hours",
              sortable: true,
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
              sortable: true,
              render: (tc) => {
                const { label, tone } = statusToTone(tc.status)
                return <StatusChip label={label} tone={tone} />
              },
            },
            {
              id: "actions",
              label: "Actions",
              sortable: false,
              align: "right",
              render: (tc) => (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/organization/timekeeping/${tc.id}`)}
                >
                  View
                </Button>
              ),
            },
          ]}
          rows={filteredTimecards}
          rowKey={(row) => row.id}
        />
      </Card>
    </div>
  )
}
