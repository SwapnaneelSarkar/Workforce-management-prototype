"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  getAllSpecialtiesAdmin,
  getAllOccupationSpecialties,
  getOccupationById,
  getOrganizationById,
  getOrganizationOccupations,
  type Specialty,
  type OccupationSpecialty,
} from "@/lib/admin-local-db"

type SpecialtyWithOccupation = {
  specialty: Specialty
  occupation: string | null // Single occupation name (1 specialty = 1 occupation)
}

export default function OrganizationSpecialtiesPage() {
  const params = useParams()
  const { pushToast } = useToast()
  const organizationId = params.id as string
  const [specialties, setSpecialties] = useState<SpecialtyWithOccupation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [organization, setOrganization] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [organizationId])

  const loadData = () => {
    setLoading(true)
    const org = getOrganizationById(organizationId)
    setOrganization(org)
    
    // Get all specialties
    const allSpecialties = getAllSpecialtiesAdmin()
    
    // Get all occupation-specialty links
    const allOccupationSpecialties = getAllOccupationSpecialties()
    
    // Get organization's occupations
    const orgOccupations = getOrganizationOccupations(organizationId)
    const orgOccupationIds = new Set(orgOccupations.map((occ) => occ.id))
    
    // Build specialty to occupation mapping (1 specialty = 1 occupation)
    const specialtyToOccupation = new Map<string, string>()
    
    allOccupationSpecialties.forEach((occSpec) => {
      // Only include if the occupation belongs to this organization
      // If a specialty already has an occupation, we keep the first one found
      if (orgOccupationIds.has(occSpec.occupationId) && !specialtyToOccupation.has(occSpec.specialtyId)) {
        const occupation = getOccupationById(occSpec.occupationId)
        if (occupation) {
          specialtyToOccupation.set(occSpec.specialtyId, occupation.name)
        }
      }
    })
    
    // Combine specialties with their occupation (single occupation per specialty)
    const specialtiesWithOccupation: SpecialtyWithOccupation[] = allSpecialties.map((spec) => ({
      specialty: spec,
      occupation: specialtyToOccupation.get(spec.id) || null,
    }))
    
    // Filter to only show specialties that are linked to an organization occupation
    const filtered = specialtiesWithOccupation.filter(
      (item) => item.occupation !== null
    )
    
    setSpecialties(filtered)
    setLoading(false)
  }

  const filteredSpecialties = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return specialties.filter((item) => {
      const spec = item.specialty
      const matchesName = spec.name.toLowerCase().includes(query)
      const matchesCode = spec.code?.toLowerCase().includes(query) || false
      const matchesAcronym = spec.acronym?.toLowerCase().includes(query) || false
      const matchesOccupation = item.occupation?.toLowerCase().includes(query) || false
      return matchesName || matchesCode || matchesAcronym || matchesOccupation
    })
  }, [specialties, searchQuery])

  if (loading) {
    return (
      <>
        <Header
          title="Specialties"
          subtitle="Manage organization specialties"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Organizations", href: "/admin/organizations" },
            { label: organization?.name || "Organization", href: `/admin/organizations/${organizationId}` },
            { label: "Specialties" },
          ]}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="Specialties"
        subtitle="Manage specialties linked to organization occupations"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: organization?.name || "Organization", href: `/admin/organizations/${organizationId}` },
          { label: "Specialties" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Specialties</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredSpecialties.length} {filteredSpecialties.length === 1 ? "specialty" : "specialties"} linked to organization occupations
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredSpecialties.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "No specialties found matching your search." : "No specialties linked to organization occupations."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Specialty Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Code</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Acronym</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Linked Occupation</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSpecialties.map((item) => {
                      const spec = item.specialty
                      
                      return (
                        <tr key={spec.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-foreground">{spec.name}</span>
                            {spec.description && (
                              <p className="text-xs text-muted-foreground mt-1">{spec.description}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground font-mono">{spec.code || "—"}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-muted-foreground">{spec.acronym || "—"}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-foreground">{item.occupation || "—"}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                spec.isActive
                                  ? "bg-success/10 text-success"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {spec.isActive ? "Active" : "Inactive"}
                            </span>
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
      </section>
    </>
  )
}
