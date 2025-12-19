"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getCurrentOrganization,
  addWorkforceGroup,
} from "@/lib/organization-local-db"
import { getAllOccupations, getAllSpecialties } from "@/lib/admin-local-db"
import { getWalletTemplatesByOrganization } from "@/lib/organization-local-db"

export default function CreateWorkforceGroupPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    occupationCodes: [] as string[],
    specialtyCodes: [] as string[],
    complianceTemplateId: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orgId = getCurrentOrganization()
      setCurrentOrgId(orgId)
    }
  }, [])

  const allOccupations = getAllOccupations()
  const allSpecialties = getAllSpecialties()
  const complianceTemplates = currentOrgId ? getWalletTemplatesByOrganization(currentOrgId) : []

  const toggleOccupation = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      occupationCodes: prev.occupationCodes.includes(code)
        ? prev.occupationCodes.filter((c) => c !== code)
        : [...prev.occupationCodes, code],
    }))
  }

  const toggleSpecialty = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      specialtyCodes: prev.specialtyCodes.includes(code)
        ? prev.specialtyCodes.filter((c) => c !== code)
        : [...prev.specialtyCodes, code],
    }))
  }

  const handleSave = () => {
    if (!currentOrgId) {
      pushToast({
        title: "Error",
        description: "No organization selected.",
        type: "error",
      })
      return
    }

    if (!formData.name.trim()) {
      pushToast({
        title: "Validation Error",
        description: "Group name is required.",
        type: "error",
      })
      return
    }

    if (formData.occupationCodes.length === 0) {
      pushToast({
        title: "Validation Error",
        description: "Please select at least one occupation.",
        type: "error",
      })
      return
    }

    try {
      const newGroup = addWorkforceGroup(currentOrgId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        occupationCodes: formData.occupationCodes,
        specialtyCodes: formData.specialtyCodes.length > 0 ? formData.specialtyCodes : undefined,
        complianceTemplateId: formData.complianceTemplateId || undefined,
      })

      pushToast({
        title: "Success",
        description: "Workforce group created successfully.",
        type: "success",
      })

      router.push(`/organization/workforce/workforce-groups/${newGroup.id}`)
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to create workforce group.",
        type: "error",
      })
    }
  }

  return (
    <>
      <Header
        title="Create Workforce Group"
        subtitle="Organize workers by role and specialty"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Workforce", href: "/organization/workforce" },
          { label: "Workforce Groups", href: "/organization/workforce/workforce-groups" },
          { label: "Create" },
        ]}
      />

      <section className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Group Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter group name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter group description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Occupations *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border border-border rounded-lg max-h-[200px] overflow-y-auto">
                {allOccupations.map((occ) => (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => toggleOccupation(occ.code)}
                    className={cn(
                      "p-2 text-left rounded-md border transition-colors text-sm",
                      formData.occupationCodes.includes(occ.code)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:bg-muted/50 text-foreground"
                    )}
                  >
                    {occ.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Specialties (Optional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border border-border rounded-lg max-h-[200px] overflow-y-auto">
                {allSpecialties.map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => toggleSpecialty(spec.code)}
                    className={cn(
                      "p-2 text-left rounded-md border transition-colors text-sm",
                      formData.specialtyCodes.includes(spec.code)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:bg-muted/50 text-foreground"
                    )}
                  >
                    {spec.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complianceTemplate">Compliance Template</Label>
              <Select
                value={formData.complianceTemplateId}
                onValueChange={(value) => setFormData({ ...formData, complianceTemplateId: value })}
              >
                <SelectTrigger id="complianceTemplate" className="w-full bg-background">
                  <SelectValue placeholder="Select a compliance template (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="">None</SelectItem>
                  {complianceTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="ph5-button-primary">
                <Save className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}
