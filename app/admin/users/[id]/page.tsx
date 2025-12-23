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
  addPortalUserAffiliation,
  updatePortalUserAffiliation,
  deletePortalUserAffiliation,
  getAllOrganizations,
  type PortalUser,
  type PortalUserNote,
  type PortalUserAffiliation,
} from "@/lib/admin-local-db"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, X } from "lucide-react"

const NOTE_TYPES: PortalUserNote["noteType"][] = ["General", "Meeting", "System"]
const ORGANIZATION_ROLES = [
  "Administrator",
  "Contributor",
  "Viewer",
  "Hiring Manager",
  "Compliance Manager",
  "Billing Manager",
]

export default function PortalUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { pushToast } = useToast()
  const [user, setUser] = useState<PortalUser | null>(null)
  const [affiliations, setAffiliations] = useState<PortalUserAffiliation[]>([])
  const [notes, setNotes] = useState<PortalUserNote[]>([])
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([])
  const [isAddAffiliationOpen, setIsAddAffiliationOpen] = useState(false)
  const [editingAffiliation, setEditingAffiliation] = useState<PortalUserAffiliation | null>(null)
  const [affiliationForm, setAffiliationForm] = useState({
    organizationName: "",
    roleAtOrganization: "",
    status: "Added" as "Added" | "Removed",
    activationDate: new Date().toISOString().slice(0, 10),
    inactivationDate: "",
  })
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
    const orgs = getAllOrganizations()
    setOrganizations(orgs.map((org) => ({ id: org.id, name: org.name })))
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

  const handleAddAffiliation = () => {
    if (!user) return
    setEditingAffiliation(null)
    setAffiliationForm({
      organizationName: "",
      roleAtOrganization: "",
      status: "Added",
      activationDate: new Date().toISOString().slice(0, 10),
      inactivationDate: "",
    })
    setIsAddAffiliationOpen(true)
  }

  const handleEditAffiliation = (affiliation: PortalUserAffiliation) => {
    setEditingAffiliation(affiliation)
    setAffiliationForm({
      organizationName: affiliation.organizationName,
      roleAtOrganization: affiliation.roleAtOrganization,
      status: affiliation.status,
      activationDate: affiliation.activationDate || new Date().toISOString().slice(0, 10),
      inactivationDate: affiliation.inactivationDate || "",
    })
    setIsAddAffiliationOpen(true)
  }

  const handleSaveAffiliation = () => {
    if (!user) return
    if (!affiliationForm.organizationName || !affiliationForm.roleAtOrganization) {
      pushToast({ title: "Validation Error", description: "Please fill in all required fields." })
      return
    }

    try {
      if (editingAffiliation) {
        const updated = updatePortalUserAffiliation(editingAffiliation.id, {
          organizationName: affiliationForm.organizationName,
          roleAtOrganization: affiliationForm.roleAtOrganization,
          status: affiliationForm.status,
          activationDate: affiliationForm.activationDate || undefined,
          inactivationDate: affiliationForm.inactivationDate || undefined,
        })
        if (updated) {
          pushToast({ title: "Success", description: "Affiliation updated successfully." })
          setAffiliations(getPortalUserAffiliations(user.id))
          setIsAddAffiliationOpen(false)
          setEditingAffiliation(null)
        } else {
          pushToast({ title: "Error", description: "Failed to update affiliation." })
        }
      } else {
        // Check if affiliation already exists
        const existing = affiliations.find(
          (a) => a.organizationName === affiliationForm.organizationName && a.status === "Added"
        )
        if (existing) {
          pushToast({ title: "Error", description: "User is already affiliated with this organization." })
          return
        }

        addPortalUserAffiliation({
          userId: user.id,
          organizationName: affiliationForm.organizationName,
          roleAtOrganization: affiliationForm.roleAtOrganization,
          status: affiliationForm.status,
          activationDate: affiliationForm.activationDate || undefined,
          inactivationDate: affiliationForm.inactivationDate || undefined,
        })
        pushToast({ title: "Success", description: "Affiliation added successfully." })
        setAffiliations(getPortalUserAffiliations(user.id))
        setIsAddAffiliationOpen(false)
      }
    } catch (error: any) {
      console.error("Error saving affiliation:", error)
      pushToast({ title: "Error", description: error.message || "Failed to save affiliation." })
    }
  }

  const handleDeleteAffiliation = (id: string) => {
    if (!confirm("Are you sure you want to remove this affiliation?")) return
    const success = deletePortalUserAffiliation(id)
    if (success) {
      if (user) {
        setAffiliations(getPortalUserAffiliations(user.id))
      }
      pushToast({ title: "Success", description: "Affiliation removed successfully." })
    } else {
      pushToast({ title: "Error", description: "Failed to remove affiliation." })
    }
  }

  const getAvailableOrganizations = () => {
    const associatedOrgNames = new Set(affiliations.filter((a) => a.status === "Added").map((a) => a.organizationName))
    return organizations.filter((org) => !associatedOrgNames.has(org.name))
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
        title="User Profile"
        subtitle={`${user.firstName} ${user.lastName} - ${user.userType} User`}
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

        <Card>
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Organizations & Roles</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All organizations this user belongs to and their role per organization
                </p>
              </div>
              <Button onClick={handleAddAffiliation} className="ph5-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Organization
              </Button>
            </div>
            {affiliations.length === 0 ? (
              <div className="py-8 text-center border border-border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">No organization affiliations found.</p>
                <p className="text-xs text-muted-foreground mt-1">Click "Add Organization" to enroll this user.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-3 px-4 font-semibold">Organization Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Role at Organization</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Activation Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Inactivation Date</th>
                      <th className="text-right py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliations.map((a) => (
                      <tr key={a.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium text-foreground">{a.organizationName}</td>
                        <td className="py-3 px-4 text-foreground">{a.roleAtOrganization}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              a.status === "Added" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground">{a.activationDate || "—"}</td>
                        <td className="py-3 px-4 text-foreground">{a.inactivationDate || "—"}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditAffiliation(a)}
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                              title="Edit affiliation"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAffiliation(a.id)}
                              className="inline-flex items-center gap-1 text-sm text-destructive hover:underline"
                              title="Remove affiliation"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Add/Edit Affiliation Modal */}
        {isAddAffiliationOpen && (
          <Card className="border-2 border-primary">
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold text-foreground">
                  {editingAffiliation ? "Edit Organization Affiliation" : "Add Organization Affiliation"}
                </h4>
                <button
                  onClick={() => {
                    setIsAddAffiliationOpen(false)
                    setEditingAffiliation(null)
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-select">Organization *</Label>
                  <Select
                    value={affiliationForm.organizationName}
                    onValueChange={(value) => setAffiliationForm({ ...affiliationForm, organizationName: value })}
                    disabled={!!editingAffiliation}
                  >
                    <SelectTrigger id="org-select" className="bg-background">
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {editingAffiliation ? (
                        <SelectItem value={affiliationForm.organizationName}>
                          {affiliationForm.organizationName}
                        </SelectItem>
                      ) : (
                        getAvailableOrganizations().map((org) => (
                          <SelectItem key={org.id} value={org.name}>
                            {org.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role-select">Role at Organization *</Label>
                  <Select
                    value={affiliationForm.roleAtOrganization}
                    onValueChange={(value) => setAffiliationForm({ ...affiliationForm, roleAtOrganization: value })}
                  >
                    <SelectTrigger id="role-select" className="bg-background">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANIZATION_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-select">Status *</Label>
                  <Select
                    value={affiliationForm.status}
                    onValueChange={(value) => setAffiliationForm({ ...affiliationForm, status: value as "Added" | "Removed" })}
                  >
                    <SelectTrigger id="status-select" className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Added">Added</SelectItem>
                      <SelectItem value="Removed">Removed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="activation-date">Activation Date</Label>
                    <Input
                      id="activation-date"
                      type="date"
                      value={affiliationForm.activationDate}
                      onChange={(e) => setAffiliationForm({ ...affiliationForm, activationDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inactivation-date">Inactivation Date</Label>
                    <Input
                      id="inactivation-date"
                      type="date"
                      value={affiliationForm.inactivationDate}
                      onChange={(e) => setAffiliationForm({ ...affiliationForm, inactivationDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => {
                  setIsAddAffiliationOpen(false)
                  setEditingAffiliation(null)
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAffiliation} className="ph5-button-primary">
                  {editingAffiliation ? "Update" : "Add"} Affiliation
                </Button>
              </div>
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



