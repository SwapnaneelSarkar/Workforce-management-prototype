import type { LucideIcon } from "lucide-react"
import type { SidebarItem } from "@/components/system/sidebar"
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  FolderOpen,
  ClipboardCheck,
  Settings,
  Command,
  BarChart3,
  Building2,
  TrendingUp,
  Gavel,
  Plus,
  MapPin,
  Briefcase as BriefcaseIcon,
} from "lucide-react"

export type NavLink = SidebarItem

export const candidateNavLinks: NavLink[] = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/profile", label: "Profile", icon: User },
  { href: "/candidate/jobs", label: "Jobs", icon: Briefcase },
  { href: "/candidate/applications", label: "Applications", icon: FileText },
  { href: "/candidate/documents", label: "Documents", icon: FolderOpen },
]

export const organizationNavLinks: NavLink[] = [
  { href: "/organization/dashboard", label: "Dashboard", icon: Command },
  { href: "/organization/jobs", label: "Jobs", icon: Briefcase },
  { href: "/organization/applications", label: "Applications", icon: FileText },
  { href: "/organization/compliance/templates", label: "Compliance templates", icon: ClipboardCheck },
]

export const vendorNavLinks: NavLink[] = [
  { href: "/vendor/vendors", label: "Vendor Directory", icon: Building2 },
  { href: "/vendor/performance", label: "Performance", icon: TrendingUp },
  { href: "/vendor/bids", label: "Bids", icon: Gavel },
]

export const adminNavLinks: NavLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/occupations", label: "Occupations", icon: BriefcaseIcon },
  { href: "/admin/questionnaire", label: "General Questionnaire", icon: FileText },
  { href: "/admin/compliance/templates", label: "Compliance Templates", icon: ClipboardCheck },
  { href: "/admin/organizations/add", label: "Add Organization", icon: Plus },
]

