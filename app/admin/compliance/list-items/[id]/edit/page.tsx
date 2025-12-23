"use client"

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { ArrowLeft, FileText, Upload } from "lucide-react"
import {
  getComplianceListItemById,
  updateComplianceListItem,
  type ComplianceListItem,
} from "@/lib/admin-local-db"

export default function EditComplianceListItemPage() {
  const params = useParams()
  const router = useRouter()
  const { pushToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [item, setItem] = useState<ComplianceListItem | null>(null)
  const [issuerFile, setIssuerFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "Background and Identification" as ComplianceListItem["category"],
    expirationType: "Expiration Date" as ComplianceListItem["expirationType"],
    expirationRuleValue: undefined as number | undefined,
    expirationRuleInterval: "Days" as "Days" | "Weeks" | "Months" | "Years" | undefined,
    issuerRequirement: false,
    issuer: "",
    responseStyle: "Pending File Upload" as ComplianceListItem["responseStyle"],
    uploadAttachment: "",
    linkUrl: "",
    instructionalNotes: "",
    displayToCandidate: true,
    isActive: true,
  })

  useEffect(() => {
    const itemId = params.id as string
    const existingItem = getComplianceListItemById(itemId)
    if (existingItem) {
      setItem(existingItem)
      setFormData({
        name: existingItem.name,
        category: existingItem.category,
        expirationType: existingItem.expirationType,
        expirationRuleValue: existingItem.expirationRuleValue,
        expirationRuleInterval: existingItem.expirationRuleInterval,
        issuerRequirement: existingItem.issuerRequirement ?? false,
        issuer: existingItem.issuer ?? "",
        responseStyle: existingItem.responseStyle ?? "Pending File Upload",
        uploadAttachment: existingItem.uploadAttachment ?? "",
        linkUrl: existingItem.linkUrl ?? "",
        instructionalNotes: existingItem.instructionalNotes ?? "",
        displayToCandidate: existingItem.displayToCandidate,
        isActive: existingItem.isActive,
      })
    }
    setLoading(false)
  }, [params.id])

  const handleInputChange = (field: keyof typeof formData) => (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    if (field === "expirationRuleValue") {
      const numValue = e.target.value === "" ? undefined : Number(e.target.value)
      setFormData((prev) => ({ ...prev, [field]: numValue }))
    } else if (field === "responseStyle") {
      const newResponseStyle = e.target.value as ComplianceListItem["responseStyle"]
      // Update displayToCandidate default based on responseStyle (only if not already set)
      const defaultDisplayToCandidate = newResponseStyle === "Internal Task" ? false : true
      setFormData((prev) => ({ 
        ...prev, 
        [field]: newResponseStyle,
        // Only update displayToCandidate if it matches the old default
        displayToCandidate: prev.responseStyle === "Internal Task" && prev.displayToCandidate === false 
          ? defaultDisplayToCandidate 
          : prev.displayToCandidate
      }))
    } else {
      const value = field === "displayToCandidate" || field === "isActive" || field === "issuerRequirement"
        ? (e.target as HTMLInputElement).checked
        : e.target.value
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleIssuerUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setIssuerFile(file)
      // Store the file name in the issuer field
      setFormData((prev) => ({ ...prev, issuer: file.name }))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!item) return

    if (!formData.name.trim()) {
      pushToast({ title: "Validation Error", description: "Please enter a compliance item name." })
      return
    }

    setIsSubmitting(true)

    try {
      const updated = updateComplianceListItem(item.id, {
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

      if (updated) {
        pushToast({ title: "Success", description: `Compliance list item "${updated.name}" has been updated successfully.` })
        router.push("/admin/compliance/list-items")
      } else {
        pushToast({ title: "Error", description: "Failed to update compliance list item. Please try again." })
      }
    } catch (error) {
      pushToast({ title: "Error", description: "Failed to update compliance list item. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header
          title="Loading..."
          subtitle=""
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Compliance List Items", href: "/admin/compliance/list-items" },
            { label: "Edit" },
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

  if (!item) {
    return (
      <>
        <Header
          title="Compliance List Item Not Found"
          subtitle=""
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Compliance List Items", href: "/admin/compliance/list-items" },
            { label: "Not Found" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Compliance list item not found.</p>
            <Link href="/admin/compliance/list-items" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Back to List Items
            </Link>
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      <Header
        title="Edit Compliance List Item"
        subtitle="Update compliance item details."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Compliance List Items", href: "/admin/compliance/list-items" },
          { label: item.name },
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
                <p className="mt-1 text-sm text-muted-foreground">Update compliance item details.</p>
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
                    <div className="space-y-2">
                      <label
                        htmlFor="issuer-upload"
                        className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-accent cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        {issuerFile ? "Change File" : "Upload Issuer Document"}
                      </label>
                      <input
                        id="issuer-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleIssuerUpload}
                        className="hidden"
                        required={formData.issuerRequirement && !formData.issuer}
                      />
                      {(issuerFile || formData.issuer) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{issuerFile ? issuerFile.name : formData.issuer}</span>
                        </div>
                      )}
                    </div>
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
                      placeholder="Add Attachment"
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
                  {isSubmitting ? "Updating..." : "Update Compliance Item"}
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




