"use client"

import { useState, useMemo } from "react"
import { Header, Card } from "@/components/system"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { DataTable } from "@/components/system/table"

type Worker = {
  id: string
  fullName: string
  workerId: string
  workforceGroup: string
  hiringLeader: string
  costCenter: string
  location: string
  department: string
  occupation: string
  specialty: string
  startDate: string
  status: "active" | "upcoming" | "completed"
}

const mockWorkers: Worker[] = [
  {
    id: "1",
    fullName: "Michael Chen",
    workerId: "WK-10189",
    workforceGroup: "Rehabilitation Team",
    hiringLeader: "David Thompson",
    costCenter: "CC-4502",
    location: "Main Campus - Building B",
    department: "Rehabilitation",
    occupation: "Physical Therapist",
    specialty: "Orthopedics",
    startDate: "Oct 1, 2024",
    status: "active",
  },
  {
    id: "2",
    fullName: "Emily Davis",
    workerId: "WK-10245",
    workforceGroup: "Nursing Staff",
    hiringLeader: "Robert Anderson",
    costCenter: "CC-4503",
    location: "West Campus",
    department: "General Medicine",
    occupation: "Licensed Practical Nurse",
    specialty: "General Medicine",
    startDate: "Dec 1, 2024",
    status: "upcoming",
  },
  {
    id: "3",
    fullName: "James Wilson",
    workerId: "WK-10178",
    workforceGroup: "Nursing Staff",
    hiringLeader: "Jennifer Martinez",
    costCenter: "CC-4504",
    location: "Main Campus - Building A",
    department: "Critical Care",
    occupation: "Registered Nurse (RN)",
    specialty: "Emergency",
    startDate: "Sep 1, 2024",
    status: "active",
  },
  {
    id: "4",
    fullName: "Amanda Rodriguez",
    workerId: "WK-10256",
    workforceGroup: "Medical Support",
    hiringLeader: "Lisa Chen",
    costCenter: "CC-4505",
    location: "East Campus",
    department: "Outpatient Services",
    occupation: "Medical Assistant",
    specialty: "Outpatient Clinic",
    startDate: "Nov 1, 2024",
    status: "active",
  },
  {
    id: "5",
    fullName: "David Martinez",
    workerId: "WK-10212",
    workforceGroup: "Nursing Staff",
    hiringLeader: "Robert Anderson",
    costCenter: "CC-4506",
    location: "Main Campus - Building B",
    department: "Critical Care",
    occupation: "Registered Nurse (RN)",
    specialty: "Emergency",
    startDate: "Dec 1, 2024",
    status: "upcoming",
  },
  {
    id: "6",
    fullName: "Jessica Anderson",
    workerId: "WK-10223",
    workforceGroup: "Nursing Staff",
    hiringLeader: "David Thompson",
    costCenter: "CC-4511",
    location: "West Campus",
    department: "Critical Care",
    occupation: "Registered Nurse (RN)",
    specialty: "Oncology",
    startDate: "Oct 15, 2024",
    status: "active",
  },
  {
    id: "7",
    fullName: "Christopher White",
    workerId: "WK-10291",
    workforceGroup: "Medical Support",
    hiringLeader: "Jennifer Martinez",
    costCenter: "CC-4512",
    location: "Main Campus - Building A",
    department: "Outpatient Services",
    occupation: "Pharmacist",
    specialty: "Clinical",
    startDate: "Sep 15, 2024",
    status: "active",
  },
  {
    id: "8",
    fullName: "Nicole Garcia",
    workerId: "WK-10234",
    workforceGroup: "Nursing Staff",
    hiringLeader: "Lisa Chen",
    costCenter: "CC-4513",
    location: "East Campus",
    department: "General Medicine",
    occupation: "Certified Nursing Assistant",
    specialty: "Long-term Care",
    startDate: "Nov 10, 2024",
    status: "active",
  },
  {
    id: "9",
    fullName: "Kevin Harris",
    workerId: "WK-10245",
    workforceGroup: "Rehabilitation Team",
    hiringLeader: "Robert Anderson",
    costCenter: "CC-4514",
    location: "Main Campus - Building B",
    department: "Rehabilitation",
    occupation: "Speech Therapist",
    specialty: "Pediatrics",
    startDate: "Aug 1, 2024",
    status: "completed",
  },
  {
    id: "10",
    fullName: "Daniel King",
    workerId: "WK-10267",
    workforceGroup: "Medical Support",
    hiringLeader: "Jennifer Martinez",
    costCenter: "CC-4516",
    location: "Main Campus - Building A",
    department: "Outpatient Services",
    occupation: "Medical Assistant",
    specialty: "Outpatient Clinic",
    startDate: "Oct 20, 2024",
    status: "active",
  },
  {
    id: "11",
    fullName: "Michelle Lewis",
    workerId: "WK-10278",
    workforceGroup: "Nursing Staff",
    hiringLeader: "Lisa Chen",
    costCenter: "CC-4517",
    location: "East Campus",
    department: "General Medicine",
    occupation: "Licensed Practical Nurse",
    specialty: "General Medicine",
    startDate: "Sep 5, 2024",
    status: "active",
  },
  {
    id: "12",
    fullName: "Thomas Young",
    workerId: "WK-10198",
    workforceGroup: "Medical Support",
    hiringLeader: "Jennifer Martinez",
    costCenter: "CC-4520",
    location: "Main Campus - Building A",
    department: "Critical Care",
    occupation: "Respiratory Therapist",
    specialty: "Critical Care",
    startDate: "Sep 1, 2024",
    status: "active",
  },
]

export default function ActiveWorkforcePage() {
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "completed">("active")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredWorkers = useMemo(() => {
    let workers = mockWorkers.filter((worker) => {
      if (activeTab === "active") return worker.status === "active"
      if (activeTab === "upcoming") return worker.status === "upcoming"
      if (activeTab === "completed") return worker.status === "completed"
      return true
    })

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      workers = workers.filter(
        (worker) =>
          worker.fullName.toLowerCase().includes(query) ||
          worker.workerId.toLowerCase().includes(query) ||
          worker.workforceGroup.toLowerCase().includes(query) ||
          worker.hiringLeader.toLowerCase().includes(query) ||
          worker.location.toLowerCase().includes(query) ||
          worker.department.toLowerCase().includes(query) ||
          worker.occupation.toLowerCase().includes(query) ||
          worker.specialty.toLowerCase().includes(query)
      )
    }

    return workers
  }, [activeTab, searchQuery])

  const columns = [
    { id: "fullName", label: "Full Name", sortable: true },
    { id: "workerId", label: "Worker ID", sortable: true },
    { id: "workforceGroup", label: "Workforce Group", sortable: true },
    { id: "hiringLeader", label: "Hiring Leader", sortable: true },
    { id: "costCenter", label: "Cost Center", sortable: true },
    { id: "location", label: "Location", sortable: true },
    { id: "department", label: "Department", sortable: true },
    { id: "occupation", label: "Occupation", sortable: true },
    { id: "specialty", label: "Specialty", sortable: true },
    { id: "startDate", label: "Start Date", sortable: true },
  ]

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Active Workforce"
        subtitle="Workers tied to assignments and placements"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Command Center", href: "/organization/command-center" },
          { label: "Active Workforce" },
        ]}
      />

      <Card>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="active">Active Placements</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Placements</TabsTrigger>
              <TabsTrigger value="completed">Completed Placements</TabsTrigger>
            </TabsList>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search workers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value="active" className="mt-0">
            <DataTable
              columns={columns}
              rows={filteredWorkers}
              rowKey={(row) => row.id}
            />
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            <DataTable
              columns={columns}
              rows={filteredWorkers}
              rowKey={(row) => row.id}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <DataTable
              columns={columns}
              rows={filteredWorkers}
              rowKey={(row) => row.id}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
