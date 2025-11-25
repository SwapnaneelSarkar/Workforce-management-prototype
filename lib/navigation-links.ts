import type { LucideIcon } from "lucide-react"
import type { SidebarItem } from "@/components/system/sidebar"
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  FileText, 
  FolderOpen, 
  ClipboardCheck, 
  MessageSquare, 
  Heart, 
  UserPlus, 
  Settings,
  Command,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  Receipt,
  BarChart3,
  Building2,
  TrendingUp,
  Gavel
} from "lucide-react"

export type NavLink = SidebarItem

export const candidateNavLinks: NavLink[] = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/profile", label: "Profile", icon: User },
  { href: "/candidate/jobs", label: "Jobs", icon: Briefcase },
  { href: "/candidate/applications", label: "Applications", icon: FileText },
  { href: "/candidate/documents", label: "Documents", icon: FolderOpen },
  { href: "/candidate/onboarding", label: "Onboarding", icon: ClipboardCheck },
  { href: "/candidate/messages", label: "Messages", icon: MessageSquare },
  { href: "/candidate/favorites", label: "Favorites", icon: Heart },
  { href: "/candidate/refer", label: "Refer a Friend", icon: UserPlus },
  { href: "/candidate/settings", label: "Settings", icon: Settings },
]

export const organizationNavLinks: NavLink[] = [
  { href: "/organization/dashboard", label: "Command Center", icon: Command },
  { href: "/organization/jobs", label: "Requisitions", icon: Briefcase },
  { href: "/organization/applications", label: "Applications", icon: FileText },
  { href: "/organization/assignments", label: "Assignments", icon: ClipboardCheck },
  { href: "/organization/workforce", label: "Workforce", icon: Users },
  { href: "/organization/compliance/templates", label: "Compliance", icon: ShieldCheck },
  { href: "/organization/approvals", label: "Approvals", icon: CheckCircle2 },
  { href: "/organization/timekeeping", label: "Timekeeping", icon: Clock },
  { href: "/organization/finance", label: "Finance", icon: DollarSign },
  { href: "/organization/finance/invoices", label: "Invoices", icon: Receipt },
  { href: "/organization/reports", label: "Reports", icon: BarChart3 },
]

export const vendorNavLinks: NavLink[] = [
  { href: "/vendor/vendors", label: "Vendor Directory", icon: Building2 },
  { href: "/vendor/performance", label: "Performance", icon: TrendingUp },
  { href: "/vendor/bids", label: "Bids", icon: Gavel },
]

