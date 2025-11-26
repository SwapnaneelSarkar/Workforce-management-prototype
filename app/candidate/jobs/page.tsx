"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Filter, Search, MapPin, List, Grid } from "lucide-react"
import { Card, Header, SkeletonLoader, StatusChip, Map } from "@/components/system"
import { FloatingActionButton } from "@/components/system/fab"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { cn } from "@/lib/utils"

type ViewMode = "list" | "map" | "grid"

export default function JobListingPage() {
  const { organization } = useDemoData()
  const [query, setQuery] = useState("")
  const [department, setDepartment] = useState("All")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 360)
    return () => clearTimeout(timer)
  }, [])

  const departments = useMemo(() => ["All", ...new Set(organization.jobs.map((job) => job.department))], [organization.jobs])

  const filteredJobs = useMemo(() => {
    const normalized = query.toLowerCase()
    return organization.jobs.filter((job) => {
      const matchesQuery =
        job.title.toLowerCase().includes(normalized) ||
        job.location.toLowerCase().includes(normalized) ||
        job.tags.some((tag) => tag.toLowerCase().includes(normalized))
      const matchesDept = department === "All" || job.department === department
      return matchesQuery && matchesDept
    })
  }, [organization.jobs, query, department])

  return (
    <div className="space-y-6">
      <Header
        title="Job Marketplace"
        subtitle="Discover tailored roles and compare bill rates side-by-side."
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Jobs" },
        ]}
      />

      <Card className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by role, facility, or keyword"
            className="ph5-input rounded-[999px] border-none bg-[#F7F7F9] pl-10"
            aria-label="Search jobs"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" aria-hidden />
          <span>{filteredJobs.length} openings</span>
        </div>
        <select
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          className="ph5-input w-full max-w-[220px] rounded-[999px] bg-[#F7F7F9]"
          aria-label="Filter by department"
        >
          {departments.map((dept) => (
            <option key={dept}>{dept}</option>
          ))}
        </select>
        {/* View mode toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "list" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="List view"
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "grid" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Grid view"
            title="Grid view"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "map" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Map view"
            title="Map view"
          >
            <MapPin className="h-4 w-4" />
          </button>
        </div>
      </Card>

      {loading ? (
        <SkeletonLoader lines={8} />
      ) : viewMode === "map" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden">
              <Map 
                location={filteredJobs.length > 0 ? filteredJobs[0].location : "No locations"} 
                address={filteredJobs.length > 0 ? filteredJobs[0].location : undefined}
                height="h-[600px]"
                interactive
              />
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className="p-0 h-full flex flex-col">
              <div className="p-4 border-b border-border bg-muted/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Job Locations</h3>
                  <span className="text-xs font-semibold text-muted-foreground bg-background px-2 py-1 rounded-full">
                    {filteredJobs.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Click to view details</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">No jobs match your filters</p>
                  </div>
                ) : (
                  filteredJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/candidate/jobs/${job.id}`}
                      className="block rounded-lg border border-border bg-card p-4 hover:border-[#3182CE] hover:shadow-md transition-all group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-[#3182CE] flex-shrink-0 group-hover:scale-110 transition-transform" />
                              <p className="text-sm font-semibold text-foreground truncate group-hover:text-[#3182CE] transition-colors">
                                {job.title}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">{job.location}</p>
                            <p className="text-xs text-muted-foreground ml-6">{job.department}</p>
                          </div>
                          <StatusChip 
                            label={job.status === "Open" ? "Accepting" : job.status} 
                            tone={job.status === "Open" ? "success" : "warning"} 
                          />
                        </div>
                        <div className="flex items-center gap-3 ml-6 pt-2 border-t border-border">
                          <span className="text-xs text-muted-foreground">{job.shift}</span>
                          <span className="text-xs font-semibold text-[#3182CE]">{job.billRate}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <article
              key={job.id}
              className="rounded-[12px] border border-border bg-card p-5 shadow-[0_1px_4px_rgba(16,24,40,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,23,42,0.12)] flex flex-col"
            >
              <div className="space-y-3 flex-1">
                <div className="ph5-label">{job.department}</div>
                <Link href={`/candidate/jobs/${job.id}`} className="text-lg font-semibold text-foreground hover:text-[#3182CE] block">
                  {job.title}
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-[#EDF2F7] px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <InfoTag label="Shift" value={job.shift} />
                  <InfoTag label="Hours" value={job.hours} />
                  <InfoTag label="Bill rate" value={job.billRate} highlight />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                <StatusChip label={job.status === "Open" ? "Accepting" : job.status} tone={job.status === "Open" ? "success" : "warning"} />
                <Link href={`/candidate/jobs/${job.id}`} className="ph5-button-primary text-sm">
                  View details
                </Link>
              </div>
            </article>
          ))}
          {!filteredJobs.length && (
            <div className="col-span-full">
              <Card title="No roles match your filters" subtitle="Adjust filters or check back soon." />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <article
              key={job.id}
              className="rounded-[12px] border border-border bg-card p-5 shadow-[0_1px_4px_rgba(16,24,40,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,23,42,0.12)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3 flex-1">
                  <div className="ph5-label">{job.department}</div>
                  <Link href={`/candidate/jobs/${job.id}`} className="text-lg font-semibold text-foreground hover:text-[#3182CE]">
                    {job.title}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[#EDF2F7] px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid min-w-[220px] gap-2 text-sm text-muted-foreground">
                  <InfoTag label="Shift" value={job.shift} />
                  <InfoTag label="Hours" value={job.hours} />
                  <InfoTag label="Bill rate" value={job.billRate} highlight />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <StatusChip label={job.status === "Open" ? "Accepting" : job.status} tone={job.status === "Open" ? "success" : "warning"} />
                <Link href={`/candidate/jobs/${job.id}`} className="ph5-button-primary">
                  View details
                </Link>
              </div>
            </article>
          ))}
          {!filteredJobs.length ? (
            <Card title="No roles match your filters" subtitle="Adjust filters or check back soon." />
          ) : null}
        </div>
      )}

      <FloatingActionButton
        icon={<Filter className="h-5 w-5" aria-hidden />}
        label="Reset filters"
        onClick={() => {
          setQuery("")
          setDepartment("All")
        }}
      />
    </div>
  )
}

function InfoTag({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between rounded-[8px] border border-border px-3 py-2", highlight && "border-[#3182CE]")}>
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold text-foreground", highlight && "text-[#3182CE]")}>{value}</span>
    </div>
  )
}
