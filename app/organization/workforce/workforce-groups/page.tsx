"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import {
  getCurrentOrganization,
  getWorkforceGroupsByOrganization,
  addWorkforceGroup,
  deleteWorkforceGroup,
  type OrganizationWorkforceGroup,
} from "@/lib/organization-local-db"
import { getAllOccupations, getAllSpecialties } from "@/lib/admin-local-db"
import { getPlacementsByOrganization } from "@/lib/organization-local-db"
import { candidates } from "@/lib/mock-data"

export default function WorkforceGroupsPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [groups, setGroups] = useState<OrganizationWorkforceGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orgId = getCurrentOrganization()
      setCurrentOrgId(orgId)
      loadGroups(orgId)
    }
  }, [])

  const loadGroups = (organizationId: string | null) => {
    if (!organizationId) {
      setLoading(false)
      return
    }

    let orgGroups = getWorkforceGroupsByOrganization(organizationId)
    
    // If no groups exist, create mock data
    if (orgGroups.length === 0) {
      const mockGroups = createMockWorkforceGroups(organizationId)
      orgGroups = mockGroups
    }
    
    setGroups(orgGroups)
    setLoading(false)
  }

  const createMockWorkforceGroups = (organizationId: string): OrganizationWorkforceGroup[] => {
    const mockGroups: OrganizationWorkforceGroup[] = [
      {
        id: `wf-group-${Date.now()}-1`,
        organizationId,
        name: "Nursing Staff",
        description: "All nursing positions including RN, LPN, and CNA",
        occupationCodes: ["RN", "LPN", "CNA"],
        specialtyCodes: ["ICU", "Emergency", "Pediatrics", "Surgery"],
        complianceTemplateId: "nursing-template",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `wf-group-${Date.now()}-2`,
        organizationId,
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
        organizationId,
        name: "Medical Support",
        description: "Medical assistants and administrative support",
        occupationCodes: ["MA", "MS"],
        specialtyCodes: [],
        complianceTemplateId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    // Save mock groups to localDB
    const existingGroups = getWorkforceGroupsByOrganization(organizationId)
    if (existingGroups.length === 0) {
      mockGroups.forEach((group) => {
        try {
          const { id, createdAt, updatedAt, ...groupData } = group
          addWorkforceGroup(organizationId, groupData)
        } catch (error) {
          console.warn("Failed to create mock workforce group:", error)
        }
      })
      return getWorkforceGroupsByOrganization(organizationId)
    }

    return mockGroups
  }

  // Calculate group statistics
  const groupStats = useMemo(() => {
    if (!currentOrgId) return {}
    
    const placements = getPlacementsByOrganization(currentOrgId)
    const allOccupations = getAllOccupations()
    const allSpecialties = getAllSpecialties()
    
    return groups.reduce((acc, group) => {
      // Count members (candidates with matching occupations)
      const matchingOccupations = allOccupations.filter((occ) =>
        group.occupationCodes.includes(occ.code)
      )
      const memberCount = candidates.filter((c) => {
        const candidateRole = c.role.toLowerCase()
        return matchingOccupations.some((occ) =>
          candidateRole.includes(occ.name.toLowerCase()) ||
          candidateRole.includes(occ.code.toLowerCase())
        )
      }).length

      // Count occupations
      const occupationCount = group.occupationCodes.length

      // Calculate compliance percentage (mock calculation)
      const compliancePercentage = Math.floor(75 + Math.random() * 20)

      acc[group.id] = {
        memberCount,
        occupationCount,
        compliancePercentage,
      }
      return acc
    }, {} as Record<string, { memberCount: number; occupationCount: number; compliancePercentage: number }>)
  }, [groups, currentOrgId])

  const handleDeleteGroup = (id: string) => {
    if (!confirm("Are you sure you want to delete this workforce group?")) {
      return
    }

    try {
      deleteWorkforceGroup(id)
      pushToast({
        title: "Success",
        description: "Workforce group deleted successfully.",
        type: "success",
      })
      loadGroups(currentOrgId)
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
      <>
        <Header
          title="Workforce Groups"
          subtitle="Organize workers by role and specialty"
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Workforce", href: "/organization/workforce" },
            { label: "Workforce Groups" },
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
        title="Workforce Groups"
        subtitle="Organize workers by role and specialty"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Workforce", href: "/organization/workforce" },
          { label: "Workforce Groups" },
        ]}
      />

      <section className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => router.push("/organization/workforce/workforce-groups/create")}
            className="ph5-button-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const stats = groupStats[group.id] || { memberCount: 0, occupationCount: 0, compliancePercentage: 0 }
            const allOccupations = getAllOccupations()
            const occupationNames = group.occupationCodes
              .map((code) => {
                const occ = allOccupations.find((o) => o.code === code)
                return occ?.name || code
              })
              .filter(Boolean)

            return (
              <Card key={group.id} className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/organization/workforce/workforce-groups/${group.id}`)}>
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
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/organization/workforce/workforce-groups/${group.id}`)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteGroup(group.id)
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{stats.memberCount}</span>
                    <span>members</span>
                    <span>•</span>
                    <span className="font-medium text-foreground">{stats.occupationCount}</span>
                    <span>occupations</span>
                  </div>
                </div>
              </Card>
            )
          })}

          {groups.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground mb-4">No workforce groups yet.</p>
              <Button onClick={() => router.push("/organization/workforce/workforce-groups/create")} className="ph5-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
