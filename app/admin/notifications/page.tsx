"use client"

import { useState } from "react"
import { Header, Card } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Search, CheckCircle, AlertCircle, Info, X } from "lucide-react"

type Notification = {
  id: string
  type: "success" | "warning" | "info" | "error"
  title: string
  message: string
  timestamp: string
  read: boolean
  category: string
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock notifications data
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Contract Renewed",
      message: "Vitality Health Group contract has been successfully renewed for another year.",
      timestamp: "2024-01-15 10:30 AM",
      read: false,
      category: "Contracts",
    },
    {
      id: "2",
      type: "warning",
      title: "Agreement Expiring Soon",
      message: "Nova Health service agreement will expire in 15 days. Please review renewal terms.",
      timestamp: "2024-01-14 3:45 PM",
      read: false,
      category: "Contracts",
    },
    {
      id: "3",
      type: "info",
      title: "New Organization Added",
      message: "Tech Innovations Inc. has been added to the platform.",
      timestamp: "2024-01-14 2:20 PM",
      read: true,
      category: "Organizations",
    },
    {
      id: "4",
      type: "success",
      title: "User Onboarded",
      message: "John Doe has been successfully onboarded as Organization Admin.",
      timestamp: "2024-01-13 11:15 AM",
      read: true,
      category: "Users",
    },
    {
      id: "5",
      type: "error",
      title: "System Maintenance",
      message: "Scheduled maintenance window: January 20, 2024 from 2:00 AM to 4:00 AM EST.",
      timestamp: "2024-01-12 4:00 PM",
      read: false,
      category: "System",
    },
    {
      id: "6",
      type: "info",
      title: "Vendor Performance Report",
      message: "Monthly vendor performance report for December 2023 is now available.",
      timestamp: "2024-01-11 9:00 AM",
      read: true,
      category: "Reports",
    },
    {
      id: "7",
      type: "warning",
      title: "Compliance Update Required",
      message: "3 organizations require compliance document updates. Review pending items.",
      timestamp: "2024-01-10 1:30 PM",
      read: false,
      category: "Compliance",
    },
    {
      id: "8",
      type: "success",
      title: "Backup Completed",
      message: "Daily system backup completed successfully at 2:00 AM.",
      timestamp: "2024-01-10 2:05 AM",
      read: true,
      category: "System",
    },
  ])

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "error":
        return <X className="h-5 w-5 text-red-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter = filter === "all" || notification.category === filter
    const matchesSearch =
      searchTerm === "" ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      <Header
        title="Notifications"
        subtitle="Manage and view system notifications"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Notifications" },
        ]}
      />

      <section className="space-y-6">
        {/* Filters */}
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Category</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Contracts">Contracts</SelectItem>
                  <SelectItem value="Organizations">Organizations</SelectItem>
                  <SelectItem value="Users">Users</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                  <SelectItem value="Reports">Reports</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search notifications..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Notifications {unreadCount > 0 && <span className="text-sm text-muted-foreground">({unreadCount} unread)</span>}
            </h2>
            <Button variant="outline" size="sm">
              Mark All as Read
            </Button>
          </div>

          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">No notifications found.</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 border border-border rounded-lg transition-colors ${
                    !notification.read ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-foreground">{notification.title}</h3>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {notification.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </>
  )
}






