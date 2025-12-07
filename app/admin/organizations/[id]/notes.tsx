"use client"

import { useState } from "react"
import { Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Calendar } from "lucide-react"

type Note = {
  id: string
  type: string
  date: string
  author: string
  message: string
}

type OrganizationNotesProps = {
  organizationId: string
}

export default function OrganizationNotes({ organizationId }: OrganizationNotesProps) {
  const [formData, setFormData] = useState({
    noteType: "",
    notes: "",
  })

  const [filters, setFilters] = useState({
    noteType: "",
    dateRange: "",
    search: "",
  })

  // Mock data - in real app, this would come from API
  const [notes] = useState<Note[]>([
    {
      id: "1",
      type: "General",
      date: "Nov 20, 2023",
      author: "John Doe",
      message: "Meeting notes on project alpha progress.",
    },
    {
      id: "2",
      type: "Billing",
      date: "Nov 19, 2023",
      author: "Jane Smith",
      message: "Reviewed code for module X. Found minor issues.",
    },
    {
      id: "3",
      type: "Issue",
      date: "Nov 18, 2023",
      author: "Alice Brown",
      message: "Security patch required for production server ASAP.",
    },
    {
      id: "4",
      type: "General",
      date: "Nov 17, 2023",
      author: "Bob White",
      message: "Followed up with client regarding deliverables.",
    },
    {
      id: "5",
      type: "Request",
      date: "Nov 16, 2023",
      author: "John Doe",
      message: "Prepared documentation for API endpoints.",
    },
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    setFormData({ noteType: "", notes: "" })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">View Notes</h2>

      {/* Add Notes Section */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Notes Type</Label>
              <Select value={formData.noteType} onValueChange={(value) => setFormData({ ...formData, noteType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Billing">Billing</SelectItem>
                  <SelectItem value="Issue">Issue</SelectItem>
                  <SelectItem value="Request">Request</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add your notes here..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save Note</Button>
          </div>
        </form>
      </Card>

      {/* Notes History Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Notes History</h3>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Note Type</Label>
            <Select value={filters.noteType} onValueChange={(value) => setFilters({ ...filters, noteType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Billing">Billing</SelectItem>
                <SelectItem value="Issue">Issue</SelectItem>
                <SelectItem value="Request">Request</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Date Range</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                placeholder="Pick a date range"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search notes..."
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">NOTE TYPE</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">DATE</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">AUTHOR NAME</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">NOTE MESSAGE</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm text-foreground">{note.type}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{note.date}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{note.author}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{note.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm">
            &lt; Previous
          </Button>
          <Button variant="default" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            Next &gt;
          </Button>
        </div>
      </Card>
    </div>
  )
}

