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
  Users,
  List,
  Tag,
  UserCog,
  Bell,
  FileBarChart,
  ArrowRightLeft,
  Receipt,
  Home,
  Network,
  DollarSign,
  MessageSquare,
  Clock,
  CheckCircle,
  CreditCard,
  FileCheck,
  Rss,
  Shield,
  Palette,
  Plug,
  FileSearch,
  Download,
  Upload,
  Link2,
  UserPlus,
  StickyNote,
  Calendar,
  FileQuestion,
  UserCheck,
  CalendarDays,
  Search,
  Send,
  BookOpen,
  MessageCircle,
  Share2,
  MessageSquareText,
  AlertCircle,
  HelpCircle,
  Filter,
  Cog,
  UserCircle,
  Wallet,
  Receipt as ReceiptIcon,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  LogOut,
} from "lucide-react"

export type NavLink = SidebarItem

export const candidateNavLinks: NavLink[] = [
  { href: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidate/profile", label: "Profile", icon: User },
  { href: "/candidate/placements", label: "Placements", icon: UserCheck },
  { href: "/candidate/jobs", label: "Matches & Job Search", icon: Search },
  { href: "#", label: "Shifts", icon: CalendarDays, subtitle: "Will be in the next phase", disabled: true },
  { href: "/candidate/applications", label: "Submissions", icon: FileText },
  { href: "/candidate/documents", label: "Document Wallet", icon: FolderOpen },
  { href: "/candidate/support", label: "Support", icon: HelpCircle },
  { href: "/candidate/news-feed", label: "News Feed", icon: Rss },
  { href: "#", label: "Notifications & Messaging", icon: MessageCircle, subtitle: "Will be in the next phase", disabled: true },
  { href: "#", label: "Refer a friend", icon: Share2, subtitle: "Will be in the next phase", disabled: true },
  { href: "#", label: "Share Feedback", icon: MessageSquareText, subtitle: "Will be in the next phase", disabled: true },
  { href: "#", label: "Log an Issue", icon: AlertCircle, subtitle: "Will be in the next phase", disabled: true },
]

export const organizationNavLinks: NavLink[] = [
  {
    href: "/organization/command-center",
    label: "Command Center",
    icon: Command,
  },
  {
    href: "/organization/compliance/requisition-templates",
    label: "Requisitions",
    icon: ClipboardCheck,
    children: [
      { href: "/organization/workforce/placements", label: "Placements", icon: UserCheck },
      { href: "/organization/shift", label: "Shift", icon: Calendar, subtitle: "Yet to be updated", disabled: true },
    ],
  },
  {
    href: "/organization/workforce",
    label: "Workforce",
    icon: Users,
    children: [
      { href: "/organization/workforce/talent-community", label: "Talent Community", icon: UserCircle },
      { href: "/organization/workforce/workforce-groups", label: "Workforce Groups", icon: Users },
      { href: "/organization/applications", label: "Submissions", icon: FileText },
    ],
  },
  {
    href: "/organization/hiring",
    label: "Hiring",
    icon: UserPlus,
    children: [
      { href: "/organization/jobs", label: "Jobs", icon: Briefcase },
    ],
  },
  {
    href: "/organization/compliance",
    label: "Compliance",
    icon: ClipboardCheck,
    children: [
      { href: "/organization/dashboard", label: "Dashboard", icon: LayoutDashboard },
      {
        href: "/organization/expiring-credentials",
        label: "Expiring Credentials",
        icon: AlertTriangle,
        subtitle: "Yet to be updated",
        disabled: true,
      },
    ],
  },
  {
    href: "/organization/timekeeping",
    label: "Timekeeping",
    icon: Clock,
    children: [
      { href: "/organization/timekeeping", label: "Timekeeping", icon: Clock },
    ],
  },
  {
    href: "/organization/finance",
    label: "Finance",
    icon: DollarSign,
    children: [
      { href: "/organization/finance/spend-analytics", label: "Spend Analytics", icon: TrendingDown, subtitle: "Yet to be updated", disabled: true },
      { href: "/organization/finance/invoice-drafts", label: "Invoice Drafts", icon: FileText, subtitle: "Yet to be updated", disabled: true },
      { href: "/organization/finance/final-invoices", label: "Final Invoices", icon: ReceiptIcon, subtitle: "Yet to be updated", disabled: true },
    ],
  },
  {
    href: "/organization/admin",
    label: "Admin",
    icon: Settings,
    children: [
      { href: "/organization/compliance/wallet-templates", label: "Compliance Wallet", icon: Wallet },
      { href: "/organization/compliance/requisition-templates", label: "Requisition Templates", icon: ClipboardCheck },
      { href: "/organization/admin/shift-templates", label: "Shift Templates", icon: Calendar, subtitle: "Yet to be updated", disabled: true },
      { href: "/organization/admin/workforce-group-status", label: "Workforce Group Status", icon: Users, subtitle: "Yet to be updated", disabled: true },
      { href: "/organization/admin/billing", label: "Billing", icon: CreditCard, subtitle: "Yet to be updated", disabled: true },
      { href: "/organization/admin/approvals", label: "Approvals", icon: CheckCircle2, subtitle: "Yet to be updated", disabled: true },
      { href: "/organization/management/users", label: "Users", icon: UserCog },
    ],
  },
]

export const vendorNavLinks: NavLink[] = [
  { href: "/vendor/vendors", label: "Vendor Directory", icon: Building2 },
  { href: "/vendor/performance", label: "Performance", icon: TrendingUp },
  { href: "/vendor/bids", label: "Bids", icon: Gavel },
]

export const adminNavLinks: NavLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/organizations",
    label: "Organizations",
    icon: Building2,
    children: [
      { href: "/admin/organizations", label: "List Organizations", icon: List },
      { href: "/admin/organizations/add", label: "Add Organization", icon: Plus },
    ],
  },
  { href: "/admin/msp", label: "MSPs", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: UserCog },
  { href: "/admin/vendors", label: "Vendors", icon: Network },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  {
    href: "/admin/workforce",
    label: "Workforce Management",
    icon: Link2,
    children: [
      { href: "/admin/occupations", label: "Occupations", icon: BriefcaseIcon },
      { href: "/admin/specialties", label: "Specialties", icon: Tag },
      { href: "/admin/compliance/list-items", label: "Compliance List Items", icon: List },
      { href: "/admin/compliance/templates", label: "Document Wallet Templates", subtitle: "(Compliance documents)", icon: ClipboardCheck },
      { href: "/admin/tags", label: "Tags", icon: Tag },
    ],
  },
  { href: "/admin/document-wallet-templates", label: "Invoice Templates", icon: Receipt },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/metrics", label: "Metrics Dashboard", icon: BarChart3 },
  { href: "/admin/position-transfers", label: "Position Transfer List", icon: ArrowRightLeft },
  { href: "/admin/reports", label: "Report Library", icon: FileBarChart },
]

// Organization-level navigation for admin viewing a specific organization
export function getOrganizationNavLinks(organizationId: string, organizationName: string): NavLink[] {
  const basePath = `/admin/organizations/${organizationId}`
  
  return [
    { href: "/admin/dashboard", label: "Admin Home", icon: Home },
    {
      href: basePath,
      label: "Organization",
      icon: Building2,
      children: [
        { href: basePath, label: "Profile", icon: Building2 },
        { href: `${basePath}/locations`, label: "Locations", icon: MapPin },
        { href: `${basePath}/departments`, label: "Departments", icon: FolderOpen },
        { href: `${basePath}/workforce-groups`, label: "Workforce Groups", icon: Users },
        { href: `${basePath}/vendors`, label: "Vendors", icon: Network },
        { href: `${basePath}/users`, label: "Users", icon: UserCog },
      ],
    },
    {
      href: `${basePath}/workforce-management`,
      label: "Workforce Management",
      icon: Briefcase,
      children: [
        { href: `${basePath}/occupations`, label: "Occupations", icon: BriefcaseIcon },
        { href: `${basePath}/specialties`, label: "Specialties", icon: Tag },
        { href: `${basePath}/document-wallet-templates`, label: "Document Wallet Templates", subtitle: "(Compliance documents)", icon: ClipboardCheck },
        { href: `${basePath}/tagging-rules`, label: "Tagging Rules", icon: Tag },
      ],
    },
    {
      href: `${basePath}/time-financials`,
      label: "Time & Financials",
      icon: DollarSign,
      children: [
        { href: `${basePath}/timekeeping`, label: "Timekeeping", icon: Clock },
        { href: `${basePath}/time-approvals`, label: "Time Approvals", icon: CheckCircle },
        { href: `${basePath}/billing`, label: "Billing", icon: CreditCard },
        { href: `${basePath}/invoice-templates`, label: "Invoice Templates", icon: Receipt },
      ],
    },
    {
      href: `${basePath}/engagement-communication`,
      label: "Engagement & Communication",
      icon: MessageSquare,
      children: [
        { href: `${basePath}/notifications`, label: "Notifications", icon: Bell },
        { href: `${basePath}/posting-feed`, label: "Posting Feed", icon: Rss },
      ],
    },
    {
      href: `${basePath}/metrics-reporting`,
      label: "Metrics & Reporting",
      icon: BarChart3,
      children: [
        { href: `${basePath}/metrics-dashboard`, label: "Metrics Dashboard", icon: BarChart3 },
        { href: `${basePath}/reports-library`, label: "Reports Library", icon: FileBarChart },
      ],
    },
    {
      href: `${basePath}/system-administration`,
      label: "System Administration",
      icon: Settings,
      children: [
        { href: `${basePath}/settings`, label: "Settings", icon: Settings },
        { href: `${basePath}/permissions`, label: "Permissions", icon: Shield },
        { href: `${basePath}/branding`, label: "Branding", icon: Palette },
        { href: `${basePath}/integrations`, label: "Integrations / API", icon: Plug },
        { href: `${basePath}/audit-logs`, label: "Audit Logs", icon: FileSearch },
        { href: `${basePath}/data-import-export`, label: "Data Import / Export", icon: Upload },
      ],
    },
  ]
}

