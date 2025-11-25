"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type FormFieldProps = {
  label: string
  htmlFor: string
  helper?: string
  error?: string
  children: ReactNode
  required?: boolean
  className?: string
}

export function FormField({ label, htmlFor, helper, error, children, required, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
        {required ? <span className="ml-1 text-danger">*</span> : null}
      </label>
      {children}
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  )
}

