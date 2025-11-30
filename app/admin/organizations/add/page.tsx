"use client"

import { useState, type FormEvent, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Plus, X, MapPin } from "lucide-react"
import { addOrganization, type OrganizationLocation } from "@/lib/organizations-store"
// Note: organizations-store.ts re-exports from admin-local-db.ts which follows the same pattern as local-db.ts

type LocationFormData = {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
}

export default function AddOrganizationPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    description: "",
  })
  const [locations, setLocations] = useState<LocationFormData[]>([
    {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
    },
  ])

  const handleInputChange = (field: keyof typeof formData) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleLocationChange = (index: number, field: keyof LocationFormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setLocations((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: e.target.value }
      return updated
    })
  }

  const addLocation = () => {
    setLocations((prev) => [
      ...prev,
      {
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        email: "",
      },
    ])
  }

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      setLocations((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.phone) {
      pushToast({ title: "Validation Error", description: "Please fill in all required fields (Name, Email, Phone)." })
      return
    }

    const validLocations = locations.filter((loc) => loc.name && loc.address && loc.city && loc.state && loc.zipCode)
    if (validLocations.length === 0) {
      pushToast({ title: "Validation Error", description: "Please add at least one location with all required fields." })
      return
    }

    setIsSubmitting(true)

    try {
      const organizationLocations: OrganizationLocation[] = validLocations.map((loc, idx) => ({
        id: `loc-${Date.now()}-${idx}`,
        name: loc.name,
        address: loc.address,
        city: loc.city,
        state: loc.state,
        zipCode: loc.zipCode,
        phone: loc.phone || undefined,
        email: loc.email || undefined,
        departments: [],
      }))

      const newOrg = addOrganization({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website || undefined,
        industry: formData.industry || undefined,
        description: formData.description || undefined,
        locations: organizationLocations,
      })

      pushToast({ title: "Success", description: `Organization "${newOrg.name}" has been added successfully.` })
      router.push(`/admin/organizations/${newOrg.id}`)
    } catch (error) {
      pushToast({ title: "Error", description: "Failed to add organization. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header
        title="Add Organization"
        subtitle="Create a new organization with multiple locations."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/dashboard" },
          { label: "Add Organization" },
        ]}
      />

      <section className="space-y-6">
        <form onSubmit={handleSubmit}>
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Organization Details</h2>
                <p className="mt-1 text-sm text-muted-foreground">Enter the basic information for the organization.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nova Health"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="contact@organization.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange("phone")}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange("website")}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://organization.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={handleInputChange("industry")}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select industry</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={handleInputChange("description")}
                  rows={3}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Brief description of the organization..."
                />
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Locations</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Add one or more locations for this organization.</p>
                </div>
                <button
                  type="button"
                  onClick={addLocation}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                >
                  <Plus className="h-4 w-4" />
                  Add Location
                </button>
              </div>

              <div className="space-y-4">
                {locations.map((location, index) => (
                  <div key={index} className="rounded-lg border border-border p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Location {index + 1}</span>
                      </div>
                      {locations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Location Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={location.name}
                          onChange={handleLocationChange(index, "name")}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Main Campus"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={location.address}
                          onChange={handleLocationChange(index, "address")}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="123 Main St"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={location.city}
                          onChange={handleLocationChange(index, "city")}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Springfield"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={location.state}
                          onChange={handleLocationChange(index, "state")}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="IL"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          ZIP Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={location.zipCode}
                          onChange={handleLocationChange(index, "zipCode")}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="62701"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                        <input
                          type="tel"
                          value={location.phone}
                          onChange={handleLocationChange(index, "phone")}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                        <input
                          type="email"
                          value={location.email}
                          onChange={handleLocationChange(index, "email")}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="location@organization.com"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="ph5-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Organization"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="ph5-button-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </>
  )
}

