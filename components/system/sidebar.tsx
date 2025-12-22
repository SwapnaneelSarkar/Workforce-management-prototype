"use client"

import { useEffect, useMemo, useState } from "react"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { Menu, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

import type { LucideIcon } from "lucide-react"

export type SidebarItem = {
  label: string
  href: string
  icon?: LucideIcon | ReactNode
  badge?: string
  subtitle?: string
  children?: SidebarItem[]
  disabled?: boolean
}

function SidebarItemComponent({ item, collapsed, pathname }: { item: SidebarItem; collapsed: boolean; pathname: string }) {
  const hasChildren = item.children && item.children.length > 0
  const active = pathname.startsWith(item.href)
  const childActive = hasChildren && item.children?.some(child => pathname.startsWith(child.href))
  const [isOpen, setIsOpen] = useState(() => Boolean(childActive))
  const [mounted, setMounted] = useState(false)
  
  // Only render Collapsible after mount to avoid hydration mismatch with Radix UI IDs
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Update open state when pathname changes and a child becomes active
  useEffect(() => {
    if (childActive) {
      setIsOpen(true)
    }
  }, [childActive])
  
  // Render icon or fallback to first letter
  let iconContent: React.ReactNode = item.label.charAt(0)
  
  if (item.icon) {
    try {
      if (React.isValidElement(item.icon)) {
        iconContent = item.icon
      } else if (typeof item.icon === 'function') {
        const IconComponent = item.icon as LucideIcon
        iconContent = <IconComponent className="h-4 w-4" size={16} />
      } else if (item.icon && typeof (item.icon as any).render === 'function') {
        const IconComponent = item.icon as any
        iconContent = <IconComponent className="h-4 w-4" size={16} />
      } else if (item.icon && (item.icon as any).$$typeof) {
        iconContent = item.icon as React.ReactNode
      }
    } catch (error) {
      iconContent = item.label.charAt(0)
    }
  }
  
  if (hasChildren) {
    // Render static version during SSR to avoid hydration mismatch
    if (!mounted) {
      return (
        <li suppressHydrationWarning>
          <button
            type="button"
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-semibold transition-all duration-200",
              (active || childActive)
                ? "text-[#3182ce] bg-blue-50/50 shadow-sm" 
                : "text-muted-foreground hover:bg-[#eef0f4] hover:text-foreground hover:shadow-sm",
              collapsed ? "justify-center" : "justify-between",
            )}
          >
            <div className={cn("flex items-center gap-3", collapsed && "w-full justify-center")}>
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full bg-[#eef0f4] text-muted-foreground transition-all duration-200",
                  (active || childActive) && "bg-blue-100 text-[#3182ce] shadow-sm",
                )}
              >
                {iconContent}
              </span>
              <span className={cn("truncate", collapsed && "hidden lg:hidden")}>{item.label}</span>
            </div>
            {!collapsed && (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
            {(active || childActive) ? <span className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-gradient-to-b from-[#3182ce] to-[#2563EB] shadow-sm" aria-hidden /> : null}
          </button>
          {childActive && (
            <div className="mt-1 space-y-1 pl-4">
              {item.children?.map((child, childIndex) => {
                const childActive = pathname.startsWith(child.href)
                let childIconContent: React.ReactNode = child.label.charAt(0)
                
                if (child.icon) {
                  try {
                    if (React.isValidElement(child.icon)) {
                      childIconContent = child.icon
                    } else if (typeof child.icon === 'function') {
                      const IconComponent = child.icon as LucideIcon
                      childIconContent = <IconComponent className="h-4 w-4" size={16} />
                    }
                  } catch (error) {
                    childIconContent = child.label.charAt(0)
                  }
                }
                
                return (
                  <Link
                    key={`${item.label}-${child.label}-${child.href}-${childIndex}`}
                    href={child.href}
                    aria-current={childActive ? "page" : undefined}
                    className={cn(
                      "group relative flex gap-3 rounded-[8px] px-3 py-2 text-sm font-medium transition-all duration-200",
                      child.subtitle ? "items-start py-2.5" : "items-center",
                      childActive 
                        ? "text-[#3182ce] bg-blue-50/50 shadow-sm" 
                        : "text-muted-foreground hover:bg-[#eef0f4] hover:text-foreground hover:shadow-sm",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full bg-[#eef0f4] text-muted-foreground transition-all duration-200 flex-shrink-0",
                        childActive && "bg-blue-100 text-[#3182ce] shadow-sm",
                      )}
                    >
                      {childIconContent}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="truncate block leading-tight">{child.label}</span>
                      {child.subtitle && (
                        <span className="text-xs text-muted-foreground/70 truncate block leading-tight mt-0.5">{child.subtitle}</span>
                      )}
                    </div>
                    {childActive ? <span className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-gradient-to-b from-[#3182ce] to-[#2563EB] shadow-sm" aria-hidden /> : null}
                  </Link>
                )
              })}
            </div>
          )}
        </li>
      )
    }
    
    return (
      <li suppressHydrationWarning>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
              (active || childActive)
                ? "text-[#3182ce] bg-blue-50/50 shadow-sm" 
                : "text-muted-foreground hover:bg-[#eef0f4] hover:text-foreground hover:shadow-sm",
              collapsed ? "justify-center" : "justify-between",
            )}
          >
            <div className={cn("flex items-center gap-3", collapsed && "w-full justify-center")}>
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full bg-[#eef0f4] text-muted-foreground transition-all duration-200",
                  (active || childActive) && "bg-blue-100 text-[#3182ce] shadow-sm",
                  "group-hover:bg-blue-50 group-hover:scale-105",
                )}
              >
                {iconContent}
              </span>
              <span className={cn("truncate", collapsed && "hidden lg:hidden")}>{item.label}</span>
            </div>
            {!collapsed && (
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
            )}
            {(active || childActive) ? <span className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-gradient-to-b from-[#3182ce] to-[#2563EB] shadow-sm" aria-hidden /> : null}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 space-y-1 pl-4">
            {item.children?.map((child, childIndex) => {
              const childActive = pathname.startsWith(child.href)
              let childIconContent: React.ReactNode = child.label.charAt(0)
              
              if (child.icon) {
                try {
                  if (React.isValidElement(child.icon)) {
                    childIconContent = child.icon
                  } else if (typeof child.icon === 'function') {
                    const IconComponent = child.icon as LucideIcon
                    childIconContent = <IconComponent className="h-4 w-4" size={16} />
                  }
                } catch (error) {
                  childIconContent = child.label.charAt(0)
                }
              }
              
              return (
                <Link
                  key={`${item.label}-${child.label}-${child.href}-${childIndex}`}
                  href={child.href}
                  aria-current={childActive ? "page" : undefined}
                  className={cn(
                    "group relative flex gap-3 rounded-[8px] px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                    child.subtitle ? "items-start py-2.5" : "items-center",
                    childActive 
                      ? "text-[#3182ce] bg-blue-50/50 shadow-sm" 
                      : "text-muted-foreground hover:bg-[#eef0f4] hover:text-foreground hover:shadow-sm",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full bg-[#eef0f4] text-muted-foreground transition-all duration-200 flex-shrink-0",
                      childActive && "bg-blue-100 text-[#3182ce] shadow-sm",
                      "group-hover:bg-blue-50 group-hover:scale-105",
                    )}
                  >
                    {childIconContent}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="truncate block leading-tight">{child.label}</span>
                    {child.subtitle && (
                      <span className="text-xs text-muted-foreground/70 truncate block leading-tight mt-0.5">{child.subtitle}</span>
                    )}
                  </div>
                  {childActive ? <span className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-gradient-to-b from-[#3182ce] to-[#2563EB] shadow-sm" aria-hidden /> : null}
                </Link>
              )
            })}
          </CollapsibleContent>
        </Collapsible>
      </li>
    )
  }
  
  const isComingSoon = item.subtitle?.toLowerCase().includes("next phase") || item.disabled
  
  if (isComingSoon) {
    return (
      <li>
        <div
          className={cn(
            "group relative flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-semibold transition-all duration-200 cursor-not-allowed opacity-60",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <div className={cn("flex items-center gap-3", collapsed && "w-full justify-center")}>
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full bg-[#eef0f4] text-muted-foreground transition-all duration-200",
              )}
            >
              {iconContent}
            </span>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <span className="truncate block leading-tight">{item.label}</span>
                {item.subtitle && (
                  <span className="text-xs text-muted-foreground/70 truncate block leading-tight mt-0.5">{item.subtitle}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </li>
    )
  }
  
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
          active 
            ? "text-[#3182ce] bg-blue-50/50 shadow-sm" 
            : "text-muted-foreground hover:bg-[#eef0f4] hover:text-foreground hover:shadow-sm",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <div className={cn("flex items-center gap-3", collapsed && "w-full justify-center")}>
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full bg-[#eef0f4] text-muted-foreground transition-all duration-200",
              active && "bg-blue-100 text-[#3182ce] shadow-sm",
              "group-hover:bg-blue-50 group-hover:scale-105",
            )}
          >
            {iconContent}
          </span>
          {!collapsed ? (
            <div className="flex-1 min-w-0">
              <span className="truncate block leading-tight">{item.label}</span>
              {item.subtitle && (
                <span className="text-xs text-muted-foreground/70 truncate block leading-tight mt-0.5">{item.subtitle}</span>
              )}
            </div>
          ) : (
            <span className="truncate">{item.label}</span>
          )}
        </div>
        {!collapsed && item.badge ? (
          <span className="ml-auto inline-flex min-w-[32px] justify-center rounded-full bg-[#f1f2f6] px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {item.badge}
          </span>
        ) : null}
        {active ? <span className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-gradient-to-b from-[#3182ce] to-[#2563EB] shadow-sm" aria-hidden /> : null}
      </Link>
    </li>
  )
}

type SidebarProps = {
  items: SidebarItem[]
  header?: ReactNode
  footer?: ReactNode
  showSearch?: boolean
}

export function Sidebar({ items, header, footer, showSearch = false }: SidebarProps) {
  const pathname = usePathname()
  const [viewport, setViewport] = useState(() => (typeof window === "undefined" ? 1440 : window.innerWidth))
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => setViewport(window.innerWidth)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = viewport < 768
  const isTablet = viewport >= 768 && viewport < 1024
  const collapsed = isTablet

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [drawerOpen])

  const navContent = useMemo(
    () => (
      <div className="flex h-full flex-col overflow-hidden">
        <div className={cn("border-b border-border px-5 py-5 flex-shrink-0", collapsed && "px-3")}>{header}</div>
        {showSearch && !collapsed && (
          <div className="border-b border-border px-5 py-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent' }}>
          <ul className="space-y-1">
            {items.map((item, index) => (
              <SidebarItemComponent key={`${item.label}-${item.href}-${index}`} item={item} collapsed={collapsed} pathname={pathname} />
            ))}
          </ul>
        </nav>
        <div className={cn("border-t border-border px-5 py-4 flex-shrink-0", collapsed && "px-3")}>{footer}</div>
      </div>
    ),
    [collapsed, footer, header, items, pathname, showSearch],
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
            "fixed inset-y-0 left-0 z-50 w-[260px] border-r border-border bg-gradient-to-b from-blue-50/30 via-blue-50/20 to-card shadow-[0_24px_48px_rgba(15,23,42,0.18)] transition-transform duration-200 flex flex-col overflow-hidden",
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
        "hidden fixed left-0 top-0 h-screen border-r-2 border-border/80 bg-gradient-to-b from-blue-50/40 via-blue-50/25 to-card/95 backdrop-blur-sm shadow-[0_0_60px_rgba(15,23,42,0.06)] transition-all duration-200 z-30 md:flex flex-col overflow-hidden",
        collapsed ? "w-[90px]" : "w-[260px]",
      )}
    >
      {navContent}
    </aside>
  )
}

