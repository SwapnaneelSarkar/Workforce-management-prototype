"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { DataTable } from "@/components/system/table"
import { StatusChip } from "@/components/system/status-chip"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getAllInvoices,
  getAllTimecards,
  upsertInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  type LocalDbInvoice,
  type LocalDbInvoiceStatus,
} from "@/lib/local-db"
import { getCurrentOrganization } from "@/lib/organization-local-db"
import { Upload, FileText, CheckCircle2, Trash2 } from "lucide-react"

type StatusFilter = "all" | LocalDbInvoiceStatus

export default function OrganizationInvoicingPage() {
  const [orgId, setOrgId] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<LocalDbInvoice[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const [uploadFileName, setUploadFileName] = useState("")
  const [uploadAssignment, setUploadAssignment] = useState<string>("")
  const [uploadAmount, setUploadAmount] = useState<string>("")

  useEffect(() => {
    if (typeof window === "undefined") return
    const currentOrg = getCurrentOrganization()
    setOrgId(currentOrg)

    const all = getAllInvoices().filter((inv) =>
      currentOrg ? inv.organizationId === currentOrg : true,
    )
    setInvoices(all)
  }, [])

  const relatedAssignments = useMemo(() => {
    const approvedTimecards = getAllTimecards().filter(
      (tc) => tc.status === "approved",
    )
    return approvedTimecards.map((tc) => ({
      id: tc.id,
      label: `${tc.candidateName} - ${tc.assignmentName.replace(" -", "")}`,
      amount: tc.totalAmount,
    }))
  }, [])

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        if (statusFilter === "all") return true
        return inv.status === statusFilter
      })
      .filter((inv) => {
        if (!search.trim()) return true
        const needle = search.toLowerCase()
        return (
          inv.fileName.toLowerCase().includes(needle) ||
          inv.relatedAssignment.toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime())
  }, [invoices, statusFilter, search])

  const summary = useMemo(() => {
    const total = invoices.length
    const pending = invoices.filter((inv) => inv.status === "pending").length
    const paid = invoices.filter((inv) => inv.status === "paid").length
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0)
    return { total, pending, paid, totalAmount }
  }, [invoices])

  const statusToTone = (status: LocalDbInvoiceStatus) => {
    switch (status) {
      case "paid":
        return { label: "Paid", tone: "success" as const }
      case "pending":
      default:
        return { label: "Pending", tone: "warning" as const }
    }
  }

  const handleUpload = () => {
    if (!orgId) return
    if (!uploadFileName.trim() || !uploadAssignment) return

    const assignment = relatedAssignments.find((a) => a.id === uploadAssignment)
    const today = new Date()
    const isoDate = today.toISOString().slice(0, 10)

    const amount =
      uploadAmount.trim() && !isNaN(Number(uploadAmount))
        ? Number(uploadAmount)
        : assignment?.amount ?? 0

    const next: LocalDbInvoice = {
      id: `inv_${Date.now()}`,
      organizationId: orgId,
      fileName: uploadFileName.trim(),
      relatedAssignment: assignment
        ? assignment.label
        : uploadAssignment,
      timecardId: assignment?.id,
      dateUploaded: isoDate,
      amount,
      status: "pending",
    }

    const saved = upsertInvoice(next)
    setInvoices((prev) => [...prev, saved])
    setUploadFileName("")
    setUploadAssignment("")
    setUploadAmount("")
  }

  const handleMarkPaid = (invoice: LocalDbInvoice) => {
    const updated = updateInvoiceStatus(invoice.id, "paid")
    if (updated) {
      setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)))
    }
  }

  const handleDelete = (invoice: LocalDbInvoice) => {
    deleteInvoice(invoice.id)
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoice.id))
  }

  return (
    <>
      <Header
        title="Invoicing"
        subtitle="Upload and manage invoices generated from approved timecards and assignments."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Time & Billing", href: "/organization/time-billing" },
          { label: "Invoicing" },
        ]}
      />

      <section className="space-y-6">
        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Total Invoices
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">{summary.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Pending Payment
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">{summary.pending}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Paid
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">{summary.paid}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Total Amount
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                ${summary.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </Card>
        </div>

        {/* Upload section */}
        <Card
          title="Upload Invoice"
          subtitle="Upload PDF invoices related to approved timecards."
        >
          <div className="grid gap-4 md:grid-cols-[2fr,2fr,1fr,auto] items-end">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Invoice File
              </p>
              <Input
                placeholder="Invoice_RN_ICU_Jan2025.pdf"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Related Assignment
              </p>
              <Select
                value={uploadAssignment}
                onValueChange={(value) => {
                  setUploadAssignment(value)
                  const assignment = relatedAssignments.find((a) => a.id === value)
                  if (assignment) {
                    setUploadAmount(String(assignment.amount))
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select approved assignment" />
                </SelectTrigger>
                <SelectContent>
                  {relatedAssignments.map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      {assignment.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Amount
              </p>
              <Input
                placeholder="2700.00"
                value={uploadAmount}
                onChange={(e) => setUploadAmount(e.target.value)}
              />
            </div>
            <Button
              className="whitespace-nowrap"
              onClick={handleUpload}
              disabled={!uploadFileName.trim() || !uploadAssignment}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Invoice
            </Button>
          </div>
        </Card>

        {/* Filters */}
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full max-w-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Search
              </p>
              <Input
                placeholder="Search by invoice or assignment..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Status
                </span>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                >
                  <SelectTrigger className="min-w-[160px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Invoices table */}
        <Card title="Invoices" subtitle="Manage invoices tied to approved timecards.">
          <DataTable<LocalDbInvoice>
            columns={[
              {
                id: "fileName",
                label: "Invoice File",
                render: (inv) => (
                  <span className="text-sm font-medium text-foreground">{inv.fileName}</span>
                ),
              },
              {
                id: "relatedAssignment",
                label: "Related Assignment",
                render: (inv) => (
                  <span className="text-sm text-foreground">{inv.relatedAssignment}</span>
                ),
              },
              {
                id: "dateUploaded",
                label: "Date Uploaded",
                render: (inv) => (
                  <span className="text-sm text-foreground">
                    {new Date(inv.dateUploaded).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                ),
              },
              {
                id: "amount",
                label: "Amount",
                align: "right",
                render: (inv) => (
                  <span className="text-sm font-semibold text-foreground">
                    ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                ),
              },
              {
                id: "status",
                label: "Status",
                render: (inv) => {
                  const { label, tone } = statusToTone(inv.status)
                  return <StatusChip label={label} tone={tone} />
                },
              },
              {
                id: "actions",
                label: "Actions",
                align: "right",
                render: (inv) => (
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href="#">
                        View
                      </Link>
                    </Button>
                    {inv.status === "pending" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMarkPaid(inv)}
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Mark Paid
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(inv)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={filteredInvoices}
          />
        </Card>
      </section>
    </>
  )
}
