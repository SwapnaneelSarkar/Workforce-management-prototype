"use client"

import { useState, type ReactNode } from "react"
import { notFound, useParams } from "next/navigation"
import { Building2, FileText, Mail, Phone, ShieldCheck, Users } from "lucide-react"
import { Header, Card, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/system"

export default function VendorDetailPage() {
  const params = useParams<{ id: string }>()
  const { vendor } = useDemoData()
  const { toast } = useToast()
  const vendorSummary = vendor.vendors.find((record) => record.id === params?.id)
  const detail = vendor.details.find((record) => record.vendorId === params?.id)
  const bids = vendor.bids.filter((bid) => bid.vendorName === vendorSummary?.name)

  const [meta, setMeta] = useState({
    description: detail?.description ?? "",
    headcount: detail?.metadata.headcount.toString() ?? "",
  })
  const [metaError, setMetaError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!vendorSummary || !detail) {
    return notFound()
  }

  const handleSave = () => {
    if (!meta.description.trim() || !meta.headcount.trim()) {
      setMetaError("Make sure description and headcount are filled in.")
      return
    }
    setMetaError(null)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast({ title: "Metadata saved", description: "Vendor profile updated for all team members." })
    }, 500)
  }

  return (
    <div className="space-y-6">
      <Header
        title={vendorSummary.name}
        subtitle={`${vendorSummary.tier} vendor • ${vendorSummary.kpis.candidatesSupplied} candidates supplied`}
        breadcrumbs={[
          { label: "Vendor portal", href: "/vendor/vendors" },
          { label: vendorSummary.name },
        ]}
        actions={[
          {
            id: "message",
            label: "Send message",
            variant: "secondary",
            onClick: () => toast({ title: "Message composer coming soon" }),
          },
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_320px]">
        <div className="space-y-6">
          <Card title="Vendor profile" subtitle="Edit metadata used in scorecards.">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="vendor-description" className="text-xs font-semibold uppercase text-muted-foreground">
                  Description
                </label>
                <Textarea
                  id="vendor-description"
                  value={meta.description}
                  onChange={(event) => setMeta((prev) => ({ ...prev, description: event.target.value }))}
                  aria-invalid={!!metaError && !meta.description}
                />
              </div>
              <div>
                <label htmlFor="vendor-headcount" className="text-xs font-semibold uppercase text-muted-foreground">
                  Headcount
                </label>
                <Input
                  id="vendor-headcount"
                  value={meta.headcount}
                  onChange={(event) => setMeta((prev) => ({ ...prev, headcount: event.target.value }))}
                  aria-invalid={!!metaError && !meta.headcount}
                />
              </div>
            </div>
            {metaError ? <p className="text-sm text-destructive">{metaError}</p> : null}
            <Button className="mt-3 w-full md:w-auto" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save metadata"}
            </Button>
          </Card>

          <Card title="Certifications" subtitle="Tracked for security and compliance.">
            <div className="grid gap-3 md:grid-cols-2">
              {detail.certificationsDetailed.map((cert) => (
                <div key={cert.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{cert.name}</p>
                      <p className="text-xs text-muted-foreground">Issuer: {cert.issuer}</p>
                    </div>
                    <StatusChip label={cert.status} tone={cert.status === "Valid" ? "success" : cert.status === "Expiring" ? "warning" : "danger"} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Expires {cert.expiresOn}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Agreements & documents" subtitle="Track master service and data addenda.">
            <div className="grid gap-3 md:grid-cols-2">
              {detail.agreements.map((agreement) => (
                <div key={agreement.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{agreement.title}</p>
                      <p className="text-xs text-muted-foreground">Effective {agreement.effectiveDate}</p>
                    </div>
                    <StatusChip label={agreement.status} tone={agreement.status === "Active" ? "success" : "warning"} />
                  </div>
                </div>
              ))}
              {detail.documents.map((document) => (
                <div key={document.id} className="rounded-xl border border-dashed border-border p-4">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" aria-hidden />
                    {document.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Updated {document.updatedAt}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Recent bids" subtitle="Latest submissions and outcomes.">
            <div className="overflow-x-auto">
              <table className="ph5-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Rate</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid) => (
                    <tr key={bid.id}>
                      <td className="font-semibold text-foreground">{bid.jobId}</td>
                      <td>{bid.rate}</td>
                      <td>
                        <StatusChip label={bid.status} tone={bid.status === "Awarded" ? "success" : bid.status === "Draft" ? "warning" : "info"} />
                      </td>
                      <td>{bid.submittedAt ?? "—"}</td>
                    </tr>
                  ))}
                  {!bids.length && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                        No bids yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card title="Contact">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{detail.contacts[0]?.name}</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" aria-hidden />
                {detail.contacts[0]?.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" aria-hidden />
                {detail.contacts[0]?.phone}
              </div>
            </div>
          </Card>

          <Card title="Team" subtitle="Primary contacts">
            <div className="space-y-3">
              {detail.contacts.map((contact) => (
                <div key={contact.id} className="rounded-xl border border-border p-3">
                  <p className="font-semibold text-foreground">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.role}</p>
                  <p className="text-xs text-muted-foreground">{contact.email}</p>
                  <p className="text-xs text-muted-foreground">{contact.phone}</p>
                  {contact.primary ? <StatusChip label="Primary" tone="info" className="mt-2" /> : null}
                </div>
              ))}
            </div>
          </Card>

          <Card title="Snapshots">
            <div className="space-y-3 text-sm text-muted-foreground">
              <InfoRow icon={<Building2 className="h-4 w-4" aria-hidden />} label="Coverage" value={detail.metadata.coverage.join(", ")} />
              <InfoRow icon={<Users className="h-4 w-4" aria-hidden />} label="Headcount" value={`${detail.metadata.headcount} FTE`} />
              <InfoRow icon={<ShieldCheck className="h-4 w-4" aria-hidden />} label="Avg fill days" value={`${detail.metadata.avgFillDays} days`} />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="secondary">Edit vendor</Button>
              <Button variant="destructive">Suspend vendor</Button>
            </div>
          </Card>
        </aside>
      </section>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}
