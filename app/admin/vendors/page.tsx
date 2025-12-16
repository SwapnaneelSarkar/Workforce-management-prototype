"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, ArrowUpDown, Trash2 } from "lucide-react"
import { getAllVendors, deleteVendor, type Vendor } from "@/lib/admin-local-db"
import { useToast } from "@/components/system"

type SortField = "name" | "status" | "activationDate" | "industry"
type SortDirection = "asc" | "desc"

export default function AdminVendorsPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadVendors()
    // Reload vendors when page becomes visible (e.g., after navigation back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadVendors()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const loadVendors = () => {
    try {
      const allVendors = getAllVendors()
      setVendors(allVendors)
    } catch (error) {
      console.error("Error loading vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendors.filter((vendor) => {
      const query = searchQuery.toLowerCase()
      return vendor.name.toLowerCase().includes(query)
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "status":
          comparison = a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1
          break
        case "activationDate":
          const dateA = a.activationDate ? new Date(a.activationDate).getTime() : 0
          const dateB = b.activationDate ? new Date(b.activationDate).getTime() : 0
          comparison = dateA - dateB
          break
        case "industry":
          const industryA = a.industries && a.industries.length > 0 ? a.industries[0] : ""
          const industryB = b.industries && b.industries.length > 0 ? b.industries[0] : ""
          comparison = industryA.localeCompare(industryB)
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [vendors, searchQuery, sortField, sortDirection])

  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedVendors.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedVendors, currentPage])

  const totalPages = Math.ceil(filteredAndSortedVendors.length / itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
    } catch {
      return dateString
    }
  }

  const handleDelete = (vendor: Vendor) => {
    if (confirm(`Are you sure you want to delete "${vendor.name}"? This will also delete all associated users, documents, and notes.`)) {
      try {
        const success = deleteVendor(vendor.id)
        if (success) {
          pushToast({ title: "Success", description: `Vendor "${vendor.name}" deleted successfully.` })
          loadVendors()
        } else {
          pushToast({ title: "Error", description: "Failed to delete vendor." })
        }
      } catch (error) {
        console.error("Error deleting vendor:", error)
        pushToast({ title: "Error", description: "Failed to delete vendor." })
      }
    }
  }

  if (loading) {
    return (
      <>
        <Header
          title="Manage Vendor Network"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Vendors" },
          ]}
        />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading vendors...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="Manage Vendor Network"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Vendors" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Vendor List</h2>
              </div>
              <button
                onClick={() => router.push("/admin/vendors/add")}
                className="ph5-button-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search here"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>

            {/* Vendor Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        VENDOR NAME
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      <button
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        STATUS
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      <button
                        onClick={() => handleSort("activationDate")}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        ACTIVATION DATE
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      <button
                        onClick={() => handleSort("industry")}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        INDUSTRY
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVendors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        {searchQuery ? "No vendors found matching your search." : "No vendors available."}
                      </td>
                    </tr>
                  ) : (
                    paginatedVendors.map((vendor) => (
                      <tr key={vendor.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm">
                          <Link
                            href={`/admin/vendors/${vendor.id}/view`}
                            className="text-primary hover:underline font-medium"
                          >
                            {vendor.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                vendor.isActive ? "bg-primary" : "bg-muted-foreground"
                              }`}
                            />
                            <span className={vendor.isActive ? "text-foreground" : "text-muted-foreground"}>
                              {vendor.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">{formatDate(vendor.activationDate)}</td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {vendor.industries && vendor.industries.length > 0 ? vendor.industries[0] : "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/admin/vendors/${vendor.id}`}
                              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(vendor)}
                              className="inline-flex items-center gap-2 text-sm text-destructive hover:underline"
                              title="Delete vendor"
                            >
                              <Trash2 className="h-4 w-4" />
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
              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt; Previous
                </button>
                <span className="px-4 py-1 text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next &gt;
                </button>
              </div>
            )}
          </div>
        </Card>
      </section>
    </>
  )
}
