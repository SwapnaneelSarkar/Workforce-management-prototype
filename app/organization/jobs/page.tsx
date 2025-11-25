"use client"

import Link from "next/link"
import React from "react"
import { Plus } from "lucide-react"
import { FloatingActionButton, useToast } from "@/components/system"
import { mockRequisitions } from "@/lib/mock-data"

export default function JobsListPage() {
  const [requisitions] = React.useState(mockRequisitions)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const { pushToast } = useToast()

  const totalPositions = requisitions.reduce((sum, req) => sum + req.openPositions, 0)
  const openCount = requisitions.filter((r) => r.status === "Open").length

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="ph5-page-title">Requisitions</h1>
          <p className="ph5-page-subtitle">
            {totalPositions} open positions across {requisitions.length} requisitions
          </p>
        </div>
        <Link href="/organization/jobs/create">
          <button className="ph5-button-primary">New Requisition</button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="ph5-card">
          <div className="ph5-label mb-3">Total Requisitions</div>
          <div className="text-4xl font-bold text-foreground">{requisitions.length}</div>
        </div>
        <div className="ph5-card">
          <div className="ph5-label mb-3">Open Positions</div>
          <div className="text-4xl font-bold text-foreground">{totalPositions}</div>
        </div>
        <div className="ph5-card">
          <div className="ph5-label mb-3">Active Requisitions</div>
          <div className="text-4xl font-bold text-foreground">{openCount}</div>
        </div>
      </div>

      {/* Table */}
      <div className="ph5-card overflow-hidden">
        <table className="ph5-table w-full">
          <thead>
            <tr>
              <th className="ph5-table-header text-left">Job Name</th>
              <th className="ph5-table-header text-left">Department</th>
              <th className="ph5-table-header text-left">Positions</th>
              <th className="ph5-table-header text-left">Status</th>
              <th className="ph5-table-header text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {requisitions.map((req) => (
              <React.Fragment key={req.id}>
                <tr className="ph5-table-row border-b border-border hover:bg-muted transition-colors">
                  <td className="ph5-table-cell font-medium text-foreground">{req.title}</td>
                  <td className="ph5-table-cell text-sm text-muted-foreground">{req.department}</td>
                  <td className="ph5-table-cell font-medium text-foreground">{req.openPositions}</td>
                  <td className="ph5-table-cell">
                    <span className={`${req.status === "Open" ? "ph5-badge-success" : "ph5-badge-warning"}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="ph5-table-cell">
                    <button
                      onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                      className="ph5-button-ghost text-sm"
                    >
                      {expandedId === req.id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>

                {expandedId === req.id && (
                  <tr>
                    <td colSpan={5} className="bg-muted border-t border-b border-border p-6">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <div className="ph5-label mb-2">Submitted Date</div>
                          <div className="font-medium text-foreground">{req.submittedDate}</div>
                        </div>
                        <div>
                          <div className="ph5-label mb-2">Hiring Leader</div>
                          <div className="font-medium text-foreground">{req.hireLeader}</div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <div className="ph5-label mb-3">Approval Chain</div>
                        <div className="space-y-2">
                          {req.approvalChain.map((approver, idx) => (
                            <div key={idx} className="text-sm flex items-center gap-2">
                              <span className="text-muted-foreground">→</span>
                              <span className="text-foreground">{approver}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <FloatingActionButton icon={<Plus className="h-4 w-4" aria-hidden />} label="Post requisition" onClick={() => pushToast({ title: "Job builder coming soon" })} />
    </div>
  )
}
