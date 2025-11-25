"use client"

import { useMemo, useState } from "react"
import { Filter, MapPin, UserCheck } from "lucide-react"
import { Header, Card, StatusChip, FloatingActionButton, SkeletonLoader } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/system"

const tabs = [
  { label: "Active", value: "Active" },
  { label: "Upcoming", value: "Upcoming" },
  { label: "Ending soon", value: "Ending Soon" },
]

export default function AssignmentsPage() {
  const { organization } = useDemoData()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("Active")
  const [filters, setFilters] = useState({ role: "all", location: "all", vendor: "all" })
  const [loading, setLoading] = useState(false)

  const assignments = organization.assignments
  const filterOptions = useMemo(
    () => ({
      role: ["all", ...new Set(assignments.map((assignment) => assignment.role))],
      location: ["all", ...new Set(assignments.map((assignment) => assignment.location))],
      vendor: ["all", ...new Set(assignments.map((assignment) => assignment.vendor))],
    }),
    [assignments],
  )

  const filtered = useMemo(() => {
    return assignments.filter((assignment) => {
      if (assignment.status !== activeTab) return false
      if (filters.role !== "all" && assignment.role !== filters.role) return false
      if (filters.location !== "all" && assignment.location !== filters.location) return false
      if (filters.vendor !== "all" && assignment.vendor !== filters.vendor) return false
      return true
    })
  }, [assignments, activeTab, filters])

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setLoading(true)
    window.setTimeout(() => setLoading(false), 350)
  }

  return (
    <div className="space-y-6">
      <Header
        title="Assignments"
        subtitle="Track active, upcoming, and expiring placements."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Assignments" },
        ]}
      />

      <section className="space-y-4">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="text-xs font-semibold uppercase text-muted-foreground">Filters</span>
            <Select value={filters.role} onValueChange={(value) => handleFilterChange("role", value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.role.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "all" ? "All roles" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.location.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "all" ? "All locations" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.vendor} onValueChange={(value) => handleFilterChange("vendor", value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Vendor" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.vendor.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "all" ? "All vendors" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card bleed>
          <div className="flex flex-wrap gap-2 border-b border-border px-5 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  activeTab === tab.value ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
                onClick={() => setActiveTab(tab.value)}
                aria-pressed={activeTab === tab.value}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {loading ? (
            <SkeletonLoader lines={6} />
          ) : (
            <div className="overflow-x-auto px-5">
              <table className="ph5-table min-w-[720px]" aria-label="Assignments">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Role</th>
                    <th>Location</th>
                    <th>Vendor</th>
                    <th>Dates</th>
                    <th>Match</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((assignment) => (
                    <tr key={assignment.id} className="align-middle">
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground" aria-hidden>
                            {initials(assignment.workerName)}
                          </span>
                          <div>
                            <p className="font-semibold text-foreground">{assignment.workerName}</p>
                            <p className="text-xs text-muted-foreground">{assignment.status}</p>
                          </div>
                        </div>
                      </td>
                      <td>{assignment.role}</td>
                      <td className="text-sm text-muted-foreground">
                        <MapPin className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                        {assignment.location}
                      </td>
                      <td>{assignment.vendor}</td>
                      <td className="text-sm text-muted-foreground">
                        {assignment.startDate} → {assignment.endDate}
                      </td>
                      <td>
                        <div className="w-32 text-sm">
                          <div className="ph5-progress h-2">
                            <div className="ph5-progress-bar" style={{ width: `${assignment.matchScore}%` }} />
                          </div>
                          <p className="text-xs text-muted-foreground">{assignment.matchScore}% aligned</p>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <StatusChip label={assignment.complianceStatus} tone={getComplianceTone(assignment.complianceStatus)} />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => toast({ title: "Assignment opened", description: `${assignment.workerName} • ${assignment.role}` })}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        No assignments for this view.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      <FloatingActionButton
        icon={<UserCheck className="h-4 w-4" aria-hidden />}
        label="Create assignment"
        onClick={() => toast({ title: "Assignment wizard coming soon" })}
      />
    </div>
  )
}

function getComplianceTone(status: string): "success" | "warning" | "danger" {
  if (status === "Clear") return "success"
  if (status === "Expiring") return "warning"
  return "danger"
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
}

