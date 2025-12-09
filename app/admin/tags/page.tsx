"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Modal } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Search, MoreVertical } from "lucide-react"
import {
  getAllTags,
  addTag,
  updateTag,
  deleteTag,
  type Tag,
} from "@/lib/admin-local-db"

export default function TagsPage() {
  const { pushToast } = useToast()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active")
  const [groupBy, setGroupBy] = useState<string>("taskType")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    taskType: "",
    description: "",
    isActive: true,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = () => {
    setLoading(true)
    const allTags = getAllTags()
    setTags(allTags)
    setLoading(false)
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value = field === "isActive" ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      taskType: "",
      description: "",
      isActive: true,
    })
    setEditingId(null)
    setFormErrors({})
  }

  const handleOpenModal = (tag?: Tag) => {
    if (tag) {
      setFormData({
        name: tag.name,
        taskType: tag.taskType,
        description: tag.description || "",
        isActive: tag.isActive,
      })
      setEditingId(tag.id)
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Tag Name is required."
    }
    if (!formData.taskType.trim()) {
      errors.taskType = "Task Type is required."
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      if (editingId) {
        const updated = updateTag(editingId, {
          name: formData.name.trim(),
          taskType: formData.taskType.trim(),
          description: formData.description.trim() || undefined,
          isActive: formData.isActive,
        })
        if (updated) {
          pushToast({ title: "Success", description: "Tag updated successfully." })
          loadTags()
          handleCloseModal()
        } else {
          pushToast({ title: "Error", description: "Failed to update tag." })
        }
      } else {
        const newTag = addTag({
          name: formData.name.trim(),
          taskType: formData.taskType.trim(),
          description: formData.description.trim() || undefined,
          isActive: formData.isActive,
        })
        pushToast({ title: "Success", description: "Tag added successfully." })
        loadTags()
        handleCloseModal()
      }
    } catch (error) {
      pushToast({ title: "Error", description: "An error occurred. Please try again." })
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = deleteTag(id)
      if (success) {
        pushToast({ title: "Success", description: "Tag deleted successfully." })
        loadTags()
      } else {
        pushToast({ title: "Error", description: "Failed to delete tag." })
      }
    }
  }

  // Get unique task types for dropdown
  const taskTypes = Array.from(new Set(tags.map((tag) => tag.taskType))).sort()

  // Filter tags based on active/inactive tab and search
  const filteredTags = tags.filter((tag) => {
    const matchesStatus = activeTab === "active" ? tag.isActive : !tag.isActive
    const matchesSearch =
      searchTerm === "" ||
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  // Group tags by task type
  const groupedTags = filteredTags.reduce((acc, tag) => {
    const key = tag.taskType || "Uncategorized"
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(tag)
    return acc
  }, {} as Record<string, Tag[]>)

  // Get available task types from existing tags (for dropdown options)
  const availableTaskTypes = Array.from(new Set(tags.map((tag) => tag.taskType).filter(Boolean))).sort()

  return (
    <>
      <Header
        title="Tags"
        subtitle="Manage tags for organizing and categorizing items"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Workforce Management", href: "/admin/workforce" },
          { label: "Tags" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            {/* Search and Controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter tags by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-3">
                {/* Group By Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-foreground whitespace-nowrap">Group by:</label>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="taskType">Task Type</option>
                  </select>
                </div>
                {/* Active/Inactive Tabs */}
                <div className="flex items-center gap-2 rounded-lg border border-border p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("active")}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                      activeTab === "active"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("inactive")}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                      activeTab === "inactive"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Inactive
                  </button>
                </div>
                {/* Add New Tag Button */}
                <button
                  type="button"
                  className="ph5-button-primary"
                  onClick={() => handleOpenModal()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Tag
                </button>
              </div>
            </div>

            {/* Tags Display */}
            {loading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  No {activeTab === "active" ? "active" : "inactive"} tags found.
                  {searchTerm && " Try adjusting your search."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedTags)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([taskType, tagsInGroup]) => (
                    <div key={taskType} className="space-y-3">
                      <h3 className="text-base font-semibold text-foreground">
                        {taskType}
                      </h3>
                      <div className="space-y-3">
                        {tagsInGroup.map((tag) => (
                          <div
                            key={tag.id}
                            className="flex items-start justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-foreground">
                                  {tag.name}
                                </span>
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                    tag.isActive
                                      ? "bg-primary/10 text-primary"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {tag.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Task Type:</span> {tag.taskType}
                              </div>
                              {tag.description && (
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Description:</span> {tag.description}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="p-2 rounded-md hover:bg-muted transition-colors"
                                onClick={() => handleOpenModal(tag)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4 text-muted-foreground" />
                              </button>
                              <button
                                type="button"
                                className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                                onClick={() => handleDelete(tag.id, tag.name)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Add/Edit Tag Modal */}
      <Modal
        open={isModalOpen}
        title={editingId ? "Edit Tag" : "Add Tag"}
        onClose={handleCloseModal}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="ph5-button-secondary"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ph5-button-primary"
              onClick={handleSubmit}
            >
              {editingId ? "Update Tag" : "Save Tag"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {editingId ? "Edit Tag" : "Add Tag"}
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-foreground">Active</label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={handleInputChange("isActive")}
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Tag Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={handleInputChange("name")}
                placeholder="e.g., Summer Collection"
                required
              />
              {formErrors.name && (
                <p className="text-xs text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Tag Type <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  list="taskTypes"
                  value={formData.taskType}
                  onChange={handleInputChange("taskType")}
                  placeholder="Select or enter a task type"
                  required
                />
                <datalist id="taskTypes">
                  {availableTaskTypes.map((type) => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
              </div>
              {formErrors.taskType && (
                <p className="text-xs text-destructive">{formErrors.taskType}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Description</label>
              <Textarea
                value={formData.description}
                onChange={handleInputChange("description")}
                placeholder="Add a brief description for this tag."
                rows={4}
              />
            </div>
          </div>
        </form>
      </Modal>
    </>
  )
}
