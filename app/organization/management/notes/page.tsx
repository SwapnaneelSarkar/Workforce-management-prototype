"use client"

import { useMemo, useState } from "react"
import { Header, Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

type NoteCategory = "Compliance" | "Vendors" | "Process" | "Planning"

type OrgNote = {
  id: string
  title: string
  category: NoteCategory
  body: string
  author: string
  createdAt: string
}

const MOCK_NOTES: OrgNote[] = [
  {
    id: "compliance",
    title: "New Compliance Requirements",
    category: "Compliance",
    body: "Updated state regulations require additional documentation for all nursing staff. Review and update templates by end of month.",
    author: "John Smith",
    createdAt: "2 hours ago",
  },
  {
    id: "vendor-performance",
    title: "Vendor Performance Review",
    category: "Vendors",
    body: "MedStaff Solutions consistently delivering high-quality candidates. Consider expanding partnership.",
    author: "Sarah Miller",
    createdAt: "1 day ago",
  },
  {
    id: "interview-process",
    title: "Interview Process Update",
    category: "Process",
    body: "Implementing new virtual interview platform for remote candidates. Training scheduled for next week.",
    author: "Robert Johnson",
    createdAt: "3 days ago",
  },
  {
    id: "q4-hiring",
    title: "Q4 Hiring Goals",
    category: "Planning",
    body: "Target: 25 new RN positions, 15 CNA positions, 10 PT positions. Focus on retention strategies.",
    author: "Emily Davis",
    createdAt: "1 week ago",
  },
]

export default function OrganizationNotesPage() {
  const [notes, setNotes] = useState<OrgNote[]>(MOCK_NOTES)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | NoteCategory>("all")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newCategory, setNewCategory] = useState<NoteCategory>("Compliance")
  const [newBody, setNewBody] = useState("")

  const filteredNotes = useMemo(
    () =>
      notes.filter((note) => {
        if (categoryFilter !== "all" && note.category !== categoryFilter) {
          return false
        }
        if (!search.trim()) return true
        const needle = search.toLowerCase()
        return (
          note.title.toLowerCase().includes(needle) ||
          note.body.toLowerCase().includes(needle) ||
          note.author.toLowerCase().includes(needle)
        )
      }),
    [notes, search, categoryFilter],
  )

  const handleAddNote = () => {
    if (!newTitle.trim() || !newBody.trim()) return
    const next: OrgNote = {
      id: `note_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      body: newBody.trim(),
      author: "John Smith",
      createdAt: "Just now",
    }
    setNotes((prev) => [next, ...prev])
    setNewTitle("")
    setNewBody("")
    setNewCategory("Compliance")
    setIsDialogOpen(false)
  }

  return (
    <>
      <Header
        title="Notes"
        subtitle="Capture and share organization-level notes and documentation."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Management", href: "/organization/management" },
          { label: "Notes" },
        ]}
        actions={[
          {
            id: "add-note",
            label: "Add Note",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setIsDialogOpen(true),
          },
        ]}
      />

      <section className="space-y-6">
        {/* Filters */}
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full max-w-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Search notes
              </p>
              <Input
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Category
                </span>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) =>
                    setCategoryFilter(value as "all" | NoteCategory)
                  }
                >
                  <SelectTrigger className="min-w-[160px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Vendors">Vendors</SelectItem>
                    <SelectItem value="Process">Process</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes list */}
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <Card key={note.id}>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {note.title}
                    </h3>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {note.category}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {note.author} • {note.createdAt}
                  </div>
                </div>
                <p className="text-sm text-foreground">
                  {note.body}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Note dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
              <DialogDescription>
                Create a new organization note that will be visible to your team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Title *
                </p>
                <Input
                  placeholder="Enter note title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Category
                </p>
                <Select
                  value={newCategory}
                  onValueChange={(value) =>
                    setNewCategory(value as NoteCategory)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Vendors">Vendors</SelectItem>
                    <SelectItem value="Process">Process</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Content *
                </p>
                <Textarea
                  placeholder="Enter note content..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setNewTitle("")
                  setNewBody("")
                  setNewCategory("Compliance")
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddNote}
                disabled={!newTitle.trim() || !newBody.trim()}
              >
                Add Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </>
  )
}
