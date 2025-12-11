"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Trash2, FileText } from "lucide-react"
import {
  getOccupationById,
  type Occupation,
} from "@/lib/admin-local-db"

type Specialty = {
  id: string
  name: string
  acronym: string
  isActive: boolean
}

export default function SpecialtiesPage() {
  const params = useParams()
  const router = useRouter()
  const { pushToast } = useToast()
  const occupationId = params.id as string
  const [occupation, setOccupation] = useState<Occupation | null>(null)
  const [loading, setLoading] = useState(true)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState({ name: "", acronym: "", isActive: true })

  useEffect(() => {
    loadData()
  }, [occupationId])

  const loadData = () => {
    const occ = getOccupationById(occupationId)
    setOccupation(occ)
    // Mock specialties - in real app this would come from database
    if (occ) {
      setSpecialties([
        { id: "spec-1", name: "Intensive Care Unit", acronym: "ICU", isActive: true },
      ])
    }
    setLoading(false)
  }

  const handleAddSpecialty = () => {
    if (!newSpecialty.name.trim()) {
      pushToast({ title: "Validation Error", description: "Specialty name is required." })
      return
    }

    const specialty: Specialty = {
      id: `spec-${Date.now()}`,
      name: newSpecialty.name.trim(),
      acronym: newSpecialty.acronym.trim() || "",
      isActive: newSpecialty.isActive,
    }

    setSpecialties([...specialties, specialty])
    setNewSpecialty({ name: "", acronym: "", isActive: true })
    setIsAdding(false)
    pushToast({ title: "Success", description: "Specialty added successfully." })
  }

  const handleRemoveSpecialty = (id: string) => {
    setSpecialties(specialties.filter((s) => s.id !== id))
    pushToast({ title: "Success", description: "Specialty removed successfully." })
  }

  const handleUpdateSpecialty = (id: string, updates: Partial<Specialty>) => {
    setSpecialties(specialties.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  if (loading) {
    return (
      <>
        <Header
          title="Loading..."
          subtitle=""
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Occupations", href: "/admin/occupations" },
            { label: "Specialties" },
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

  if (!occupation) {
    return (
      <>
        <Header
          title="Occupation Not Found"
          subtitle=""
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Occupations", href: "/admin/occupations" },
            { label: "Not Found" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Occupation not found.</p>
            <Link href="/admin/occupations" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Back to Occupations
            </Link>
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      <Header
        title="Specialties"
        subtitle="Manage specialties available for candidate sign-up."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Occupations", href: "/admin/occupations" },
          { label: "Specialties" },
        ]}
      />

      <section className="space-y-6">
        <div className="flex gap-3">
          <Link href="/admin/occupations" className="ph5-button-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Occupations
          </Link>
        </div>

        <Card>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  Specialties
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Update specialty details below.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active (visible in Candidate sign-up)</span>
                <button
                  type="button"
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    true ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  Active
                </button>
              </div>
            </div>

            {specialties.map((specialty) => (
              <div key={specialty.id} className="space-y-4 border border-border rounded-lg p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 relative">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Specialty Name
                      <span className="text-[10px] bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded rotate-12">
                        NEW
                      </span>
                    </label>
                    <Input
                      value={specialty.name}
                      onChange={(e) => handleUpdateSpecialty(specialty.id, { name: e.target.value })}
                      placeholder="e.g., Intensive Care Unit"
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="text-[10px] bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded rotate-12">
                        NEW
                      </span>
                      Acronym
                    </label>
                    <Input
                      value={specialty.acronym}
                      onChange={(e) => handleUpdateSpecialty(specialty.id, { acronym: e.target.value })}
                      placeholder="e.g., ICU"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Specialty Questionnaire
                      <span className="text-[10px] bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded rotate-12">
                        NEW
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-red-500 font-semibold">
                    Need to be able to create specialty questions too
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                    onClick={() => handleRemoveSpecialty(specialty.id)}
                    title="Delete specialty"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}

            {isAdding ? (
              <div className="space-y-4 border border-border rounded-lg p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Specialty Name</label>
                    <Input
                      value={newSpecialty.name}
                      onChange={(e) => setNewSpecialty({ ...newSpecialty, name: e.target.value })}
                      placeholder="e.g., Intensive Care Unit"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Acronym</label>
                    <Input
                      value={newSpecialty.acronym}
                      onChange={(e) => setNewSpecialty({ ...newSpecialty, acronym: e.target.value })}
                      placeholder="e.g., ICU"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleAddSpecialty} className="ph5-button-primary">
                    Add Specialty
                  </Button>
                  <Button onClick={() => setIsAdding(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Specialities
              </Button>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button onClick={() => router.push("/admin/occupations")} className="ph5-button-primary">
                Update Specialty
              </Button>
              <Button onClick={() => router.push("/admin/occupations")} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}





