"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Calendar, Edit } from "lucide-react"
import {
  getVendorNotesByVendorId,
  addVendorNote,
  updateVendorNote,
  deleteVendorNote,
  type VendorNote,
} from "@/lib/admin-local-db"

type VendorNotesProps = {
  vendorId: string
}

const NOTE_TYPES = ["General", "Billing", "Issue", "Request", "Other"]

export default function VendorNotes({ vendorId }: VendorNotesProps) {
  const { pushToast } = useToast()
  const [notes, setNotes] = useState<VendorNote[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    noteType: "" as VendorNote["noteType"],
    noteMessage: "",
    organization: "",
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    organization: "all",
    noteType: "all",
    dateRange: "",
    search: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    if (vendorId && vendorId !== "add") {
      loadNotes()
    } else if (vendorId === "add") {
      // Load pending notes from sessionStorage
      if (typeof window !== "undefined") {
        const pendingNotes = JSON.parse(sessionStorage.getItem("pendingVendorNotes") || "[]")
        setNotes(pendingNotes.map((n: any) => ({ ...n, id: n.tempId, vendorId: "add" })))
      }
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [vendorId])

  const loadNotes = () => {
    try {
      const vendorNotes = getVendorNotesByVendorId(vendorId)
      setNotes(vendorNotes)
    } catch (error) {
      console.error("Error loading vendor notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesOrganization = !filters.organization || filters.organization === "all" || note.organization === filters.organization
      const matchesType = !filters.noteType || filters.noteType === "all" || note.noteType === filters.noteType
      const matchesSearch = note.noteMessage.toLowerCase().includes(filters.search.toLowerCase())
      // Date range filtering would need proper date parsing
      return matchesOrganization && matchesType && matchesSearch
    })
  }, [notes, filters])

  const paginatedNotes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredNotes.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredNotes, currentPage])

  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage)

  const uniqueOrganizations = useMemo(() => {
    const orgs = new Set(notes.map((note) => note.organization).filter(Boolean))
    return Array.from(orgs).sort()
  }, [notes])

  const handleEdit = (note: VendorNote) => {
    setEditingId(note.id)
    setFormData({
      noteType: note.noteType,
      noteMessage: note.noteMessage,
      organization: note.organization || "",
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ noteType: "" as VendorNote["noteType"], noteMessage: "", organization: "" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.noteType || !formData.noteMessage) {
      pushToast({ title: "Error", description: "Please fill in all required fields." })
      return
    }

    try {
      if (editingId) {
        // Update existing note
        if (vendorId === "add") {
          const pendingNotes = JSON.parse(sessionStorage.getItem("pendingVendorNotes") || "[]")
          const index = pendingNotes.findIndex((n: any) => n.tempId === editingId)
          if (index >= 0) {
            pendingNotes[index] = { ...pendingNotes[index], ...formData }
            sessionStorage.setItem("pendingVendorNotes", JSON.stringify(pendingNotes))
            setNotes(pendingNotes.map((n: any) => ({ ...n, id: n.tempId, vendorId: "add" })))
            pushToast({ title: "Info", description: "Note updated. Will be saved when you save the vendor profile." })
          }
        } else {
          updateVendorNote(editingId, {
            noteType: formData.noteType,
            noteMessage: formData.noteMessage,
            organization: formData.organization || undefined,
          })
          pushToast({ title: "Success", description: "Note updated successfully." })
          loadNotes()
        }
        setEditingId(null)
        setFormData({ noteType: "" as VendorNote["noteType"], noteMessage: "", organization: "" })
      } else if (vendorId === "add") {
        // For new vendors, store in sessionStorage temporarily
        const pendingNotes = JSON.parse(sessionStorage.getItem("pendingVendorNotes") || "[]")
        const today = new Date()
        const formattedDate = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        pendingNotes.push({
          noteType: formData.noteType,
          noteMessage: formData.noteMessage,
          organization: formData.organization || undefined,
          authorName: "Current User",
          date: formattedDate,
          tempId: `temp-${Date.now()}`,
        })
        sessionStorage.setItem("pendingVendorNotes", JSON.stringify(pendingNotes))
        pushToast({ title: "Info", description: "Note will be saved when you save the vendor profile." })
        // Reload from sessionStorage
        setNotes(pendingNotes.map((n: any) => ({ ...n, id: n.tempId, vendorId: "add" })))
        setFormData({ noteType: "" as VendorNote["noteType"], noteMessage: "", organization: "" })
      } else {
        const today = new Date()
        const formattedDate = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        addVendorNote({
          vendorId,
          noteType: formData.noteType,
          noteMessage: formData.noteMessage,
          organization: formData.organization || undefined,
          authorName: "Current User", // In real app, get from auth context
          date: formattedDate,
        })
        pushToast({ title: "Success", description: "Note added successfully." })
        loadNotes()
        setFormData({ noteType: "" as VendorNote["noteType"], noteMessage: "", organization: "" })
      }
    } catch (error) {
      pushToast({ title: "Error", description: editingId ? "Failed to update note." : "Failed to add note." })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        if (vendorId === "add") {
          // Delete from sessionStorage
          const pendingNotes = JSON.parse(sessionStorage.getItem("pendingVendorNotes") || "[]")
          const updated = pendingNotes.filter((n: any) => n.tempId !== id)
          sessionStorage.setItem("pendingVendorNotes", JSON.stringify(updated))
          setNotes(updated.map((n: any) => ({ ...n, id: n.tempId, vendorId: "add" })))
          pushToast({ title: "Success", description: "Note removed." })
        } else {
          deleteVendorNote(id)
          pushToast({ title: "Success", description: "Note deleted successfully." })
          loadNotes()
        }
      } catch (error) {
        pushToast({ title: "Error", description: "Failed to delete note." })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading notes...</p>
      </div>
    )
  }

  // Allow adding notes even for new vendors - they'll be saved when vendor is created

  return (
    <div className="space-y-6">
      {/* Add/Edit Notes Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {editingId ? "Edit Note" : "Add Note"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Notes Type</Label>
              <Select
                value={formData.noteType}
                onValueChange={(value) => setFormData({ ...formData, noteType: value as VendorNote["noteType"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Notes</Label>
              <Textarea
                value={formData.noteMessage}
                onChange={(e) => setFormData({ ...formData, noteMessage: e.target.value })}
                placeholder="Add your notes here..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {editingId && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {editingId ? "Update Note" : "Save Note"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Notes History Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Notes History</h3>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-4 mb-4">
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Organization</Label>
            <Select
              value={filters.organization}
              onValueChange={(value) => {
                setFilters({ ...filters, organization: value })
                setCurrentPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {uniqueOrganizations.map((org) => (
                  <SelectItem key={org} value={org}>
                    {org}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Note Type</Label>
            <Select
              value={filters.noteType}
              onValueChange={(value) => {
                setFilters({ ...filters, noteType: value })
                setCurrentPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {NOTE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Date Range</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pick a date range"
                value={filters.dateRange}
                onChange={(e) => {
                  setFilters({ ...filters, dateRange: e.target.value })
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value })
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Notes Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">ORGANIZATION</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">NOTE TYPE</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">DATE</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">AUTHOR NAME</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">NOTE MESSAGE</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedNotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No notes found.
                  </td>
                </tr>
              ) : (
                paginatedNotes.map((note) => (
                  <tr key={note.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm text-foreground">{note.organization || "-"}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{note.noteType}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{note.date}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{note.authorName}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{note.noteMessage}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(note)}
                          className="text-primary hover:text-primary/70"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="text-destructive hover:text-destructive/70"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt; Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm border border-border rounded hover:bg-muted ${
                    currentPage === page ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next &gt;
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}



