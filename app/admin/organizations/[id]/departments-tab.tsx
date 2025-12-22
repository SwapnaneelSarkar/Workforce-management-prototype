"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Plus, Edit, Trash2, Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getOrganizationById,
  addDepartment,
  removeDepartment,
  updateDepartment,
  type OrganizationLocation,
  type Department,
} from "@/lib/organizations-store"
import {
  getAllUsers,
  getAllOccupationSpecialties,
  getOccupationById,
  getSpecialtyById,
} from "@/lib/admin-local-db"
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
    relatedUsers: [] as string[],
    relatedOccupationSpecialties: [] as string[],
  })

  // Load users and occupation specialties
  const [allUsers, setAllUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [allOccupationSpecialties, setAllOccupationSpecialties] = useState<Array<{ id: string; displayName: string }>>([])
  const [usersPopoverOpen, setUsersPopoverOpen] = useState(false)
  const [occupationSpecialtiesPopoverOpen, setOccupationSpecialtiesPopoverOpen] = useState(false)

  useEffect(() => {
    // Load users
    const users = getAllUsers()
    setAllUsers(users.map(u => ({ id: u.id, name: u.name, email: u.email })))

    // Load occupation specialties with formatted display names
    const occSpecs = getAllOccupationSpecialties()
    const formatted = occSpecs.map(occSpec => {
      const occupation = getOccupationById(occSpec.occupationId)
      const specialty = getSpecialtyById(occSpec.specialtyId)
      const displayName = occupation && specialty 
        ? `${occupation.name} - ${specialty.name}`
        : occSpec.displayName || "Unknown"
      return { id: occSpec.id, displayName }
    })
    setAllOccupationSpecialties(formatted)
  }, [])

  useEffect(() => {
    loadOrganization()
  }, [organizationId])

  const loadOrganization = () => {
    setLoading(true)
    try {
      const org = getOrganizationById(organizationId)
      if (org) {
        setOrganization(org)
        const orgLocations = org.locations || []
        setLocations(orgLocations)
        // Debug: Log department count
        const totalDepts = orgLocations.reduce((sum, loc) => sum + (loc.departments?.length || 0), 0)
        console.log(`Loaded ${orgLocations.length} locations with ${totalDepts} total departments`)
      } else {
        console.warn(`Organization ${organizationId} not found`)
      }
    } catch (error) {
      console.error("Failed to load organization:", error)
    } finally {
      setLoading(false)
    }
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


  const handleAddDepartment = () => {
    if (!selectedLocationId) {
      pushToast({
        title: "Validation Error",
        description: "Please select a location first.",
        type: "error",
      })
      return
    }

    setEditingDepartment(null)
    setDepartmentFormData({
      name: "",
      deptType: "",
      costCentre: "",
      relatedUsers: [],
      relatedOccupationSpecialties: [],
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
      relatedUsers: department.relatedUsers || [],
      relatedOccupationSpecialties: department.relatedOccupationSpecialties || [],
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
          relatedUsers: departmentFormData.relatedUsers,
          relatedOccupationSpecialties: departmentFormData.relatedOccupationSpecialties,
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
          relatedUsers: departmentFormData.relatedUsers,
          relatedOccupationSpecialties: departmentFormData.relatedOccupationSpecialties,
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
      setDepartmentFormData({
        name: "",
        deptType: "",
        costCentre: "",
        relatedUsers: [],
        relatedOccupationSpecialties: [],
      })
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

  // Calculate department statistics
  const totalDepartments = allDepartments.length
  const departmentsByType = useMemo(() => {
    const counts: Record<string, number> = {}
    allDepartments.forEach((dept) => {
      const type = dept.deptType || "Unspecified"
      counts[type] = (counts[type] || 0) + 1
    })
    return counts
  }, [allDepartments])

  const uniqueDepartmentTypes = Object.keys(departmentsByType).length

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
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Departments</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {loading ? "Loading..." : `${totalDepartments} ${totalDepartments === 1 ? "department" : "departments"}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedLocationId || "all"} onValueChange={(value) => setSelectedLocationId(value === "all" ? "" : value)}>
                <SelectTrigger className="w-[250px] bg-background">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Locations</SelectItem>
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
                disabled={!selectedLocationId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : allDepartments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No departments found.</p>
              <Button
                onClick={handleAddDepartment}
                className="ph5-button-primary"
                disabled={!selectedLocationId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Department Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Cost Centre</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allDepartments.map((dept) => (
                    <tr key={dept.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-foreground">{dept.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">{dept.locationName}</span>
                      </td>
                      <td className="py-3 px-4">
                        {dept.deptType ? (
                          <span className="text-sm text-foreground">{dept.deptType}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {dept.costCentre ? (
                          <span className="text-sm text-foreground">{dept.costCentre}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="p-2 rounded-md hover:bg-muted transition-colors"
                            onClick={() => handleEditDepartment(dept.locationId, dept)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            type="button"
                            className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                            onClick={() => handleDeleteDepartment(dept.locationId, dept.id)}
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
                  <SelectTrigger id="dept-location" className="bg-background">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
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

            {/* Related Users Multi-Select */}
            <div className="space-y-2">
              <Label>Related Users</Label>
              <Popover open={usersPopoverOpen} onOpenChange={setUsersPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-background"
                  >
                    {departmentFormData.relatedUsers.length > 0
                      ? `${departmentFormData.relatedUsers.length} user(s) selected`
                      : "Select users..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-[100001] bg-background border shadow-lg" align="start">
                  <Command shouldFilter={true} className="bg-background">
                    <CommandInput placeholder="Search users..." />
                    <CommandList>
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        {allUsers.map((user) => {
                          const isSelected = departmentFormData.relatedUsers.includes(user.id)
                          return (
                            <CommandItem
                              key={user.id}
                              value={`${user.name} ${user.email}`}
                              onSelect={() => {
                                // Toggle selection when clicking anywhere on the item
                                setDepartmentFormData(prev => ({
                                  ...prev,
                                  relatedUsers: isSelected
                                    ? prev.relatedUsers.filter(id => id !== user.id)
                                    : [...prev.relatedUsers, user.id]
                                }))
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    setDepartmentFormData(prev => ({
                                      ...prev,
                                      relatedUsers: checked
                                        ? [...prev.relatedUsers, user.id]
                                        : prev.relatedUsers.filter(id => id !== user.id)
                                    }))
                                  }}
                                />
                                <span className="flex-1">
                                  {user.name} ({user.email})
                                </span>
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {departmentFormData.relatedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {departmentFormData.relatedUsers.map((userId) => {
                    const user = allUsers.find(u => u.id === userId)
                    if (!user) return null
                    return (
                      <span
                        key={userId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                      >
                        {user.name}
                        <button
                          type="button"
                          onClick={() => {
                            setDepartmentFormData(prev => ({
                              ...prev,
                              relatedUsers: prev.relatedUsers.filter(id => id !== userId)
                            }))
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Related Occupation/Specialty Multi-Select */}
            <div className="space-y-2">
              <Label>Related Occupation/Specialty</Label>
              <Popover open={occupationSpecialtiesPopoverOpen} onOpenChange={setOccupationSpecialtiesPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-background"
                  >
                    {departmentFormData.relatedOccupationSpecialties.length > 0
                      ? `${departmentFormData.relatedOccupationSpecialties.length} selected`
                      : "Select occupation/specialty..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-[100001] bg-background border shadow-lg" align="start">
                  <Command shouldFilter={true} className="bg-background">
                    <CommandInput placeholder="Search occupation/specialty..." />
                    <CommandList>
                      <CommandEmpty>No occupation/specialty found.</CommandEmpty>
                      <CommandGroup>
                        {allOccupationSpecialties.map((occSpec) => {
                          const isSelected = departmentFormData.relatedOccupationSpecialties.includes(occSpec.id)
                          return (
                            <CommandItem
                              key={occSpec.id}
                              value={occSpec.displayName}
                              onSelect={() => {
                                // Toggle selection when clicking anywhere on the item
                                setDepartmentFormData(prev => ({
                                  ...prev,
                                  relatedOccupationSpecialties: isSelected
                                    ? prev.relatedOccupationSpecialties.filter(id => id !== occSpec.id)
                                    : [...prev.relatedOccupationSpecialties, occSpec.id]
                                }))
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    setDepartmentFormData(prev => ({
                                      ...prev,
                                      relatedOccupationSpecialties: checked
                                        ? [...prev.relatedOccupationSpecialties, occSpec.id]
                                        : prev.relatedOccupationSpecialties.filter(id => id !== occSpec.id)
                                    }))
                                  }}
                                />
                                <span className="flex-1">
                                  {occSpec.displayName}
                                </span>
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {departmentFormData.relatedOccupationSpecialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {departmentFormData.relatedOccupationSpecialties.map((occSpecId) => {
                    const occSpec = allOccupationSpecialties.find(o => o.id === occSpecId)
                    if (!occSpec) return null
                    return (
                      <span
                        key={occSpecId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                      >
                        {occSpec.displayName}
                        <button
                          type="button"
                          onClick={() => {
                            setDepartmentFormData(prev => ({
                              ...prev,
                              relatedOccupationSpecialties: prev.relatedOccupationSpecialties.filter(id => id !== occSpecId)
                            }))
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDepartmentModalOpen(false)
              setEditingDepartment(null)
              setSelectedLocationId("")
              setDepartmentFormData({
                name: "",
                deptType: "",
                costCentre: "",
                relatedUsers: [],
                relatedOccupationSpecialties: [],
              })
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

