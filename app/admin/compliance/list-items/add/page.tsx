"use client"

import { useState, type FormEvent, type ChangeEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import {
  addComplianceListItem,
  type ComplianceListItem,
} from "@/lib/admin-local-db"

export default function AddComplianceListItemPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { pushToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: (searchParams.get("category") as ComplianceListItem["category"]) || "Background & Identification",
    expirationType: "Expiration Date" as ComplianceListItem["expirationType"],
    displayToCandidate: false,
    isActive: true,
  })

  const handleInputChange = (field: keyof typeof formData) => (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const value = field === "displayToCandidate" || field === "isActive"
      ? (e.target as HTMLInputElement).checked
      : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      pushToast({ title: "Validation Error", description: "Please enter a compliance item name." })
      return
    }

    setIsSubmitting(true)

    try {
      const newItem = addComplianceListItem({
        name: formData.name.trim(),
        category: formData.category,
        expirationType: formData.expirationType,
        displayToCandidate: formData.displayToCandidate,
        isActive: formData.isActive,
      })

      pushToast({ title: "Success", description: `Compliance list item "${newItem.name}" has been added successfully.` })
      router.push("/admin/compliance/list-items")
    } catch (error) {
      pushToast({ title: "Error", description: "Failed to add compliance list item. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header
        title="Add Compliance List Item"
        subtitle="Add a new compliance item to be used in wallet and requisition templates."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Compliance List Items", href: "/admin/compliance/list-items" },
          { label: "Add Item" },
        ]}
      />

      <section className="space-y-6">
        <div className="flex gap-3">
          <Link href="/admin/compliance/list-items" className="ph5-button-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List Items
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Compliance List Item</h2>
                <p className="mt-1 text-sm text-muted-foreground">Add a new compliance item that can be used in templates.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Compliance Item Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    className="w-full"
                    placeholder="e.g., Drivers License, RN License"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={handleInputChange("category")}
                    required
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Background & Identification">Background & Identification</option>
                    <option value="License">License</option>
                    <option value="Certification">Certification</option>
                    <option value="Training">Training</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Expiration Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.expirationType}
                    onChange={handleInputChange("expirationType")}
                    required
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="None">None</option>
                    <option value="Expiration Date">Expiration Date</option>
                    <option value="Recurring">Recurring</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.displayToCandidate}
                      onChange={handleInputChange("displayToCandidate")}
                      className="rounded border-border"
                    />
                    <span className="text-sm font-medium text-foreground">Display To Candidate</span>
                    <span className="text-xs text-muted-foreground">(Show in candidate portal compliance wallet)</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleInputChange("isActive")}
                      className="rounded border-border"
                    />
                    <span className="text-sm font-medium text-foreground">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ph5-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Compliance Item"}
                </button>
                <Link href="/admin/compliance/list-items" className="ph5-button-secondary">
                  Cancel
                </Link>
              </div>
            </div>
          </Card>
        </form>
      </section>
    </>
  )
}
