"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { MapPin, Building2, ArrowLeft, Plus, Trash2 } from "lucide-react"
import { getLocationById, addDepartment, removeDepartment, updateDepartment } from "@/lib/organizations-store"

type LocationWithOrg = {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone?: string
  email?: string
  departments: string[]
  organizationId: string
  organizationName: string
}

export default function LocationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { pushToast } = useToast()
  const [location, setLocation] = useState<LocationWithOrg | null>(null)
  const [loading, setLoading] = useState(true)
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [editingDepartments, setEditingDepartments] = useState<Record<number, string>>({})

  useEffect(() => {
    const locationId = params.id as string
    const loc = getLocationById(locationId)
    setLocation(loc)
    setLoading(false)
  }, [params.id])

  const handleAddDepartment = () => {
    if (!location || !newDepartmentName.trim()) {
      pushToast({ title: "Validation Error", description: "Please enter a department name." })
      return
    }

    if (location.departments.includes(newDepartmentName.trim())) {
      pushToast({ title: "Validation Error", description: "This department already exists." })
      return
    }

    const success = addDepartment(location.id, newDepartmentName.trim())
    if (success) {
      const updatedLocation = getLocationById(location.id)
      if (updatedLocation) {
        setLocation(updatedLocation)
        setNewDepartmentName("")
        pushToast({ title: "Success", description: "Department added successfully." })
      }
    } else {
      pushToast({ title: "Error", description: "Failed to add department. Please try again." })
    }
  }

  const handleRemoveDepartment = (deptName: string) => {
    if (!location) return

    const success = removeDepartment(location.id, deptName)
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

  const handleDepartmentNameChange = (index: number, oldName: string, newName: string) => {
    if (!location) return

    // Update local state for immediate UI feedback
    setEditingDepartments((prev) => ({ ...prev, [index]: newName }))

    // If name changed and is valid, update in database
    if (newName.trim() && newName.trim() !== oldName) {
      // Check for duplicates
      const otherDepts = location.departments.filter((_, i) => i !== index)
      if (otherDepts.includes(newName.trim())) {
        pushToast({ title: "Validation Error", description: "This department name already exists." })
        // Revert to old name
        setEditingDepartments((prev) => {
          const updated = { ...prev }
          delete updated[index]
          return updated
        })
        return
      }

      const success = updateDepartment(location.id, oldName, newName.trim())
      if (success) {
        const updatedLocation = getLocationById(location.id)
        if (updatedLocation) {
          setLocation(updatedLocation)
          setEditingDepartments((prev) => {
            const updated = { ...prev }
            delete updated[index]
            return updated
          })
        }
      } else {
        pushToast({ title: "Error", description: "Failed to update department. Please try again." })
        setEditingDepartments((prev) => {
          const updated = { ...prev }
          delete updated[index]
          return updated
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
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Departments</h2>
              <p className="mt-1 text-sm text-muted-foreground">Manage departments for this location.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Departments</p>
              </div>

              {location.departments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No departments yet. Add departments using the form below.</p>
              ) : (
                <div className="space-y-2">
                  {location.departments.map((dept, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-md border border-border p-3">
                      <Input
                        value={editingDepartments[index] !== undefined ? editingDepartments[index] : dept}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const newName = e.target.value
                          setEditingDepartments((prev) => ({ ...prev, [index]: newName }))
                        }}
                        onBlur={(e: ChangeEvent<HTMLInputElement>) => {
                          const newName = e.target.value.trim()
                          if (newName && newName !== dept) {
                            handleDepartmentNameChange(index, dept, newName)
                          } else if (!newName) {
                            // If empty, revert to original
                            setEditingDepartments((prev) => {
                              const updated = { ...prev }
                              delete updated[index]
                              return updated
                            })
                          } else {
                            // No change, clear editing state
                            setEditingDepartments((prev) => {
                              const updated = { ...prev }
                              delete updated[index]
                              return updated
                            })
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur()
                          } else if (e.key === "Escape") {
                            setEditingDepartments((prev) => {
                              const updated = { ...prev }
                              delete updated[index]
                              return updated
                            })
                            e.currentTarget.blur()
                          }
                        }}
                        className="flex-1"
                        placeholder="Department Name"
                      />
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveDepartment(dept)}
                        title="Delete department"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={newDepartmentName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewDepartmentName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddDepartment()
                      }
                    }}
                    placeholder="Enter department name"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    className="ph5-button-secondary text-xs"
                    onClick={handleAddDepartment}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Department
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}
