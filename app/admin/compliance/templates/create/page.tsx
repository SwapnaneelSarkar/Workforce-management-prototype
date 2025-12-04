"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header, Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/system"
import {
  getActiveOccupations,
  getAllSpecialties,
  getOccupationSpecialtiesByOccupation,
  addAdminWalletTemplate,
  type Occupation,
  type Specialty,
} from "@/lib/admin-local-db"

export default function CreateAdminWalletTemplatePage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [templateName, setTemplateName] = useState("")
  const [occupationId, setOccupationId] = useState<string>("")
  const [specialtyId, setSpecialtyId] = useState<string>("")
  const [occupations, setOccupations] = useState<Occupation[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [availableSpecialties, setAvailableSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const occs = getActiveOccupations()
        setOccupations(occs)
        const specs = getAllSpecialties()
        setSpecialties(specs)
      } catch (error) {
        console.warn("Failed to load occupations/specialties", error)
      }
    }
  }, [])

  useEffect(() => {
    if (occupationId) {
      // Get specialties for this occupation
      const occSpecialties = getOccupationSpecialtiesByOccupation(occupationId)
      const specialtyIds = occSpecialties.map((os) => os.specialtyId)
      const filtered = specialties.filter((s) => specialtyIds.includes(s.id))
      setAvailableSpecialties(filtered)
      // Reset specialty if it's not available for this occupation
      if (specialtyId && !specialtyIds.includes(specialtyId)) {
        setSpecialtyId("")
      }
    } else {
      setAvailableSpecialties([])
      setSpecialtyId("")
    }
  }, [occupationId, specialties, specialtyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!templateName.trim()) {
      pushToast({ title: "Validation Error", description: "Template name is required." })
      return
    }

    if (!occupationId) {
      pushToast({ title: "Validation Error", description: "Occupation is required." })
      return
    }

    setLoading(true)
    try {
      const occupation = occupations.find((occ) => occ.id === occupationId)
      const template = addAdminWalletTemplate({
        name: templateName.trim(),
        occupationId,
        occupationCode: occupation?.code,
        specialtyId: specialtyId || undefined,
        specialtyCode: specialtyId
          ? specialties.find((s) => s.id === specialtyId)?.code
          : undefined,
        listItemIds: [],
        isActive: true,
      })
      pushToast({ title: "Success", description: "Wallet template created successfully." })
      router.push(`/admin/compliance/templates/${template.id}`)
    } catch (error) {
      console.error("Failed to create template:", error)
      pushToast({ title: "Error", description: "Failed to create template. Please try again." })
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Create Document Wallet Template"
        subtitle="Create a new universal compliance template for by job title."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Compliance Wallet", href: "/admin/compliance/templates" },
          { label: "Create Template" },
        ]}
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="templateName" className="text-sm font-semibold text-foreground">
              Template Name
            </Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., ICU Core Requirements"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation" className="text-sm font-semibold text-foreground">
              Occupation/Specialty <span className="text-destructive">*</span>
            </Label>
            <select
              id="occupation"
              value={occupationId}
              onChange={(e) => setOccupationId(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select occupation</option>
              {occupations.map((occ) => (
                <option key={occ.id} value={occ.id}>
                  {occ.name} ({occ.code})
                </option>
              ))}
            </select>
            <p className="text-xs text-destructive mt-1">
              Can this be joined in one field from a join table? Needs to be based on specialty not department.
            </p>
          </div>

          {occupationId && availableSpecialties.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="specialty" className="text-sm font-semibold text-foreground">
                Specialty (Optional)
              </Label>
              <select
                id="specialty"
                value={specialtyId}
                onChange={(e) => setSpecialtyId(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select specialty (optional)</option>
                {availableSpecialties.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name} ({spec.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              className="ph5-button-secondary"
              onClick={() => router.push("/admin/compliance/templates")}
            >
              Cancel
            </button>
            <button type="submit" className="ph5-button-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Template"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
