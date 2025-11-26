"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Breadcrumbs } from "./breadcrumbs"
import { GlobalSearch } from "./global-search"
import { ThemeToggle } from "./theme-toggle"
import { AvatarDropdown } from "./avatar-dropdown"
import { NotificationDropdown } from "./notification-dropdown"

export type HeaderAction = {
  id: string
  label: string
  ariaLabel?: string
  icon?: ReactNode
  variant?: "primary" | "secondary" | "ghost"
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
}

type HeaderProps = {
  title: string
  subtitle?: string
  breadcrumbs?: { label: string; href?: string }[]
  actions?: HeaderAction[]
  className?: string
  children?: ReactNode
}

export function Header({ title, subtitle, breadcrumbs, actions = [], className, children }: HeaderProps) {
  const pathname = usePathname()
  const isCandidatePage = pathname?.startsWith("/candidate") && pathname !== "/candidate/login"

  return (
    <>
      <header className={cn("fixed top-0 z-[99999] border-b-2 border-border/80 bg-card/98 backdrop-blur-xl shadow-[0_4px_16px_rgba(16,24,40,0.1)] transition-all duration-300 header-fixed left-0 right-0 md:left-[260px] overflow-x-hidden", className)}>
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between overflow-x-hidden">
          <div className="flex flex-col gap-2">
            {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
            <div className="space-y-1.5">
              <h1 className="text-[28px] font-bold text-foreground bg-gradient-to-r from-foreground via-foreground to-foreground/85 bg-clip-text tracking-tight">{title}</h1>
              {subtitle ? <p className="text-sm text-muted-foreground leading-relaxed font-medium">{subtitle}</p> : null}
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            {children}
            <div className="flex items-center gap-2">
              <GlobalSearch />
              <ThemeToggle />
              {isCandidatePage && <NotificationDropdown />}
              {actions.length ? (
                <div className="flex items-center gap-2">
                  {actions.map((action) => (
                    <Button
                      key={action.id}
                      aria-label={action.ariaLabel ?? action.label}
                      variant={
                        action.variant === "ghost"
                          ? "ghost"
                          : action.variant === "secondary"
                          ? "secondary"
                          : "default"
                      }
                      disabled={action.disabled || action.loading}
                      onClick={action.onClick}
                      className="whitespace-nowrap"
                    >
                      {action.loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" aria-hidden />
                          {action.label}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {action.icon}
                          {action.label}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              ) : null}
              <AvatarDropdown />
            </div>
          </div>
        </div>
      </header>
      {/* Spacer to prevent content from overlapping with fixed header */}
      <div className="h-[85px] md:h-[85px]" aria-hidden="true" />
    </>
  )
}

