"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Phone, MapPin } from "lucide-react"
import {
  getOrganizationById,
  updateOrganization,
  type OrganizationLocation,
} from "@/lib/organizations-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type LocationsTabProps = {
  organizationId: string
}

export default function LocationsTab({ organizationId }: LocationsTabProps) {
  const { pushToast } = useToast()
  const [organization, setOrganization] = useState<any>(null)
  const [locations, setLocations] = useState<OrganizationLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<OrganizationLocation | null>(null)

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
    if (!organization) {
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

        updateOrganization(organizationId, {
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

        updateOrganization(organizationId, {
          locations: [...(organization.locations || []), newLocation],
        })

        pushToast({
          title: "Success",
          description: "Location added successfully.",
          type: "success",
        })
      }

      setIsLocationModalOpen(false)
      setEditingLocation(null)
      loadOrganization()
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to save location.",
        type: "error",
      })
    }
  }

  const handleDeleteLocation = (id: string) => {
    if (!organization) {
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
      updateOrganization(organizationId, {
        locations: updatedLocations,
      })

      pushToast({
        title: "Success",
        description: "Location deleted successfully.",
        type: "success",
      })
      loadOrganization()
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to delete location.",
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
                  <SelectContent>
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
    </div>
  )
}

