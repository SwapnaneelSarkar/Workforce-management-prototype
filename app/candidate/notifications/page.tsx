"use client"

import { useEffect, useMemo, useState } from "react"
import { Filter, CheckCircle2, Plus } from "lucide-react"
import { Card, Header, SkeletonLoader, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export default function CandidateNotificationsPage() {
  const { candidate, actions } = useDemoData()
  const [typeFilter, setTypeFilter] = useState("all")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(timer)
  }, [loading])

  const filtered = useMemo(() => {
    if (typeFilter === "all") return candidate.notifications
    return candidate.notifications.filter((item) => item.type === typeFilter)
  }, [candidate.notifications, typeFilter])

  // Mock job invitation notifications for the design
  const jobNotifications = [
    {
      id: "notif-job-001",
      title: "RN ICU - Main Campus - Night Shift",
      subtitle: "New job invite has sent to you from Nova Health",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "notif-job-002",
      title: "Job Invitation",
      subtitle: "New job invite has sent to you from Nova Health",
      time: "2 days ago",
      read: false,
    },
    {
      id: "notif-job-003",
      title: "Job Invitation",
      subtitle: "New job invite has sent to you from Nova Health",
      time: "2 days ago",
      read: false,
    },
    {
      id: "notif-job-004",
      title: "Job Invitation",
      subtitle: "New job invite has sent to you from Nova Health",
      time: "2 days ago",
      read: false,
    },
  ]

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Notifications"
        subtitle="Job invites, compliance reminders, and profile updates."
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Notifications" },
        ]}
        actions={[
          {
            id: "mark",
            label: "Mark all read",
            variant: "secondary",
            onClick: () => {
              setLoading(true)
              actions.markAllNotificationsRead()
            },
          },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(16,24,40,0.06)] backdrop-blur-sm">
        <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
          <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="rounded-full border-2 border-border bg-input px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-200 hover:border-primary/30 shadow-sm"
        >
          <option value="all">All types</option>
          <option value="job">Job alerts</option>
          <option value="system">System</option>
        </select>
        <StatusChip label={`${filtered.length} items`} tone="info" />
      </div>

      {loading ? (
        <SkeletonLoader lines={6} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card title="Latest activity">
            <div className="space-y-3">
              {filtered.map((notif) => (
                <div key={notif.id} className="rounded-xl border border-border px-5 py-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.subtitle}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <span>{notif.time}</span>
                      <StatusChip label={notif.read ? "Read" : "New"} className="ml-3" tone={notif.read ? "neutral" : "info"} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <StatusChip label={notif.type} tone="neutral" />
                    <button
                      type="button"
                      className="text-primary underline-offset-4 hover:underline"
                      onClick={() => actions.setNotificationRead(notif.id, !notif.read)}
                    >
                      Mark as {notif.read ? "unread" : "read"}
                    </button>
                  </div>
                </div>
              ))}
              {!filtered.length ? <p className="text-sm text-muted-foreground">No notifications for this filter.</p> : null}
            </div>
          </Card>

          {/* Notifications Card - Right Side */}
          <Card
            title="Notifications"
            actions={
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            }
          >
            <div className="space-y-3">
              {jobNotifications.map((notif, index) => (
                <div
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl p-4 transition-all duration-200 hover:shadow-md",
                    !notif.read && "bg-gradient-to-r from-blue-50/50 to-transparent border border-blue-100/50"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground mb-1">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mb-1">{notif.subtitle}</p>
                    <p className="text-xs text-muted-foreground">{notif.time}</p>
                  </div>
                  {!notif.read && (
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <button className="text-sm font-semibold text-blue-600 hover:underline">
                  See All
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card title="Digest preferences" subtitle="Choose how you'd like to be notified.">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { key: "email", label: "Email alerts" },
            { key: "sms", label: "SMS alerts" },
            { key: "push", label: "Push alerts" },
          ].map((channel) => (
            <label key={channel.key} className="flex items-center justify-between rounded-xl border-2 border-border px-5 py-4 text-sm font-semibold text-foreground hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer bg-card/50 backdrop-blur-sm">
              {channel.label}
              <Switch checked={candidate.notificationPrefs[channel.key as keyof typeof candidate.notificationPrefs]} onCheckedChange={(checked) => actions.updateNotificationPrefs({ [channel.key]: checked })} />
            </label>
          ))}
        </div>
      </Card>
    </div>
  )
}

