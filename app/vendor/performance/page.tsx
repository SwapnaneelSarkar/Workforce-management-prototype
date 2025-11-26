"use client"

import { Card, Header } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"

export default function VendorPerformancePage() {
  const { vendor } = useDemoData()

  return (
    <div className="space-y-6">
      <Header
        title="Performance dashboard"
        subtitle="Snapshot of fulfillment and responsiveness across all vendors."
        breadcrumbs={[
          { label: "Vendor", href: "/vendor/vendors" },
          { label: "Performance" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {vendor.kpis.map((kpi) => (
          <Card key={kpi.id}>
            <p className="text-xs font-semibold uppercase text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-semibold text-foreground">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <Card title="Vendor snapshot">
        <div className="space-y-3">
          {vendor.vendors.map((partner) => (
            <div key={partner.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{partner.name}</p>
                <p className="text-xs text-muted-foreground">{partner.tier} • {partner.certifications.join(", ")}</p>
              </div>
              <div className="text-right text-sm">
                <p>{partner.kpis.candidatesSupplied} candidates supplied</p>
                <p className="text-xs text-muted-foreground">Avg response {partner.kpis.responseTimeHours} hrs</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Partner leaderboard" subtitle="Computed from submitted bids.">
        <div className="space-y-4">
          {vendor.leaderboard.map((entry) => (
            <div key={entry.vendorId}>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{entry.vendorName}</span>
                <span>{entry.score}</span>
              </div>
              <div className="mt-1 h-3 rounded-full bg-[#EEF2F7]">
                <div className="h-full rounded-full bg-[#3182CE] transition-[width] duration-500" style={{ width: `${Math.min(entry.score, 100)}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {entry.awarded}/{entry.totalBids} bids awarded • Avg rate ${entry.avgRate}/hr • On-time {entry.onTimePercent}%
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

