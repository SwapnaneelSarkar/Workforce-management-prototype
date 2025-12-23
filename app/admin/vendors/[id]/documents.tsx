"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Trash2, Upload, Search, Calendar, Edit } from "lucide-react"
import {
  getVendorDocumentsByVendorId,
  addVendorDocument,
  updateVendorDocument,
  deleteVendorDocument,
  type VendorDocument,
} from "@/lib/admin-local-db"

type VendorDocumentsProps = {
  vendorId: string
}

const DOCUMENT_TYPES = ["Legal", "Marketing", "Finance", "HR", "Project", "Other"]

export default function VendorDocuments({ vendorId }: VendorDocumentsProps) {
  const { pushToast } = useToast()
  const [documents, setDocuments] = useState<VendorDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    type: "" as VendorDocument["type"],
    description: "",
    file: null as File | null,
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    search: "",
    fromDate: "",
    toDate: "",
    documentType: "all",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    if (vendorId && vendorId !== "add") {
      loadDocuments()
    } else if (vendorId === "add") {
      // Load pending documents from sessionStorage
      if (typeof window !== "undefined") {
        const pendingDocs = JSON.parse(sessionStorage.getItem("pendingVendorDocuments") || "[]")
        setDocuments(pendingDocs.map((d: any) => ({ ...d, id: d.tempId, vendorId: "add" })))
      }
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [vendorId])

  const loadDocuments = () => {
    try {
      const vendorDocs = getVendorDocumentsByVendorId(vendorId)
      setDocuments(vendorDocs)
    } catch (error) {
      console.error("Error loading vendor documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(filters.search.toLowerCase())
      const matchesType = !filters.documentType || filters.documentType === "all" || doc.type === filters.documentType
      const matchesFromDate = !filters.fromDate || doc.uploadedDate >= filters.fromDate
      const matchesToDate = !filters.toDate || doc.uploadedDate <= filters.toDate
      return matchesSearch && matchesType && matchesFromDate && matchesToDate
    })
  }, [documents, filters])

  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredDocuments.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredDocuments, currentPage])

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage)

  const handleEdit = (doc: VendorDocument) => {
    setEditingId(doc.id)
    setFormData({
      name: doc.name,
      type: doc.type,
      description: doc.description || "",
      file: null,
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ name: "", type: "" as VendorDocument["type"], description: "", file: null })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.type) {
      pushToast({ title: "Error", description: "Please fill in all required fields." })
      return
    }

    try {
      if (editingId) {
        // Update existing document
        if (vendorId === "add") {
          const pendingDocs = JSON.parse(sessionStorage.getItem("pendingVendorDocuments") || "[]")
          const index = pendingDocs.findIndex((d: any) => d.tempId === editingId)
          if (index >= 0) {
            pendingDocs[index] = { ...pendingDocs[index], ...formData }
            sessionStorage.setItem("pendingVendorDocuments", JSON.stringify(pendingDocs))
            setDocuments(pendingDocs.map((d: any) => ({ ...d, id: d.tempId, vendorId: "add" })))
            pushToast({ title: "Info", description: "Document updated. Will be saved when you save the vendor profile." })
          }
        } else {
          updateVendorDocument(editingId, {
            name: formData.name,
            type: formData.type,
            description: formData.description,
          })
          pushToast({ title: "Success", description: "Document updated successfully." })
          loadDocuments()
        }
        setEditingId(null)
        setFormData({ name: "", type: "" as VendorDocument["type"], description: "", file: null })
      } else if (vendorId === "add") {
        // For new vendors, store in sessionStorage temporarily
        const pendingDocs = JSON.parse(sessionStorage.getItem("pendingVendorDocuments") || "[]")
        const today = new Date().toISOString().split("T")[0]
        pendingDocs.push({
          name: formData.name,
          type: formData.type,
          uploadedDate: today,
          uploadedBy: "Current User",
          description: formData.description,
          tempId: `temp-${Date.now()}`,
        })
        sessionStorage.setItem("pendingVendorDocuments", JSON.stringify(pendingDocs))
        pushToast({ title: "Info", description: "Document will be saved when you save the vendor profile." })
        // Reload from sessionStorage
        setDocuments(pendingDocs.map((d: any) => ({ ...d, id: d.tempId, vendorId: "add" })))
        setFormData({ name: "", type: "" as VendorDocument["type"], description: "", file: null })
      } else {
        const today = new Date().toISOString().split("T")[0]
        addVendorDocument({
          vendorId,
          name: formData.name,
          type: formData.type,
          uploadedDate: today,
          uploadedBy: "Current User", // In real app, get from auth context
          description: formData.description,
        })
        pushToast({ title: "Success", description: "Document added successfully." })
        loadDocuments()
        setFormData({ name: "", type: "" as VendorDocument["type"], description: "", file: null })
      }
    } catch (error) {
      pushToast({ title: "Error", description: editingId ? "Failed to update document." : "Failed to add document." })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        if (vendorId === "add") {
          // Delete from sessionStorage
          const pendingDocs = JSON.parse(sessionStorage.getItem("pendingVendorDocuments") || "[]")
          const updated = pendingDocs.filter((d: any) => d.tempId !== id)
          sessionStorage.setItem("pendingVendorDocuments", JSON.stringify(updated))
          setDocuments(updated.map((d: any) => ({ ...d, id: d.tempId, vendorId: "add" })))
          pushToast({ title: "Success", description: "Document removed." })
        } else {
          deleteVendorDocument(id)
          pushToast({ title: "Success", description: "Document deleted successfully." })
          loadDocuments()
        }
      } catch (error) {
        pushToast({ title: "Error", description: "Failed to delete document." })
      }
    }
  }

  const handleDownload = (doc: VendorDocument) => {
    // In real app, this would download the actual file
    pushToast({ title: "Info", description: `Downloading ${doc.name}...` })
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading documents...</p>
      </div>
    )
  }

  // Allow adding documents even for new vendors - they'll be saved when vendor is created

  return (
    <div className="space-y-6">
      {/* Add/Edit Document Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {editingId ? "Edit Document" : "Add Document"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Document Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Annual Report 2024"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Document Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as VendorDocument["type"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="[drop down]" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
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
            {editingId && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => {
              setFormData({ name: "", type: "" as VendorDocument["type"], description: "", file: null })
              setEditingId(null)
            }}>
              {editingId ? "Cancel" : "Clear"}
            </Button>
            <Button type="submit">
              {editingId ? "Update Document" : "Save Document"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Documents List Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Documents</h3>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Document Name"
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value })
                setCurrentPage(1)
              }}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              placeholder="From Date"
              value={filters.fromDate}
              onChange={(e) => {
                setFilters({ ...filters, fromDate: e.target.value })
                setCurrentPage(1)
              }}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              placeholder="To Date"
              value={filters.toDate}
              onChange={(e) => {
                setFilters({ ...filters, toDate: e.target.value })
                setCurrentPage(1)
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.documentType}
            onValueChange={(value) => {
              setFilters({ ...filters, documentType: value })
              setCurrentPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Documents Table */}
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
              {paginatedDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No documents found.
                  </td>
                </tr>
              ) : (
                paginatedDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm text-foreground">{doc.name}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{doc.type}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{formatDate(doc.uploadedDate)}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{doc.uploadedBy}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{doc.description || "-"}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="text-primary hover:text-primary/70"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-primary hover:text-primary/70"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-destructive hover:text-destructive/70"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDocuments.length)} of {filteredDocuments.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;&lt;
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;
              </button>
              <span className="px-4 py-1 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;&gt;
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}



