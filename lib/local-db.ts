export const LOCAL_DB_KEY = "wf_candidate_local_db"

export type LocalDbOnboardingDetails = Record<string, string | string[]>

export type LocalDbDocumentEntry = {
  name?: string
  source: "onboarding" | "wallet"
  uploadedAt: string
}

export type LocalDbJobApplicationEntry = {
  appliedAt: string
}

export type LocalDbTimecardStatus = "submitted" | "approved" | "rejected"

export type LocalDbInvoiceStatus = "pending" | "paid"

export type LocalDbTimecardDay = {
  /** ISO date string for the day (e.g. 2025-01-15) */
  date: string
  /** Human-readable date label used in UI (e.g. Monday, Jan 15) */
  label: string
  /** 24-hour time for shift start, if any (e.g. 19:00) */
  startTime?: string
  /** 24-hour time for shift end, if any (e.g. 07:00) */
  endTime?: string
  /** Total hours worked for the day */
  hours: number
  /** Optional note (e.g. "Day Off") */
  note?: string
}

export type LocalDbTimecard = {
  id: string
  organizationId: string
  candidateId: string
  candidateName: string
  candidateInitials: string
  assignmentId: string
  assignmentName: string
  jobTitle: string
  payPeriodStart: string // ISO date, inclusive
  payPeriodEnd: string // ISO date, inclusive
  status: LocalDbTimecardStatus
  regularHours: number
  overtimeHours: number
  totalHours: number
  billRate: number
  totalAmount: number
  submittedOn?: string // ISO datetime when candidate submitted
  lastUpdated?: string // ISO datetime when org last updated
  days: LocalDbTimecardDay[]
}

export type LocalDbState = {
  onboardingDetails: LocalDbOnboardingDetails
  uploadedDocuments: Record<string, LocalDbDocumentEntry>
  jobApplications: Record<string, LocalDbJobApplicationEntry>
  /** Timecards for both candidate submissions and organization approvals */
  timecards: Record<string, LocalDbTimecard>
  /** Invoices generated from approved timecards */
  invoices: Record<string, LocalDbInvoice>
  lastUpdated?: string
}

export type LocalDbInvoice = {
  id: string
  organizationId: string
  /** Human-readable file name, e.g. Invoice_RN_ICU_Jan2025.pdf */
  fileName: string
  /** Simple label like \"Sarah Johnson - RN ICU\" */
  relatedAssignment: string
  /** Optional link to a timecard id */
  timecardId?: string
  /** ISO date string (yyyy-mm-dd) */
  dateUploaded: string
  amount: number
  status: LocalDbInvoiceStatus
}

export const defaultLocalDbState: LocalDbState = {
  onboardingDetails: {},
  uploadedDocuments: {},
  jobApplications: {},
  timecards: {
    // Jan 15 - 21, 2025
    "tc_sarah_2025-01-15": {
      id: "tc_sarah_2025-01-15",
      organizationId: "org_1",
      candidateId: "candidate_sarah",
      candidateName: "Sarah Johnson",
      candidateInitials: "SJ",
      assignmentId: "assignment_rn_icu",
      assignmentName: "RN - ICU",
      jobTitle: "Registered Nurse - ICU",
      payPeriodStart: "2025-01-15",
      payPeriodEnd: "2025-01-21",
      status: "submitted",
      regularHours: 36,
      overtimeHours: 0,
      totalHours: 36,
      billRate: 75,
      totalAmount: 36 * 75,
      submittedOn: "2025-01-22T09:30:00Z",
      lastUpdated: "2025-01-22T09:30:00Z",
      days: [
        {
          date: "2025-01-15",
          label: "Monday, Jan 15",
          startTime: "19:00",
          endTime: "07:00",
          hours: 12,
        },
        {
          date: "2025-01-16",
          label: "Tuesday, Jan 16",
          hours: 0,
          note: "Day Off",
        },
        {
          date: "2025-01-17",
          label: "Wednesday, Jan 17",
          startTime: "19:00",
          endTime: "07:00",
          hours: 12,
        },
        {
          date: "2025-01-18",
          label: "Thursday, Jan 18",
          hours: 0,
          note: "Day Off",
        },
        {
          date: "2025-01-19",
          label: "Friday, Jan 19",
          startTime: "19:00",
          endTime: "07:00",
          hours: 12,
        },
        {
          date: "2025-01-20",
          label: "Saturday, Jan 20",
          hours: 0,
          note: "Day Off",
        },
        {
          date: "2025-01-21",
          label: "Sunday, Jan 21",
          hours: 0,
          note: "Day Off",
        },
      ],
    },
    "tc_michael_2025-01-15": {
      id: "tc_michael_2025-01-15",
      organizationId: "org_1",
      candidateId: "candidate_michael",
      candidateName: "Michael Chen",
      candidateInitials: "MC",
      assignmentId: "assignment_pt_rehab",
      assignmentName: "PT - Rehab",
      jobTitle: "Physical Therapist - Rehab",
      payPeriodStart: "2025-01-15",
      payPeriodEnd: "2025-01-21",
      status: "approved",
      regularHours: 40,
      overtimeHours: 0,
      totalHours: 40,
      billRate: 70,
      totalAmount: 40 * 70,
      submittedOn: "2025-01-22T11:00:00Z",
      lastUpdated: "2025-01-23T10:00:00Z",
      days: [
        {
          date: "2025-01-15",
          label: "Monday, Jan 15",
          startTime: "08:00",
          endTime: "16:00",
          hours: 8,
        },
        {
          date: "2025-01-16",
          label: "Tuesday, Jan 16",
          startTime: "08:00",
          endTime: "16:00",
          hours: 8,
        },
        {
          date: "2025-01-17",
          label: "Wednesday, Jan 17",
          startTime: "08:00",
          endTime: "16:00",
          hours: 8,
        },
        {
          date: "2025-01-18",
          label: "Thursday, Jan 18",
          startTime: "08:00",
          endTime: "16:00",
          hours: 8,
        },
        {
          date: "2025-01-19",
          label: "Friday, Jan 19",
          startTime: "08:00",
          endTime: "16:00",
          hours: 8,
        },
        {
          date: "2025-01-20",
          label: "Saturday, Jan 20",
          hours: 0,
          note: "Day Off",
        },
        {
          date: "2025-01-21",
          label: "Sunday, Jan 21",
          hours: 0,
          note: "Day Off",
        },
      ],
    },
    "tc_emily_2025-01-15": {
      id: "tc_emily_2025-01-15",
      organizationId: "org_1",
      candidateId: "candidate_emily",
      candidateName: "Emily Rodriguez",
      candidateInitials: "ER",
      assignmentId: "assignment_ma_cardio",
      assignmentName: "MA - Cardiology",
      jobTitle: "Medical Assistant - Cardiology",
      payPeriodStart: "2025-01-15",
      payPeriodEnd: "2025-01-21",
      status: "submitted",
      regularHours: 38,
      overtimeHours: 0,
      totalHours: 38,
      billRate: 45,
      totalAmount: 38 * 45,
      submittedOn: "2025-01-22T13:15:00Z",
      lastUpdated: "2025-01-22T13:15:00Z",
      days: [],
    },
    "tc_james_2025-01-08": {
      id: "tc_james_2025-01-08",
      organizationId: "org_1",
      candidateId: "candidate_james",
      candidateName: "James Wilson",
      candidateInitials: "JW",
      assignmentId: "assignment_rn_emergency",
      assignmentName: "RN - Emergency",
      jobTitle: "Registered Nurse - Emergency",
      payPeriodStart: "2025-01-08",
      payPeriodEnd: "2025-01-14",
      status: "approved",
      regularHours: 40,
      overtimeHours: 2,
      totalHours: 42,
      billRate: 78,
      totalAmount: 42 * 78,
      submittedOn: "2025-01-15T08:45:00Z",
      lastUpdated: "2025-01-16T09:00:00Z",
      days: [
       {
          date: "2025-01-08",
          label: "Monday, Jan 8",
          startTime: "19:00",
          endTime: "07:00",
          hours: 12,
        },
        {
          date: "2025-01-09",
          label: "Tuesday, Jan 9",
          startTime: "19:00",
          endTime: "07:00",
          hours: 12,
        },
        {
          date: "2025-01-10",
          label: "Wednesday, Jan 10",
          startTime: "19:00",
          endTime: "07:00",
          hours: 12,
        },
        {
          date: "2025-01-11",
          label: "Thursday, Jan 11",
          hours: 2,
          note: "Overtime training",
        },
        {
          date: "2025-01-12",
          label: "Friday, Jan 12",
          hours: 2,
          note: "Overtime coverage",
        },
        {
          date: "2025-01-13",
          label: "Saturday, Jan 13",
          hours: 2,
          note: "Overtime coverage",
        },
        {
          date: "2025-01-14",
          label: "Sunday, Jan 14",
          hours: 0,
          note: "Day Off",
        },
      ],
    },
    "tc_sarah_2025-01-08": {
      id: "tc_sarah_2025-01-08",
      organizationId: "org_1",
      candidateId: "candidate_sarah",
      candidateName: "Sarah Johnson",
      candidateInitials: "SJ",
      assignmentId: "assignment_rn_icu",
      assignmentName: "RN - ICU",
      jobTitle: "Registered Nurse - ICU",
      payPeriodStart: "2025-01-08",
      payPeriodEnd: "2025-01-14",
      status: "approved",
      regularHours: 36,
      overtimeHours: 0,
      totalHours: 36,
      billRate: 75,
      totalAmount: 36 * 75,
      submittedOn: "2025-01-15T10:00:00Z",
      lastUpdated: "2025-01-15T10:30:00Z",
      days: [
        {
          date: "2025-01-08",
          label: "Monday, Jan 8",
          startTime: "19:00",
          endTime: "07:00",
          hours: 12,
        },
        {
          date: "2025-01-09",
          label: "Tuesday, Jan 9",
          hours: 0,
          note: "Day Off",
        },
        {
          date: "2025-01-10",
          label: "Wednesday, Jan 10",
          startTime: "19:00",
          endTime: "07:00",
          hours: 12,
        },
        {
          date: "2025-01-11",
          label: "Thursday, Jan 11",
          hours: 0,
          note: "Day Off",
        },
        {
          date: "2025-01-12",
          label: "Friday, Jan 12",
          startTime: "19:00",
          endTime: "07:00",
          hours: 12,
        },
        {
          date: "2025-01-13",
          label: "Saturday, Jan 13",
          hours: 0,
          note: "Day Off",
        },
        {
          date: "2025-01-14",
          label: "Sunday, Jan 14",
          hours: 0,
          note: "Day Off",
        },
      ],
    },
    "tc_michael_2025-01-08": {
      id: "tc_michael_2025-01-08",
      organizationId: "org_1",
      candidateId: "candidate_michael",
      candidateName: "Michael Chen",
      candidateInitials: "MC",
      assignmentId: "assignment_pt_rehab",
      assignmentName: "PT - Rehab",
      jobTitle: "Physical Therapist - Rehab",
      payPeriodStart: "2025-01-08",
      payPeriodEnd: "2025-01-14",
      status: "rejected",
      regularHours: 35,
      overtimeHours: 0,
      totalHours: 35,
      billRate: 70,
      totalAmount: 35 * 70,
      submittedOn: "2025-01-15T12:00:00Z",
      lastUpdated: "2025-01-16T14:00:00Z",
      days: [
        {
          date: "2025-01-08",
          label: "Monday, Jan 8",
          startTime: "08:00",
          endTime: "15:00",
          hours: 7,
        },
        {
          date: "2025-01-09",
          label: "Tuesday, Jan 9",
          startTime: "08:00",
          endTime: "15:00",
          hours: 7,
        },
        {
          date: "2025-01-10",
          label: "Wednesday, Jan 10",
          startTime: "08:00",
          endTime: "15:00",
          hours: 7,
        },
        {
          date: "2025-01-11",
          label: "Thursday, Jan 11",
          startTime: "08:00",
          endTime: "15:00",
          hours: 7,
        },
        {
          date: "2025-01-12",
          label: "Friday, Jan 12",
          startTime: "08:00",
          endTime: "15:00",
          hours: 7,
        },
        {
          date: "2025-01-13",
          label: "Saturday, Jan 13",
          hours: 0,
          note: "Day Off",
        },
        {
          date: "2025-01-14",
          label: "Sunday, Jan 14",
          hours: 0,
          note: "Day Off",
        },
      ],
    },
  },
  invoices: {
    inv_sarah_jan_2025: {
      id: "inv_sarah_jan_2025",
      organizationId: "org_1",
      fileName: "Invoice_RN_ICU_Jan2025.pdf",
      relatedAssignment: "Sarah Johnson - RN ICU",
      timecardId: "tc_sarah_2025-01-15",
      dateUploaded: "2025-01-22",
      amount: 2700,
      status: "pending",
    },
    inv_michael_jan_2025: {
      id: "inv_michael_jan_2025",
      organizationId: "org_1",
      fileName: "Invoice_PT_Rehab_Jan2025.pdf",
      relatedAssignment: "Michael Chen - PT Rehab",
      timecardId: "tc_michael_2025-01-15",
      dateUploaded: "2025-01-22",
      amount: 3200,
      status: "paid",
    },
    inv_emily_jan_2025: {
      id: "inv_emily_jan_2025",
      organizationId: "org_1",
      fileName: "Invoice_MA_Cardiology_Jan2025.pdf",
      relatedAssignment: "Emily Rodriguez - MA Cardiology",
      timecardId: "tc_emily_2025-01-15",
      dateUploaded: "2025-01-15",
      amount: 1900,
      status: "paid",
    },
    inv_james_dec_2024: {
      id: "inv_james_dec_2024",
      organizationId: "org_1",
      fileName: "Invoice_RN_Emergency_Dec2024.pdf",
      relatedAssignment: "James Wilson - RN Emergency",
      timecardId: "tc_james_2025-01-08",
      dateUploaded: "2025-01-08",
      amount: 3150,
      status: "paid",
    },
  },
  lastUpdated: undefined,
}

export const LOCAL_DB_SAFE_DEFAULTS = Object.freeze(defaultLocalDbState)

export function readLocalDb(): LocalDbState {
  if (typeof window === "undefined") {
    return defaultLocalDbState
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_DB_KEY)
    if (!raw) {
      return defaultLocalDbState
    }
    const parsed = JSON.parse(raw) as Partial<LocalDbState>
    return {
      onboardingDetails: parsed.onboardingDetails ?? {},
      uploadedDocuments: parsed.uploadedDocuments ?? {},
      jobApplications: parsed.jobApplications ?? {},
      timecards: parsed.timecards ?? defaultLocalDbState.timecards,
      invoices: parsed.invoices ?? defaultLocalDbState.invoices,
      lastUpdated: parsed.lastUpdated,
    }
  } catch (error) {
    console.warn("Unable to parse local DB state", error)
    return defaultLocalDbState
  }
}

export function persistLocalDb(next: LocalDbState) {
  if (typeof window === "undefined") {
    return
  }
  try {
    window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(next))
  } catch (error) {
    console.warn("Unable to persist local DB state", error)
  }
}

export function getAllTimecards(): LocalDbTimecard[] {
  const db = readLocalDb()
  return Object.values(db.timecards)
}

export function getTimecardById(id: string): LocalDbTimecard | undefined {
  const db = readLocalDb()
  return db.timecards[id]
}

export function upsertTimecard(nextCard: LocalDbTimecard): LocalDbTimecard {
  const db = readLocalDb()
  const now = new Date().toISOString()
  const next: LocalDbState = {
    ...db,
    timecards: {
      ...db.timecards,
      [nextCard.id]: {
        ...nextCard,
        lastUpdated: nextCard.lastUpdated ?? now,
      },
    },
    lastUpdated: now,
  }

  persistLocalDb(next)
  return next.timecards[nextCard.id]
}

export function updateTimecardStatus(
  id: string,
  status: LocalDbTimecardStatus,
): LocalDbTimecard | undefined {
  const db = readLocalDb()
  const existing = db.timecards[id]
  if (!existing) return undefined

  const now = new Date().toISOString()
  const updated: LocalDbTimecard = {
    ...existing,
    status,
    lastUpdated: now,
  }

  const next: LocalDbState = {
    ...db,
    timecards: {
      ...db.timecards,
      [id]: updated,
    },
    lastUpdated: now,
  }

  persistLocalDb(next)
  return updated
}

export function deleteTimecard(id: string): void {
  const db = readLocalDb()
  if (!db.timecards[id]) return

  const { [id]: _removed, ...rest } = db.timecards
  const now = new Date().toISOString()
  const next: LocalDbState = {
    ...db,
    timecards: rest,
    lastUpdated: now,
  }

  persistLocalDb(next)
}

export function getAllInvoices(): LocalDbInvoice[] {
  const db = readLocalDb()
  return Object.values(db.invoices)
}

export function getInvoiceById(id: string): LocalDbInvoice | undefined {
  const db = readLocalDb()
  return db.invoices[id]
}

export function upsertInvoice(nextInvoice: LocalDbInvoice): LocalDbInvoice {
  const db = readLocalDb()
  const now = new Date().toISOString()
  const next: LocalDbState = {
    ...db,
    invoices: {
      ...db.invoices,
      [nextInvoice.id]: {
        ...nextInvoice,
      },
    },
    lastUpdated: now,
  }
  persistLocalDb(next)
  return next.invoices[nextInvoice.id]
}

export function updateInvoiceStatus(
  id: string,
  status: LocalDbInvoiceStatus,
): LocalDbInvoice | undefined {
  const db = readLocalDb()
  const existing = db.invoices[id]
  if (!existing) return undefined

  const now = new Date().toISOString()
  const updated: LocalDbInvoice = {
    ...existing,
    status,
  }

  const next: LocalDbState = {
    ...db,
    invoices: {
      ...db.invoices,
      [id]: updated,
    },
    lastUpdated: now,
  }

  persistLocalDb(next)
  return updated
}

export function deleteInvoice(id: string): void {
  const db = readLocalDb()
  if (!db.invoices[id]) return

  const { [id]: _removed, ...rest } = db.invoices
  const now = new Date().toISOString()
  const next: LocalDbState = {
    ...db,
    invoices: rest,
    lastUpdated: now,
  }

  persistLocalDb(next)
}


