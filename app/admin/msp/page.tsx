"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { Building2, Calendar, Users, DollarSign } from "lucide-react"
import {
  getAllMSPs,
  getMSPOrganizationsByMSPId,
  calculateMSPTotalAnnualSpend,
  type MSP,
} from "@/lib/admin-local-db"
import Image from "next/image"

export default function MSPPage() {
  const router = useRouter()
  const [msps, setMSPs] = useState<MSP[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"card" | "table">("card")

  useEffect(() => {
    loadMSPs()
  }, [])

  const loadMSPs = () => {
    setLoading(true)
    const allMSPs = getAllMSPs()
    setMSPs(allMSPs)
    setLoading(false)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    } catch {
      return dateString
    }
  }

  const getRelatedOrganizationsCount = (mspId: string): number => {
    return getMSPOrganizationsByMSPId(mspId).length
  }

  if (loading) {
    return (
      <>
        <Header
          title="Managed Service Providers"
          subtitle="Manage MSPs and their relationships"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "MSPs" },
          ]}
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading MSPs...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="Managed Service Providers"
        subtitle="Manage MSPs and their relationships"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "MSPs" },
        ]}
      />

      <section className="space-y-6">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setViewMode("card")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "card"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Card View
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "table"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Table View
          </button>
        </div>

        {viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {msps.map((msp) => {
              const orgCount = getRelatedOrganizationsCount(msp.id)
              const totalSpend = calculateMSPTotalAnnualSpend(msp.id)

              return (
                <Card
                  key={msp.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/admin/msp/${msp.id}`)}
                >
                  <div className="space-y-4">
                    {/* Logo */}
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-muted border border-border">
                      {msp.logo ? (
                        <Image
                          src={msp.logo}
                          alt={msp.name}
                          width={64}
                          height={64}
                          className="rounded-lg object-contain"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>

                    {/* MSP Name */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{msp.name}</h3>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>
                        {msp.headquartersCity}, {msp.headquartersState}
                      </span>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {formatDate(msp.createdAt)}</span>
                    </div>

                    {/* Organizations Count */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{orgCount} {orgCount === 1 ? "organization" : "organizations"}</span>
                    </div>

                    {/* Total Annual Spend */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(totalSpend)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Total Annual Spend</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">MSP</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Organizations</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Total Annual Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {msps.map((msp) => {
                    const orgCount = getRelatedOrganizationsCount(msp.id)
                    const totalSpend = calculateMSPTotalAnnualSpend(msp.id)

                    return (
                      <tr
                        key={msp.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/msp/${msp.id}`)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center">
                              {msp.logo ? (
                                <Image
                                  src={msp.logo}
                                  alt={msp.name}
                                  width={40}
                                  height={40}
                                  className="rounded-lg object-contain"
                                />
                              ) : (
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-foreground">{msp.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {msp.headquartersCity}, {msp.headquartersState}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(msp.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {orgCount} {orgCount === 1 ? "organization" : "organizations"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-semibold text-primary">
                            {formatCurrency(totalSpend)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </>
  )
}
