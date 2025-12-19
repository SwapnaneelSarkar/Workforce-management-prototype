"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Phone, MapPin } from "lucide-react"
import {
  getCurrentOrganization,
} from "@/lib/organization-local-db"
import {
  getOrganizationById,
  addDepartment,
  removeDepartment,
  updateDepartment,
  updateOrganization,
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

export default function LocationsDepartmentsPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [locations, setLocations] = useState<OrganizationLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"locations" | "departments">("locations")
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<OrganizationLocation | null>(null)
  const [editingDepartment, setEditingDepartment] = useState<{ locationId: string; department: Department } | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string>("")

  // Form state
  const [locationFormData, setLocationFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    locationType: "Outpatient",
  })

  const [departmentFormData, setDepartmentFormData] = useState({
    name: "",
    deptType: "",
    costCentre: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orgId = getCurrentOrganization()
      setCurrentOrgId(orgId)
      loadOrganization(orgId)
    }
  }, [])

  const loadOrganization = (organizationId: string | null) => {
    if (!organizationId) {
      setLoading(false)
      return
    }

    // Get organization from admin-local-db
    try {
      const org = getOrganizationById(organizationId)
      if (org) {
        setOrganization(org)
        let orgLocations = org.locations || []
        
        // If no locations exist, create and save mock data
        if (orgLocations.length === 0) {
          const mockLocations = createMockLocations(organizationId)
          // Save mock locations to organization
          updateOrganization(organizationId, {
            locations: mockLocations,
          })
          orgLocations = mockLocations
        }
        
        setLocations(orgLocations)
      }
    } catch (error) {
      console.warn("Failed to load organization:", error)
    }
    setLoading(false)
  }

  const createMockLocations = (organizationId: string): OrganizationLocation[] => {
    const baseTimestamp = Date.now()
    let deptCounter = 1
    
    const mockLocations: OrganizationLocation[] = [
      {
        id: `loc-${baseTimestamp}-1`,
        name: "CHP Administration",
        address: "444 Stockbridge Rd",
        city: "Great Barrington",
        state: "MA",
        zipCode: "01230",
        phone: "(413) 528-9311",
        locationType: "Outpatient",
        departments: [],
      },
      {
        id: `loc-${baseTimestamp}-2`,
        name: "Barrington OB/GYN",
        address: "27 Lewis Ave",
        city: "Great Barrington",
        state: "MA",
        zipCode: "01230",
        phone: "(413) 528-1470",
        locationType: "Outpatient",
        departments: [
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "Obstetrics & Gynecology",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: `loc-${baseTimestamp}-3`,
        name: "Berkshire Pediatrics",
        address: "777 North St",
        city: "Pittsfield",
        state: "MA",
        zipCode: "01201",
        phone: "(413) 499-8531",
        locationType: "Outpatient",
        departments: [
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "Pediatrics",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "Pediatric Cardiology",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: `loc-${baseTimestamp}-4`,
        name: "Great Barrington Family Dental",
        address: "444 Stockbridge Rd",
        city: "Great Barrington",
        state: "MA",
        zipCode: "01230",
        phone: "(413) 528-5565",
        locationType: "Outpatient",
        departments: [
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "General Dentistry",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "Orthodontics",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: `loc-${baseTimestamp}-5`,
        name: "Great Barrington Health Center",
        address: "444 Stockbridge Rd",
        city: "Great Barrington",
        state: "MA",
        zipCode: "01230",
        phone: "(413) 528-8580",
        locationType: "Outpatient",
        departments: [
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "Family Medicine",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "Pediatrics",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "Internal Medicine",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: `loc-${baseTimestamp}-6`,
        name: "Lee Family Practice",
        address: "11 Quarry Hill Rd",
        city: "Lee",
        state: "MA",
        zipCode: "01238",
        phone: "(413) 243-0536",
        locationType: "Outpatient",
        departments: [
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "Family Medicine",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: `loc-${baseTimestamp}-7`,
        name: "Neighborhood Health Center",
        address: "510 North St",
        city: "Pittsfield",
        state: "MA",
        zipCode: "01201",
        phone: "(413) 447-2351",
        locationType: "Outpatient",
        departments: [
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "Primary Care",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "Behavioral Health",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "Women's Health",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: `loc-${baseTimestamp}-8`,
        name: "Neighborhood Dental Center",
        address: "510 North St",
        city: "Pittsfield",
        state: "MA",
        zipCode: "01201",
        phone: "(413) 447-2781",
        locationType: "Outpatient",
        departments: [
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "General Dentistry",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: `loc-${baseTimestamp}-9`,
        name: "Adams Family Medicine",
        address: "19 Depot St",
        city: "Adams",
        state: "MA",
        zipCode: "01220",
        phone: "(413) 664-4088",
        locationType: "Outpatient",
        departments: [
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "Family Medicine",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: `dept-${baseTimestamp}-${deptCounter++}`,
            name: "Urgent Care",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: `loc-${baseTimestamp}-10`,
        name: "Family Services & WIC",
        address: "442 Stockbridge Rd",
        city: "Great Barrington",
        state: "MA",
        zipCode: "01230",
        phone: "(413) 528-0457",
        locationType: "Outpatient",
        departments: [],
      },
    ]

    return mockLocations
  }

  // Calculate total departments and employee counts
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

  // Calculate employee counts (mock calculation - deterministic based on department name)
  const departmentEmployeeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allDepartments.forEach((dept) => {
      // Deterministic employee count based on department name hash
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
      // Add small variation based on hash for consistency
      const variation = (nameHash % 5) - 2 // -2 to +2
      counts[dept.id] = Math.max(3, baseCount + variation)
    })
    return counts
  }, [allDepartments])

  const handleAddLocation = () => {
    setEditingLocation(null)
    setLocationFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      locationType: "Outpatient",
    })
    setIsLocationModalOpen(true)
  }

  const handleEditLocation = (location: OrganizationLocation) => {
    setEditingLocation(location)
    setLocationFormData({
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      zipCode: location.zipCode,
      phone: location.phone || "",
      locationType: location.locationType || "Outpatient",
    })
    setIsLocationModalOpen(true)
  }

  const handleSaveLocation = () => {
    if (!currentOrgId || !organization) {
      pushToast({
        title: "Error",
        description: "No organization selected.",
        type: "error",
      })
      return
    }

    if (!locationFormData.name || !locationFormData.address || !locationFormData.city || !locationFormData.state || !locationFormData.zipCode) {
      pushToast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        type: "error",
      })
      return
    }

    try {
      if (editingLocation) {
        // Update existing location
        const updatedLocations = organization.locations.map((loc: OrganizationLocation) =>
          loc.id === editingLocation.id
            ? {
                ...loc,
                name: locationFormData.name,
                address: locationFormData.address,
                city: locationFormData.city,
                state: locationFormData.state,
                zipCode: locationFormData.zipCode,
                phone: locationFormData.phone || undefined,
                locationType: locationFormData.locationType,
              }
            : loc
        )

        updateOrganization(currentOrgId, {
          locations: updatedLocations,
        })

        pushToast({
          title: "Success",
          description: "Location updated successfully.",
          type: "success",
        })
      } else {
        // Add new location
        const newLocation: OrganizationLocation = {
          id: `loc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: locationFormData.name,
          address: locationFormData.address,
          city: locationFormData.city,
          state: locationFormData.state,
          zipCode: locationFormData.zipCode,
          phone: locationFormData.phone || undefined,
          locationType: locationFormData.locationType,
          departments: [],
        }

        updateOrganization(currentOrgId, {
          locations: [...organization.locations, newLocation],
        })

        pushToast({
          title: "Success",
          description: "Location added successfully.",
          type: "success",
        })
      }

      setIsLocationModalOpen(false)
      setEditingLocation(null)
      loadOrganization(currentOrgId)
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to save location.",
        type: "error",
      })
    }
  }

  const handleDeleteLocation = (id: string) => {
    if (!currentOrgId || !organization) {
      pushToast({
        title: "Error",
        description: "No organization selected.",
        type: "error",
      })
      return
    }

    if (!confirm("Are you sure you want to delete this location?")) {
      return
    }

    try {
      const updatedLocations = organization.locations.filter((loc: OrganizationLocation) => loc.id !== id)
      updateOrganization(currentOrgId, {
        locations: updatedLocations,
      })

      pushToast({
        title: "Success",
        description: "Location deleted successfully.",
        type: "success",
      })
      loadOrganization(currentOrgId)
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to delete location.",
        type: "error",
      })
    }
  }

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
          loadOrganization(currentOrgId)
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
          loadOrganization(currentOrgId)
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
        loadOrganization(currentOrgId)
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
      <>
        <Header
          title="Locations & Departments"
          subtitle="Manage organizational structure across CHP Berkshires network"
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Workforce", href: "/organization/workforce" },
            { label: "Locations & Departments" },
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

  return (
    <>
      <Header
        title="Locations & Departments"
        subtitle="Manage organizational structure across CHP Berkshires network"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Workforce", href: "/organization/workforce" },
          { label: "Locations & Departments" },
        ]}
      />

      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "locations" ? "default" : "outline"}
            onClick={() => setActiveTab("locations")}
          >
            Locations ({locations.length})
          </Button>
          <Button
            variant={activeTab === "departments" ? "default" : "outline"}
            onClick={() => setActiveTab("departments")}
          >
            Departments ({allDepartments.length})
          </Button>
        </div>

        {activeTab === "locations" && (
          <>
            <div className="flex justify-end">
              <Button onClick={handleAddLocation} className="ph5-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => (
                <Card key={location.id} className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">{location.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span className="px-2 py-0.5 bg-muted rounded text-xs">{location.locationType || "Outpatient"}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLocation(location)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLocation(location.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-foreground">
                          {location.address}, {location.city}, {location.state} {location.zipCode}
                        </span>
                      </div>
                      {location.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{location.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {locations.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground mb-4">No locations found.</p>
                  <Button onClick={handleAddLocation} className="ph5-button-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "departments" && (
          <>
            <div className="flex justify-end">
              <div className="flex gap-2">
                <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                  <SelectTrigger className="w-[250px] bg-background">
                    <SelectValue placeholder="Select location first" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
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
                    disabled={!selectedLocationId}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Location Modal */}
      <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLocation ? "Edit Location" : "Add Location"}</DialogTitle>
            <DialogDescription>
              {editingLocation ? "Update location details below." : "Add a new location to your organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="loc-name">Location Name *</Label>
              <Input
                id="loc-name"
                value={locationFormData.name}
                onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                placeholder="Enter location name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc-address">Address *</Label>
              <Input
                id="loc-address"
                value={locationFormData.address}
                onChange={(e) => setLocationFormData({ ...locationFormData, address: e.target.value })}
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loc-city">City *</Label>
                <Input
                  id="loc-city"
                  value={locationFormData.city}
                  onChange={(e) => setLocationFormData({ ...locationFormData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc-state">State *</Label>
                <Input
                  id="loc-state"
                  value={locationFormData.state}
                  onChange={(e) => setLocationFormData({ ...locationFormData, state: e.target.value })}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc-zip">Zip Code *</Label>
                <Input
                  id="loc-zip"
                  value={locationFormData.zipCode}
                  onChange={(e) => setLocationFormData({ ...locationFormData, zipCode: e.target.value })}
                  placeholder="Zip code"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loc-phone">Phone</Label>
                <Input
                  id="loc-phone"
                  value={locationFormData.phone}
                  onChange={(e) => setLocationFormData({ ...locationFormData, phone: e.target.value })}
                  placeholder="(413) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc-type">Location Type</Label>
                <Select
                  value={locationFormData.locationType}
                  onValueChange={(value) => setLocationFormData({ ...locationFormData, locationType: value })}
                >
                  <SelectTrigger id="loc-type" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="Outpatient">Outpatient</SelectItem>
                    <SelectItem value="Inpatient">Inpatient</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsLocationModalOpen(false)
              setEditingLocation(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveLocation} className="ph5-button-primary">
              {editingLocation ? "Update" : "Add"} Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
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
    </>
  )
}
