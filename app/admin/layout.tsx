"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Sidebar } from "@/components/system"
import { adminNavLinks, getOrganizationNavLinks } from "@/lib/navigation-links"
import { getOrganizationById } from "@/lib/organizations-store"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const params = useParams()
  const isLoginScreen = pathname === "/admin/login"
  
  // Check if we're viewing an organization detail page
  const isOrganizationView = pathname.startsWith("/admin/organizations/") && params.id && params.id !== "add"
  const [organizationName, setOrganizationName] = useState<string>("Organization")
  
  useEffect(() => {
    if (isOrganizationView && params.id) {
      const org = getOrganizationById(params.id as string)
      if (org) {
        setOrganizationName(org.name)
      }
    }
  }, [isOrganizationView, params.id])
  
  const navLinks = isOrganizationView && params.id 
    ? getOrganizationNavLinks(params.id as string, organizationName)
    : adminNavLinks

  if (isLoginScreen) {
    return <div className="min-h-screen bg-white">{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={navLinks}
        showSearch={isOrganizationView}
        header={
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {isOrganizationView ? "Organization" : "Admin"}
            </p>
            <p className="text-base font-semibold text-foreground">
              {isOrganizationView ? organizationName : "Platform Admin"}
            </p>
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


