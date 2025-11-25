"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = theme === "dark"

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      className="rounded-full border border-border bg-card p-2 text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />) : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  )
}

