"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

type ExpandableRowProps = {
  summary: ReactNode
  children: ReactNode
  className?: string
  defaultOpen?: boolean
}

export function ExpandableRow({ summary, children, className, defaultOpen }: ExpandableRowProps) {
  const [open, setOpen] = useState(Boolean(defaultOpen))

  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <div>{summary}</div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden /> : <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />}
      </button>
      {open ? <div className="border-t border-border px-4 py-3 text-sm text-foreground">{children}</div> : null}
    </div>
  )
}





