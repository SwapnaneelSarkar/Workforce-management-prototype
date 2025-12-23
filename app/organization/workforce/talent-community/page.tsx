"use client"

import { useState, useMemo } from "react"
import { Header, Card, StatusChip } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Eye, UserX, Trash2, MoreVertical, X } from "lucide-react"
import { DataTable } from "@/components/system/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/system"

type Talent = {
  id: string
  workforceGroup: string
  fullName: string
  occupation: string
  specialty: string
  email: string
  phone: string
  createdDate: string
  status: "Active" | "Inactive"
  firstName: string
  lastName: string
  timezone: string
}

const mockTalents: Talent[] = [
  {
    id: "1",
    workforceGroup: "Nursing Staff",
    fullName: "Sarah Johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    occupation: "Registered Nurse (RN)",
    specialty: "ICU",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    createdDate: "Nov 15, 2024 (EST)",
    status: "Active",
    timezone: "EST",
  },
  {
    id: "2",
    workforceGroup: "Rehabilitation Team",
    fullName: "Michael Chen",
    firstName: "Michael",
    lastName: "Chen",
    occupation: "Physical Therapist",
    specialty: "Sports Medicine",
    email: "michael.chen@email.com",
    phone: "(555) 234-5678",
    createdDate: "Nov 20, 2024 (EST)",
    status: "Active",
    timezone: "EST",
  },
  {
    id: "3",
    workforceGroup: "Nursing Staff",
    fullName: "Emily Rodriguez",
    firstName: "Emily",
    lastName: "Rodriguez",
    occupation: "Licensed Practical Nurse",
    specialty: "Long-term Care",
    email: "e.rodriguez@email.com",
    phone: "(555) 345-6789",
    createdDate: "Oct 5, 2024 (EST)",
    status: "Active",
    timezone: "EST",
  },
  {
    id: "4",
    workforceGroup: "Medical Support",
    fullName: "David Kim",
    firstName: "David",
    lastName: "Kim",
    occupation: "Respiratory Therapist",
    specialty: "Neonatal",
    email: "d.kim@email.com",
    phone: "(555) 456-7890",
    createdDate: "Dec 1, 2024 (EST)",
    status: "Active",
    timezone: "EST",
  },
  {
    id: "5",
    workforceGroup: "Nursing Staff",
    fullName: "Jessica Thompson",
    firstName: "Jessica",
    lastName: "Thompson",
    occupation: "Registered Nurse (RN)",
    specialty: "Pediatrics",
    email: "j.thompson@email.com",
    phone: "(555) 567-8901",
    createdDate: "Sep 18, 2024 (EST)",
    status: "Inactive",
    timezone: "EST",
  },
]

export default function TalentCommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [workforceGroupFilter, setWorkforceGroupFilter] = useState("All")
  const [nameSearch, setNameSearch] = useState("")
  const [roleSearch, setRoleSearch] = useState("")
  const [emailSearch, setEmailSearch] = useState("")
  const [phoneSearch, setPhoneSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const workforceGroups = useMemo(() => {
    const groups = new Set(mockTalents.map((t) => t.workforceGroup))
    return Array.from(groups)
  }, [])

  const filteredTalents = useMemo(() => {
    let filtered = mockTalents

    // Workforce Group filter
    if (workforceGroupFilter !== "All") {
      filtered = filtered.filter((t) => t.workforceGroup === workforceGroupFilter)
    }

    // Name search
    if (nameSearch.trim()) {
      const query = nameSearch.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.firstName.toLowerCase().includes(query) ||
          t.lastName.toLowerCase().includes(query) ||
          t.fullName.toLowerCase().includes(query)
      )
    }

    // Role/Occupation search
    if (roleSearch.trim()) {
      const query = roleSearch.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.occupation.toLowerCase().includes(query) ||
          t.specialty.toLowerCase().includes(query)
      )
    }

    // Email search
    if (emailSearch.trim()) {
      const query = emailSearch.toLowerCase()
      filtered = filtered.filter((t) => t.email.toLowerCase().includes(query))
    }

    // Phone search
    if (phoneSearch.trim()) {
      const query = phoneSearch.replace(/\D/g, "")
      filtered = filtered.filter((t) => t.phone.replace(/\D/g, "").includes(query))
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((t) => {
        try {
          // Parse date from format "Nov 15, 2024 (EST)"
          const dateStr = t.createdDate.split(" (")[0]
          const createdDate = new Date(dateStr)
          const fromDate = new Date(dateFrom)
          return createdDate >= fromDate
        } catch {
          return true
        }
      })
    }

    if (dateTo) {
      filtered = filtered.filter((t) => {
        try {
          // Parse date from format "Nov 15, 2024 (EST)"
          const dateStr = t.createdDate.split(" (")[0]
          const createdDate = new Date(dateStr)
          const toDate = new Date(dateTo)
          toDate.setHours(23, 59, 59, 999) // Include the entire end date
          return createdDate <= toDate
        } catch {
          return true
        }
      })
    }

    // General search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.fullName.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query) ||
          t.phone.toLowerCase().includes(query) ||
          t.occupation.toLowerCase().includes(query) ||
          t.specialty.toLowerCase().includes(query) ||
          t.workforceGroup.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [
    searchQuery,
    workforceGroupFilter,
    nameSearch,
    roleSearch,
    emailSearch,
    phoneSearch,
    dateFrom,
    dateTo,
  ])

  const clearFilters = () => {
    setSearchQuery("")
    setWorkforceGroupFilter("All")
    setNameSearch("")
    setRoleSearch("")
    setEmailSearch("")
    setPhoneSearch("")
    setDateFrom("")
    setDateTo("")
  }

  const handleViewProfile = (talent: Talent) => {
    setSelectedTalent(talent)
    setIsProfileModalOpen(true)
  }

  const handleDeactivate = (talent: Talent) => {
    console.log("Deactivate:", talent)
    // TODO: Implement deactivate logic
  }

  const handleRemove = (talent: Talent) => {
    console.log("Remove:", talent)
    // TODO: Implement remove logic
  }

  const columns = [
    {
      id: "workforceGroup",
      label: "Workforce Group",
      sortable: true,
      render: (talent: Talent) => (
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {talent.workforceGroup}
        </span>
      ),
    },
    {
      id: "fullName",
      label: "Full Name",
      sortable: true,
      render: (talent: Talent) => (
        <span className="text-primary font-medium">{talent.fullName}</span>
      ),
    },
    { id: "occupation", label: "Occupation", sortable: true },
    { id: "specialty", label: "Specialty", sortable: true },
    { id: "email", label: "Email", sortable: true },
    { id: "phone", label: "Phone", sortable: true },
    { id: "createdDate", label: "Created Date", sortable: true },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (talent: Talent) => (
        <StatusChip
          status={talent.status === "Active" ? "success" : "secondary"}
          label={talent.status}
        />
      ),
    },
    {
      id: "action",
      label: "Action",
      sortable: false,
      render: (talent: Talent) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewProfile(talent)}>
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeactivate(talent)}>
              <UserX className="mr-2 h-4 w-4" />
              Deactivate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRemove(talent)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove from Talent Community
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Talent Community"
        subtitle="Searchable and filterable list of all candidates/workers"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Workforce", href: "/organization/workforce" },
          { label: "Talent Community" },
        ]}
        actions={[
          {
            id: "add-talent",
            label: "Add New Talent",
            icon: <Plus className="h-4 w-4" />,
            variant: "primary",
            onClick: () => {
              // TODO: Implement add new talent
              console.log("Add new talent")
            },
          },
        ]}
      />

      <Card>
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Workforce Group</Label>
              <Select value={workforceGroupFilter} onValueChange={setWorkforceGroupFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {workforceGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search by Name</Label>
              <Input
                placeholder="Enter first or last name"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Search by Role / Occupation</Label>
              <Input
                placeholder="Enter occupation or specialty"
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Search by Email</Label>
              <Input
                placeholder="Enter email address"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Search by Phone</Label>
              <Input
                placeholder="Enter phone number"
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Created Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <DatePicker
                    label="From"
                    value={dateFrom}
                    onChange={setDateFrom}
                  />
                </div>
                <div>
                  <DatePicker
                    label="To"
                    value={dateTo}
                    onChange={setDateTo}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            rows={filteredTalents}
            rowKey={(row) => row.id}
          />
        </div>
      </Card>

      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Candidate Profile</DialogTitle>
            <DialogDescription>Read-only view</DialogDescription>
          </DialogHeader>

          {selectedTalent && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">First Name</Label>
                    <p className="text-sm font-medium text-foreground">{selectedTalent.firstName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Last Name</Label>
                    <p className="text-sm font-medium text-foreground">{selectedTalent.lastName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="text-sm font-medium text-foreground">{selectedTalent.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Phone</Label>
                    <p className="text-sm font-medium text-foreground">{selectedTalent.phone}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Professional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Occupation</Label>
                    <p className="text-sm font-medium text-foreground">{selectedTalent.occupation}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Specialty</Label>
                    <p className="text-sm font-medium text-foreground">{selectedTalent.specialty}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Workforce Group</Label>
                    <p className="text-sm font-medium text-foreground">{selectedTalent.workforceGroup}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <StatusChip
                      status={selectedTalent.status === "Active" ? "success" : "secondary"}
                      label={selectedTalent.status}
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Created Date</Label>
                    <p className="text-sm font-medium text-foreground">{selectedTalent.createdDate}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Timezone</Label>
                    <p className="text-sm font-medium text-foreground">{selectedTalent.timezone}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
