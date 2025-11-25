export type CandidateDocument = {
  id: string
  name: string
  type: string
  status: "Pending Upload" | "Pending Verification" | "Completed" | "Expired" | "Validation Failed"
  expiresOn: string
  lastUpdated: string
}

export type CandidateProfile = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  location: string
  avatar: string
  shiftPreference: string
  experienceYears: number
  specialties: string[]
  skills: string[]
  summary: string
  vendorPartner?: string
  availabilityNotes?: string
  profileCompletePct: number
  requiredDocuments: string[]
  documents: CandidateDocument[]
}

export type MessageThread = {
  id: string
  participants: string[]
  subject: string
  unreadCount: number
  lastMessage: string
  updatedAt: string
  messages: { id: string; from: string; body: string; timestamp: string }[]
}

export type Job = {
  id: string
  title: string
  location: string
  department: string
  unit: string
  shift: string
  hours: string
  billRate: string
  status: "Open" | "Closed" | "Draft"
  complianceTemplateId: string
  description: string
  requirements: string[]
  benefits: string[]
  tags: string[]
}

export type Application = {
  id: string
  jobId: string
  candidateId: string
  candidateName: string
  status: "Submitted" | "Qualified" | "Interview" | "Offer" | "Accepted" | "Rejected"
  submittedAt: string
  documentStatus: "Complete" | "Missing" | "Pending"
  vendorName?: string
  matchScore?: number
  submittedRelative?: string
}

export type ComplianceTemplateItem = {
  id: string
  type: string
  name: string
  expirationType: "fixed" | "rolling" | "none"
  requiredAtSubmission: boolean
}

export type ComplianceTemplate = {
  id: string
  name: string
  items: ComplianceTemplateItem[]
  createdDate: string
}

export type Vendor = {
  id: string
  name: string
  tier: "Premier" | "Preferred" | "Approved"
  certifications: string[]
  contact: string
  kpis: {
    fillRate: number
    responseTimeHours: number
    candidatesSupplied: number
  }
}

export type Invoice = {
  id: string
  vendorId: string
  amount: number
  dueDate: string
  status: "Paid" | "Pending" | "Overdue"
  description: string
}

export type Timesheet = {
  id: string
  staff: string
  date: string
  hours: number
  type: "Regular" | "Overtime" | "On Call"
  status: "Pending" | "Approved" | "Rejected"
}

export type ApprovalStep = {
  id: string
  name: string
  role: string
  status: "Pending" | "Approved" | "Rejected"
  decisionAt?: string
}

export type ApprovalChain = {
  id: string
  requisitionId: string
  approvers: ApprovalStep[]
}

export type VendorBid = {
  id: string
  vendorName: string
  jobId: string
  status: "Draft" | "Submitted" | "Awarded"
  submittedAt?: string
  rate: string
  availability: string
}

export type Notification = {
  id: string
  title: string
  subtitle: string
  time: string
  type: "job" | "system" | "message"
  read?: boolean
}

export type ApplicationTimelineEvent = {
  id: string
  timestamp: string
  actor: string
  summary: string
  channel: "system" | "email" | "note"
}

export type ApplicationAttachment = {
  id: string
  fileName: string
  type: string
  size: string
  status: "Available" | "Expired"
}

export type ApplicationInsight = {
  applicationId: string
  candidateId: string
  contact: { email: string; phone: string }
  vendorName?: string
  highlights: string[]
  timeline: ApplicationTimelineEvent[]
  compliance: { id: string; requirement: string; status: "Completed" | "Pending" | "Expired"; dueDate: string }[]
  attachments: ApplicationAttachment[]
  notes: { id: string; author: string; body: string; createdAt: string }[]
}

export type Assignment = {
  id: string
  role: string
  workerId: string
  workerName: string
  vendor: string
  location: string
  startDate: string
  endDate: string
  status: "Active" | "Upcoming" | "Ending Soon"
  billRate: string
  hoursPerWeek: number
  complianceStatus: "Clear" | "Expiring" | "Missing"
  matchScore: number
}

export type WorkforceHistoryRecord = {
  id: string
  assignmentId: string
  role: string
  location: string
  startDate: string
  endDate: string
  status: "Completed" | "Extended" | "Ended"
}

export type WorkforceMember = {
  id: string
  name: string
  role: string
  status: "Active" | "Credentialing" | "Break"
  location: string
  vendor: string
  avatar: string
  currentAssignment: string
  documents: CandidateDocument[]
  history: WorkforceHistoryRecord[]
}

export type VendorAgreement = {
  id: string
  title: string
  effectiveDate: string
  status: "Active" | "Renewal Due" | "Expired"
}

export type VendorContact = {
  id: string
  name: string
  role: string
  email: string
  phone: string
  primary?: boolean
}

export type VendorDetail = {
  vendorId: string
  description: string
  metadata: { founded: string; headcount: number; coverage: string[]; avgFillDays: number }
  certificationsDetailed: { id: string; name: string; issuer: string; expiresOn: string; status: "Valid" | "Expiring" | "Expired" }[]
  agreements: VendorAgreement[]
  contacts: VendorContact[]
  bids: VendorBid[]
  documents: { id: string; name: string; updatedAt: string; type: string }[]
}

export type VendorLeaderboardRow = {
  vendorId: string
  vendorName: string
  totalBids: number
  awarded: number
  avgRate: number
  onTimePercent: number
  score: number
}

export const candidates: CandidateProfile[] = [
  {
  id: "cand-001",
  name: "Joanne Rose",
  email: "joanne.rose@email.com",
  phone: "+1 (595) 1394 0252",
  role: "Registered Nurse",
    location: "Memorial Main Campus",
  avatar: "JR",
  shiftPreference: "Night",
    experienceYears: 8,
    specialties: ["ICU", "Critical Care"],
    skills: ["ACLS", "Vent Management", "Epic", "Preceptor"],
    summary: "Night-shift ICU traveler focused on neuro/trauma pods with strong preceptor ratings from previous assignments.",
    vendorPartner: "QuickCheck Solutions",
    availabilityNotes: "Ready to start within 2 weeks; prefers block scheduling.",
    profileCompletePct: 82,
    requiredDocuments: ["Active RN License", "Background Check", "Drug Screening"],
    documents: [
      {
        id: "doc-001",
        name: "RN License.pdf",
        type: "Active RN License",
        status: "Completed",
        expiresOn: "2026-10-01",
        lastUpdated: "2025-10-05",
      },
      {
        id: "doc-002",
        name: "ACLS Certification.pdf",
        type: "ACLS Certification",
        status: "Completed",
        expiresOn: "2026-05-12",
        lastUpdated: "2025-10-10",
      },
      {
        id: "doc-003",
        name: "Background Check.pdf",
        type: "Background Check",
        status: "Pending Verification",
        expiresOn: "2025-12-31",
        lastUpdated: "2025-10-15",
      },
      {
        id: "doc-004",
        name: "Drug Screening.pdf",
        type: "Drug Screening",
        status: "Expired",
        expiresOn: "2025-08-20",
        lastUpdated: "2024-08-20",
      },
    ],
  },
  {
    id: "cand-002",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (595) 1400 8841",
    role: "Progressive Care RN",
    location: "Memorial Main Campus",
    avatar: "SJ",
    shiftPreference: "Day",
    experienceYears: 6,
    specialties: ["PCU", "Step-down"],
    skills: ["Telemetry", "Charge Nurse", "DaVinci", "Epic"],
    summary: "Step-down RN with hybrid PCU/Telemetry background and recent charge assignments.",
    vendorPartner: "HealthVerify Pro",
    availabilityNotes: "Currently in panel; available after 12/12.",
    profileCompletePct: 91,
    requiredDocuments: ["Active RN License", "Background Check", "CPR Certification"],
    documents: [
      {
        id: "doc-101",
        name: "RN License.pdf",
        type: "Active RN License",
        status: "Completed",
        expiresOn: "2026-03-14",
        lastUpdated: "2025-09-01",
      },
      {
        id: "doc-102",
        name: "CPR Certification.pdf",
        type: "CPR Certification",
        status: "Completed",
        expiresOn: "2026-01-30",
        lastUpdated: "2025-08-28",
      },
      {
        id: "doc-103",
        name: "Skills Checklist.pdf",
        type: "Skills Checklist",
        status: "Completed",
        expiresOn: "2026-08-15",
        lastUpdated: "2025-10-02",
      },
    ],
  },
  {
    id: "cand-003",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1 (595) 1968 4420",
    role: "Emergency Department RN",
    location: "Memorial Downtown",
    avatar: "MC",
    shiftPreference: "Variable",
    experienceYears: 9,
    specialties: ["ER", "Trauma", "Rapid Response"],
    skills: ["ACLS", "TNCC", "PALS", "Epic", "BiPap"],
    summary: "Rapid-response ER RN who rotates across trauma bays and flex-pods, TNCC renewed this quarter.",
    vendorPartner: "LicenseCheck Pro",
    availabilityNotes: "Available nights/weekends · comfortable floating.",
    profileCompletePct: 77,
    requiredDocuments: ["Active RN License", "Background Check", "Drug Screening", "ACLS Certification"],
    documents: [
      {
        id: "doc-201",
        name: "RN License.pdf",
        type: "Active RN License",
        status: "Completed",
        expiresOn: "2026-06-09",
        lastUpdated: "2025-09-15",
      },
      {
        id: "doc-202",
        name: "ACLS Certification.pdf",
        type: "ACLS Certification",
        status: "Completed",
        expiresOn: "2026-09-21",
        lastUpdated: "2025-09-25",
      },
      {
        id: "doc-203",
        name: "Drug Screening.pdf",
        type: "Drug Screening",
        status: "Pending Verification",
        expiresOn: "2025-12-20",
        lastUpdated: "2025-11-01",
      },
      {
        id: "doc-204",
        name: "Background Check.pdf",
        type: "Background Check",
        status: "Completed",
        expiresOn: "2026-11-01",
        lastUpdated: "2025-11-05",
      },
    ],
  },
  {
    id: "cand-004",
    name: "Emily Watson",
    email: "emily.watson@email.com",
    phone: "+1 (595) 1880 0021",
    role: "Medical Surgical RN",
    location: "Memorial Satellite Clinic",
    avatar: "EW",
    shiftPreference: "Day",
    experienceYears: 5,
    specialties: ["Med Surg", "Telemetry"],
    skills: ["EPIC", "Pre-op", "Oncology Basics", "Charge Nurse"],
    summary: "Med Surg RN with telemetry cross-training and excellent patient experience scores.",
    vendorPartner: "QuickCheck Solutions",
    availabilityNotes: "Open to float between Med Surg/Tele pods.",
    profileCompletePct: 88,
    requiredDocuments: ["Active RN License", "Background Check"],
    documents: [
      {
        id: "doc-301",
        name: "RN License.pdf",
        type: "Active RN License",
        status: "Completed",
        expiresOn: "2026-04-18",
        lastUpdated: "2025-08-12",
      },
      {
        id: "doc-302",
        name: "Background Check.pdf",
        type: "Background Check",
        status: "Completed",
        expiresOn: "2026-02-09",
        lastUpdated: "2025-07-19",
      },
      {
        id: "doc-303",
        name: "CPR Certification.pdf",
        type: "CPR Certification",
        status: "Completed",
        expiresOn: "2026-07-02",
        lastUpdated: "2025-07-21",
      },
    ],
  },
]

export const jobs: Job[] = [
  {
    id: "job-001",
    title: "ICU RN - Main Campus",
    location: "Memorial - Main Campus",
    department: "Intensive Care",
    unit: "ICU",
    shift: "Night",
    hours: "36 hrs/week",
    billRate: "$88/hr",
    status: "Open",
    complianceTemplateId: "template-001",
    description:
      "Registered Nurse needed for ICU unit at Memorial Main Campus. Full-time night shift assignment focused on high-acuity patient care.",
    requirements: ["Active RN License", "Background Check", "Drug Screening", "ACLS Certification"],
    benefits: ["Shift differential", "Housing stipend", "Full medical", "401k match"],
    tags: ["Night Shift", "13 Weeks", "$88/hr"],
  },
  {
    id: "job-002",
    title: "PCU RN - Main Campus",
    location: "Memorial - Main Campus",
    department: "Progressive Care",
    unit: "PCU",
    shift: "Day",
    hours: "40 hrs/week",
    billRate: "$76/hr",
    status: "Open",
    complianceTemplateId: "template-002",
    description: "Progressive Care Unit nurse to support step-down patients transitioning from ICU.",
    requirements: ["Active RN License", "Background Check", "CPR Certification"],
    benefits: ["Day shift", "Continuing education", "Full medical"],
    tags: ["Day Shift", "Ongoing", "$76/hr"],
  },
  {
    id: "job-003",
    title: "ER RN - Main Campus",
    location: "Memorial - Main Campus",
    department: "Emergency",
    unit: "ER",
    shift: "Variable",
    hours: "36 hrs/week",
    billRate: "$90/hr",
    status: "Open",
    complianceTemplateId: "template-002",
    description: "Emergency Room nurse with flexible scheduling. Fast-paced environment.",
    requirements: ["Active RN License", "Background Check", "Drug Screening", "ACLS Certification"],
    benefits: ["Sign-on bonus", "Shift flexibility", "Medical/Dental"],
    tags: ["Variable Shift", "8 Weeks", "$90/hr"],
  },
  {
    id: "job-004",
    title: "Med Surg RN - Main Campus",
    location: "Memorial - Main Campus",
    department: "Medical-Surgical",
    unit: "Med Surg",
    shift: "Day",
    hours: "40 hrs/week",
    billRate: "$74/hr",
    status: "Open",
    complianceTemplateId: "template-001",
    description: "Medical-Surgical nurse supporting post-operative patients.",
    requirements: ["Active RN License", "Background Check"],
    benefits: ["Mentorship", "Tuition reimbursement"],
    tags: ["Day Shift", "Ongoing", "$74/hr"],
  },
  {
    id: "job-005",
    title: "Telemetry RN - Cardiac Care",
    location: "Memorial - Downtown",
    department: "Cardiac Care",
    unit: "Telemetry",
    shift: "Evening",
    hours: "36 hrs/week",
    billRate: "$82/hr",
    status: "Open",
    complianceTemplateId: "template-001",
    description: "Telemetry nurse focusing on cardiac monitoring.",
    requirements: ["Active RN License", "ACLS Certification", "Background Check"],
    benefits: ["Cardiac specialization training", "Full medical"],
    tags: ["Evening Shift", "12 Weeks", "$82/hr"],
  },
]

export const applications: Application[] = [
  {
    id: "app-001",
    jobId: "job-001",
    candidateId: "cand-001",
    candidateName: "Joanne Rose",
    status: "Submitted",
    submittedAt: "2025-11-18",
    documentStatus: "Pending",
    vendorName: "QuickCheck Solutions",
    matchScore: 82,
    submittedRelative: "2d ago",
  },
  {
    id: "app-002",
    jobId: "job-002",
    candidateId: "cand-002",
    candidateName: "Sarah Johnson",
    status: "Interview",
    submittedAt: "2025-11-15",
    documentStatus: "Complete",
    vendorName: "HealthVerify Pro",
    matchScore: 74,
    submittedRelative: "5d ago",
  },
  {
    id: "app-003",
    jobId: "job-003",
    candidateId: "cand-003",
    candidateName: "Michael Chen",
    status: "Qualified",
    submittedAt: "2025-11-16",
    documentStatus: "Complete",
    vendorName: "LicenseCheck Pro",
    matchScore: 69,
    submittedRelative: "4d ago",
  },
  {
    id: "app-004",
    jobId: "job-004",
    candidateId: "cand-004",
    candidateName: "Emily Watson",
    status: "Offer",
    submittedAt: "2025-11-12",
    documentStatus: "Complete",
    vendorName: "QuickCheck Solutions",
    matchScore: 91,
    submittedRelative: "1w ago",
  },
]

export const complianceTemplates: ComplianceTemplate[] = [
  {
    id: "template-001",
    name: "RN Traveler Template",
    createdDate: "2025-10-01",
    items: [
      { id: "tmp-001", type: "License", name: "Active RN License", expirationType: "fixed", requiredAtSubmission: true },
      { id: "tmp-002", type: "Certification", name: "ACLS Certification", expirationType: "rolling", requiredAtSubmission: true },
      { id: "tmp-003", type: "Screening", name: "Drug Screening", expirationType: "fixed", requiredAtSubmission: false },
      { id: "tmp-004", type: "Screening", name: "Background Check", expirationType: "fixed", requiredAtSubmission: true },
    ],
  },
  {
    id: "template-002",
    name: "Acute Care Template",
    createdDate: "2025-09-18",
    items: [
      { id: "tmp-101", type: "Certification", name: "CPR Certification", expirationType: "rolling", requiredAtSubmission: true },
      { id: "tmp-102", type: "Assessment", name: "Skills Checklist", expirationType: "none", requiredAtSubmission: false },
      { id: "tmp-103", type: "Immunization", name: "TB Test", expirationType: "fixed", requiredAtSubmission: false },
    ],
  },
]

export const vendors: Vendor[] = [
  {
    id: "vendor-001",
    name: "QuickCheck Solutions",
    tier: "Premier",
    certifications: ["ISO 27001", "SOC 2 Type II"],
    contact: "contact@quickcheck.com",
    kpis: { fillRate: 94, responseTimeHours: 2.2, candidatesSupplied: 68 },
  },
  {
    id: "vendor-002",
    name: "HealthVerify Pro",
    tier: "Preferred",
    certifications: ["AAMVA Certified", "NABP Registered"],
    contact: "info@healthverify.com",
    kpis: { fillRate: 89, responseTimeHours: 3.8, candidatesSupplied: 54 },
  },
  {
    id: "vendor-003",
    name: "LicenseCheck Pro",
    tier: "Approved",
    certifications: ["State Board Certified"],
    contact: "support@licensecheck.com",
    kpis: { fillRate: 82, responseTimeHours: 5.4, candidatesSupplied: 31 },
  },
]

export const vendorPerformanceKpis = [
  { id: "kpi-001", label: "Fill Rate", value: "92%" },
  { id: "kpi-002", label: "Avg Response Time", value: "3.1 hrs" },
  { id: "kpi-003", label: "Candidates Supplied", value: "182" },
  { id: "kpi-004", label: "Active Reqs", value: "24" },
]

export const messageThreads: MessageThread[] = [
  {
    id: "thread-001",
    participants: ["Joanne Rose", "Recruiter Team"],
    subject: "Interview Availability",
    unreadCount: 1,
    lastMessage: "Can you confirm availability for next week?",
    updatedAt: "2025-11-24T09:15:00Z",
    messages: [
      { id: "m-1", from: "Recruiter Team", body: "Can you confirm availability for next week?", timestamp: "2025-11-24T09:15:00Z" },
      { id: "m-2", from: "Joanne Rose", body: "Tuesday and Thursday evenings work best.", timestamp: "2025-11-24T09:18:00Z" },
    ],
  },
  {
    id: "thread-002",
    participants: ["Compliance Desk", "Joanne Rose"],
    subject: "Missing License Copy",
    unreadCount: 0,
    lastMessage: "Please upload the renewed RN license to continue.",
    updatedAt: "2025-11-23T16:22:00Z",
    messages: [
      { id: "m-3", from: "Compliance Desk", body: "Please upload the renewed RN license to continue.", timestamp: "2025-11-23T16:22:00Z" },
    ],
  },
  {
    id: "thread-003",
    participants: ["Nova Health", "Joanne Rose"],
    subject: "Offer Details",
    unreadCount: 2,
    lastMessage: "Here's the breakdown of compensation and benefits.",
    updatedAt: "2025-11-18T11:05:00Z",
    messages: [
      { id: "m-4", from: "Nova Health", body: "Here's the breakdown of compensation and benefits.", timestamp: "2025-11-18T11:05:00Z" },
    ],
  },
]

export const invoices: Invoice[] = [
  {
    id: "inv-001",
    vendorId: "vendor-001",
    amount: 24500,
    dueDate: "2025-12-05",
    status: "Pending",
    description: "October background screenings",
  },
  {
    id: "inv-002",
    vendorId: "vendor-002",
    amount: 13200,
    dueDate: "2025-12-12",
    status: "Pending",
    description: "Credential verification bundle",
  },
  {
    id: "inv-003",
    vendorId: "vendor-003",
    amount: 4950,
    dueDate: "2025-11-30",
    status: "Paid",
    description: "Drug testing services",
  },
]

export const timesheets: Timesheet[] = [
  { id: "ts-001", staff: "Joanne Rose", date: "2025-11-21", hours: 12, type: "Regular", status: "Pending" },
  { id: "ts-002", staff: "James Mitchell", date: "2025-11-21", hours: 10, type: "Overtime", status: "Approved" },
  { id: "ts-003", staff: "Sarah Johnson", date: "2025-11-21", hours: 8, type: "Regular", status: "Rejected" },
  { id: "ts-004", staff: "Emily Watson", date: "2025-11-20", hours: 12, type: "On Call", status: "Pending" },
]

export const approvalChains: ApprovalChain[] = [
  {
    id: "approval-001",
    requisitionId: "job-001",
    approvers: [
      { id: "ap-1", name: "Liam Thompson", role: "Nurse Director", status: "Approved", decisionAt: "2025-11-20" },
      { id: "ap-2", name: "Sophia Martinez", role: "HR Lead", status: "Pending" },
      { id: "ap-3", name: "Olivia Brown", role: "CNO", status: "Pending" },
    ],
  },
]

export const vendorBids: VendorBid[] = [
  {
    id: "bid-001",
    vendorName: "QuickCheck Solutions",
    jobId: "job-001",
    status: "Awarded",
    submittedAt: "2025-11-23",
    rate: "$86/hr",
    availability: "Can start Dec 2",
  },
  {
    id: "bid-002",
    vendorName: "HealthVerify Pro",
    jobId: "job-002",
    status: "Draft",
    rate: "$78/hr",
    availability: "Open Jan 5",
  },
  {
    id: "bid-003",
    vendorName: "QuickCheck Solutions",
    jobId: "job-003",
    status: "Submitted",
    submittedAt: "2025-11-22",
    rate: "$89/hr",
    availability: "Can start Dec 9",
  },
  {
    id: "bid-004",
    vendorName: "HealthVerify Pro",
    jobId: "job-004",
    status: "Awarded",
    submittedAt: "2025-11-10",
    rate: "$74/hr",
    availability: "Ready in 1 week",
  },
  {
    id: "bid-005",
    vendorName: "LicenseCheck Pro",
    jobId: "job-005",
    status: "Submitted",
    submittedAt: "2025-11-19",
    rate: "$82/hr",
    availability: "Available Dec 1",
  },
]

// Helper function to format notification timestamps
function formatNotificationTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return diffHours === 1 ? "1h ago" : `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday • " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  if (diffDays < 7) return date.toLocaleDateString("en-US", { day: "numeric", month: "short" }) + " • " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) + " • " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

export const notifications: Notification[] = [
  { id: "notif-001", title: "New job invite", subtitle: "Nova Health | ICU RN", time: formatNotificationTime(new Date(Date.now() - 2 * 3600000)), type: "job", read: false },
  { id: "notif-002", title: "Document verified", subtitle: "Background Check approved", time: formatNotificationTime(new Date(Date.now() - 25 * 3600000)), type: "system", read: false },
  { id: "notif-003", title: "New message", subtitle: "Recruiter team replied", time: formatNotificationTime(new Date(Date.now() - 28 * 3600000)), type: "message", read: false },
  { id: "notif-004", title: "Shift reminder", subtitle: "Night shift tomorrow 7p-7a", time: formatNotificationTime(new Date(Date.now() - 3 * 86400000)), type: "system", read: true },
]

export const applicationInsights: ApplicationInsight[] = [
  {
    applicationId: "app-001",
    candidateId: "cand-001",
    contact: { email: "joanne.rose@email.com", phone: "+1 (595) 1394 0252" },
    vendorName: "QuickCheck Solutions",
    highlights: ["Night-shift ICU traveler", "Top 10% patient experience", "Comfortable with Impella & VV ECMO"],
    timeline: [
      { id: "evt-001", timestamp: "2025-11-18T09:13:00Z", actor: "System", summary: "Application submitted", channel: "system" },
      { id: "evt-002", timestamp: "2025-11-18T09:20:00Z", actor: "Compliance Desk", summary: "Requested renewed drug screen", channel: "email" },
      { id: "evt-003", timestamp: "2025-11-19T14:45:00Z", actor: "Hiring Panel", summary: "Panel review scheduled", channel: "system" },
      { id: "evt-004", timestamp: "2025-11-20T11:12:00Z", actor: "Recruiter Team", summary: "Availability call logged", channel: "note" },
    ],
    compliance: [
      { id: "tmp-001", requirement: "Active RN License", status: "Completed", dueDate: "01 Oct 2026" },
      { id: "tmp-002", requirement: "ACLS Certification", status: "Completed", dueDate: "12 May 2026" },
      { id: "tmp-003", requirement: "Drug Screening", status: "Expired", dueDate: "20 Aug 2025" },
      { id: "tmp-004", requirement: "Background Check", status: "Pending", dueDate: "31 Dec 2025" },
    ],
    attachments: [
      { id: "file-001", fileName: "ICU-Case-Log.pdf", type: "Experience", size: "1.2MB", status: "Available" },
      { id: "file-002", fileName: "Availability-Grid.xlsx", type: "Schedule", size: "320KB", status: "Available" },
    ],
    notes: [
      { id: "note-001", author: "Maya Patel", body: "Prefers block scheduling; strong review from St. Vincent's", createdAt: "2025-11-19T09:02:00Z" },
      { id: "note-002", author: "Olivia Brown", body: "Need renewed tox screen before panel", createdAt: "2025-11-20T07:45:00Z" },
    ],
  },
  {
    applicationId: "app-002",
    candidateId: "cand-002",
    contact: { email: "sarah.johnson@email.com", phone: "+1 (595) 1400 8841" },
    vendorName: "HealthVerify Pro",
    highlights: ["Charge experience", "Telemetry + DaVinci exposure", "Patient sat 4.8/5"],
    timeline: [
      { id: "evt-101", timestamp: "2025-11-15T10:05:00Z", actor: "System", summary: "Submitted application", channel: "system" },
      { id: "evt-102", timestamp: "2025-11-16T08:40:00Z", actor: "Hiring Panel", summary: "Qualified by recruiter", channel: "system" },
      { id: "evt-103", timestamp: "2025-11-17T13:10:00Z", actor: "Panel Assistant", summary: "Interview slot sent", channel: "email" },
      { id: "evt-104", timestamp: "2025-11-18T16:30:00Z", actor: "Sarah Johnson", summary: "Confirmed 11/21 interview", channel: "note" },
    ],
    compliance: [
      { id: "tmp-101", requirement: "CPR Certification", status: "Completed", dueDate: "30 Jan 2026" },
      { id: "tmp-102", requirement: "Skills Checklist", status: "Completed", dueDate: "15 Aug 2026" },
      { id: "tmp-103", requirement: "TB Test", status: "Pending", dueDate: "12 Dec 2025" },
    ],
    attachments: [
      { id: "file-101", fileName: "Charge-Evals.pdf", type: "Performance", size: "890KB", status: "Available" },
    ],
    notes: [
      { id: "note-101", author: "Sophia Martinez", body: "Already interviewed on 11/21, panel feedback pending.", createdAt: "2025-11-21T17:05:00Z" },
    ],
  },
  {
    applicationId: "app-003",
    candidateId: "cand-003",
    contact: { email: "michael.chen@email.com", phone: "+1 (595) 1968 4420" },
    vendorName: "LicenseCheck Pro",
    highlights: ["TNCC renewed this quarter", "Cross-trained to float to ICU", "Rapid response rotation"],
    timeline: [
      { id: "evt-201", timestamp: "2025-11-16T07:28:00Z", actor: "System", summary: "Application submitted", channel: "system" },
      { id: "evt-202", timestamp: "2025-11-16T09:55:00Z", actor: "Recruiter Team", summary: "Credentials verified", channel: "note" },
      { id: "evt-203", timestamp: "2025-11-17T11:42:00Z", actor: "Compliance Desk", summary: "Drug screen pending", channel: "email" },
    ],
    compliance: [
      { id: "tmp-001", requirement: "Active RN License", status: "Completed", dueDate: "09 Jun 2026" },
      { id: "tmp-002", requirement: "ACLS Certification", status: "Completed", dueDate: "21 Sep 2026" },
      { id: "tmp-003", requirement: "Drug Screening", status: "Pending", dueDate: "20 Dec 2025" },
      { id: "tmp-004", requirement: "Background Check", status: "Completed", dueDate: "01 Nov 2026" },
    ],
    attachments: [
      { id: "file-201", fileName: "TNCC.pdf", type: "Certification", size: "450KB", status: "Available" },
    ],
    notes: [
      { id: "note-201", author: "James Whitmore", body: "Requests mix of nights/weekends; ok with trauma bay rotation.", createdAt: "2025-11-17T12:04:00Z" },
    ],
  },
  {
    applicationId: "app-004",
    candidateId: "cand-004",
    contact: { email: "emily.watson@email.com", phone: "+1 (595) 1880 0021" },
    vendorName: "QuickCheck Solutions",
    highlights: ["4.9 HCAHPS trend", "Telemetry cross-training", "Charge-ready"],
    timeline: [
      { id: "evt-301", timestamp: "2025-11-12T12:35:00Z", actor: "System", summary: "Application submitted", channel: "system" },
      { id: "evt-302", timestamp: "2025-11-13T08:10:00Z", actor: "Hiring Panel", summary: "Advanced to offer review", channel: "system" },
      { id: "evt-303", timestamp: "2025-11-14T10:25:00Z", actor: "Recruiter Team", summary: "Offer package shared", channel: "email" },
    ],
    compliance: [
      { id: "tmp-001", requirement: "Active RN License", status: "Completed", dueDate: "18 Apr 2026" },
      { id: "tmp-004", requirement: "Background Check", status: "Completed", dueDate: "09 Feb 2026" },
      { id: "tmp-003", requirement: "Drug Screening", status: "Completed", dueDate: "30 Sep 2026" },
    ],
    attachments: [
      { id: "file-301", fileName: "Offer-Letter.pdf", type: "Offer", size: "410KB", status: "Available" },
    ],
    notes: [
      { id: "note-301", author: "Liam Thompson", body: "Offer accepted verbally, awaiting signed docs.", createdAt: "2025-11-18T08:15:00Z" },
    ],
  },
]

export const assignments: Assignment[] = [
  {
    id: "asn-001",
    role: "ICU RN",
    workerId: "cand-001",
    workerName: "Joanne Rose",
    vendor: "QuickCheck Solutions",
    location: "Memorial Main Campus • ICU",
    startDate: "2025-10-21",
    endDate: "2026-01-20",
    status: "Active",
    billRate: "$88/hr",
    hoursPerWeek: 36,
    complianceStatus: "Expiring",
    matchScore: 86,
  },
  {
    id: "asn-002",
    role: "PCU RN",
    workerId: "cand-002",
    workerName: "Sarah Johnson",
    vendor: "HealthVerify Pro",
    location: "Memorial Main Campus • PCU",
    startDate: "2025-09-02",
    endDate: "2025-12-14",
    status: "Ending Soon",
    billRate: "$76/hr",
    hoursPerWeek: 40,
    complianceStatus: "Clear",
    matchScore: 91,
  },
  {
    id: "asn-003",
    role: "ER RN",
    workerId: "cand-003",
    workerName: "Michael Chen",
    vendor: "LicenseCheck Pro",
    location: "Memorial Downtown • ER",
    startDate: "2025-11-10",
    endDate: "2026-02-10",
    status: "Active",
    billRate: "$90/hr",
    hoursPerWeek: 36,
    complianceStatus: "Missing",
    matchScore: 79,
  },
  {
    id: "asn-004",
    role: "Med Surg RN",
    workerId: "cand-004",
    workerName: "Emily Watson",
    vendor: "QuickCheck Solutions",
    location: "Memorial Satellite • Med Surg",
    startDate: "2025-12-02",
    endDate: "2026-03-05",
    status: "Upcoming",
    billRate: "$74/hr",
    hoursPerWeek: 40,
    complianceStatus: "Clear",
    matchScore: 88,
  },
]

export const workforceMembers: WorkforceMember[] = candidates.map((candidate, index) => {
  const activeAssignment = assignments.find((assignment) => assignment.workerId === candidate.id)
  const status: WorkforceMember["status"] = activeAssignment
    ? activeAssignment.status === "Upcoming"
      ? "Credentialing"
      : "Active"
    : index % 2 === 0
      ? "Break"
      : "Credentialing"
  return {
    id: `worker-${candidate.id}`,
    name: candidate.name,
    role: candidate.role,
    status,
    location: candidate.location,
    vendor: candidate.vendorPartner ?? "Internal Talent",
    avatar: candidate.avatar,
    currentAssignment: activeAssignment ? `${activeAssignment.role} • ${activeAssignment.location}` : "Bench",
    documents: candidate.documents,
    history: [
      {
        id: `hist-${candidate.id}-current`,
        assignmentId: activeAssignment?.id ?? `asn-${candidate.id}-bench`,
        role: activeAssignment?.role ?? candidate.role,
        location: activeAssignment?.location ?? candidate.location,
        startDate: activeAssignment?.startDate ?? "2025-07-01",
        endDate: activeAssignment?.endDate ?? "2025-09-28",
        status: activeAssignment ? "Extended" : "Completed",
      },
      {
        id: `hist-${candidate.id}-prev`,
        assignmentId: `prev-${candidate.id}`,
        role: candidate.role,
        location: "Memorial South Pavilion",
        startDate: "2025-03-04",
        endDate: "2025-06-30",
        status: "Completed",
      },
    ],
  }
})

export const vendorDetails: VendorDetail[] = [
  {
    vendorId: "vendor-001",
    description: "Premier compliance partner covering background, drug, and license management specialized for health systems.",
    metadata: { founded: "2012", headcount: 58, coverage: ["National", "Rural expansion"], avgFillDays: 4.2 },
    certificationsDetailed: [
      { id: "cert-001", name: "ISO 27001", issuer: "ISO", expiresOn: "2026-04-01", status: "Valid" },
      { id: "cert-002", name: "SOC 2 Type II", issuer: "AICPA", expiresOn: "2025-12-31", status: "Expiring" },
    ],
    agreements: [
      { id: "agr-001", title: "Master Staffing Agreement", effectiveDate: "2025-01-15", status: "Active" },
      { id: "agr-002", title: "Data Processing Addendum", effectiveDate: "2024-08-01", status: "Renewal Due" },
    ],
    contacts: [
      { id: "contact-001", name: "Maya Patel", role: "Account Director", email: "maya@quickcheck.com", phone: "+1 (555) 555-0198", primary: true },
      { id: "contact-002", name: "Luis Romero", role: "Compliance Lead", email: "luis@quickcheck.com", phone: "+1 (555) 555-0102" },
    ],
    bids: vendorBids.filter((bid) => bid.vendorName === "QuickCheck Solutions"),
    documents: [
      { id: "doc-v-001", name: "Security Posture.pdf", updatedAt: "2025-10-02", type: "Security" },
      { id: "doc-v-002", name: "Insurance Certificate.pdf", updatedAt: "2025-09-12", type: "Insurance" },
    ],
  },
  {
    vendorId: "vendor-002",
    description: "Credentialing co-op providing same-day verifications and automated reminders.",
    metadata: { founded: "2015", headcount: 42, coverage: ["Regional", "Telehealth"], avgFillDays: 5.1 },
    certificationsDetailed: [
      { id: "cert-101", name: "AAMVA Certified", issuer: "AAMVA", expiresOn: "2026-07-15", status: "Valid" },
      { id: "cert-102", name: "NABP Registered", issuer: "NABP", expiresOn: "2025-11-30", status: "Expiring" },
    ],
    agreements: [
      { id: "agr-101", title: "Verification SLA", effectiveDate: "2024-11-01", status: "Active" },
      { id: "agr-102", title: "Data Privacy Addendum", effectiveDate: "2023-09-18", status: "Expired" },
    ],
    contacts: [
      { id: "contact-101", name: "Elena Brooks", role: "Client Partner", email: "elena@healthverify.com", phone: "+1 (555) 555-0119", primary: true },
      { id: "contact-102", name: "Marcus Green", role: "Ops Manager", email: "marcus@healthverify.com", phone: "+1 (555) 555-0181" },
    ],
    bids: vendorBids.filter((bid) => bid.vendorName === "HealthVerify Pro"),
    documents: [{ id: "doc-v-101", name: "Renewal Packet.zip", updatedAt: "2025-10-29", type: "Contract" }],
  },
  {
    vendorId: "vendor-003",
    description: "Boutique licensing specialist focused on rapid state board turnarounds.",
    metadata: { founded: "2010", headcount: 26, coverage: ["Multi-state", "Compact"], avgFillDays: 6.4 },
    certificationsDetailed: [{ id: "cert-201", name: "State Board Certified", issuer: "Multiple", expiresOn: "2026-02-10", status: "Valid" }],
    agreements: [
      { id: "agr-201", title: "Licensure Services", effectiveDate: "2025-03-01", status: "Active" },
    ],
    contacts: [
      { id: "contact-201", name: "Noah Price", role: "Founder", email: "noah@licensecheck.com", phone: "+1 (555) 555-0125", primary: true },
    ],
    bids: vendorBids.filter((bid) => bid.vendorName === "LicenseCheck Pro"),
    documents: [{ id: "doc-v-201", name: "Service Overview.pdf", updatedAt: "2025-08-18", type: "Overview" }],
  },
]

const parseRate = (rate: string) => Number(rate.replace(/[^0-9.]/g, "")) || 0

export const buildVendorLeaderboard = (vendorList: Vendor[], bidsList: VendorBid[]): VendorLeaderboardRow[] =>
  vendorList.map((vendor) => {
    const relatedBids = bidsList.filter((bid) => bid.vendorName === vendor.name)
    const awarded = relatedBids.filter((bid) => bid.status === "Awarded").length
    const avgRate = relatedBids.length ? Math.round(relatedBids.reduce((sum, bid) => sum + parseRate(bid.rate), 0) / relatedBids.length) : 0
    const onTimePercent = Math.min(99, Math.max(78, vendor.kpis.fillRate - vendor.kpis.responseTimeHours * 2 + awarded * 3))
    const score = Math.round(awarded * 8 + vendor.kpis.fillRate * 0.35 + (100 - vendor.kpis.responseTimeHours * 5) * 0.3)
    return {
      vendorId: vendor.id,
      vendorName: vendor.name,
      totalBids: relatedBids.length,
      awarded,
      avgRate,
      onTimePercent,
      score,
    }
  })

export const vendorLeaderboard: VendorLeaderboardRow[] = buildVendorLeaderboard(vendors, vendorBids)

export const onboardingDocumentMappings = [
  { answer: "Travel Assignment", documents: ["Travel Agreement", "Immunization Record"] },
  { answer: "Night", documents: ["Fatigue Acknowledgement"] },
  { answer: "ICU", documents: ["ICU Skills Checklist"] },
]

// Legacy exports kept for backwards compatibility during migration
export const mockCandidateProfile = candidates[0]
export const mockJobs = jobs
export const mockDocuments = candidates[0].documents.map((doc) => ({
  id: doc.id,
  name: doc.name,
  type: doc.type,
  uploadDate: doc.lastUpdated,
  verified: doc.status === "Completed",
}))
export const mockNotifications = notifications
export const mockMessageThreads = messageThreads.map((thread) => ({
  id: thread.id,
  participant: thread.participants[0],
  subject: thread.subject,
  preview: thread.lastMessage,
  updatedAt: new Date(thread.updatedAt).toLocaleString(),
}))
export const mockInvoices = invoices.map((invoice) => ({
  id: invoice.id,
  vendor: vendors.find((vendor) => vendor.id === invoice.vendorId)?.name ?? "Vendor",
  amount: `$${invoice.amount.toLocaleString()}`,
  dueDate: invoice.dueDate,
  status: invoice.status,
}))
export const mockTimesheets = timesheets.map((sheet) => ({
  id: sheet.id,
  staff: sheet.staff,
  weekEnding: sheet.date,
  hours: sheet.hours,
  status: sheet.status,
}))
export const mockVendorKpis = vendorPerformanceKpis
export const mockRequisitions = jobs.map((job, index) => ({
  id: job.id,
  title: job.title,
  department: job.department,
  openPositions: (index % 3) + 1,
  submittedDate: "2025-11-15",
  status: job.status === "Open" ? "Open" : "In Progress",
  hireLeader: "Nancy Anderson",
  approvalChain: approvalChains[0]?.approvers.map((approver) => approver.name) ?? [],
}))
export const mockApplications = applications.map((app) => ({
  id: app.id,
  candidateName: app.candidateName,
  jobTitle: jobs.find((job) => job.id === app.jobId)?.title ?? "Role",
  appliedDate: app.submittedAt,
  status: app.status,
  documentStatus: app.documentStatus === "Complete" ? "Complete" : "Incomplete",
  vendor: app.vendorName ?? "Vendor partner",
  matchScore: app.matchScore ?? 70,
  appliedAgo: app.submittedRelative ?? app.submittedAt,
}))
export const mockVendors = vendors.map((vendor) => ({
  id: vendor.id,
  name: vendor.name,
  service: "Staffing",
  contact: vendor.contact,
  phone: "+1 (555) 123-4567",
  certifications: vendor.certifications,
  activeClients: vendor.kpis.candidatesSupplied,
}))
export const mockComplianceItems = complianceTemplates[0].items.map((item, index) => ({
  id: item.id,
  name: item.name,
  type: item.type,
  status: index < 2 ? "complete" : "incomplete",
  progress: index < 2 ? 12 : 4,
  total: 12,
}))
export const mockComplianceTemplates = complianceTemplates.map((template) => ({
  id: template.id,
  name: template.name,
  items: template.items.map((item) => item.name),
  createdDate: template.createdDate,
}))
export const mockVendorDocuments = candidates[0].documents.map((doc) => ({
  id: doc.id,
  name: doc.name,
  type: doc.type,
  uploadDate: doc.lastUpdated,
}))
