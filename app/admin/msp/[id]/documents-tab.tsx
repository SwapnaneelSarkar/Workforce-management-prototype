"use client"

import { Card } from "@/components/system"
import { FileText } from "lucide-react"

type MSPDocumentsTabProps = {
  mspId: string
}

export default function MSPDocumentsTab({ mspId }: MSPDocumentsTabProps) {
  return (
    <Card>
      <div className="py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold text-foreground mb-2">
          Documents
        </p>
        <p className="text-sm text-muted-foreground">
          Document management functionality will be available in a future release.
        </p>
      </div>
    </Card>
  )
}

