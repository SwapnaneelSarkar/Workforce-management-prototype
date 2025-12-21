"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown } from "lucide-react"
import {
  getVendorUsersByVendorId,
  type VendorUser,
} from "@/lib/admin-local-db"

type VendorUsersReadOnlyProps = {
  vendorId: string
}

type SortField = "firstName" | "lastName" | "title" | "email" | "officePhone" | "mobilePhone" | "status"
type SortDirection = "asc" | "desc"

export default function VendorUsersReadOnly({ vendorId }: VendorUsersReadOnlyProps) {
  const [users, setUsers] = useState<VendorUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("firstName")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  useEffect(() => {
    if (vendorId && vendorId !== "add") {
      loadUsers()
    } else {
      setLoading(false)
    }
  }, [vendorId])

  const loadUsers = () => {
    try {
      const vendorUsers = getVendorUsersByVendorId(vendorId)
      setUsers(vendorUsers)
    } catch (error) {
      console.error("Error loading vendor users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const query = searchQuery.toLowerCase()
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      return fullName.includes(query) || user.email.toLowerCase().includes(query)
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "firstName":
          comparison = a.firstName.localeCompare(b.firstName)
          break
        case "lastName":
          comparison = a.lastName.localeCompare(b.lastName)
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "email":
          comparison = a.email.localeCompare(b.email)
          break
        case "officePhone":
          comparison = (a.officePhone || "").localeCompare(b.officePhone || "")
          break
        case "mobilePhone":
          comparison = (a.mobilePhone || "").localeCompare(b.mobilePhone || "")
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [users, searchQuery, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Vendor Users</h2>
          <p className="text-sm text-muted-foreground">View-only access to vendor user information</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  <button
                    onClick={() => handleSort("firstName")}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    FIRST NAME
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  <button
                    onClick={() => handleSort("lastName")}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    LAST NAME
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    TITLE
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    EMAIL
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  <button
                    onClick={() => handleSort("officePhone")}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    OFFICE PHONE
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  <button
                    onClick={() => handleSort("mobilePhone")}
                    className="flex items-center gap-2 hover:text-primary"
                  >
                    MOBILE PHONE
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
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    {searchQuery ? "No users found matching your search." : "No users available."}
                  </td>
                </tr>
              ) : (
                filteredAndSortedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm text-foreground">{user.firstName}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{user.lastName}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{user.title}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{user.email}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{user.officePhone || "-"}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{user.mobilePhone || "-"}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            user.status === "Active" ? "bg-primary" : "bg-muted-foreground"
                          }`}
                        />
                        <span className={user.status === "Active" ? "text-foreground" : "text-muted-foreground"}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}


