"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
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
    modality: "",
    name: "",
    limitShiftVisibility: false,
    shiftVisibilityHours: undefined as number | undefined,
    routingPosition: 1,
    isActive: true,
  })

  const MODALITY_OPTIONS = ["Clinical", "Support Services", "Administrative", "Technical"]

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
        modality: "Clinical",
        name: "Permanent - Full Time",
        limitShiftVisibility: false,
        shiftVisibilityHours: undefined,
        routingPosition: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `wf-group-${Date.now()}-2`,
        organizationId: orgId,
        modality: "Clinical",
        name: "Permanent - Part Time",
        limitShiftVisibility: true,
        shiftVisibilityHours: 24,
        routingPosition: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `wf-group-${Date.now()}-3`,
        organizationId: orgId,
        modality: "Clinical",
        name: "Contract - Internal Float Pool",
        limitShiftVisibility: true,
        shiftVisibilityHours: 48,
        routingPosition: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `wf-group-${Date.now()}-4`,
        organizationId: orgId,
        modality: "Clinical",
        name: "External - EOR",
        limitShiftVisibility: true,
        shiftVisibilityHours: 72,
        routingPosition: 4,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `wf-group-${Date.now()}-5`,
        organizationId: orgId,
        modality: "Clinical",
        name: "External - Per Diem Vendors",
        limitShiftVisibility: true,
        shiftVisibilityHours: 96,
        routingPosition: 5,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `wf-group-${Date.now()}-6`,
        organizationId: orgId,
        modality: "Clinical",
        name: "External - LTO Vendor",
        limitShiftVisibility: true,
        shiftVisibilityHours: 120,
        routingPosition: 6,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `wf-group-${Date.now()}-7`,
        organizationId: orgId,
        modality: "Support Services",
        name: "Permanent - Full Time",
        limitShiftVisibility: false,
        shiftVisibilityHours: undefined,
        routingPosition: 1,
        isActive: true,
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


  const handleAddGroup = () => {
    setEditingGroup(null)
    setGroupFormData({
      modality: "",
      name: "",
      limitShiftVisibility: false,
      shiftVisibilityHours: undefined,
      routingPosition: 1,
      isActive: true,
    })
    setIsGroupModalOpen(true)
  }

  const handleEditGroup = (group: OrganizationWorkforceGroup) => {
    setEditingGroup(group)
    setGroupFormData({
      modality: group.modality,
      name: group.name,
      limitShiftVisibility: group.limitShiftVisibility,
      shiftVisibilityHours: group.shiftVisibilityHours,
      routingPosition: group.routingPosition,
      isActive: group.isActive,
    })
    setIsGroupModalOpen(true)
  }

  const handleSaveGroup = () => {
    if (!groupFormData.modality) {
      pushToast({
        title: "Validation Error",
        description: "Modality is required.",
        type: "error",
      })
      return
    }

    if (!groupFormData.name.trim()) {
      pushToast({
        title: "Validation Error",
        description: "Workforce group name is required.",
        type: "error",
      })
      return
    }

    if (groupFormData.limitShiftVisibility && (!groupFormData.shiftVisibilityHours || groupFormData.shiftVisibilityHours <= 0)) {
      pushToast({
        title: "Validation Error",
        description: "Please enter shift visibility hours when limit shift visibility is enabled.",
        type: "error",
      })
      return
    }

    try {
      if (editingGroup) {
        // Update existing group
        const updated = updateWorkforceGroup(editingGroup.id, {
          modality: groupFormData.modality,
          name: groupFormData.name.trim(),
          limitShiftVisibility: groupFormData.limitShiftVisibility,
          shiftVisibilityHours: groupFormData.limitShiftVisibility ? groupFormData.shiftVisibilityHours : undefined,
          routingPosition: groupFormData.routingPosition,
          isActive: groupFormData.isActive,
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
          modality: groupFormData.modality,
          name: groupFormData.name.trim(),
          limitShiftVisibility: groupFormData.limitShiftVisibility,
          shiftVisibilityHours: groupFormData.limitShiftVisibility ? groupFormData.shiftVisibilityHours : undefined,
          routingPosition: groupFormData.routingPosition,
          isActive: groupFormData.isActive,
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Modality</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Limit Shift Visibility</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Routing Position</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">{group.modality}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-foreground">{group.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">{group.limitShiftVisibility ? "Yes" : "No"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">{group.routingPosition}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            group.isActive
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {group.isActive ? "Active" : "Inactive"}
                        </span>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Workforce Group Modal */}
      <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Edit Workforce Group" : "Add Workforce Group"}</DialogTitle>
            <DialogDescription>
              {editingGroup ? "Update workforce group details below." : "Groups or Workers and routing rules."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Workforce Group</h3>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="status-switch" className="text-sm font-medium">Status:</Label>
                <span className={`text-sm font-semibold ${groupFormData.isActive ? "text-success" : "text-muted-foreground"}`}>
                  {groupFormData.isActive ? "Active" : "Inactive"}
                </span>
                <Switch
                  id="status-switch"
                  checked={groupFormData.isActive}
                  onCheckedChange={(checked) => setGroupFormData({ ...groupFormData, isActive: checked })}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Manage Routing for this organization.</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="modality">Modality</Label>
                  <Select
                    value={groupFormData.modality}
                    onValueChange={(value) => setGroupFormData({ ...groupFormData, modality: value })}
                  >
                    <SelectTrigger id="modality" className="bg-background">
                      <SelectValue placeholder="Select modality" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg">
                      {MODALITY_OPTIONS.map((modality) => (
                        <SelectItem key={modality} value={modality}>
                          {modality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group-name">Workforce Group Name</Label>
                  <Input
                    id="group-name"
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                    placeholder="Enter workforce group name"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <div className="flex-1">
                      <Label htmlFor="limit-visibility" className="text-sm font-semibold text-foreground cursor-pointer">
                        Limit Shift Visibility
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Restrict when shifts become visible to this group
                      </p>
                    </div>
                    <Switch
                      id="limit-visibility"
                      checked={groupFormData.limitShiftVisibility}
                      onCheckedChange={(checked) => setGroupFormData({ ...groupFormData, limitShiftVisibility: checked })}
                      className="ml-4"
                    />
                  </div>

                  {groupFormData.limitShiftVisibility && (
                    <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                      <Label htmlFor="shift-visibility-hours" className="text-sm font-medium">
                        Shift Visibility (hours to shift start)
                      </Label>
                      <Input
                        id="shift-visibility-hours"
                        type="number"
                        min="1"
                        value={groupFormData.shiftVisibilityHours || ""}
                        onChange={(e) => setGroupFormData({ 
                          ...groupFormData, 
                          shiftVisibilityHours: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        placeholder="Enter hours"
                        className="max-w-xs"
                      />
                      <p className="text-xs text-muted-foreground">
                        Shifts will become visible this many hours before they start
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routing-position">Routing Position</Label>
                  <Input
                    id="routing-position"
                    type="number"
                    min="1"
                    value={groupFormData.routingPosition}
                    onChange={(e) => setGroupFormData({ 
                      ...groupFormData, 
                      routingPosition: parseInt(e.target.value) || 1 
                    })}
                    placeholder="Enter routing position"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsGroupModalOpen(false)
              setEditingGroup(null)
              setGroupFormData({
                modality: "",
                name: "",
                limitShiftVisibility: false,
                shiftVisibilityHours: undefined,
                routingPosition: 1,
                isActive: true,
              })
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveGroup} className="ph5-button-primary">
              {editingGroup ? "Update" : "Add"} Workforce Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

