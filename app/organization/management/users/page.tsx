 "use client"

import { useMemo, useState } from "react"
import { Header, Card } from "@/components/system"
import { DataTable } from "@/components/system/table"
import { StatusChip } from "@/components/system/status-chip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

type UserStatus = "active" | "invited"

type OrgUser = {
  id: string
  name: string
  email: string
  role: string
  status: UserStatus
  lastActive: string
}

const MOCK_USERS: OrgUser[] = [
  {
    id: "eva",
    name: "Eva Sheriden",
    email: "esheridan@chpberkshires.org",
    role: "Human Resources",
    status: "active",
    lastActive: "1 hour ago",
  },
  {
    id: "john",
    name: "John Smith",
    email: "john.smith@hospital.com",
    role: "Administrator",
    status: "active",
    lastActive: "2 hours ago",
  },
  {
    id: "sarah",
    name: "Sarah Miller",
    email: "sarah.miller@hospital.com",
    role: "HR Manager",
    status: "active",
    lastActive: "1 day ago",
  },
  {
    id: "robert",
    name: "Robert Johnson",
    email: "robert.johnson@hospital.com",
    role: "Compliance Officer",
    status: "active",
    lastActive: "3 hours ago",
  },
  {
    id: "emily",
    name: "Emily Davis",
    email: "emily.davis@hospital.com",
    role: "Recruiter",
    status: "invited",
    lastActive: "Never",
  },
  {
    id: "michael",
    name: "Michael Brown",
    email: "michael.brown@hospital.com",
    role: "Viewer",
    status: "active",
    lastActive: "1 week ago",
  },
]

export default function OrganizationUsersPage() {
  const [users, setUsers] = useState<OrgUser[]>(MOCK_USERS)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all")
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("Administrator")
  const [isRolesOpen, setIsRolesOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<OrgUser | null>(null)

  const summary = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => u.status === "active").length
    const invited = users.filter((u) => u.status === "invited").length
    return { total, active, invited }
  }, [users])

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        if (statusFilter !== "all" && user.status !== statusFilter) return false
        if (!search.trim()) return true
        const needle = search.toLowerCase()
        return (
          user.name.toLowerCase().includes(needle) ||
          user.email.toLowerCase().includes(needle) ||
          user.role.toLowerCase().includes(needle)
        )
      }),
    [users, search, statusFilter],
  )

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    const next: OrgUser = {
      id: `invited_${Date.now()}`,
      name: inviteEmail.split("@")[0].replace(".", " "),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: "invited",
      lastActive: "Never",
    }
    setUsers((prev) => [...prev, next])
    setInviteEmail("")
    setInviteRole("Administrator")
    setIsInviteOpen(false)
  }

  const statusChip = (status: UserStatus) => {
    if (status === "active") {
      return <StatusChip label="Active" tone="success" />
    }
    return <StatusChip label="Invited" tone="info" />
  }

  return (
    <>
      <Header
        title="Users"
        subtitle="Manage user access, invitations, and permissions for your organization."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Management", href: "/organization/management" },
          { label: "Users" },
        ]}
        actions={[
          {
            id: "invite",
            label: "Invite User",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setIsInviteOpen(true),
          },
        ]}
      />

      <section className="space-y-6">
        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Total Users
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">{summary.total}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Active
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">{summary.active}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Invited
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">{summary.invited}</p>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full max-w-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Search users
              </p>
              <Input
                placeholder="Search by name, email, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Status
                </span>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as "all" | UserStatus)
                  }
                >
                  <SelectTrigger className="min-w-[160px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="invited">Invited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsInviteOpen(true)}
                className="ml-auto md:ml-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </div>
          </div>
        </Card>

        {/* Users table */}
        <Card
          title="Users"
          subtitle="Manage user roles and access."
        >
          <DataTable<OrgUser>
            columns={[
              {
                id: "name",
                label: "User",
                render: (user) => (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                ),
              },
              {
                id: "role",
                label: "Role",
                render: (user) => (
                  <span className="text-sm text-foreground">{user.role}</span>
                ),
              },
              {
                id: "status",
                label: "Status",
                render: (user) => statusChip(user.status),
              },
              {
                id: "lastActive",
                label: "Last Active",
                render: (user) => (
                  <span className="text-sm text-foreground">{user.lastActive}</span>
                ),
              },
              {
                id: "actions",
                label: "Actions",
                align: "right",
                render: (user) => (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(user)
                      setIsRolesOpen(true)
                    }}
                  >
                    Manage Roles
                  </Button>
                ),
              },
            ]}
            rows={filteredUsers}
          />
        </Card>
        {/* Invite User dialog */}
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
              <DialogDescription>
                Send an invitation email to give a new user access to your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Email Address *
                </p>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Role
                </p>
                <Select
                  value={inviteRole}
                  onValueChange={(value) => setInviteRole(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="HR Manager">HR Manager</SelectItem>
                    <SelectItem value="Compliance Officer">Compliance Officer</SelectItem>
                    <SelectItem value="Recruiter">Recruiter</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsInviteOpen(false)
                  setInviteEmail("")
                  setInviteRole("Administrator")
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={!inviteEmail.trim()}
              >
                Invite User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Roles dialog */}
        <Dialog open={isRolesOpen} onOpenChange={setIsRolesOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Roles & Permissions</DialogTitle>
              <DialogDescription>
                Review the available roles and their permissions. Role editing is mocked for this prototype.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 text-sm">
              <div>
                <p className="font-semibold text-foreground">Administrator</p>
                <ul className="mt-1 list-disc pl-5 text-muted-foreground text-xs">
                  <li>Full access to all features</li>
                  <li>Manage users</li>
                  <li>Configure settings</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground">Human Resources</p>
                <ul className="mt-1 list-disc pl-5 text-muted-foreground text-xs">
                  <li>Manage employees</li>
                  <li>Review workforce data</li>
                  <li>Access compliance records</li>
                  <li>Manage departments</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground">HR Manager</p>
                <ul className="mt-1 list-disc pl-5 text-muted-foreground text-xs">
                  <li>Manage jobs</li>
                  <li>Review applications</li>
                  <li>Access compliance data</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground">Compliance Officer</p>
                <ul className="mt-1 list-disc pl-5 text-muted-foreground text-xs">
                  <li>Manage compliance templates</li>
                  <li>Review documents</li>
                  <li>Approve/reject submissions</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground">Recruiter</p>
                <ul className="mt-1 list-disc pl-5 text-muted-foreground text-xs">
                  <li>Create jobs</li>
                  <li>Review applications</li>
                  <li>View reports</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-foreground">Viewer</p>
                <ul className="mt-1 list-disc pl-5 text-muted-foreground text-xs">
                  <li>View-only access</li>
                  <li>Export reports</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsRolesOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </>
  )
}
