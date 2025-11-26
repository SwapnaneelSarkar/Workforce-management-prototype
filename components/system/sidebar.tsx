"use client"

import { useEffect, useMemo, useState } from "react"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { Menu, PanelLeftClose, PanelLeftOpen, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

import type { LucideIcon } from "lucide-react"

export type SidebarItem = {
  label: string
  href: string
  icon?: LucideIcon | ReactNode
  badge?: string
}

type SidebarProps = {
  items: SidebarItem[]
  header?: ReactNode
  footer?: ReactNode
}

export function Sidebar({ items, header, footer }: SidebarProps) {
  const pathname = usePathname()
  const [viewport, setViewport] = useState(() => (typeof window === "undefined" ? 1440 : window.innerWidth))
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => setViewport(window.innerWidth)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = viewport < 768
  const isTablet = viewport >= 768 && viewport < 1024
  const collapsed = isTablet || (viewport >= 1024 && isDesktopCollapsed)

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : ""
    // Add data attribute for collapsed state
    if (!isMobile && !isTablet) {
      document.documentElement.setAttribute("data-sidebar-collapsed", isDesktopCollapsed ? "true" : "false")
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [drawerOpen, isDesktopCollapsed, isMobile, isTablet])

  const navContent = useMemo(
    () => (
      <div className="flex h-full flex-col">
        <div className={cn("border-b border-border px-5 py-5", collapsed && "px-3")}>{header}</div>
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = pathname.startsWith(item.href)
              // Render icon or fallback to first letter
              let iconContent: React.ReactNode = item.label.charAt(0)
              
              if (item.icon) {
                try {
                  // If it's already a React element, use it directly
                  if (React.isValidElement(item.icon)) {
                    iconContent = item.icon
                  } 
                  // Otherwise, try to render it as a Lucide icon component
                  // Lucide icons are React functional components (functions)
                  else {
                    // Try multiple ways to detect and render the icon
                    const icon = item.icon
                    const iconType = typeof icon
                    
                    // Check if it's a function (most common case for Lucide icons)
                    if (iconType === 'function') {
                      const IconComponent = icon as LucideIcon
                      iconContent = <IconComponent className="h-4 w-4" size={16} />
                    }
                    // Check if it has a render method (class component)
                    else if (icon && typeof (icon as any).render === 'function') {
                      const IconComponent = icon as any
                      iconContent = <IconComponent className="h-4 w-4" size={16} />
                    }
                    // Check if it's a React component type
                    else if (icon && (icon as any).$$typeof) {
                      iconContent = icon as React.ReactNode
                    }
                  }
                } catch (error) {
                  // If rendering fails, fall back to first letter
                  iconContent = item.label.charAt(0)
                }
              }
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-[6px] px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                      active ? "text-[#3182ce]" : "text-muted-foreground hover:bg-[#eef0f4]",
                      collapsed ? "justify-center" : "justify-between",
                    )}
                  >
                    <div className={cn("flex items-center gap-3", collapsed && "w-full justify-center")}>
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full bg-[#eef0f4] text-muted-foreground",
                        )}
                      >
                        {iconContent}
                      </span>
                      <span className={cn("truncate", collapsed && "hidden lg:hidden")}>{item.label}</span>
                    </div>
                    {!collapsed && item.badge ? (
                      <span className="ml-auto inline-flex min-w-[32px] justify-center rounded-full bg-[#f1f2f6] px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                        {item.badge}
                      </span>
                    ) : null}
                    {active ? <span className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-[#3182ce]" aria-hidden /> : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className={cn("border-t border-border px-5 py-4", collapsed && "px-3")}>{footer}</div>
        {!(isMobile || isTablet) ? (
          <button
            type="button"
            className="mx-4 mb-4 flex items-center justify-center gap-2 rounded-[6px] border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-[#eef0f4]"
            onClick={() => setDesktopCollapsed((prev) => !prev)}
          >
            {isDesktopCollapsed ? (
              <>
                <PanelLeftOpen className="h-4 w-4" aria-hidden />
                <span className="hidden lg:inline">Expand</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" aria-hidden />
                <span className="hidden lg:inline">Collapse</span>
              </>
            )}
          </button>
        ) : null}
      </div>
    ),
    [collapsed, footer, header, isDesktopCollapsed, isTablet, items, pathname],
  )

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          aria-label="Open navigation"
          className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card shadow-[0_6px_18px_rgba(15,23,42,0.15)] lg:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200",
            drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[260px] border-r border-border bg-card shadow-[0_24px_48px_rgba(15,23,42,0.18)] transition-transform duration-200",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {navContent}
        </aside>
      </>
    )
  }

  return (
    <aside
      className={cn(
        "hidden fixed left-0 top-0 h-screen border-r border-border bg-card shadow-[0_0_40px_rgba(15,23,42,0.04)] transition-all duration-200 z-30 md:flex",
        collapsed ? "w-[90px]" : "w-[260px]",
      )}
    >
      {navContent}
    </aside>
  )
}

