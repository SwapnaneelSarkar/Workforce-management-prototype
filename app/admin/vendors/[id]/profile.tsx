"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { getVendorById, addVendor, updateVendor, addVendorUser, addVendorDocument, addVendorNote, type Vendor } from "@/lib/admin-local-db"

type VendorProfileProps = {
  vendor: Vendor | null
  vendorId: string
}

const INDUSTRIES = ["Healthcare", "Technology", "Manufacturing", "Finance", "Education", "Other"]
const BUSINESS_CLASSIFICATIONS = [
  "Certified Minority Owned Business",
  "Certified Women Owned Business",
  "Certified Small Business",
  "Certified Veteran Owned Business",
  "Certified Disabled Veteran Owned Business",
]

export default function VendorProfile({ vendor, vendorId }: VendorProfileProps) {
  const router = useRouter()
  const { pushToast } = useToast()
  const [formData, setFormData] = useState({
    name: vendor?.name || "",
    industries: vendor?.industries || [],
    certifiedBusinessClassifications: vendor?.certifiedBusinessClassifications || [],
    aboutVendor: vendor?.aboutVendor || "",
    isActive: vendor?.isActive ?? true,
    taxIdNumber: vendor?.taxIdNumber || "",
    mainPhoneNumber: vendor?.mainPhoneNumber || "",
    website: vendor?.website || "",
    address: vendor?.address || "",
    annualRevenue: vendor?.annualRevenue || "",
    employeeCount: vendor?.employeeCount || undefined,
    internalVendorIdNumber: vendor?.internalVendorIdNumber || "",
    createdDate: vendor?.createdDate || "",
  })

  const [logo, setLogo] = useState(vendor?.logo || null)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const now = new Date()
      const today = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
      
      // Get pending occupations from sessionStorage if adding new vendor
      let occupationIds = vendor?.occupationIds || []
      if (vendorId === "add" && typeof window !== "undefined") {
        const pendingOccupations = sessionStorage.getItem("pendingVendorOccupations")
        if (pendingOccupations) {
          try {
            occupationIds = JSON.parse(pendingOccupations)
            sessionStorage.removeItem("pendingVendorOccupations")
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
      
      const vendorData = {
        ...formData,
        logo,
        occupationIds,
        activationDate: vendor?.activationDate || (formData.isActive ? now.toISOString().split("T")[0] : undefined),
        inactivationDate: vendor?.inactivationDate || (!formData.isActive && vendor?.activationDate ? now.toISOString().split("T")[0] : undefined),
        createdDate: vendor?.createdDate || today,
        internalVendorIdNumber: vendor?.internalVendorIdNumber || `V${Date.now()}`,
      }

      if (vendor) {
        // Update activation/inactivation dates based on status change
        const updatedData = { ...vendorData }
        if (formData.isActive && !vendor.isActive) {
          // Becoming active
          updatedData.activationDate = now.toISOString().split("T")[0]
          updatedData.inactivationDate = undefined
        } else if (!formData.isActive && vendor.isActive) {
          // Becoming inactive
          updatedData.inactivationDate = now.toISOString().split("T")[0]
        }
        
        updateVendor(vendorId, updatedData)
        pushToast({ title: "Success", description: "Vendor profile updated successfully." })
        // Refresh the router to reflect changes
        router.refresh()
      } else {
        const newVendor = addVendor(vendorData)
        
        // Save pending users, documents, and notes if they exist
        if (typeof window !== "undefined") {
          // Save pending users
          const pendingUsers = JSON.parse(sessionStorage.getItem("pendingVendorUsers") || "[]")
          pendingUsers.forEach((user: any) => {
            const { tempId, ...userData } = user
            addVendorUser({ ...userData, vendorId: newVendor.id })
          })
          sessionStorage.removeItem("pendingVendorUsers")
          
          // Save pending documents
          const pendingDocs = JSON.parse(sessionStorage.getItem("pendingVendorDocuments") || "[]")
          pendingDocs.forEach((doc: any) => {
            const { tempId, ...docData } = doc
            addVendorDocument({ ...docData, vendorId: newVendor.id })
          })
          sessionStorage.removeItem("pendingVendorDocuments")
          
          // Save pending notes
          const pendingNotes = JSON.parse(sessionStorage.getItem("pendingVendorNotes") || "[]")
          pendingNotes.forEach((note: any) => {
            const { tempId, ...noteData } = note
            addVendorNote({ ...noteData, vendorId: newVendor.id })
          })
          sessionStorage.removeItem("pendingVendorNotes")
        }
        
        pushToast({ title: "Success", description: "Vendor created successfully." })
        router.push(`/admin/vendors/${newVendor.id}`)
      }
    } catch (error) {
      console.error("Error saving vendor:", error)
      pushToast({ title: "Error", description: "Failed to save vendor profile." })
    } finally {
      setSaving(false)
    }
  }

  const toggleIndustry = (industry: string) => {
    setFormData((prev) => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter((i) => i !== industry)
        : [...prev.industries, industry],
    }))
  }

  const toggleClassification = (classification: string) => {
    setFormData((prev) => ({
      ...prev,
      certifiedBusinessClassifications: prev.certifiedBusinessClassifications.includes(classification)
        ? prev.certifiedBusinessClassifications.filter((c) => c !== classification)
        : [...prev.certifiedBusinessClassifications, classification],
    }))
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Vendor Logo</Label>
              {logo ? (
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {formData.name.substring(0, 4).toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => setLogo(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary">
                  <span className="text-sm text-muted-foreground">Upload Logo</span>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Vendor Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter vendor name"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Industries [Drop Down Multi-Select]
              </Label>
              <div className="space-y-2 border border-border rounded-md p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
                {INDUSTRIES.map((industry) => (
                  <label key={industry} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.industries.includes(industry)}
                      onChange={() => toggleIndustry(industry)}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-foreground">{industry}</span>
                  </label>
                ))}
              </div>
              {formData.industries.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.industries.map((industry) => (
                    <span
                      key={industry}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                    >
                      {industry}
                      <button
                        onClick={() => toggleIndustry(industry)}
                        className="hover:text-primary/70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Certified Business Classifications [Drop Down Multi-Select]
              </Label>
              <div className="space-y-2 border border-border rounded-md p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
                {BUSINESS_CLASSIFICATIONS.map((classification) => (
                  <label key={classification} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.certifiedBusinessClassifications.includes(classification)}
                      onChange={() => toggleClassification(classification)}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-foreground">{classification}</span>
                  </label>
                ))}
              </div>
              {formData.certifiedBusinessClassifications.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.certifiedBusinessClassifications.map((classification) => (
                    <span
                      key={classification}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                    >
                      {classification}
                      <button
                        onClick={() => toggleClassification(classification)}
                        className="hover:text-primary/70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">About Vendor</Label>
              <Textarea
                value={formData.aboutVendor}
                onChange={(e) => setFormData({ ...formData, aboutVendor: e.target.value })}
                placeholder="Description of the vendor..."
                rows={6}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-2 mb-4">
              <Label className="text-sm font-medium text-foreground">Active</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Tax ID Number</Label>
              <Input
                value={formData.taxIdNumber}
                onChange={(e) => setFormData({ ...formData, taxIdNumber: e.target.value })}
                placeholder="83-738893"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Main Phone Number</Label>
              <Input
                value={formData.mainPhoneNumber}
                onChange={(e) => setFormData({ ...formData, mainPhoneNumber: e.target.value })}
                placeholder="602-908-1234"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Website</Label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="www.novahealth.com"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Main Campus - 994 Tustin Avenue, Seattle, WA"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Annual Revenue</Label>
              <Input
                value={formData.annualRevenue}
                onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                placeholder="$25,000,000"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Employee Count</Label>
              <Input
                type="number"
                value={formData.employeeCount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, employeeCount: e.target.value ? parseInt(e.target.value) : undefined })
                }
                placeholder="300"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Internal Vendor ID Number</Label>
              <Input
                value={formData.internalVendorIdNumber}
                onChange={(e) => setFormData({ ...formData, internalVendorIdNumber: e.target.value })}
                placeholder="12345678"
                readOnly
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Created Date</Label>
              <Input
                value={formData.createdDate}
                onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })}
                placeholder="11/30/2025"
                readOnly
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => router.push("/admin/vendors")}
                className="px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name}
                className="ph5-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
