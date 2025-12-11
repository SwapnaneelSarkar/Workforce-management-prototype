"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import {
  getAllUsers,
  deleteUser,
  type User,
} from "@/lib/admin-local-db"

export default function UsersPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    tags: [] as string[],
    isActive: true,
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    setLoading(true)
    const allUsers = getAllUsers()
    // Filter out candidates - only show users with portal access (Admin, Organization Admin, Vendor, etc.)
    const portalUsers = allUsers.filter((user) => 
      user.role.toLowerCase() !== "candidate"
    )
    setUsers(portalUsers)
    setLoading(false)
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const value = field === "isActive" ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTagInput = (e: ChangeEvent<HTMLInputElement>) => {
    const tagString = e.target.value
    const tags = tagString.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
    setFormData((prev) => ({ ...prev, tags }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      tags: [],
      isActive: true,
    })
    setEditingId(null)
    setIsCreating(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.role.trim()) {
      pushToast({ title: "Validation Error", description: "Please fill in all required fields (Name, Email, Role)." })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      pushToast({ title: "Validation Error", description: "Please enter a valid email address." })
      return
    }

    try {
      if (editingId) {
        const { addUser, updateUser } = require("@/lib/admin-local-db")
        const updated = updateUser(editingId, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role.trim(),
          tags: formData.tags,
          isActive: formData.isActive,
        })
        if (updated) {
          pushToast({ title: "Success", description: "User updated successfully." })
          resetForm()
          loadUsers()
        } else {
          pushToast({ title: "Error", description: "Failed to update user." })
        }
      } else {
        const { addUser } = require("@/lib/admin-local-db")
        const newUser = addUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role.trim(),
          isActive: formData.isActive,
        })
        // Add tags separately
        formData.tags.forEach((tag) => {
          const { addTagToUser } = require("@/lib/admin-local-db")
          addTagToUser(newUser.id, tag)
        })
        pushToast({ title: "Success", description: "User created successfully." })
        resetForm()
        loadUsers()
      }
    } catch (error) {
      pushToast({ title: "Error", description: "An error occurred. Please try again." })
    }
  }

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      tags: user.tags,
      isActive: user.isActive,
    })
    setEditingId(user.id)
    setIsCreating(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = deleteUser(id)
      if (success) {
        pushToast({ title: "Success", description: "User deleted successfully." })
        loadUsers()
      } else {
        pushToast({ title: "Error", description: "Failed to delete user." })
      }
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchTerm === "" || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "" || user.role === roleFilter
    const matchesStatus = statusFilter === "" || 
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive)
    return matchesSearch && matchesRole && matchesStatus
  })

  const uniqueRoles = Array.from(new Set(users.map((u) => u.role))).sort()

  return (
    <>
      <Header
        title="Users"
        subtitle="Manage portal access users (Admin, Organization Admin, Vendor) - Candidates are excluded"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Users" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Users</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {loading ? "Loading..." : `${filteredUsers.length} ${filteredUsers.length === 1 ? "user" : "users"}`}
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm()
                  setIsCreating(true)
                }}
                className="ph5-button-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Create/Edit Form Modal */}
            {isCreating && (
              <div className="border border-border rounded-lg p-6 bg-muted/30">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {editingId ? "Edit User" : "Create New User"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">
                        Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={handleInputChange("name")}
                        placeholder="Full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange("email")}
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Phone</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange("phone")}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">
                        Role <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={formData.role}
                        onChange={handleInputChange("role")}
                        placeholder="e.g., Admin, Organization Admin, Vendor"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-foreground">Tags (comma-separated)</label>
                      <Input
                        value={formData.tags.join(", ")}
                        onChange={handleTagInput}
                        placeholder="e.g., ICU-Specialist, High-Experience"
                      />
                      <p className="text-xs text-muted-foreground">
                        Tags are applied internally and not visible to candidates
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange("isActive")}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="isActive" className="text-sm font-semibold text-foreground cursor-pointer">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="ph5-button-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="ph5-button-primary">
                      {editingId ? "Update User" : "Create User"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  {users.length === 0 ? "No users yet. Create one to get started." : "No users match your filters."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Tags</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-foreground">{user.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">{user.email}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">{user.phone || "—"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">{user.role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {user.tags.length > 0 ? (
                              user.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-primary/10 text-primary"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              user.isActive
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(user)}
                              className="p-2 rounded-md hover:bg-muted transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button
                              type="button"
                              className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                              onClick={() => handleDelete(user.id, user.name)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </section>
    </>
  )
}





