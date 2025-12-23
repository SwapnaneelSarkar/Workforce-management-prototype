"use client"

import { useState } from "react"
import { Header, Card } from "@/components/system"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Link from "next/link"

export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState<"hiring-funnel" | "operations" | "active-workforce">("hiring-funnel")

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Command Center"
        subtitle="Real-time reporting and insights across your organization"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Command Center" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="mb-6">
          <TabsTrigger value="hiring-funnel">Hiring Funnel</TabsTrigger>
          <TabsTrigger value="operations">Operations / Management</TabsTrigger>
          <TabsTrigger value="active-workforce">Active Workforce</TabsTrigger>
        </TabsList>

        <TabsContent value="hiring-funnel" className="space-y-6">
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Hiring Funnel</h2>
                <p className="text-sm text-muted-foreground">
                  This dashboard provides reporting and insights based on existing platform data.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Open Requisitions</span>
                  </div>
                  <div className="text-3xl font-bold">—</div>
                  <p className="text-xs text-muted-foreground">Total active job requisitions</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total Candidates</span>
                  </div>
                  <div className="text-3xl font-bold">—</div>
                  <p className="text-xs text-muted-foreground">Candidates in talent community</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Active Submissions</span>
                  </div>
                  <div className="text-3xl font-bold">—</div>
                  <p className="text-xs text-muted-foreground">Submissions under review</p>
                </div>
              </div>

              <div className="border-t pt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Conversion Rates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Submission to Offer</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Offer to Placement</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Overall Fill Rate</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Time to Fill</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Average (All Reqs)</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Critical Roles</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Standard Roles</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Operations / Management</h2>
                <p className="text-sm text-muted-foreground">
                  This dashboard provides reporting and insights based on existing platform data.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Active Placements</span>
                  </div>
                  <div className="text-3xl font-bold">—</div>
                  <p className="text-xs text-muted-foreground">Currently working</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Compliance Rate</span>
                  </div>
                  <div className="text-3xl font-bold">—</div>
                  <p className="text-xs text-muted-foreground">Fully compliant workers</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Pending Timecards</span>
                  </div>
                  <div className="text-3xl font-bold">—</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Open Shifts</span>
                  </div>
                  <div className="text-3xl font-bold">—</div>
                  <p className="text-xs text-muted-foreground">Unfilled shift slots</p>
                </div>
              </div>

              <div className="border-t pt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Department Utilization</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">ICU</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Emergency</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Med-Surg</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Other Departments</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Operational Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Shifts Filled</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Avg. Response Time</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Call-offs Rate</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Fulfillment Rate</span>
                      </div>
                      <div className="text-2xl font-bold">—</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="active-workforce" className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Active Workforce</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  View and manage your active workforce placements and assignments.
                </p>
                <Link
                  href="/organization/active-workforce"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  View Full Active Workforce Dashboard →
                </Link>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
