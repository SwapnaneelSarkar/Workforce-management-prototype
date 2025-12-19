"use client"

import { Header, Card } from "@/components/system"
import { BarChart3, TrendingUp, Users, Building2, DollarSign, Calendar } from "lucide-react"

export default function MetricsDashboardPage() {
  // Mock data for metrics
  const metrics = {
    totalOrganizations: 10,
    totalUsers: 800,
    totalVendors: 75,
    totalLocations: 450,
    activeContracts: 25,
    monthlyRevenue: 125000,
    yearToDateRevenue: 1500000,
    averageFillRate: 87.5,
    averageResponseTime: 2.4,
  }

  const recentActivity = [
    { id: "1", type: "Organization Added", name: "Tech Innovations Inc.", date: "2024-01-15", time: "10:30 AM" },
    { id: "2", type: "Contract Renewed", name: "Vitality Health Group", date: "2024-01-14", time: "3:45 PM" },
    { id: "3", type: "User Added", name: "John Doe", date: "2024-01-14", time: "2:20 PM" },
    { id: "4", type: "Vendor Onboarded", name: "Premier Staffing Solutions", date: "2024-01-13", time: "11:15 AM" },
    { id: "5", type: "Contract Signed", name: "Global Solutions Ltd.", date: "2024-01-12", time: "4:00 PM" },
  ]

  const performanceMetrics = [
    { label: "Fill Rate", value: `${metrics.averageFillRate}%`, trend: "+2.3%", positive: true },
    { label: "Response Time", value: `${metrics.averageResponseTime} hrs`, trend: "-0.5 hrs", positive: true },
    { label: "Active Contracts", value: metrics.activeContracts.toString(), trend: "+3", positive: true },
    { label: "Monthly Revenue", value: `$${(metrics.monthlyRevenue / 1000).toFixed(0)}K`, trend: "+12%", positive: true },
  ]

  return (
    <>
      <Header
        title="Metrics Dashboard"
        subtitle="View key performance indicators and analytics"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Reports & Metrics", href: "/admin/metrics" },
          { label: "Metrics Dashboard" },
        ]}
      />

      <section className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Organizations</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.totalOrganizations}</p>
            <p className="text-xs text-muted-foreground mt-1">Active organizations</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Users</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.totalUsers}</p>
            <p className="text-xs text-muted-foreground mt-1">Total platform users</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Vendors</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{metrics.totalVendors}</p>
            <p className="text-xs text-muted-foreground mt-1">Active vendors</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-foreground">${(metrics.yearToDateRevenue / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-muted-foreground mt-1">Year to date</p>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Performance Metrics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {performanceMetrics.map((metric) => (
              <div key={metric.label} className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-foreground">{metric.value}</p>
                  <span className={`text-xs font-medium ${metric.positive ? "text-green-600" : "text-red-600"}`}>
                    {metric.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.type}</p>
                    <p className="text-xs text-muted-foreground">{activity.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  )
}




