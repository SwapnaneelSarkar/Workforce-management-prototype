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
        "rounded-[16px] border-2 border-border/80 bg-card transition-all duration-300 ease-out hover:shadow-[0_16px_40px_rgba(15,23,42,0.14)] hover:-translate-y-1.5 hover:border-primary/30 focus-within:shadow-[0_16px_40px_rgba(15,23,42,0.14)] focus-within:border-primary/30",
        bleed ? "p-0" : "p-6",
        "flex flex-col gap-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]",
        "relative overflow-hidden group backdrop-blur-sm",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-blue-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

