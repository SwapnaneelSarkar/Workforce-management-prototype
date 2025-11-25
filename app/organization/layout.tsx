"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/system"
import { organizationNavLinks } from "@/lib/navigation-links"

export default function OrganizationLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isLoginScreen = pathname === "/organization/login"

  if (isLoginScreen) {
    return <div className="min-h-screen bg-white">{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={organizationNavLinks}
        header={
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Organization</p>
            <p className="text-base font-semibold text-foreground">Recovered Health</p>
          </div>
        }
        footer={
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-[#eef0f4]"
          >
            Logout
          </Link>
        }
      />
      <main className="page-shell flex-1 overflow-y-auto md:ml-[260px] transition-all duration-200 main-content">
        <div className="page-container">{children}</div>
      </main>
    </div>
  )
}
