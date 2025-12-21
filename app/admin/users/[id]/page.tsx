"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/system"
import {
  getPortalUserById,
  updatePortalUser,
  getPortalUserAffiliations,
  getPortalUserNotes,
  addPortalUserNote,
  deletePortalUserNote,
  type PortalUser,
  type PortalUserNote,
} from "@/lib/admin-local-db"

const NOTE_TYPES: PortalUserNote["noteType"][] = ["General", "Meeting", "System"]

export default function PortalUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { pushToast } = useToast()
  const [user, setUser] = useState<PortalUser | null>(null)
  const [affiliations, setAffiliations] = useState(getPortalUserAffiliations(params.id as string))
  const [notes, setNotes] = useState<PortalUserNote[]>([])
  const [loading, setLoading] = useState(true)
  const [noteFilters, setNoteFilters] = useState({
    noteType: "",
    startDate: "",
    endDate: "",
    search: "",
  })
  const [newNote, setNewNote] = useState({
    noteType: "General" as PortalUserNote["noteType"],
    date: new Date().toISOString().slice(0, 10),
    noteMessage: "",
  })

  useEffect(() => {
    const id = params.id as string
    const data = getPortalUserById(id)
    if (!data) {
      setUser(null)
      setLoading(false)
      return
    }
    setUser(data)
    setAffiliations(getPortalUserAffiliations(id))
    setNotes(getPortalUserNotes(id))
    setLoading(false)
  }, [params.id])

  const handleToggleStatus = () => {
    if (!user) return
    const updated = updatePortalUser(user.id, { status: user.status === "Active" ? "Inactive" : "Active" })
    if (updated) {
      setUser(updated)
      pushToast({ title: "Status updated", description: `User is now ${updated.status}.` })
    }
  }

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (noteFilters.noteType && n.noteType !== noteFilters.noteType) return false
      if (noteFilters.startDate && n.date < noteFilters.startDate) return false
      if (noteFilters.endDate && n.date > noteFilters.endDate) return false
      if (noteFilters.search && !n.noteMessage.toLowerCase().includes(noteFilters.search.toLowerCase())) return false
      return true
    })
  }, [notes, noteFilters])

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!newNote.noteMessage.trim()) {
      pushToast({ title: "Validation", description: "Note message cannot be empty." })
      return
    }
    const created = addPortalUserNote({
      userId: user.id,
      noteType: newNote.noteType,
      date: newNote.date,
      noteMessage: newNote.noteMessage.trim(),
    })
    setNotes((prev) => [created, ...prev])
    setNewNote({
      noteType: "General",
      date: new Date().toISOString().slice(0, 10),
      noteMessage: "",
    })
    pushToast({ title: "Note added", description: "A new note has been added." })
  }

  const handleDeleteNote = (id: string) => {
    if (!confirm("Delete this note?")) return
    const ok = deletePortalUserNote(id)
    if (ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id))
      pushToast({ title: "Deleted", description: "Note removed." })
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Header
          title="User Not Found"
          subtitle=""
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Users", href: "/admin/users" },
            { label: "Not Found" },
          ]}
        />
        <div className="p-6">
          <p className="text-muted-foreground">The requested user does not exist.</p>
          <Link href="/admin/users" className="ph5-button-secondary mt-4 inline-block">
            Back to Users
          </Link>
        </div>
      </>
    )
  }

  const isOrgUser = user.userType === "Organization"

  return (
    <>
      <Header
        title={`User Details (${isOrgUser ? "For Organization Users" : "For Program and Vendor ONLY"})`}
        subtitle=""
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Users", href: "/admin/users" },
          { label: `${user.firstName} ${user.lastName}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Status</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={user.status === "Active"}
                onChange={handleToggleStatus}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:bg-primary transition-all"></div>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-5"></span>
            </label>
            <span className={`text-sm font-semibold ${user.status === "Active" ? "text-success" : "text-destructive"}`}>
              {user.status}
            </span>
          </div>
        }
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-6 p-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">User Details</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <DetailRow label="First Name" value={user.firstName} />
              <DetailRow label="Last Name" value={user.lastName} />
              <DetailRow label="Mobile Phone" value={user.mobilePhone || "—"} />
              <DetailRow label="Office Phone" value={user.officePhone || "—"} />
              <DetailRow label="Email" value={user.email} />
              {!isOrgUser && <DetailRow label="Title" value={user.title} />}
              <DetailRow label="Role" value={user.role || "—"} />
              <DetailRow label="User ID Number" value={user.userIdNumber || "—"} />
              <DetailRow label="Create Date" value={user.createDate || "—"} />
              <DetailRow label="Last Login" value={user.lastLogin || "—"} />
            </div>
          </div>
        </Card>

        {!isOrgUser && (
          <Card>
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">User Affiliations</h3>
              </div>
              {affiliations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No affiliations.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-3 px-4">Organization Name</th>
                        <th className="text-left py-3 px-4">Role at Organization</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Activation Date</th>
                        <th className="text-left py-3 px-4">Inactivation Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {affiliations.map((a) => (
                        <tr key={a.id} className="border-b border-border">
                          <td className="py-3 px-4">{a.organizationName}</td>
                          <td className="py-3 px-4">{a.roleAtOrganization}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                a.status === "Added" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{a.activationDate || "—"}</td>
                          <td className="py-3 px-4">{a.inactivationDate || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        )}

        <Card>
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">User Notes</h3>
              <Link href="/admin/users" className="text-sm text-primary hover:underline">
                Back to Users
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <select
                value={noteFilters.noteType}
                onChange={(e) => setNoteFilters((prev) => ({ ...prev, noteType: e.target.value }))}
                className="rounded-lg border border-border bg-input px-3 py-2 text-sm"
              >
                <option value="">Note Type</option>
                {NOTE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <Input
                type="date"
                value={noteFilters.startDate}
                onChange={(e) => setNoteFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                placeholder="Start Date"
              />
              <Input
                type="date"
                value={noteFilters.endDate}
                onChange={(e) => setNoteFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                placeholder="End Date"
              />
              <Input
                placeholder="Search notes..."
                value={noteFilters.search}
                onChange={(e) => setNoteFilters((prev) => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <div className="border border-border rounded-lg p-4">
              {filteredNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes.</p>
              ) : (
                <div className="space-y-3">
                  {filteredNotes.map((note) => (
                    <div key={note.id} className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-3 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{note.noteType}</p>
                        <p className="text-xs text-muted-foreground">{note.date}</p>
                        <p className="text-sm text-foreground">{note.noteMessage}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <button
                          className="text-xs text-destructive hover:underline"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <h4 className="text-sm font-semibold text-foreground mb-2">Add Note</h4>
              <form onSubmit={handleAddNote} className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    value={newNote.noteType}
                    onChange={(e) => setNewNote((prev) => ({ ...prev, noteType: e.target.value as PortalUserNote["noteType"] }))}
                    className="rounded-lg border border-border bg-input px-3 py-2 text-sm"
                  >
                    {NOTE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="date"
                    value={newNote.date}
                    onChange={(e) => setNewNote((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <textarea
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                  value={newNote.noteMessage}
                  onChange={(e) => setNewNote((prev) => ({ ...prev, noteMessage: e.target.value }))}
                  placeholder="Note message..."
                  required
                />
                <div className="flex items-center justify-end gap-3">
                  <button type="submit" className="ph5-button-primary text-sm">
                    Add Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}


