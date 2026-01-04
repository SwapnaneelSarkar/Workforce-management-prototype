"use client"

import { useState, useEffect, useMemo } from "react"
import { Header, Card } from "@/components/system"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/system/date-picker"
import { Filter, TrendingUp, TrendingDown, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentOrganization } from "@/lib/organization-local-db"
import {
  getAllOccupations,
  getVendorOrganizationsByOrganizationId,
  getOrganizationById,
} from "@/lib/admin-local-db"

type MetricCategory = "quality" | "speed" | "price"

type MetricConfig = {
  id: string
  name: string
  category: MetricCategory
  goal?: number
  goalType?: "min" | "max" | "target"
  unit?: string
  description?: string
}

type MetricFilters = {
  occupation?: string
  vendor?: string
  location?: string
  dateFrom?: string
  dateTo?: string
}

const METRICS_CONFIG: MetricConfig[] = [
  // Quality Metrics
  {
    id: "rejection-rate",
    name: "Submission Rejection Rate",
    category: "quality",
    goal: 15,
    goalType: "max",
    unit: "%",
    description: "Percentage of submissions presented that get rejected",
  },
  {
    id: "fill-rate",
    name: "Fill Rate",
    category: "quality",
    goal: 85,
    goalType: "min",
    unit: "%",
    description: "Fill rate of requisitions vs. canceled due to inactivity",
  },
  {
    id: "early-end-candidate",
    name: "Early End - Candidate/Vendor",
    category: "quality",
    goal: 10,
    goalType: "max",
    unit: "%",
    description: "Percentage of assignments that end early - candidate/vendor ends",
  },
  {
    id: "early-end-termination",
    name: "Early End - Termination",
    category: "quality",
    goal: 5,
    goalType: "max",
    unit: "%",
    description: "Percentage of assignments that end early due to termination - client ends",
  },
  {
    id: "traveler-evaluation",
    name: "Traveler Evaluation (6 weeks)",
    category: "quality",
    goal: 80,
    goalType: "min",
    unit: "%",
    description: "Evaluation % of travelers in which they rate positively at the 6 week mark",
  },
  {
    id: "expired-credentials",
    name: "Expired Credentials Rate",
    category: "quality",
    goal: 2,
    goalType: "max",
    unit: "%",
    description: "Expired credentials rate is low and missed days due to expiring is low",
  },
  {
    id: "submit-to-offer",
    name: "Submit to Offer Ratio",
    category: "quality",
    goal: 3,
    goalType: "max",
    unit: ":1",
    description: "Submit to Offer ratio is low",
  },
  {
    id: "back-out-rate",
    name: "Back Out Rate",
    category: "quality",
    goal: 5,
    goalType: "max",
    unit: "%",
    description: "Back outs of accepted offers are low",
  },
  {
    id: "performance-grievances",
    name: "Performance Grievances",
    category: "quality",
    goal: 2,
    goalType: "max",
    unit: "%",
    description: "Performance grievances are low",
  },
  {
    id: "extension-acceptance",
    name: "Extension Acceptance Rate",
    category: "quality",
    goal: 75,
    goalType: "min",
    unit: "%",
    description: "Extension acceptance rate",
  },
  {
    id: "candidate-canceled-days",
    name: "Candidate Canceled Days",
    category: "quality",
    goal: 3,
    goalType: "max",
    unit: "days",
    description: "# Occurrences of candidate canceled days",
  },
  // Speed Metrics
  {
    id: "time-to-first-submission",
    name: "Time to First Submission",
    category: "speed",
    goal: 48,
    goalType: "max",
    unit: "hours",
    description: "Time to first submission",
  },
  {
    id: "time-post-to-offer",
    name: "Time from Post to Offer",
    category: "speed",
    goal: 7,
    goalType: "max",
    unit: "days",
    description: "Time from post to offer",
  },
  {
    id: "time-to-accept-offer",
    name: "Average Time to Accept Offer",
    category: "speed",
    goal: 2,
    goalType: "max",
    unit: "days",
    description: "Average time to accept offer",
  },
  {
    id: "time-post-to-start",
    name: "Time from Post to Start",
    category: "speed",
    goal: 14,
    goalType: "max",
    unit: "days",
    description: "Time from post to start",
  },
  {
    id: "on-time-starts",
    name: "On Time Starts",
    category: "speed",
    goal: 95,
    goalType: "min",
    unit: "%",
    description: "On time starts",
  },
  {
    id: "time-grievances-open",
    name: "Time Grievances Open",
    category: "speed",
    goal: 3,
    goalType: "max",
    unit: "days",
    description: "Time grievances open",
  },
  // Price Metrics
  {
    id: "market-rate",
    name: "Competitive Market Rate",
    category: "price",
    goal: 100,
    goalType: "target",
    unit: "%",
    description: "Competitively market rate at target fulfillment",
  },
  {
    id: "monetary-change-requests",
    name: "Monetary Change Requests",
    category: "price",
    goal: 10,
    goalType: "max",
    unit: "%",
    description: "% of change requests that are monetary",
  },
  {
    id: "candidate-canceled-days-stipends",
    name: "Candidate Canceled Days (Stipends)",
    category: "price",
    goal: 2,
    goalType: "max",
    unit: "days",
    description: "Candidate canceled days in locations where proration of stipends is prohibited",
  },
  {
    id: "penalty-fees",
    name: "Penalty Fees",
    category: "price",
    goal: 1,
    goalType: "max",
    unit: "%",
    description: "Penalty fees for missed breaks and lunches for relevant states",
  },
  {
    id: "overtime-rate",
    name: "Overtime Rate",
    category: "price",
    goal: 15,
    goalType: "max",
    unit: "%",
    description: "% of Candidates in OT or OT savings",
  },
  {
    id: "orientation-hours",
    name: "Average Orientation Hours",
    category: "price",
    goal: 8,
    goalType: "max",
    unit: "hours",
    description: "Average Orientation hours are at or below target",
  },
]

// Mock data generator for metrics
function generateMockMetricValue(metricId: string, goal?: number, goalType?: "min" | "max" | "target"): number {
  if (!goal) return Math.random() * 100

  switch (goalType) {
    case "min":
      return goal + (Math.random() * 20 - 10)
    case "max":
      return goal + (Math.random() * 20 - 10)
    case "target":
      return goal + (Math.random() * 10 - 5)
    default:
      return Math.random() * 100
  }
}

export default function OrganizationMetricsPage() {
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [filters, setFilters] = useState<MetricFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orgId = getCurrentOrganization()
      setCurrentOrgId(orgId)
      if (orgId) {
        const org = getOrganizationById(orgId)
        setOrganization(org)
      }
    }
  }, [])

  const vendorOrganizations = useMemo(() => {
    if (!currentOrgId) return []
    return getVendorOrganizationsByOrganizationId(currentOrgId)
  }, [currentOrgId])

  const organizationOccupations = useMemo(() => {
    if (!organization?.occupationIds) return []
    const allOccupations = getAllOccupations()
    return allOccupations.filter((occ) => organization.occupationIds.includes(occ.id))
  }, [organization])

  const organizationLocations = useMemo(() => {
    if (!organization?.locations) return []
    return organization.locations
  }, [organization])

  const metricsByCategory = useMemo(() => {
    const quality = METRICS_CONFIG.filter((m) => m.category === "quality")
    const speed = METRICS_CONFIG.filter((m) => m.category === "speed")
    const price = METRICS_CONFIG.filter((m) => m.category === "price")
    return { quality, speed, price }
  }, [])

  const getMetricValue = (metric: MetricConfig): number => {
    // In a real app, this would fetch from API based on filters
    return generateMockMetricValue(metric.id, metric.goal, metric.goalType)
  }

  const isMetricGood = (metric: MetricConfig, value: number): boolean => {
    if (!metric.goal) return true

    switch (metric.goalType) {
      case "min":
        return value >= metric.goal
      case "max":
        return value <= metric.goal
      case "target":
        return Math.abs(value - metric.goal) <= metric.goal * 0.1
      default:
        return true
    }
  }

  const formatMetricValue = (metric: MetricConfig, value: number): string => {
    if (metric.unit === "%") {
      return `${value.toFixed(1)}%`
    }
    if (metric.unit === ":1") {
      return `${value.toFixed(1)}:1`
    }
    return `${value.toFixed(1)} ${metric.unit || ""}`
  }

  const MetricCard = ({ metric }: { metric: MetricConfig }) => {
    const value = getMetricValue(metric)
    const isGood = isMetricGood(metric, value)
    const goalText = metric.goal
      ? `Goal: ${formatMetricValue(metric, metric.goal)}`
      : "No goal set"

    return (
      <Card className="p-4">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-foreground mb-1">{metric.name}</h3>
          <p className="text-xs text-muted-foreground mb-2">{metric.description}</p>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div>
            <p className="text-2xl font-bold text-foreground">{formatMetricValue(metric, value)}</p>
            <p className="text-xs text-muted-foreground">{goalText}</p>
          </div>
          <div className="flex items-center gap-1">
            {isGood ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs">
            {isGood ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-medium">Meeting Goal</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-red-600" />
                <span className="text-red-600 font-medium">Below Goal</span>
              </>
            )}
          </div>
        </div>
      </Card>
    )
  }

  if (!currentOrgId || !organization) {
    return (
      <>
        <Header
          title="Metrics Dashboard"
          subtitle="View organization metrics and analytics"
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Metrics" },
          ]}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading organization data...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="Metrics Dashboard"
        subtitle={`View metrics and analytics for ${organization.name}`}
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Metrics" },
        ]}
      />

      <section className="space-y-6">
        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-border">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Occupation
                </label>
                <Select
                  value={filters.occupation || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, occupation: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Occupations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Occupations</SelectItem>
                    {organizationOccupations.map((occ) => (
                      <SelectItem key={occ.id} value={occ.id}>
                        {occ.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Vendor
                </label>
                <Select
                  value={filters.vendor || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, vendor: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {vendorOrganizations.map((vo) => {
                      // Get vendor name from admin-local-db
                      const { getVendorById } = require("@/lib/admin-local-db")
                      const vendor = getVendorById(vo.vendorId)
                      return vendor ? (
                        <SelectItem key={vo.id} value={vo.vendorId}>
                          {vendor.name}
                        </SelectItem>
                      ) : null
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Location
                </label>
                <Select
                  value={filters.location || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, location: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {organizationLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name} - {loc.city}, {loc.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Date From
                  </label>
                  <DatePicker
                    label=""
                    value={filters.dateFrom || ""}
                    onChange={(value) => setFilters({ ...filters, dateFrom: value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Date To
                  </label>
                  <DatePicker
                    label=""
                    value={filters.dateTo || ""}
                    onChange={(value) => setFilters({ ...filters, dateTo: value })}
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Quality Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quality Metrics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {metricsByCategory.quality.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>

        {/* Speed Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Speed Metrics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {metricsByCategory.speed.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>

        {/* Price Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Price Metrics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {metricsByCategory.price.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

