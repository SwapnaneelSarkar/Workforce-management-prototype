"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Bell, CheckCircle2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDemoData } from "@/components/providers/demo-data-provider"
import Link from "next/link"

export function NotificationDropdown() {
  const { candidate, actions } = useDemoData()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ top: 0, right: 0 })

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }
    window.addEventListener("click", onClick)
    return () => window.removeEventListener("click", onClick)
  }, [open])

  useEffect(() => {
    if (!open || !buttonRef.current) return

    const updatePosition = () => {
      if (!buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 12, // mt-3 = 12px
        right: window.innerWidth - rect.right,
      })
    }

    updatePosition()
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)

    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open])

  // Get unread count
  const unreadCount = candidate.notifications.filter((n) => !n.read).length

  // Get recent notifications (first 4) - use mock job notifications for design
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
    <>
      <div className="relative" ref={containerRef}>
        <button
          ref={buttonRef}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-[0_2px_8px_rgba(16,24,40,0.08)] hover:bg-muted hover:text-foreground hover:shadow-[0_4px_12px_rgba(16,24,40,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all duration-200 hover:scale-105"
        >
          <Bell className="h-5 w-5" aria-hidden />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-semibold text-white shadow-lg animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {open && typeof window !== "undefined"
        ? createPortal(
            <div
              ref={dropdownRef}
              role="menu"
              aria-label="Notifications"
              className="fixed z-[999999] w-96 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-[0_20px_40px_rgba(15,23,42,0.15)] overflow-hidden animate-scale-in"
              style={{
                top: `${position.top}px`,
                right: `${position.right}px`,
              }}
            >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-base font-semibold text-foreground">Notifications</h3>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {jobNotifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "flex items-start gap-3 p-4 border-b border-border/60 last:border-0 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 cursor-pointer group",
                  !notif.read && "bg-blue-50/30"
                )}
                onClick={() => {
                  // Try to mark as read if it exists in actual notifications
                  const actualNotif = candidate.notifications.find((n) => n.id === notif.id)
                  if (actualNotif) {
                    actions.setNotificationRead(notif.id, true)
                  }
                  setOpen(false)
                }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
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
          </div>
          <div className="border-t border-border px-4 py-3 text-center">
            <Link
              href="/candidate/notifications"
              className="text-sm font-semibold text-blue-600 hover:underline"
              onClick={() => setOpen(false)}
            >
              See All
            </Link>
          </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

