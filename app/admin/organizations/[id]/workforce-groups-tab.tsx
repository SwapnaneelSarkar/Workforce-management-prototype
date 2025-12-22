"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2 } from "lucide-react"
import {
  getWorkforceGroupsByOrganization,
  addWorkforceGroup,
  updateWorkforceGroup,
  deleteWorkforceGroup,
  type OrganizationWorkforceGroup,
} from "@/lib/organization-local-db"
import { getAllOccupations, getAllSpecialties } from "@/lib/admin-local-db"
import { getWalletTemplatesByOrganization } from "@/lib/organization-local-db"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type WorkforceGroupsTabProps = {
  organizationId: string
}

export default function WorkforceGroupsTab({ organizationId }: WorkforceGroupsTabProps) {
  const { pushToast } = useToast()
  const [groups, setGroups] = useState<OrganizationWorkforceGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<OrganizationWorkforceGroup | null>(null)

  // Form state
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    description: "",
    occupationCodes: [] as string[],
    specialtyCodes: [] as string[],
    complianceTemplateId: "",
  })

  const allOccupations = getAllOccupations()
  const allSpecialties = getAllSpecialties()
  const complianceTemplates = getWalletTemplatesByOrganization(organizationId)

  useEffect(() => {
    loadGroups()
  }, [organizationId])

  const loadGroups = () => {
    try {
      let orgGroups = getWorkforceGroupsByOrganization(organizationId)
      
      // If no groups exist, create mock data
      if (orgGroups.length === 0) {
        const mockGroups = createMockWorkforceGroups(organizationId)
        orgGroups = mockGroups
      }
      
      setGroups(orgGroups)
    } catch (error) {
      console.warn("Failed to load workforce groups:", error)
    }
    setLoading(false)
  }

  const createMockWorkforceGroups = (orgId: string): OrganizationWorkforceGroup[] => {
    const mockGroups: OrganizationWorkforceGroup[] = [
      {
        id: `wf-group-${Date.now()}-1`,
        organizationId: orgId,
        name: "Nursing Staff",
        description: "All nursing positions including RN, LPN, and CNA",
        occupationCodes: ["RN", "LPN", "CNA"],
        specialtyCodes: ["ICU", "Emergency", "Pediatrics", "Surgery"],
        complianceTemplateId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `wf-group-${Date.now()}-2`,
        organizationId: orgId,
        name: "Rehabilitation Team",
        description: "Physical and occupational therapy staff",
        occupationCodes: ["PT", "OT", "PTA"],
        specialtyCodes: [],
        complianceTemplateId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `wf-group-${Date.now()}-3`,
        organizationId: orgId,
        name: "Medical Support",
        description: "Medical assistants and administrative support",
        occupationCodes: ["MA", "MS"],
        specialtyCodes: [],
        complianceTemplateId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `wf-group-${Date.now()}-4`,
        organizationId: orgId,
        name: "Emergency Services",
        description: "Emergency department and critical care staff",
        occupationCodes: ["RN", "MD", "PA"],
        specialtyCodes: ["Emergency", "ICU", "Trauma"],
        complianceTemplateId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `wf-group-${Date.now()}-5`,
        organizationId: orgId,
        name: "Surgical Team",
        description: "Operating room and perioperative staff",
        occupationCodes: ["RN", "ST", "CRNA"],
        specialtyCodes: ["Surgery", "Anesthesia"],
        complianceTemplateId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    // Save mock groups to localDB
    const existingGroups = getWorkforceGroupsByOrganization(orgId)
    if (existingGroups.length === 0) {
      mockGroups.forEach((group) => {
        try {
          const { id, createdAt, updatedAt, ...groupData } = group
          addWorkforceGroup(orgId, groupData)
        } catch (error) {
          console.warn("Failed to create mock workforce group:", error)
        }
      })
      return getWorkforceGroupsByOrganization(orgId)
    }

    return mockGroups
  }

  // Calculate group statistics
  const groupStats = useMemo(() => {
    return groups.reduce((acc, group) => {
      const occupationCount = group.occupationCodes.length
      const specialtyCount = group.specialtyCodes?.length || 0
      const compliancePercentage = Math.floor(75 + Math.random() * 20)

      acc[group.id] = {
        occupationCount,
        specialtyCount,
        compliancePercentage,
      }
      return acc
    }, {} as Record<string, { occupationCount: number; specialtyCount: number; compliancePercentage: number }>)
  }, [groups])

  const toggleOccupation = (code: string) => {
    setGroupFormData((prev) => ({
      ...prev,
      occupationCodes: prev.occupationCodes.includes(code)
        ? prev.occupationCodes.filter((c) => c !== code)
        : [...prev.occupationCodes, code],
    }))
  }

  const toggleSpecialty = (code: string) => {
    setGroupFormData((prev) => ({
      ...prev,
      specialtyCodes: prev.specialtyCodes.includes(code)
        ? prev.specialtyCodes.filter((c) => c !== code)
        : [...prev.specialtyCodes, code],
    }))
  }

  const handleAddGroup = () => {
    setEditingGroup(null)
    setGroupFormData({
      name: "",
      description: "",
      occupationCodes: [],
      specialtyCodes: [],
      complianceTemplateId: "none",
    })
    setIsGroupModalOpen(true)
  }

  const handleEditGroup = (group: OrganizationWorkforceGroup) => {
    setEditingGroup(group)
    setGroupFormData({
      name: group.name,
      description: group.description || "",
      occupationCodes: group.occupationCodes || [],
      specialtyCodes: group.specialtyCodes || [],
      complianceTemplateId: group.complianceTemplateId || "none",
    })
    setIsGroupModalOpen(true)
  }

  const handleSaveGroup = () => {
    if (!groupFormData.name.trim()) {
      pushToast({
        title: "Validation Error",
        description: "Group name is required.",
        type: "error",
      })
      return
    }

    if (groupFormData.occupationCodes.length === 0) {
      pushToast({
        title: "Validation Error",
        description: "Please select at least one occupation.",
        type: "error",
      })
      return
    }

    try {
      if (editingGroup) {
        // Update existing group
        const updated = updateWorkforceGroup(editingGroup.id, {
          name: groupFormData.name.trim(),
          description: groupFormData.description.trim(),
          occupationCodes: groupFormData.occupationCodes,
          specialtyCodes: groupFormData.specialtyCodes.length > 0 ? groupFormData.specialtyCodes : undefined,
          complianceTemplateId: groupFormData.complianceTemplateId && groupFormData.complianceTemplateId !== "none" ? groupFormData.complianceTemplateId : undefined,
        })

        if (updated) {
          pushToast({
            title: "Success",
            description: "Workforce group updated successfully.",
            type: "success",
          })
          loadGroups()
        } else {
          pushToast({
            title: "Error",
            description: "Failed to update workforce group.",
            type: "error",
          })
        }
      } else {
        // Add new group
        const newGroup = addWorkforceGroup(organizationId, {
          name: groupFormData.name.trim(),
          description: groupFormData.description.trim(),
          occupationCodes: groupFormData.occupationCodes,
          specialtyCodes: groupFormData.specialtyCodes.length > 0 ? groupFormData.specialtyCodes : undefined,
          complianceTemplateId: groupFormData.complianceTemplateId && groupFormData.complianceTemplateId !== "none" ? groupFormData.complianceTemplateId : undefined,
        })

        pushToast({
          title: "Success",
          description: "Workforce group created successfully.",
          type: "success",
        })
        loadGroups()
      }

      setIsGroupModalOpen(false)
      setEditingGroup(null)
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to save workforce group.",
        type: "error",
      })
    }
  }

  const handleDeleteGroup = (id: string) => {
    if (!confirm("Are you sure you want to delete this workforce group?")) {
      return
    }

    try {
      const success = deleteWorkforceGroup(id)
      if (success) {
        pushToast({
          title: "Success",
          description: "Workforce group deleted successfully.",
          type: "success",
        })
        loadGroups()
      } else {
        pushToast({
          title: "Error",
          description: "Failed to delete workforce group.",
          type: "error",
        })
      }
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to delete workforce group.",
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
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Workforce Groups</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {loading ? "Loading..." : `${groups.length} ${groups.length === 1 ? "group" : "groups"}`}
              </p>
            </div>
            <Button onClick={handleAddGroup} className="ph5-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Workforce Group
            </Button>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No workforce groups yet. Create one to get started.</p>
              <Button onClick={handleAddGroup} className="ph5-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Workforce Group
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Occupations</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Specialties</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => {
                    const stats = groupStats[group.id] || { occupationCount: 0, specialtyCount: 0, compliancePercentage: 0 }
                    const occupationNames = group.occupationCodes
                      .map((code) => {
                        const occ = allOccupations.find((o) => o.code === code)
                        return occ?.name || code
                      })
                      .filter(Boolean)
                    const specialtyNames = (group.specialtyCodes || [])
                      .map((code) => {
                        const spec = allSpecialties.find((s) => s.code === code)
                        return spec?.name || code
                      })
                      .filter(Boolean)

                    return (
                      <tr key={group.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-foreground">{group.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">{group.description || "—"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {occupationNames.length > 0 ? (
                              <>
                                {occupationNames.slice(0, 2).map((name, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-muted rounded text-xs text-foreground">
                                    {name}
                                  </span>
                                ))}
                                {occupationNames.length > 2 && (
                                  <span className="px-2 py-0.5 text-xs text-muted-foreground">
                                    +{occupationNames.length - 2}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {specialtyNames.length > 0 ? (
                              <>
                                {specialtyNames.slice(0, 2).map((name, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-muted rounded text-xs text-foreground">
                                    {name}
                                  </span>
                                ))}
                                {specialtyNames.length > 2 && (
                                  <span className="px-2 py-0.5 text-xs text-muted-foreground">
                                    +{specialtyNames.length - 2}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="p-2 rounded-md hover:bg-muted transition-colors"
                              onClick={() => handleEditGroup(group)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button
                              type="button"
                              className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                              onClick={() => handleDeleteGroup(group.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Workforce Group Modal */}
      <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Edit Workforce Group" : "Add Workforce Group"}</DialogTitle>
            <DialogDescription>
              {editingGroup ? "Update workforce group details below." : "Create a new workforce group to organize workers by role and specialty."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name *</Label>
              <Input
                id="group-name"
                value={groupFormData.name}
                onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                placeholder="Enter group name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-description">Description</Label>
              <Textarea
                id="group-description"
                value={groupFormData.description}
                onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
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
                      groupFormData.occupationCodes.includes(occ.code)
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
                      groupFormData.specialtyCodes.includes(spec.code)
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
                value={groupFormData.complianceTemplateId}
                onValueChange={(value) => setGroupFormData({ ...groupFormData, complianceTemplateId: value })}
              >
                <SelectTrigger id="complianceTemplate" className="w-full bg-background">
                  <SelectValue placeholder="Select a compliance template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {complianceTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsGroupModalOpen(false)
              setEditingGroup(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveGroup} className="ph5-button-primary">
              {editingGroup ? "Update" : "Create"} Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

