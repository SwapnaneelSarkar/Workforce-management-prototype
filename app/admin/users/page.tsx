"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Search, Eye } from "lucide-react"
import {
  getPortalUsers,
  addPortalUser,
  updatePortalUser,
  deletePortalUser,
  type PortalUser,
} from "@/lib/admin-local-db"
import Link from "next/link"

type TabKey = "Program" | "Vendor" | "Organization"

const STATUS_OPTIONS: Array<PortalUser["status"]> = ["Active", "Inactive"]

export default function UsersPage() {
  const { pushToast } = useToast()
  const [activeTab, setActiveTab] = useState<TabKey>("Program")
  const [users, setUsers] = useState<PortalUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<PortalUser, "id" | "createdAt" | "updatedAt">>({
    userType: "Program",
    groupName: "",
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    officePhone: "",
    mobilePhone: "",
    status: "Active",
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    setLoading(true)
    const data = getPortalUsers()
    setUsers(data)
    setLoading(false)
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      userType: "Program",
      groupName: "",
      firstName: "",
      lastName: "",
      title: "",
      email: "",
      officePhone: "",
      mobilePhone: "",
      status: "Active",
    })
    setEditingId(null)
    setIsFormOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.title.trim()) {
      pushToast({ title: "Validation Error", description: "Please fill in required fields." })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      pushToast({ title: "Validation Error", description: "Please enter a valid email address." })
      return
    }

    try {
      if (editingId) {
        const updated = updatePortalUser(editingId, {
          ...formData,
        })
        if (updated) {
          pushToast({ title: "Success", description: "User updated." })
          resetForm()
          loadUsers()
        } else {
          pushToast({ title: "Error", description: "Update failed." })
        }
      } else {
        addPortalUser({
          ...formData,
        })
        pushToast({ title: "Success", description: "User created." })
        resetForm()
        loadUsers()
      }
    } catch (error) {
      pushToast({ title: "Error", description: "An error occurred. Please try again." })
    }
  }

  const handleEdit = (user: PortalUser) => {
    setFormData({
      userType: user.userType,
      groupName: user.groupName || "",
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      email: user.email,
      officePhone: user.officePhone || "",
      mobilePhone: user.mobilePhone || "",
      status: user.status,
    })
    setEditingId(user.id)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete ${name}?`)) {
      const success = deletePortalUser(id)
      if (success) {
        pushToast({ title: "Deleted", description: "User removed." })
        loadUsers()
      } else {
        pushToast({ title: "Error", description: "Delete failed." })
      }
    }
  }

  const filteredUsers = useMemo(() => {
    const data = getPortalUsers({
      userType: activeTab,
      search: searchTerm.trim(),
    })
    return data
  }, [activeTab, searchTerm, users])

  const grouped = useMemo(() => {
    return filteredUsers.reduce<Record<string, PortalUser[]>>((acc, user) => {
      const key = user.groupName || activeTab
      if (!acc[key]) acc[key] = []
      acc[key].push(user)
      return acc
    }, {})
  }, [filteredUsers, activeTab])

  const statusPill = (status: PortalUser["status"]) => (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
        status === "Active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      }`}
    >
      {status}
    </span>
  )

  return (
    <>
      <Header
        title="Users"
        subtitle="Program, Vendor, and Organization users"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Users" },
        ]}
      />

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-6 text-sm font-semibold">
            {(["Program", "Vendor", "Organization"] as TabKey[]).map((tab) => (
              <button
                key={tab}
                className={`pb-2 border-b-2 ${
                  activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab} Users
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              resetForm()
              setFormData((prev) => ({ ...prev, userType: activeTab }))
              setIsFormOpen(true)
            }}
            className="ph5-button-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {isFormOpen && (
              <div className="border border-border rounded-lg p-6 bg-muted/30">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {editingId ? "Edit User" : "Add User"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">User Type</label>
                      <select
                        value={formData.userType}
                        onChange={handleInputChange("userType")}
                        className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Program">Program</option>
                        <option value="Vendor">Vendor</option>
                        <option value="Organization">Organization</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Group Name</label>
                      <Input
                        value={formData.groupName}
                        onChange={handleInputChange("groupName")}
                        placeholder="e.g., Vendor A"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">First Name *</label>
                      <Input
                        value={formData.firstName}
                        onChange={handleInputChange("firstName")}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Last Name *</label>
                      <Input
                        value={formData.lastName}
                        onChange={handleInputChange("lastName")}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Title *</label>
                      <Input
                        value={formData.title}
                        onChange={handleInputChange("title")}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Email *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange("email")}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Office Phone</label>
                      <Input
                        value={formData.officePhone}
                        onChange={handleInputChange("officePhone")}
                        placeholder="555-123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Mobile Phone</label>
                      <Input
                        value={formData.mobilePhone}
                        onChange={handleInputChange("mobilePhone")}
                        placeholder="555-987-6543"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Status</label>
                      <select
                        value={formData.status}
                        onChange={handleInputChange("status")}
                        className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <button type="button" className="ph5-button-secondary" onClick={resetForm}>
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
                <p className="text-muted-foreground">No users found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(grouped).map(([group, entries]) => (
                  <div key={group} className="border border-border rounded-lg">
                    <div className="px-4 py-2 font-semibold text-foreground bg-muted/40">{group}</div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                            <th className="text-left py-3 px-4">First Name</th>
                            <th className="text-left py-3 px-4">Last Name</th>
                            <th className="text-left py-3 px-4">Title</th>
                            <th className="text-left py-3 px-4">Email</th>
                            <th className="text-left py-3 px-4">Office Phone</th>
                            <th className="text-left py-3 px-4">Mobile Phone</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-right py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((user) => (
                            <tr key={user.id} className="border-b border-border text-sm">
                              <td className="py-3 px-4">{user.firstName}</td>
                              <td className="py-3 px-4">{user.lastName}</td>
                              <td className="py-3 px-4">{user.title}</td>
                              <td className="py-3 px-4">{user.email}</td>
                              <td className="py-3 px-4">{user.officePhone || "—"}</td>
                              <td className="py-3 px-4">{user.mobilePhone || "—"}</td>
                              <td className="py-3 px-4">{statusPill(user.status)}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="p-2 rounded-md hover:bg-muted transition-colors"
                                    title="View"
                                  >
                                    <Link href={`/admin/users/${user.id}`} className="flex">
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                  </button>
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
                                    onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                                    className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>
    </>
  )
}






