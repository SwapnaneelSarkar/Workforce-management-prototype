"use client"

import { useEffect } from "react"
import type { ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type ModalProps = {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  size?: "sm" | "md" | "lg"
}

export function Modal({ open, title, description, children, footer, onClose, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-[rgba(10,11,13,0.5)] px-4 py-8"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full rounded-[8px] border border-border bg-card shadow-[0_24px_48px_rgba(15,23,42,0.25)]",
          size === "sm" && "max-w-md",
          size === "md" && "max-w-2xl",
          size === "lg" && "max-w-3xl",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label="Close modal"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-border p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="px-6 py-6">
          <div className="mb-5 space-y-2">
            <h2 className="text-[20px] font-semibold text-foreground">{title}</h2>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <div className="space-y-4 text-sm text-foreground">{children}</div>
        </div>
        {footer ? <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  )
}

