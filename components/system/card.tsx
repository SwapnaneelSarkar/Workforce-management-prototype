"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type CardProps = {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  footer?: ReactNode
  bleed?: boolean
  className?: string
}

export function Card({ title, subtitle, actions, children, footer, bleed, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-[12px] border border-border bg-card transition-all duration-300 ease-out hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] hover:-translate-y-1 hover:border-primary/20 focus-within:shadow-[0_12px_32px_rgba(15,23,42,0.12)] focus-within:border-primary/20",
        bleed ? "p-0" : "p-6",
        "flex flex-col gap-5 shadow-[0_2px_8px_rgba(16,24,40,0.06)]",
        "relative overflow-hidden group",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {(title || subtitle || actions) && (
        <div
          className={cn(
            "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4 relative z-10",
            bleed ? "px-5 pt-5" : undefined,
          )}
        >
          <div className="space-y-1">
            {title ? <h3 className="text-[16px] font-semibold text-foreground tracking-tight">{title}</h3> : null}
            {subtitle ? <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      )}
      <div className={cn("relative z-10", bleed ? "px-5" : undefined)}>{children}</div>
      {footer ? <div className={cn("border-t border-border/60 pt-4 relative z-10", bleed ? "px-5 pb-5" : undefined)}>{footer}</div> : null}
    </section>
  )
}

