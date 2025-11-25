"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/system"
import { DemoDataProvider } from "./demo-data-provider"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DemoDataProvider>
        <ToastProvider>{children}</ToastProvider>
      </DemoDataProvider>
    </ThemeProvider>
  )
}

