"use client"

import { useMemo, useState } from "react"
import { Card, Header, Modal, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const statusTabs = ["All", "Submitted", "Qualified", "Interview", "Offer", "Accepted", "Rejected"]

export default function ApplicationsListPage() {
  const { organization, actions } = useDemoData()
  const [activeTab, setActiveTab] = useState("All")
  const [targetId, setTargetId] = useState<string | null>(null)
  const [interviewModal, setInterviewModal] = useState<{ open: boolean; id?: string }>({ open: false })
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id?: string }>({ open: false })
  const [interviewDate, setInterviewDate] = useState("")

  const filteredApplications = useMemo(() => {
    if (activeTab === "All") return organization.applications
    return organization.applications.filter((app) => app.status === activeTab)
  }, [organization.applications, activeTab])

  const updateStatus = (id: string, status: string) => {
    actions.updateApplicationStatus(id, status as typeof organization.applications[number]["status"])
  }

  const openInterviewModal = (id: string) => {
    setInterviewModal({ open: true, id })
    setTargetId(id)
  }

  const scheduleInterview = () => {
    if (!interviewModal.id) return
    updateStatus(interviewModal.id, "Interview")
    setInterviewModal({ open: false })
    setInterviewDate("")
  }

  const confirmReject = () => {
    if (!rejectModal.id) return
    actions.rejectApplication(rejectModal.id)
    setRejectModal({ open: false })
  }

  return (
    <div className="space-y-6">
      <Header
        title="Applications"
        subtitle="Client-facing pipeline across all requisitions."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Applications" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total" value={organization.applications.length} />
        <StatCard label="Qualified" value={organization.applications.filter((app) => app.status === "Qualified").length} />
        <StatCard label="Interview" value={organization.applications.filter((app) => app.status === "Interview").length} />
        <StatCard label="Offers" value={organization.applications.filter((app) => app.status === "Offer").length} />
      </div>

      <Card title="Pipeline" subtitle="Filter by stage and take action in-line.">
        <div className="flex flex-wrap gap-2 pb-4">
          {statusTabs.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={cn(
                "rounded-full px-4 py-1 text-sm font-semibold",
                activeTab === status ? "bg-[#2D3748] text-white" : "bg-[#F0F3F8] text-muted-foreground",
              )}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filteredApplications.map((app) => (
            <div key={app.id} className="flex flex-wrap items-center gap-4 rounded-[12px] border border-border px-4 py-3">
              <div className="flex min-w-[200px] flex-1 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2F7] text-sm font-semibold text-muted-foreground">
                  {initials(app.candidateName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{app.candidateName}</p>
                  <p className="text-xs text-muted-foreground">{app.jobTitle}</p>
                  <p className="text-xs text-muted-foreground">{app.submittedRelative ?? app.submittedAt}</p>
                </div>
              </div>
              <span className="rounded-full bg-[#F0F6FF] px-3 py-1 text-xs font-semibold text-[#3182CE]">{app.vendorName ?? "Vendor"}</span>
              <div className="w-32">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Match</span>
                  <span>{app.matchScore ?? 0}%</span>
                </div>
                <div className="ph5-progress h-[6px]">
                  <div className="ph5-progress-bar" style={{ width: `${app.matchScore ?? 0}%` }} />
                </div>
              </div>
              <StatusChip label={app.status} tone={statusTone(app.status)} />
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => updateStatus(app.id, "Qualified")}>
                  Qualify
                </Button>
                <Button variant="secondary" size="sm" onClick={() => openInterviewModal(app.id)}>
                  Interview
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setRejectModal({ open: true, id: app.id })}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
          {!filteredApplications.length ? <p className="text-sm text-muted-foreground">No applications in this stage.</p> : null}
        </div>
      </Card>

      <Modal open={interviewModal.open} onClose={() => setInterviewModal({ open: false })} title="Schedule interview">
        <Input placeholder="Preferred date" value={interviewDate} onChange={(event) => setInterviewDate(event.target.value)} />
        <Button className="mt-4 w-full" onClick={scheduleInterview} disabled={!interviewDate.trim()}>
          Send invite
        </Button>
      </Modal>

      <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false })} title="Reject candidate">
        <p className="text-sm text-muted-foreground">This action will notify the vendor and candidate.</p>
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setRejectModal({ open: false })}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={confirmReject}>
            Reject
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </Card>
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
}

function statusTone(status: string) {
  if (status === "Accepted" || status === "Offer") return "success"
  if (status === "Rejected") return "danger"
  return "warning"
}
