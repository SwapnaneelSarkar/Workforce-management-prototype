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

export type AdminLocalDbState = {
  organizations: Record<string, AdminLocalDbOrganizationEntry>
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
      },
      {
        id: "loc-004",
        name: "Memorial Satellite Clinic",
        address: "321 Community Way",
        city: "Evanston",
        state: "IL",
        zipCode: "60201",
        phone: "+1 (555) 234-5679",
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

export const defaultAdminLocalDbState: AdminLocalDbState = {
  organizations: defaultOrganizationsRecord,
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
    return {
      organizations: parsed.organizations ?? defaultOrganizationsRecord,
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

