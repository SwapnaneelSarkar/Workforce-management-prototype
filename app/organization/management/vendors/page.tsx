"use client"

import { useMemo, useState } from "react"
import { Header, Card, StatusChip } from "@/components/system"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type VendorStatus = "active" | "pending"

type Vendor = {
  id: string
  name: string
  status: VendorStatus
  submissions: number
  successRate: number
  lastActivity: string
  performance: number
}

const MOCK_VENDORS: Vendor[] = [
  {
    id: "medstaff",
    name: "MedStaff Solutions",
    status: "active",
    submissions: 48,
    successRate: 92,
    lastActivity: "2 days ago",
    performance: 92,
  },
  {
    id: "healthcare-staffing",
    name: "Healthcare Staffing Inc",
    status: "active",
    submissions: 35,
    successRate: 88,
    lastActivity: "5 days ago",
    performance: 88,
  },
  {
    id: "temp-care",
    name: "TempCare Services",
    status: "active",
    submissions: 27,
    successRate: 85,
    lastActivity: "1 week ago",
    performance: 85,
  },
  {
    id: "promed",
    name: "ProMed Staffing",
    status: "pending",
    submissions: 12,
    successRate: 75,
    lastActivity: "3 days ago",
    performance: 75,
  },
]

export default function OrganizationVendorsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | VendorStatus>("all")

  const summary = useMemo(() => {
    const totalVendors = MOCK_VENDORS.length
    const active = MOCK_VENDORS.filter((v) => v.status === "active").length
    const totalSubmissions = MOCK_VENDORS.reduce(
      (sum, v) => sum + v.submissions,
      0,
    )
    const pendingReview = MOCK_VENDORS.filter((v) => v.status === "pending").length
    return { totalVendors, active, totalSubmissions, pendingReview }
  }, [])

  const filteredVendors = useMemo(() => {
    return MOCK_VENDORS.filter((vendor) => {
      if (statusFilter !== "all" && vendor.status !== statusFilter) return false
      if (!search.trim()) return true
      const needle = search.toLowerCase()
      return vendor.name.toLowerCase().includes(needle)
    })
  }, [search, statusFilter])

  const statusChip = (status: VendorStatus) => {
    if (status === "active") {
      return <StatusChip label="Active" tone="success" />
    }
    return <StatusChip label="Pending" tone="info" />
  }

  return (
    <>
      <Header
        title="Vendors"
        subtitle="Manage vendor partnerships and monitor their submissions and performance."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Management", href: "/organization/management" },
          { label: "Vendors" },
        ]}
      />

      <section className="space-y-6">
        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Total Vendors
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {summary.totalVendors}
              </p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Active
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {summary.active}
              </p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Total Submissions
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {summary.totalSubmissions}
              </p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Pending Review
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {summary.pendingReview}
              </p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full max-w-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Search vendors
              </p>
              <Input
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Status
                </span>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as "all" | VendorStatus)
                  }
                >
                  <SelectTrigger className="min-w-[160px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Vendor cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-foreground">
                      {vendor.name}
                    </h3>
                    {statusChip(vendor.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Submissions
                      </p>
                      <p className="mt-1 font-semibold text-foreground">
                        {vendor.submissions}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Success Rate
                      </p>
                      <p className="mt-1 font-semibold text-foreground">
                        {vendor.successRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Last Activity
                      </p>
                      <p className="mt-1 text-foreground">{vendor.lastActivity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        Performance
                      </p>
                      <p className="mt-1 font-semibold text-foreground">
                        {vendor.performance}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  )
}
