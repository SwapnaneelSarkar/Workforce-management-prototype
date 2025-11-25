"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type FabProps = {
  icon: ReactNode
  label: string
  onClick: () => void
  ariaLabel?: string
  className?: string
}

export function FloatingActionButton({ icon, label, onClick, ariaLabel, className }: FabProps) {
  return (
    <button
      className={cn(
        "fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      aria-label={ariaLabel ?? label}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  )
}

