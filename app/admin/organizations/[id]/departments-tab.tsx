"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2 } from "lucide-react"
import {
  getOrganizationById,
  addDepartment,
  removeDepartment,
  updateDepartment,
  type OrganizationLocation,
  type Department,
} from "@/lib/organizations-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type DepartmentsTabProps = {
  organizationId: string
}

export default function DepartmentsTab({ organizationId }: DepartmentsTabProps) {
  const { pushToast } = useToast()
  const [organization, setOrganization] = useState<any>(null)
  const [locations, setLocations] = useState<OrganizationLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<{ locationId: string; department: Department } | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string>("")

  // Form state
  const [departmentFormData, setDepartmentFormData] = useState({
    name: "",
    deptType: "",
    costCentre: "",
  })

  useEffect(() => {
    loadOrganization()
  }, [organizationId])

  const loadOrganization = () => {
    try {
      const org = getOrganizationById(organizationId)
      if (org) {
        setOrganization(org)
        const orgLocations = org.locations || []
        setLocations(orgLocations)
      }
    } catch (error) {
      console.warn("Failed to load organization:", error)
    }
    setLoading(false)
  }

  // Calculate all departments across all locations
  const allDepartments = useMemo(() => {
    const depts: Array<Department & { locationName: string; locationId: string }> = []
    locations.forEach((loc) => {
      loc.departments.forEach((dept) => {
        depts.push({
          ...dept,
          locationName: loc.name,
          locationId: loc.id,
        })
      })
    })
    return depts
  }, [locations])

  // Calculate employee counts (mock calculation)
  const departmentEmployeeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allDepartments.forEach((dept) => {
      const nameHash = dept.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const baseCounts: Record<string, number> = {
        "Family Medicine": 12,
        "Pediatrics": 10,
        "Internal Medicine": 9,
        "Obstetrics & Gynecology": 8,
        "Pediatric Cardiology": 6,
        "General Dentistry": 7,
        "Orthodontics": 5,
        "Primary Care": 11,
        "Behavioral Health": 8,
        "Women's Health": 7,
        "Urgent Care": 9,
      }
      const baseCount = baseCounts[dept.name] || 8
      const variation = (nameHash % 5) - 2
      counts[dept.id] = Math.max(3, baseCount + variation)
    })
    return counts
  }, [allDepartments])

  const handleAddDepartment = () => {
    setEditingDepartment(null)
    setSelectedLocationId("") // Reset selection so user can choose in modal
    setDepartmentFormData({
      name: "",
      deptType: "",
      costCentre: "",
    })
    setIsDepartmentModalOpen(true)
  }

  const handleEditDepartment = (locationId: string, department: Department) => {
    setSelectedLocationId(locationId)
    setEditingDepartment({ locationId, department })
    setDepartmentFormData({
      name: department.name,
      deptType: department.deptType || "",
      costCentre: department.costCentre || "",
    })
    setIsDepartmentModalOpen(true)
  }

  const handleSaveDepartment = () => {
    if (!departmentFormData.name.trim()) {
      pushToast({
        title: "Validation Error",
        description: "Department name is required.",
        type: "error",
      })
      return
    }

    const locationId = editingDepartment?.locationId || selectedLocationId
    if (!locationId) {
      pushToast({
        title: "Validation Error",
        description: "Please select a location.",
        type: "error",
      })
      return
    }

    try {
      if (editingDepartment) {
        // Update existing department
        const success = updateDepartment(locationId, editingDepartment.department.id, {
          name: departmentFormData.name.trim(),
          deptType: departmentFormData.deptType || undefined,
          costCentre: departmentFormData.costCentre || undefined,
        })

        if (success) {
          pushToast({
            title: "Success",
            description: "Department updated successfully.",
            type: "success",
          })
          loadOrganization()
        } else {
          pushToast({
            title: "Error",
            description: "Failed to update department.",
            type: "error",
          })
        }
      } else {
        // Add new department
        const success = addDepartment(locationId, {
          name: departmentFormData.name.trim(),
          deptType: departmentFormData.deptType || undefined,
          costCentre: departmentFormData.costCentre || undefined,
          relatedUsers: [],
          relatedOccupationSpecialties: [],
        })

        if (success) {
          pushToast({
            title: "Success",
            description: "Department added successfully.",
            type: "success",
          })
          loadOrganization()
        } else {
          pushToast({
            title: "Error",
            description: "Failed to add department. Department may already exist.",
            type: "error",
          })
        }
      }

      setIsDepartmentModalOpen(false)
      setEditingDepartment(null)
      setSelectedLocationId("")
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to save department.",
        type: "error",
      })
    }
  }

  const handleDeleteDepartment = (locationId: string, deptId: string) => {
    if (!confirm("Are you sure you want to delete this department?")) {
      return
    }

    try {
      const success = removeDepartment(locationId, deptId)
      if (success) {
        pushToast({
          title: "Success",
          description: "Department deleted successfully.",
          type: "success",
        })
        loadOrganization()
      } else {
        pushToast({
          title: "Error",
          description: "Failed to delete department.",
          type: "error",
        })
      }
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to delete department.",
        type: "error",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex gap-2">
          <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
            <SelectTrigger className="w-[250px] bg-background">
              <SelectValue placeholder="Select location first" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddDepartment}
            className="ph5-button-primary"
            disabled={locations.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allDepartments.map((dept) => (
          <Card key={dept.id} className="p-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">{dept.locationName}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditDepartment(dept.locationId, dept)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDepartment(dept.locationId, dept.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{departmentEmployeeCounts[dept.id] || 0}</span> employees
                </p>
              </div>
            </div>
          </Card>
        ))}

        {allDepartments.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground mb-4">No departments found.</p>
            <Button
              onClick={handleAddDepartment}
              className="ph5-button-primary"
              disabled={locations.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
        )}
      </div>

      {/* Department Modal */}
      <Dialog open={isDepartmentModalOpen} onOpenChange={setIsDepartmentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDepartment ? "Edit Department" : "Add Department"}</DialogTitle>
            <DialogDescription>
              {editingDepartment ? "Update department details below." : "Add a new department to the selected location."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!editingDepartment && (
              <div className="space-y-2">
                <Label htmlFor="dept-location">Location *</Label>
                <Select value={selectedLocationId || undefined} onValueChange={setSelectedLocationId}>
                  <SelectTrigger id="dept-location" className="bg-background w-full">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No locations available</div>
                    ) : (
                      locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="dept-name">Department Name *</Label>
              <Input
                id="dept-name"
                value={departmentFormData.name}
                onChange={(e) => setDepartmentFormData({ ...departmentFormData, name: e.target.value })}
                placeholder="Enter department name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dept-type">Department Type</Label>
                <Input
                  id="dept-type"
                  value={departmentFormData.deptType}
                  onChange={(e) => setDepartmentFormData({ ...departmentFormData, deptType: e.target.value })}
                  placeholder="e.g., Clinical, Administrative"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-cost">Cost Centre</Label>
                <Input
                  id="dept-cost"
                  value={departmentFormData.costCentre}
                  onChange={(e) => setDepartmentFormData({ ...departmentFormData, costCentre: e.target.value })}
                  placeholder="Cost centre code"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDepartmentModalOpen(false)
              setEditingDepartment(null)
              setSelectedLocationId("")
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveDepartment} className="ph5-button-primary" disabled={!selectedLocationId && !editingDepartment}>
              {editingDepartment ? "Update" : "Add"} Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

