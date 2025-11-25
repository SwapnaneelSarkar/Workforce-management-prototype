"use client"

import { useEffect, useState } from "react"
import { Upload, CheckCircle2, XCircle, Clock, Eye, Calendar } from "lucide-react"
import { Card, Header, SkeletonLoader, StatusChip, FilePreviewModal, DatePicker } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function DocumentWalletPage() {
  const { candidate, actions } = useDemoData()
  const { pushToast } = useToast()
  const [name, setName] = useState("")
  const [type, setType] = useState("Active RN License")
  const [expiryDate, setExpiryDate] = useState("")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewDoc, setPreviewDoc] = useState<{ name: string; type: string; size?: string } | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 420)
    return () => clearTimeout(timer)
  }, [])

  const verifiedCount = candidate.documents.filter((doc) => doc.status === "Completed").length
  const totalDocs = candidate.documents.length
  const completionPercent = totalDocs > 0 ? Math.round((verifiedCount / totalDocs) * 100) : 0
  const isComplete = completionPercent === 100 && totalDocs > 0

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
        actions={[
          {
            id: "verified",
            label: `${verifiedCount} of ${totalDocs} verified`,
            variant: "secondary",
          },
        ]}
      />

      {/* Completion Banner */}
      {isComplete && (
        <div className="rounded-2xl border border-success/40 bg-success/10 px-6 py-4">
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
              <span>
                {candidate.documents.filter((d) => d.status === "Pending Verification").length} Pending Verification
              </span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-destructive" />
              <span>
                {candidate.documents.filter((d) => d.status === "Expired" || d.status === "Validation Failed").length} Issues
              </span>
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
              className="ph5-input w-full"
              aria-label="Document type"
              disabled={uploading}
            >
              {[
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
              ))}
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
              />
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
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

      {/* Required Documents List */}
      {candidate.onboarding.requiredDocuments.length > 0 && (
        <Card title="Required Documents List" subtitle="Auto-generated based on your questionnaire answers.">
          <div className="space-y-2">
            {candidate.onboarding.requiredDocuments.map((docType) => {
              const doc = candidate.documents.find((d) => d.type === docType)
              const hasDoc = doc && doc.status === "Completed"
              return (
                <div
                  key={docType}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2",
                    hasDoc ? "border-success/40 bg-success/5" : "border-border",
                  )}
                >
                  <span className={cn("text-sm text-foreground", hasDoc && "font-semibold")}>{docType}</span>
                  {hasDoc ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <StatusChip label={doc ? doc.status : "Pending Upload"} tone={doc ? getStatusTone(doc.status) : "warning"} />
                  )}
                </div>
              )
            })}
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
              <div key={doc.id} className="rounded-[14px] border border-border p-4">
                <div className="flex items-start justify-between text-xs mb-3">
                  <span className="inline-flex rounded-full bg-[#EDF2F7] px-2 py-0.5 font-semibold uppercase text-muted-foreground">
                    {doc.type}
                  </span>
                  <StatusChip label={doc.status} tone={getStatusTone(doc.status)} />
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
                </div>
                {doc.status === "Pending Verification" && (
                  <div className="mt-3 rounded-lg border border-warning/40 bg-warning/5 px-3 py-2 text-xs text-warning">
                    <p className="font-semibold">Awaiting verification</p>
                    <p className="text-warning/80">Compliance team will review within 24 hours.</p>
                  </div>
                )}
                {doc.status === "Validation Failed" && (
                  <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    <p className="font-semibold">Validation failed</p>
                    <p className="text-destructive/80">Please replace with a valid document.</p>
                  </div>
                )}
                {doc.status === "Expired" && (
                  <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    <p className="font-semibold">Expired</p>
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
