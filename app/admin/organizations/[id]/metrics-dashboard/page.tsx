"use client"

import { Header, Card } from "@/components/system"
import { BarChart3, TrendingUp, Users, Building2 } from "lucide-react"

export default function OrganizationMetricsDashboardPage() {
  // Mock metrics data
  const metrics = {
    totalEmployees: 450,
    activePositions: 125,
    fillRate: 87.5,
    averageResponseTime: 2.4,
    monthlySpend: 85000,
    yearToDateSpend: 1020000,
  }

  return (
    <>
      <Header
        title="Metrics Dashboard"
        subtitle="View organization metrics and analytics"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Metrics Dashboard" },
        ]}
      />

      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Employees</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.totalEmployees}</p>
            <p className="text-xs text-muted-foreground mt-1">Total active employees</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Positions</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.activePositions}</p>
            <p className="text-xs text-muted-foreground mt-1">Active positions</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Fill Rate</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.fillRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Average fill rate</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Performance Metrics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Response Time</p>
              <p className="text-xl font-bold text-foreground">{metrics.averageResponseTime} hrs</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Monthly Spend</p>
              <p className="text-xl font-bold text-foreground">${(metrics.monthlySpend / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}




