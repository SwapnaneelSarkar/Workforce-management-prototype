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
      <div className="flex justify-end">
        <Button onClick={handleAddGroup} className="ph5-button-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const stats = groupStats[group.id] || { occupationCount: 0, specialtyCount: 0, compliancePercentage: 0 }
          const occupationNames = group.occupationCodes
            .map((code) => {
              const occ = allOccupations.find((o) => o.code === code)
              return occ?.name || code
            })
            .filter(Boolean)

          return (
            <Card key={group.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditGroup(group)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{stats.occupationCount}</span>
                    <span>occupations</span>
                    {stats.specialtyCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-foreground">{stats.specialtyCount}</span>
                        <span>specialties</span>
                      </>
                    )}
                  </div>
                  {occupationNames.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {occupationNames.slice(0, 3).map((name, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-muted rounded text-xs text-foreground">
                          {name}
                        </span>
                      ))}
                      {occupationNames.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-muted-foreground">
                          +{occupationNames.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}

        {groups.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground mb-4">No workforce groups yet.</p>
            <Button onClick={handleAddGroup} className="ph5-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </div>
        )}
      </div>

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

