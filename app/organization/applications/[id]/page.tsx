"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { notFound, useParams } from "next/navigation"
import { ArrowLeft, Calendar, Clock3, FileText, Mail, Paperclip, Phone, Shield, StickyNote, UserRound } from "lucide-react"
import Link from "next/link"
import { Header, Card, StatusChip, SkeletonLoader, Modal, FilePreviewModal } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useToast } from "@/components/system"

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>()
  const { organization, actions } = useDemoData()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<{ name: string; type: string; size?: string }>()
  const [scheduleForm, setScheduleForm] = useState({ date: "", time: "" })
  const [noteBody, setNoteBody] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const id = params?.id
    if (!id) return
    const timer = setTimeout(() => setLoading(false), 350)
    return () => clearTimeout(timer)
  }, [params?.id])

  const application = useMemo(() => organization.applications.find((app) => app.id === params?.id), [organization.applications, params?.id])
  if (!application) {
    return notFound()
  }

  const insight = organization.insights.find((entry) => entry.applicationId === application.id)
  const candidate = organization.candidates.find((cand) => cand.id === application.candidateId)
  const job = organization.jobs.find((posting) => posting.id === application.jobId)

  const documents = candidate?.documents ?? []
  const compliance = insight?.compliance ?? []
  const timeline = insight?.timeline ?? []
  const notes = insight?.notes ?? []
  const attachments = insight?.attachments ?? []

  const statusTone = getTone(application.status)

  const handleQualify = () => {
    actions.updateApplicationStatus(application.id, "Qualified")
    toast({ title: "Candidate qualified", description: `${candidate?.name ?? "Candidate"} moved to Qualified.` })
  }

  const handleReject = () => {
    actions.rejectApplication(application.id)
    toast({ title: "Candidate rejected", description: "Vendor + candidate will be notified automatically." })
  }

  const handleSchedule = () => {
    if (!scheduleForm.date || !scheduleForm.time) {
      setFormError("Add both a date and time to send the invite.")
      return
    }
    setFormError(null)
    actions.updateApplicationStatus(application.id, "Interview")
    closeSchedule()
    toast({ title: "Interview invite queued", description: `${scheduleForm.date} at ${scheduleForm.time}` })
    setScheduleForm({ date: "", time: "" })
  }

  const handleAddNote = () => {
    if (!noteBody.trim()) {
      setFormError("Notes cannot be empty.")
      return
    }
    setFormError(null)
    closeNote()
    toast({ title: "Note saved", description: "Shared with hiring panel." })
    setNoteBody("")
  }

  const closeSchedule = () => {
    setScheduleOpen(false)
    setFormError(null)
  }

  const closeNote = () => {
    setNoteOpen(false)
    setFormError(null)
  }

  const renderContent = () => (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
      <div className="space-y-6">
        <Card
          title="Candidate profile"
          subtitle="Contact, specialties, and match context."
          actions={
            <div className="flex items-center gap-2">
              <StatusChip label={application.status} tone={statusTone} aria-label={`Application status is ${application.status}`} />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary" size="sm">
                    View slide-in profile
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-xl overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Candidate profile</SheetTitle>
                  </SheetHeader>
                  <CandidatePanel candidate={candidate} application={application} />
                </SheetContent>
              </Sheet>
            </div>
          }
        >
          <CandidateSummary candidate={candidate} application={application} job={job} />
        </Card>

        <Card title="Submitted documents" subtitle="Tap any row to preview.">
          <div className="divide-y divide-border rounded-xl border border-border">
            {documents.map((doc) => (
              <button
                key={doc.id}
                type="button"
                className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setPreviewDoc({ name: doc.name, type: doc.type, size: "1.2MB" })}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground" aria-hidden>
                    <FileText className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">Updated {doc.lastUpdated}</p>
                  </div>
                </div>
                <StatusChip label={doc.status} tone={getDocumentTone(doc.status)} />
              </button>
            ))}
            {!documents.length && <p className="p-4 text-sm text-muted-foreground">No documents uploaded yet.</p>}
          </div>
        </Card>

        <Card title="Compliance checklist" subtitle="Auto-mapped from template requirements.">
          <div className="space-y-3">
            {compliance.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.requirement}</p>
                  <p className="text-xs text-muted-foreground">Due {item.dueDate}</p>
                </div>
                <StatusChip label={item.status} tone={getDocumentTone(item.status)} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Timeline" subtitle="Touchpoints and system events." bleed>
          <ol className="relative border-l border-border pl-6">
            {timeline.map((event) => (
              <li key={event.id} className="mb-6 animate-in fade-in-50">
                <span className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-white bg-primary shadow" aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{formatTimestamp(event.timestamp)}</p>
                <p className="text-sm font-semibold text-foreground">{event.summary}</p>
                <p className="text-xs text-muted-foreground">
                  {event.actor} • {event.channel === "note" ? "Internal note" : event.channel === "email" ? "Email" : "System"}
                </p>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Notes & attachments" subtitle="Shared with recruiter + hiring teams.">
          <div className="space-y-4">
            {notes.map((note) => (
              <article key={note.id} className="rounded-xl border border-border bg-card/40 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <StickyNote className="h-4 w-4" aria-hidden />
                    {note.author}
                  </div>
                  <span>{formatTimestamp(note.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-foreground">{note.body}</p>
              </article>
            ))}
            {!notes.length && <p className="text-sm text-muted-foreground">No notes logged yet.</p>}
            <Button variant="secondary" onClick={() => setNoteOpen(true)}>
              Add note
            </Button>
            <div className="rounded-xl border border-dashed border-border p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Attachments</p>
              <ul className="mt-2 space-y-2">
                {attachments.map((attachment) => (
                  <li key={attachment.id} className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Paperclip aria-hidden className="h-4 w-4" />
                      {attachment.fileName}
                    </span>
                    <StatusChip label={attachment.status} tone={attachment.status === "Available" ? "success" : "warning"} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <aside className="space-y-4">
        <Card title="Job summary">
          <div className="space-y-3 text-sm text-muted-foreground">
            <InfoRow icon={<UserRound className="h-4 w-4" aria-hidden />} label="Role" value={job?.title ?? "Unknown role"} />
            <InfoRow icon={<Shield className="h-4 w-4" aria-hidden />} label="Vendor" value={application.vendorName ?? "Internal Talent"} />
            <InfoRow icon={<Calendar className="h-4 w-4" aria-hidden />} label="Submitted" value={application.submittedRelative ?? application.submittedAt} />
            <InfoRow icon={<Clock3 className="h-4 w-4" aria-hidden />} label="Match score" value={`${application.matchScore ?? 0}%`} />
          </div>
        </Card>

        <Card title="Action center">
          <div className="space-y-3">
            <Button className="w-full" onClick={handleQualify} aria-label="Qualify candidate">
              Qualify
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setFormError(null)
                setScheduleOpen(true)
              }}
            >
              Schedule interview
            </Button>
            <Button variant="destructive" className="w-full" onClick={handleReject}>
              Reject
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setFormError(null)
                setNoteOpen(true)
              }}
            >
              Add note
            </Button>
          </div>
        </Card>

        <Card title="Contact">
          <div className="space-y-3 text-sm text-muted-foreground">
            <InfoRow icon={<Mail className="h-4 w-4" aria-hidden />} label="Email" value={candidate?.email ?? "N/A"} />
            <InfoRow icon={<Phone className="h-4 w-4" aria-hidden />} label="Phone" value={candidate?.phone ?? "N/A"} />
          </div>
        </Card>

        <Link href="/organization/applications" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to pipeline
        </Link>
      </aside>
    </section>
  )

  return (
    <div className="space-y-6">
      <Header
        title={candidate?.name ?? "Application"}
        subtitle={`${job?.title ?? "Role"} • ${job?.location ?? ""}`}
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Applications", href: "/organization/applications" },
          { label: candidate?.name ?? "Details" },
        ]}
        actions={[
          {
            id: "export",
            label: "Export packet",
            variant: "secondary",
            onClick: () => toast({ title: "Export ready", description: "We generated a sharable PDF for this candidate." }),
          },
        ]}
      />
      {loading ? <SkeletonLoader lines={14} /> : renderContent()}

      <Modal open={scheduleOpen} onClose={closeSchedule} title="Schedule interview" description="Send a calendar invite + SMS confirmation.">
        <div className="space-y-3">
          <Input
            aria-label="Interview date"
            type="date"
            value={scheduleForm.date}
            onChange={(event) => setScheduleForm((prev) => ({ ...prev, date: event.target.value }))}
          />
          <Input
            aria-label="Interview time"
            type="time"
            value={scheduleForm.time}
            onChange={(event) => setScheduleForm((prev) => ({ ...prev, time: event.target.value }))}
          />
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <Button className="w-full" onClick={handleSchedule}>
            Send invite
          </Button>
        </div>
      </Modal>

      <Modal open={noteOpen} onClose={closeNote} title="Add internal note">
        <Textarea
          aria-label="Internal note"
          placeholder="Share context with the recruiter or panel..."
          value={noteBody}
          onChange={(event) => setNoteBody(event.target.value)}
        />
        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <Button className="mt-4 w-full" onClick={handleAddNote}>
          Save note
        </Button>
      </Modal>

      <FilePreviewModal
        open={!!previewDoc}
        fileName={previewDoc?.name ?? ""}
        fileType={previewDoc?.type ?? ""}
        fileSize={previewDoc?.size}
        onClose={() => setPreviewDoc(undefined)}
      />
    </div>
  )
}

function CandidateSummary({
  candidate,
  application,
  job,
}: {
  candidate?: {
    name: string
    role: string
    location: string
    email: string
    phone: string
    experienceYears: number
    shiftPreference: string
    specialties: string[]
    skills: string[]
    summary: string
    vendorPartner?: string
  }
  application: { matchScore?: number }
  job?: { department?: string; shift?: string }
}) {
  if (!candidate) return <p className="text-sm text-muted-foreground">Candidate profile unavailable.</p>
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground" aria-hidden>
            {initials(candidate.name)}
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">{candidate.name}</p>
            <p className="text-sm text-muted-foreground">{candidate.role}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{candidate.summary}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <InfoField label="Experience" value={`${candidate.experienceYears} yrs`} />
          <InfoField label="Preferred shift" value={candidate.shiftPreference} />
          <InfoField label="Department fit" value={job?.department ?? "—"} />
          <InfoField label="Match score" value={`${application.matchScore ?? 0}%`} />
        </dl>
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Highlights</p>
        <div className="flex flex-wrap gap-2">
          {candidate.specialties.slice(0, 3).map((specialty) => (
            <span key={specialty} className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
              {specialty}
            </span>
          ))}
          {candidate.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function CandidatePanel({
  candidate,
  application,
}: {
  candidate?: {
    name: string
    email: string
    phone: string
    summary: string
    specialties: string[]
    skills: string[]
    documents: { id: string; name: string; status: string }[]
  }
  application: { matchScore?: number; submittedRelative?: string }
}) {
  if (!candidate) return <p className="text-sm text-muted-foreground">No candidate data.</p>
  return (
    <div className="mt-4 space-y-5">
      <div>
        <p className="text-lg font-semibold">{candidate.name}</p>
        <p className="text-sm text-muted-foreground">{candidate.summary}</p>
      </div>
      <div className="rounded-xl border border-border p-4 text-sm">
        <p className="font-semibold text-foreground">Contact</p>
        <p className="text-muted-foreground">{candidate.email}</p>
        <p className="text-muted-foreground">{candidate.phone}</p>
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="text-sm font-semibold text-foreground">Skills</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {candidate.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Documents</p>
        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
          {candidate.documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between">
              <span>{doc.name}</span>
              <StatusChip label={doc.status} tone={getDocumentTone(doc.status)} />
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-border p-4 text-sm">
        <p className="font-semibold text-foreground">Match insights</p>
        <p className="text-muted-foreground">Score {application.matchScore ?? 0}% • Submitted {application.submittedRelative}</p>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
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

function getTone(status: string): "success" | "warning" | "info" | "danger" | "neutral" {
  if (["Offer", "Accepted", "Qualified"].includes(status)) return "success"
  if (["Interview", "Submitted"].includes(status)) return "info"
  if (status === "Rejected") return "danger"
  return "warning"
}

function getDocumentTone(status: string): "success" | "warning" | "danger" | "info" {
  if (status === "Completed") return "success"
  if (status === "Pending") return "warning"
  return "danger"
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-US", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}
