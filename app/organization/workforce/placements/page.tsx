"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Plus, Eye, Trash2, Edit } from "lucide-react"
import { Avatar } from "@/components/system"
import {
  getCurrentOrganization,
  getPlacementsByOrganization,
  addPlacement,
  updatePlacement,
  deletePlacement,
  type OrganizationPlacement,
} from "@/lib/organization-local-db"
import { getJobsByOrganization } from "@/lib/organization-local-db"
import { candidates } from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type PlacementStatus = "Active" | "Upcoming" | "Completed" | "Ending Soon"
type ComplianceStatus = "Complete" | "Expiring" | "Missing"

export default function PlacementsPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [placements, setPlacements] = useState<OrganizationPlacement[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "completed">("active")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPlacement, setEditingPlacement] = useState<OrganizationPlacement | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    candidateId: "",
    jobId: "",
    startDate: "",
    endDate: "",
    status: "Active" as PlacementStatus,
    complianceStatus: "Complete" as ComplianceStatus,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orgId = getCurrentOrganization()
      setCurrentOrgId(orgId)
      loadPlacements(orgId)
    }
  }, [])

  const loadPlacements = (organizationId: string | null) => {
    if (!organizationId) {
      setLoading(false)
      return
    }

    let orgPlacements = getPlacementsByOrganization(organizationId)
    
    // If no placements exist, create mock data
    if (orgPlacements.length === 0) {
      const mockPlacements = createMockPlacements(organizationId)
      orgPlacements = mockPlacements
    }
    
    setPlacements(orgPlacements)
    setLoading(false)
  }

  const createMockPlacements = (organizationId: string): OrganizationPlacement[] => {
    const mockCandidates = [
      { id: "cand-002", name: "Sarah Johnson", email: "sarah.johnson@email.com", avatar: "SJ" },
      { id: "cand-003", name: "Michael Chen", email: "michael.chen@email.com", avatar: "MC" },
      { id: "cand-004", name: "Emily Rodriguez", email: "emily.rodriguez@email.com", avatar: "ER" },
    ]

    const mockJobs = orgJobs.length > 0 ? orgJobs : [
      { id: "job-001", title: "Registered Nurse - ICU", location: "Memorial - Main Campus", department: "Intensive Care" },
      { id: "job-002", title: "Physical Therapist - Rehab", location: "Memorial - Downtown", department: "Rehabilitation" },
      { id: "job-004", title: "Medical Assistant - Cardiology", location: "Memorial - Main Campus", department: "Cardiology" },
    ]

    const today = new Date()
    const mockPlacements: OrganizationPlacement[] = [
      {
        id: `placement-${Date.now()}-1`,
        organizationId,
        candidateId: mockCandidates[0].id,
        candidateName: mockCandidates[0].name,
        candidateEmail: mockCandidates[0].email,
        candidateAvatar: mockCandidates[0].avatar,
        jobId: mockJobs[0].id,
        jobTitle: mockJobs[0].title,
        requisitionId: "REQ-2025-001",
        location: mockJobs[0].location,
        department: mockJobs[0].department,
        startDate: "2025-01-15",
        endDate: "2025-04-15",
        shiftType: "Day Shift",
        billRate: "$88/hr",
        notes: "",
        status: "Active",
        complianceStatus: "Complete",
        createdAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `placement-${Date.now()}-2`,
        organizationId,
        candidateId: mockCandidates[1].id,
        candidateName: mockCandidates[1].name,
        candidateEmail: mockCandidates[1].email,
        candidateAvatar: mockCandidates[1].avatar,
        jobId: mockJobs[1].id,
        jobTitle: mockJobs[1].title,
        requisitionId: "REQ-2025-002",
        location: mockJobs[1].location,
        department: mockJobs[1].department,
        startDate: "2025-02-01",
        endDate: "2025-03-15",
        shiftType: "Day Shift",
        billRate: "$55/hr",
        notes: "",
        status: "Ending Soon",
        complianceStatus: "Expiring",
        createdAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `placement-${Date.now()}-3`,
        organizationId,
        candidateId: mockCandidates[2].id,
        candidateName: mockCandidates[2].name,
        candidateEmail: mockCandidates[2].email,
        candidateAvatar: mockCandidates[2].avatar,
        jobId: mockJobs[2].id,
        jobTitle: mockJobs[2].title,
        requisitionId: "REQ-2025-003",
        location: mockJobs[2].location,
        department: mockJobs[2].department,
        startDate: "2024-12-01",
        endDate: "2025-02-28",
        shiftType: "Day Shift",
        billRate: "$22/hr",
        notes: "",
        status: "Active",
        complianceStatus: "Complete",
        createdAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    // Save mock placements to localDB (only if they don't already exist)
    const existingPlacements = getPlacementsByOrganization(organizationId)
    if (existingPlacements.length === 0) {
      mockPlacements.forEach((placement) => {
        try {
          // Use the placement data directly but let addPlacement generate a new ID
          const { id, createdAt, updatedAt, ...placementData } = placement
          addPlacement(organizationId, placementData)
        } catch (error) {
          console.warn("Failed to create mock placement:", error)
        }
      })
      // Reload to get the saved placements with proper IDs
      return getPlacementsByOrganization(organizationId)
    }

    return mockPlacements
  }

  // Get available jobs and candidates for the form
  const orgJobs = useMemo(() => {
    if (!currentOrgId) return []
    return getJobsByOrganization(currentOrgId)
  }, [currentOrgId])

  const availableCandidates = useMemo(() => {
    // Get candidates from accepted applications
    if (!currentOrgId) return []
    const { getApplicationsByOrganization } = require("@/lib/organization-local-db")
    const applications = getApplicationsByOrganization(currentOrgId)
    const acceptedAppIds = applications
      .filter((app: any) => app.status === "Accepted" || app.status === "Offer")
      .map((app: any) => app.candidateId)
    return candidates.filter((c) => acceptedAppIds.includes(c.id))
  }, [currentOrgId])

  // Filter placements by status
  const filteredPlacements = useMemo(() => {
    if (activeTab === "active") {
      return placements.filter((p) => p.status === "Active" || p.status === "Ending Soon")
    } else if (activeTab === "upcoming") {
      return placements.filter((p) => p.status === "Upcoming")
    } else {
      return placements.filter((p) => p.status === "Completed")
    }
  }, [placements, activeTab])

  const handleCreatePlacement = () => {
    if (!currentOrgId) {
      pushToast({
        title: "Error",
        description: "No organization selected.",
        type: "error",
      })
      return
    }

    // Validate form
    if (!formData.candidateId || !formData.jobId || !formData.startDate || !formData.endDate) {
      pushToast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        type: "error",
      })
      return
    }

    const candidate = candidates.find((c) => c.id === formData.candidateId)
    const job = orgJobs.find((j) => j.id === formData.jobId)

    if (!candidate || !job) {
      pushToast({
        title: "Error",
        description: "Invalid candidate or job selected.",
        type: "error",
      })
      return
    }

    // Get candidate avatar initials
    const nameParts = candidate.name.split(" ")
    const avatar = nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : candidate.name.substring(0, 2).toUpperCase()

    try {
      addPlacement(currentOrgId, {
        candidateId: formData.candidateId,
        candidateName: candidate.name,
        candidateAvatar: avatar,
        jobId: formData.jobId,
        jobTitle: job.title,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        complianceStatus: formData.complianceStatus,
      })

      pushToast({
        title: "Success",
        description: "Placement created successfully.",
        type: "success",
      })

      setIsCreateModalOpen(false)
      resetForm()
      loadPlacements(currentOrgId)
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to create placement.",
        type: "error",
      })
    }
  }

  const handleUpdatePlacement = () => {
    if (!editingPlacement) return

    try {
      updatePlacement(editingPlacement.id, {
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        complianceStatus: formData.complianceStatus,
      })

      pushToast({
        title: "Success",
        description: "Placement updated successfully.",
        type: "success",
      })

      setEditingPlacement(null)
      resetForm()
      loadPlacements(currentOrgId)
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to update placement.",
        type: "error",
      })
    }
  }

  const handleDeletePlacement = (id: string) => {
    if (!confirm("Are you sure you want to delete this placement?")) {
      return
    }

    try {
      deletePlacement(id)
      pushToast({
        title: "Success",
        description: "Placement deleted successfully.",
        type: "success",
      })
      loadPlacements(currentOrgId)
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to delete placement.",
        type: "error",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      candidateId: "",
      jobId: "",
      startDate: "",
      endDate: "",
      status: "Active",
      complianceStatus: "Complete",
    })
  }

  const openEditModal = (placement: OrganizationPlacement) => {
    setEditingPlacement(placement)
    setFormData({
      candidateId: placement.candidateId,
      jobId: placement.jobId,
      startDate: placement.startDate,
      endDate: placement.endDate,
      status: placement.status,
      complianceStatus: placement.complianceStatus,
    })
  }

  if (loading) {
    return (
      <>
        <Header
          title="Placements"
          subtitle="Create and manage placements connecting workers to job requisitions."
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Workforce", href: "/organization/workforce" },
            { label: "Placements" },
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

  return (
    <>
      <Header
        title="Placements"
        subtitle="Create and manage placements for accepted candidates. Placements connect workers to job requisitions and track compliance, timecards, and billing."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Workforce", href: "/organization/workforce" },
          { label: "Placements" },
        ]}
      />

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={activeTab === "active" ? "default" : "outline"}
              onClick={() => setActiveTab("active")}
            >
              Active Placements
            </Button>
            <Button
              variant={activeTab === "upcoming" ? "default" : "outline"}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming Placements
            </Button>
            <Button
              variant={activeTab === "completed" ? "default" : "outline"}
              onClick={() => setActiveTab("completed")}
            >
              Completed Placements
            </Button>
          </div>
          <Button onClick={() => router.push("/organization/workforce/placements/create")} className="ph5-button-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Placement
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Candidate</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Job / Requisition</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Start Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">End Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Compliance</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlacements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No {activeTab} placements found.
                    </td>
                  </tr>
                ) : (
                  filteredPlacements.map((placement) => (
                    <tr key={placement.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={placement.candidateAvatar} size="sm" />
                          <span className="text-sm text-foreground">{placement.candidateName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">{placement.jobTitle}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{placement.startDate}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{placement.endDate}</td>
                      <td className="py-3 px-4">
                        <StatusChip
                          status={placement.status}
                          variant={
                            placement.status === "Active"
                              ? "success"
                              : placement.status === "Ending Soon"
                              ? "warning"
                              : placement.status === "Completed"
                              ? "default"
                              : "info"
                          }
                        />
                      </td>
                      <td className="py-3 px-4">
                        <StatusChip
                          status={placement.complianceStatus}
                          variant={
                            placement.complianceStatus === "Complete"
                              ? "success"
                              : placement.complianceStatus === "Expiring"
                              ? "warning"
                              : "error"
                          }
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/organization/workforce/placements/${placement.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(placement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePlacement(placement.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || editingPlacement !== null} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setEditingPlacement(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlacement ? "Edit Placement" : "Create Placement"}</DialogTitle>
            <DialogDescription>
              {editingPlacement
                ? "Update placement details below."
                : "Create a new placement by selecting a candidate and job requisition."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!editingPlacement && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="candidate">Candidate *</Label>
                  <Select
                    value={formData.candidateId}
                    onValueChange={(value) => setFormData({ ...formData, candidateId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCandidates.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          {candidate.name} - {candidate.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job">Job / Requisition *</Label>
                  <Select
                    value={formData.jobId}
                    onValueChange={(value) => setFormData({ ...formData, jobId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgJobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title} - {job.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: PlacementStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Ending Soon">Ending Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="complianceStatus">Compliance Status</Label>
                <Select
                  value={formData.complianceStatus}
                  onValueChange={(value: ComplianceStatus) => setFormData({ ...formData, complianceStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="Expiring">Expiring</SelectItem>
                    <SelectItem value="Missing">Missing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false)
              setEditingPlacement(null)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={editingPlacement ? handleUpdatePlacement : handleCreatePlacement} className="ph5-button-primary">
              {editingPlacement ? "Update" : "Create"} Placement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


