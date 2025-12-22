"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getCurrentOrganization,
  getWorkforceGroupById,
  updateWorkforceGroup,
  type OrganizationWorkforceGroup,
} from "@/lib/organization-local-db"
import { getAllOccupations, getAllSpecialties, getComplianceListItemById } from "@/lib/admin-local-db"
import { getPlacementsByOrganization } from "@/lib/organization-local-db"
import { getWalletTemplatesByOrganization } from "@/lib/organization-local-db"
import { candidates } from "@/lib/mock-data"

export default function WorkforceGroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { pushToast } = useToast()
  const groupId = params.id as string
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [group, setGroup] = useState<OrganizationWorkforceGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  // Form state
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
      loadGroup(groupId)
    }
  }, [groupId])

  const loadGroup = (id: string) => {
    const loadedGroup = getWorkforceGroupById(id)
    if (loadedGroup) {
      setGroup(loadedGroup)
      setFormData({
        name: loadedGroup.name,
        description: loadedGroup.description,
        occupationCodes: loadedGroup.occupationCodes || [],
        specialtyCodes: loadedGroup.specialtyCodes || [],
        complianceTemplateId: loadedGroup.complianceTemplateId || "",
      })
    }
    setLoading(false)
  }

  // Get all available occupations and specialties
  const allOccupations = useMemo(() => getAllOccupations(), [])
  const allSpecialties = useMemo(() => getAllSpecialties(), [])

  // Get available compliance templates
  const complianceTemplates = useMemo(() => {
    if (!currentOrgId) return []
    return getWalletTemplatesByOrganization(currentOrgId)
  }, [currentOrgId])

  // Calculate group statistics
  const stats = useMemo(() => {
    if (!group || !currentOrgId) {
      return { memberCount: 0, occupationCount: 0, compliancePercentage: 0 }
    }

    const placements = getPlacementsByOrganization(currentOrgId)
    const matchingOccupations = allOccupations.filter((occ) =>
      group.occupationCodes.includes(occ.code)
    )

    // Count members (candidates with matching occupations)
    const memberCount = candidates.filter((c) => {
      const candidateRole = c.role.toLowerCase()
      return matchingOccupations.some((occ) =>
        candidateRole.includes(occ.name.toLowerCase()) ||
        candidateRole.includes(occ.code.toLowerCase())
      )
    }).length

    const occupationCount = group.occupationCodes.length

    // Calculate compliance percentage (mock calculation based on candidate documents)
    const groupCandidates = candidates.filter((c) => {
      const candidateRole = c.role.toLowerCase()
      return matchingOccupations.some((occ) =>
        candidateRole.includes(occ.name.toLowerCase()) ||
        candidateRole.includes(occ.code.toLowerCase())
      )
    })

    if (groupCandidates.length === 0) {
      return { memberCount, occupationCount, compliancePercentage: 0 }
    }

    const totalDocs = groupCandidates.reduce((sum, c) => sum + c.documents.length, 0)
    const completedDocs = groupCandidates.reduce(
      (sum, c) => sum + c.documents.filter((d) => d.status === "Completed").length,
      0
    )
    const compliancePercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

    return { memberCount, occupationCount, compliancePercentage }
  }, [group, currentOrgId, allOccupations])

  // Get occupation names
  const occupationNames = useMemo(() => {
    if (!group) return []
    return group.occupationCodes
      .map((code) => {
        const occ = allOccupations.find((o) => o.code === code)
        return occ?.name || code
      })
      .filter(Boolean)
  }, [group, allOccupations])

  // Get specialty names
  const specialtyNames = useMemo(() => {
    if (!group) return []
    return (group.specialtyCodes || [])
      .map((code) => {
        const spec = allSpecialties.find((s) => s.code === code)
        return spec?.name || code
      })
      .filter(Boolean)
  }, [group, allSpecialties])

  // Get compliance template name
  const complianceTemplateName = useMemo(() => {
    if (!group?.complianceTemplateId) return null
    const template = complianceTemplates.find((t) => t.id === group.complianceTemplateId)
    return template?.name || null
  }, [group, complianceTemplates])

  // Get compliance template item count
  const complianceTemplateItemCount = useMemo(() => {
    if (!group?.complianceTemplateId) return 0
    const template = complianceTemplates.find((t) => t.id === group.complianceTemplateId)
    return template?.items?.length || 0
  }, [group, complianceTemplates])

  const handleSave = () => {
    if (!group) return

    if (!formData.name.trim()) {
      pushToast({
        title: "Validation Error",
        description: "Group name is required.",
        type: "error",
      })
      return
    }

    try {
      updateWorkforceGroup(group.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        occupationCodes: formData.occupationCodes,
        specialtyCodes: formData.specialtyCodes.length > 0 ? formData.specialtyCodes : undefined,
        complianceTemplateId: formData.complianceTemplateId || undefined,
      })

      pushToast({
        title: "Success",
        description: "Workforce group updated successfully.",
        type: "success",
      })

      setIsEditing(false)
      loadGroup(groupId)
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to update workforce group.",
        type: "error",
      })
    }
  }

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

  if (loading) {
    return (
      <>
        <Header
          title="Workforce Group"
          subtitle="View and edit workforce group details"
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Workforce", href: "/organization/workforce" },
            { label: "Workforce Groups", href: "/organization/workforce/workforce-groups" },
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

  if (!group) {
    return (
      <>
        <Header
          title="Workforce Group"
          subtitle="Workforce group not found"
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Workforce", href: "/organization/workforce" },
            { label: "Workforce Groups", href: "/organization/workforce/workforce-groups" },
            { label: "Details" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Workforce group not found.</p>
            <Button onClick={() => router.push("/organization/workforce/workforce-groups")} className="mt-4">
              Back to Workforce Groups
            </Button>
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      <Header
        title={isEditing ? "Edit Workforce Group" : group.name}
        subtitle={isEditing ? "Update workforce group details" : group.description}
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Workforce", href: "/organization/workforce" },
          { label: "Workforce Groups", href: "/organization/workforce/workforce-groups" },
          { label: group.name },
        ]}
      />

      <section className="space-y-6">
        {!isEditing ? (
          <>
            <div className="flex justify-end">
              <Button onClick={() => setIsEditing(true)} className="ph5-button-primary">
                <Save className="h-4 w-4 mr-2" />
                Edit Group
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Members</p>
                      <p className="text-2xl font-bold text-foreground">{stats.memberCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Occupations</p>
                      <p className="text-2xl font-bold text-foreground">{stats.occupationCount}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Compliant</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${stats.compliancePercentage}%` }}
                          />
                        </div>
                        <p className="text-sm font-semibold text-foreground">{stats.compliancePercentage}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Occupations</h3>
                <div className="space-y-2">
                  {occupationNames.length > 0 ? (
                    occupationNames.map((name) => (
                      <div key={name} className="p-2 bg-muted/50 rounded-md">
                        <p className="text-sm text-foreground">{name}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No occupations assigned</p>
                  )}
                </div>
              </Card>
            </div>

            {complianceTemplateName && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Compliance Template</h3>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{complianceTemplateName}</p>
                  <p className="text-xs text-muted-foreground">{complianceTemplateItemCount} required items</p>
                </div>
              </Card>
            )}

            {specialtyNames.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {specialtyNames.map((name) => (
                    <span
                      key={name}
                      className="px-3 py-1 bg-muted text-foreground rounded-md text-sm"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : (
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
                  <SelectContent className="bg-background border shadow-lg">
                    <SelectItem value="none">None</SelectItem>
                    {complianceTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setIsEditing(false)
                  loadGroup(groupId)
                }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="ph5-button-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        )}
      </section>
    </>
  )
}


