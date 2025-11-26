"use client"

import { useEffect } from "react"
import { Download, FileText, X } from "lucide-react"
import { Modal } from "./modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FilePreviewModalProps = {
  open: boolean
  fileName: string
  fileType: string
  fileSize?: string
  onClose: () => void
}

export function FilePreviewModal({ open, fileName, fileType, fileSize, onClose }: FilePreviewModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  const getFileIcon = () => {
    if (fileType.toLowerCase().includes("pdf")) return "📄"
    if (fileType.toLowerCase().includes("image")) return "🖼️"
    if (fileType.toLowerCase().includes("word") || fileType.toLowerCase().includes("doc")) return "📝"
    return "📎"
  }

  return (
    <Modal open={open} onClose={onClose} title="Document preview" size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
          <span className="text-2xl" aria-hidden>
            {getFileIcon()}
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{fileName}</p>
            <p className="text-xs text-muted-foreground">{fileType}</p>
            {fileSize && <p className="text-xs text-muted-foreground">{fileSize}</p>}
          </div>
        </div>

        <div className="relative min-h-[400px] rounded-xl border border-border bg-muted/20 p-8">
          <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
            <FileText className="h-16 w-16 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-foreground">Document preview</p>
              <p className="text-xs text-muted-foreground">
                In production, this would display the actual document content using a document viewer or PDF renderer.
              </p>
            </div>
            <div className="mt-4 rounded-lg border border-dashed border-border bg-card p-6">
              <p className="text-xs text-muted-foreground">
                <strong>Simulated preview:</strong> {fileName}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                This is a frontend-only prototype. In a real application, you would integrate with a document service (e.g., AWS S3, Google Drive API) to fetch and render the actual file.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              // Simulate download
              const link = document.createElement("a")
              link.href = "#"
              link.download = fileName
              link.click()
            }}
            className="inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" aria-hidden />
            Download
          </Button>
        </div>
      </div>
    </Modal>
  )
}


