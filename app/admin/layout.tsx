"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Sidebar, SubSidebar } from "@/components/system"
import { adminNavLinks, getOrganizationNavLinks } from "@/lib/navigation-links"
import { getOrganizationById } from "@/lib/organizations-store"
import { cn } from "@/lib/utils"

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
  
  const orgNavLinks = isOrganizationView && params.id 
    ? getOrganizationNavLinks(params.id as string, organizationName)
    : null

  if (isLoginScreen) {
    return <div className="min-h-screen bg-white">{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main Admin Sidebar - Always visible */}
      <Sidebar
        items={adminNavLinks}
        showSearch={false}
        header={
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Admin
            </p>
            <p className="text-base font-semibold text-foreground">
              Platform Admin
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
      
      {/* Sub-sidebar for Organization View */}
      {isOrganizationView && orgNavLinks && (
        <SubSidebar
          items={orgNavLinks}
          header={
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Organization
              </p>
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {organizationName}
              </p>
            </div>
          }
        />
      )}
      
      {/* Main Content Area - Adjust margin based on whether sub-sidebar is visible */}
      <main className={cn(
        "page-shell flex-1 overflow-y-auto transition-all duration-200 main-content",
        isOrganizationView ? "md:ml-[500px]" : "md:ml-[260px]"
      )}>
        <div className="page-container">{children}</div>
      </main>
    </div>
  )
}


