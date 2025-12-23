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

import type { ComplianceItem } from "./compliance-templates-store"

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
  description: string
  requirements: string[]
  tags: string[]
  complianceItems?: ComplianceItem[] // Job-specific compliance requirements
  complianceTemplateId?: string // Legacy field for backward compatibility
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
  lengthWeeks?: number
  shiftHours?: number
  shiftsPerWeek?: number
  hoursPerWeek?: number
  occupation?: string // Occupation code (e.g., "RN", "LPN", "CNA")
  specialty?: string // Specialty (e.g., "ICU", "Emergency")
  duration?: string // Contract duration (e.g., "13 weeks")
  contractType?: string // Contract type (e.g., "Long-term", "Short-term", "Per diem")
  numberOfOpenPositions?: number // Number of open positions
  expectedWeeklyHours?: string // Expected weekly hours (e.g., "36 hours")
  shiftPattern?: string // Shift pattern (e.g., "3×12 hours")
  startDateFlexibility?: string // Start date flexibility (e.g., "Flexible")
  whoCanApply?: string // Who can apply (e.g., "External candidates", "Internal candidates")
  interviewRequired?: boolean // Whether interview is required
  interviewType?: string
  hiringManager?: string
  submissionType?: "Vendor & Candidate" | "Vendor Only" | "Candidate Only"
  vendorAccess?: "All Vendors" | "Selected Vendors"
  allowedVendorIds?: string[]
  vendorNotes?: string
  publishVisibility?: "Public" | "Internal" | "Private"
  publishStartDate?: string
  publishEndDate?: string
  notifyVendorsOnPublish?: boolean
  notifyCandidatesOnPublish?: boolean
  jobOverview?: string // Job overview text
  responsibilities?: string[] // Job responsibilities
  jobRequirements?: string[] // Job requirements (different from compliance requirements)
}

export type ApplicationTimelineEvent = {
  id: string
  status: "Submitted" | "Under Review" | "Qualified" | "Interview" | "Interview Scheduled" | "Offer" | "Accepted" | "Rejected"
  date: string
  note?: string
}

export type Application = {
  id: string
  jobId: string
  candidateId: string
  candidateName: string
  status: "Submitted" | "Under Review" | "Qualified" | "Interview" | "Interview Scheduled" | "Offer" | "Accepted" | "Rejected"
  submittedAt: string
  lastUpdated?: string
  documentStatus: "Complete" | "Missing" | "Pending"
  vendorName?: string
  matchScore?: number
  submittedRelative?: string
  missingDocuments?: string[]
  timeline?: ApplicationTimelineEvent[]
  interviewDate?: string
  interviewTime?: string
  interviewNotes?: string
  nextSteps?: string
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
  type: "job" | "system"
  read?: boolean
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
  compliance: { id: string; requirement: string; status: "Completed" | "Pending" | "Expired"; dueDate: string }[]
  attachments: ApplicationAttachment[]
  notes: { id: string; author: string; body: string; createdAt: string }[]
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
    summary: "Night-shift ICU traveler focused on neuro/trauma pods with strong preceptor ratings from previous rotations.",
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
    summary: "Step-down RN with hybrid PCU/Telemetry background and recent charge rotations.",
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
    title: "Registered Nurse (RN) - ICU",
    location: "Nova Health – Main Campus",
    department: "Emergency Department",
    unit: "ICU",
    shift: "Night Shift (7PM - 7AM)",
    hours: "36 hrs/week",
    billRate: "$87/hr",
    status: "Open",
    description:
      "Registered Nurse needed for ICU unit at Nova Health Main Campus. Full-time night shift role focused on high-acuity patient care.",
    requirements: ["RN License", "BLS Certification", "Background Check", "Drug Screening", "TB Test"],
    tags: ["Night Shift", "13 Weeks", "$87/hr"],
    complianceTemplateId: "tmpl-icu-core",
    startDate: "2025-01-15",
    occupation: "RN",
    specialty: "ICU",
    duration: "13 weeks",
    contractType: "Long-term",
    numberOfOpenPositions: 2,
    expectedWeeklyHours: "36 hours",
    shiftPattern: "3×12 hours",
    startDateFlexibility: "Flexible",
    whoCanApply: "This job is open to external candidates",
    interviewRequired: true,
    jobOverview: "We are seeking an experienced Registered Nurse (RN) - ICU to join our Emergency Department team. This is a long-term position starting 2025-01-15.\n\nThe ideal candidate will have strong clinical skills, excellent communication abilities, and a commitment to providing high-quality patient care in a fast-paced environment.",
    responsibilities: [
      "Provide direct patient care according to established standards and protocols",
      "Monitor patient conditions and report significant changes to physicians",
      "Administer medications and treatments as prescribed",
      "Collaborate with healthcare team members to ensure optimal patient outcomes",
      "Maintain accurate and complete patient records",
    ],
    jobRequirements: [
      "Active RN license in good standing",
      "BLS certification required",
      "Minimum 2 years of ICU experience",
      "Strong communication and interpersonal skills",
    ],
  },
  {
    id: "job-002",
    title: "Registered Nurse (RN) - Pediatrics",
    location: "Children's Hospital - Boston",
    department: "Pediatrics",
    unit: "Pediatric ICU",
    shift: "Day Shift (7AM - 7PM)",
    hours: "36 hrs/week",
    billRate: "$78/hr",
    status: "Open",
    description: "Progressive Care Unit nurse to support step-down patients transitioning from ICU.",
    requirements: ["RN License", "BLS Certification", "PALS Certification", "Background Check", "Drug Screening"],
    tags: ["Day Shift", "13 Weeks", "$78/hr"],
    complianceTemplateId: "tmpl-med-surg",
    startDate: "2025-01-15",
    occupation: "RN",
    specialty: "Pediatrics",
    duration: "13 weeks",
    contractType: "Long-term",
    numberOfOpenPositions: 1,
    expectedWeeklyHours: "36 hours",
    shiftPattern: "3×12 hours",
    startDateFlexibility: "Flexible",
    whoCanApply: "This job is open to external candidates",
    interviewRequired: true,
    jobOverview: "We are seeking a compassionate Registered Nurse (RN) - Pediatrics to join our Pediatric ICU team. This is a long-term position starting 2025-01-15.\n\nThe ideal candidate will have experience with pediatric patients, excellent communication skills, and a passion for working with children and their families.",
    responsibilities: [
      "Provide direct patient care to pediatric patients according to established standards",
      "Monitor patient conditions and report significant changes to physicians",
      "Administer medications and treatments as prescribed",
      "Collaborate with healthcare team members and families",
      "Maintain accurate and complete patient records",
    ],
    jobRequirements: [
      "Active RN license in good standing",
      "BLS and PALS certification required",
      "Minimum 1 year of pediatric experience",
      "Strong communication and interpersonal skills",
    ],
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
    description: "Emergency Room nurse with flexible scheduling. Fast-paced environment.",
    requirements: ["Active RN License", "Background Check", "Drug Screening", "ACLS Certification"],
    tags: ["Variable Shift", "8 Weeks", "$90/hr"],
    complianceTemplateId: "tmpl-icu-core",
    startDate: "2025-12-05",
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
    description: "Medical-Surgical nurse supporting post-operative patients.",
    requirements: ["Active RN License", "Background Check"],
    tags: ["Day Shift", "Ongoing", "$74/hr"],
    complianceTemplateId: "tmpl-med-surg",
    startDate: "2025-12-15",
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
    description: "Telemetry nurse focusing on cardiac monitoring.",
    requirements: ["Active RN License", "ACLS Certification", "Background Check"],
    tags: ["Evening Shift", "12 Weeks", "$82/hr"],
    complianceTemplateId: "tmpl-icu-core",
    startDate: "2025-12-11",
  },
  {
    id: "job-006",
    title: "LPN/LVN - Long-term Care",
    location: "Memorial - Main Campus",
    department: "Long-term Care",
    unit: "LTC",
    shift: "Day",
    hours: "40 hrs/week",
    billRate: "$32/hr",
    status: "Open",
    description: "Licensed Practical Nurse needed for long-term care facility. Experience with geriatric care preferred.",
    requirements: ["Active LPN/LVN License", "Background Check", "CPR Certification"],
    tags: ["Day Shift", "Ongoing", "$32/hr"],
    complianceTemplateId: "tmpl-med-surg",
    startDate: "2025-12-20",
  },
  {
    id: "job-007",
    title: "CNA - Hospital Floor",
    location: "Memorial - Main Campus",
    department: "Medical-Surgical",
    unit: "Med Surg",
    shift: "Night",
    hours: "36 hrs/week",
    billRate: "$18/hr",
    status: "Open",
    description: "Certified Nursing Assistant for hospital medical-surgical unit. Night shift position.",
    requirements: ["CNA Certification", "Background Check", "CPR Certification"],
    tags: ["Night Shift", "13 Weeks", "$18/hr"],
    complianceTemplateId: "tmpl-med-surg",
    startDate: "2025-12-18",
  },
  {
    id: "job-008",
    title: "Medical Assistant - Family Practice",
    location: "Memorial - Downtown",
    department: "Family Practice",
    unit: "Clinic",
    shift: "Day",
    hours: "40 hrs/week",
    billRate: "$22/hr",
    status: "Open",
    description: "Medical Assistant for busy family practice clinic. Phlebotomy and EKG experience preferred.",
    requirements: ["MA Certification", "Background Check", "Phlebotomy Certification"],
    tags: ["Day Shift", "Ongoing", "$22/hr"],
    complianceTemplateId: "tmpl-med-surg",
    startDate: "2025-12-22",
  },
  {
    id: "job-009",
    title: "Surgical Tech - OR",
    location: "Memorial - Main Campus",
    department: "Surgery",
    unit: "Operating Room",
    shift: "Day",
    hours: "40 hrs/week",
    billRate: "$35/hr",
    status: "Open",
    description: "Surgical Technologist for main operating room. Experience with general and orthopedic surgery required.",
    requirements: ["Surgical Tech Certification", "Background Check", "BLS Certification"],
    tags: ["Day Shift", "Ongoing", "$35/hr"],
    complianceTemplateId: "tmpl-icu-core",
    startDate: "2025-12-25",
  },
  {
    id: "job-010",
    title: "Physical Therapist - Outpatient",
    location: "Memorial - Downtown",
    department: "Rehabilitation",
    unit: "Outpatient PT",
    shift: "Day",
    hours: "40 hrs/week",
    billRate: "$55/hr",
    status: "Open",
    description: "Physical Therapist for outpatient rehabilitation center. Orthopedic and sports medicine experience preferred.",
    requirements: ["Active PT License", "Background Check"],
    tags: ["Day Shift", "Ongoing", "$55/hr"],
    complianceTemplateId: "tmpl-med-surg",
    startDate: "2025-12-28",
  },
  {
    id: "job-011",
    title: "Occupational Therapist - Inpatient",
    location: "Memorial - Main Campus",
    department: "Rehabilitation",
    unit: "Inpatient OT",
    shift: "Day",
    hours: "40 hrs/week",
    billRate: "$52/hr",
    status: "Open",
    description: "Occupational Therapist for inpatient rehabilitation unit. Experience with stroke and neurological conditions preferred.",
    requirements: ["Active OT License", "Background Check"],
    tags: ["Day Shift", "Ongoing", "$52/hr"],
    complianceTemplateId: "tmpl-med-surg",
    startDate: "2026-01-02",
  },
  {
    id: "job-012",
    title: "Respiratory Therapist - ICU",
    location: "Memorial - Main Campus",
    department: "Intensive Care",
    unit: "ICU",
    shift: "Night",
    hours: "36 hrs/week",
    billRate: "$48/hr",
    status: "Open",
    description: "Respiratory Therapist for ICU. Critical care experience required. Night shift position.",
    requirements: ["Active RT License", "Background Check", "ACLS Certification"],
    tags: ["Night Shift", "13 Weeks", "$48/hr"],
    complianceTemplateId: "tmpl-icu-core",
    startDate: "2026-01-05",
  },
  {
    id: "job-013",
    title: "Nurse Practitioner - Family Practice",
    location: "Memorial - Downtown",
    department: "Family Practice",
    unit: "Clinic",
    shift: "Day",
    hours: "40 hrs/week",
    billRate: "$75/hr",
    status: "Open",
    description: "Family Nurse Practitioner for primary care clinic. Prescriptive authority required.",
    requirements: ["Active NP License", "Background Check", "Prescriptive Authority"],
    tags: ["Day Shift", "Ongoing", "$75/hr"],
    complianceTemplateId: "tmpl-med-surg",
    startDate: "2026-01-08",
  },
  {
    id: "job-014",
    title: "Physician Assistant - Emergency",
    location: "Memorial - Main Campus",
    department: "Emergency",
    unit: "ER",
    shift: "Variable",
    hours: "36 hrs/week",
    billRate: "$72/hr",
    status: "Open",
    description: "Physician Assistant for emergency department. Fast-paced environment, variable shifts.",
    requirements: ["Active PA License", "Background Check", "ACLS Certification", "ATLS Certification"],
    tags: ["Variable Shift", "13 Weeks", "$72/hr"],
    complianceTemplateId: "tmpl-icu-core",
    startDate: "2026-01-10",
  },
]

export const applications: Application[] = [
  {
    id: "app-001",
    jobId: "job-001",
    candidateId: "cand-001",
    candidateName: "Joanne Rose",
    status: "Qualified",
    submittedAt: "2024-12-10",
    lastUpdated: "2024-12-15",
    documentStatus: "Complete",
    vendorName: "QuickCheck Solutions",
    matchScore: 95,
    submittedRelative: "2d ago",
    missingDocuments: [],
    timeline: [
      { id: "1", status: "Submitted", date: "2024-12-10" },
      { id: "2", status: "Under Review", date: "2024-12-12" },
      { id: "3", status: "Qualified", date: "2024-12-15" },
    ],
  },
  {
    id: "app-002",
    jobId: "job-003",
    candidateId: "cand-001",
    candidateName: "Joanne Rose",
    status: "Interview",
    submittedAt: "2024-12-05",
    lastUpdated: "2024-12-14",
    documentStatus: "Complete",
    vendorName: "HealthVerify Pro",
    matchScore: 88,
    submittedRelative: "5d ago",
    missingDocuments: [],
    interviewDate: "2024-12-20",
    interviewTime: "2:00 PM",
    interviewNotes: "Interview scheduled for Dec 20, 2024 at 2:00 PM",
    timeline: [
      { id: "1", status: "Submitted", date: "2024-12-05" },
      { id: "2", status: "Under Review", date: "2024-12-07" },
      { id: "3", status: "Interview Scheduled", date: "2024-12-14", note: "Interview scheduled for Dec 20, 2024 at 2:00 PM" },
    ],
    nextSteps: "Your interview is scheduled. Please review the job description and prepare questions for the hiring manager.",
  },
  {
    id: "app-003",
    jobId: "job-002",
    candidateId: "cand-001",
    candidateName: "Joanne Rose",
    status: "Accepted",
    submittedAt: "2024-11-20",
    lastUpdated: "2024-12-05",
    documentStatus: "Complete",
    vendorName: "LicenseCheck Pro",
    matchScore: 92,
    submittedRelative: "4d ago",
    missingDocuments: [],
    timeline: [
      { id: "1", status: "Submitted", date: "2024-11-20" },
      { id: "2", status: "Under Review", date: "2024-11-22" },
      { id: "3", status: "Interview Scheduled", date: "2024-11-28" },
      { id: "4", status: "Accepted", date: "2024-12-05" },
    ],
  },
  {
    id: "app-004",
    jobId: "job-004",
    candidateId: "cand-001",
    candidateName: "Joanne Rose",
    status: "Rejected",
    submittedAt: "2024-12-01",
    lastUpdated: "2024-12-08",
    documentStatus: "Complete",
    vendorName: "QuickCheck Solutions",
    matchScore: 75,
    submittedRelative: "1w ago",
    missingDocuments: [],
    timeline: [
      { id: "1", status: "Submitted", date: "2024-12-01" },
      { id: "2", status: "Under Review", date: "2024-12-03" },
      { id: "3", status: "Rejected", date: "2024-12-08" },
    ],
  },
  {
    id: "app-005",
    jobId: "job-004",
    candidateId: "cand-001",
    candidateName: "Joanne Rose",
    status: "Submitted",
    submittedAt: "2024-12-16",
    lastUpdated: "2024-12-16",
    documentStatus: "Complete",
    vendorName: "QuickCheck Solutions",
    matchScore: 68,
    submittedRelative: "Just now",
    missingDocuments: [],
    timeline: [
      { id: "1", status: "Submitted", date: "2024-12-16" },
    ],
  },
  {
    id: "app-006",
    jobId: "job-005",
    candidateId: "cand-001",
    candidateName: "Joanne Rose",
    status: "Offer",
    submittedAt: "2024-11-12",
    documentStatus: "Complete",
    vendorName: "QuickCheck Solutions",
    matchScore: 91,
    submittedRelative: "1w ago",
    missingDocuments: [],
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
  { id: "kpi-001", label: "Active Vendors", value: "12" },
  { id: "kpi-002", label: "Avg Response Time", value: "3.1 hrs" },
  { id: "kpi-003", label: "Candidates Supplied", value: "182" },
  { id: "kpi-004", label: "Active Reqs", value: "24" },
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
  { id: "notif-003", title: "Profile update", subtitle: "Recruiter shared new note", time: formatNotificationTime(new Date(Date.now() - 28 * 3600000)), type: "system", read: false },
  { id: "notif-004", title: "Shift reminder", subtitle: "Night shift tomorrow 7p-7a", time: formatNotificationTime(new Date(Date.now() - 3 * 86400000)), type: "system", read: true },
]

export const applicationInsights: ApplicationInsight[] = [
  {
    applicationId: "app-001",
    candidateId: "cand-001",
    contact: { email: "joanne.rose@email.com", phone: "+1 (595) 1394 0252" },
    vendorName: "QuickCheck Solutions",
    highlights: ["Night-shift ICU traveler", "Top 10% patient experience", "Comfortable with Impella & VV ECMO"],
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
  { answer: "travel-heavy", documents: ["Travel Agreement", "Immunization Record"] },
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
export const mockVendorKpis = vendorPerformanceKpis
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
export const mockVendorDocuments = candidates[0].documents.map((doc) => ({
  id: doc.id,
  name: doc.name,
  type: doc.type,
  uploadDate: doc.lastUpdated,
}))
