"use client"

import { useState } from "react"
import { Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Trash2, Upload, Search, Calendar } from "lucide-react"

type Document = {
  id: string
  name: string
  type: string
  uploadedDate: string
  uploadedBy: string
  description: string
}

type OrganizationDocumentsProps = {
  organizationId: string
}

export default function OrganizationDocuments({ organizationId }: OrganizationDocumentsProps) {
  const [formData, setFormData] = useState({
    documentName: "",
    documentType: "",
    description: "",
    file: null as File | null,
  })

  const [filters, setFilters] = useState({
    search: "",
    fromDate: "",
    toDate: "",
    documentType: "",
  })

  // Mock data - in real app, this would come from API
  const [documents] = useState<Document[]>([
    {
      id: "1",
      name: "Contract_2023_Q4.pdf",
      type: "Legal",
      uploadedDate: "2023-11-28",
      uploadedBy: "Alice Johnson",
      description: "Quarterly sales contract for Q4 2023.",
    },
    {
      id: "2",
      name: "Marketing_Strategy.pdf",
      type: "Marketing",
      uploadedDate: "2023-11-27",
      uploadedBy: "Bob Smith",
      description: "Annual marketing strategy document.",
    },
    {
      id: "3",
      name: "Financial_Report.xlsx",
      type: "Finance",
      uploadedDate: "2023-11-26",
      uploadedBy: "Carol White",
      description: "Monthly financial report for November.",
    },
    {
      id: "4",
      name: "HR_Policy.pdf",
      type: "HR",
      uploadedDate: "2023-11-25",
      uploadedBy: "David Brown",
      description: "Updated HR policy document.",
    },
    {
      id: "5",
      name: "Project_Plan.docx",
      type: "Project",
      uploadedDate: "2023-11-24",
      uploadedBy: "Eve Davis",
      description: "Q1 2024 project planning document.",
    },
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    setFormData({ documentName: "", documentType: "", description: "", file: null })
  }

  const handleCancel = () => {
    setFormData({ documentName: "", documentType: "", description: "", file: null })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">View Organization Documents</h2>

      {/* Add Document Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Add Document</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Document Name</Label>
              <Input
                value={formData.documentName}
                onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                placeholder="e.g., Annual Report 2024"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Document Type</Label>
              <Select value={formData.documentType} onValueChange={(value) => setFormData({ ...formData, documentType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="[drop down]" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Upload Attachment</Label>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Choose file...
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description of the attachment"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Document</Button>
          </div>
        </form>
      </Card>

      {/* Documents Table Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Documents</h3>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-4 mb-4">
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Document Name</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Document Name"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">From Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">To Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Document Type</Label>
            <Select value={filters.documentType} onValueChange={(value) => setFilters({ ...filters, documentType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Document Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Document Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Uploaded Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Uploaded By</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Description</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm text-foreground">{doc.name}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{doc.type}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{doc.uploadedDate}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{doc.uploadedBy}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{doc.description}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-muted rounded-md transition-colors" title="Download">
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 rounded-md transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Showing 1 to 5 of 5 results</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              &lt;&lt;
            </Button>
            <Button variant="outline" size="sm" disabled>
              &lt;
            </Button>
            <Button variant="default" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              &gt;
            </Button>
            <Button variant="outline" size="sm" disabled>
              &gt;&gt;
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

