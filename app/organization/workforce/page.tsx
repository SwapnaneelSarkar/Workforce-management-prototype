"use client"

import { useMemo, useState } from "react"
import { Search, ShieldCheck } from "lucide-react"
import { Header, Card, StatusChip, Modal, SkeletonLoader } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function WorkforcePage() {
  const { organization } = useDemoData()
  const [query, setQuery] = useState("")
  const [selectedWorker, setSelectedWorker] = useState<(typeof organization.workforce)[number]>()
  const [loading, setLoading] = useState(false)

  const filteredWorkers = useMemo(() => {
    const normalized = query.toLowerCase()
    return organization.workforce.filter((worker) => worker.name.toLowerCase().includes(normalized) || worker.role.toLowerCase().includes(normalized))
  }, [organization.workforce, query])

  const handleSearch = (value: string) => {
    setQuery(value)
    setLoading(true)
    window.setTimeout(() => setLoading(false), 250)
  }

  return (
    <div className="space-y-6">
      <Header
        title="Workforce"
        subtitle="Credentialing, assignment readiness, and quick actions."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Workforce" },
        ]}
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Active" value={organization.workforce.filter((worker) => worker.status === "Active").length} />
        <SummaryCard label="Credentialing" value={organization.workforce.filter((worker) => worker.status === "Credentialing").length} />
        <SummaryCard label="Break" value={organization.workforce.filter((worker) => worker.status === "Break").length} />
        <SummaryCard label="Vendors" value={new Set(organization.workforce.map((worker) => worker.vendor)).size} />
      </section>

      <Card title="Roster" subtitle="Search across vendors and assignments.">
        <div className="flex flex-wrap items-center gap-3 pb-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
            <Input
              placeholder="Search by name or role"
              value={query}
              onChange={(event) => handleSearch(event.target.value)}
              className="border-none p-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <Button variant="secondary" size="sm">
            Export roster
          </Button>
        </div>

        {loading ? (
          <SkeletonLoader lines={8} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredWorkers.map((worker) => (
              <article key={worker.id} className="rounded-2xl border border-border p-4 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground" aria-hidden>
                      {initials(worker.name)}
                    </span>
                    <div>
                      <p className="text-base font-semibold text-foreground">{worker.name}</p>
                      <p className="text-sm text-muted-foreground">{worker.role}</p>
                    </div>
                  </div>
                  <StatusChip label={worker.status} tone={getStatusTone(worker.status)} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <Info label="Vendor" value={worker.vendor} />
                  <Info label="Location" value={worker.location} />
                  <Info label="Assignment" value={worker.currentAssignment} />
                  <Info label="Docs" value={`${worker.documents.length} on file`} />
                </dl>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    Compliance {completedDocsPct(worker)}%
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedWorker(worker)}>
                    Assignment history
                  </Button>
                </div>
              </article>
            ))}
            {!filteredWorkers.length && <p className="col-span-full text-sm text-muted-foreground">No workers match this search.</p>}
          </div>
        )}
      </Card>

      <Modal open={!!selectedWorker} onClose={() => setSelectedWorker(undefined)} title={selectedWorker?.name ?? "Assignments"}>
        <div className="space-y-3 text-sm">
          {selectedWorker?.history.map((history) => (
            <div key={history.id} className="rounded-xl border border-border p-3">
              <p className="font-semibold text-foreground">{history.role}</p>
              <p className="text-xs text-muted-foreground">{history.location}</p>
              <p className="text-xs text-muted-foreground">
                {history.startDate} → {history.endDate}
              </p>
              <StatusChip label={history.status} tone={history.status === "Completed" ? "success" : "warning"} className="mt-2" />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </Card>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
}

function completedDocsPct(worker: { documents: { status: string }[] }) {
  if (!worker.documents.length) return 0
  const completed = worker.documents.filter((doc) => doc.status === "Completed").length
  return Math.round((completed / worker.documents.length) * 100)
}

function getStatusTone(status: string): "success" | "warning" | "info" {
  if (status === "Active") return "success"
  if (status === "Credentialing") return "warning"
  return "info"
}

