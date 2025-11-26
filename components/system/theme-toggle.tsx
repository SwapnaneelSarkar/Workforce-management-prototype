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
      className="rounded-full border-2 border-border bg-card p-2.5 text-muted-foreground shadow-[0_2px_8px_rgba(16,24,40,0.08)] transition-all duration-200 hover:border-primary hover:text-primary hover:shadow-[0_4px_12px_rgba(49,130,206,0.15)] hover:scale-110 hover:rotate-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />) : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  )
}

