"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown, Eye } from "lucide-react"
import { 
  getAllVendors, 
  getOrganizationById, 
  getVendorOrganizationsByOrganizationId,
  getVendorById,
  type Vendor 
} from "@/lib/admin-local-db"

type SortField = "name" | "status" | "activationDate" | "inactivationDate"
type SortDirection = "asc" | "desc"

export default function OrganizationVendorsPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [organizationName, setOrganizationName] = useState<string>("Organization")
  const itemsPerPage = 10

  useEffect(() => {
    loadData()
    // Reload vendors when page becomes visible (e.g., after navigation back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [organizationId])

  const loadData = () => {
    try {
      // Get vendors associated with this organization
      const vendorAssociations = getVendorOrganizationsByOrganizationId(organizationId)
      const associatedVendorIds = new Set(vendorAssociations.map((va) => va.vendorId))
      
      // Get all vendors and filter to only those associated with this organization
      const allVendors = getAllVendors()
      const filteredVendors = allVendors.filter((vendor) => associatedVendorIds.has(vendor.id))
      
      setVendors(filteredVendors)
      
      // Get organization name
      const org = getOrganizationById(organizationId)
      if (org) {
        setOrganizationName(org.name)
      }
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
        case "inactivationDate":
          const inactDateA = a.inactivationDate ? new Date(a.inactivationDate).getTime() : 0
          const inactDateB = b.inactivationDate ? new Date(b.inactivationDate).getTime() : 0
          comparison = inactDateA - inactDateB
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

  if (loading) {
    return (
      <>
        <Header
          title="Vendors"
          subtitle={`Vendors for ${organizationName}`}
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Organizations", href: "/admin/organizations" },
            { label: organizationName, href: `/admin/organizations/${organizationId}` },
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
        title="Vendors"
        subtitle={`Vendors for ${organizationName}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organizationName, href: `/admin/organizations/${organizationId}` },
          { label: "Vendors" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Vendor List</h2>
                <p className="text-sm text-muted-foreground mt-1">View-only access to vendor information</p>
              </div>
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
                        onClick={() => handleSort("inactivationDate")}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        INACTIVATION DATE
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
                        <td className="py-3 px-4 text-sm text-foreground">{vendor.name}</td>
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
                        <td className="py-3 px-4 text-sm text-foreground">{formatDate(vendor.inactivationDate)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/admin/organizations/${organizationId}/vendors/${vendor.id}`}
                              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Link>
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

