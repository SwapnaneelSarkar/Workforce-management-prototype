"use client"

import { useState } from "react"
import { Card, Header, Modal, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function VendorBidsPage() {
  const { organization, vendor, actions } = useDemoData()
  const [bidModal, setBidModal] = useState<{ open: boolean; jobId?: string }>({ open: false })
  const [rate, setRate] = useState("")
  const [availability, setAvailability] = useState("")

  const openBidModal = (jobId: string) => {
    setBidModal({ open: true, jobId })
  }

  const submitBid = async () => {
    if (!bidModal.jobId) return
    await actions.submitVendorBid({
      jobId: bidModal.jobId,
      vendorName: vendor.vendors[0]?.name ?? "Vendor",
      rate,
      availability,
    })
    setBidModal({ open: false })
    setRate("")
    setAvailability("")
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Bid management"
        subtitle="Offer availability and rates for open requisitions."
        breadcrumbs={[
          { label: "Vendor", href: "/vendor/vendors" },
          { label: "Bids" },
        ]}
      />

      <Card title="Available jobs">
        <div className="space-y-3">
          {organization.jobs.slice(0, 6).map((job) => (
            <div key={job.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{job.title}</p>
                <p className="text-xs text-muted-foreground">{job.location} • {job.shift}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusChip label={job.billRate} tone="info" />
                <Button size="sm" onClick={() => openBidModal(job.id)}>
                  Submit bid
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Submitted bids" subtitle="Recent submissions from your team.">
        <div className="space-y-2">
          {vendor.bids.map((bid) => (
            <div key={bid.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span>{bid.vendorName} → {bid.jobId}</span>
              <StatusChip label={bid.status} tone="info" />
            </div>
          ))}
          {!vendor.bids.length ? <p className="text-sm text-muted-foreground">No bids yet.</p> : null}
        </div>
      </Card>

      <Modal open={bidModal.open} onClose={() => setBidModal({ open: false })} title="Submit availability">
        <Input placeholder="Hourly rate (e.g. $82/hr)" value={rate} onChange={(event) => setRate(event.target.value)} />
        <Input placeholder="Availability notes" value={availability} onChange={(event) => setAvailability(event.target.value)} className="mt-3" />
        <Button className="mt-4 w-full" onClick={submitBid} disabled={!rate.trim() || !availability.trim()}>
          Submit bid
        </Button>
      </Modal>
    </div>
  )
}

