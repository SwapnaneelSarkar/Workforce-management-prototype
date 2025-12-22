"use client"

import { useEffect, useState, useMemo } from "react"
import { Upload, CheckCircle2, XCircle, Clock, Eye, Calendar, Trash2 } from "lucide-react"
import { Card, Header, SkeletonLoader, StatusChip, FilePreviewModal, DatePicker } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  getOccupationByCode, 
  getActiveOccupations,
  getAllComplianceListItems,
  getOccupationSpecialtiesByOccupation,
  type ComplianceListItem,
} from "@/lib/admin-local-db"

export default function DocumentWalletPage() {
  const { candidate, actions, organization } = useDemoData()
  const { data: localDb, markDocumentUploaded, removeDocumentUploaded, saveOnboardingDetails } = useLocalDb()
  const { pushToast } = useToast()
  const today = new Date().toISOString().split("T")[0]
  const [name, setName] = useState("")
  const [type, setType] = useState("Active RN License")
  const [expiryDate, setExpiryDate] = useState("")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewDoc, setPreviewDoc] = useState<{ name: string; type: string; size?: string } | null>(null)
  const [occupationOptions, setOccupationOptions] = useState<Array<{ label: string; value: string }>>([])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 420)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const occupations = getActiveOccupations()
        setOccupationOptions(occupations.map((occ) => ({ label: occ.name, value: occ.code })))
      } catch (error) {
        console.warn("Failed to load occupations", error)
      }
    }
  }, [])

  const currentOccupationCode = (localDb.onboardingDetails.occupation as string | undefined) || ""
  // Get candidate specialties from profile (saved via updateProfile)
  const candidateSpecialties = candidate.profile.specialties || []

  // Get compliance wallet items from admin wallet templates (primary source)
  // Wallet Template from admin feeds this list
  // If candidate has multiple specialties, items from all specialties are included
  const complianceWalletItems = useMemo(() => {
    if (!currentOccupationCode) {
      return []
    }
    
    const occupation = getOccupationByCode(currentOccupationCode)
    if (!occupation) {
      return []
    }

    const itemSet = new Set<string>()
    
    // Get admin wallet templates for this occupation
    // If candidate has multiple specialties, get templates for all specialties
    if (typeof window !== "undefined") {
      try {
        const {
          getAdminWalletTemplatesByOccupation,
          getAdminWalletTemplatesByOccupationAndSpecialty,
          getComplianceListItemById,
        } = require("@/lib/admin-local-db")
        
        // Get specialty codes from candidate profile
        const candidateSpecialtyCodes = candidateSpecialties.map((specName) => {
          // Try to find specialty by name or code
          const allSpecialties = require("@/lib/admin-local-db").getAllSpecialties()
          const specialty = allSpecialties.find(
            (s: any) => s.name === specName || s.code === specName
          )
          return specialty?.code
        }).filter(Boolean) as string[]

        // If candidate has specialties, get templates for each specialty
        if (candidateSpecialtyCodes.length > 0) {
          candidateSpecialtyCodes.forEach((specialtyCode) => {
            const specialtyTemplates = getAdminWalletTemplatesByOccupationAndSpecialty(
              occupation.code,
              specialtyCode
            )
            specialtyTemplates.forEach((template) => {
              template.listItemIds.forEach((listItemId) => {
                const listItem = getComplianceListItemById(listItemId)
                if (listItem && listItem.isActive) {
                  itemSet.add(listItem.name)
                }
              })
            })
          })
        }
        
        // Also get occupation-based templates (without specialty)
        const occupationTemplates = getAdminWalletTemplatesByOccupation(occupation.code)
        occupationTemplates.forEach((template) => {
          // Only include if it doesn't have a specialty (general occupation template)
          if (!template.specialtyId) {
            template.listItemIds.forEach((listItemId) => {
              const listItem = getComplianceListItemById(listItemId)
              if (listItem && listItem.isActive) {
                itemSet.add(listItem.name)
              }
            })
          }
        })
      } catch (error) {
        console.warn("Failed to load admin wallet templates", error)
      }
    }

    // Also add all compliance list items that are marked for candidate display
    // These are general items not specific to any occupation
    const allComplianceItems = getAllComplianceListItems()
    const displayableItems = allComplianceItems.filter((item) => item.displayToCandidate && item.isActive)
    displayableItems.forEach((item) => {
      itemSet.add(item.name)
    })

    // If candidate has multiple specialties, all items from matching wallet templates are shown
    // This ensures items from both specialties are included

    return Array.from(itemSet)
  }, [currentOccupationCode, candidateSpecialties])

  // Group compliance items by category (expanded view)
  const complianceItemsByCategory = useMemo(() => {
    const allComplianceItems = getAllComplianceListItems()
    
    // Create a map of item names to compliance list items for quick lookup
    const itemMap = new Map<string, ComplianceListItem>()
    allComplianceItems.forEach((item) => {
      if (item.displayToCandidate && item.isActive) {
        itemMap.set(item.name, item)
      }
    })

    // Group items by category
    const grouped: Record<string, Array<{ name: string; expirationType?: string; category: string }>> = {}
    
    complianceWalletItems.forEach((itemName) => {
      const complianceItem = itemMap.get(itemName)
      if (complianceItem) {
        // Item exists in compliance list items - use its category
        const category = complianceItem.category
        if (!grouped[category]) {
          grouped[category] = []
        }
        // Avoid duplicates
        if (!grouped[category].some((item) => item.name === itemName)) {
          grouped[category].push({
            name: complianceItem.name,
            expirationType: complianceItem.expirationType,
            category: complianceItem.category,
          })
        }
      } else {
        // Item from wallet template but not in compliance list items - put in "Other"
        if (!grouped["Other"]) {
          grouped["Other"] = []
        }
        // Avoid duplicates
        if (!grouped["Other"].some((item) => item.name === itemName)) {
          grouped["Other"].push({
            name: itemName,
            category: "Other",
          })
        }
      }
    })

    // Sort items within each category by name
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name))
    })

    return grouped
  }, [complianceWalletItems])

  const handleOccupationChange = (occupationCode: string) => {
    saveOnboardingDetails({ occupation: occupationCode })
    // Initialize wallet with the selected occupation
    if (occupationCode) {
      actions.initializeCandidateWalletWithOccupation(occupationCode)
    }
    pushToast({ 
      title: "Occupation selected", 
      description: "Compliance wallet has been updated based on your occupation.", 
      type: "success" 
    })
  }

  // Use compliance wallet items as the required documents list
  // These come from wallet templates and admin compliance list items
  const requiredDocs = complianceWalletItems.length > 0 
    ? complianceWalletItems 
    : candidate.onboarding.requiredDocuments.length > 0 
      ? candidate.onboarding.requiredDocuments 
      : []
  const uploadedDocEntries = localDb.uploadedDocuments
  const uploadedDocSet = new Set(Object.keys(uploadedDocEntries))
  const uploadedCount = requiredDocs.filter((doc) => uploadedDocSet.has(doc)).length
  const totalDocs = requiredDocs.length
  const completionPercent = totalDocs > 0 ? Math.round((uploadedCount / totalDocs) * 100) : 0
  const isComplete = totalDocs > 0 && uploadedCount === totalDocs
  const verifiedCount = uploadedCount

  const onUpload = async () => {
    if (!name.trim()) {
      pushToast({ title: "Document name required", description: "Please enter a document name.", type: "error" })
      return
    }
    if (!expiryDate) {
      pushToast({ title: "Expiry date required", description: "Please select an expiry date.", type: "error" })
      return
    }
    setUploading(true)
    try {
      // Upload with "Pending Verification" status initially
      const newDoc = await actions.uploadDocument({ name: name.trim(), type })
      // Update with expiry date
      await actions.replaceDocument(newDoc.id, { expiresOn: expiryDate, status: "Pending Verification" })
      markDocumentUploaded(type, { name: name.trim(), source: "wallet" })
      pushToast({ title: "Document uploaded", description: "Awaiting verification. Compliance will review within 24 hours.", type: "success" })
      setName("")
      setExpiryDate("")
    } catch (error) {
      pushToast({ title: "Upload failed", description: "Please try again.", type: "error" })
    } finally {
      setUploading(false)
    }
  }

  const replaceDocument = async (docId: string) => {
    try {
      await actions.replaceDocument(docId, { status: "Pending Verification" })
      pushToast({ title: "Document replaced", description: "Awaiting validation.", type: "success" })
    } catch (error) {
      pushToast({ title: "Replace failed", description: "Please try again.", type: "error" })
    }
  }

  const verifyDocument = async (docId: string) => {
    try {
      await actions.replaceDocument(docId, { status: "Completed" })
      pushToast({ title: "Document verified", type: "success" })
    } catch (error) {
      pushToast({ title: "Verification failed", type: "error" })
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      return
    }
    try {
      const deletedDoc = await actions.deleteDocument(docId)
      if (deletedDoc) {
        removeDocumentUploaded(deletedDoc.type)
        pushToast({ title: "Document deleted", description: "The document has been removed from your compliance wallet.", type: "success" })
      }
    } catch (error) {
      pushToast({ title: "Delete failed", description: "Please try again.", type: "error" })
    }
  }

  const handlePreview = (doc: { name: string; type: string; status: string }) => {
    setPreviewDoc({
      name: doc.name,
      type: doc.type,
      size: "2.4 MB", // Mock size
    })
  }

  const getStatusTone = (status: string) => {
    switch (status) {
      case "Completed":
        return "success"
      case "Pending Verification":
        return "warning"
      case "Expired":
        return "danger"
      case "Validation Failed":
        return "danger"
      case "Pending Upload":
        return "info"
      default:
        return "neutral"
    }
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Compliance Wallet"
        subtitle="Upload and manage all required documents. Each document will be verified by our compliance team."
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Documents" },
        ]}
      />

      {/* Occupation Selection */}
      {!currentOccupationCode && (
        <Card>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Select Your Occupation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please select your occupation to load the appropriate compliance wallet template. You can set this in your profile setup.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/candidate/profile-setup">Complete Profile Setup</Link>
              </Button>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-semibold text-foreground">
                  Or select occupation now:
                </label>
                <select
                  value=""
                  onChange={(e) => handleOccupationChange(e.target.value)}
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                >
                  <option value="">Select your occupation</option>
                  {occupationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Show message when occupation is selected but no documents found */}
      {currentOccupationCode && complianceWalletItems.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              No compliance documents found for your selected occupation. Please contact support or check back later.
            </p>
            <p className="text-xs text-muted-foreground">
              Occupation: {getOccupationByCode(currentOccupationCode)?.name || currentOccupationCode}
            </p>
          </div>
        </Card>
      )}

      {/* Completion Banner */}
      {isComplete && (
        <div className="rounded-2xl border-2 border-success/50 bg-gradient-to-r from-success/15 via-success/10 to-success/5 px-6 py-5 shadow-lg backdrop-blur-sm animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="font-semibold text-success">Compliance Profile Complete!</p>
                <p className="text-sm text-success/80">All required documents are verified. You're cleared for shift claiming.</p>
              </div>
            </div>
            <Button
              onClick={() => {
                window.location.href = "/candidate/jobs"
              }}
              className="bg-success text-white hover:bg-success/90"
            >
              Browse Jobs
            </Button>
          </div>
        </div>
      )}

      {/* Compliance Progress Indicator */}
      <Card title="Compliance Progress" subtitle="Track your document completion status in real-time.">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Documents verified</span>
            <span className="font-semibold text-foreground">
              {verifiedCount} / {totalDocs}
            </span>
          </div>
          <div className="ph5-progress h-3">
            <div
              className={cn(
                "ph5-progress-bar transition-all",
                isComplete ? "bg-success" : completionPercent >= 75 ? "bg-primary" : "bg-warning",
              )}
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span>{verifiedCount} Complete</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-warning" />
              <span>{Math.max(totalDocs - verifiedCount, 0)} Remaining</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-destructive" />
              <span>0 Issues</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Upload Document Section */}
      <Card title="Upload Document" subtitle="Choose document type, upload file, and add expiry date.">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Choose Document Type <span className="text-destructive">*</span>
            </label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="ph5-input w-full cursor-pointer"
              aria-label="Document type"
              disabled={uploading}
            >
              {requiredDocs.length > 0 ? (
                requiredDocs.map((option) => (
                  <option key={option}>{option}</option>
                ))
              ) : (
                [
                  "Resume",
                  "Date of birth proof",
                  "Certifications",
                  "References",
                  "License",
                  "Active RN License",
                  "Background Check",
                  "Drug Screening",
                  "CPR Certification",
                  "ACLS Certification",
                  "BLS Certification",
                  "PALS Certification",
                  "TNCC Certification",
                  "Reference",
                  "Skills Checklist",
                  "Travel Agreement",
                  "Immunization Record",
                  "Fatigue Acknowledgement",
                ].map((option) => (
                  <option key={option}>{option}</option>
                ))
              )}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Document Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g., RN_License_2024.pdf"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={uploading}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Expiry Date <span className="text-destructive">*</span>
              </label>
              <DatePicker
                label=""
                value={expiryDate}
                onChange={setExpiryDate}
                min={today}
              />
            </div>
          </div>

          <div className="rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-blue-50/50 via-muted/20 to-transparent p-8 text-center hover:border-primary/50 hover:bg-gradient-to-br hover:from-blue-50/70 hover:via-muted/30 transition-all duration-300 group">
            <Upload className="mx-auto h-10 w-10 text-primary mb-3 group-hover:scale-110 group-hover:text-primary transition-all duration-300" />
            <p className="text-sm font-semibold text-foreground mb-1">Upload File (Mock)</p>
            <p className="text-xs text-muted-foreground mb-3">
              In production, this would allow file selection. For now, clicking upload will simulate the upload process.
            </p>
            <Button onClick={onUpload} disabled={!name.trim() || !expiryDate || uploading} aria-label="Upload document">
              {uploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Required Documents List - Grouped by Category */}
      {requiredDocs.length > 0 && (
        <Card title="Required Documents List" subtitle="AUTO-GENERATED BASED ON YOUR QUESTIONNAIRE ANSWERS.">
          <div className="space-y-6">
            {Object.keys(complianceItemsByCategory).length > 0 ? (
              // Grouped by category (expanded view)
              Object.entries(complianceItemsByCategory).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const docUploaded = uploadedDocSet.has(item.name)
                      const docMeta = uploadedDocEntries[item.name]
                      return (
                        <div
                          key={item.name}
                          className={cn(
                            "flex items-center justify-between rounded-lg border px-3 py-2",
                            docUploaded ? "border-success/40 bg-success/5" : "border-border",
                          )}
                        >
                          <div className="flex flex-col">
                            <span className={cn("text-sm text-foreground", docUploaded && "font-semibold")}>
                              {item.name}
                            </span>
                            {docUploaded && docMeta?.uploadedAt && (
                              <span className="text-xs text-muted-foreground">
                                Uploaded {new Date(docMeta.uploadedAt).toLocaleDateString()}
                              </span>
                            )}
                            {item.expirationType && item.expirationType !== "None" && (
                              <span className="text-xs text-muted-foreground">
                                Expiration: {item.expirationType}
                              </span>
                            )}
                          </div>
                          {docUploaded ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <StatusChip label="Pending Upload" tone="warning" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            ) : (
              // Fallback: show flat list if no categories
              <div className="space-y-2">
                {requiredDocs.map((docType) => {
                  const docUploaded = uploadedDocSet.has(docType)
                  const docMeta = uploadedDocEntries[docType]
                  return (
                    <div
                      key={docType}
                      className={cn(
                        "flex items-center justify-between rounded-lg border px-3 py-2",
                        docUploaded ? "border-success/40 bg-success/5" : "border-border",
                      )}
                    >
                      <div className="flex flex-col">
                        <span className={cn("text-sm text-foreground", docUploaded && "font-semibold")}>{docType}</span>
                        {docUploaded && docMeta?.uploadedAt && (
                          <span className="text-xs text-muted-foreground">Uploaded {new Date(docMeta.uploadedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      {docUploaded ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <StatusChip label="Pending Upload" tone="warning" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Document Wallet */}
      {loading ? (
        <SkeletonLoader lines={6} />
      ) : (
        <Card title="Document Wallet" subtitle="Manage existing documents. Replace invalid documents or view details.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {candidate.documents.map((doc) => (
              <div key={doc.id} className="rounded-xl border-2 border-border/80 p-5 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 bg-card/80 backdrop-blur-sm group">
                <div className="flex items-start justify-between text-xs mb-3">
                  <span className="inline-flex rounded-full bg-gradient-to-r from-[#EDF2F7] to-[#E2E8F0] px-3 py-1 font-semibold uppercase text-muted-foreground shadow-sm">
                    {doc.type}
                  </span>
                  <StatusChip label={doc.status} tone={getStatusTone(doc.status)} className="min-w-[96px] justify-center" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{doc.name}</p>
                <p className="text-xs text-muted-foreground mb-3">Updated {doc.lastUpdated}</p>
                <div className="flex items-center justify-between text-xs font-semibold mb-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Expires {doc.expiresOn}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePreview(doc)} className="flex-1">
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                  {doc.status === "Pending Verification" && (
                    <Button size="sm" variant="outline" onClick={() => verifyDocument(doc.id)}>
                      Verify
                    </Button>
                  )}
                  {(doc.status === "Validation Failed" || doc.status === "Expired") && (
                    <Button size="sm" variant="outline" onClick={() => replaceDocument(doc.id)}>
                      Replace
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Delete document"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                {doc.status === "Pending Verification" && (
                  <div className="mt-3 rounded-xl border-2 border-warning/50 bg-gradient-to-r from-warning/10 to-warning/5 px-4 py-3 text-xs text-warning shadow-sm">
                    <p className="font-semibold mb-1">Awaiting verification</p>
                    <p className="text-warning/80">Compliance team will review within 24 hours.</p>
                  </div>
                )}
                {doc.status === "Validation Failed" && (
                  <div className="mt-3 rounded-xl border-2 border-destructive/50 bg-gradient-to-r from-destructive/10 to-destructive/5 px-4 py-3 text-xs text-destructive shadow-sm">
                    <p className="font-semibold mb-1">Validation failed</p>
                    <p className="text-destructive/80">Please replace with a valid document.</p>
                  </div>
                )}
                {doc.status === "Expired" && (
                  <div className="mt-3 rounded-xl border-2 border-destructive/50 bg-gradient-to-r from-destructive/10 to-destructive/5 px-4 py-3 text-xs text-destructive shadow-sm">
                    <p className="font-semibold mb-1">Expired</p>
                    <p className="text-destructive/80">Please upload a renewed document.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {!candidate.documents.length ? (
            <p className="text-sm text-muted-foreground">No documents uploaded yet. Start by uploading your required documents above.</p>
          ) : null}
        </Card>
      )}

      <FilePreviewModal
        open={!!previewDoc}
        fileName={previewDoc?.name || ""}
        fileType={previewDoc?.type || ""}
        fileSize={previewDoc?.size}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  )
}
