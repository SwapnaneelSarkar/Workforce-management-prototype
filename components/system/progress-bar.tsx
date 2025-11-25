"use client"

import { cn } from "@/lib/utils"

type ProgressBarProps = {
  value: number
  label?: string
  className?: string
}

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {label ? <span className="text-xs font-medium text-muted-foreground">{label}</span> : null}
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#3182CE] to-[#2D3748] transition-[width] duration-500"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}

