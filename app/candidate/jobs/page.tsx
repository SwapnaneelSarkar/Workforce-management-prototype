"use client"

"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Filter, Search } from "lucide-react"
import { Card, Header, SkeletonLoader, StatusChip } from "@/components/system"
import { FloatingActionButton } from "@/components/system/fab"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { cn } from "@/lib/utils"

export default function JobListingPage() {
  const { organization } = useDemoData()
  const [query, setQuery] = useState("")
  const [department, setDepartment] = useState("All")
  const [loading, setLoading] = useState(true)

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
        subtitle="Discover tailored assignments and compare bill rates side-by-side."
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
      </Card>

      {loading ? (
        <SkeletonLoader lines={8} />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <article
              key={job.id}
              className="rounded-[12px] border border-border bg-card p-5 shadow-[0_1px_4px_rgba(16,24,40,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,23,42,0.12)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="ph5-label">{job.department}</div>
                  <Link href={`/candidate/jobs/${job.id}`} className="text-lg font-semibold text-foreground hover:text-[#3182CE]">
                    {job.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{job.location}</p>
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
