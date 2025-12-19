"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash2, ArrowUpDown } from "lucide-react"
import {
  getVendorUsersByVendorId,
  addVendorUser,
  updateVendorUser,
  deleteVendorUser,
  type VendorUser,
} from "@/lib/admin-local-db"

type VendorUsersProps = {
  vendorId: string
}

type SortField = "firstName" | "lastName" | "title" | "email" | "officePhone" | "mobilePhone" | "status"
type SortDirection = "asc" | "desc"

export default function VendorUsers({ vendorId }: VendorUsersProps) {
  const { pushToast } = useToast()
  const [users, setUsers] = useState<VendorUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("firstName")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    officePhone: "",
    mobilePhone: "",
    status: "Active" as "Active" | "Inactive",
  })

  useEffect(() => {
    if (vendorId && vendorId !== "add") {
      loadUsers()
    } else if (vendorId === "add") {
      // Load pending users from sessionStorage
      if (typeof window !== "undefined") {
        const pendingUsers = JSON.parse(sessionStorage.getItem("pendingVendorUsers") || "[]")
        setUsers(pendingUsers.map((u: any) => ({ ...u, id: u.tempId, vendorId: "add" })))
      }
      setLoading(false)
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

  const handleAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData({
      firstName: "",
      lastName: "",
      title: "",
      email: "",
      officePhone: "",
      mobilePhone: "",
      status: "Active",
    })
  }

  const handleEdit = (user: VendorUser) => {
    setEditingId(user.id)
    setIsAdding(false)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      email: user.email,
      officePhone: user.officePhone || "",
      mobilePhone: user.mobilePhone || "",
      status: user.status,
    })
  }

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      pushToast({ title: "Error", description: "Please fill in all required fields." })
      return
    }

    try {
      if (vendorId === "add") {
        // For new vendors, store in sessionStorage temporarily
        const pendingUsers = JSON.parse(sessionStorage.getItem("pendingVendorUsers") || "[]")
        if (editingId) {
          // Update existing pending user
          const index = pendingUsers.findIndex((u: any) => u.tempId === editingId)
          if (index >= 0) {
            pendingUsers[index] = { ...formData, tempId: editingId }
          }
        } else {
          // Add new pending user
          pendingUsers.push({ ...formData, tempId: `temp-${Date.now()}` })
        }
        sessionStorage.setItem("pendingVendorUsers", JSON.stringify(pendingUsers))
        pushToast({ title: "Info", description: "User will be saved when you save the vendor profile." })
        setIsAdding(false)
        setEditingId(null)
        setFormData({
          firstName: "",
          lastName: "",
          title: "",
          email: "",
          officePhone: "",
          mobilePhone: "",
          status: "Active",
        })
        // Reload from sessionStorage
        const updatedPending = JSON.parse(sessionStorage.getItem("pendingVendorUsers") || "[]")
        setUsers(updatedPending.map((u: any) => ({ ...u, id: u.tempId, vendorId: "add" })))
      } else {
        if (editingId) {
          updateVendorUser(editingId, { ...formData, vendorId })
          pushToast({ title: "Success", description: "Vendor user updated successfully." })
        } else {
          addVendorUser({ ...formData, vendorId })
          pushToast({ title: "Success", description: "Vendor user added successfully." })
        }
        loadUsers()
        setIsAdding(false)
        setEditingId(null)
        setFormData({
          firstName: "",
          lastName: "",
          title: "",
          email: "",
          officePhone: "",
          mobilePhone: "",
          status: "Active",
        })
      }
    } catch (error) {
      pushToast({ title: "Error", description: "Failed to save vendor user." })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this vendor user?")) {
      try {
        if (vendorId === "add") {
          // Delete from sessionStorage
          const pendingUsers = JSON.parse(sessionStorage.getItem("pendingVendorUsers") || "[]")
          const updated = pendingUsers.filter((u: any) => u.tempId !== id)
          sessionStorage.setItem("pendingVendorUsers", JSON.stringify(updated))
          setUsers(updated.map((u: any) => ({ ...u, id: u.tempId, vendorId: "add" })))
          pushToast({ title: "Success", description: "Vendor user removed." })
        } else {
          deleteVendorUser(id)
          pushToast({ title: "Success", description: "Vendor user deleted successfully." })
          loadUsers()
        }
      } catch (error) {
        pushToast({ title: "Error", description: "Failed to delete vendor user." })
      }
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      firstName: "",
      lastName: "",
      title: "",
      email: "",
      officePhone: "",
      mobilePhone: "",
      status: "Active",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading vendor users...</p>
      </div>
    )
  }

  // Allow adding users even for new vendors - they'll be saved when vendor is created

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {editingId ? "Edit Vendor User" : "Add Vendor User"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">First Name *</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="First Name"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Last Name *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Last Name"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Title"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Office Phone</Label>
              <Input
                value={formData.officePhone}
                onChange={(e) => setFormData({ ...formData, officePhone: e.target.value })}
                placeholder="555-123-4567"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Mobile Phone</Label>
              <Input
                value={formData.mobilePhone}
                onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
                placeholder="555-987-6543"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Status</Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted"
            >
              Cancel
            </button>
            <button onClick={handleSave} className="ph5-button-primary">
              {editingId ? "Update User" : "Add User"}
            </button>
          </div>
        </Card>
      )}

      {/* Users List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Vendor Users</h3>
          {!isAdding && !editingId && (
            <button onClick={handleAdd} className="ph5-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email..."
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
                    {searchQuery ? "No users found matching your search." : "No vendor users available."}
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
                    <td className="py-3 px-4 text-sm text-foreground">{user.status || "-"}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-primary hover:text-primary/70"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
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
      </Card>
    </div>
  )
}

