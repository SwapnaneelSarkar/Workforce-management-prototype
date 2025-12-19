"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { 
  getCurrentOrganization, 
  getJobsByOrganization, 
  getApplicationsByOrganization 
} from "@/lib/organization-local-db"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"
import { TrendingUp, Users, Clock, CheckCircle2 } from "lucide-react"
import { candidates } from "@/lib/mock-data"

function getOccupationFromRole(role: string): string | null {
  const roleLower = role.toLowerCase()
  if (roleLower.includes("registered nurse") || roleLower.includes("rn")) return "RN"
  if (roleLower.includes("lpn") || roleLower.includes("licensed practical")) return "LPN"
  if (roleLower.includes("cna") || roleLower.includes("certified nursing")) return "CNA"
  if (roleLower.includes("physical therapist") || roleLower.includes("pt")) return "PT"
  if (roleLower.includes("occupational therapist") || roleLower.includes("ot")) return "OT"
  if (roleLower.includes("respiratory therapist") || roleLower.includes("rt")) return "RT"
  if (roleLower.includes("speech therapist") || roleLower.includes("st")) return "ST"
  if (roleLower.includes("nurse practitioner") || roleLower.includes("fnp")) return "FNP"
  if (roleLower.includes("director of nursing") || roleLower.includes("don")) return "DON"
  if (roleLower.includes("dentist") || roleLower.includes("dds")) return "DDS"
  return null
}

export default function OrganizationDashboardPage() {
  const { organization } = useDemoData()
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [timePeriod, setTimePeriod] = useState<"7" | "30" | "90">("30")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      setCurrentOrgId(getCurrentOrganization())
    }
  }, [])

  // Get actual data from organization local DB
  const orgJobs = useMemo(() => {
    if (!currentOrgId) return []
    return getJobsByOrganization(currentOrgId)
  }, [currentOrgId])

  const orgApplications = useMemo(() => {
    if (!currentOrgId) return []
    return getApplicationsByOrganization(currentOrgId)
  }, [currentOrgId])

  // Calculate metrics
  const totalJobs = orgJobs.length
  const totalDraftJobs = orgJobs.filter((job) => job.status === "Draft").length
  const totalPublishedJobs = orgJobs.filter((job) => job.status !== "Draft").length
  const totalApplications = orgApplications.length

  // Applications trend data with mock historical data
  const applicationsTrend = useMemo(() => {
    if (!mounted) return []
    
    const days = timePeriod === "7" ? 7 : timePeriod === "30" ? 30 : 90
    const data: { date: string; count: number; fullDate: string }[] = []
    const today = new Date()
    
    // Get actual application counts
    const actualCounts: Record<string, number> = {}
    orgApplications.forEach((app) => {
      const appDate = new Date(app.submittedAt)
      const dateKey = appDate.toISOString().split('T')[0]
      actualCounts[dateKey] = (actualCounts[dateKey] || 0) + 1
    })
    
    // Use a seeded random function for deterministic mock data
    let seed = 12345 // Fixed seed for consistency
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    
    // Generate data with mock historical trends
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      
      // Use actual count if available, otherwise generate realistic mock data
      let count = actualCounts[dateKey] || 0
      
      // If no actual data, generate mock data with realistic patterns
      if (count === 0 && days > 7) {
        // Create realistic variation: higher on weekdays, lower on weekends
        const dayOfWeek = date.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        
        // Base trend: slightly increasing over time with deterministic variation
        const baseTrend = Math.max(0, 15 + (days - i) * 0.3)
        const weekendFactor = isWeekend ? 0.4 : 1
        const randomVariation = (seededRandom() * 8 - 4) // -4 to +4 (deterministic)
        const weeklyPattern = Math.sin((i / 7) * Math.PI * 2) * 5 // Weekly cycle
        
        count = Math.max(0, Math.round(baseTrend * weekendFactor + randomVariation + weeklyPattern))
      } else if (count === 0 && days <= 7) {
        // For 7 days, use smaller numbers with deterministic variation
        const dayOfWeek = date.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const baseCount = isWeekend ? 2 : 8
        count = Math.max(0, Math.round(baseCount + (seededRandom() * 6 - 3)))
      }
      
      data.push({ date: dateStr, count, fullDate: dateKey })
    }
    
    return data
  }, [orgApplications, timePeriod, mounted])

  // Calculate trend statistics
  const trendStats = useMemo(() => {
    if (!mounted || applicationsTrend.length === 0) {
      return { total: 0, average: 0, peak: 0, trend: "neutral" as const }
    }
    
    const counts = applicationsTrend.map(d => d.count)
    const total = counts.reduce((a, b) => a + b, 0)
    const average = Math.round(total / counts.length)
    const peak = Math.max(...counts)
    
    // Calculate trend (comparing first half to second half)
    const midPoint = Math.floor(counts.length / 2)
    const firstHalf = counts.slice(0, midPoint)
    const secondHalf = counts.slice(midPoint)
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    const trend = secondAvg > firstAvg * 1.1 ? "up" : secondAvg < firstAvg * 0.9 ? "down" : "neutral"
    
    return { total, average, peak, trend }
  }, [applicationsTrend, mounted])

  // Compliance calculations
  const complianceData = useMemo(() => {
    // Get all unique compliance items from jobs
    const allRequiredItems = new Set<string>()
    orgJobs.forEach((job) => {
      job.requirements?.forEach((req) => allRequiredItems.add(req))
    })

    // Get candidates from applications (these are the "workers")
    const candidateIds = new Set(orgApplications.map((app) => app.candidateId))
    const relevantCandidates = candidates.filter((c) => candidateIds.has(c.id))

    // If no candidates, return default values
    if (relevantCandidates.length === 0 || allRequiredItems.size === 0) {
      return {
        overallCompliance: 87, // Default value when no data
        missingItems: [],
        itemCompliance: {},
      }
    }

    // Calculate compliance per item
    const itemCompliance: Record<string, { total: number; missing: number }> = {}
    allRequiredItems.forEach((item) => {
      itemCompliance[item] = { total: 0, missing: 0 }
    })

    // For each candidate, check which required items they have
    relevantCandidates.forEach((candidate) => {
      const completedDocTypes = candidate.documents
        .filter((doc) => doc.status === "Completed")
        .map((doc) => doc.type)
      
      // Check each required item against this candidate
      allRequiredItems.forEach((item) => {
        itemCompliance[item].total++
        if (!completedDocTypes.includes(item)) {
          itemCompliance[item].missing++
        }
      })
    })

    // Calculate overall compliance
    let totalRequired = 0
    let totalCompleted = 0
    Object.values(itemCompliance).forEach(({ total, missing }) => {
      totalRequired += total
      totalCompleted += total - missing
    })
    const overallCompliance = totalRequired > 0 
      ? Math.round((totalCompleted / totalRequired) * 100) 
      : 87

    // Most common missing items
    const missingItems = Object.entries(itemCompliance)
      .map(([name, data]) => ({
        name,
        missing: data.missing,
        total: data.total,
        percentage: data.total > 0 ? Math.round((data.missing / data.total) * 100) : 0,
      }))
      .filter((item) => item.missing > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)

    return {
      overallCompliance,
      missingItems,
      itemCompliance,
    }
  }, [orgJobs, orgApplications])

  // Compliance by occupation
  const complianceByOccupation = useMemo(() => {
    const occupationMap: Record<string, { total: number; completed: number }> = {}
    
    // Group candidates by their occupation (from their role)
    const candidateIds = new Set(orgApplications.map((app) => app.candidateId))
    const relevantCandidates = candidates.filter((c) => candidateIds.has(c.id))
    
    // Map candidate roles to occupation codes
    relevantCandidates.forEach((candidate) => {
      const occupation = getOccupationFromRole(candidate.role)
      if (!occupation) return
      
      if (!occupationMap[occupation]) {
        occupationMap[occupation] = { total: 0, completed: 0 }
      }
      
      occupationMap[occupation].total++
      
      // Check if candidate has all required documents completed
      const completedDocs = candidate.documents.filter((doc) => doc.status === "Completed")
      const requiredDocs = candidate.requiredDocuments || []
      const hasAllDocs = requiredDocs.length === 0 || requiredDocs.every((req) => 
        completedDocs.some((doc) => doc.type === req)
      )
      
      if (hasAllDocs && requiredDocs.length > 0) {
        occupationMap[occupation].completed++
      } else if (requiredDocs.length === 0) {
        // If no required docs specified, consider complete if has any docs
        occupationMap[occupation].completed++
      }
    })

    // Also check jobs for occupation data
    orgJobs.forEach((job) => {
      if (!job.occupation) return
      const occupation = job.occupation
      if (!occupationMap[occupation]) {
        occupationMap[occupation] = { total: 0, completed: 0 }
      }
      
      const jobApplications = orgApplications.filter((app) => app.jobId === job.id)
      jobApplications.forEach((app) => {
        const candidate = candidates.find((c) => c.id === app.candidateId)
        if (candidate) {
          if (!occupationMap[occupation]) {
            occupationMap[occupation] = { total: 0, completed: 0 }
          }
          occupationMap[occupation].total++
          const completedDocs = candidate.documents.filter((doc) => doc.status === "Completed")
          const requiredDocs = job.requirements || []
          const hasAllDocs = requiredDocs.length === 0 || requiredDocs.every((req) => 
            completedDocs.some((doc) => doc.type === req)
          )
          if (hasAllDocs) {
            occupationMap[occupation].completed++
          }
        }
      })
    })

    return Object.entries(occupationMap)
      .map(([occupation, data]) => ({
        occupation: getOccupationDisplayName(occupation),
        percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        total: data.total,
      }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 7)
  }, [orgJobs, orgApplications])

  // Workforce summary
  const workforceSummary = useMemo(() => {
    const activeCandidates = new Set(orgApplications.map((app) => app.candidateId)).size
    const vendorSupplied = orgApplications.filter((app) => app.vendorName).length
    
    // Calculate average response time (mock calculation based on application dates)
    const responseTimes: number[] = []
    orgApplications.forEach((app) => {
      const submittedDate = new Date(app.submittedAt)
      const now = new Date()
      const daysDiff = (now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysDiff >= 0 && daysDiff <= 30) {
        responseTimes.push(daysDiff)
      }
    })
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 2.3

    // Calculate fill rate (accepted applications / total applications)
    const acceptedApplications = orgApplications.filter(
      (app) => app.status === "Accepted" || app.status === "Offer"
    ).length
    const fillRate = totalApplications > 0
      ? Math.round((acceptedApplications / totalApplications) * 100)
      : 0

    return {
      activeCandidates,
      vendorSupplied,
      avgResponseTime: avgResponseTime.toFixed(1),
      fillRate,
    }
  }, [orgApplications, totalApplications])

  const chartConfig = {
    applications: {
      label: "Applications",
      color: "hsl(var(--chart-1))",
    },
  }

  // Show loading state during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        <Header
          title="Organization Dashboard"
          subtitle="Overview of your hiring and compliance metrics"
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Dashboard" },
          ]}
        />
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <p className="ph5-label mb-2">Loading...</p>
                <p className="text-3xl font-semibold text-foreground">-</p>
              </Card>
            ))}
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <Header
        title="Organization Dashboard"
        subtitle="Overview of your hiring and compliance metrics"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Dashboard" },
        ]}
      />

      <section className="space-y-6">
        {/* Overview Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <p className="ph5-label mb-2">Total Jobs</p>
            <p className="text-3xl font-semibold text-foreground">{totalJobs}</p>
          </Card>
          <Card className="p-6">
            <p className="ph5-label mb-2">Published Jobs</p>
            <p className="text-3xl font-semibold text-foreground">{totalPublishedJobs}</p>
          </Card>
          <Card className="p-6">
            <p className="ph5-label mb-2">Draft Jobs</p>
            <p className="text-3xl font-semibold text-foreground">{totalDraftJobs}</p>
          </Card>
          <Card className="p-6">
            <p className="ph5-label mb-2">Total Applications</p>
            <p className="text-3xl font-semibold text-foreground">{totalApplications}</p>
          </Card>
        </div>

        {/* Applications Trend */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Applications Trend</h2>
              <p className="text-sm text-muted-foreground">Track application volume over time</p>
            </div>
            <div className="flex gap-2">
              {(["7", "30", "90"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    timePeriod === period
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {period} Days
                </button>
              ))}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Total Applications</p>
              <p className="text-2xl font-bold text-foreground">{trendStats.total}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Daily Average</p>
              <p className="text-2xl font-bold text-foreground">{trendStats.average}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Peak Day</p>
              <p className="text-2xl font-bold text-foreground">{trendStats.peak}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Trend</p>
              <div className="flex items-center gap-2">
                {trendStats.trend === "up" && (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">↑</p>
                  </>
                )}
                {trendStats.trend === "down" && (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                    <p className="text-2xl font-bold text-red-600">↓</p>
                  </>
                )}
                {trendStats.trend === "neutral" && (
                  <p className="text-2xl font-bold text-muted-foreground">→</p>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Chart */}
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <AreaChart data={applicationsTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--muted))" 
                vertical={false}
                opacity={0.3}
              />
              <XAxis 
                dataKey="date" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                interval={timePeriod === "7" ? 0 : timePeriod === "30" ? 2 : 5}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                width={40}
              />
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                        <p className="text-sm font-medium text-foreground mb-1">
                          {payload[0].payload.date}
                        </p>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: "hsl(var(--chart-1))" }}
                          />
                          <p className="text-sm text-foreground">
                            <span className="font-semibold">{payload[0].value}</span>{" "}
                            {Number(payload[0].value) === 1 ? "application" : "applications"}
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                fill="url(#colorApplications)"
                dot={{ fill: "hsl(var(--chart-1))", r: 4, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "hsl(var(--background))" }}
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        {/* Compliance Snapshot */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Compliance Snapshot</h2>
          <p className="text-sm text-muted-foreground mb-6">Current compliance status overview</p>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Overall Compliance Completion</span>
              <span className="text-2xl font-bold text-foreground">{complianceData.overallCompliance}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 mb-2">
              <div
                className="bg-primary h-2.5 rounded-full transition-all"
                style={{ width: `${complianceData.overallCompliance}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              Compared to last month: +4%
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Most Common Missing Items</h3>
            <div className="space-y-3">
              {complianceData.missingItems.length > 0 ? (
                complianceData.missingItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.percentage}% of workers missing ({item.missing})
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No missing compliance items</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Compliance by Occupation</h3>
            <p className="text-xs text-muted-foreground mb-4">Highest Compliance</p>
            <div className="space-y-3">
              {complianceByOccupation.length > 0 ? (
                complianceByOccupation.map((item) => (
                  <div key={item.occupation} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.occupation}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground w-12 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No compliance data available</p>
              )}
            </div>
          </div>
        </Card>

        {/* Workforce Summary */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Workforce Summary</h2>
          <p className="text-sm text-muted-foreground mb-6">Key workforce metrics and performance</p>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Active Candidates</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{workforceSummary.activeCandidates}</p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Vendor-Supplied</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{workforceSummary.vendorSupplied}</p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{workforceSummary.avgResponseTime} days</p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Fill Rate</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{workforceSummary.fillRate}%</p>
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}

function getOccupationDisplayName(code: string): string {
  const occupationMap: Record<string, string> = {
    RN: "Registered Nurse",
    LPN: "LPN",
    CNA: "CNA",
    PT: "Physical Therapist",
    OT: "Occupational Therapist",
    RT: "Respiratory Therapist",
    ST: "Speech Therapist",
    MT: "Medical Technologist",
    FNP: "Family Nurse Practitioner",
    DON: "Director of Nursing",
    DDS: "General Dentist",
  }
  return occupationMap[code] || code
}

