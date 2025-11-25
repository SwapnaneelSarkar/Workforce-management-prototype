"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { CheckCircle2, Info, X, XCircle } from "lucide-react"

export type ToastMessage = {
  id: string
  title: string
  description?: string
  type?: "success" | "error" | "info"
  duration?: number
}

type ToastContextValue = {
  pushToast: (message: Omit<ToastMessage, "id">) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<ToastMessage[]>([])

  const pushToast = useCallback((message: Omit<ToastMessage, "id">) => {
    const id = crypto.randomUUID()
    const toast: ToastMessage = { id, ...message }
    setQueue((prev) => [...prev, toast])
    const timeout = toast.duration ?? 4000
    window.setTimeout(() => {
      setQueue((prev) => prev.filter((item) => item.id !== id))
    }, timeout)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const value = useMemo(() => ({ pushToast, dismissToast }), [pushToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed right-6 top-6 z-50 flex max-w-sm flex-col gap-3"
      >
        {queue.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const icon = {
    success: <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />,
    error: <XCircle className="h-5 w-5 text-danger" aria-hidden />,
    info: <Info className="h-5 w-5 text-info" aria-hidden />,
  }[toast.type ?? "info"]

  const background = {
    success: "bg-[#48BB78] text-white",
    error: "bg-[#F56565] text-white",
    info: "bg-[#2D3748] text-white",
  }[toast.type ?? "info"]

  return (
    <div className={`pointer-events-auto rounded-[8px] px-4 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.2)] ${background} animate-[toast-in_0.3s_ease]`}>
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{toast.title}</p>
          {toast.description ? <p className="text-xs text-white/80">{toast.description}</p> : null}
        </div>
        <button
          aria-label="Dismiss notification"
          onClick={() => onDismiss(toast.id)}
          className="rounded-full p-1 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

