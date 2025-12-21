"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  getAllOccupations,
  getVendorById,
  type Vendor,
  type Occupation,
} from "@/lib/admin-local-db"

type VendorOccupationsReadOnlyProps = {
  vendor: Vendor | null
  vendorId: string
}

export default function VendorOccupationsReadOnly({ vendor, vendorId }: VendorOccupationsReadOnlyProps) {
  const [allOccupations, setAllOccupations] = useState<Occupation[]>([])
  const [selectedOccupationIds, setSelectedOccupationIds] = useState<string[]>([])
  const [selectedSearch, setSelectedSearch] = useState("")

  useEffect(() => {
    const loadData = () => {
      const allOccs = getAllOccupations().filter((occ) => occ.isActive)
      setAllOccupations(allOccs)

      if (vendor) {
        setSelectedOccupationIds(vendor.occupationIds || [])
      } else if (vendorId !== "add") {
        // Load existing vendor if editing
        const existingVendor = getVendorById(vendorId)
        if (existingVendor) {
          setSelectedOccupationIds(existingVendor.occupationIds || [])
        }
      }
    }
    
    loadData()
  }, [vendor, vendorId])

  // Selected occupations (in alphabetical order, filtered by search)
  const selectedOccupations = useMemo(() => {
    return allOccupations
      .filter((occ) => selectedOccupationIds.includes(occ.id))
      .filter(
        (occ) =>
          occ.name.toLowerCase().includes(selectedSearch.toLowerCase()) ||
          occ.acronym?.toLowerCase().includes(selectedSearch.toLowerCase()) ||
          occ.code.toLowerCase().includes(selectedSearch.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name)) // Alphabetical order
  }, [allOccupations, selectedOccupationIds, selectedSearch])

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Vendor Occupation Specialization</h2>
          <p className="text-sm text-muted-foreground">View-only access to vendor occupations</p>
        </div>

        <div className="space-y-4">
          {/* Selected Occupations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">
                {selectedOccupationIds.length} Items Selected
              </h3>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search here"
                value={selectedSearch}
                onChange={(e) => setSelectedSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="border border-border rounded-lg">
              <div className="border-b border-border bg-muted/30 px-4 py-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">OCCUPATION NAME</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {selectedOccupations.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {selectedSearch ? "No occupations found matching your search." : "No occupations selected."}
                  </div>
                ) : (
                  selectedOccupations.map((occ) => (
                    <div
                      key={occ.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50"
                    >
                      <span className="text-sm text-foreground flex-1">{occ.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}


