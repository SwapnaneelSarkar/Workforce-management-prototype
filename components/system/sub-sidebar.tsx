"use client"

import { useMemo } from "react"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { SidebarItem } from "./sidebar"
import type { LucideIcon } from "lucide-react"

function SubSidebarItemComponent({ item, pathname, isFirstItem }: { item: SidebarItem; pathname: string; isFirstItem?: boolean }) {
  const hasChildren = item.children && item.children.length > 0
  const active = pathname === item.href || pathname.startsWith(item.href + "/")
  const childActive = hasChildren && item.children?.some(child => pathname === child.href || pathname.startsWith(child.href + "/"))
  
  // Render icon - prioritize icon over initial
  let iconContent: React.ReactNode = null
  
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
      // Fallback to first letter only if icon fails
      iconContent = <span className="text-xs font-semibold">{item.label.charAt(0)}</span>
    }
  }
  
  // If no icon content after trying, use first letter
  if (!iconContent) {
    iconContent = <span className="text-xs font-semibold">{item.label.charAt(0)}</span>
  }
  
  if (hasChildren) {
    return (
      <li className={cn("mb-4", isFirstItem && "mt-2")}>
        <div
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 mb-2 rounded-lg transition-all duration-200",
            (active || childActive)
              ? "bg-blue-50/80 text-[#3182ce]" 
              : "text-muted-foreground hover:bg-muted/50",
          )}
        >
          <span className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0 transition-colors",
            (active || childActive)
              ? "bg-blue-100 text-[#3182ce]" 
              : "bg-muted text-muted-foreground"
          )}>
            {iconContent}
          </span>
          <span className="truncate text-sm font-semibold">{item.label}</span>
        </div>
        <ul className="space-y-0.5 pl-1">
            {item.children?.map((child, childIndex) => {
              const childActive = pathname === child.href || pathname.startsWith(child.href + "/")
              let childIconContent: React.ReactNode = null
              
              if (child.icon) {
                try {
                  if (React.isValidElement(child.icon)) {
                    childIconContent = child.icon
                  } else if (typeof child.icon === 'function') {
                    const IconComponent = child.icon as LucideIcon
                    childIconContent = <IconComponent className="h-3.5 w-3.5" size={14} />
                  } else if (child.icon && typeof (child.icon as any).render === 'function') {
                    const IconComponent = child.icon as any
                    childIconContent = <IconComponent className="h-3.5 w-3.5" size={14} />
                  } else if (child.icon && (child.icon as any).$$typeof) {
                    childIconContent = child.icon as React.ReactNode
                  }
                } catch (error) {
                  // Fallback to first letter only if icon fails
                  childIconContent = <span className="text-[10px] font-semibold">{child.label.charAt(0)}</span>
                }
              }
              
              // If no icon content after trying, use first letter
              if (!childIconContent) {
                childIconContent = <span className="text-[10px] font-semibold">{child.label.charAt(0)}</span>
              }
            
            return (
              <li key={`${item.label}-${child.label}-${child.href}-${childIndex}`}>
                <Link
                  href={child.href}
                  aria-current={childActive ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-all duration-200",
                    child.subtitle ? "items-start py-2.5" : "items-center",
                    childActive 
                      ? "text-[#3182ce] bg-blue-50/80 font-medium shadow-sm" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded flex-shrink-0 transition-colors",
                    childActive
                      ? "bg-blue-100 text-[#3182ce]"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                  )}>
                    {childIconContent}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="truncate block leading-tight">{child.label}</span>
                    {child.subtitle && (
                      <span className="text-xs text-muted-foreground/60 truncate block leading-tight mt-0.5">{child.subtitle}</span>
                    )}
                  </div>
                  {childActive ? (
                    <span className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-gradient-to-b from-[#3182ce] to-[#2563EB] shadow-sm" aria-hidden />
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </li>
    )
  }
  
  return (
    <li className={cn("mb-1", isFirstItem && "mt-2")}>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active 
            ? "text-[#3182ce] bg-blue-50/80 shadow-sm" 
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
      >
        <span className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0 transition-colors",
          active
            ? "bg-blue-100 text-[#3182ce]"
            : "bg-muted text-muted-foreground group-hover:bg-muted/80"
        )}>
          {iconContent}
        </span>
        <span className="truncate">{item.label}</span>
        {active ? (
          <span className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-gradient-to-b from-[#3182ce] to-[#2563EB] shadow-sm" aria-hidden />
        ) : null}
      </Link>
    </li>
  )
}

type SubSidebarProps = {
  items: SidebarItem[]
  header?: ReactNode
}

export function SubSidebar({ items, header }: SubSidebarProps) {
  const pathname = usePathname()
  
  const navContent = useMemo(() => {
    return items.map((item, index) => (
      <SubSidebarItemComponent 
        key={`${item.href}-${index}`} 
        item={item} 
        pathname={pathname}
        isFirstItem={index === 0}
      />
    ))
  }, [items, pathname])

  return (
    <aside className="fixed left-[260px] top-0 h-screen w-[240px] border-r border-border bg-background/98 backdrop-blur-sm flex flex-col z-40 shadow-[2px_0_8px_rgba(0,0,0,0.04)]">
      {header && (
        <div className="px-4 py-4 border-b border-border/60 bg-gradient-to-b from-background to-muted/20">
          {header}
        </div>
      )}
      <nav className="flex-1 overflow-y-auto px-3 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent' }}>
        <ul className="space-y-0">
          {navContent}
        </ul>
      </nav>
    </aside>
  )
}

