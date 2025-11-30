export const ADMIN_LOCAL_DB_KEY = "wf_admin_local_db"

export type AdminLocalDbOrganizationLocation = {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone?: string
  email?: string
  departments: string[]
}

export type AdminLocalDbOrganizationEntry = {
  id: string
  name: string
  email: string
  phone: string
  website?: string
  industry?: string
  description?: string
  locations: AdminLocalDbOrganizationLocation[]
  createdAt: string
  updatedAt: string
}

export type Occupation = {
  id: string
  name: string
  code: string // Short code like "RN", "LPN", etc.
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type OccupationQuestionnaire = {
  id: string
  occupationId: string
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

export type AdminLocalDbState = {
  organizations: Record<string, AdminLocalDbOrganizationEntry>
  occupations: Record<string, Occupation>
  occupationQuestionnaires: Record<string, OccupationQuestionnaire>
  generalQuestionnaire: GeneralQuestionnaire | null
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
    description: "Leading healthcare provider with multiple facilities across the region.",
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
    description: "Regional health system serving multiple communities.",
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

export const defaultAdminLocalDbState: AdminLocalDbState = {
  organizations: defaultOrganizationsRecord,
  occupations: defaultOccupationsRecord,
  occupationQuestionnaires: defaultOccupationQuestionnaires,
  generalQuestionnaire: defaultGeneralQuestionnaire,
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
        const migratedLocations = org.locations.map((loc) => ({
          ...loc,
          departments: loc.departments ?? [],
        }))
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
        // Use existing questionnaire (user may have customized it)
        mergedQuestionnaires[key] = value
      })
    }
    
    return {
      organizations: Object.keys(migratedOrganizations).length > 0 ? migratedOrganizations : defaultOrganizationsRecord,
      occupations: parsed.occupations || defaultOccupationsRecord,
      occupationQuestionnaires: mergedQuestionnaires,
      generalQuestionnaire: parsed.generalQuestionnaire ?? defaultGeneralQuestionnaire,
      lastUpdated: parsed.lastUpdated,
    }
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
export function addDepartment(locationId: string, deptName: string): boolean {
  const state = readAdminLocalDb()
  
  for (const orgId in state.organizations) {
    const org = state.organizations[orgId]
    const locationIndex = org.locations.findIndex((loc) => loc.id === locationId)
    
    if (locationIndex !== -1) {
      const location = org.locations[locationIndex]
      
      // Check if department already exists
      if (location.departments.includes(deptName)) {
        return false
      }
      
      // Add department
      const updatedLocation = {
        ...location,
        departments: [...location.departments, deptName],
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

export function removeDepartment(locationId: string, deptName: string): boolean {
  const state = readAdminLocalDb()
  
  for (const orgId in state.organizations) {
    const org = state.organizations[orgId]
    const locationIndex = org.locations.findIndex((loc) => loc.id === locationId)
    
    if (locationIndex !== -1) {
      const location = org.locations[locationIndex]
      
      // Remove department
      const updatedLocation = {
        ...location,
        departments: location.departments.filter((dept) => dept !== deptName),
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

export function updateDepartment(locationId: string, oldName: string, newName: string): boolean {
  const state = readAdminLocalDb()
  
  for (const orgId in state.organizations) {
    const org = state.organizations[orgId]
    const locationIndex = org.locations.findIndex((loc) => loc.id === locationId)
    
    if (locationIndex !== -1) {
      const location = org.locations[locationIndex]
      
      // Check if old department exists
      if (!location.departments.includes(oldName)) {
        return false
      }
      
      // Check if new name already exists (and is different from old name)
      if (oldName !== newName && location.departments.includes(newName)) {
        return false
      }
      
      // Update department name
      const updatedLocation = {
        ...location,
        departments: location.departments.map((dept) => (dept === oldName ? newName : dept)),
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
export function getAllDepartments(): string[] {
  const locations = getAllLocations()
  const departmentsSet = new Set<string>()
  
  locations.forEach((location) => {
    location.departments.forEach((dept) => {
      if (dept.trim()) {
        departmentsSet.add(dept.trim())
      }
    })
  })
  
  return Array.from(departmentsSet).sort()
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
    // Update existing
    const updated: OccupationQuestionnaire = {
      ...existing,
      ...questionnaire,
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
    // Create new
    const newQuestionnaire: OccupationQuestionnaire = {
      ...questionnaire,
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

