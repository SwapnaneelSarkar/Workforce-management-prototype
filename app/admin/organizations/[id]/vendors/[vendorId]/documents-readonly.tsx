"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Download, Search, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getVendorDocumentsByVendorId,
  type VendorDocument,
} from "@/lib/admin-local-db"

type VendorDocumentsReadOnlyProps = {
  vendorId: string
}

const DOCUMENT_TYPES = ["Legal", "Marketing", "Finance", "HR", "Project", "Other"]

export default function VendorDocumentsReadOnly({ vendorId }: VendorDocumentsReadOnlyProps) {
  const [documents, setDocuments] = useState<VendorDocument[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Documents</h2>
          <p className="text-sm text-muted-foreground">View-only access to vendor documents</p>
        </div>

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
                          onClick={() => {
                            // In real app, this would download the actual file
                            console.log("Download", doc.name)
                          }}
                          className="text-primary hover:text-primary/70"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
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
