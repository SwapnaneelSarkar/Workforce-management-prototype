"use client"

import { Header, Card } from "@/components/system"
import { FileSearch, Calendar, User } from "lucide-react"

export default function OrganizationAuditLogsPage() {
  // Mock audit log data
  const auditLogs = [
    { id: "1", action: "User Created", user: "John Doe", timestamp: "2024-01-15 10:30 AM", details: "Created new user account" },
    { id: "2", action: "Settings Updated", user: "Jane Smith", timestamp: "2024-01-14 3:45 PM", details: "Updated organization settings" },
    { id: "3", action: "Document Uploaded", user: "Alice Brown", timestamp: "2024-01-14 2:20 PM", details: "Uploaded contract document" },
    { id: "4", action: "Permission Changed", user: "Bob White", timestamp: "2024-01-13 11:15 AM", details: "Modified user permissions" },
    { id: "5", action: "Billing Updated", user: "Carol Davis", timestamp: "2024-01-12 4:00 PM", details: "Updated billing information" },
  ]

  return (
    <>
      <Header
        title="Audit Logs"
        subtitle="View organization audit logs"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Organizations", href: "/admin/organizations" },
          { label: "Audit Logs" },
        ]}
      />

      <section className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Audit Log History</h2>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  <FileSearch className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground">{log.action}</h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{log.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  )
}



