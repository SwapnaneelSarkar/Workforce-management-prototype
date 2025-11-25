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
        "rounded-[8px] border border-border bg-card transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] focus-within:shadow-[0_8px_24px_rgba(15,23,42,0.12)]",
        bleed ? "p-0" : "p-5",
        "flex flex-col gap-5 shadow-[0_1px_4px_rgba(16,24,40,0.06)]",
        className,
      )}
    >
      {(title || subtitle || actions) && (
        <div
          className={cn(
            "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4",
            bleed ? "px-5 pt-5" : undefined,
          )}
        >
          <div className="space-y-1">
            {title ? <h3 className="text-[15px] font-semibold text-foreground">{title}</h3> : null}
            {subtitle ? <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      )}
      <div className={bleed ? "px-5" : undefined}>{children}</div>
      {footer ? <div className={cn("border-t border-border pt-4", bleed ? "px-5 pb-5" : undefined)}>{footer}</div> : null}
    </section>
  )
}

