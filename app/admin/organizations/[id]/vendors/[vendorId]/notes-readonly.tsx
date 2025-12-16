"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Search, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getVendorNotesByVendorId,
  type VendorNote,
} from "@/lib/admin-local-db"

type VendorNotesReadOnlyProps = {
  vendorId: string
}

const NOTE_TYPES = ["General", "Billing", "Issue", "Request", "Other"]

export default function VendorNotesReadOnly({ vendorId }: VendorNotesReadOnlyProps) {
  const [notes, setNotes] = useState<VendorNote[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading notes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Notes History</h2>
          <p className="text-sm text-muted-foreground">View-only access to vendor notes</p>
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-4 mb-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Organization</label>
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
            <label className="text-sm font-medium text-foreground mb-2 block">Note Type</label>
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
            <label className="text-sm font-medium text-foreground mb-2 block">Date Range</label>
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
            <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
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
              </tr>
            </thead>
            <tbody>
              {paginatedNotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
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
