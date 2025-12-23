"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, GripVertical, Search, MoreVertical, Trash2, UserX, ArrowLeft } from "lucide-react"
import { DataTable } from "@/components/system/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type WorkforceGroup = {
  id: string
  name: string
  description: string
  compliancePercentage: number
  memberCount: number
  occupationCount: number
  complianceTemplateId?: string
  complianceTemplateName?: string
  priority: number
}

type GroupMember = {
  id: string
  name: string
  occupation: string
  specialty: string
  status: string
  complianceStatus: "Complete" | "Pending" | "Missing"
  compliancePercentage: number
}

const mockGroups: WorkforceGroup[] = [
  {
    id: "1",
    name: "Nursing Staff",
    description: "Registered nurses, LPNs, and nursing assistants",
    compliancePercentage: 94,
    memberCount: 156,
    occupationCount: 12,
    complianceTemplateId: "nursing-template",
    complianceTemplateName: "Nursing Staff Template",
    priority: 1,
  },
  {
    id: "2",
    name: "Rehabilitation Team",
    description: "Physical therapists, occupational therapists, and rehabilitation specialists",
    compliancePercentage: 89,
    memberCount: 48,
    occupationCount: 6,
    complianceTemplateId: "rehab-template",
    complianceTemplateName: "Rehabilitation Template",
    priority: 2,
  },
  {
    id: "3",
    name: "Medical Support",
    description: "Medical assistants, respiratory therapists, and support staff",
    compliancePercentage: 78,
    memberCount: 72,
    occupationCount: 8,
    complianceTemplateId: "medical-template",
    complianceTemplateName: "Medical Support Template",
    priority: 3,
  },
]

const mockMembers: Record<string, GroupMember[]> = {
  "1": [
    {
      id: "m1",
      name: "Sarah Johnson",
      occupation: "RN",
      specialty: "ICU",
      status: "Nursing Staff",
      complianceStatus: "Complete",
      compliancePercentage: 100,
    },
    {
      id: "m2",
      name: "Michael Chen",
      occupation: "LPN",
      specialty: "Med-Surg",
      status: "Nursing Staff",
      complianceStatus: "Pending",
      compliancePercentage: 75,
    },
    {
      id: "m3",
      name: "James Wilson",
      occupation: "CNA",
      specialty: "General",
      status: "Nursing Staff",
      complianceStatus: "Missing",
      compliancePercentage: 50,
    },
    {
      id: "m4",
      name: "Emily Rodriguez",
      occupation: "RN",
      specialty: "ER",
      status: "Rehabilitation Team",
      complianceStatus: "Complete",
      compliancePercentage: 100,
    },
    {
      id: "m5",
      name: "James Wilson",
      occupation: "CNA",
      specialty: "General",
      status: "Nursing Staff",
      complianceStatus: "Missing",
      compliancePercentage: 50,
    },
    {
      id: "m6",
      name: "Lisa Anderson",
      occupation: "RN",
      specialty: "PICU",
      status: "Nursing Staff",
      complianceStatus: "Complete",
      compliancePercentage: 100,
    },
  ],
  "2": [
    {
      id: "m5",
      name: "Emily Rodriguez",
      occupation: "RN",
      specialty: "ER",
      status: "Rehabilitation Team",
      complianceStatus: "Complete",
      compliancePercentage: 100,
    },
  ],
  "3": [],
}

export default function WorkforceGroupsPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [groups, setGroups] = useState<WorkforceGroup[]>(mockGroups)
  const [selectedGroup, setSelectedGroup] = useState<WorkforceGroup | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
  })

  const filteredMembers = useMemo(() => {
    if (!selectedGroup) return []
    const members = mockMembers[selectedGroup.id] || []
    if (!searchQuery.trim()) return members
    const query = searchQuery.toLowerCase()
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.occupation.toLowerCase().includes(query) ||
        m.specialty.toLowerCase().includes(query)
    )
  }, [selectedGroup, searchQuery])

  const handleEditGroup = (group: WorkforceGroup) => {
    setSelectedGroup(group)
    setEditFormData({
      name: group.name,
      description: group.description,
    })
    setIsEditModalOpen(true)
  }

  const handleSaveGroup = () => {
    if (!selectedGroup || !editFormData.name.trim()) {
      pushToast({
        title: "Validation Error",
        description: "Group name is required",
        type: "error",
      })
      return
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroup.id
          ? { ...g, name: editFormData.name, description: editFormData.description }
          : g
      )
    )
    setSelectedGroup((prev) =>
      prev
        ? { ...prev, name: editFormData.name, description: editFormData.description }
        : null
    )
    setIsEditModalOpen(false)
      pushToast({
        title: "Success",
      description: "Workforce group updated successfully",
        type: "success",
      })
  }

  const handleMoveGroup = (groupId: string, direction: "up" | "down") => {
    setGroups((prev) => {
      const index = prev.findIndex((g) => g.id === groupId)
      if (index === -1) return prev
      if (direction === "up" && index === 0) return prev
      if (direction === "down" && index === prev.length - 1) return prev

      const newGroups = [...prev]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      ;[newGroups[index], newGroups[targetIndex]] = [newGroups[targetIndex], newGroups[index]]

      // Update priorities
      return newGroups.map((g, i) => ({ ...g, priority: i + 1 }))
    })
  }


  if (selectedGroup) {
    const members = mockMembers[selectedGroup.id] || []
    const requiredItems = 8

    return (
      <div className="space-y-6 p-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setSelectedGroup(null)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workforce Groups
        </Button>

        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{selectedGroup.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{selectedGroup.description}</p>
          </div>
          <Button onClick={() => handleEditGroup(selectedGroup)} className="ph5-button-primary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Group
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Members</p>
            <p className="text-3xl font-bold text-foreground">{selectedGroup.memberCount}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Occupations</p>
            <p className="text-3xl font-bold text-foreground">{selectedGroup.occupationCount}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Compliance</p>
            <p className="text-3xl font-bold text-foreground">{selectedGroup.compliancePercentage}%</p>
          </Card>
        </div>

        {/* Compliance Template Section */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-4">Compliance Template</h3>
              {selectedGroup.complianceTemplateName ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedGroup.complianceTemplateName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {requiredItems} required items
                      </p>
                    </div>
                    <StatusChip status="success" label="Active" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No template assigned</p>
              )}
            </div>
            <Button variant="outline" size="sm">
              Change Template
            </Button>
          </div>
        </Card>

        {/* Group Members Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Group Members</h3>
              <Button variant="outline" size="sm" className="ph5-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Members
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Members Table */}
            <DataTable
              columns={[
                {
                  id: "name",
                  label: "Name",
                  sortable: true,
                  render: (member: GroupMember) => (
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                    </div>
                  ),
                },
                { id: "occupation", label: "Occupation", sortable: true },
                { id: "specialty", label: "Specialty", sortable: true },
                {
                  id: "status",
                  label: "Status",
                  sortable: true,
                  render: (member: GroupMember) => (
                    <span className="text-sm text-muted-foreground">{member.status}</span>
                  ),
                },
                {
                  id: "compliance",
                  label: "Compliance",
                  sortable: true,
                  render: (member: GroupMember) => (
                    <StatusChip
                      status={
                        member.complianceStatus === "Complete"
                          ? "success"
                          : member.complianceStatus === "Pending"
                          ? "warning"
                          : "error"
                      }
                      label={
                        member.complianceStatus === "Complete"
                          ? `${member.compliancePercentage}%`
                          : `${member.complianceStatus} ${member.compliancePercentage}%`
                      }
                    />
                  ),
                },
                {
                  id: "actions",
                  label: "Actions",
                  sortable: false,
                  render: (member: GroupMember) => (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="backdrop-blur-sm bg-card/95">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ),
                },
              ]}
              rows={filteredMembers}
              rowKey={(row) => row.id}
            />
          </div>
        </Card>

        {/* Edit Group Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Workforce Group</DialogTitle>
              <DialogDescription>Update group details</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">
                  Group Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="groupName"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Nursing Staff"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Registered nurses, LPNs, and nursing assistants"
                  rows={3}
                />
              </div>

              {selectedGroup?.complianceTemplateName && (
                <div className="space-y-2">
                  <Label>Current Compliance Template</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedGroup.complianceTemplateName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use "Change Template" in the group details to update
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveGroup} className="ph5-button-primary">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Workforce Groups"
        subtitle={`Drag to reorder priority • ${groups.length} groups`}
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Workforce", href: "/organization/workforce" },
          { label: "Workforce Groups" },
        ]}
        actions={[
          {
            id: "add-group",
            label: "Add Group",
            icon: <Plus className="h-4 w-4" />,
            variant: "primary",
            onClick: () => {
              // TODO: Implement add group
              console.log("Add group")
            },
          },
        ]}
      />

      <div className="space-y-4">
        {groups.map((group, index) => (
          <div
            key={group.id}
            onClick={() => setSelectedGroup(group)}
            className="cursor-pointer"
          >
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1 pt-1">
                <button
                        onClick={(e) => {
                          e.stopPropagation()
                    handleMoveGroup(group.id, "up")
                  }}
                  disabled={index === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <GripVertical className="h-4 w-4 rotate-90" />
                </button>
                <button
                        onClick={(e) => {
                          e.stopPropagation()
                    handleMoveGroup(group.id, "down")
                  }}
                  disabled={index === groups.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <GripVertical className="h-4 w-4 -rotate-90" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-foreground">{group.compliancePercentage}%</p>
                    </div>
                  </div>
                </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{group.memberCount}</span>
                    <span>members</span>
                    <span>•</span>
                  <span className="font-medium text-foreground">{group.occupationCount}</span>
                    <span>occupations</span>
                  </div>
                  </div>
                </div>
              </Card>
          </div>
        ))}
            </div>
        </div>
  )
}

