"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

export function AvatarDropdown() {
  const pathname = usePathname()
  const isOrganizationPage = pathname?.startsWith("/organization") && pathname !== "/organization/login"
  const isCandidatePage = pathname?.startsWith("/candidate") && pathname !== "/candidate/login"
  const isAdminPage = pathname?.startsWith("/admin") && pathname !== "/admin/login"
  
  const displayName = isOrganizationPage ? "Recovered Health" : isCandidatePage ? "Joanne Rose" : isAdminPage ? "Staff Logic" : "User"
  const displayRole = isOrganizationPage ? "Organization" : isCandidatePage ? "Candidate" : isAdminPage ? "Organization" : "User"
  const avatarImage = isOrganizationPage 
    ? "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop&auto=format"
    : isAdminPage
    ? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop&auto=format"
    : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face&auto=format"
  
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ top: 0, right: 0 })

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }
    window.addEventListener("click", onClick)
    return () => window.removeEventListener("click", onClick)
  }, [open])

  useEffect(() => {
    if (!open || !buttonRef.current) return

    const updatePosition = () => {
      if (!buttonRef.current) return
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 12, // mt-3 = 12px
        right: window.innerWidth - rect.right,
      })
    }

    updatePosition()
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)

    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open])

  return (
    <>
      <div className="relative" ref={containerRef}>
        <button
          ref={buttonRef}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-[0_2px_8px_rgba(16,24,40,0.08)] hover:shadow-[0_8px_24px_rgba(16,24,40,0.12)] hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all duration-200 hover:scale-[1.02]"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/10">
            <Image
              src={avatarImage}
              alt={displayName}
              width={40}
              height={40}
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground">{displayRole}</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
        </button>
      </div>

      {open && typeof window !== "undefined"
        ? createPortal(
            <div
              ref={dropdownRef}
              role="menu"
              aria-label="Account actions"
              className="fixed z-[999999] w-56 rounded-xl border border-border bg-card/95 backdrop-blur-md p-2 shadow-[0_20px_40px_rgba(15,23,42,0.15)] animate-scale-in"
              style={{
                top: `${position.top}px`,
                right: `${position.right}px`,
              }}
            >
              <DropdownItem icon={<UserRound className="h-4 w-4" aria-hidden />} label="Profile" onClick={() => setOpen(false)} />
              <DropdownItem icon={<Settings className="h-4 w-4" aria-hidden />} label="Settings" onClick={() => setOpen(false)} />
              <DropdownItem icon={<LogOut className="h-4 w-4" aria-hidden />} label="Logout" onClick={() => setOpen(false)} />
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

function DropdownItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm text-foreground hover:bg-gradient-to-r hover:from-muted hover:to-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 transition-all duration-200 hover:translate-x-1"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
