"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Search, ChevronRight, ChevronLeft } from "lucide-react"
import {
  getAllOccupations,
  getVendorById,
  updateVendor,
  addVendor,
  type Vendor,
  type Occupation,
} from "@/lib/admin-local-db"

type VendorOccupationsProps = {
  vendor: Vendor | null
  vendorId: string
}

export default function VendorOccupations({ vendor, vendorId }: VendorOccupationsProps) {
  const router = useRouter()
  const { pushToast } = useToast()
  const [allOccupations, setAllOccupations] = useState<Occupation[]>([])
  const [selectedOccupationIds, setSelectedOccupationIds] = useState<string[]>([])
  const [availableSearch, setAvailableSearch] = useState("")
  const [selectedSearch, setSelectedSearch] = useState("")
  const [checkedAvailable, setCheckedAvailable] = useState<Set<string>>(new Set())
  const [checkedSelected, setCheckedSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

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
      } else {
        // New vendor - no occupations selected yet
        setSelectedOccupationIds([])
      }
    }
    
    loadData()
  }, [vendor, vendorId])

  // Available occupations (not selected, filtered by search)
  const availableOccupations = useMemo(() => {
    return allOccupations
      .filter((occ) => !selectedOccupationIds.includes(occ.id))
      .filter(
        (occ) =>
          occ.name.toLowerCase().includes(availableSearch.toLowerCase()) ||
          occ.acronym?.toLowerCase().includes(availableSearch.toLowerCase()) ||
          occ.code.toLowerCase().includes(availableSearch.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [allOccupations, selectedOccupationIds, availableSearch])

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

  const toggleAvailableCheck = (id: string) => {
    const newChecked = new Set(checkedAvailable)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedAvailable(newChecked)
  }

  const toggleSelectedCheck = (id: string) => {
    const newChecked = new Set(checkedSelected)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedSelected(newChecked)
  }

  const addSelected = () => {
    const toAdd = Array.from(checkedAvailable)
    setSelectedOccupationIds((prev) => [...prev, ...toAdd])
    setCheckedAvailable(new Set())
  }

  const removeSelected = () => {
    const toRemove = Array.from(checkedSelected)
    setSelectedOccupationIds((prev) => prev.filter((id) => !toRemove.includes(id)))
    setCheckedSelected(new Set())
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (vendorId === "add") {
        // For new vendors, store in sessionStorage temporarily
        // This will be saved when the profile is saved
        if (typeof window !== "undefined") {
          sessionStorage.setItem("pendingVendorOccupations", JSON.stringify(selectedOccupationIds))
        }
        pushToast({ title: "Info", description: "Occupations will be saved when you save the vendor profile." })
      } else if (vendor) {
        updateVendor(vendorId, { occupationIds: selectedOccupationIds })
        pushToast({ title: "Success", description: "Vendor occupations updated successfully." })
        router.refresh()
      } else {
        // Update existing vendor
        const existingVendor = getVendorById(vendorId)
        if (existingVendor) {
          updateVendor(vendorId, { occupationIds: selectedOccupationIds })
          pushToast({ title: "Success", description: "Vendor occupations updated successfully." })
          router.refresh()
        }
      }
    } catch (error) {
      console.error("Error saving vendor occupations:", error)
      pushToast({ title: "Error", description: "Failed to save vendor occupations." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Vendor Occupation Specialization</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6">
          {/* Available Occupations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {availableOccupations.length} Items Available
              </h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search here"
                value={availableSearch}
                onChange={(e) => setAvailableSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="border border-border rounded-lg">
              <div className="border-b border-border bg-muted/30 px-4 py-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">OCCUPATION NAME</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {availableOccupations.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No occupations available
                  </div>
                ) : (
                  availableOccupations.map((occ) => (
                    <label
                      key={occ.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checkedAvailable.has(occ.id)}
                        onChange={() => toggleAvailableCheck(occ.id)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground flex-1">{occ.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Transfer Buttons */}
          <div className="flex flex-col items-center justify-center gap-4">
            <button
              type="button"
              onClick={addSelected}
              disabled={checkedAvailable.size === 0}
              className="p-2 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Add selected"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
            <button
              type="button"
              onClick={removeSelected}
              disabled={checkedSelected.size === 0}
              className="p-2 rounded-md border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Remove selected"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
          </div>

          {/* Selected Occupations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {selectedOccupationIds.length} Items Selected
              </h3>
            </div>
            <div className="relative">
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
                    No occupations selected
                  </div>
                ) : (
                  selectedOccupations.map((occ) => (
                    <label
                      key={occ.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checkedSelected.has(occ.id)}
                        onChange={() => toggleSelectedCheck(occ.id)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground flex-1">{occ.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => router.push("/admin/vendors")}
            className="px-4 py-2 rounded-md border border-border bg-card text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </Card>
    </div>
  )
}


