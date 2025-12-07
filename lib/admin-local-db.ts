export const ADMIN_LOCAL_DB_KEY = "wf_admin_local_db"

export type Specialty = {
  id: string
  name: string // Specialty name
  code: string
  acronym?: string
  description?: string
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
  locations: AdminLocalDbOrganizationLocation[]
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
  tagToApply: string // Tag name to apply to user profile
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
  users: Record<string, User>
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
        departments: [],
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
        departments: [],
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
    agreementRenewalDate: "2025-06-30",
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
        departments: [],
      },
      {
        id: "loc-004",
        name: "Memorial Satellite Clinic",
        address: "321 Community Way",
        city: "Evanston",
        state: "IL",
        zipCode: "60201",
        phone: "+1 (555) 234-5679",
        departments: [],
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
    agreementRenewalDate: "2025-01-20",
    locations: [
      {
        id: "loc-005",
        name: "Vitality Main Hospital",
        address: "123 Main St",
        city: "Anytown",
        state: "USA",
        zipCode: "12345",
        phone: "+1 (555) 345-6789",
        email: "main@vitalityhealth.org",
        departments: [],
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
    code: "RN",
    description: "Registered Nurse",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-002",
    name: "Licensed Practical Nurse / Licensed Vocational Nurse",
    code: "LPN/LVN",
    description: "LPN/LVN",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-003",
    name: "Certified Nursing Assistant",
    code: "CNA",
    description: "CNA",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-004",
    name: "Medical Assistant",
    code: "Medical Assistant",
    description: "Medical Assistant",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-005",
    name: "Surgical Tech",
    code: "Surgical Tech",
    description: "Surgical Tech",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-006",
    name: "Physical Therapist",
    code: "PT",
    description: "Physical Therapist",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-007",
    name: "Occupational Therapist",
    code: "OT",
    description: "Occupational Therapist",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-008",
    name: "Respiratory Therapist",
    code: "RT",
    description: "Respiratory Therapist",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-009",
    name: "Nurse Practitioner",
    code: "Nurse Practitioner",
    description: "Nurse Practitioner",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "occ-010",
    name: "Physician Assistant",
    code: "Physician Assistant",
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

export const defaultAdminLocalDbState: AdminLocalDbState = {
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
  users: defaultUsersRecord,
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
    
    // Merge tagging rules: use empty if none exist, otherwise use existing
    const mergedTaggingRules = parsed.taggingRules || {}
    
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
      users: mergedUsers,
      lastUpdated: parsed.lastUpdated,
    }
    
    // If we merged defaults (because existing was empty), persist the merged state
    if (Object.keys(existingWalletTemplates).length === 0 || Object.keys(existingUsers).length === 0) {
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

