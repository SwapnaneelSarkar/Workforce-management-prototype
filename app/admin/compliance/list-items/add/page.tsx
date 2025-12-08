"use client"

import { useState, Suspense, type FormEvent, type ChangeEvent } from "react"
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

function AddComplianceListItemForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { pushToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: (searchParams.get("category") as ComplianceListItem["category"]) || "Background and Identification",
    expirationType: "Expiration Date" as ComplianceListItem["expirationType"],
    expirationRuleValue: undefined as number | undefined,
    expirationRuleInterval: "Days" as "Days" | "Weeks" | "Months" | "Years" | undefined,
    issuerRequirement: false,
    issuer: "",
    responseStyle: "Pending File Upload" as ComplianceListItem["responseStyle"],
    uploadAttachment: "",
    linkUrl: "",
    instructionalNotes: "",
    displayToCandidate: true, // Default will be set based on responseStyle
    isActive: true,
  })

  const handleInputChange = (field: keyof typeof formData) => (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    if (field === "expirationRuleValue") {
      const numValue = e.target.value === "" ? undefined : Number(e.target.value)
      setFormData((prev) => ({ ...prev, [field]: numValue }))
    } else if (field === "responseStyle") {
      const newResponseStyle = e.target.value as ComplianceListItem["responseStyle"]
      // Update displayToCandidate default based on responseStyle
      const defaultDisplayToCandidate = newResponseStyle === "Internal Task" ? false : true
      setFormData((prev) => ({ 
        ...prev, 
        [field]: newResponseStyle,
        displayToCandidate: defaultDisplayToCandidate
      }))
    } else {
      const value = field === "displayToCandidate" || field === "isActive" || field === "issuerRequirement"
        ? (e.target as HTMLInputElement).checked
        : e.target.value
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
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
        expirationRuleValue: formData.expirationType === "Expiration Rule" ? formData.expirationRuleValue : undefined,
        expirationRuleInterval: formData.expirationType === "Expiration Rule" ? formData.expirationRuleInterval : undefined,
        issuerRequirement: formData.issuerRequirement,
        issuer: formData.issuerRequirement ? formData.issuer.trim() : undefined,
        responseStyle: formData.responseStyle,
        uploadAttachment: formData.responseStyle === "Download Attachment and Upload" ? formData.uploadAttachment.trim() : undefined,
        linkUrl: formData.responseStyle === "Link" ? formData.linkUrl.trim() : undefined,
        instructionalNotes: formData.instructionalNotes.trim() || undefined,
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
                    <option value="Background and Identification">Background and Identification</option>
                    <option value="Education and Assessments">Education and Assessments</option>
                    <option value="Immigration">Immigration</option>
                    <option value="Licenses">Licenses</option>
                    <option value="Certifications">Certifications</option>
                    <option value="Employee Health">Employee Health</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Other Qualifications">Other Qualifications</option>
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
                    <option value="Expiration Date">Expiration Date</option>
                    <option value="Non-Expirable">Non-Expirable</option>
                    <option value="Expiration Rule">Expiration Rule</option>
                  </select>
                </div>

                {formData.expirationType === "Expiration Rule" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Expiration Rule <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">Expires</span>
                      <Input
                        type="number"
                        min="1"
                        required={formData.expirationType === "Expiration Rule"}
                        value={formData.expirationRuleValue ?? ""}
                        onChange={handleInputChange("expirationRuleValue")}
                        className="w-24"
                        placeholder="30"
                      />
                      <span className="text-sm text-foreground">In</span>
                      <select
                        value={formData.expirationRuleInterval ?? "Days"}
                        onChange={handleInputChange("expirationRuleInterval")}
                        required={formData.expirationType === "Expiration Rule"}
                        className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Days">Days</option>
                        <option value="Weeks">Weeks</option>
                        <option value="Months">Months</option>
                        <option value="Years">Years</option>
                      </select>
                      <span className="text-sm text-foreground">from the original completion date</span>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.issuerRequirement}
                      onChange={handleInputChange("issuerRequirement")}
                      className="rounded border-border"
                    />
                    <span className="text-sm font-medium text-foreground">Issuer Requirement</span>
                  </label>
                </div>

                {formData.issuerRequirement && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Issuer <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      required={formData.issuerRequirement}
                      value={formData.issuer}
                      onChange={handleInputChange("issuer")}
                      className="w-full"
                      placeholder="e.g., State Board of Nursing"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Response Style <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.responseStyle}
                    onChange={handleInputChange("responseStyle")}
                    required
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Pending File Upload">Pending File Upload</option>
                    <option value="Internal Task">Internal Task</option>
                    <option value="Download Attachment and Upload">Download Attachment and Upload</option>
                    <option value="Link">Link</option>
                  </select>
                </div>

                {formData.responseStyle === "Download Attachment and Upload" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Upload Attachment <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      required={formData.responseStyle === "Download Attachment and Upload"}
                      value={formData.uploadAttachment}
                      onChange={handleInputChange("uploadAttachment")}
                      className="w-full"
                      placeholder="Attachment URL"
                    />
                  </div>
                )}

                {formData.responseStyle === "Link" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Link URL <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="url"
                      required={formData.responseStyle === "Link"}
                      value={formData.linkUrl}
                      onChange={handleInputChange("linkUrl")}
                      className="w-full"
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Instructional Notes
                  </label>
                  <textarea
                    value={formData.instructionalNotes}
                    onChange={handleInputChange("instructionalNotes")}
                    rows={3}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Enter any instructional notes for candidates..."
                  />
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

export default function AddComplianceListItemPage() {
  return (
    <Suspense fallback={
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
          <Card>
            <div className="p-6">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </Card>
        </section>
      </>
    }>
      <AddComplianceListItemForm />
    </Suspense>
  )
}




