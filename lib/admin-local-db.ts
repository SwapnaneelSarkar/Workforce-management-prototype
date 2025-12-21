export const ADMIN_LOCAL_DB_KEY = "wf_admin_local_db"

export type Specialty = {
  id: string
  name: string // Specialty name
  code: string
  acronym?: string
  description?: string
  group?: string // Group/category for grouping specialties (e.g., "Critical Care", "Medical", "Surgical")
  isActive: boolean // Active/Inactive toggle
  createdAt: string
  updatedAt: string
}

export type OccupationSpecialty = {
  id: string
  occupationId: string
  specialtyId: string
  displayName: string // e.g., "Registered Nurse - TELE"
  createdAt: string
  updatedAt: string
}

export type Department = {
  id: string
  name: string
  deptType?: string
  relatedUsers: string[] // User IDs
  costCentre?: string
  relatedOccupationSpecialties: string[] // OccupationSpecialty IDs
}

export type AdminLocalDbOrganizationLocation = {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone?: string
  email?: string
  locationType?: string
  costCentre?: string
  photo?: string
  departments: Department[]
}

export type AdminLocalDbOrganizationEntry = {
  id: string
  name: string
  email: string
  phone: string
  website?: string
  industry?: string
  description?: string
  logo?: string
  orgType?: string
  serviceAgreement?: string
  timezone?: string
  agreementRenewalDate?: string
  estimatedAnnualSpend?: number // Estimated annual spend for MSP calculations
  locations: AdminLocalDbOrganizationLocation[]
  occupationIds?: string[] // Array of Occupation IDs
  createdAt: string
  updatedAt: string
}

export type Occupation = {
  id: string
  name: string
  code: string // Short code like "RN", "LPN", etc.
  description?: string
  industry?: string
  modality?: string
  acronym?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type OccupationQuestionnaire = {
  id: string
  occupationId: string
  isActive: boolean // Toggle to turn questions off for candidate experience
  questions: Array<{
    id: string
    question: string
    type: "text" | "textarea" | "select" | "checkbox" | "radiobox" | "date" | "number"
    required: boolean
    options?: string[] // For select/checkbox/radiobox types
    placeholder?: string
  }>
  createdAt: string
  updatedAt: string
}

export type GeneralQuestionnaire = {
  id: string
  questions: Array<{
    id: string
    question: string
    type: "text" | "textarea" | "select" | "checkbox" | "radiobox" | "date" | "number" | "file"
    required: boolean
    options?: string[] // For select/checkbox/radiobox types
    placeholder?: string
  }>
  createdAt: string
  updatedAt: string
}

export type WorkforceGroup = {
  id: string
  modality: string
  name: string
  limitShiftVisibility: boolean
  shiftVisibilityHours?: number // Hours to shift start
  routingPosition: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ComplianceListItem = {
  id: string
  name: string
  category: "Background and Identification" | "Education and Assessments" | "Immigration" | "Licenses" | "Certifications" | "Employee Health" | "Human Resources" | "Other Qualifications" | "Other"
  expirationType: "Expiration Date" | "Non-Expirable" | "Expiration Rule"
  expirationRuleValue?: number // Number for expiration rule (e.g., 30)
  expirationRuleInterval?: "Days" | "Weeks" | "Months" | "Years" // Interval for expiration rule
  issuerRequirement: boolean // Toggle for issuer requirement
  issuer?: string // Issuer name (shown when issuerRequirement is true)
  responseStyle: "Pending File Upload" | "Internal Task" | "Download Attachment and Upload" | "Link"
  uploadAttachment?: string // Attachment URL for "Download Attachment and Upload"
  linkUrl?: string // Link URL for "Link" response style
  instructionalNotes?: string // Always visible instructional notes
  displayToCandidate: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AdminWalletTemplate = {
  id: string
  name: string
  occupationId?: string // Reference to Occupation.id
  occupationCode?: string // Occupation code (e.g., "RN", "LPN") - for quick lookup
  specialtyId?: string // Optional: Reference to Specialty.id
  specialtyCode?: string // Optional: Specialty code (e.g., "ICU", "ER")
  listItemIds: string[] // References to ComplianceListItem.id
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type TaggingRule = {
  id: string
  ruleName: string
  triggerQuestion: string // Question ID or question text reference
  condition: "equals" | "contains" | "is blank" | "is not blank"
  triggerValue?: string // Value to match (not used for "is blank" / "is not blank")
  tagToApply: string // Tag name to apply to user profile (for backward compatibility)
  tagId?: string // Reference to Tag.id (preferred)
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Tag = {
  id: string
  name: string
  taskType: string // Task Type (dropdown field)
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type User = {
  id: string
  name: string
  email: string
  phone?: string
  role: string // e.g., "Admin", "Organization Admin", "Candidate", etc.
  tags: string[] // Tags applied via tagging rules (not visible to candidates)
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type VendorUser = {
  id: string
  vendorId: string
  firstName: string
  lastName: string
  title: string
  email: string
  officePhone?: string
  mobilePhone?: string
  status: "Active" | "Inactive"
  createdAt: string
  updatedAt: string
}

export type PortalUser = {
  id: string
  userType: "Program" | "Vendor" | "Organization"
  groupName?: string // e.g., Vendor A, Organization B
  role?: string // Display role (e.g., Hiring Manager)
  firstName: string
  lastName: string
  title: string
  email: string
  officePhone?: string
  mobilePhone?: string
  status: "Active" | "Inactive"
  userIdNumber?: string
  createDate?: string // display-friendly date
  lastLogin?: string // display-friendly date/time
  createdAt: string
  updatedAt: string
}

export type VendorDocument = {
  id: string
  vendorId: string
  name: string
  type: "Legal" | "Marketing" | "Finance" | "HR" | "Project" | "Other"
  uploadedDate: string
  uploadedBy: string
  description?: string
  fileUrl?: string
  createdAt: string
  updatedAt: string
}

export type VendorNote = {
  id: string
  vendorId: string
  noteType: "General" | "Billing" | "Issue" | "Request" | "Other"
  noteMessage: string
  organization?: string
  authorName: string
  date: string
  createdAt: string
  updatedAt: string
}

export type VendorOrganization = {
  id: string
  vendorId: string
  organizationId: string
  status: "Active" | "Inactive" | "Pending"
  startDate?: string
  endDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type MSP = {
  id: string
  name: string
  logo?: string
  industry?: string
  organizationType: "Staffing agency" | "MSP firm" | "Organization staffing office"
  // Headquarters Address
  headquartersStreet?: string
  headquartersCity?: string
  headquartersState?: string
  headquartersZip?: string
  headquartersCountry?: string
  // Billing Address
  billingSameAsHeadquarters: boolean
  billingStreet?: string
  billingCity?: string
  billingState?: string
  billingZip?: string
  billingCountry?: string
  // Contact Details
  organizationPhone?: string
  timezone?: string
  // Master Services Agreement
  msaDocument?: string // File URL or name
  agreementRenewalDate?: string
  createdAt: string
  updatedAt: string
}

export type MSPOrganization = {
  id: string
  mspId: string
  organizationId: string
  addendumAgreement?: string // File URL or name
  mspFeePercentage?: number // MSP fee percentage
  sasFeePercentage?: number // SAS fee percentage
  agreementStartDate?: string
  agreementRenewalDate?: string
  possibleCancellationDate?: string
  createdAt: string
  updatedAt: string
}

export type Vendor = {
  id: string
  name: string
  logo?: string
  industries: string[] // Multi-select industries
  certifiedBusinessClassifications: string[] // Multi-select classifications
  aboutVendor?: string
  isActive: boolean
  taxIdNumber?: string
  mainPhoneNumber?: string
  website?: string
  address?: string
  annualRevenue?: string
  employeeCount?: number
  internalVendorIdNumber?: string
  createdDate?: string
  occupationIds: string[] // Selected occupation IDs
  activationDate?: string
  inactivationDate?: string
  createdAt: string
  updatedAt: string
}

export type AdminLocalDbState = {
  organizations: Record<string, AdminLocalDbOrganizationEntry>
  occupations: Record<string, Occupation>
  occupationQuestionnaires: Record<string, OccupationQuestionnaire>
  generalQuestionnaire: GeneralQuestionnaire | null
  specialties: Record<string, Specialty>
  occupationSpecialties: Record<string, OccupationSpecialty>
  workforceGroups: Record<string, WorkforceGroup>
  complianceListItems: Record<string, ComplianceListItem>
  adminWalletTemplates: Record<string, AdminWalletTemplate>
  taggingRules: Record<string, TaggingRule>
  tags: Record<string, Tag>
  users: Record<string, User>
  portalUsers: Record<string, PortalUser>
  portalUserAffiliations: Record<string, PortalUserAffiliation>
  portalUserNotes: Record<string, PortalUserNote>
  vendors: Record<string, Vendor>
  vendorUsers: Record<string, VendorUser>
  vendorDocuments: Record<string, VendorDocument>
  vendorNotes: Record<string, VendorNote>
  vendorOrganizations: Record<string, VendorOrganization>
  msps: Record<string, MSP>
  mspOrganizations: Record<string, MSPOrganization>
  lastUpdated?: string
}

const defaultOrganizations: AdminLocalDbOrganizationEntry[] = [
  {
    id: "org-001",
    name: "Nova Health",
    email: "contact@novahealth.com",
    phone: "+1 (555) 123-4567",
    website: "https://novahealth.com",
    industry: "Healthcare",
    orgType: "Hospital Network",
    description: "Leading healthcare provider with multiple facilities across the region.",
    logo: undefined,
    serviceAgreement: "Nova Health MSA.pdf",
    timezone: "CST",
    agreementRenewalDate: "2025-12-31",
    estimatedAnnualSpend: 2500000,
    occupationIds: ["occ-001", "occ-002", "occ-003", "occ-004", "occ-005", "occ-006", "occ-007", "occ-008"],
    locations: [
      {
        id: "loc-001",
        name: "Main Campus",
        address: "123 Medical Center Dr",
        city: "Springfield",
        state: "IL",
        zipCode: "62701",
        phone: "+1 (555) 123-4567",
        email: "main@novahealth.com",
        locationType: "Inpatient",
        departments: [
          {
            id: "dept-001",
            name: "Emergency Department",
            deptType: "Clinical",
            costCentre: "ED-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-002",
            name: "Intensive Care Unit",
            deptType: "Clinical",
            costCentre: "ICU-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-003",
            name: "Medical-Surgical",
            deptType: "Clinical",
            costCentre: "MED-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-004",
            name: "Operating Room",
            deptType: "Clinical",
            costCentre: "OR-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-005",
            name: "Laboratory",
            deptType: "Clinical Support",
            costCentre: "LAB-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-034",
            name: "Pharmacy",
            deptType: "Clinical Support",
            costCentre: "PHARM-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-035",
            name: "Radiology",
            deptType: "Clinical Support",
            costCentre: "RAD-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-036",
            name: "Cardiology",
            deptType: "Clinical",
            costCentre: "CARD-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-037",
            name: "Orthopedics",
            deptType: "Clinical",
            costCentre: "ORTHO-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: "loc-002",
        name: "Downtown Clinic",
        address: "456 Health St",
        city: "Springfield",
        state: "IL",
        zipCode: "62702",
        phone: "+1 (555) 123-4568",
        email: "downtown@novahealth.com",
        locationType: "Outpatient",
        departments: [
          {
            id: "dept-006",
            name: "Family Medicine",
            deptType: "Clinical",
            costCentre: "FM-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-007",
            name: "Pediatrics",
            deptType: "Clinical",
            costCentre: "PED-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-008",
            name: "Internal Medicine",
            deptType: "Clinical",
            costCentre: "IM-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-038",
            name: "Women's Health",
            deptType: "Clinical",
            costCentre: "WH-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-039",
            name: "Behavioral Health",
            deptType: "Clinical",
            costCentre: "BH-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: "loc-009",
        name: "Nova Urgent Care",
        address: "789 Fast Track Way",
        city: "Springfield",
        state: "IL",
        zipCode: "62703",
        phone: "+1 (555) 123-4569",
        email: "urgent@novahealth.com",
        locationType: "Emergency",
        departments: [
          {
            id: "dept-009",
            name: "Urgent Care",
            deptType: "Clinical",
            costCentre: "UC-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: "loc-010",
        name: "Nova Rehabilitation Center",
        address: "321 Recovery Blvd",
        city: "Springfield",
        state: "IL",
        zipCode: "62704",
        phone: "+1 (555) 123-4570",
        locationType: "Outpatient",
        departments: [
          {
            id: "dept-010",
            name: "Physical Therapy",
            deptType: "Clinical",
            costCentre: "PT-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-011",
            name: "Occupational Therapy",
            deptType: "Clinical",
            costCentre: "OT-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-040",
            name: "Speech Therapy",
            deptType: "Clinical",
            costCentre: "ST-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
    ],
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "org-002",
    name: "Memorial Health System",
    email: "info@memorialhealth.com",
    phone: "+1 (555) 234-5678",
    website: "https://memorialhealth.com",
    industry: "Healthcare",
    orgType: "Hospital Network",
    description: "Regional health system serving multiple communities.",
    logo: undefined,
    serviceAgreement: "Memorial Health MSA.pdf",
    timezone: "CST",
    estimatedAnnualSpend: 4200000,
    agreementRenewalDate: "2025-06-30",
    occupationIds: ["occ-001", "occ-002", "occ-003", "occ-005", "occ-006", "occ-007"],
    locations: [
      {
        id: "loc-003",
        name: "Memorial Main Campus",
        address: "789 Hospital Blvd",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        phone: "+1 (555) 234-5678",
        email: "main@memorialhealth.com",
        locationType: "Inpatient",
        departments: [
          {
            id: "dept-012",
            name: "Cardiac Care Unit",
            deptType: "Clinical",
            costCentre: "CCU-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-013",
            name: "Neonatal Intensive Care",
            deptType: "Clinical",
            costCentre: "NICU-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-014",
            name: "Oncology",
            deptType: "Clinical",
            costCentre: "ONC-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-015",
            name: "Radiology",
            deptType: "Clinical Support",
            costCentre: "RAD-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-016",
            name: "Pharmacy",
            deptType: "Clinical Support",
            costCentre: "PHARM-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-017",
            name: "Emergency Department",
            deptType: "Clinical",
            costCentre: "ED-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-041",
            name: "Medical-Surgical",
            deptType: "Clinical",
            costCentre: "MED-003",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-042",
            name: "Operating Room",
            deptType: "Clinical",
            costCentre: "OR-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-043",
            name: "Laboratory",
            deptType: "Clinical Support",
            costCentre: "LAB-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-044",
            name: "Pathology",
            deptType: "Clinical Support",
            costCentre: "PATH-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: "loc-004",
        name: "Memorial Satellite Clinic",
        address: "321 Community Way",
        city: "Evanston",
        state: "IL",
        zipCode: "60201",
        phone: "+1 (555) 234-5679",
        locationType: "Outpatient",
        departments: [
          {
            id: "dept-018",
            name: "Primary Care",
            deptType: "Clinical",
            costCentre: "PC-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-019",
            name: "Women's Health",
            deptType: "Clinical",
            costCentre: "WH-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-020",
            name: "Behavioral Health",
            deptType: "Clinical",
            costCentre: "BH-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-045",
            name: "Dermatology",
            deptType: "Clinical",
            costCentre: "DERM-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-046",
            name: "Endocrinology",
            deptType: "Clinical",
            costCentre: "ENDO-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: "loc-011",
        name: "Memorial Surgical Center",
        address: "555 Surgery Lane",
        city: "Chicago",
        state: "IL",
        zipCode: "60602",
        phone: "+1 (555) 234-5680",
        locationType: "Outpatient",
        departments: [
          {
            id: "dept-021",
            name: "Ambulatory Surgery",
            deptType: "Clinical",
            costCentre: "ASC-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-022",
            name: "Post-Anesthesia Care",
            deptType: "Clinical",
            costCentre: "PACU-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-047",
            name: "Pre-Operative Services",
            deptType: "Clinical",
            costCentre: "PREOP-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
    ],
    createdAt: "2025-02-01T10:00:00Z",
    updatedAt: "2025-02-01T10:00:00Z",
  },
  {
    id: "org-003",
    name: "Vitality Health Group",
    email: "contact@vitalityhealth.org",
    phone: "+1 (555) 345-6789",
    website: "https://vitalityhealth.org",
    industry: "Healthcare",
    orgType: "Hospital Network",
    description: "Comprehensive healthcare network providing quality medical services.",
    logo: undefined,
    serviceAgreement: "Vitality MSA.pdf",
    timezone: "EST",
    estimatedAnnualSpend: 3200000,
    agreementRenewalDate: "2025-01-20",
    occupationIds: ["occ-001", "occ-003", "occ-004", "occ-006", "occ-008"],
    locations: [
      {
        id: "loc-005",
        name: "Vitality Main Hospital",
        address: "123 Main St",
        city: "Anytown",
        state: "NY",
        zipCode: "12345",
        phone: "+1 (555) 345-6789",
        email: "main@vitalityhealth.org",
        locationType: "Inpatient",
        departments: [
          {
            id: "dept-023",
            name: "Emergency Department",
            deptType: "Clinical",
            costCentre: "ED-003",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-024",
            name: "Intensive Care Unit",
            deptType: "Clinical",
            costCentre: "ICU-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-025",
            name: "Medical-Surgical",
            deptType: "Clinical",
            costCentre: "MED-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-026",
            name: "Obstetrics & Gynecology",
            deptType: "Clinical",
            costCentre: "OBGYN-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-027",
            name: "Pediatrics",
            deptType: "Clinical",
            costCentre: "PED-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: "loc-012",
        name: "Vitality Community Health Center",
        address: "456 Wellness Ave",
        city: "Anytown",
        state: "NY",
        zipCode: "12346",
        phone: "+1 (555) 345-6790",
        locationType: "Outpatient",
        departments: [
          {
            id: "dept-028",
            name: "Family Medicine",
            deptType: "Clinical",
            costCentre: "FM-002",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-029",
            name: "Pediatrics",
            deptType: "Clinical",
            costCentre: "PED-003",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-030",
            name: "Dental Services",
            deptType: "Clinical",
            costCentre: "DENT-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
      {
        id: "loc-013",
        name: "Vitality Specialty Clinic",
        address: "789 Specialist Dr",
        city: "Anytown",
        state: "NY",
        zipCode: "12347",
        phone: "+1 (555) 345-6791",
        locationType: "Outpatient",
        departments: [
          {
            id: "dept-031",
            name: "Cardiology",
            deptType: "Clinical",
            costCentre: "CARD-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-032",
            name: "Orthopedics",
            deptType: "Clinical",
            costCentre: "ORTHO-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
          {
            id: "dept-033",
            name: "Dermatology",
            deptType: "Clinical",
            costCentre: "DERM-001",
            relatedUsers: [],
            relatedOccupationSpecialties: [],
          },
        ],
      },
    ],
    createdAt: "2017-02-10T10:00:00Z",
    updatedAt: "2017-02-10T10:00:00Z",
  },
]

const defaultOrganizationsRecord: Record<string, AdminLocalDbOrganizationEntry> = defaultOrganizations.reduce(
  (acc, org) => {
    acc[org.id] = org
    return acc
  },
  {} as Record<string, AdminLocalDbOrganizationEntry>,
)

const defaultOccupations: Occupation[] = [
  {
    id: "occ-001",
    name: "Registered Nurse",
    code: "29-1141.00",
    acronym: "RN",
    modality: "Clinical",
    description: "Registered Nurse",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-002",
    name: "Licensed Practical Nurse / Licensed Vocational Nurse",
    code: "29-2061.00",
    acronym: "LPN",
    modality: "Clinical",
    description: "LPN/LVN",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-003",
    name: "Certified Nursing Assistant",
    code: "31-1014.00",
    acronym: "CNA",
    modality: "Clinical",
    description: "CNA",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-004",
    name: "Medical Assistant",
    code: "31-9092.00",
    acronym: "MA",
    modality: "Administrative",
    description: "Medical Assistant",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-005",
    name: "Nurse Practitioner",
    code: "29-1171.00",
    acronym: "NP",
    modality: "Clinical",
    description: "Nurse Practitioner",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-006",
    name: "Physical Therapist",
    code: "29-1123.00",
    acronym: "PT",
    modality: "Therapy",
    description: "Physical Therapist",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-007",
    name: "Occupational Therapist",
    code: "29-1122.00",
    acronym: "OT",
    modality: "Therapy",
    description: "Occupational Therapist",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-008",
    name: "Physician Assistant",
    code: "29-1071.00",
    acronym: "PA",
    modality: "Clinical",
    description: "Physician Assistant",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
]

const defaultOccupationsRecord: Record<string, Occupation> = defaultOccupations.reduce(
  (acc, occ) => {
    acc[occ.id] = occ
    return acc
  },
  {} as Record<string, Occupation>,
)

const defaultGeneralQuestionnaire: GeneralQuestionnaire = {
  id: "gen-q-default",
  questions: [
    {
      id: "q-resume",
      question: "Upload your resume",
      type: "file",
      required: true,
      placeholder: "Please upload your resume in PDF or Word format",
    },
    {
      id: "q-date-of-birth",
      question: "Date of Birth",
      type: "date",
      required: true,
    },
    {
      id: "q-references",
      question: "References",
      type: "textarea",
      required: true,
      placeholder: "Please provide contact information for professional references (name, title, company, email, phone)",
    },
    {
      id: "q-license",
      question: "Upload license",
      type: "file",
      required: true,
      placeholder: "Upload your professional license document",
    },
    {
      id: "q-years-of-experience",
      question: "Total years of experience",
      type: "number",
      required: true,
      placeholder: "Enter number of years",
    },
    {
      id: "q-specialization",
      question: "Specialization",
      type: "text",
      required: true,
      placeholder: "Enter your area of specialization",
    },
    {
      id: "q-past-company",
      question: "Previous company",
      type: "text",
      required: false,
      placeholder: "Enter the name of your most recent or previous company",
    },
    {
      id: "q-past-title",
      question: "Previous job title",
      type: "text",
      required: false,
      placeholder: "Enter your most recent or previous job title",
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// Default occupation questionnaires for mock occupations
const defaultOccupationQuestionnaires: Record<string, OccupationQuestionnaire> = {
  "occ-001": {
    id: "occ-q-001",
    occupationId: "occ-001",
    isActive: true,
    questions: [
      {
        id: "q-rn-license-state",
        question: "In which state(s) do you hold an active RN license?",
        type: "checkbox",
        required: true,
        options: ["California", "Texas", "New York", "Florida", "Illinois", "Pennsylvania", "Other"],
      },
      {
        id: "q-rn-specialty",
        question: "What is your primary nursing specialty?",
        type: "select",
        required: true,
        options: ["ICU", "ER", "Med-Surg", "Pediatrics", "OB/GYN", "Oncology", "Cardiac", "Other"],
      },
      {
        id: "q-rn-certifications",
        question: "Which certifications do you hold?",
        type: "checkbox",
        required: false,
        options: ["ACLS", "PALS", "BLS", "CCRN", "TNCC", "ENPC", "Other"],
      },
      {
        id: "q-rn-years-experience",
        question: "How many years of RN experience do you have?",
        type: "number",
        required: true,
        placeholder: "Enter number of years",
      },
      {
        id: "q-rn-travel-experience",
        question: "Do you have travel nursing experience?",
        type: "radiobox",
        required: true,
        options: ["Yes", "No"],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "occ-002": {
    id: "occ-q-002",
    occupationId: "occ-002",
    isActive: true,
    questions: [
      {
        id: "q-lpn-license-state",
        question: "In which state(s) do you hold an active LPN/LVN license?",
        type: "checkbox",
        required: true,
        options: ["California", "Texas", "New York", "Florida", "Illinois", "Pennsylvania", "Other"],
      },
      {
        id: "q-lpn-setting",
        question: "What type of setting do you prefer?",
        type: "select",
        required: true,
        options: ["Long-term Care", "Rehabilitation", "Home Health", "Hospital", "Clinic", "Other"],
      },
      {
        id: "q-lpn-certifications",
        question: "Which certifications do you hold?",
        type: "checkbox",
        required: false,
        options: ["BLS", "CPR", "IV Certification", "Medication Administration", "Other"],
      },
      {
        id: "q-lpn-years-experience",
        question: "How many years of LPN/LVN experience do you have?",
        type: "number",
        required: true,
        placeholder: "Enter number of years",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "occ-003": {
    id: "occ-q-003",
    occupationId: "occ-003",
    isActive: true,
    questions: [
      {
        id: "q-cna-certification-state",
        question: "In which state(s) are you certified as a CNA?",
        type: "checkbox",
        required: true,
        options: ["California", "Texas", "New York", "Florida", "Illinois", "Pennsylvania", "Other"],
      },
      {
        id: "q-cna-setting",
        question: "What type of setting do you prefer?",
        type: "select",
        required: true,
        options: ["Long-term Care", "Hospital", "Home Health", "Assisted Living", "Rehabilitation", "Other"],
      },
      {
        id: "q-cna-years-experience",
        question: "How many years of CNA experience do you have?",
        type: "number",
        required: true,
        placeholder: "Enter number of years",
      },
      {
        id: "q-cna-special-skills",
        question: "Do you have experience with special populations?",
        type: "checkbox",
        required: false,
        options: ["Dementia Care", "Hospice", "Pediatrics", "Behavioral Health", "None"],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "occ-004": {
    id: "occ-q-004",
    occupationId: "occ-004",
    isActive: true,
    questions: [
      {
        id: "q-ma-certification",
        question: "Are you certified as a Medical Assistant?",
        type: "radiobox",
        required: true,
        options: ["Yes, CMA", "Yes, RMA", "Yes, NCMA", "No"],
      },
      {
        id: "q-ma-specialty",
        question: "What type of medical setting do you prefer?",
        type: "select",
        required: true,
        options: ["Family Practice", "Pediatrics", "Cardiology", "Dermatology", "Orthopedics", "Urgent Care", "Other"],
      },
      {
        id: "q-ma-skills",
        question: "Which skills do you have?",
        type: "checkbox",
        required: false,
        options: ["Phlebotomy", "EKG", "Vital Signs", "Vaccine Administration", "Lab Specimen Collection", "Other"],
      },
      {
        id: "q-ma-years-experience",
        question: "How many years of Medical Assistant experience do you have?",
        type: "number",
        required: true,
        placeholder: "Enter number of years",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "occ-005": {
    id: "occ-q-005",
    occupationId: "occ-005",
    isActive: true,
    questions: [
      {
        id: "q-surg-tech-certification",
        question: "Are you certified as a Surgical Technologist?",
        type: "radiobox",
        required: true,
        options: ["Yes, CST", "Yes, TS-C", "No"],
      },
      {
        id: "q-surg-tech-specialty",
        question: "What surgical specialties are you experienced in?",
        type: "checkbox",
        required: true,
        options: ["General Surgery", "Orthopedics", "Cardiac", "Neuro", "Plastics", "OB/GYN", "Urology", "Other"],
      },
      {
        id: "q-surg-tech-years-experience",
        question: "How many years of Surgical Tech experience do you have?",
        type: "number",
        required: true,
        placeholder: "Enter number of years",
      },
      {
        id: "q-surg-tech-call",
        question: "Are you available for on-call shifts?",
        type: "radiobox",
        required: true,
        options: ["Yes", "No", "Limited"],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "occ-006": {
    id: "occ-q-006",
    occupationId: "occ-006",
    isActive: true,
    questions: [
      {
        id: "q-pt-license-state",
        question: "In which state(s) do you hold an active PT license?",
        type: "checkbox",
        required: true,
        options: ["California", "Texas", "New York", "Florida", "Illinois", "Pennsylvania", "Other"],
      },
      {
        id: "q-pt-specialty",
        question: "What is your PT specialty?",
        type: "select",
        required: true,
        options: ["Orthopedic", "Neurological", "Pediatric", "Geriatric", "Sports Medicine", "Cardiopulmonary", "Other"],
      },
      {
        id: "q-pt-certifications",
        question: "Which certifications do you hold?",
        type: "checkbox",
        required: false,
        options: ["OCS", "NCS", "PCS", "GCS", "SCS", "WCS", "Other"],
      },
      {
        id: "q-pt-years-experience",
        question: "How many years of PT experience do you have?",
        type: "number",
        required: true,
        placeholder: "Enter number of years",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "occ-007": {
    id: "occ-q-007",
    occupationId: "occ-007",
    isActive: true,
    questions: [
      {
        id: "q-ot-license-state",
        question: "In which state(s) do you hold an active OT license?",
        type: "checkbox",
        required: true,
        options: ["California", "Texas", "New York", "Florida", "Illinois", "Pennsylvania", "Other"],
      },
      {
        id: "q-ot-specialty",
        question: "What is your OT specialty?",
        type: "select",
        required: true,
        options: ["Pediatrics", "Geriatrics", "Mental Health", "Hand Therapy", "Neurological", "Orthopedic", "Other"],
      },
      {
        id: "q-ot-certifications",
        question: "Which certifications do you hold?",
        type: "checkbox",
        required: false,
        options: ["CHT", "SIPT", "Sensory Integration", "Other"],
      },
      {
        id: "q-ot-years-experience",
        question: "How many years of OT experience do you have?",
        type: "number",
        required: true,
        placeholder: "Enter number of years",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "occ-008": {
    id: "occ-q-008",
    occupationId: "occ-008",
    isActive: true,
    questions: [
      {
        id: "q-rt-license-state",
        question: "In which state(s) do you hold an active RT license?",
        type: "checkbox",
        required: true,
        options: ["California", "Texas", "New York", "Florida", "Illinois", "Pennsylvania", "Other"],
      },
      {
        id: "q-rt-specialty",
        question: "What is your RT specialty?",
        type: "select",
        required: true,
        options: ["Adult Critical Care", "Neonatal", "Pediatric", "Pulmonary Function", "Sleep Medicine", "Other"],
      },
      {
        id: "q-rt-certifications",
        question: "Which certifications do you hold?",
        type: "checkbox",
        required: false,
        options: ["RRT", "CRT", "NPS", "ACCS", "CPFT", "RPFT", "Other"],
      },
      {
        id: "q-rt-years-experience",
        question: "How many years of RT experience do you have?",
        type: "number",
        required: true,
        placeholder: "Enter number of years",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "occ-009": {
    id: "occ-q-009",
    occupationId: "occ-009",
    isActive: true,
    questions: [
      {
        id: "q-np-license-state",
        question: "In which state(s) do you hold an active NP license?",
        type: "checkbox",
        required: true,
        options: ["California", "Texas", "New York", "Florida", "Illinois", "Pennsylvania", "Other"],
      },
      {
        id: "q-np-specialty",
        question: "What is your NP specialty?",
        type: "select",
        required: true,
        options: ["Family", "Adult-Gerontology", "Pediatric", "Psychiatric", "Women's Health", "Acute Care", "Other"],
      },
      {
        id: "q-np-certifications",
        question: "Which certifications do you hold?",
        type: "checkbox",
        required: false,
        options: ["FNP-BC", "AGNP-BC", "PNP-BC", "PMHNP-BC", "WHNP-BC", "ACNP-BC", "Other"],
      },
      {
        id: "q-np-years-experience",
        question: "How many years of NP experience do you have?",
        type: "number",
        required: true,
        placeholder: "Enter number of years",
      },
      {
        id: "q-np-prescriptive-authority",
        question: "Do you have prescriptive authority?",
        type: "radiobox",
        required: true,
        options: ["Yes", "No", "Limited"],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "occ-010": {
    id: "occ-q-010",
    occupationId: "occ-010",
    isActive: true,
    questions: [
      {
        id: "q-pa-license-state",
        question: "In which state(s) do you hold an active PA license?",
        type: "checkbox",
        required: true,
        options: ["California", "Texas", "New York", "Florida", "Illinois", "Pennsylvania", "Other"],
      },
      {
        id: "q-pa-specialty",
        question: "What is your PA specialty?",
        type: "select",
        required: true,
        options: ["Emergency Medicine", "Surgery", "Orthopedics", "Cardiology", "Dermatology", "Family Medicine", "Other"],
      },
      {
        id: "q-pa-certifications",
        question: "Which certifications do you hold?",
        type: "checkbox",
        required: false,
        options: ["NCCPA", "ACLS", "PALS", "ATLS", "Other"],
      },
      {
        id: "q-pa-years-experience",
        question: "How many years of PA experience do you have?",
        type: "number",
        required: true,
        placeholder: "Enter number of years",
      },
      {
        id: "q-pa-prescriptive-authority",
        question: "Do you have prescriptive authority?",
        type: "radiobox",
        required: true,
        options: ["Yes", "No", "Limited"],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}

// Default specialties
const defaultSpecialties: Specialty[] = [
  {
    id: "spec-001",
    name: "ICU",
    code: "ICU",
    acronym: "ICU",
    description: "Intensive Care Unit",
    group: "Critical Care",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "spec-002",
    name: "ER",
    code: "ER",
    acronym: "ER",
    description: "Emergency Room",
    group: "Critical Care",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "spec-003",
    name: "TELE",
    code: "TELE",
    acronym: "TELE",
    description: "Telemetry",
    group: "Medical",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "spec-004",
    name: "Med-Surg",
    code: "MEDSURG",
    acronym: "MEDSURG",
    description: "Medical-Surgical",
    group: "Medical",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "spec-005",
    name: "Monitor Tech",
    code: "MONITOR",
    acronym: "MT",
    description: "Monitor Technician",
    group: "Support Services",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultSpecialtiesRecord: Record<string, Specialty> = defaultSpecialties.reduce(
  (acc, spec) => {
    acc[spec.id] = spec
    return acc
  },
  {} as Record<string, Specialty>,
)

// Default occupation-specialty mappings
const defaultOccupationSpecialties: OccupationSpecialty[] = [
  {
    id: "occ-spec-001",
    occupationId: "occ-001", // RN
    specialtyId: "spec-003", // TELE
    displayName: "Registered Nurse - TELE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "occ-spec-002",
    occupationId: "occ-001", // RN
    specialtyId: "spec-001", // ICU
    displayName: "Registered Nurse - ICU",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "occ-spec-003",
    occupationId: "occ-001", // RN
    specialtyId: "spec-002", // ER
    displayName: "Registered Nurse - ER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "occ-spec-004",
    occupationId: "occ-001", // RN
    specialtyId: "spec-004", // Med-Surg
    displayName: "Registered Nurse - Med-Surg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "occ-spec-005",
    occupationId: "occ-005", // Surgical Tech
    specialtyId: "spec-005", // Monitor Tech
    displayName: "Monitor Tech",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultOccupationSpecialtiesRecord: Record<string, OccupationSpecialty> = defaultOccupationSpecialties.reduce(
  (acc, occSpec) => {
    acc[occSpec.id] = occSpec
    return acc
  },
  {} as Record<string, OccupationSpecialty>,
)

// Default workforce groups
const defaultWorkforceGroups: WorkforceGroup[] = [
  {
    id: "wf-001",
    modality: "Clinical",
    name: "Permanent - Full Time",
    limitShiftVisibility: false,
    routingPosition: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wf-002",
    modality: "Clinical",
    name: "Permanent - Part Time",
    limitShiftVisibility: true,
    routingPosition: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wf-003",
    modality: "Clinical",
    name: "Contract - Internal Float Pool",
    limitShiftVisibility: true,
    routingPosition: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wf-004",
    modality: "Clinical",
    name: "External - EOR",
    limitShiftVisibility: true,
    routingPosition: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wf-005",
    modality: "Clinical",
    name: "External - Per Diem Vendors",
    limitShiftVisibility: true,
    routingPosition: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wf-006",
    modality: "Clinical",
    name: "External - LTO Vendor",
    limitShiftVisibility: true,
    routingPosition: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wf-007",
    modality: "Support Services",
    name: "Permanent - Full Time",
    limitShiftVisibility: false,
    routingPosition: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultWorkforceGroupsRecord: Record<string, WorkforceGroup> = defaultWorkforceGroups.reduce(
  (acc, wf) => {
    acc[wf.id] = wf
    return acc
  },
  {} as Record<string, WorkforceGroup>,
)

// Default compliance list items
const defaultComplianceListItems: ComplianceListItem[] = [
  // Background and Identification
  {
    id: "cli-001",
    name: "Drivers License",
    category: "Background and Identification",
    expirationType: "Expiration Date",
    issuerRequirement: false,
    responseStyle: "Pending File Upload",
    displayToCandidate: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-002",
    name: "Passport",
    category: "Background and Identification",
    expirationType: "Expiration Date",
    issuerRequirement: false,
    responseStyle: "Pending File Upload",
    displayToCandidate: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-003",
    name: "Social Security Card",
    category: "Background and Identification",
    expirationType: "Non-Expirable",
    issuerRequirement: false,
    responseStyle: "Pending File Upload",
    displayToCandidate: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-004",
    name: "Background Check",
    category: "Background and Identification",
    expirationType: "Expiration Rule",
    expirationRuleValue: 365,
    expirationRuleInterval: "Days",
    issuerRequirement: false,
    responseStyle: "Pending File Upload",
    displayToCandidate: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-005",
    name: "Drug Screening",
    category: "Background and Identification",
    expirationType: "Expiration Rule",
    expirationRuleValue: 365,
    expirationRuleInterval: "Days",
    issuerRequirement: false,
    responseStyle: "Pending File Upload",
    displayToCandidate: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-006",
    name: "Criminal Background Check",
    category: "Background and Identification",
    expirationType: "Expiration Rule",
    expirationRuleValue: 365,
    expirationRuleInterval: "Days",
    issuerRequirement: false,
    responseStyle: "Pending File Upload",
    displayToCandidate: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Licenses
  {
    id: "cli-007",
    name: "Registered Nurse License",
    category: "Licenses",
    expirationType: "Expiration Date",
    issuerRequirement: true,
    issuer: "State Board of Nursing",
    responseStyle: "Pending File Upload",
    displayToCandidate: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-008",
    name: "Nurse Practitioner License",
    category: "Licenses",
    expirationType: "Expiration Date",
    issuerRequirement: true,
    issuer: "State Board of Nursing",
    responseStyle: "Pending File Upload",
    displayToCandidate: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-009",
    name: "LPN License",
    category: "Licenses",
    expirationType: "Expiration Date",
    issuerRequirement: true,
    issuer: "State Board of Nursing",
    responseStyle: "Pending File Upload",
    displayToCandidate: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-010",
    name: "PT License",
    category: "Licenses",
    expirationType: "Expiration Date",
    issuerRequirement: true,
    issuer: "State Physical Therapy Board",
    responseStyle: "Pending File Upload",
    displayToCandidate: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-011",
    name: "OT License",
    category: "Licenses",
    expirationType: "Expiration Date",
    issuerRequirement: true,
    issuer: "State Occupational Therapy Board",
    responseStyle: "Pending File Upload",
    displayToCandidate: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-012",
    name: "CNA License",
    category: "Licenses",
    expirationType: "Expiration Date",
    issuerRequirement: true,
    issuer: "State Nursing Assistant Board",
    responseStyle: "Pending File Upload",
    displayToCandidate: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Certifications
  {
    id: "cli-013",
    name: "ACLS Certification",
    category: "Certifications",
    expirationType: "Expiration Date",
    issuerRequirement: true,
    issuer: "American Heart Association",
    responseStyle: "Pending File Upload",
    displayToCandidate: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-014",
    name: "BLS Certification",
    category: "Certifications",
    expirationType: "Expiration Date",
    issuerRequirement: true,
    issuer: "American Heart Association",
    responseStyle: "Pending File Upload",
    displayToCandidate: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-015",
    name: "CPR Certification",
    category: "Certifications",
    expirationType: "Expiration Date",
    issuerRequirement: true,
    issuer: "American Heart Association",
    responseStyle: "Pending File Upload",
    displayToCandidate: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-016",
    name: "PALS Certification",
    category: "Certifications",
    expirationType: "Expiration Date",
    issuerRequirement: true,
    issuer: "American Heart Association",
    responseStyle: "Pending File Upload",
    displayToCandidate: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Education and Assessments
  {
    id: "cli-017",
    name: "HIPAA Training",
    category: "Education and Assessments",
    expirationType: "Expiration Rule",
    expirationRuleValue: 365,
    expirationRuleInterval: "Days",
    issuerRequirement: false,
    responseStyle: "Internal Task",
    displayToCandidate: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cli-018",
    name: "Safety Training",
    category: "Education and Assessments",
    expirationType: "Expiration Rule",
    expirationRuleValue: 365,
    expirationRuleInterval: "Days",
    issuerRequirement: false,
    responseStyle: "Internal Task",
    displayToCandidate: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Employee Health
  {
    id: "cli-019",
    name: "Immunization Record",
    category: "Employee Health",
    expirationType: "Expiration Date",
    issuerRequirement: false,
    responseStyle: "Pending File Upload",
    displayToCandidate: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultComplianceListItemsRecord: Record<string, ComplianceListItem> = defaultComplianceListItems.reduce(
  (acc, item) => {
    acc[item.id] = item
    return acc
  },
  {} as Record<string, ComplianceListItem>,
)

// Default users (excluding candidates - only portal access users)
const defaultUsers: User[] = [
  {
    id: "user-001",
    name: "John Smith",
    email: "john.smith@workforce.io",
    phone: "+1 (555) 123-4567",
    role: "Admin",
    tags: ["System-Admin", "Full-Access"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-002",
    name: "Sarah Johnson",
    email: "sarah.johnson@workforce.io",
    phone: "+1 (555) 234-5678",
    role: "Organization Admin",
    tags: ["Org-Manager", "Compliance-Officer"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-003",
    name: "Michael Chen",
    email: "michael.chen@workforce.io",
    phone: "+1 (555) 345-6789",
    role: "Organization Admin",
    tags: ["HR-Manager"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-004",
    name: "Lisa Anderson",
    email: "lisa.anderson@workforce.io",
    phone: "+1 (555) 678-9012",
    role: "Organization Admin",
    tags: ["Recruiter", "Talent-Acquisition"],
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-005",
    name: "David Martinez",
    email: "david.martinez@workforce.io",
    phone: "+1 (555) 789-0123",
    role: "Vendor",
    tags: ["Vendor-Manager", "Premier-Tier"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-006",
    name: "Jennifer Lee",
    email: "jennifer.lee@workforce.io",
    phone: "+1 (555) 890-1234",
    role: "Vendor",
    tags: ["Vendor-Admin", "Preferred-Tier"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-007",
    name: "Robert Taylor",
    email: "robert.taylor@workforce.io",
    phone: "+1 (555) 901-2345",
    role: "Organization Admin",
    tags: ["Operations-Manager"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-008",
    name: "Amanda White",
    email: "amanda.white@workforce.io",
    phone: "+1 (555) 012-3456",
    role: "Admin",
    tags: ["Support-Admin", "Help-Desk"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-009",
    name: "James Brown",
    email: "james.brown@workforce.io",
    phone: "+1 (555) 123-4568",
    role: "Vendor",
    tags: ["Vendor-Rep", "Approved-Tier"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-010",
    name: "Patricia Garcia",
    email: "patricia.garcia@workforce.io",
    phone: "+1 (555) 234-5679",
    role: "Organization Admin",
    tags: ["Compliance-Manager", "Audit-Specialist"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultUsersRecord: Record<string, User> = defaultUsers.reduce(
  (acc, user) => {
    acc[user.id] = user
    return acc
  },
  {} as Record<string, User>,
)

// Default admin wallet templates
const defaultAdminWalletTemplates: AdminWalletTemplate[] = [
  {
    id: "awt-001",
    name: "RN Core Compliance Template",
    occupationId: "occ-001", // RN
    occupationCode: "RN",
    listItemIds: [
      "cli-007", // Registered Nurse License
      "cli-013", // ACLS Certification
      "cli-014", // BLS Certification
      "cli-004", // Background Check
      "cli-005", // Drug Screening
      "cli-019", // Immunization Record
      "cli-017", // HIPAA Training
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "awt-002",
    name: "LPN Standard Template",
    occupationId: "occ-002", // LPN/LVN
    occupationCode: "LPN/LVN",
    listItemIds: [
      "cli-009", // LPN License
      "cli-014", // BLS Certification
      "cli-015", // CPR Certification
      "cli-004", // Background Check
      "cli-005", // Drug Screening
      "cli-019", // Immunization Record
      "cli-017", // HIPAA Training
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "awt-003",
    name: "CNA Basic Template",
    occupationId: "occ-003", // CNA
    occupationCode: "CNA",
    listItemIds: [
      "cli-012", // CNA License
      "cli-015", // CPR Certification
      "cli-004", // Background Check
      "cli-005", // Drug Screening
      "cli-019", // Immunization Record
      "cli-017", // HIPAA Training
      "cli-018", // Safety Training
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "awt-004",
    name: "PT Professional Template",
    occupationId: "occ-006", // PT
    occupationCode: "PT",
    listItemIds: [
      "cli-010", // PT License
      "cli-014", // BLS Certification
      "cli-004", // Background Check
      "cli-005", // Drug Screening
      "cli-019", // Immunization Record
      "cli-017", // HIPAA Training
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "awt-005",
    name: "OT Professional Template",
    occupationId: "occ-007", // OT
    occupationCode: "OT",
    listItemIds: [
      "cli-011", // OT License
      "cli-014", // BLS Certification
      "cli-004", // Background Check
      "cli-005", // Drug Screening
      "cli-019", // Immunization Record
      "cli-017", // HIPAA Training
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "awt-006",
    name: "RN ICU Specialty Template",
    occupationId: "occ-001", // RN
    occupationCode: "RN",
    specialtyId: "spec-001", // ICU
    specialtyCode: "ICU",
    listItemIds: [
      "cli-007", // Registered Nurse License
      "cli-013", // ACLS Certification
      "cli-014", // BLS Certification
      "cli-016", // PALS Certification
      "cli-004", // Background Check
      "cli-005", // Drug Screening
      "cli-006", // Criminal Background Check
      "cli-019", // Immunization Record
      "cli-017", // HIPAA Training
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "awt-007",
    name: "RN ER Specialty Template",
    occupationId: "occ-001", // RN
    occupationCode: "RN",
    specialtyId: "spec-002", // ER
    specialtyCode: "ER",
    listItemIds: [
      "cli-007", // Registered Nurse License
      "cli-013", // ACLS Certification
      "cli-014", // BLS Certification
      "cli-016", // PALS Certification
      "cli-004", // Background Check
      "cli-005", // Drug Screening
      "cli-006", // Criminal Background Check
      "cli-019", // Immunization Record
      "cli-017", // HIPAA Training
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "awt-008",
    name: "RN TELE Specialty Template",
    occupationId: "occ-001", // RN
    occupationCode: "RN",
    specialtyId: "spec-003", // TELE
    specialtyCode: "TELE",
    listItemIds: [
      "cli-007", // Registered Nurse License
      "cli-013", // ACLS Certification
      "cli-014", // BLS Certification
      "cli-004", // Background Check
      "cli-005", // Drug Screening
      "cli-019", // Immunization Record
      "cli-017", // HIPAA Training
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "awt-009",
    name: "RN Med-Surg Specialty Template",
    occupationId: "occ-001", // RN
    occupationCode: "RN",
    specialtyId: "spec-004", // Med-Surg
    specialtyCode: "MEDSURG",
    listItemIds: [
      "cli-007", // Registered Nurse License
      "cli-014", // BLS Certification
      "cli-015", // CPR Certification
      "cli-004", // Background Check
      "cli-005", // Drug Screening
      "cli-019", // Immunization Record
      "cli-017", // HIPAA Training
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "awt-010",
    name: "RT Professional Template",
    occupationId: "occ-008", // RT
    occupationCode: "RT",
    listItemIds: [
      "cli-013", // ACLS Certification
      "cli-014", // BLS Certification
      "cli-016", // PALS Certification
      "cli-004", // Background Check
      "cli-005", // Drug Screening
      "cli-019", // Immunization Record
      "cli-017", // HIPAA Training
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "awt-011",
    name: "Nurse Practitioner Template",
    occupationId: "occ-009", // Nurse Practitioner
    occupationCode: "Nurse Practitioner",
    listItemIds: [
      "cli-008", // Nurse Practitioner License
      "cli-013", // ACLS Certification
      "cli-014", // BLS Certification
      "cli-004", // Background Check
      "cli-005", // Drug Screening
      "cli-006", // Criminal Background Check
      "cli-019", // Immunization Record
      "cli-017", // HIPAA Training
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "awt-012",
    name: "Physician Assistant Template",
    occupationId: "occ-010", // Physician Assistant
    occupationCode: "Physician Assistant",
    listItemIds: [
      "cli-013", // ACLS Certification
      "cli-014", // BLS Certification
      "cli-004", // Background Check
      "cli-005", // Drug Screening
      "cli-006", // Criminal Background Check
      "cli-019", // Immunization Record
      "cli-017", // HIPAA Training
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultAdminWalletTemplatesRecord: Record<string, AdminWalletTemplate> = defaultAdminWalletTemplates.reduce(
  (acc, template) => {
    acc[template.id] = template
    return acc
  },
  {} as Record<string, AdminWalletTemplate>,
)

// Default tags based on the tag management UI
const defaultTags: Tag[] = [
  {
    id: "tag-001",
    name: "Night Shift",
    taskType: "Preferences",
    description: "They prefer night hours for shift types",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tag-002",
    name: "Day Shift",
    taskType: "Preferences",
    description: "Prefers day shift for shift types",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tag-003",
    name: "Compact License",
    taskType: "Credentials",
    description: "Holds license in all states listed under compact license.",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tag-004",
    name: "ICU-Specialist",
    taskType: "Specialization",
    description: "Specialized in Intensive Care Unit nursing",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tag-005",
    name: "High-Experience",
    taskType: "Experience",
    description: "Has 10+ years of experience in the field",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tag-006",
    name: "Travel Nurse",
    taskType: "Preferences",
    description: "Available for travel assignments",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tag-007",
    name: "ACLS Certified",
    taskType: "Credentials",
    description: "Advanced Cardiac Life Support certified",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tag-008",
    name: "Weekend Availability",
    taskType: "Preferences",
    description: "Available to work weekends",
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultTagsRecord: Record<string, Tag> = defaultTags.reduce(
  (acc, tag) => {
    acc[tag.id] = tag
    return acc
  },
  {} as Record<string, Tag>,
)

export const defaultVendors: Vendor[] = [
  {
    id: "vendor-001",
    name: "Nova Health",
    industries: ["Healthcare"],
    certifiedBusinessClassifications: ["Certified Minority Owned Business", "Certified Women Owned Business"],
    aboutVendor: "Leading healthcare provider with multiple facilities across the region. We specialize in providing quality healthcare services and workforce solutions. With over 20 years of experience, we have built a reputation for excellence in patient care and staff management.",
    isActive: true,
    taxIdNumber: "83-738893",
    mainPhoneNumber: "602-908-1234",
    website: "www.novahealth.com",
    address: "Main Campus - 994 Tustin Avenue, Seattle, WA 98101",
    annualRevenue: "$25,000,000",
    employeeCount: 300,
    internalVendorIdNumber: "12345678",
    createdDate: "11/30/2023",
    occupationIds: ["occ-001", "occ-002", "occ-003"],
    activationDate: "2023-01-15",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-01-15T10:00:00Z",
  },
  {
    id: "vendor-002",
    name: "MedStaff Solutions",
    industries: ["Healthcare"],
    certifiedBusinessClassifications: ["Certified Small Business"],
    aboutVendor: "A premier healthcare staffing agency providing qualified medical professionals to hospitals and clinics nationwide. We focus on matching the right talent with the right opportunities.",
    isActive: false,
    taxIdNumber: "45-1234567",
    mainPhoneNumber: "312-555-0100",
    website: "www.medstaffsolutions.com",
    address: "500 Medical Plaza, Chicago, IL 60601",
    annualRevenue: "$15,000,000",
    employeeCount: 150,
    internalVendorIdNumber: "23456789",
    createdDate: "03/20/2023",
    occupationIds: ["occ-001", "occ-004", "occ-005"],
    activationDate: "2023-03-20",
    inactivationDate: "2024-01-10",
    createdAt: "2023-03-20T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "vendor-003",
    name: "CareFirst Staffing",
    industries: ["Healthcare"],
    certifiedBusinessClassifications: ["Certified Minority Owned Business", "Certified Veteran Owned Business"],
    aboutVendor: "Dedicated to connecting healthcare facilities with exceptional nursing and allied health professionals. Our team understands the unique needs of healthcare organizations.",
    isActive: true,
    taxIdNumber: "12-9876543",
    mainPhoneNumber: "415-555-0200",
    website: "www.carefirststaffing.com",
    address: "123 Healthcare Drive, San Francisco, CA 94102",
    annualRevenue: "$18,500,000",
    employeeCount: 200,
    internalVendorIdNumber: "34567890",
    createdDate: "02/01/2023",
    occupationIds: ["occ-002", "occ-005", "occ-006"],
    activationDate: "2023-02-01",
    createdAt: "2023-02-01T10:00:00Z",
    updatedAt: "2023-02-01T10:00:00Z",
  },
  {
    id: "vendor-004",
    name: "HealthPro Recruiters",
    industries: ["Healthcare"],
    certifiedBusinessClassifications: [],
    aboutVendor: "Specialized recruitment firm focusing on placing healthcare professionals in permanent and temporary positions. We pride ourselves on our extensive network and personalized service.",
    isActive: false,
    taxIdNumber: "78-4567890",
    mainPhoneNumber: "713-555-0300",
    website: "www.healthprorecruiters.com",
    address: "789 Medical Center Blvd, Houston, TX 77030",
    annualRevenue: "$12,000,000",
    employeeCount: 120,
    internalVendorIdNumber: "45678901",
    createdDate: "04/10/2023",
    occupationIds: ["occ-003", "occ-007"],
    activationDate: "2023-04-10",
    inactivationDate: "2024-02-15",
    createdAt: "2023-04-10T10:00:00Z",
    updatedAt: "2024-02-15T10:00:00Z",
  },
  {
    id: "vendor-005",
    name: "NurseConnect Agency",
    industries: ["Healthcare"],
    certifiedBusinessClassifications: ["Certified Women Owned Business"],
    aboutVendor: "Women-owned staffing agency specializing in nursing placements. We provide comprehensive support to both healthcare facilities and nursing professionals throughout their careers.",
    isActive: true,
    taxIdNumber: "34-5678901",
    mainPhoneNumber: "305-555-0400",
    website: "www.nurseconnect.com",
    address: "456 Nursing Way, Miami, FL 33101",
    annualRevenue: "$20,000,000",
    employeeCount: 250,
    internalVendorIdNumber: "56789012",
    createdDate: "05/05/2023",
    occupationIds: ["occ-001", "occ-006", "occ-008"],
    activationDate: "2023-05-05",
    createdAt: "2023-05-05T10:00:00Z",
    updatedAt: "2023-05-05T10:00:00Z",
  },
  {
    id: "vendor-006",
    name: "Allied Health Partners",
    industries: ["Healthcare"],
    certifiedBusinessClassifications: ["Certified Small Business"],
    aboutVendor: "Comprehensive healthcare staffing solutions for allied health professionals including physical therapists, occupational therapists, and respiratory therapists.",
    isActive: false,
    taxIdNumber: "56-7890123",
    mainPhoneNumber: "404-555-0500",
    website: "www.alliedhealthpartners.com",
    address: "321 Therapy Lane, Atlanta, GA 30309",
    annualRevenue: "$10,500,000",
    employeeCount: 100,
    internalVendorIdNumber: "67890123",
    createdDate: "06/12/2023",
    occupationIds: ["occ-002", "occ-007", "occ-008"],
    activationDate: "2023-06-12",
    inactivationDate: "2024-03-20",
    createdAt: "2023-06-12T10:00:00Z",
    updatedAt: "2024-03-20T10:00:00Z",
  },
  {
    id: "vendor-007",
    name: "Premier Medical Staffing",
    industries: ["Healthcare"],
    certifiedBusinessClassifications: ["Certified Minority Owned Business"],
    aboutVendor: "Elite medical staffing agency providing top-tier healthcare professionals to leading medical facilities. Our rigorous screening process ensures only the best candidates.",
    isActive: true,
    taxIdNumber: "90-1234567",
    mainPhoneNumber: "617-555-0600",
    website: "www.premiermedicalstaffing.com",
    address: "888 Medical Plaza, Boston, MA 02115",
    annualRevenue: "$30,000,000",
    employeeCount: 400,
    internalVendorIdNumber: "78901234",
    createdDate: "07/19/2023",
    occupationIds: ["occ-003", "occ-008", "occ-001"],
    activationDate: "2023-07-19",
    createdAt: "2023-07-19T10:00:00Z",
    updatedAt: "2023-07-19T10:00:00Z",
  },
  {
    id: "vendor-008",
    name: "Global Healthcare Resources",
    industries: ["Healthcare", "Technology"],
    certifiedBusinessClassifications: ["Certified Minority Owned Business", "Certified Small Business"],
    aboutVendor: "International healthcare staffing and technology solutions provider. We combine cutting-edge technology with personalized service to deliver exceptional results.",
    isActive: true,
    taxIdNumber: "23-4567890",
    mainPhoneNumber: "212-555-0700",
    website: "www.globalhealthcare.com",
    address: "1000 Healthcare Tower, New York, NY 10001",
    annualRevenue: "$45,000,000",
    employeeCount: 500,
    internalVendorIdNumber: "89012345",
    createdDate: "08/10/2023",
    occupationIds: ["occ-001", "occ-002", "occ-003", "occ-004", "occ-005"],
    activationDate: "2023-08-10",
    createdAt: "2023-08-10T10:00:00Z",
    updatedAt: "2023-08-10T10:00:00Z",
  },
  {
    id: "vendor-009",
    name: "Regional Medical Staffing",
    industries: ["Healthcare"],
    certifiedBusinessClassifications: ["Certified Women Owned Business"],
    aboutVendor: "Regional leader in healthcare staffing with deep roots in the community. We understand local healthcare needs and provide tailored staffing solutions.",
    isActive: true,
    taxIdNumber: "67-8901234",
    mainPhoneNumber: "503-555-0800",
    website: "www.regionalmedical.com",
    address: "555 Regional Center, Portland, OR 97201",
    annualRevenue: "$14,000,000",
    employeeCount: 180,
    internalVendorIdNumber: "90123456",
    createdDate: "09/15/2023",
    occupationIds: ["occ-001", "occ-006"],
    activationDate: "2023-09-15",
    createdAt: "2023-09-15T10:00:00Z",
    updatedAt: "2023-09-15T10:00:00Z",
  },
  {
    id: "vendor-010",
    name: "Elite Nursing Services",
    industries: ["Healthcare"],
    certifiedBusinessClassifications: [],
    aboutVendor: "Specialized nursing agency providing highly qualified registered nurses, nurse practitioners, and nursing assistants to healthcare facilities across the region.",
    isActive: true,
    taxIdNumber: "89-0123456",
    mainPhoneNumber: "214-555-0900",
    website: "www.elitenursing.com",
    address: "777 Nursing Boulevard, Dallas, TX 75201",
    annualRevenue: "$22,000,000",
    employeeCount: 280,
    internalVendorIdNumber: "01234567",
    createdDate: "10/20/2023",
    occupationIds: ["occ-001", "occ-002", "occ-005"],
    activationDate: "2023-10-20",
    createdAt: "2023-10-20T10:00:00Z",
    updatedAt: "2023-10-20T10:00:00Z",
  },
]

const defaultVendorsRecord: Record<string, Vendor> = defaultVendors.reduce(
  (acc, vendor) => {
    acc[vendor.id] = vendor
    return acc
  },
  {} as Record<string, Vendor>
)

const defaultVendorUsers: VendorUser[] = [
  // Nova Health (vendor-001)
  {
    id: "vuser-001",
    vendorId: "vendor-001",
    firstName: "Alice",
    lastName: "Williams",
    title: "CEO",
    email: "alice.w@example.com",
    officePhone: "555-123-4567",
    mobilePhone: "555-987-6543",
    status: "Active",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-01-15T10:00:00Z",
  },
  {
    id: "vuser-002",
    vendorId: "vendor-001",
    firstName: "Bob",
    lastName: "Brown",
    title: "Marketing Specialist",
    email: "bob.b@example.com",
    officePhone: "123-987-6543",
    mobilePhone: "456-789-0123",
    status: "Active",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-01-15T10:00:00Z",
  },
  {
    id: "vuser-003",
    vendorId: "vendor-001",
    firstName: "Charlie",
    lastName: "Davis",
    title: "HR Manager",
    email: "charlie.d@example.com",
    officePhone: "777-888-9999",
    mobilePhone: "111-222-3333",
    status: "Active",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-01-15T10:00:00Z",
  },
  {
    id: "vuser-004",
    vendorId: "vendor-001",
    firstName: "Diana",
    lastName: "Miller",
    title: "CTO",
    email: "diana.m@example.com",
    officePhone: "222-333-4444",
    mobilePhone: "555-666-7777",
    status: "Active",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-01-15T10:00:00Z",
  },
  {
    id: "vuser-005",
    vendorId: "vendor-001",
    firstName: "Eve",
    lastName: "Wilson",
    title: "Financial Analyst",
    email: "eve.w@example.com",
    officePhone: "333-444-5555",
    mobilePhone: "888-999-0000",
    status: "Active",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-01-15T10:00:00Z",
  },
  // MedStaff Solutions (vendor-002)
  {
    id: "vuser-006",
    vendorId: "vendor-002",
    firstName: "Frank",
    lastName: "Garcia",
    title: "Operations Director",
    email: "frank.g@medstaff.com",
    officePhone: "312-555-0101",
    mobilePhone: "312-555-0102",
    status: "Inactive",
    createdAt: "2023-03-20T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "vuser-007",
    vendorId: "vendor-002",
    firstName: "Grace",
    lastName: "Martinez",
    title: "Recruitment Manager",
    email: "grace.m@medstaff.com",
    officePhone: "312-555-0103",
    mobilePhone: "312-555-0104",
    status: "Inactive",
    createdAt: "2023-03-20T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  // CareFirst Staffing (vendor-003)
  {
    id: "vuser-008",
    vendorId: "vendor-003",
    firstName: "Henry",
    lastName: "Rodriguez",
    title: "President",
    email: "henry.r@carefirst.com",
    officePhone: "415-555-0201",
    mobilePhone: "415-555-0202",
    status: "Active",
    createdAt: "2023-02-01T10:00:00Z",
    updatedAt: "2023-02-01T10:00:00Z",
  },
  {
    id: "vuser-009",
    vendorId: "vendor-003",
    firstName: "Iris",
    lastName: "Lee",
    title: "Business Development Manager",
    email: "iris.l@carefirst.com",
    officePhone: "415-555-0203",
    mobilePhone: "415-555-0204",
    status: "Active",
    createdAt: "2023-02-01T10:00:00Z",
    updatedAt: "2023-02-01T10:00:00Z",
  },
  // HealthPro Recruiters (vendor-004)
  {
    id: "vuser-010",
    vendorId: "vendor-004",
    firstName: "Jack",
    lastName: "Taylor",
    title: "Managing Director",
    email: "jack.t@healthpro.com",
    officePhone: "713-555-0301",
    mobilePhone: "713-555-0302",
    status: "Inactive",
    createdAt: "2023-04-10T10:00:00Z",
    updatedAt: "2024-02-15T10:00:00Z",
  },
  // NurseConnect Agency (vendor-005)
  {
    id: "vuser-011",
    vendorId: "vendor-005",
    firstName: "Karen",
    lastName: "Anderson",
    title: "Founder & CEO",
    email: "karen.a@nurseconnect.com",
    officePhone: "305-555-0401",
    mobilePhone: "305-555-0402",
    status: "Active",
    createdAt: "2023-05-05T10:00:00Z",
    updatedAt: "2023-05-05T10:00:00Z",
  },
  {
    id: "vuser-012",
    vendorId: "vendor-005",
    firstName: "Larry",
    lastName: "Thomas",
    title: "Operations Manager",
    email: "larry.t@nurseconnect.com",
    officePhone: "305-555-0403",
    mobilePhone: "305-555-0404",
    status: "Active",
    createdAt: "2023-05-05T10:00:00Z",
    updatedAt: "2023-05-05T10:00:00Z",
  },
  // Allied Health Partners (vendor-006)
  {
    id: "vuser-013",
    vendorId: "vendor-006",
    firstName: "Maria",
    lastName: "Jackson",
    title: "Director of Recruiting",
    email: "maria.j@alliedhealth.com",
    officePhone: "404-555-0501",
    mobilePhone: "404-555-0502",
    status: "Inactive",
    createdAt: "2023-06-12T10:00:00Z",
    updatedAt: "2024-03-20T10:00:00Z",
  },
  // Premier Medical Staffing (vendor-007)
  {
    id: "vuser-014",
    vendorId: "vendor-007",
    firstName: "Nathan",
    lastName: "White",
    title: "CEO",
    email: "nathan.w@premiermedical.com",
    officePhone: "617-555-0601",
    mobilePhone: "617-555-0602",
    status: "Active",
    createdAt: "2023-07-19T10:00:00Z",
    updatedAt: "2023-07-19T10:00:00Z",
  },
  {
    id: "vuser-015",
    vendorId: "vendor-007",
    firstName: "Olivia",
    lastName: "Harris",
    title: "VP of Operations",
    email: "olivia.h@premiermedical.com",
    officePhone: "617-555-0603",
    mobilePhone: "617-555-0604",
    status: "Active",
    createdAt: "2023-07-19T10:00:00Z",
    updatedAt: "2023-07-19T10:00:00Z",
  },
  {
    id: "vuser-016",
    vendorId: "vendor-007",
    firstName: "Paul",
    lastName: "Martin",
    title: "Client Relations Manager",
    email: "paul.m@premiermedical.com",
    officePhone: "617-555-0605",
    mobilePhone: "617-555-0606",
    status: "Active",
    createdAt: "2023-07-19T10:00:00Z",
    updatedAt: "2023-07-19T10:00:00Z",
  },
  // Global Healthcare Resources (vendor-008)
  {
    id: "vuser-017",
    vendorId: "vendor-008",
    firstName: "Quinn",
    lastName: "Thompson",
    title: "Chief Executive Officer",
    email: "quinn.t@globalhealthcare.com",
    officePhone: "212-555-0701",
    mobilePhone: "212-555-0702",
    status: "Active",
    createdAt: "2023-08-10T10:00:00Z",
    updatedAt: "2023-08-10T10:00:00Z",
  },
  {
    id: "vuser-018",
    vendorId: "vendor-008",
    firstName: "Rachel",
    lastName: "Garcia",
    title: "Chief Technology Officer",
    email: "rachel.g@globalhealthcare.com",
    officePhone: "212-555-0703",
    mobilePhone: "212-555-0704",
    status: "Active",
    createdAt: "2023-08-10T10:00:00Z",
    updatedAt: "2023-08-10T10:00:00Z",
  },
  {
    id: "vuser-019",
    vendorId: "vendor-008",
    firstName: "Samuel",
    lastName: "Martinez",
    title: "Director of Staffing",
    email: "samuel.m@globalhealthcare.com",
    officePhone: "212-555-0705",
    mobilePhone: "212-555-0706",
    status: "Active",
    createdAt: "2023-08-10T10:00:00Z",
    updatedAt: "2023-08-10T10:00:00Z",
  },
  // Regional Medical Staffing (vendor-009)
  {
    id: "vuser-020",
    vendorId: "vendor-009",
    firstName: "Tina",
    lastName: "Robinson",
    title: "President",
    email: "tina.r@regionalmedical.com",
    officePhone: "503-555-0801",
    mobilePhone: "503-555-0802",
    status: "Active",
    createdAt: "2023-09-15T10:00:00Z",
    updatedAt: "2023-09-15T10:00:00Z",
  },
  {
    id: "vuser-021",
    vendorId: "vendor-009",
    firstName: "Victor",
    lastName: "Clark",
    title: "Recruitment Coordinator",
    email: "victor.c@regionalmedical.com",
    officePhone: "503-555-0803",
    mobilePhone: "503-555-0804",
    status: "Active",
    createdAt: "2023-09-15T10:00:00Z",
    updatedAt: "2023-09-15T10:00:00Z",
  },
  // Elite Nursing Services (vendor-010)
  {
    id: "vuser-022",
    vendorId: "vendor-010",
    firstName: "Wendy",
    lastName: "Lewis",
    title: "CEO",
    email: "wendy.l@elitenursing.com",
    officePhone: "214-555-0901",
    mobilePhone: "214-555-0902",
    status: "Active",
    createdAt: "2023-10-20T10:00:00Z",
    updatedAt: "2023-10-20T10:00:00Z",
  },
  {
    id: "vuser-023",
    vendorId: "vendor-010",
    firstName: "Xavier",
    lastName: "Walker",
    title: "Operations Director",
    email: "xavier.w@elitenursing.com",
    officePhone: "214-555-0903",
    mobilePhone: "214-555-0904",
    status: "Active",
    createdAt: "2023-10-20T10:00:00Z",
    updatedAt: "2023-10-20T10:00:00Z",
  },
  {
    id: "vuser-024",
    vendorId: "vendor-010",
    firstName: "Yvonne",
    lastName: "Hall",
    title: "Client Success Manager",
    email: "yvonne.h@elitenursing.com",
    officePhone: "214-555-0905",
    mobilePhone: "214-555-0906",
    status: "Active",
    createdAt: "2023-10-20T10:00:00Z",
    updatedAt: "2023-10-20T10:00:00Z",
  },
]

const defaultVendorUsersRecord: Record<string, VendorUser> = defaultVendorUsers.reduce(
  (acc, user) => {
    acc[user.id] = user
    return acc
  },
  {} as Record<string, VendorUser>
)

// Portal users are used for the Admin > Users tabbed experience (Program, Vendor, Organization)
const defaultPortalUsers: PortalUser[] = [
  // Program Users
  {
    id: "puser-001",
    userType: "Program",
    groupName: "Program",
    role: "Hiring Manager",
    firstName: "Alice",
    lastName: "Williams",
    title: "CEO",
    email: "alice.w@example.com",
    officePhone: "555-123-4567",
    mobilePhone: "555-987-6543",
    status: "Active",
    userIdNumber: "123456",
    createDate: "2023-01-01",
    lastLogin: "2023-10-26 10:30 AM",
    createdAt: "2023-01-10T10:00:00Z",
    updatedAt: "2023-01-10T10:00:00Z",
  },
  {
    id: "puser-002",
    userType: "Program",
    groupName: "Program",
    role: "Marketing Specialist",
    firstName: "Bob",
    lastName: "Brown",
    title: "Marketing Specialist",
    email: "bob.b@example.com",
    officePhone: "123-987-6543",
    mobilePhone: "456-789-0123",
    status: "Active",
    userIdNumber: "654321",
    createDate: "2023-02-12",
    lastLogin: "2023-10-25 09:15 AM",
    createdAt: "2023-02-12T10:00:00Z",
    updatedAt: "2023-02-12T10:00:00Z",
  },
  // Vendor Users (matches screenshot groupings)
  {
    id: "puser-101",
    userType: "Vendor",
    groupName: "Vendor A",
    role: "HR Manager",
    firstName: "Charlie",
    lastName: "Davis",
    title: "HR Manager",
    email: "charlie.d@example.com",
    officePhone: "777-888-9999",
    mobilePhone: "111-222-3333",
    status: "Inactive",
    createDate: "2023-03-01",
    lastLogin: "2023-10-10 01:00 PM",
    createdAt: "2023-03-01T10:00:00Z",
    updatedAt: "2023-03-01T10:00:00Z",
  },
  {
    id: "puser-102",
    userType: "Vendor",
    groupName: "Vendor A",
    role: "Sales Lead",
    firstName: "Frank",
    lastName: "Green",
    title: "Sales Lead",
    email: "frank.g@example.com",
    officePhone: "111-222-3333",
    mobilePhone: "444-555-6666",
    status: "Active",
    createDate: "2023-03-02",
    lastLogin: "2023-10-12 11:20 AM",
    createdAt: "2023-03-02T10:00:00Z",
    updatedAt: "2023-03-02T10:00:00Z",
  },
  {
    id: "puser-103",
    userType: "Vendor",
    groupName: "Vendor A",
    role: "Executive",
    firstName: "Alice",
    lastName: "Williams",
    title: "CEO",
    email: "alice.wi@example.com",
    officePhone: "555-123-4567",
    mobilePhone: "555-987-6543",
    status: "Active",
    createDate: "2023-03-03",
    lastLogin: "2023-10-14 02:45 PM",
    createdAt: "2023-03-03T10:00:00Z",
    updatedAt: "2023-03-03T10:00:00Z",
  },
  {
    id: "puser-104",
    userType: "Vendor",
    groupName: "Vendor B",
    role: "Staff",
    firstName: "Bob",
    lastName: "Brown",
    title: "Marketing Specialist",
    email: "bob.bj@example.com",
    officePhone: "123-987-6543",
    mobilePhone: "456-789-0123",
    status: "Active",
    createDate: "2023-03-04",
    lastLogin: "2023-10-16 08:30 AM",
    createdAt: "2023-03-04T10:00:00Z",
    updatedAt: "2023-03-04T10:00:00Z",
  },
  {
    id: "puser-105",
    userType: "Vendor",
    groupName: "Vendor B",
    role: "Staff",
    firstName: "Eve",
    lastName: "Wilson",
    title: "Financial Analyst",
    email: "eve.wj@example.com",
    officePhone: "333-444-5555",
    mobilePhone: "888-999-0000",
    status: "Active",
    createDate: "2023-03-05",
    lastLogin: "2023-10-18 04:00 PM",
    createdAt: "2023-03-05T10:00:00Z",
    updatedAt: "2023-03-05T10:00:00Z",
  },
  {
    id: "puser-106",
    userType: "Vendor",
    groupName: "Vendor C",
    role: "Manager",
    firstName: "Grace",
    lastName: "Hall",
    title: "Project Manager",
    email: "grace.h@example.com",
    officePhone: "666-777-8888",
    mobilePhone: "999-000-1111",
    status: "Inactive",
    createDate: "2023-03-06",
    lastLogin: "2023-10-20 03:10 PM",
    createdAt: "2023-03-06T10:00:00Z",
    updatedAt: "2023-03-06T10:00:00Z",
  },
  {
    id: "puser-107",
    userType: "Vendor",
    groupName: "Vendor C",
    role: "Executive",
    firstName: "Diana",
    lastName: "Miller",
    title: "CTO",
    email: "diana.m@example.com",
    officePhone: "222-333-4444",
    mobilePhone: "555-666-7777",
    status: "Inactive",
    createDate: "2023-03-07",
    lastLogin: "2023-10-22 12:00 PM",
    createdAt: "2023-03-07T10:00:00Z",
    updatedAt: "2023-03-07T10:00:00Z",
  },
  // Organization Users (matches screenshot groupings)
  {
    id: "puser-201",
    userType: "Organization",
    groupName: "Organization A",
    role: "Staff",
    firstName: "Charlie",
    lastName: "Davis",
    title: "HR Manager",
    email: "charlie.d@example.com",
    officePhone: "777-888-9999",
    mobilePhone: "111-222-3333",
    status: "Inactive",
    createDate: "2023-04-01",
    lastLogin: "2023-10-10 01:00 PM",
    createdAt: "2023-04-01T10:00:00Z",
    updatedAt: "2023-04-01T10:00:00Z",
  },
  {
    id: "puser-202",
    userType: "Organization",
    groupName: "Organization A",
    role: "Manager",
    firstName: "Frank",
    lastName: "Green",
    title: "Sales Lead",
    email: "frank.g@example.com",
    officePhone: "111-222-3333",
    mobilePhone: "444-555-6666",
    status: "Active",
    createDate: "2023-04-02",
    lastLogin: "2023-10-12 11:20 AM",
    createdAt: "2023-04-02T10:00:00Z",
    updatedAt: "2023-04-02T10:00:00Z",
  },
  {
    id: "puser-203",
    userType: "Organization",
    groupName: "Organization A",
    role: "Executive",
    firstName: "Alice",
    lastName: "Williams",
    title: "CEO",
    email: "alice.w@example.com",
    officePhone: "555-123-4567",
    mobilePhone: "555-987-6543",
    status: "Active",
    createDate: "2023-04-03",
    lastLogin: "2023-10-14 02:45 PM",
    createdAt: "2023-04-03T10:00:00Z",
    updatedAt: "2023-04-03T10:00:00Z",
  },
  {
    id: "puser-204",
    userType: "Organization",
    groupName: "Organization B",
    role: "Staff",
    firstName: "Bob",
    lastName: "Brown",
    title: "Marketing Specialist",
    email: "bob.b@example.com",
    officePhone: "123-987-6543",
    mobilePhone: "456-789-0123",
    status: "Active",
    createDate: "2023-04-04",
    lastLogin: "2023-10-16 08:30 AM",
    createdAt: "2023-04-04T10:00:00Z",
    updatedAt: "2023-04-04T10:00:00Z",
  },
  {
    id: "puser-205",
    userType: "Organization",
    groupName: "Organization B",
    role: "Staff",
    firstName: "Eve",
    lastName: "Wilson",
    title: "Financial Analyst",
    email: "eve.w@example.com",
    officePhone: "333-444-5555",
    mobilePhone: "888-999-0000",
    status: "Inactive",
    createDate: "2023-04-05",
    lastLogin: "2023-10-18 04:00 PM",
    createdAt: "2023-04-05T10:00:00Z",
    updatedAt: "2023-04-05T10:00:00Z",
  },
  {
    id: "puser-206",
    userType: "Organization",
    groupName: "Organization C",
    role: "Manager",
    firstName: "Grace",
    lastName: "Hall",
    title: "Project Manager",
    email: "grace.h@example.com",
    officePhone: "666-777-8888",
    mobilePhone: "999-000-1111",
    status: "Active",
    createDate: "2023-04-06",
    lastLogin: "2023-10-20 03:10 PM",
    createdAt: "2023-04-06T10:00:00Z",
    updatedAt: "2023-04-06T10:00:00Z",
  },
  {
    id: "puser-207",
    userType: "Organization",
    groupName: "Organization C",
    role: "Executive",
    firstName: "Diana",
    lastName: "Miller",
    title: "CTO",
    email: "diana.m@example.com",
    officePhone: "222-333-4444",
    mobilePhone: "555-666-7777",
    status: "Active",
    createDate: "2023-04-07",
    lastLogin: "2023-10-22 12:00 PM",
    createdAt: "2023-04-07T10:00:00Z",
    updatedAt: "2023-04-07T10:00:00Z",
  },
]

const defaultPortalUsersRecord: Record<string, PortalUser> = defaultPortalUsers.reduce(
  (acc, user) => {
    acc[user.id] = user
    return acc
  },
  {} as Record<string, PortalUser>
)

export type PortalUserAffiliation = {
  id: string
  userId: string
  organizationName: string
  roleAtOrganization: string
  status: "Added" | "Removed"
  activationDate?: string
  inactivationDate?: string
  createdAt: string
  updatedAt: string
}

export type PortalUserNote = {
  id: string
  userId: string
  noteType: "General" | "Meeting" | "System"
  date: string
  noteMessage: string
  createdAt: string
  updatedAt: string
}

const defaultPortalUserAffiliations: PortalUserAffiliation[] = [
  {
    id: "pua-001",
    userId: "puser-001",
    organizationName: "Tech Solutions",
    roleAtOrganization: "Viewer",
    status: "Added",
    activationDate: "2023-07-01",
    createdAt: "2023-07-01T10:00:00Z",
    updatedAt: "2023-07-01T10:00:00Z",
  },
  {
    id: "pua-002",
    userId: "puser-001",
    organizationName: "Recovered Health",
    roleAtOrganization: "Administrator",
    status: "Added",
    activationDate: "2022-01-15",
    createdAt: "2022-01-15T10:00:00Z",
    updatedAt: "2022-01-15T10:00:00Z",
  },
  {
    id: "pua-003",
    userId: "puser-001",
    organizationName: "Global Corp",
    roleAtOrganization: "Contributor",
    status: "Removed",
    activationDate: "2021-03-10",
    inactivationDate: "2023-05-20",
    createdAt: "2021-03-10T10:00:00Z",
    updatedAt: "2023-05-20T10:00:00Z",
  },
]

const defaultPortalUserNotes: PortalUserNote[] = [
  {
    id: "pun-001",
    userId: "puser-001",
    noteType: "General",
    date: "2023-10-26",
    noteMessage: "Followed up on pending requests.",
    createdAt: "2023-10-26T09:00:00Z",
    updatedAt: "2023-10-26T09:00:00Z",
  },
  {
    id: "pun-002",
    userId: "puser-001",
    noteType: "Meeting",
    date: "2023-10-25",
    noteMessage: "Discussed Q4 strategy with the team.",
    createdAt: "2023-10-25T11:00:00Z",
    updatedAt: "2023-10-25T11:00:00Z",
  },
  {
    id: "pun-003",
    userId: "puser-001",
    noteType: "System",
    date: "2023-10-20",
    noteMessage: "Account created and onboarding initiated.",
    createdAt: "2023-10-20T08:00:00Z",
    updatedAt: "2023-10-20T08:00:00Z",
  },
]

const defaultPortalUserAffiliationsRecord: Record<string, PortalUserAffiliation> = defaultPortalUserAffiliations.reduce(
  (acc, entry) => {
    acc[entry.id] = entry
    return acc
  },
  {} as Record<string, PortalUserAffiliation>
)

const defaultPortalUserNotesRecord: Record<string, PortalUserNote> = defaultPortalUserNotes.reduce(
  (acc, entry) => {
    acc[entry.id] = entry
    return acc
  },
  {} as Record<string, PortalUserNote>
)

const defaultVendorDocuments: VendorDocument[] = [
  // Nova Health (vendor-001)
  {
    id: "vdoc-001",
    vendorId: "vendor-001",
    name: "Contract_2023_Q4.pdf",
    type: "Legal",
    uploadedDate: "2023-11-28",
    uploadedBy: "Alice Johnson",
    description: "Quarterly sales contract for Q4 2023.",
    createdAt: "2023-11-28T10:00:00Z",
    updatedAt: "2023-11-28T10:00:00Z",
  },
  {
    id: "vdoc-002",
    vendorId: "vendor-001",
    name: "Marketing_Campaign_Report.xlsx",
    type: "Marketing",
    uploadedDate: "2023-11-25",
    uploadedBy: "Bob Williams",
    description: "Performance report for recent marketing campaign.",
    createdAt: "2023-11-25T10:00:00Z",
    updatedAt: "2023-11-25T10:00:00Z",
  },
  {
    id: "vdoc-003",
    vendorId: "vendor-001",
    name: "Financial_Statement_Q3.docx",
    type: "Finance",
    uploadedDate: "2023-10-15",
    uploadedBy: "Charlie Brown",
    description: "Third quarter financial statement.",
    createdAt: "2023-10-15T10:00:00Z",
    updatedAt: "2023-10-15T10:00:00Z",
  },
  {
    id: "vdoc-004",
    vendorId: "vendor-001",
    name: "HR_Policy_Update.pdf",
    type: "HR",
    uploadedDate: "2023-09-01",
    uploadedBy: "Diana Miller",
    description: "Updated HR policies and procedures.",
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z",
  },
  {
    id: "vdoc-005",
    vendorId: "vendor-001",
    name: "Project_Plan_Alpha.pptx",
    type: "Project",
    uploadedDate: "2023-08-20",
    uploadedBy: "Eve Davis",
    description: "Detailed project plan for Project Alpha.",
    createdAt: "2023-08-20T10:00:00Z",
    updatedAt: "2023-08-20T10:00:00Z",
  },
  // MedStaff Solutions (vendor-002)
  {
    id: "vdoc-006",
    vendorId: "vendor-002",
    name: "Service_Agreement_2023.pdf",
    type: "Legal",
    uploadedDate: "2023-03-25",
    uploadedBy: "Frank Garcia",
    description: "Master service agreement for 2023.",
    createdAt: "2023-03-25T10:00:00Z",
    updatedAt: "2023-03-25T10:00:00Z",
  },
  {
    id: "vdoc-007",
    vendorId: "vendor-002",
    name: "Quarterly_Report_Q1_2023.xlsx",
    type: "Finance",
    uploadedDate: "2023-04-15",
    uploadedBy: "Grace Martinez",
    description: "First quarter financial report.",
    createdAt: "2023-04-15T10:00:00Z",
    updatedAt: "2023-04-15T10:00:00Z",
  },
  // CareFirst Staffing (vendor-003)
  {
    id: "vdoc-008",
    vendorId: "vendor-003",
    name: "Partnership_Agreement.pdf",
    type: "Legal",
    uploadedDate: "2023-02-10",
    uploadedBy: "Henry Rodriguez",
    description: "Strategic partnership agreement with major hospital network.",
    createdAt: "2023-02-10T10:00:00Z",
    updatedAt: "2023-02-10T10:00:00Z",
  },
  {
    id: "vdoc-009",
    vendorId: "vendor-003",
    name: "Marketing_Strategy_2023.pdf",
    type: "Marketing",
    uploadedDate: "2023-02-15",
    uploadedBy: "Iris Lee",
    description: "Annual marketing strategy and campaign plan.",
    createdAt: "2023-02-15T10:00:00Z",
    updatedAt: "2023-02-15T10:00:00Z",
  },
  {
    id: "vdoc-010",
    vendorId: "vendor-003",
    name: "Compliance_Certification.pdf",
    type: "Legal",
    uploadedDate: "2023-02-20",
    uploadedBy: "Henry Rodriguez",
    description: "Healthcare compliance certification document.",
    createdAt: "2023-02-20T10:00:00Z",
    updatedAt: "2023-02-20T10:00:00Z",
  },
  // HealthPro Recruiters (vendor-004)
  {
    id: "vdoc-011",
    vendorId: "vendor-004",
    name: "Business_Plan_2023.docx",
    type: "Project",
    uploadedDate: "2023-04-20",
    uploadedBy: "Jack Taylor",
    description: "Annual business plan and growth strategy.",
    createdAt: "2023-04-20T10:00:00Z",
    updatedAt: "2023-04-20T10:00:00Z",
  },
  // NurseConnect Agency (vendor-005)
  {
    id: "vdoc-012",
    vendorId: "vendor-005",
    name: "Vendor_Agreement_2023.pdf",
    type: "Legal",
    uploadedDate: "2023-05-10",
    uploadedBy: "Karen Anderson",
    description: "Vendor agreement and terms of service.",
    createdAt: "2023-05-10T10:00:00Z",
    updatedAt: "2023-05-10T10:00:00Z",
  },
  {
    id: "vdoc-013",
    vendorId: "vendor-005",
    name: "HR_Handbook_2023.pdf",
    type: "HR",
    uploadedDate: "2023-05-15",
    uploadedBy: "Larry Thomas",
    description: "Updated employee handbook and policies.",
    createdAt: "2023-05-15T10:00:00Z",
    updatedAt: "2023-05-15T10:00:00Z",
  },
  {
    id: "vdoc-014",
    vendorId: "vendor-005",
    name: "Financial_Audit_2023.pdf",
    type: "Finance",
    uploadedDate: "2023-06-01",
    uploadedBy: "Karen Anderson",
    description: "Annual financial audit report.",
    createdAt: "2023-06-01T10:00:00Z",
    updatedAt: "2023-06-01T10:00:00Z",
  },
  // Allied Health Partners (vendor-006)
  {
    id: "vdoc-015",
    vendorId: "vendor-006",
    name: "Service_Contract_2023.pdf",
    type: "Legal",
    uploadedDate: "2023-06-20",
    uploadedBy: "Maria Jackson",
    description: "Service contract for 2023 fiscal year.",
    createdAt: "2023-06-20T10:00:00Z",
    updatedAt: "2023-06-20T10:00:00Z",
  },
  // Premier Medical Staffing (vendor-007)
  {
    id: "vdoc-016",
    vendorId: "vendor-007",
    name: "Master_Agreement_2023.pdf",
    type: "Legal",
    uploadedDate: "2023-07-25",
    uploadedBy: "Nathan White",
    description: "Master service agreement with healthcare facilities.",
    createdAt: "2023-07-25T10:00:00Z",
    updatedAt: "2023-07-25T10:00:00Z",
  },
  {
    id: "vdoc-017",
    vendorId: "vendor-007",
    name: "Marketing_Presentation_2023.pptx",
    type: "Marketing",
    uploadedDate: "2023-08-01",
    uploadedBy: "Olivia Harris",
    description: "Annual marketing presentation and strategy.",
    createdAt: "2023-08-01T10:00:00Z",
    updatedAt: "2023-08-01T10:00:00Z",
  },
  {
    id: "vdoc-018",
    vendorId: "vendor-007",
    name: "Quarterly_Financial_Report_Q3.xlsx",
    type: "Finance",
    uploadedDate: "2023-10-05",
    uploadedBy: "Paul Martin",
    description: "Third quarter financial performance report.",
    createdAt: "2023-10-05T10:00:00Z",
    updatedAt: "2023-10-05T10:00:00Z",
  },
  {
    id: "vdoc-019",
    vendorId: "vendor-007",
    name: "HR_Compliance_Report.pdf",
    type: "HR",
    uploadedDate: "2023-09-15",
    uploadedBy: "Olivia Harris",
    description: "HR compliance and audit report.",
    createdAt: "2023-09-15T10:00:00Z",
    updatedAt: "2023-09-15T10:00:00Z",
  },
  // Global Healthcare Resources (vendor-008)
  {
    id: "vdoc-020",
    vendorId: "vendor-008",
    name: "Corporate_Presentation_2023.pptx",
    type: "Marketing",
    uploadedDate: "2023-08-15",
    uploadedBy: "Quinn Thompson",
    description: "Corporate overview and capabilities presentation.",
    createdAt: "2023-08-15T10:00:00Z",
    updatedAt: "2023-08-15T10:00:00Z",
  },
  {
    id: "vdoc-021",
    vendorId: "vendor-008",
    name: "Technology_Platform_Overview.pdf",
    type: "Project",
    uploadedDate: "2023-08-20",
    uploadedBy: "Rachel Garcia",
    description: "Technology platform and system documentation.",
    createdAt: "2023-08-20T10:00:00Z",
    updatedAt: "2023-08-20T10:00:00Z",
  },
  {
    id: "vdoc-022",
    vendorId: "vendor-008",
    name: "Financial_Statement_2023.pdf",
    type: "Finance",
    uploadedDate: "2023-09-30",
    uploadedBy: "Samuel Martinez",
    description: "Annual financial statement and audit.",
    createdAt: "2023-09-30T10:00:00Z",
    updatedAt: "2023-09-30T10:00:00Z",
  },
  // Regional Medical Staffing (vendor-009)
  {
    id: "vdoc-023",
    vendorId: "vendor-009",
    name: "Partnership_Proposal_2023.pdf",
    type: "Project",
    uploadedDate: "2023-09-20",
    uploadedBy: "Tina Robinson",
    description: "Strategic partnership proposal document.",
    createdAt: "2023-09-20T10:00:00Z",
    updatedAt: "2023-09-20T10:00:00Z",
  },
  {
    id: "vdoc-024",
    vendorId: "vendor-009",
    name: "Service_Agreement_Template.pdf",
    type: "Legal",
    uploadedDate: "2023-09-25",
    uploadedBy: "Victor Clark",
    description: "Standard service agreement template.",
    createdAt: "2023-09-25T10:00:00Z",
    updatedAt: "2023-09-25T10:00:00Z",
  },
  // Elite Nursing Services (vendor-010)
  {
    id: "vdoc-025",
    vendorId: "vendor-010",
    name: "Vendor_Contract_2023.pdf",
    type: "Legal",
    uploadedDate: "2023-10-25",
    uploadedBy: "Wendy Lewis",
    description: "Vendor contract and service agreement.",
    createdAt: "2023-10-25T10:00:00Z",
    updatedAt: "2023-10-25T10:00:00Z",
  },
  {
    id: "vdoc-026",
    vendorId: "vendor-010",
    name: "Marketing_Materials_2023.pdf",
    type: "Marketing",
    uploadedDate: "2023-11-01",
    uploadedBy: "Xavier Walker",
    description: "Marketing materials and brand guidelines.",
    createdAt: "2023-11-01T10:00:00Z",
    updatedAt: "2023-11-01T10:00:00Z",
  },
  {
    id: "vdoc-027",
    vendorId: "vendor-010",
    name: "Financial_Report_Q4_2023.xlsx",
    type: "Finance",
    uploadedDate: "2023-12-15",
    uploadedBy: "Yvonne Hall",
    description: "Fourth quarter financial report.",
    createdAt: "2023-12-15T10:00:00Z",
    updatedAt: "2023-12-15T10:00:00Z",
  },
]

const defaultVendorDocumentsRecord: Record<string, VendorDocument> = defaultVendorDocuments.reduce(
  (acc, doc) => {
    acc[doc.id] = doc
    return acc
  },
  {} as Record<string, VendorDocument>
)

const defaultVendorNotes: VendorNote[] = [
  // Nova Health (vendor-001)
  {
    id: "vnote-001",
    vendorId: "vendor-001",
    noteType: "General",
    noteMessage: "Meeting notes on project alpha progress. Discussed expansion plans and staffing requirements for Q1 2024.",
    organization: "Acme Corp",
    authorName: "John Doe",
    date: "Nov 20, 2023",
    createdAt: "2023-11-20T10:00:00Z",
    updatedAt: "2023-11-20T10:00:00Z",
  },
  {
    id: "vnote-002",
    vendorId: "vendor-001",
    noteType: "Billing",
    noteMessage: "Reviewed billing statements for Q3. All invoices processed correctly. Payment received on time.",
    organization: "Beta Solutions",
    authorName: "Jane Smith",
    date: "Nov 19, 2023",
    createdAt: "2023-11-19T10:00:00Z",
    updatedAt: "2023-11-19T10:00:00Z",
  },
  {
    id: "vnote-003",
    vendorId: "vendor-001",
    noteType: "Issue",
    noteMessage: "Reported staffing shortage for night shifts. Working on recruitment to fill positions.",
    organization: "Gamma Inc.",
    authorName: "Alice Brown",
    date: "Nov 18, 2023",
    createdAt: "2023-11-18T10:00:00Z",
    updatedAt: "2023-11-18T10:00:00Z",
  },
  {
    id: "vnote-004",
    vendorId: "vendor-001",
    noteType: "Request",
    noteMessage: "Client requested additional RN coverage for ICU unit. Reviewing availability and scheduling.",
    organization: "Delta Systems",
    authorName: "Bob White",
    date: "Nov 17, 2023",
    createdAt: "2023-11-17T10:00:00Z",
    updatedAt: "2023-11-17T10:00:00Z",
  },
  {
    id: "vnote-005",
    vendorId: "vendor-001",
    noteType: "General",
    noteMessage: "Quarterly review meeting scheduled for next week. Preparing performance metrics and reports.",
    organization: "Acme Corp",
    authorName: "John Doe",
    date: "Nov 16, 2023",
    createdAt: "2023-11-16T10:00:00Z",
    updatedAt: "2023-11-16T10:00:00Z",
  },
  // MedStaff Solutions (vendor-002)
  {
    id: "vnote-006",
    vendorId: "vendor-002",
    noteType: "General",
    noteMessage: "Initial onboarding meeting completed. Discussed service expectations and contract terms.",
    organization: "Memorial Health System",
    authorName: "Frank Garcia",
    date: "Mar 25, 2023",
    createdAt: "2023-03-25T10:00:00Z",
    updatedAt: "2023-03-25T10:00:00Z",
  },
  {
    id: "vnote-007",
    vendorId: "vendor-002",
    noteType: "Issue",
    noteMessage: "Contract termination notice received. Final services to be completed by end of month.",
    organization: "Memorial Health System",
    authorName: "Grace Martinez",
    date: "Dec 15, 2023",
    createdAt: "2023-12-15T10:00:00Z",
    updatedAt: "2023-12-15T10:00:00Z",
  },
  // CareFirst Staffing (vendor-003)
  {
    id: "vnote-008",
    vendorId: "vendor-003",
    noteType: "General",
    noteMessage: "New partnership agreement signed. Excited to begin collaboration on staffing solutions.",
    organization: "Nova Health",
    authorName: "Henry Rodriguez",
    date: "Feb 10, 2023",
    createdAt: "2023-02-10T10:00:00Z",
    updatedAt: "2023-02-10T10:00:00Z",
  },
  {
    id: "vnote-009",
    vendorId: "vendor-003",
    noteType: "Request",
    noteMessage: "Client requested specialized training for staff. Coordinating training program schedule.",
    organization: "Nova Health",
    authorName: "Iris Lee",
    date: "Oct 15, 2023",
    createdAt: "2023-10-15T10:00:00Z",
    updatedAt: "2023-10-15T10:00:00Z",
  },
  {
    id: "vnote-010",
    vendorId: "vendor-003",
    noteType: "Billing",
    noteMessage: "Monthly billing cycle completed. All invoices submitted and approved.",
    organization: "Nova Health",
    authorName: "Henry Rodriguez",
    date: "Nov 1, 2023",
    createdAt: "2023-11-01T10:00:00Z",
    updatedAt: "2023-11-01T10:00:00Z",
  },
  // HealthPro Recruiters (vendor-004)
  {
    id: "vnote-011",
    vendorId: "vendor-004",
    noteType: "General",
    noteMessage: "Initial consultation completed. Discussed staffing needs and service capabilities.",
    organization: "Vitality Health Group",
    authorName: "Jack Taylor",
    date: "Apr 15, 2023",
    createdAt: "2023-04-15T10:00:00Z",
    updatedAt: "2023-04-15T10:00:00Z",
  },
  // NurseConnect Agency (vendor-005)
  {
    id: "vnote-012",
    vendorId: "vendor-005",
    noteType: "General",
    noteMessage: "Quarterly business review meeting. Discussed performance metrics and growth opportunities.",
    organization: "Memorial Health System",
    authorName: "Karen Anderson",
    date: "Aug 10, 2023",
    createdAt: "2023-08-10T10:00:00Z",
    updatedAt: "2023-08-10T10:00:00Z",
  },
  {
    id: "vnote-013",
    vendorId: "vendor-005",
    noteType: "Request",
    noteMessage: "Client requested additional nursing staff for emergency department. Working on placement.",
    organization: "Memorial Health System",
    authorName: "Larry Thomas",
    date: "Sep 20, 2023",
    createdAt: "2023-09-20T10:00:00Z",
    updatedAt: "2023-09-20T10:00:00Z",
  },
  {
    id: "vnote-014",
    vendorId: "vendor-005",
    noteType: "Billing",
    noteMessage: "Payment received for September services. All invoices current.",
    organization: "Memorial Health System",
    authorName: "Karen Anderson",
    date: "Oct 5, 2023",
    createdAt: "2023-10-05T10:00:00Z",
    updatedAt: "2023-10-05T10:00:00Z",
  },
  // Allied Health Partners (vendor-006)
  {
    id: "vnote-015",
    vendorId: "vendor-006",
    noteType: "General",
    noteMessage: "Service agreement signed. Beginning staffing services next month.",
    organization: "Vitality Health Group",
    authorName: "Maria Jackson",
    date: "Jun 20, 2023",
    createdAt: "2023-06-20T10:00:00Z",
    updatedAt: "2023-06-20T10:00:00Z",
  },
  // Premier Medical Staffing (vendor-007)
  {
    id: "vnote-016",
    vendorId: "vendor-007",
    noteType: "General",
    noteMessage: "Strategic partnership meeting. Discussed long-term collaboration and expansion plans.",
    organization: "Nova Health",
    authorName: "Nathan White",
    date: "Aug 5, 2023",
    createdAt: "2023-08-05T10:00:00Z",
    updatedAt: "2023-08-05T10:00:00Z",
  },
  {
    id: "vnote-017",
    vendorId: "vendor-007",
    noteType: "Request",
    noteMessage: "Client requested specialized medical professionals for cardiac unit. Screening candidates.",
    organization: "Nova Health",
    authorName: "Olivia Harris",
    date: "Sep 10, 2023",
    createdAt: "2023-09-10T10:00:00Z",
    updatedAt: "2023-09-10T10:00:00Z",
  },
  {
    id: "vnote-018",
    vendorId: "vendor-007",
    noteType: "Billing",
    noteMessage: "Monthly billing completed. All services invoiced and payment terms confirmed.",
    organization: "Nova Health",
    authorName: "Paul Martin",
    date: "Oct 1, 2023",
    createdAt: "2023-10-01T10:00:00Z",
    updatedAt: "2023-10-01T10:00:00Z",
  },
  {
    id: "vnote-019",
    vendorId: "vendor-007",
    noteType: "General",
    noteMessage: "Performance review meeting scheduled. Preparing comprehensive service report.",
    organization: "Nova Health",
    authorName: "Nathan White",
    date: "Nov 5, 2023",
    createdAt: "2023-11-05T10:00:00Z",
    updatedAt: "2023-11-05T10:00:00Z",
  },
  // Global Healthcare Resources (vendor-008)
  {
    id: "vnote-020",
    vendorId: "vendor-008",
    noteType: "General",
    noteMessage: "Technology platform demonstration completed. Client impressed with capabilities.",
    organization: "Nova Health",
    authorName: "Quinn Thompson",
    date: "Aug 20, 2023",
    createdAt: "2023-08-20T10:00:00Z",
    updatedAt: "2023-08-20T10:00:00Z",
  },
  {
    id: "vnote-021",
    vendorId: "vendor-008",
    noteType: "Request",
    noteMessage: "Client requested integration with their HR system. Technical team reviewing requirements.",
    organization: "Nova Health",
    authorName: "Rachel Garcia",
    date: "Sep 15, 2023",
    createdAt: "2023-09-15T10:00:00Z",
    updatedAt: "2023-09-15T10:00:00Z",
  },
  {
    id: "vnote-022",
    vendorId: "vendor-008",
    noteType: "Billing",
    noteMessage: "Quarterly billing cycle completed. All invoices processed and payments received.",
    organization: "Nova Health",
    authorName: "Samuel Martinez",
    date: "Oct 10, 2023",
    createdAt: "2023-10-10T10:00:00Z",
    updatedAt: "2023-10-10T10:00:00Z",
  },
  {
    id: "vnote-023",
    vendorId: "vendor-008",
    noteType: "General",
    noteMessage: "Annual contract renewal discussion. Terms and pricing under review.",
    organization: "Nova Health",
    authorName: "Quinn Thompson",
    date: "Nov 15, 2023",
    createdAt: "2023-11-15T10:00:00Z",
    updatedAt: "2023-11-15T10:00:00Z",
  },
  // Regional Medical Staffing (vendor-009)
  {
    id: "vnote-024",
    vendorId: "vendor-009",
    noteType: "General",
    noteMessage: "Initial partnership meeting. Discussed regional staffing needs and service model.",
    organization: "Vitality Health Group",
    authorName: "Tina Robinson",
    date: "Sep 20, 2023",
    createdAt: "2023-09-20T10:00:00Z",
    updatedAt: "2023-09-20T10:00:00Z",
  },
  {
    id: "vnote-025",
    vendorId: "vendor-009",
    noteType: "Request",
    noteMessage: "Client requested additional coverage for weekend shifts. Coordinating staff availability.",
    organization: "Vitality Health Group",
    authorName: "Victor Clark",
    date: "Oct 25, 2023",
    createdAt: "2023-10-25T10:00:00Z",
    updatedAt: "2023-10-25T10:00:00Z",
  },
  // Elite Nursing Services (vendor-010)
  {
    id: "vnote-026",
    vendorId: "vendor-010",
    noteType: "General",
    noteMessage: "Service agreement signed. Beginning staffing services for multiple departments.",
    organization: "Memorial Health System",
    authorName: "Wendy Lewis",
    date: "Oct 25, 2023",
    createdAt: "2023-10-25T10:00:00Z",
    updatedAt: "2023-10-25T10:00:00Z",
  },
  {
    id: "vnote-027",
    vendorId: "vendor-010",
    noteType: "Request",
    noteMessage: "Client requested specialized ICU nurses. Screening qualified candidates.",
    organization: "Memorial Health System",
    authorName: "Xavier Walker",
    date: "Nov 10, 2023",
    createdAt: "2023-11-10T10:00:00Z",
    updatedAt: "2023-11-10T10:00:00Z",
  },
  {
    id: "vnote-028",
    vendorId: "vendor-010",
    noteType: "Billing",
    noteMessage: "First month billing completed. All services invoiced according to agreement.",
    organization: "Memorial Health System",
    authorName: "Yvonne Hall",
    date: "Nov 30, 2023",
    createdAt: "2023-11-30T10:00:00Z",
    updatedAt: "2023-11-30T10:00:00Z",
  },
  {
    id: "vnote-029",
    vendorId: "vendor-010",
    noteType: "General",
    noteMessage: "Monthly check-in meeting. Service performance meeting expectations. Client satisfied.",
    organization: "Memorial Health System",
    authorName: "Wendy Lewis",
    date: "Dec 5, 2023",
    createdAt: "2023-12-05T10:00:00Z",
    updatedAt: "2023-12-05T10:00:00Z",
  },
]

const defaultVendorNotesRecord: Record<string, VendorNote> = defaultVendorNotes.reduce(
  (acc, note) => {
    acc[note.id] = note
    return acc
  },
  {} as Record<string, VendorNote>
)

// Default vendor-organization associations (many-to-many relationship)
const defaultVendorOrganizations: VendorOrganization[] = [
  // Nova Health (vendor-001) associated with multiple orgs
  {
    id: "vo-001",
    vendorId: "vendor-001",
    organizationId: "org-001", // Nova Health
    status: "Active",
    startDate: "2023-01-15",
    notes: "Primary vendor for nursing staff",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-01-15T10:00:00Z",
  },
  {
    id: "vo-002",
    vendorId: "vendor-001",
    organizationId: "org-002", // Memorial Health System
    status: "Active",
    startDate: "2023-02-01",
    notes: "Contract for ICU and ER staffing",
    createdAt: "2023-02-01T10:00:00Z",
    updatedAt: "2023-02-01T10:00:00Z",
  },
  {
    id: "vo-003",
    vendorId: "vendor-001",
    organizationId: "org-003", // Vitality Health Group
    status: "Active",
    startDate: "2023-03-10",
    notes: "Regional coverage agreement",
    createdAt: "2023-03-10T10:00:00Z",
    updatedAt: "2023-03-10T10:00:00Z",
  },
  // MedStaff Solutions (vendor-002)
  {
    id: "vo-004",
    vendorId: "vendor-002",
    organizationId: "org-002", // Memorial Health System
    status: "Inactive",
    startDate: "2023-03-20",
    endDate: "2024-01-10",
    notes: "Contract terminated",
    createdAt: "2023-03-20T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "vo-005",
    vendorId: "vendor-002",
    organizationId: "org-003", // Vitality Health Group
    status: "Active",
    startDate: "2023-04-01",
    notes: "Specialized in allied health professionals",
    createdAt: "2023-04-01T10:00:00Z",
    updatedAt: "2023-04-01T10:00:00Z",
  },
  // CareFirst Staffing (vendor-003)
  {
    id: "vo-006",
    vendorId: "vendor-003",
    organizationId: "org-001", // Nova Health
    status: "Active",
    startDate: "2023-02-10",
    notes: "Partnership for healthcare staffing solutions",
    createdAt: "2023-02-10T10:00:00Z",
    updatedAt: "2023-02-10T10:00:00Z",
  },
  {
    id: "vo-007",
    vendorId: "vendor-003",
    organizationId: "org-002", // Memorial Health System
    status: "Active",
    startDate: "2023-05-15",
    notes: "Multi-department coverage",
    createdAt: "2023-05-15T10:00:00Z",
    updatedAt: "2023-05-15T10:00:00Z",
  },
  // HealthPro Recruiters (vendor-004)
  {
    id: "vo-008",
    vendorId: "vendor-004",
    organizationId: "org-003", // Vitality Health Group
    status: "Active",
    startDate: "2023-04-15",
    notes: "Initial consultation completed",
    createdAt: "2023-04-15T10:00:00Z",
    updatedAt: "2023-04-15T10:00:00Z",
  },
  {
    id: "vo-009",
    vendorId: "vendor-004",
    organizationId: "org-001", // Nova Health
    status: "Pending",
    startDate: "2024-01-01",
    notes: "New contract under review",
    createdAt: "2023-12-15T10:00:00Z",
    updatedAt: "2023-12-15T10:00:00Z",
  },
  // NurseConnect Agency (vendor-005)
  {
    id: "vo-010",
    vendorId: "vendor-005",
    organizationId: "org-002", // Memorial Health System
    status: "Active",
    startDate: "2023-08-10",
    notes: "Quarterly business review meeting",
    createdAt: "2023-08-10T10:00:00Z",
    updatedAt: "2023-08-10T10:00:00Z",
  },
  {
    id: "vo-011",
    vendorId: "vendor-005",
    organizationId: "org-003", // Vitality Health Group
    status: "Active",
    startDate: "2023-09-01",
    notes: "Emergency department coverage",
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z",
  },
  // Allied Health Partners (vendor-006)
  {
    id: "vo-012",
    vendorId: "vendor-006",
    organizationId: "org-003", // Vitality Health Group
    status: "Active",
    startDate: "2023-06-20",
    notes: "Service agreement signed",
    createdAt: "2023-06-20T10:00:00Z",
    updatedAt: "2023-06-20T10:00:00Z",
  },
  {
    id: "vo-013",
    vendorId: "vendor-006",
    organizationId: "org-001", // Nova Health
    status: "Active",
    startDate: "2023-07-01",
    notes: "Physical therapy and occupational therapy specialists",
    createdAt: "2023-07-01T10:00:00Z",
    updatedAt: "2023-07-01T10:00:00Z",
  },
  // Premier Medical Staffing (vendor-007)
  {
    id: "vo-014",
    vendorId: "vendor-007",
    organizationId: "org-001", // Nova Health
    status: "Active",
    startDate: "2023-08-05",
    notes: "Strategic partnership meeting",
    createdAt: "2023-08-05T10:00:00Z",
    updatedAt: "2023-08-05T10:00:00Z",
  },
  {
    id: "vo-015",
    vendorId: "vendor-007",
    organizationId: "org-002", // Memorial Health System
    status: "Active",
    startDate: "2023-09-15",
    notes: "Cardiac unit specialists",
    createdAt: "2023-09-15T10:00:00Z",
    updatedAt: "2023-09-15T10:00:00Z",
  },
  // Global Healthcare Resources (vendor-008)
  {
    id: "vo-016",
    vendorId: "vendor-008",
    organizationId: "org-001", // Nova Health
    status: "Active",
    startDate: "2023-08-20",
    notes: "Technology platform demonstration completed",
    createdAt: "2023-08-20T10:00:00Z",
    updatedAt: "2023-08-20T10:00:00Z",
  },
  {
    id: "vo-017",
    vendorId: "vendor-008",
    organizationId: "org-002", // Memorial Health System
    status: "Active",
    startDate: "2023-10-01",
    notes: "HR system integration",
    createdAt: "2023-10-01T10:00:00Z",
    updatedAt: "2023-10-01T10:00:00Z",
  },
  {
    id: "vo-018",
    vendorId: "vendor-008",
    organizationId: "org-003", // Vitality Health Group
    status: "Active",
    startDate: "2023-11-01",
    notes: "Annual contract renewal discussion",
    createdAt: "2023-11-01T10:00:00Z",
    updatedAt: "2023-11-01T10:00:00Z",
  },
  // Regional Medical Staffing (vendor-009)
  {
    id: "vo-019",
    vendorId: "vendor-009",
    organizationId: "org-003", // Vitality Health Group
    status: "Active",
    startDate: "2023-09-20",
    notes: "Initial partnership meeting",
    createdAt: "2023-09-20T10:00:00Z",
    updatedAt: "2023-09-20T10:00:00Z",
  },
  {
    id: "vo-020",
    vendorId: "vendor-009",
    organizationId: "org-001", // Nova Health
    status: "Active",
    startDate: "2023-10-15",
    notes: "Regional coverage expansion",
    createdAt: "2023-10-15T10:00:00Z",
    updatedAt: "2023-10-15T10:00:00Z",
  },
  // Elite Nursing Services (vendor-010)
  {
    id: "vo-021",
    vendorId: "vendor-010",
    organizationId: "org-002", // Memorial Health System
    status: "Active",
    startDate: "2023-10-25",
    notes: "Service agreement signed",
    createdAt: "2023-10-25T10:00:00Z",
    updatedAt: "2023-10-25T10:00:00Z",
  },
  {
    id: "vo-022",
    vendorId: "vendor-010",
    organizationId: "org-003", // Vitality Health Group
    status: "Active",
    startDate: "2023-11-01",
    notes: "Multiple departments coverage",
    createdAt: "2023-11-01T10:00:00Z",
    updatedAt: "2023-11-01T10:00:00Z",
  },
  // Additional associations for org-001 (Nova Health)
  {
    id: "vo-023",
    vendorId: "vendor-002", // MedStaff Solutions
    organizationId: "org-001", // Nova Health
    status: "Active",
    startDate: "2024-01-15",
    notes: "Allied health professionals for rehabilitation services",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "vo-024",
    vendorId: "vendor-004", // HealthPro Recruiters
    organizationId: "org-001", // Nova Health
    status: "Active",
    startDate: "2024-02-01",
    notes: "Specialized recruitment for urgent care positions",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z",
  },
  {
    id: "vo-025",
    vendorId: "vendor-005", // NurseConnect Agency
    organizationId: "org-001", // Nova Health
    status: "Active",
    startDate: "2024-02-10",
    notes: "Nursing staff for main campus",
    createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-02-10T10:00:00Z",
  },
  {
    id: "vo-026",
    vendorId: "vendor-006", // Allied Health Partners
    organizationId: "org-001", // Nova Health
    status: "Active",
    startDate: "2024-03-01",
    notes: "Physical therapy and occupational therapy specialists",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-01T10:00:00Z",
  },
  // Additional associations for org-002 (Memorial Health System)
  {
    id: "vo-027",
    vendorId: "vendor-001", // Nova Health (vendor)
    organizationId: "org-002", // Memorial Health System
    status: "Active",
    startDate: "2024-01-20",
    notes: "ICU and ER staffing support",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "vo-028",
    vendorId: "vendor-003", // CareFirst Staffing
    organizationId: "org-002", // Memorial Health System
    status: "Active",
    startDate: "2024-02-15",
    notes: "Multi-department coverage including surgical center",
    createdAt: "2024-02-15T10:00:00Z",
    updatedAt: "2024-02-15T10:00:00Z",
  },
  {
    id: "vo-029",
    vendorId: "vendor-004", // HealthPro Recruiters
    organizationId: "org-002", // Memorial Health System
    status: "Pending",
    startDate: "2024-03-01",
    notes: "Oncology department staffing - contract under review",
    createdAt: "2024-02-20T10:00:00Z",
    updatedAt: "2024-02-20T10:00:00Z",
  },
  {
    id: "vo-030",
    vendorId: "vendor-006", // Allied Health Partners
    organizationId: "org-002", // Memorial Health System
    status: "Active",
    startDate: "2024-01-10",
    notes: "Radiology and pathology support staff",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "vo-031",
    vendorId: "vendor-009", // Regional Medical Staffing
    organizationId: "org-002", // Memorial Health System
    status: "Active",
    startDate: "2024-02-01",
    notes: "Satellite clinic coverage",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z",
  },
]

const defaultVendorOrganizationsRecord: Record<string, VendorOrganization> = defaultVendorOrganizations.reduce(
  (acc, vo) => {
    acc[vo.id] = vo
    return acc
  },
  {} as Record<string, VendorOrganization>
)

// Default MSP data
const defaultMSPs: MSP[] = [
  {
    id: "msp-001",
    name: "Apex Solutions Inc.",
    logo: "/logos/apex.png",
    industry: "Technology",
    organizationType: "MSP firm",
    headquartersStreet: "123 Main St",
    headquartersCity: "New York",
    headquartersState: "NY",
    headquartersZip: "10001",
    headquartersCountry: "United States",
    billingSameAsHeadquarters: true,
    organizationPhone: "(555) 123-4567",
    timezone: "(UTC-05:00) Eastern Time (US & Canada)",
    msaDocument: "Master_Services_Agreement_2023.pdf",
    agreementRenewalDate: "2024-12-31",
    createdAt: "2021-03-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "msp-002",
    name: "BlueWave Technology",
    logo: "/logos/bluewave.png",
    industry: "Technology",
    organizationType: "MSP firm",
    headquartersStreet: "456 Market St",
    headquartersCity: "San Francisco",
    headquartersState: "CA",
    headquartersZip: "94102",
    headquartersCountry: "United States",
    billingSameAsHeadquarters: true,
    organizationPhone: "(555) 234-5678",
    timezone: "(UTC-08:00) Pacific Time (US & Canada)",
    msaDocument: "MSA_BlueWave_2023.pdf",
    agreementRenewalDate: "2024-11-30",
    createdAt: "2020-11-01T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "msp-003",
    name: "GreenLeaf IT",
    logo: "/logos/greenleaf.png",
    industry: "Technology",
    organizationType: "Staffing agency",
    headquartersStreet: "789 Tech Blvd",
    headquartersCity: "Austin",
    headquartersState: "TX",
    headquartersZip: "78701",
    headquartersCountry: "United States",
    billingSameAsHeadquarters: true,
    organizationPhone: "(555) 345-6789",
    timezone: "(UTC-06:00) Central Time (US & Canada)",
    msaDocument: "GreenLeaf_MSA_2023.pdf",
    agreementRenewalDate: "2025-01-20",
    createdAt: "2022-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "msp-004",
    name: "BrightStar Network",
    logo: "/logos/brightstar.png",
    industry: "Technology",
    organizationType: "MSP firm",
    headquartersStreet: "321 Commerce Dr",
    headquartersCity: "Chicago",
    headquartersState: "IL",
    headquartersZip: "60601",
    headquartersCountry: "United States",
    billingSameAsHeadquarters: true,
    organizationPhone: "(555) 456-7890",
    timezone: "(UTC-06:00) Central Time (US & Canada)",
    msaDocument: "BrightStar_MSA_2023.pdf",
    agreementRenewalDate: "2024-07-10",
    createdAt: "2019-07-10T10:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
  },
  {
    id: "msp-005",
    name: "Firewall Security",
    logo: "/logos/firewall.png",
    industry: "Technology",
    organizationType: "MSP firm",
    headquartersStreet: "654 Security Ave",
    headquartersCity: "Seattle",
    headquartersState: "WA",
    headquartersZip: "98101",
    headquartersCountry: "United States",
    billingSameAsHeadquarters: true,
    organizationPhone: "(555) 567-8901",
    timezone: "(UTC-08:00) Pacific Time (US & Canada)",
    msaDocument: "Firewall_MSA_2023.pdf",
    agreementRenewalDate: "2025-05-22",
    createdAt: "2023-05-22T10:00:00Z",
    updatedAt: "2024-01-22T10:00:00Z",
  },
  {
    id: "msp-006",
    name: "SecureCore MSP",
    logo: "/logos/securecore.png",
    industry: "Technology",
    organizationType: "MSP firm",
    headquartersStreet: "987 Enterprise Way",
    headquartersCity: "Boston",
    headquartersState: "MA",
    headquartersZip: "02101",
    headquartersCountry: "United States",
    billingSameAsHeadquarters: true,
    organizationPhone: "(555) 678-9012",
    timezone: "(UTC-05:00) Eastern Time (US & Canada)",
    msaDocument: "SecureCore_MSA_2023.pdf",
    agreementRenewalDate: "2024-09-01",
    createdAt: "2021-09-01T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "msp-007",
    name: "GlobalTech Solutions",
    logo: "/logos/globaltech.png",
    industry: "Technology",
    organizationType: "MSP firm",
    headquartersStreet: "147 Innovation Rd",
    headquartersCity: "Dallas",
    headquartersState: "TX",
    headquartersZip: "75201",
    headquartersCountry: "United States",
    billingSameAsHeadquarters: true,
    organizationPhone: "(555) 789-0123",
    timezone: "(UTC-06:00) Central Time (US & Canada)",
    msaDocument: "GlobalTech_MSA_2023.pdf",
    agreementRenewalDate: "2024-04-01",
    createdAt: "2020-04-01T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "msp-008",
    name: "Quantum Innovation",
    logo: "/logos/quantum.png",
    industry: "Technology",
    organizationType: "Organization staffing office",
    headquartersStreet: "258 Future St",
    headquartersCity: "Denver",
    headquartersState: "CO",
    headquartersZip: "80201",
    headquartersCountry: "United States",
    billingSameAsHeadquarters: true,
    organizationPhone: "(555) 890-1234",
    timezone: "(UTC-07:00) Mountain Time (US & Canada)",
    msaDocument: "Quantum_MSA_2023.pdf",
    agreementRenewalDate: "2024-08-10",
    createdAt: "2022-08-10T10:00:00Z",
    updatedAt: "2024-01-18T10:00:00Z",
  },
]

const defaultMSPsRecord: Record<string, MSP> = defaultMSPs.reduce(
  (acc, msp) => {
    acc[msp.id] = msp
    return acc
  },
  {} as Record<string, MSP>
)

// Default MSP-Organization relationships
const defaultMSPOrganizations: MSPOrganization[] = [
  {
    id: "mspo-001",
    mspId: "msp-001",
    organizationId: "org-001",
    addendumAgreement: "Addendum_Acme_2023.pdf",
    mspFeePercentage: 5.00,
    sasFeePercentage: 2.00,
    agreementStartDate: "2023-01-15",
    agreementRenewalDate: "2024-01-15",
    possibleCancellationDate: "2023-12-15",
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-01-15T10:00:00Z",
  },
  {
    id: "mspo-002",
    mspId: "msp-001",
    organizationId: "org-002",
    addendumAgreement: "Addendum_Globex_2022.pdf",
    mspFeePercentage: 8.00,
    sasFeePercentage: 3.00,
    agreementStartDate: "2022-11-01",
    agreementRenewalDate: "2023-11-01",
    possibleCancellationDate: "2023-10-01",
    createdAt: "2022-11-01T10:00:00Z",
    updatedAt: "2022-11-01T10:00:00Z",
  },
  {
    id: "mspo-003",
    mspId: "msp-002",
    organizationId: "org-001",
    addendumAgreement: "Addendum_Soylent_2024.pdf",
    mspFeePercentage: 10.00,
    sasFeePercentage: 4.00,
    agreementStartDate: "2024-03-20",
    agreementRenewalDate: "2025-03-20",
    possibleCancellationDate: "2025-02-20",
    createdAt: "2024-03-20T10:00:00Z",
    updatedAt: "2024-03-20T10:00:00Z",
  },
  {
    id: "mspo-004",
    mspId: "msp-002",
    organizationId: "org-002",
    addendumAgreement: "Addendum_Wayne_2023.pdf",
    mspFeePercentage: undefined,
    sasFeePercentage: 1.00,
    agreementStartDate: "2023-07-01",
    agreementRenewalDate: "2024-07-01",
    possibleCancellationDate: "2024-06-01",
    createdAt: "2023-07-01T10:00:00Z",
    updatedAt: "2023-07-01T10:00:00Z",
  },
  {
    id: "mspo-005",
    mspId: "msp-003",
    organizationId: "org-001",
    addendumAgreement: "Addendum_Umbrella_2023.pdf",
    mspFeePercentage: 6.00,
    sasFeePercentage: 2.50,
    agreementStartDate: "2023-04-10",
    agreementRenewalDate: "2024-04-10",
    possibleCancellationDate: "2024-03-10",
    createdAt: "2023-04-10T10:00:00Z",
    updatedAt: "2023-04-10T10:00:00Z",
  },
  // Firewall Security (msp-005) - Seattle, WA
  {
    id: "mspo-006",
    mspId: "msp-005",
    organizationId: "org-001",
    addendumAgreement: "Addendum_Firewall_Nova_2024.pdf",
    mspFeePercentage: 7.50,
    sasFeePercentage: 2.75,
    agreementStartDate: "2024-01-15",
    agreementRenewalDate: "2025-01-15",
    possibleCancellationDate: "2024-12-15",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "mspo-007",
    mspId: "msp-005",
    organizationId: "org-003",
    addendumAgreement: "Addendum_Firewall_Vitality_2024.pdf",
    mspFeePercentage: 6.25,
    sasFeePercentage: 2.25,
    agreementStartDate: "2024-02-01",
    agreementRenewalDate: "2025-02-01",
    possibleCancellationDate: "2025-01-01",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z",
  },
  // Quantum Innovation (msp-008) - Denver, CO
  {
    id: "mspo-008",
    mspId: "msp-008",
    organizationId: "org-002",
    addendumAgreement: "Addendum_Quantum_Memorial_2023.pdf",
    mspFeePercentage: 9.00,
    sasFeePercentage: 3.50,
    agreementStartDate: "2023-09-01",
    agreementRenewalDate: "2024-09-01",
    possibleCancellationDate: "2024-08-01",
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2023-09-01T10:00:00Z",
  },
  {
    id: "mspo-009",
    mspId: "msp-008",
    organizationId: "org-003",
    addendumAgreement: "Addendum_Quantum_Vitality_2024.pdf",
    mspFeePercentage: 8.50,
    sasFeePercentage: 3.00,
    agreementStartDate: "2024-03-15",
    agreementRenewalDate: "2025-03-15",
    possibleCancellationDate: "2025-02-15",
    createdAt: "2024-03-15T10:00:00Z",
    updatedAt: "2024-03-15T10:00:00Z",
  },
  // SecureCore MSP (msp-006) - Boston, MA
  {
    id: "mspo-010",
    mspId: "msp-006",
    organizationId: "org-001",
    addendumAgreement: "Addendum_SecureCore_Nova_2023.pdf",
    mspFeePercentage: 5.75,
    sasFeePercentage: 2.00,
    agreementStartDate: "2023-11-01",
    agreementRenewalDate: "2024-11-01",
    possibleCancellationDate: "2024-10-01",
    createdAt: "2023-11-01T10:00:00Z",
    updatedAt: "2023-11-01T10:00:00Z",
  },
  {
    id: "mspo-011",
    mspId: "msp-006",
    organizationId: "org-002",
    addendumAgreement: "Addendum_SecureCore_Memorial_2024.pdf",
    mspFeePercentage: 6.50,
    sasFeePercentage: 2.25,
    agreementStartDate: "2024-01-10",
    agreementRenewalDate: "2025-01-10",
    possibleCancellationDate: "2024-12-10",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
  },
  // GlobalTech Solutions (msp-007) - Dallas, TX
  {
    id: "mspo-012",
    mspId: "msp-007",
    organizationId: "org-001",
    addendumAgreement: "Addendum_GlobalTech_Nova_2023.pdf",
    mspFeePercentage: 7.00,
    sasFeePercentage: 2.50,
    agreementStartDate: "2023-06-01",
    agreementRenewalDate: "2024-06-01",
    possibleCancellationDate: "2024-05-01",
    createdAt: "2023-06-01T10:00:00Z",
    updatedAt: "2023-06-01T10:00:00Z",
  },
  {
    id: "mspo-013",
    mspId: "msp-007",
    organizationId: "org-003",
    addendumAgreement: "Addendum_GlobalTech_Vitality_2024.pdf",
    mspFeePercentage: 6.75,
    sasFeePercentage: 2.75,
    agreementStartDate: "2024-04-01",
    agreementRenewalDate: "2025-04-01",
    possibleCancellationDate: "2025-03-01",
    createdAt: "2024-04-01T10:00:00Z",
    updatedAt: "2024-04-01T10:00:00Z",
  },
  // BrightStar Network (msp-004) - Chicago, IL
  {
    id: "mspo-014",
    mspId: "msp-004",
    organizationId: "org-002",
    addendumAgreement: "Addendum_BrightStar_Memorial_2023.pdf",
    mspFeePercentage: 8.25,
    sasFeePercentage: 3.25,
    agreementStartDate: "2023-08-15",
    agreementRenewalDate: "2024-08-15",
    possibleCancellationDate: "2024-07-15",
    createdAt: "2023-08-15T10:00:00Z",
    updatedAt: "2023-08-15T10:00:00Z",
  },
  {
    id: "mspo-015",
    mspId: "msp-004",
    organizationId: "org-003",
    addendumAgreement: "Addendum_BrightStar_Vitality_2024.pdf",
    mspFeePercentage: 7.75,
    sasFeePercentage: 3.00,
    agreementStartDate: "2024-05-01",
    agreementRenewalDate: "2025-05-01",
    possibleCancellationDate: "2025-04-01",
    createdAt: "2024-05-01T10:00:00Z",
    updatedAt: "2024-05-01T10:00:00Z",
  },
]

const defaultMSPOrganizationsRecord: Record<string, MSPOrganization> = defaultMSPOrganizations.reduce(
  (acc, mspo) => {
    acc[mspo.id] = mspo
    return acc
  },
  {} as Record<string, MSPOrganization>
)

const defaultAdminLocalDbState: AdminLocalDbState = {
  organizations: defaultOrganizationsRecord,
  occupations: defaultOccupationsRecord,
  occupationQuestionnaires: defaultOccupationQuestionnaires,
  generalQuestionnaire: defaultGeneralQuestionnaire,
  specialties: defaultSpecialtiesRecord,
  occupationSpecialties: defaultOccupationSpecialtiesRecord,
  workforceGroups: defaultWorkforceGroupsRecord,
  complianceListItems: defaultComplianceListItemsRecord,
  adminWalletTemplates: defaultAdminWalletTemplatesRecord,
  taggingRules: {},
  tags: defaultTagsRecord,
  users: defaultUsersRecord,
  portalUsers: defaultPortalUsersRecord,
  portalUserAffiliations: defaultPortalUserAffiliationsRecord,
  portalUserNotes: defaultPortalUserNotesRecord,
  vendors: defaultVendorsRecord,
  vendorUsers: defaultVendorUsersRecord,
  vendorDocuments: defaultVendorDocumentsRecord,
  vendorNotes: defaultVendorNotesRecord,
  vendorOrganizations: defaultVendorOrganizationsRecord,
  msps: defaultMSPsRecord,
  mspOrganizations: defaultMSPOrganizationsRecord,
  lastUpdated: undefined,
}

export const ADMIN_LOCAL_DB_SAFE_DEFAULTS = Object.freeze(defaultAdminLocalDbState)

export function readAdminLocalDb(): AdminLocalDbState {
  if (typeof window === "undefined") {
    return defaultAdminLocalDbState
  }
  try {
    const raw = window.localStorage.getItem(ADMIN_LOCAL_DB_KEY)
    if (!raw) {
      return defaultAdminLocalDbState
    }
    const parsed = JSON.parse(raw) as Partial<AdminLocalDbState>
    
    // Migrate existing data to include departments if missing
    const migratedOrganizations: Record<string, AdminLocalDbOrganizationEntry> = {}
    if (parsed.organizations) {
      Object.values(parsed.organizations).forEach((org) => {
        const migratedLocations = org.locations.map((loc) => {
          // Migrate departments from string[] to Department[]
          let migratedDepartments: Department[] = []
          if (Array.isArray(loc.departments)) {
            if (loc.departments.length > 0 && typeof loc.departments[0] === "string") {
              // Old format: string[]
              migratedDepartments = (loc.departments as string[]).map((deptName, idx) => ({
                id: `dept-${loc.id}-${idx}`,
                name: deptName,
                relatedUsers: [],
                relatedOccupationSpecialties: [],
              }))
            } else {
              // New format: Department[]
              migratedDepartments = loc.departments as Department[]
            }
          }
          return {
            ...loc,
            departments: migratedDepartments,
            locationType: loc.locationType,
            costCentre: loc.costCentre,
            photo: loc.photo,
          }
        })
        migratedOrganizations[org.id] = {
          ...org,
          locations: migratedLocations,
          occupationIds: org.occupationIds || [],
        }
      })
    }
    
    // Merge default questionnaires with existing ones
    // Use existing questionnaires if they exist, otherwise use defaults
    const mergedQuestionnaires = { ...defaultOccupationQuestionnaires }
    if (parsed.occupationQuestionnaires) {
      Object.entries(parsed.occupationQuestionnaires).forEach(([key, value]) => {
        // Migrate questionnaire to include isActive if missing
        const migratedQuestionnaire = {
          ...value,
          isActive: value.isActive !== undefined ? value.isActive : true,
        }
        mergedQuestionnaires[key] = migratedQuestionnaire
      })
    }
    
    // Migrate occupations to include new fields
    const migratedOccupations: Record<string, Occupation> = {}
    if (parsed.occupations) {
      Object.entries(parsed.occupations).forEach(([key, occ]) => {
        migratedOccupations[key] = {
          ...occ,
          industry: occ.industry,
          modality: occ.modality,
          acronym: occ.acronym,
        }
      })
    }
    
    // Migrate specialties to include acronym
    const migratedSpecialties: Record<string, Specialty> = {}
    if (parsed.specialties) {
      Object.entries(parsed.specialties).forEach(([key, spec]) => {
        migratedSpecialties[key] = {
          ...spec,
          acronym: spec.acronym,
        }
      })
    }
    
    // Merge admin wallet templates: use defaults if none exist or empty, otherwise merge with existing (existing takes precedence)
    const existingWalletTemplates = parsed.adminWalletTemplates || {}
    const mergedWalletTemplates = Object.keys(existingWalletTemplates).length > 0
      ? { ...defaultAdminWalletTemplatesRecord, ...existingWalletTemplates }
      : defaultAdminWalletTemplatesRecord
    
    // Merge users: use defaults if none exist or empty, otherwise merge with existing (existing takes precedence)
    const existingUsers = parsed.users || {}
    const mergedUsers = Object.keys(existingUsers).length > 0
      ? { ...defaultUsersRecord, ...existingUsers }
      : defaultUsersRecord
    
    // Merge portal users (Program, Vendor, Organization): use defaults if none exist or empty
    const existingPortalUsers = parsed.portalUsers || {}
    const mergedPortalUsers = Object.keys(existingPortalUsers).length > 0
      ? { ...defaultPortalUsersRecord, ...existingPortalUsers }
      : defaultPortalUsersRecord

    // Merge portal user affiliations
    const existingPortalUserAffiliations = parsed.portalUserAffiliations || {}
    const mergedPortalUserAffiliations = Object.keys(existingPortalUserAffiliations).length > 0
      ? { ...defaultPortalUserAffiliationsRecord, ...existingPortalUserAffiliations }
      : defaultPortalUserAffiliationsRecord

    // Merge portal user notes
    const existingPortalUserNotes = parsed.portalUserNotes || {}
    const mergedPortalUserNotes = Object.keys(existingPortalUserNotes).length > 0
      ? { ...defaultPortalUserNotesRecord, ...existingPortalUserNotes }
      : defaultPortalUserNotesRecord
    
    // Merge tagging rules: use empty if none exist, otherwise use existing
    const mergedTaggingRules = parsed.taggingRules || {}
    
    // Merge tags: use defaults if none exist, otherwise merge with existing (existing takes precedence)
    const existingTags = parsed.tags || {}
    const mergedTags = Object.keys(existingTags).length > 0
      ? { ...defaultTagsRecord, ...existingTags }
      : defaultTagsRecord
    
    // Merge vendors: use defaults if none exist, otherwise merge with existing (existing takes precedence)
    const existingVendors = parsed.vendors || {}
    const mergedVendors = Object.keys(existingVendors).length > 0
      ? { ...defaultVendorsRecord, ...existingVendors }
      : defaultVendorsRecord
    
    // Merge vendor users: use defaults if none exist, otherwise merge with existing (existing takes precedence)
    const existingVendorUsers = parsed.vendorUsers || {}
    const mergedVendorUsers = Object.keys(existingVendorUsers).length > 0
      ? { ...defaultVendorUsersRecord, ...existingVendorUsers }
      : defaultVendorUsersRecord
    
    // Merge vendor documents: use defaults if none exist, otherwise merge with existing (existing takes precedence)
    const existingVendorDocuments = parsed.vendorDocuments || {}
    const mergedVendorDocuments = Object.keys(existingVendorDocuments).length > 0
      ? { ...defaultVendorDocumentsRecord, ...existingVendorDocuments }
      : defaultVendorDocumentsRecord
    
    // Merge vendor notes: use defaults if none exist, otherwise merge with existing (existing takes precedence)
    const existingVendorNotes = parsed.vendorNotes || {}
    const mergedVendorNotes = Object.keys(existingVendorNotes).length > 0
      ? { ...defaultVendorNotesRecord, ...existingVendorNotes }
      : defaultVendorNotesRecord

    // Merge vendor organizations: use defaults if none exist, otherwise merge with existing (existing takes precedence)
    const existingVendorOrganizations = parsed.vendorOrganizations || {}
    const mergedVendorOrganizations = Object.keys(existingVendorOrganizations).length > 0
      ? { ...defaultVendorOrganizationsRecord, ...existingVendorOrganizations }
      : defaultVendorOrganizationsRecord

    const mergedState: AdminLocalDbState = {
      organizations: Object.keys(migratedOrganizations).length > 0 ? migratedOrganizations : defaultOrganizationsRecord,
      occupations: Object.keys(migratedOccupations).length > 0 ? migratedOccupations : defaultOccupationsRecord,
      occupationQuestionnaires: mergedQuestionnaires,
      generalQuestionnaire: parsed.generalQuestionnaire ?? defaultGeneralQuestionnaire,
      specialties: Object.keys(migratedSpecialties).length > 0 ? migratedSpecialties : defaultSpecialtiesRecord,
      occupationSpecialties: parsed.occupationSpecialties || defaultOccupationSpecialtiesRecord,
      workforceGroups: parsed.workforceGroups || defaultWorkforceGroupsRecord,
      complianceListItems: parsed.complianceListItems || defaultComplianceListItemsRecord,
      adminWalletTemplates: mergedWalletTemplates,
      taggingRules: mergedTaggingRules,
      tags: mergedTags,
      users: mergedUsers,
      portalUsers: mergedPortalUsers,
      portalUserAffiliations: mergedPortalUserAffiliations,
      portalUserNotes: mergedPortalUserNotes,
      vendors: mergedVendors,
      vendorUsers: mergedVendorUsers,
      vendorDocuments: mergedVendorDocuments,
      vendorNotes: mergedVendorNotes,
      vendorOrganizations: mergedVendorOrganizations,
      msps: parsed.msps || defaultMSPsRecord,
      mspOrganizations: parsed.mspOrganizations || defaultMSPOrganizationsRecord,
      lastUpdated: parsed.lastUpdated,
    }
    
    // If we merged defaults (because existing was empty), persist the merged state
    if (
      Object.keys(existingWalletTemplates).length === 0 ||
      Object.keys(existingUsers).length === 0 ||
      Object.keys(existingPortalUsers).length === 0 ||
      Object.keys(existingPortalUserAffiliations).length === 0 ||
      Object.keys(existingPortalUserNotes).length === 0
    ) {
      persistAdminLocalDb(mergedState)
    }
    
    return mergedState
  } catch (error) {
    console.warn("Unable to parse admin local DB state", error)
    return defaultAdminLocalDbState
  }
}

export function persistAdminLocalDb(next: AdminLocalDbState) {
  if (typeof window === "undefined") {
    return
  }
  try {
    const stateWithTimestamp = {
      ...next,
      lastUpdated: new Date().toISOString(),
    }
    window.localStorage.setItem(ADMIN_LOCAL_DB_KEY, JSON.stringify(stateWithTimestamp))
  } catch (error) {
    console.warn("Unable to persist admin local DB state", error)
  }
}

// Helper functions for organizations
export function getAllOrganizations(): AdminLocalDbOrganizationEntry[] {
  const state = readAdminLocalDb()
  return Object.values(state.organizations)
}

export function getOrganizationById(id: string): AdminLocalDbOrganizationEntry | null {
  const state = readAdminLocalDb()
  return state.organizations[id] || null
}

export function getOrganizationByEmail(email: string): AdminLocalDbOrganizationEntry | null {
  const state = readAdminLocalDb()
  const normalizedEmail = email.toLowerCase().trim()
  return Object.values(state.organizations).find((org) => org.email.toLowerCase().trim() === normalizedEmail) || null
}

export function addOrganization(
  organization: Omit<AdminLocalDbOrganizationEntry, "id" | "createdAt" | "updatedAt">,
): AdminLocalDbOrganizationEntry {
  const state = readAdminLocalDb()
  const newOrg: AdminLocalDbOrganizationEntry = {
    ...organization,
    id: `org-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    organizations: {
      ...state.organizations,
      [newOrg.id]: newOrg,
    },
  }
  persistAdminLocalDb(updatedState)
  return newOrg
}

export function updateOrganization(
  id: string,
  updates: Partial<Omit<AdminLocalDbOrganizationEntry, "id" | "createdAt">>,
): AdminLocalDbOrganizationEntry | null {
  const state = readAdminLocalDb()
  const existing = state.organizations[id]
  if (!existing) {
    return null
  }
  const updatedOrg: AdminLocalDbOrganizationEntry = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    organizations: {
      ...state.organizations,
      [id]: updatedOrg,
    },
  }
  persistAdminLocalDb(updatedState)
  return updatedOrg
}

export function deleteOrganization(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.organizations[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.organizations
  const updatedState: AdminLocalDbState = {
    ...state,
    organizations: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for organization occupations
export function getOrganizationOccupations(organizationId: string): Occupation[] {
  const state = readAdminLocalDb()
  const org = state.organizations[organizationId]
  if (!org || !org.occupationIds || org.occupationIds.length === 0) {
    return []
  }
  return org.occupationIds
    .map((occId) => state.occupations[occId])
    .filter((occ): occ is Occupation => occ !== undefined)
}

export function updateOrganizationOccupations(organizationId: string, occupationIds: string[]): boolean {
  const state = readAdminLocalDb()
  const org = state.organizations[organizationId]
  if (!org) {
    return false
  }
  const updatedOrg = updateOrganization(organizationId, { occupationIds })
  return updatedOrg !== null
}

// Helper functions for locations
export function getAllLocations(): Array<AdminLocalDbOrganizationLocation & { organizationId: string; organizationName: string }> {
  const state = readAdminLocalDb()
  const allLocations: Array<AdminLocalDbOrganizationLocation & { organizationId: string; organizationName: string }> = []
  
  Object.values(state.organizations).forEach((org) => {
    org.locations.forEach((location) => {
      allLocations.push({
        ...location,
        organizationId: org.id,
        organizationName: org.name,
      })
    })
  })
  
  return allLocations
}

export function getLocationById(locationId: string): (AdminLocalDbOrganizationLocation & { organizationId: string; organizationName: string }) | null {
  const state = readAdminLocalDb()
  
  for (const org of Object.values(state.organizations)) {
    const location = org.locations.find((loc) => loc.id === locationId)
    if (location) {
      return {
        ...location,
        organizationId: org.id,
        organizationName: org.name,
      }
    }
  }
  
  return null
}

// Helper functions for departments
export function addDepartment(
  locationId: string,
  department: Omit<Department, "id">,
): boolean {
  const state = readAdminLocalDb()
  
  for (const orgId in state.organizations) {
    const org = state.organizations[orgId]
    const locationIndex = org.locations.findIndex((loc) => loc.id === locationId)
    
    if (locationIndex !== -1) {
      const location = org.locations[locationIndex]
      
      // Check if department with same name already exists
      if (location.departments.some((dept) => dept.name === department.name)) {
        return false
      }
      
      // Add department with generated ID
      const newDepartment: Department = {
        ...department,
        id: `dept-${locationId}-${Date.now()}`,
      }
      
      const updatedLocation = {
        ...location,
        departments: [...location.departments, newDepartment],
      }
      
      const updatedLocations = [...org.locations]
      updatedLocations[locationIndex] = updatedLocation
      
      const updatedOrg = {
        ...org,
        locations: updatedLocations,
        updatedAt: new Date().toISOString(),
      }
      
      const updatedState: AdminLocalDbState = {
        ...state,
        organizations: {
          ...state.organizations,
          [orgId]: updatedOrg,
        },
      }
      
      persistAdminLocalDb(updatedState)
      return true
    }
  }
  
  return false
}

export function removeDepartment(locationId: string, deptId: string): boolean {
  const state = readAdminLocalDb()
  
  for (const orgId in state.organizations) {
    const org = state.organizations[orgId]
    const locationIndex = org.locations.findIndex((loc) => loc.id === locationId)
    
    if (locationIndex !== -1) {
      const location = org.locations[locationIndex]
      
      // Remove department by ID
      const updatedLocation = {
        ...location,
        departments: location.departments.filter((dept) => dept.id !== deptId),
      }
      
      const updatedLocations = [...org.locations]
      updatedLocations[locationIndex] = updatedLocation
      
      const updatedOrg = {
        ...org,
        locations: updatedLocations,
        updatedAt: new Date().toISOString(),
      }
      
      const updatedState: AdminLocalDbState = {
        ...state,
        organizations: {
          ...state.organizations,
          [orgId]: updatedOrg,
        },
      }
      
      persistAdminLocalDb(updatedState)
      return true
    }
  }
  
  return false
}

export function updateDepartment(locationId: string, deptId: string, updates: Partial<Department>): boolean {
  const state = readAdminLocalDb()
  
  for (const orgId in state.organizations) {
    const org = state.organizations[orgId]
    const locationIndex = org.locations.findIndex((loc) => loc.id === locationId)
    
    if (locationIndex !== -1) {
      const location = org.locations[locationIndex]
      const deptIndex = location.departments.findIndex((dept) => dept.id === deptId)
      
      if (deptIndex === -1) {
        return false
      }
      
      // Check if new name conflicts with existing department
      if (updates.name && updates.name !== location.departments[deptIndex].name) {
        if (location.departments.some((dept, idx) => idx !== deptIndex && dept.name === updates.name)) {
          return false
        }
      }
      
      // Update department
      const updatedDepartments = [...location.departments]
      updatedDepartments[deptIndex] = {
        ...updatedDepartments[deptIndex],
        ...updates,
        id: deptId, // Ensure ID doesn't change
      }
      
      const updatedLocation = {
        ...location,
        departments: updatedDepartments,
      }
      
      const updatedLocations = [...org.locations]
      updatedLocations[locationIndex] = updatedLocation
      
      const updatedOrg = {
        ...org,
        locations: updatedLocations,
        updatedAt: new Date().toISOString(),
      }
      
      const updatedState: AdminLocalDbState = {
        ...state,
        organizations: {
          ...state.organizations,
          [orgId]: updatedOrg,
        },
      }
      
      persistAdminLocalDb(updatedState)
      return true
    }
  }
  
  return false
}

// Helper function to get all unique departments from all locations
export function getAllDepartments(): Department[] {
  const locations = getAllLocations()
  const departmentsMap = new Map<string, Department>()
  
  locations.forEach((location) => {
    location.departments.forEach((dept) => {
      departmentsMap.set(dept.id, dept)
    })
  })
  
  return Array.from(departmentsMap.values())
}

// Helper functions for specialties
export function getAllSpecialties(): Specialty[] {
  const state = readAdminLocalDb()
  return Object.values(state.specialties).filter((spec) => spec.isActive)
}

export function getAllSpecialtiesAdmin(): Specialty[] {
  const state = readAdminLocalDb()
  return Object.values(state.specialties)
}

export function getSpecialtyById(id: string): Specialty | null {
  const state = readAdminLocalDb()
  return state.specialties[id] || null
}

export function addSpecialty(specialty: Omit<Specialty, "id" | "createdAt" | "updatedAt">): Specialty {
  const state = readAdminLocalDb()
  const newSpec: Specialty = {
    ...specialty,
    id: `spec-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    specialties: {
      ...state.specialties,
      [newSpec.id]: newSpec,
    },
  }
  persistAdminLocalDb(updatedState)
  return newSpec
}

export function updateSpecialty(id: string, updates: Partial<Omit<Specialty, "id" | "createdAt">>): Specialty | null {
  const state = readAdminLocalDb()
  const existing = state.specialties[id]
  if (!existing) {
    return null
  }
  const updatedSpec: Specialty = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    specialties: {
      ...state.specialties,
      [id]: updatedSpec,
    },
  }
  persistAdminLocalDb(updatedState)
  return updatedSpec
}

export function deleteSpecialty(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.specialties[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.specialties
  const updatedState: AdminLocalDbState = {
    ...state,
    specialties: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper function to get specialties grouped by group
export function getSpecialtiesGroupedByGroup(): Record<string, Specialty[]> {
  const specialties = getAllSpecialtiesAdmin()
  const grouped: Record<string, Specialty[]> = {}
  
  specialties.forEach((spec) => {
    const group = spec.group || "Other"
    if (!grouped[group]) {
      grouped[group] = []
    }
    grouped[group].push(spec)
  })
  
  // Sort specialties within each group by name
  Object.keys(grouped).forEach((group) => {
    grouped[group].sort((a, b) => a.name.localeCompare(b.name))
  })
  
  return grouped
}

// Helper function to get all unique group names
export function getAllSpecialtyGroups(): string[] {
  const specialties = getAllSpecialtiesAdmin()
  const groups = new Set<string>()
  
  specialties.forEach((spec) => {
    if (spec.group) {
      groups.add(spec.group)
    }
  })
  
  return Array.from(groups).sort()
}

// Helper function to get specialties by group
export function getSpecialtiesByGroup(group: string): Specialty[] {
  const specialties = getAllSpecialtiesAdmin()
  return specialties
    .filter((spec) => (spec.group || "Other") === group)
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Helper functions for occupation-specialties
export function getAllOccupationSpecialties(): OccupationSpecialty[] {
  const state = readAdminLocalDb()
  return Object.values(state.occupationSpecialties)
}

export function getOccupationSpecialtiesByOccupation(occupationId: string): OccupationSpecialty[] {
  const state = readAdminLocalDb()
  return Object.values(state.occupationSpecialties).filter((occSpec) => occSpec.occupationId === occupationId)
}

export function getOccupationSpecialtyById(id: string): OccupationSpecialty | null {
  const state = readAdminLocalDb()
  return state.occupationSpecialties[id] || null
}

export function addOccupationSpecialty(occupationId: string, specialtyId: string): OccupationSpecialty | null {
  const state = readAdminLocalDb()
  
  // Check if occupation and specialty exist
  const occupation = state.occupations[occupationId]
  const specialty = state.specialties[specialtyId]
  
  if (!occupation || !specialty) {
    return null
  }
  
  // Check if relationship already exists
  const existing = Object.values(state.occupationSpecialties).find(
    (occSpec) => occSpec.occupationId === occupationId && occSpec.specialtyId === specialtyId
  )
  if (existing) {
    return existing
  }
  
  const newOccSpec: OccupationSpecialty = {
    id: `occ-spec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    occupationId,
    specialtyId,
    displayName: `${occupation.name} - ${specialty.name}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  const updatedState: AdminLocalDbState = {
    ...state,
    occupationSpecialties: {
      ...state.occupationSpecialties,
      [newOccSpec.id]: newOccSpec,
    },
  }
  persistAdminLocalDb(updatedState)
  return newOccSpec
}

export function removeOccupationSpecialty(occupationId: string, specialtyId: string): boolean {
  const state = readAdminLocalDb()
  
  const occSpec = Object.values(state.occupationSpecialties).find(
    (os) => os.occupationId === occupationId && os.specialtyId === specialtyId
  )
  
  if (!occSpec) {
    return false
  }
  
  const { [occSpec.id]: removed, ...remaining } = state.occupationSpecialties
  const updatedState: AdminLocalDbState = {
    ...state,
    occupationSpecialties: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

export function deleteOccupationSpecialtyById(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.occupationSpecialties[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.occupationSpecialties
  const updatedState: AdminLocalDbState = {
    ...state,
    occupationSpecialties: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for workforce groups
export function getAllWorkforceGroups(): WorkforceGroup[] {
  const state = readAdminLocalDb()
  return Object.values(state.workforceGroups).sort((a, b) => {
    // Sort by modality first, then by routing position
    if (a.modality !== b.modality) {
      return a.modality.localeCompare(b.modality)
    }
    return a.routingPosition - b.routingPosition
  })
}

export function getWorkforceGroupById(id: string): WorkforceGroup | null {
  const state = readAdminLocalDb()
  return state.workforceGroups[id] || null
}

export function addWorkforceGroup(group: Omit<WorkforceGroup, "id" | "createdAt" | "updatedAt">): WorkforceGroup {
  const state = readAdminLocalDb()
  const newGroup: WorkforceGroup = {
    ...group,
    id: `wf-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    workforceGroups: {
      ...state.workforceGroups,
      [newGroup.id]: newGroup,
    },
  }
  persistAdminLocalDb(updatedState)
  return newGroup
}

export function updateWorkforceGroup(id: string, updates: Partial<Omit<WorkforceGroup, "id" | "createdAt">>): WorkforceGroup | null {
  const state = readAdminLocalDb()
  const existing = state.workforceGroups[id]
  if (!existing) {
    return null
  }
  const updatedGroup: WorkforceGroup = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    workforceGroups: {
      ...state.workforceGroups,
      [id]: updatedGroup,
    },
  }
  persistAdminLocalDb(updatedState)
  return updatedGroup
}

export function deleteWorkforceGroup(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.workforceGroups[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.workforceGroups
  const updatedState: AdminLocalDbState = {
    ...state,
    workforceGroups: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for compliance list items
export function getAllComplianceListItems(): ComplianceListItem[] {
  const state = readAdminLocalDb()
  return Object.values(state.complianceListItems).sort((a, b) => {
    // Sort by category first, then by name
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    return a.name.localeCompare(b.name)
  })
}

export function getComplianceListItemsByCategory(category: ComplianceListItem["category"]): ComplianceListItem[] {
  const state = readAdminLocalDb()
  return Object.values(state.complianceListItems)
    .filter((item) => item.category === category)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getComplianceListItemById(id: string): ComplianceListItem | null {
  const state = readAdminLocalDb()
  return state.complianceListItems[id] || null
}

export function addComplianceListItem(item: Omit<ComplianceListItem, "id" | "createdAt" | "updatedAt">): ComplianceListItem {
  const state = readAdminLocalDb()
  const newItem: ComplianceListItem = {
    ...item,
    id: `cli-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    complianceListItems: {
      ...state.complianceListItems,
      [newItem.id]: newItem,
    },
  }
  persistAdminLocalDb(updatedState)
  return newItem
}

export function updateComplianceListItem(id: string, updates: Partial<Omit<ComplianceListItem, "id" | "createdAt">>): ComplianceListItem | null {
  const state = readAdminLocalDb()
  const existing = state.complianceListItems[id]
  if (!existing) {
    return null
  }
  const updatedItem: ComplianceListItem = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    complianceListItems: {
      ...state.complianceListItems,
      [id]: updatedItem,
    },
  }
  persistAdminLocalDb(updatedState)
  return updatedItem
}

export function deleteComplianceListItem(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.complianceListItems[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.complianceListItems
  const updatedState: AdminLocalDbState = {
    ...state,
    complianceListItems: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for occupations
export function getAllOccupations(): Occupation[] {
  const state = readAdminLocalDb()
  return Object.values(state.occupations).sort((a, b) => a.name.localeCompare(b.name))
}

export function getActiveOccupations(): Occupation[] {
  return getAllOccupations().filter((occ) => occ.isActive)
}

export function getOccupationById(id: string): Occupation | null {
  const state = readAdminLocalDb()
  return state.occupations[id] || null
}

export function getOccupationByCode(code: string): Occupation | null {
  const state = readAdminLocalDb()
  return Object.values(state.occupations).find((occ) => occ.code === code) || null
}

export function addOccupation(occupation: Omit<Occupation, "id" | "createdAt" | "updatedAt">): Occupation {
  const state = readAdminLocalDb()
  const newOcc: Occupation = {
    ...occupation,
    id: `occ-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    occupations: {
      ...state.occupations,
      [newOcc.id]: newOcc,
    },
  }
  persistAdminLocalDb(updatedState)
  return newOcc
}

export function updateOccupation(id: string, updates: Partial<Omit<Occupation, "id" | "createdAt">>): Occupation | null {
  const state = readAdminLocalDb()
  const existing = state.occupations[id]
  if (!existing) {
    return null
  }
  const updatedOcc: Occupation = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    occupations: {
      ...state.occupations,
      [id]: updatedOcc,
    },
  }
  persistAdminLocalDb(updatedState)
  return updatedOcc
}

export function deleteOccupation(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.occupations[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.occupations
  const updatedState: AdminLocalDbState = {
    ...state,
    occupations: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for occupation questionnaires
export function getQuestionnaireByOccupationId(occupationId: string): OccupationQuestionnaire | null {
  const state = readAdminLocalDb()
  return Object.values(state.occupationQuestionnaires).find((q) => q.occupationId === occupationId) || null
}

export function addOrUpdateQuestionnaire(questionnaire: Omit<OccupationQuestionnaire, "id" | "createdAt" | "updatedAt">): OccupationQuestionnaire {
  const state = readAdminLocalDb()
  
  // Check if questionnaire already exists for this occupation
  const existing = Object.values(state.occupationQuestionnaires).find((q) => q.occupationId === questionnaire.occupationId)
  
  if (existing) {
    // Update existing - default isActive to true if not provided
    const updated: OccupationQuestionnaire = {
      ...existing,
      ...questionnaire,
      isActive: questionnaire.isActive !== undefined ? questionnaire.isActive : existing.isActive,
      updatedAt: new Date().toISOString(),
    }
    const updatedState: AdminLocalDbState = {
      ...state,
      occupationQuestionnaires: {
        ...state.occupationQuestionnaires,
        [existing.id]: updated,
      },
    }
    persistAdminLocalDb(updatedState)
    return updated
  } else {
    // Create new - default isActive to true
    const newQuestionnaire: OccupationQuestionnaire = {
      ...questionnaire,
      isActive: questionnaire.isActive !== undefined ? questionnaire.isActive : true,
      id: `q-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updatedState: AdminLocalDbState = {
      ...state,
      occupationQuestionnaires: {
        ...state.occupationQuestionnaires,
        [newQuestionnaire.id]: newQuestionnaire,
      },
    }
    persistAdminLocalDb(updatedState)
    return newQuestionnaire
  }
}

export function deleteQuestionnaire(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.occupationQuestionnaires[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.occupationQuestionnaires
  const updatedState: AdminLocalDbState = {
    ...state,
    occupationQuestionnaires: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for general questionnaire
export function getGeneralQuestionnaire(): GeneralQuestionnaire | null {
  const state = readAdminLocalDb()
  return state.generalQuestionnaire
}

export function addOrUpdateGeneralQuestionnaire(questionnaire: Omit<GeneralQuestionnaire, "id" | "createdAt" | "updatedAt">): GeneralQuestionnaire {
  const state = readAdminLocalDb()
  
  if (state.generalQuestionnaire) {
    // Update existing
    const updated: GeneralQuestionnaire = {
      ...state.generalQuestionnaire,
      ...questionnaire,
      updatedAt: new Date().toISOString(),
    }
    const updatedState: AdminLocalDbState = {
      ...state,
      generalQuestionnaire: updated,
    }
    persistAdminLocalDb(updatedState)
    return updated
  } else {
    // Create new
    const newQuestionnaire: GeneralQuestionnaire = {
      ...questionnaire,
      id: `gen-q-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updatedState: AdminLocalDbState = {
      ...state,
      generalQuestionnaire: newQuestionnaire,
    }
    persistAdminLocalDb(updatedState)
    return newQuestionnaire
  }
}

export function deleteGeneralQuestionnaire(): boolean {
  const state = readAdminLocalDb()
  if (!state.generalQuestionnaire) {
    return false
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    generalQuestionnaire: null,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for admin wallet templates
export function getAllAdminWalletTemplates(): AdminWalletTemplate[] {
  const state = readAdminLocalDb()
  return Object.values(state.adminWalletTemplates).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getAdminWalletTemplateById(id: string): AdminWalletTemplate | null {
  const state = readAdminLocalDb()
  return state.adminWalletTemplates[id] || null
}

export function getAdminWalletTemplatesByOccupation(occupationCode: string): AdminWalletTemplate[] {
  const state = readAdminLocalDb()
  return Object.values(state.adminWalletTemplates).filter(
    (template) => template.occupationCode === occupationCode && template.isActive
  )
}

export function getAdminWalletTemplatesByOccupationAndSpecialty(
  occupationCode: string,
  specialtyCode?: string
): AdminWalletTemplate[] {
  const state = readAdminLocalDb()
  return Object.values(state.adminWalletTemplates).filter((template) => {
    if (!template.isActive || template.occupationCode !== occupationCode) {
      return false
    }
    if (specialtyCode) {
      return template.specialtyCode === specialtyCode
    }
    // If no specialty specified, return templates without specialty or with any specialty
    return true
  })
}

export function addAdminWalletTemplate(
  template: Omit<AdminWalletTemplate, "id" | "createdAt" | "updatedAt">
): AdminWalletTemplate {
  const state = readAdminLocalDb()
  
  // Get occupation code if occupationId is provided
  let occupationCode = template.occupationCode
  if (!occupationCode && template.occupationId) {
    const occupation = state.occupations[template.occupationId]
    if (occupation) {
      occupationCode = occupation.code
    }
  }
  
  // Get specialty code if specialtyId is provided
  let specialtyCode = template.specialtyCode
  if (!specialtyCode && template.specialtyId) {
    const specialty = state.specialties[template.specialtyId]
    if (specialty) {
      specialtyCode = specialty.code
    }
  }
  
  const newTemplate: AdminWalletTemplate = {
    ...template,
    occupationCode,
    specialtyCode,
    id: `awt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  const updatedState: AdminLocalDbState = {
    ...state,
    adminWalletTemplates: {
      ...state.adminWalletTemplates,
      [newTemplate.id]: newTemplate,
    },
  }
  persistAdminLocalDb(updatedState)
  return newTemplate
}

export function updateAdminWalletTemplate(
  id: string,
  updates: Partial<Omit<AdminWalletTemplate, "id" | "createdAt">>
): AdminWalletTemplate | null {
  const state = readAdminLocalDb()
  const existing = state.adminWalletTemplates[id]
  if (!existing) {
    return null
  }
  
  // Update occupation code if occupationId changed
  let occupationCode = updates.occupationCode ?? existing.occupationCode
  if (updates.occupationId !== undefined) {
    if (updates.occupationId) {
      const occupation = state.occupations[updates.occupationId]
      if (occupation) {
        occupationCode = occupation.code
      }
    } else {
      occupationCode = undefined
    }
  }
  
  // Update specialty code if specialtyId changed
  let specialtyCode = updates.specialtyCode ?? existing.specialtyCode
  if (updates.specialtyId !== undefined) {
    if (updates.specialtyId) {
      const specialty = state.specialties[updates.specialtyId]
      if (specialty) {
        specialtyCode = specialty.code
      }
    } else {
      specialtyCode = undefined
    }
  }
  
  const updatedTemplate: AdminWalletTemplate = {
    ...existing,
    ...updates,
    occupationCode,
    specialtyCode,
    updatedAt: new Date().toISOString(),
  }
  
  const updatedState: AdminLocalDbState = {
    ...state,
    adminWalletTemplates: {
      ...state.adminWalletTemplates,
      [id]: updatedTemplate,
    },
  }
  persistAdminLocalDb(updatedState)
  return updatedTemplate
}

export function deleteAdminWalletTemplate(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.adminWalletTemplates[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.adminWalletTemplates
  const updatedState: AdminLocalDbState = {
    ...state,
    adminWalletTemplates: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

export function addAdminWalletTemplateListItem(templateId: string, listItemId: string): boolean {
  const state = readAdminLocalDb()
  const template = state.adminWalletTemplates[templateId]
  if (!template) {
    return false
  }
  
  // Check if item already exists
  if (template.listItemIds.includes(listItemId)) {
    return false
  }
  
  // Verify list item exists
  if (!state.complianceListItems[listItemId]) {
    return false
  }
  
  const updatedTemplate: AdminWalletTemplate = {
    ...template,
    listItemIds: [...template.listItemIds, listItemId],
    updatedAt: new Date().toISOString(),
  }
  
  const updatedState: AdminLocalDbState = {
    ...state,
    adminWalletTemplates: {
      ...state.adminWalletTemplates,
      [templateId]: updatedTemplate,
    },
  }
  persistAdminLocalDb(updatedState)
  return true
}

export function removeAdminWalletTemplateListItem(templateId: string, listItemId: string): boolean {
  const state = readAdminLocalDb()
  const template = state.adminWalletTemplates[templateId]
  if (!template) {
    return false
  }
  
  const updatedTemplate: AdminWalletTemplate = {
    ...template,
    listItemIds: template.listItemIds.filter((id) => id !== listItemId),
    updatedAt: new Date().toISOString(),
  }
  
  const updatedState: AdminLocalDbState = {
    ...state,
    adminWalletTemplates: {
      ...state.adminWalletTemplates,
      [templateId]: updatedTemplate,
    },
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for Tagging Rules
export function getAllTaggingRules(): TaggingRule[] {
  const state = readAdminLocalDb()
  return Object.values(state.taggingRules)
}

export function getTaggingRuleById(id: string): TaggingRule | null {
  const state = readAdminLocalDb()
  return state.taggingRules[id] || null
}

export function addTaggingRule(
  rule: Omit<TaggingRule, "id" | "createdAt" | "updatedAt">,
): TaggingRule {
  const state = readAdminLocalDb()
  const newRule: TaggingRule = {
    ...rule,
    id: `tag-rule-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    taggingRules: {
      ...state.taggingRules,
      [newRule.id]: newRule,
    },
  }
  persistAdminLocalDb(updatedState)
  return newRule
}

export function updateTaggingRule(
  id: string,
  updates: Partial<Omit<TaggingRule, "id" | "createdAt">>,
): TaggingRule | null {
  const state = readAdminLocalDb()
  const existing = state.taggingRules[id]
  if (!existing) {
    return null
  }
  const updated: TaggingRule = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    taggingRules: {
      ...state.taggingRules,
      [id]: updated,
    },
  }
  persistAdminLocalDb(updatedState)
  return updated
}

export function deleteTaggingRule(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.taggingRules[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.taggingRules
  const updatedState: AdminLocalDbState = {
    ...state,
    taggingRules: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for Users
export function getAllUsers(): User[] {
  const state = readAdminLocalDb()
  return Object.values(state.users)
}

export function getUserById(id: string): User | null {
  const state = readAdminLocalDb()
  return state.users[id] || null
}

export function getUserByEmail(email: string): User | null {
  const state = readAdminLocalDb()
  const normalizedEmail = email.toLowerCase().trim()
  return Object.values(state.users).find((user) => user.email.toLowerCase().trim() === normalizedEmail) || null
}

export function addUser(
  user: Omit<User, "id" | "createdAt" | "updatedAt" | "tags">,
): User {
  const state = readAdminLocalDb()
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    users: {
      ...state.users,
      [newUser.id]: newUser,
    },
  }
  persistAdminLocalDb(updatedState)
  return newUser
}

export function updateUser(
  id: string,
  updates: Partial<Omit<User, "id" | "createdAt">>,
): User | null {
  const state = readAdminLocalDb()
  const existing = state.users[id]
  if (!existing) {
    return null
  }
  const updated: User = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    users: {
      ...state.users,
      [id]: updated,
    },
  }
  persistAdminLocalDb(updatedState)
  return updated
}

export function deleteUser(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.users[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.users
  const updatedState: AdminLocalDbState = {
    ...state,
    users: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

export function addTagToUser(userId: string, tag: string): boolean {
  const state = readAdminLocalDb()
  const user = state.users[userId]
  if (!user) {
    return false
  }
  if (user.tags.includes(tag)) {
    return false // Tag already exists
  }
  const updated: User = {
    ...user,
    tags: [...user.tags, tag],
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    users: {
      ...state.users,
      [userId]: updated,
    },
  }
  persistAdminLocalDb(updatedState)
  return true
}

export function removeTagFromUser(userId: string, tag: string): boolean {
  const state = readAdminLocalDb()
  const user = state.users[userId]
  if (!user) {
    return false
  }
  const updated: User = {
    ...user,
    tags: user.tags.filter((t) => t !== tag),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    users: {
      ...state.users,
      [userId]: updated,
    },
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for Tags
export function getAllTags(): Tag[] {
  const state = readAdminLocalDb()
  return Object.values(state.tags)
}

export function getTagById(id: string): Tag | null {
  const state = readAdminLocalDb()
  return state.tags[id] || null
}

export function addTag(tag: Omit<Tag, "id" | "createdAt" | "updatedAt">): Tag {
  const state = readAdminLocalDb()
  const newTag: Tag = {
    ...tag,
    id: `tag-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    tags: {
      ...state.tags,
      [newTag.id]: newTag,
    },
  }
  persistAdminLocalDb(updatedState)
  return newTag
}

export function updateTag(id: string, updates: Partial<Omit<Tag, "id" | "createdAt">>): Tag | null {
  const state = readAdminLocalDb()
  const existing = state.tags[id]
  if (!existing) {
    return null
  }
  const updated: Tag = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    tags: {
      ...state.tags,
      [id]: updated,
    },
  }
  persistAdminLocalDb(updatedState)
  return updated
}

export function deleteTag(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.tags[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.tags
  const updatedState: AdminLocalDbState = {
    ...state,
    tags: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

export function getTagByName(name: string): Tag | null {
  const state = readAdminLocalDb()
  return Object.values(state.tags).find((tag) => tag.name === name) || null
}

export function getTagsByTaskType(taskType: string): Tag[] {
  const state = readAdminLocalDb()
  return Object.values(state.tags).filter((tag) => tag.taskType === taskType)
}

export function getActiveTags(): Tag[] {
  const state = readAdminLocalDb()
  return Object.values(state.tags).filter((tag) => tag.isActive)
}

// Get tags that are referenced by users
export function getTagsUsedByUsers(): Tag[] {
  const state = readAdminLocalDb()
  const usedTagNames = new Set<string>()
  Object.values(state.users).forEach((user) => {
    user.tags.forEach((tagName) => usedTagNames.add(tagName))
  })
  return Object.values(state.tags).filter((tag) => usedTagNames.has(tag.name))
}

// Get tags that are referenced by tagging rules
export function getTagsUsedByTaggingRules(): Tag[] {
  const state = readAdminLocalDb()
  const usedTagIds = new Set<string>()
  const usedTagNames = new Set<string>()
  Object.values(state.taggingRules).forEach((rule) => {
    if (rule.tagId) {
      usedTagIds.add(rule.tagId)
    }
    if (rule.tagToApply) {
      usedTagNames.add(rule.tagToApply)
    }
  })
  return Object.values(state.tags).filter(
    (tag) => usedTagIds.has(tag.id) || usedTagNames.has(tag.name)
  )
}

// Validate if a tag can be deleted (not used by other entities)
export function canDeleteTag(id: string): { canDelete: boolean; reason?: string } {
  const state = readAdminLocalDb()
  const tag = state.tags[id]
  if (!tag) {
    return { canDelete: false, reason: "Tag not found" }
  }

  // Check if used by users
  const usedByUsers = Object.values(state.users).some((user) => user.tags.includes(tag.name))
  if (usedByUsers) {
    return { canDelete: false, reason: "Tag is used by one or more users" }
  }

  // Check if used by tagging rules
  const usedByRules = Object.values(state.taggingRules).some(
    (rule) => rule.tagId === id || rule.tagToApply === tag.name
  )
  if (usedByRules) {
    return { canDelete: false, reason: "Tag is used by one or more tagging rules" }
  }

  return { canDelete: true }
}

// Update user tags to use tag IDs (migration helper)
export function migrateUserTagsToTagIds(): void {
  const state = readAdminLocalDb()
  const updatedUsers: Record<string, User> = {}
  let hasChanges = false

  Object.values(state.users).forEach((user) => {
    const updatedTagNames: string[] = []
    user.tags.forEach((tagName) => {
      const tag = getTagByName(tagName)
      if (tag) {
        updatedTagNames.push(tag.name) // Keep using names for now, but could migrate to IDs
      }
    })
    if (updatedTagNames.length !== user.tags.length) {
      updatedUsers[user.id] = { ...user, tags: updatedTagNames }
      hasChanges = true
    }
  })

  if (hasChanges) {
    const updatedState: AdminLocalDbState = {
      ...state,
      users: { ...state.users, ...updatedUsers },
    }
    persistAdminLocalDb(updatedState)
  }
}

// Helper functions for vendors
export function getAllVendors(): Vendor[] {
  const state = readAdminLocalDb()
  return Object.values(state.vendors).sort((a, b) => a.name.localeCompare(b.name))
}

export function getVendorById(id: string): Vendor | null {
  const state = readAdminLocalDb()
  return state.vendors[id] || null
}

export function addVendor(vendor: Omit<Vendor, "id" | "createdAt" | "updatedAt">): Vendor {
  const state = readAdminLocalDb()
  const newVendor: Vendor = {
    ...vendor,
    id: `vendor-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    vendors: {
      ...state.vendors,
      [newVendor.id]: newVendor,
    },
  }
  persistAdminLocalDb(updatedState)
  return newVendor
}

export function updateVendor(id: string, updates: Partial<Omit<Vendor, "id" | "createdAt">>): Vendor | null {
  const state = readAdminLocalDb()
  const existing = state.vendors[id]
  if (!existing) {
    return null
  }
  const updatedVendor: Vendor = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    vendors: {
      ...state.vendors,
      [id]: updatedVendor,
    },
  }
  persistAdminLocalDb(updatedState)
  return updatedVendor
}

export function deleteVendor(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.vendors[id]) {
    return false
  }
  
  // Delete all related vendor users
  const vendorUsers = Object.values(state.vendorUsers).filter((user) => user.vendorId === id)
  const remainingVendorUsers = { ...state.vendorUsers }
  vendorUsers.forEach((user) => {
    delete remainingVendorUsers[user.id]
  })
  
  // Delete all related vendor documents
  const vendorDocuments = Object.values(state.vendorDocuments).filter((doc) => doc.vendorId === id)
  const remainingVendorDocuments = { ...state.vendorDocuments }
  vendorDocuments.forEach((doc) => {
    delete remainingVendorDocuments[doc.id]
  })
  
  // Delete all related vendor notes
  const vendorNotes = Object.values(state.vendorNotes).filter((note) => note.vendorId === id)
  const remainingVendorNotes = { ...state.vendorNotes }
  vendorNotes.forEach((note) => {
    delete remainingVendorNotes[note.id]
  })
  
  // Delete the vendor
  const { [id]: removed, ...remaining } = state.vendors
  
  const updatedState: AdminLocalDbState = {
    ...state,
    vendors: remaining,
    vendorUsers: remainingVendorUsers,
    vendorDocuments: remainingVendorDocuments,
    vendorNotes: remainingVendorNotes,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for portal users (Program, Vendor, Organization)
export function getPortalUsers(filter?: { userType?: PortalUser["userType"]; search?: string }): PortalUser[] {
  const state = readAdminLocalDb()
  let users = Object.values(state.portalUsers)

  if (filter?.userType) {
    users = users.filter((u) => u.userType === filter.userType)
  }
  if (filter?.search) {
    const term = filter.search.toLowerCase()
    users = users.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.groupName || "").toLowerCase().includes(term)
    )
  }

  return users.sort((a, b) => {
    const groupA = a.groupName || ""
    const groupB = b.groupName || ""
    if (groupA === groupB) {
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    }
    return groupA.localeCompare(groupB)
  })
}

export function getPortalUserById(id: string): PortalUser | null {
  const state = readAdminLocalDb()
  return state.portalUsers[id] || null
}

export function addPortalUser(user: Omit<PortalUser, "id" | "createdAt" | "updatedAt">): PortalUser {
  const state = readAdminLocalDb()
  const newUser: PortalUser = {
    ...user,
    id: `puser-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    portalUsers: {
      ...state.portalUsers,
      [newUser.id]: newUser,
    },
  }
  persistAdminLocalDb(updatedState)
  return newUser
}

export function updatePortalUser(id: string, updates: Partial<Omit<PortalUser, "id" | "createdAt">>): PortalUser | null {
  const state = readAdminLocalDb()
  const existing = state.portalUsers[id]
  if (!existing) {
    return null
  }
  const updated: PortalUser = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    portalUsers: {
      ...state.portalUsers,
      [id]: updated,
    },
  }
  persistAdminLocalDb(updatedState)
  return updated
}

export function deletePortalUser(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.portalUsers[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.portalUsers

  // Remove related affiliations and notes
  const remainingAffiliations = Object.fromEntries(
    Object.entries(state.portalUserAffiliations).filter(([, a]) => a.userId !== id)
  )
  const remainingNotes = Object.fromEntries(
    Object.entries(state.portalUserNotes).filter(([, n]) => n.userId !== id)
  )

  const updatedState: AdminLocalDbState = {
    ...state,
    portalUsers: remaining,
    portalUserAffiliations: remainingAffiliations,
    portalUserNotes: remainingNotes,
  }
  persistAdminLocalDb(updatedState)
  return true
}

export function getPortalUserAffiliations(userId: string): PortalUserAffiliation[] {
  const state = readAdminLocalDb()
  return Object.values(state.portalUserAffiliations)
    .filter((a) => a.userId === userId)
    .sort((a, b) => (b.activationDate || "").localeCompare(a.activationDate || ""))
}

export function getPortalUserAffiliationsByOrganization(organizationName: string): PortalUserAffiliation[] {
  const state = readAdminLocalDb()
  return Object.values(state.portalUserAffiliations)
    .filter((a) => a.organizationName === organizationName && a.status === "Added")
    .sort((a, b) => (b.activationDate || "").localeCompare(a.activationDate || ""))
}

export function addPortalUserAffiliation(
  entry: Omit<PortalUserAffiliation, "id" | "createdAt" | "updatedAt">
): PortalUserAffiliation {
  const state = readAdminLocalDb()
  const newAff: PortalUserAffiliation = {
    ...entry,
    id: `pua-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    portalUserAffiliations: {
      ...state.portalUserAffiliations,
      [newAff.id]: newAff,
    },
  }
  persistAdminLocalDb(updatedState)
  return newAff
}

export function updatePortalUserAffiliation(
  id: string,
  updates: Partial<Omit<PortalUserAffiliation, "id" | "createdAt">>
): PortalUserAffiliation | null {
  const state = readAdminLocalDb()
  const existing = state.portalUserAffiliations[id]
  if (!existing) {
    return null
  }
  const updated: PortalUserAffiliation = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    portalUserAffiliations: {
      ...state.portalUserAffiliations,
      [id]: updated,
    },
  }
  persistAdminLocalDb(updatedState)
  return updated
}

export function deletePortalUserAffiliation(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.portalUserAffiliations[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.portalUserAffiliations
  const updatedState: AdminLocalDbState = {
    ...state,
    portalUserAffiliations: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

export function getPortalUserNotes(userId: string): PortalUserNote[] {
  const state = readAdminLocalDb()
  return Object.values(state.portalUserNotes)
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function addPortalUserNote(entry: Omit<PortalUserNote, "id" | "createdAt" | "updatedAt">): PortalUserNote {
  const state = readAdminLocalDb()
  const newNote: PortalUserNote = {
    ...entry,
    id: `pun-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    portalUserNotes: {
      ...state.portalUserNotes,
      [newNote.id]: newNote,
    },
  }
  persistAdminLocalDb(updatedState)
  return newNote
}

export function deletePortalUserNote(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.portalUserNotes[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.portalUserNotes
  const updatedState: AdminLocalDbState = {
    ...state,
    portalUserNotes: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for vendor users
export function getVendorUsersByVendorId(vendorId: string): VendorUser[] {
  const state = readAdminLocalDb()
  return Object.values(state.vendorUsers)
    .filter((user) => user.vendorId === vendorId)
    .sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`
      const nameB = `${b.firstName} ${b.lastName}`
      return nameA.localeCompare(nameB)
    })
}

export function getVendorUserById(id: string): VendorUser | null {
  const state = readAdminLocalDb()
  return state.vendorUsers[id] || null
}

export function addVendorUser(user: Omit<VendorUser, "id" | "createdAt" | "updatedAt">): VendorUser {
  const state = readAdminLocalDb()
  const newUser: VendorUser = {
    ...user,
    id: `vuser-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    vendorUsers: {
      ...state.vendorUsers,
      [newUser.id]: newUser,
    },
  }
  persistAdminLocalDb(updatedState)
  return newUser
}

export function updateVendorUser(id: string, updates: Partial<Omit<VendorUser, "id" | "createdAt">>): VendorUser | null {
  const state = readAdminLocalDb()
  const existing = state.vendorUsers[id]
  if (!existing) {
    return null
  }
  const updatedUser: VendorUser = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    vendorUsers: {
      ...state.vendorUsers,
      [id]: updatedUser,
    },
  }
  persistAdminLocalDb(updatedState)
  return updatedUser
}

export function deleteVendorUser(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.vendorUsers[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.vendorUsers
  const updatedState: AdminLocalDbState = {
    ...state,
    vendorUsers: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for vendor documents
export function getVendorDocumentsByVendorId(vendorId: string): VendorDocument[] {
  const state = readAdminLocalDb()
  return Object.values(state.vendorDocuments)
    .filter((doc) => doc.vendorId === vendorId)
    .sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime())
}

export function getVendorDocumentById(id: string): VendorDocument | null {
  const state = readAdminLocalDb()
  return state.vendorDocuments[id] || null
}

export function addVendorDocument(doc: Omit<VendorDocument, "id" | "createdAt" | "updatedAt">): VendorDocument {
  const state = readAdminLocalDb()
  const newDoc: VendorDocument = {
    ...doc,
    id: `vdoc-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    vendorDocuments: {
      ...state.vendorDocuments,
      [newDoc.id]: newDoc,
    },
  }
  persistAdminLocalDb(updatedState)
  return newDoc
}

export function updateVendorDocument(id: string, updates: Partial<Omit<VendorDocument, "id" | "createdAt">>): VendorDocument | null {
  const state = readAdminLocalDb()
  const existing = state.vendorDocuments[id]
  if (!existing) {
    return null
  }
  const updatedDoc: VendorDocument = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    vendorDocuments: {
      ...state.vendorDocuments,
      [id]: updatedDoc,
    },
  }
  persistAdminLocalDb(updatedState)
  return updatedDoc
}

export function deleteVendorDocument(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.vendorDocuments[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.vendorDocuments
  const updatedState: AdminLocalDbState = {
    ...state,
    vendorDocuments: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for vendor notes
export function getVendorNotesByVendorId(vendorId: string): VendorNote[] {
  const state = readAdminLocalDb()
  return Object.values(state.vendorNotes)
    .filter((note) => note.vendorId === vendorId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getVendorNoteById(id: string): VendorNote | null {
  const state = readAdminLocalDb()
  return state.vendorNotes[id] || null
}

export function addVendorNote(note: Omit<VendorNote, "id" | "createdAt" | "updatedAt">): VendorNote {
  const state = readAdminLocalDb()
  const newNote: VendorNote = {
    ...note,
    id: `vnote-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    vendorNotes: {
      ...state.vendorNotes,
      [newNote.id]: newNote,
    },
  }
  persistAdminLocalDb(updatedState)
  return newNote
}

export function updateVendorNote(id: string, updates: Partial<Omit<VendorNote, "id" | "createdAt">>): VendorNote | null {
  const state = readAdminLocalDb()
  const existing = state.vendorNotes[id]
  if (!existing) {
    return null
  }
  const updatedNote: VendorNote = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    vendorNotes: {
      ...state.vendorNotes,
      [id]: updatedNote,
    },
  }
  persistAdminLocalDb(updatedState)
  return updatedNote
}

export function deleteVendorNote(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.vendorNotes[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.vendorNotes
  const updatedState: AdminLocalDbState = {
    ...state,
    vendorNotes: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper function to get organizations associated with a vendor (from vendor notes) - DEPRECATED: Use getVendorOrganizationsByVendorId instead
export function getOrganizationsByVendorId(vendorId: string): Array<{ organizationName: string; organizationId: string | null }> {
  const state = readAdminLocalDb()
  const vendorNotes = Object.values(state.vendorNotes)
    .filter((note) => note.vendorId === vendorId && note.organization)
  
  // Get unique organization names
  const uniqueOrgNames = new Set<string>()
  vendorNotes.forEach((note) => {
    if (note.organization) {
      uniqueOrgNames.add(note.organization)
    }
  })
  
  // Try to match organization names with actual organizations
  const organizations: Array<{ organizationName: string; organizationId: string | null }> = []
  uniqueOrgNames.forEach((orgName) => {
    // Find matching organization by name
    const matchingOrg = Object.values(state.organizations).find(
      (org) => org.name === orgName
    )
    organizations.push({
      organizationName: orgName,
      organizationId: matchingOrg?.id || null,
    })
  })
  
  // Sort alphabetically by organization name
  return organizations.sort((a, b) => a.organizationName.localeCompare(b.organizationName))
}

// CRUD functions for vendor-organization associations
export function getVendorOrganizationsByVendorId(vendorId: string): VendorOrganization[] {
  const state = readAdminLocalDb()
  return Object.values(state.vendorOrganizations)
    .filter((vo) => vo.vendorId === vendorId)
    .sort((a, b) => {
      // Sort by status (Active first), then by start date
      if (a.status !== b.status) {
        const statusOrder = { Active: 0, Pending: 1, Inactive: 2 }
        return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3)
      }
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0
      return dateB - dateA
    })
}

export function getVendorOrganizationsByOrganizationId(organizationId: string): VendorOrganization[] {
  const state = readAdminLocalDb()
  return Object.values(state.vendorOrganizations)
    .filter((vo) => vo.organizationId === organizationId)
    .sort((a, b) => {
      // Sort by status (Active first), then by start date
      if (a.status !== b.status) {
        const statusOrder = { Active: 0, Pending: 1, Inactive: 2 }
        return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3)
      }
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0
      return dateB - dateA
    })
}

export function getVendorOrganizationById(id: string): VendorOrganization | null {
  const state = readAdminLocalDb()
  return state.vendorOrganizations[id] || null
}

export function getVendorOrganizationByVendorAndOrg(vendorId: string, organizationId: string): VendorOrganization | null {
  const state = readAdminLocalDb()
  return Object.values(state.vendorOrganizations).find(
    (vo) => vo.vendorId === vendorId && vo.organizationId === organizationId
  ) || null
}

export function addVendorOrganization(
  association: Omit<VendorOrganization, "id" | "createdAt" | "updatedAt">
): VendorOrganization {
  const state = readAdminLocalDb()
  
  // Check if association already exists
  const existing = getVendorOrganizationByVendorAndOrg(association.vendorId, association.organizationId)
  if (existing) {
    throw new Error("Vendor-organization association already exists")
  }
  
  const newAssociation: VendorOrganization = {
    ...association,
    id: `vo-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  const updatedState: AdminLocalDbState = {
    ...state,
    vendorOrganizations: {
      ...state.vendorOrganizations,
      [newAssociation.id]: newAssociation,
    },
  }
  persistAdminLocalDb(updatedState)
  return newAssociation
}

export function updateVendorOrganization(
  id: string,
  updates: Partial<Omit<VendorOrganization, "id" | "createdAt">>
): VendorOrganization | null {
  const state = readAdminLocalDb()
  const existing = state.vendorOrganizations[id]
  if (!existing) {
    return null
  }
  
  const updatedAssociation: VendorOrganization = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  const updatedState: AdminLocalDbState = {
    ...state,
    vendorOrganizations: {
      ...state.vendorOrganizations,
      [id]: updatedAssociation,
    },
  }
  persistAdminLocalDb(updatedState)
  return updatedAssociation
}

export function deleteVendorOrganization(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.vendorOrganizations[id]) {
    return false
  }
  
  const { [id]: removed, ...remaining } = state.vendorOrganizations
  const updatedState: AdminLocalDbState = {
    ...state,
    vendorOrganizations: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for MSPs
export function getAllMSPs(): MSP[] {
  const state = readAdminLocalDb()
  return Object.values(state.msps).sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA
  })
}

export function getMSPById(id: string): MSP | null {
  const state = readAdminLocalDb()
  return state.msps[id] || null
}

export function addMSP(msp: Omit<MSP, "id" | "createdAt" | "updatedAt">): MSP {
  const state = readAdminLocalDb()
  const newMSP: MSP = {
    ...msp,
    id: `msp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    msps: {
      ...state.msps,
      [newMSP.id]: newMSP,
    },
  }
  persistAdminLocalDb(updatedState)
  return newMSP
}

export function updateMSP(id: string, updates: Partial<Omit<MSP, "id" | "createdAt">>): MSP | null {
  const state = readAdminLocalDb()
  const existing = state.msps[id]
  if (!existing) {
    return null
  }
  const updatedMSP: MSP = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: AdminLocalDbState = {
    ...state,
    msps: {
      ...state.msps,
      [id]: updatedMSP,
    },
  }
  persistAdminLocalDb(updatedState)
  return updatedMSP
}

export function deleteMSP(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.msps[id]) {
    return false
  }
  
  // Delete all related MSP-Organization relationships
  const mspOrgs = Object.values(state.mspOrganizations).filter((mspo) => mspo.mspId === id)
  const remainingMSPOrgs = { ...state.mspOrganizations }
  mspOrgs.forEach((mspo) => {
    delete remainingMSPOrgs[mspo.id]
  })
  
  const { [id]: removed, ...remaining } = state.msps
  const updatedState: AdminLocalDbState = {
    ...state,
    msps: remaining,
    mspOrganizations: remainingMSPOrgs,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Helper functions for MSP-Organization relationships
export function getMSPOrganizationsByMSPId(mspId: string): MSPOrganization[] {
  const state = readAdminLocalDb()
  return Object.values(state.mspOrganizations)
    .filter((mspo) => mspo.mspId === mspId)
    .sort((a, b) => {
      const dateA = a.agreementStartDate ? new Date(a.agreementStartDate).getTime() : 0
      const dateB = b.agreementStartDate ? new Date(b.agreementStartDate).getTime() : 0
      return dateB - dateA
    })
}

export function getMSPOrganizationsByOrganizationId(organizationId: string): MSPOrganization[] {
  const state = readAdminLocalDb()
  return Object.values(state.mspOrganizations)
    .filter((mspo) => mspo.organizationId === organizationId)
    .sort((a, b) => {
      const dateA = a.agreementStartDate ? new Date(a.agreementStartDate).getTime() : 0
      const dateB = b.agreementStartDate ? new Date(b.agreementStartDate).getTime() : 0
      return dateB - dateA
    })
}

export function getMSPOrganizationById(id: string): MSPOrganization | null {
  const state = readAdminLocalDb()
  return state.mspOrganizations[id] || null
}

export function getMSPOrganizationByMSPAndOrg(mspId: string, organizationId: string): MSPOrganization | null {
  const state = readAdminLocalDb()
  return Object.values(state.mspOrganizations).find(
    (mspo) => mspo.mspId === mspId && mspo.organizationId === organizationId
  ) || null
}

export function addMSPOrganization(
  association: Omit<MSPOrganization, "id" | "createdAt" | "updatedAt">
): MSPOrganization {
  const state = readAdminLocalDb()
  
  // Check if association already exists
  const existing = getMSPOrganizationByMSPAndOrg(association.mspId, association.organizationId)
  if (existing) {
    throw new Error("MSP-organization association already exists")
  }
  
  const newAssociation: MSPOrganization = {
    ...association,
    id: `mspo-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  const updatedState: AdminLocalDbState = {
    ...state,
    mspOrganizations: {
      ...state.mspOrganizations,
      [newAssociation.id]: newAssociation,
    },
  }
  persistAdminLocalDb(updatedState)
  return newAssociation
}

export function updateMSPOrganization(
  id: string,
  updates: Partial<Omit<MSPOrganization, "id" | "createdAt">>
): MSPOrganization | null {
  const state = readAdminLocalDb()
  const existing = state.mspOrganizations[id]
  if (!existing) {
    return null
  }
  
  const updatedAssociation: MSPOrganization = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  const updatedState: AdminLocalDbState = {
    ...state,
    mspOrganizations: {
      ...state.mspOrganizations,
      [id]: updatedAssociation,
    },
  }
  persistAdminLocalDb(updatedState)
  return updatedAssociation
}

export function deleteMSPOrganization(id: string): boolean {
  const state = readAdminLocalDb()
  if (!state.mspOrganizations[id]) {
    return false
  }
  
  const { [id]: removed, ...remaining } = state.mspOrganizations
  const updatedState: AdminLocalDbState = {
    ...state,
    mspOrganizations: remaining,
  }
  persistAdminLocalDb(updatedState)
  return true
}

// Calculate total annual spend for an MSP
export function calculateMSPTotalAnnualSpend(mspId: string): number {
  const state = readAdminLocalDb()
  const mspOrgs = getMSPOrganizationsByMSPId(mspId)
  
  let total = 0
  mspOrgs.forEach((mspo) => {
    const org = state.organizations[mspo.organizationId]
    if (org && org.estimatedAnnualSpend) {
      total += org.estimatedAnnualSpend
    }
  })
  
  return total
}

// Calculate expected MSP revenue for an organization
export function calculateExpectedMSPRevenue(mspOrg: MSPOrganization): number {
  const state = readAdminLocalDb()
  const org = state.organizations[mspOrg.organizationId]
  if (!org || !org.estimatedAnnualSpend || !mspOrg.mspFeePercentage) {
    return 0
  }
  return (org.estimatedAnnualSpend * mspOrg.mspFeePercentage) / 100
}

// Calculate expected SAS revenue for an organization
export function calculateExpectedSASRevenue(mspOrg: MSPOrganization): number {
  const state = readAdminLocalDb()
  const org = state.organizations[mspOrg.organizationId]
  if (!org || !org.estimatedAnnualSpend || !mspOrg.sasFeePercentage) {
    return 0
  }
  return (org.estimatedAnnualSpend * mspOrg.sasFeePercentage) / 100
}
