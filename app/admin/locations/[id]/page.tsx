"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { MapPin, Building2, ArrowLeft, Plus, Trash2, X } from "lucide-react"
import { getLocationById, addDepartment, removeDepartment, updateDepartment, getAllOccupationSpecialties, type Department } from "@/lib/organizations-store"
import { useDemoData } from "@/components/providers/demo-data-provider"

type LocationWithOrg = {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone?: string
  email?: string
  locationType?: string
  costCentre?: string
  photo?: string
  departments: Department[]
  organizationId: string
  organizationName: string
}

export default function LocationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { pushToast } = useToast()
  const { organization } = useDemoData()
  const [location, setLocation] = useState<LocationWithOrg | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDeptForm, setShowAddDeptForm] = useState(false)
  const [newDepartment, setNewDepartment] = useState<Omit<Department, "id">>({
    name: "",
    deptType: "",
    relatedUsers: [],
    costCentre: "",
    relatedOccupationSpecialties: [],
  })
  const [editingDepartments, setEditingDepartments] = useState<Record<string, Partial<Department>>>({})
  
  const occupationSpecialties = getAllOccupationSpecialties()
  const candidates = organization.candidates

  useEffect(() => {
    const locationId = params.id as string
    const loc = getLocationById(locationId)
    setLocation(loc)
    setLoading(false)
  }, [params.id])

  const handleAddDepartment = () => {
    if (!location || !newDepartment.name.trim()) {
      pushToast({ title: "Validation Error", description: "Please enter a department name." })
      return
    }

    if (location.departments.some((dept) => dept.name === newDepartment.name.trim())) {
      pushToast({ title: "Validation Error", description: "This department already exists." })
      return
    }

    const success = addDepartment(location.id, {
      name: newDepartment.name.trim(),
      deptType: newDepartment.deptType || undefined,
      relatedUsers: newDepartment.relatedUsers,
      costCentre: newDepartment.costCentre || undefined,
      relatedOccupationSpecialties: newDepartment.relatedOccupationSpecialties,
    })
    if (success) {
      const updatedLocation = getLocationById(location.id)
      if (updatedLocation) {
        setLocation(updatedLocation)
        setNewDepartment({
          name: "",
          deptType: "",
          relatedUsers: [],
          costCentre: "",
          relatedOccupationSpecialties: [],
        })
        setShowAddDeptForm(false)
        pushToast({ title: "Success", description: "Department added successfully." })
      }
    } else {
      pushToast({ title: "Error", description: "Failed to add department. Please try again." })
    }
  }

  const handleRemoveDepartment = (deptId: string) => {
    if (!location) return

    const success = removeDepartment(location.id, deptId)
    if (success) {
      const updatedLocation = getLocationById(location.id)
      if (updatedLocation) {
        setLocation(updatedLocation)
        pushToast({ title: "Success", description: "Department removed successfully." })
      }
    } else {
      pushToast({ title: "Error", description: "Failed to remove department. Please try again." })
    }
  }

  const handleDepartmentUpdate = (deptId: string, updates: Partial<Department>) => {
    if (!location) return

    const success = updateDepartment(location.id, deptId, updates)
    if (success) {
      const updatedLocation = getLocationById(location.id)
      if (updatedLocation) {
        setLocation(updatedLocation)
        setEditingDepartments((prev) => {
          const updated = { ...prev }
          delete updated[deptId]
          return updated
        })
        pushToast({ title: "Success", description: "Department updated successfully." })
      }
    } else {
      pushToast({ title: "Error", description: "Failed to update department. Please try again." })
      setEditingDepartments((prev) => {
        const updated = { ...prev }
        delete updated[deptId]
        return updated
      })
    }
  }

  const toggleUserSelection = (userId: string, isNew: boolean = false) => {
    if (isNew) {
      setNewDepartment((prev) => ({
        ...prev,
        relatedUsers: prev.relatedUsers.includes(userId)
          ? prev.relatedUsers.filter((id) => id !== userId)
          : [...prev.relatedUsers, userId],
      }))
    } else {
      // For editing existing departments
      const dept = location?.departments.find((d) => d.id === Object.keys(editingDepartments)[0])
      if (dept) {
        const deptId = dept.id
        setEditingDepartments((prev) => {
          const current = prev[deptId] || dept
          return {
            ...prev,
            [deptId]: {
              ...current,
              relatedUsers: (current.relatedUsers || []).includes(userId)
                ? (current.relatedUsers || []).filter((id) => id !== userId)
                : [...(current.relatedUsers || []), userId],
            },
          }
        })
      }
    }
  }

  const toggleOccupationSpecialtySelection = (occSpecId: string, isNew: boolean = false) => {
    if (isNew) {
      setNewDepartment((prev) => ({
        ...prev,
        relatedOccupationSpecialties: prev.relatedOccupationSpecialties.includes(occSpecId)
          ? prev.relatedOccupationSpecialties.filter((id) => id !== occSpecId)
          : [...prev.relatedOccupationSpecialties, occSpecId],
      }))
    } else {
      // For editing existing departments
      const dept = location?.departments.find((d) => d.id === Object.keys(editingDepartments)[0])
      if (dept) {
        const deptId = dept.id
        setEditingDepartments((prev) => {
          const current = prev[deptId] || dept
          return {
            ...prev,
            [deptId]: {
              ...current,
              relatedOccupationSpecialties: (current.relatedOccupationSpecialties || []).includes(occSpecId)
                ? (current.relatedOccupationSpecialties || []).filter((id) => id !== occSpecId)
                : [...(current.relatedOccupationSpecialties || []), occSpecId],
            },
          }
        })
      }
    }
  }

  if (loading) {
    return (
      <>
        <Header
          title="Location Details"
          subtitle="View and manage location information and departments."
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Locations", href: "/admin/locations" },
            { label: "Details" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Card>
      </>
    )
  }

  if (!location) {
    return (
      <>
        <Header
          title="Location Not Found"
          subtitle="The requested location could not be found."
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Locations", href: "/admin/locations" },
            { label: "Not Found" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Location not found.</p>
            <Link href="/admin/locations" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Back to Locations
            </Link>
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      <Header
        title={location.name}
        subtitle="Location details and departments."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Locations", href: "/admin/locations" },
          { label: location.name },
        ]}
      />

      <section className="space-y-6">
        <div className="flex gap-3">
          <Link href="/admin/locations" className="ph5-button-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Locations
          </Link>
        </div>

        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Location Information</h2>
              <p className="mt-1 text-sm text-muted-foreground">Basic details about the location.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Name</p>
                  <p className="text-sm font-semibold text-foreground">{location.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Organization</p>
                  <p className="text-sm font-semibold text-foreground">{location.organizationName}</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Address</p>
                <p className="text-sm text-foreground">
                  {location.address}
                  <br />
                  {location.city}, {location.state} {location.zipCode}
                </p>
              </div>

              {location.phone && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Phone</p>
                  <a href={`tel:${location.phone}`} className="text-sm text-primary hover:underline">
                    {location.phone}
                  </a>
                </div>
              )}

              {location.email && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
                  <a href={`mailto:${location.email}`} className="text-sm text-primary hover:underline">
                    {location.email}
                  </a>
                </div>
              )}

              {location.locationType && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Location Type</p>
                  <p className="text-sm text-foreground">{location.locationType}</p>
                </div>
              )}

              {location.costCentre && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Cost Centre</p>
                  <p className="text-sm text-foreground">{location.costCentre}</p>
                </div>
              )}

              {location.photo && (
                <div className="md:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Photo</p>
                  <p className="text-sm text-foreground">{location.photo}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Departments</h2>
              <p className="mt-1 text-sm text-muted-foreground">Manage departments for this location.</p>
            </div>

            <div className="space-y-4">
              {location.departments.length === 0 && !showAddDeptForm ? (
                <p className="text-sm text-muted-foreground">No departments yet. Click "Add Department" to create one.</p>
              ) : (
                <div className="space-y-4">
                  {location.departments.map((dept) => {
                    const isEditing = editingDepartments[dept.id] !== undefined
                    const displayDept = isEditing ? { ...dept, ...editingDepartments[dept.id] } : dept
                    return (
                      <div key={dept.id} className="rounded-lg border border-border p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">{displayDept.name}</h3>
                          <div className="flex gap-2">
                            {!isEditing ? (
                              <>
                                <button
                                  type="button"
                                  className="text-sm text-primary hover:underline"
                                  onClick={() => setEditingDepartments({ [dept.id]: { ...dept } })}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="text-muted-foreground hover:text-foreground"
                                  onClick={() => handleRemoveDepartment(dept.id)}
                                  title="Delete department"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="text-sm text-primary hover:underline"
                                  onClick={() => handleDepartmentUpdate(dept.id, editingDepartments[dept.id])}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="text-sm text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    setEditingDepartments((prev) => {
                                      const updated = { ...prev }
                                      delete updated[dept.id]
                                      return updated
                                    })
                                  }}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Department Name</label>
                            {isEditing ? (
                              <Input
                                value={displayDept.name}
                                onChange={(e) =>
                                  setEditingDepartments((prev) => ({
                                    ...prev,
                                    [dept.id]: { ...prev[dept.id], name: e.target.value },
                                  }))
                                }
                                className="text-sm"
                              />
                            ) : (
                              <p className="text-sm text-foreground">{displayDept.name}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Department Type</label>
                            {isEditing ? (
                              <select
                                value={displayDept.deptType || ""}
                                onChange={(e) =>
                                  setEditingDepartments((prev) => ({
                                    ...prev,
                                    [dept.id]: { ...prev[dept.id], deptType: e.target.value },
                                  }))
                                }
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                              >
                                <option value="">Select type</option>
                                <option value="Clinical">Clinical</option>
                                <option value="Administrative">Administrative</option>
                                <option value="Support">Support</option>
                                <option value="Other">Other</option>
                              </select>
                            ) : (
                              <p className="text-sm text-foreground">{displayDept.deptType || "—"}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Cost Centre</label>
                            {isEditing ? (
                              <Input
                                value={displayDept.costCentre || ""}
                                onChange={(e) =>
                                  setEditingDepartments((prev) => ({
                                    ...prev,
                                    [dept.id]: { ...prev[dept.id], costCentre: e.target.value },
                                  }))
                                }
                                className="text-sm"
                                placeholder="CC-001"
                              />
                            ) : (
                              <p className="text-sm text-foreground">{displayDept.costCentre || "—"}</p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-muted-foreground mb-2">Related Users</label>
                            {isEditing ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                                {candidates.map((user) => {
                                  const isSelected = (displayDept.relatedUsers || []).includes(user.id)
                                  return (
                                    <label key={user.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent p-1 rounded">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {
                                          const current = editingDepartments[dept.id] || dept
                                          setEditingDepartments((prev) => ({
                                            ...prev,
                                            [dept.id]: {
                                              ...current,
                                              relatedUsers: isSelected
                                                ? (current.relatedUsers || []).filter((id) => id !== user.id)
                                                : [...(current.relatedUsers || []), user.id],
                                            },
                                          }))
                                        }}
                                      />
                                      <span>{user.name}</span>
                                    </label>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {displayDept.relatedUsers && displayDept.relatedUsers.length > 0 ? (
                                  displayDept.relatedUsers.map((userId) => {
                                    const user = candidates.find((c) => c.id === userId)
                                    return user ? (
                                      <span key={userId} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                        {user.name}
                                      </span>
                                    ) : null
                                  })
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-muted-foreground mb-2">Related Occupation/Specialty</label>
                            {isEditing ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                                {occupationSpecialties.map((occSpec) => {
                                  const isSelected = (displayDept.relatedOccupationSpecialties || []).includes(occSpec.id)
                                  return (
                                    <label key={occSpec.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent p-1 rounded">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {
                                          const current = editingDepartments[dept.id] || dept
                                          setEditingDepartments((prev) => ({
                                            ...prev,
                                            [dept.id]: {
                                              ...current,
                                              relatedOccupationSpecialties: isSelected
                                                ? (current.relatedOccupationSpecialties || []).filter((id) => id !== occSpec.id)
                                                : [...(current.relatedOccupationSpecialties || []), occSpec.id],
                                            },
                                          }))
                                        }}
                                      />
                                      <span>{occSpec.displayName}</span>
                                    </label>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {displayDept.relatedOccupationSpecialties && displayDept.relatedOccupationSpecialties.length > 0 ? (
                                  displayDept.relatedOccupationSpecialties.map((occSpecId) => {
                                    const occSpec = occupationSpecialties.find((os) => os.id === occSpecId)
                                    return occSpec ? (
                                      <span key={occSpecId} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                        {occSpec.displayName}
                                      </span>
                                    ) : null
                                  })
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {showAddDeptForm && (
                <div className="rounded-lg border border-border p-4 space-y-4 bg-accent/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Add New Department</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddDeptForm(false)
                        setNewDepartment({
                          name: "",
                          deptType: "",
                          relatedUsers: [],
                          costCentre: "",
                          relatedOccupationSpecialties: [],
                        })
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Department Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={newDepartment.name}
                        onChange={(e) => setNewDepartment((prev) => ({ ...prev, name: e.target.value }))}
                        className="text-sm"
                        placeholder="Enter department name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Department Type</label>
                      <select
                        value={newDepartment.deptType}
                        onChange={(e) => setNewDepartment((prev) => ({ ...prev, deptType: e.target.value }))}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        <option value="">Select type</option>
                        <option value="Clinical">Clinical</option>
                        <option value="Administrative">Administrative</option>
                        <option value="Support">Support</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Cost Centre</label>
                      <Input
                        value={newDepartment.costCentre}
                        onChange={(e) => setNewDepartment((prev) => ({ ...prev, costCentre: e.target.value }))}
                        className="text-sm"
                        placeholder="CC-001"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Related Users</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                        {candidates.map((user) => {
                          const isSelected = newDepartment.relatedUsers.includes(user.id)
                          return (
                            <label key={user.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent p-1 rounded">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleUserSelection(user.id, true)}
                              />
                              <span>{user.name}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Related Occupation/Specialty</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                        {occupationSpecialties.map((occSpec) => {
                          const isSelected = newDepartment.relatedOccupationSpecialties.includes(occSpec.id)
                          return (
                            <label key={occSpec.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent p-1 rounded">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleOccupationSpecialtySelection(occSpec.id, true)}
                              />
                              <span>{occSpec.displayName}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="ph5-button-primary text-sm" onClick={handleAddDepartment}>
                      Add Department
                    </button>
                    <button
                      type="button"
                      className="ph5-button-secondary text-sm"
                      onClick={() => {
                        setShowAddDeptForm(false)
                        setNewDepartment({
                          name: "",
                          deptType: "",
                          relatedUsers: [],
                          costCentre: "",
                          relatedOccupationSpecialties: [],
                        })
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!showAddDeptForm && (
                <div className="border-t pt-4">
                  <button
                    type="button"
                    className="ph5-button-secondary text-sm"
                    onClick={() => setShowAddDeptForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Department
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}
