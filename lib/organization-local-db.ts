export const ORGANIZATION_LOCAL_DB_KEY = "wf_organization_local_db"

import type { Job, Application } from "@/lib/mock-data"
import type { WalletTemplate, RequisitionTemplate } from "@/components/providers/demo-data-provider"
import type { ComplianceItem, ComplianceTemplate } from "@/lib/compliance-templates-store"
import { complianceItemsByCategory } from "@/lib/compliance-items"

export type OrganizationLocalDbJob = Omit<Job, "id"> & {
  id: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

export type OrganizationLocalDbApplication = Omit<Application, "id"> & {
  id: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

export type OrganizationLocalDbWalletTemplate = WalletTemplate & {
  organizationId: string
  createdAt: string
  updatedAt: string
}

export type OrganizationLocalDbRequisitionTemplate = RequisitionTemplate & {
  organizationId: string
  createdAt: string
  updatedAt: string
  // Note: RequisitionTemplate now uses listItemIds instead of items
}

export type OrganizationLocalDbLegacyTemplate = ComplianceTemplate & {
  organizationId: string
  createdAt: string
  updatedAt: string
}

export type OrganizationQuestionnaireQuestion = {
  id: string
  question: string
  type: "text" | "yesno"
  required: boolean
  isReadOnly?: boolean // For required questions that can't be edited
}

export type OrganizationQuestionnaire = {
  id: string
  organizationId: string
  customQuestions: OrganizationQuestionnaireQuestion[]
  createdAt: string
  updatedAt: string
}

export type OrganizationPlacement = {
  id: string
  organizationId: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  candidateAvatar: string
  jobId: string
  jobTitle: string
  requisitionId?: string
  location?: string
  department?: string
  startDate: string
  endDate: string
  shiftType?: string
  billRate?: string
  notes?: string
  status: "Active" | "Upcoming" | "Completed" | "Ending Soon"
  complianceStatus: "Complete" | "Expiring" | "Missing"
  createdAt: string
  updatedAt: string
}

export type OrganizationWorkforceGroup = {
  id: string
  organizationId: string
  modality: string
  name: string
  limitShiftVisibility: boolean
  shiftVisibilityHours?: number // Hours to shift start
  routingPosition: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type OrganizationLocalDbState = {
  jobs: Record<string, OrganizationLocalDbJob>
  applications: Record<string, OrganizationLocalDbApplication>
  walletTemplates: Record<string, OrganizationLocalDbWalletTemplate>
  requisitionTemplates: Record<string, OrganizationLocalDbRequisitionTemplate>
  legacyTemplates: Record<string, OrganizationLocalDbLegacyTemplate>
  questionnaires: Record<string, OrganizationQuestionnaire>
  placements: Record<string, OrganizationPlacement>
  workforceGroups: Record<string, OrganizationWorkforceGroup>
  currentOrganizationId: string | null
  activeAdminWalletTemplateId: string | null // ID of the currently active admin wallet template
  lastUpdated?: string
}

export const defaultOrganizationLocalDbState: OrganizationLocalDbState = {
  jobs: {},
  applications: {},
  walletTemplates: {},
  requisitionTemplates: {},
  legacyTemplates: {},
  questionnaires: {},
  placements: {},
  workforceGroups: {},
  currentOrganizationId: null,
  activeAdminWalletTemplateId: null,
  lastUpdated: undefined,
}

export const ORGANIZATION_LOCAL_DB_SAFE_DEFAULTS = Object.freeze(defaultOrganizationLocalDbState)

// Default wallet templates for different occupations
function createDefaultWalletTemplates(organizationId: string): Record<string, OrganizationLocalDbWalletTemplate> {
  const allItems = Object.values(complianceItemsByCategory).flat()
  const getItem = (name: string): ComplianceItem | undefined => allItems.find(item => item.name === name)
  
  const templates: OrganizationLocalDbWalletTemplate[] = [
    {
      id: `wallet-rn-${organizationId}`,
      name: "RN Compliance Wallet",
      occupation: "RN",
      organizationId,
      items: [
        getItem("Active RN License")!,
        getItem("BLS Certification")!,
        getItem("ACLS Certification")!,
        getItem("Background Check")!,
        getItem("Drug Screening")!,
        getItem("Immunization Record")!,
        getItem("HIPAA Training")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `wallet-lpn-${organizationId}`,
      name: "LPN Compliance Wallet",
      occupation: "LPN",
      organizationId,
      items: [
        getItem("LPN License")!,
        getItem("BLS Certification")!,
        getItem("CPR Certification")!,
        getItem("Background Check")!,
        getItem("Drug Screening")!,
        getItem("Immunization Record")!,
        getItem("HIPAA Training")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `wallet-cna-${organizationId}`,
      name: "CNA Compliance Wallet",
      occupation: "CNA",
      organizationId,
      items: [
        getItem("CNA License")!,
        getItem("CPR Certification")!,
        getItem("Background Check")!,
        getItem("Drug Screening")!,
        getItem("Immunization Record")!,
        getItem("HIPAA Training")!,
        getItem("Safety Training")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `wallet-pt-${organizationId}`,
      name: "PT Compliance Wallet",
      occupation: "PT",
      organizationId,
      items: [
        getItem("PT License")!,
        getItem("BLS Certification")!,
        getItem("Background Check")!,
        getItem("Drug Screening")!,
        getItem("Immunization Record")!,
        getItem("HIPAA Training")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `wallet-ot-${organizationId}`,
      name: "OT Compliance Wallet",
      occupation: "OT",
      organizationId,
      items: [
        getItem("OT License")!,
        getItem("BLS Certification")!,
        getItem("Background Check")!,
        getItem("Drug Screening")!,
        getItem("Immunization Record")!,
        getItem("HIPAA Training")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `wallet-rt-${organizationId}`,
      name: "RT Compliance Wallet",
      occupation: "RT",
      organizationId,
      items: [
        getItem("BLS Certification")!,
        getItem("ACLS Certification")!,
        getItem("Background Check")!,
        getItem("Drug Screening")!,
        getItem("Immunization Record")!,
        getItem("HIPAA Training")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `wallet-st-${organizationId}`,
      name: "ST Compliance Wallet",
      occupation: "ST",
      organizationId,
      items: [
        getItem("BLS Certification")!,
        getItem("Background Check")!,
        getItem("Drug Screening")!,
        getItem("Immunization Record")!,
        getItem("HIPAA Training")!,
        getItem("Infection Control Training")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `wallet-mt-${organizationId}`,
      name: "MT Compliance Wallet",
      occupation: "MT",
      organizationId,
      items: [
        getItem("BLS Certification")!,
        getItem("CPR Certification")!,
        getItem("Background Check")!,
        getItem("Drug Screening")!,
        getItem("Immunization Record")!,
        getItem("HIPAA Training")!,
        getItem("Safety Training")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  return templates.reduce((acc, template) => {
    acc[template.id] = template
    return acc
  }, {} as Record<string, OrganizationLocalDbWalletTemplate>)
}

// Helper function to map item names to compliance list item IDs
function getComplianceListItemIdByName(name: string): string | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    const { getAllComplianceListItems } = require("@/lib/admin-local-db")
    const listItems = getAllComplianceListItems()
    
    // Map common name variations to actual compliance list item names
    const nameMapping: Record<string, string> = {
      "Active RN License": "Registered Nurse License",
      "RN License": "Registered Nurse License",
    }
    
    const mappedName = nameMapping[name] || name
    const listItem = listItems.find((item: any) => item.name === mappedName && item.isActive)
    return listItem?.id || null
  } catch (error) {
    console.warn("Failed to get compliance list item ID by name", error)
    return null
  }
}

// Default requisition templates for different occupations
// These match the legacy templates: "ICU Core Checklist" and "Med Surg Baseline"
export function createDefaultRequisitionTemplates(organizationId: string): Record<string, OrganizationLocalDbRequisitionTemplate> {
  // Helper to get compliance list item IDs by name
  const getListItemId = (name: string): string | null => getComplianceListItemIdByName(name)
  
  const templates: OrganizationLocalDbRequisitionTemplate[] = [
    {
      id: `req-icu-core-${organizationId}`,
      name: "ICU Core Checklist",
      occupation: "RN",
      department: "ICU",
      organizationId,
      listItemIds: [
        getListItemId("Active RN License"),
        getListItemId("ACLS Certification"),
        getListItemId("Background Check"),
      ].filter((id): id is string => id !== null),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `req-med-surg-${organizationId}`,
      name: "Med Surg Baseline",
      occupation: "RN",
      department: "Med-Surg",
      organizationId,
      listItemIds: [
        getListItemId("Active RN License"),
        getListItemId("CPR Certification"),
      ].filter((id): id is string => id !== null),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `req-rn-icu-${organizationId}`,
      name: "RN - ICU Requisition Template",
      occupation: "RN",
      department: "ICU",
      organizationId,
      listItemIds: [
        getListItemId("Active RN License"),
        getListItemId("ACLS Certification"),
        getListItemId("BLS Certification"),
        getListItemId("Background Check"),
        getListItemId("Drug Screening"),
        getListItemId("Immunization Record"),
      ].filter((id): id is string => id !== null),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `req-rn-er-${organizationId}`,
      name: "RN - ER Requisition Template",
      occupation: "RN",
      department: "Emergency",
      organizationId,
      listItemIds: [
        getListItemId("Active RN License"),
        getListItemId("ACLS Certification"),
        getListItemId("PALS Certification"),
        // Note: TNCC Certification not in compliance list, skipping
        getListItemId("Background Check"),
        getListItemId("Drug Screening"),
        getListItemId("Immunization Record"),
      ].filter((id): id is string => id !== null),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `req-lpn-${organizationId}`,
      name: "LPN Requisition Template",
      occupation: "LPN",
      department: "Med-Surg",
      organizationId,
      listItemIds: [
        getListItemId("LPN License"),
        getListItemId("BLS Certification"),
        getListItemId("CPR Certification"),
        getListItemId("Background Check"),
        getListItemId("Drug Screening"),
        getListItemId("Immunization Record"),
      ].filter((id): id is string => id !== null),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `req-cna-${organizationId}`,
      name: "CNA Requisition Template",
      occupation: "CNA",
      department: "Long-term Care",
      organizationId,
      listItemIds: [
        getListItemId("CNA License"),
        getListItemId("CPR Certification"),
        getListItemId("Background Check"),
        getListItemId("Drug Screening"),
        getListItemId("Immunization Record"),
      ].filter((id): id is string => id !== null),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `req-pt-${organizationId}`,
      name: "PT Requisition Template",
      occupation: "PT",
      department: "Rehabilitation",
      organizationId,
      listItemIds: [
        getListItemId("PT License"),
        getListItemId("BLS Certification"),
        getListItemId("Background Check"),
        getListItemId("Drug Screening"),
        getListItemId("Immunization Record"),
      ].filter((id): id is string => id !== null),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  return templates.reduce((acc, template) => {
    acc[template.id] = template
    return acc
  }, {} as Record<string, OrganizationLocalDbRequisitionTemplate>)
}

// Default legacy compliance templates for organizations
// These are the templates created in /organization/compliance/templates (Legacy Templates tab)
export function createDefaultLegacyTemplates(organizationId: string): Record<string, OrganizationLocalDbLegacyTemplate> {
  const allItems = Object.values(complianceItemsByCategory).flat()
  const getItem = (name: string): ComplianceItem | undefined => allItems.find(item => item.name === name)
  
  const templates: OrganizationLocalDbLegacyTemplate[] = [
    {
      id: `legacy-icu-core-${organizationId}`,
      name: "ICU Core Checklist",
      description: "Standard ICU requirements (license + ACLS + background).",
      organizationId,
      items: [
        getItem("Active RN License")!,
        getItem("ACLS Certification")!,
        getItem("Background Check")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `legacy-med-surg-${organizationId}`,
      name: "Med Surg Baseline",
      description: "Baseline onboarding for Med Surg roles.",
      organizationId,
      items: [
        getItem("Active RN License")!,
        getItem("CPR Certification")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `legacy-emergency-${organizationId}`,
      name: "Emergency Department Template",
      description: "Complete requirements for emergency department staff.",
      organizationId,
      items: [
        getItem("Active RN License")!,
        getItem("ACLS Certification")!,
        getItem("PALS Certification")!,
        getItem("TNCC Certification")!,
        getItem("Background Check")!,
        getItem("Drug Screening")!,
        getItem("Immunization Record")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  return templates.reduce((acc, template) => {
    acc[template.id] = template
    return acc
  }, {} as Record<string, OrganizationLocalDbLegacyTemplate>)
}

export function readOrganizationLocalDb(): OrganizationLocalDbState {
  if (typeof window === "undefined") {
    return defaultOrganizationLocalDbState
  }
  try {
    const raw = window.localStorage.getItem(ORGANIZATION_LOCAL_DB_KEY)
    if (!raw) {
      // If no data exists, create default templates and return
      const defaultWalletTemplates = createDefaultWalletTemplates("admin")
      const defaultRequisitionTemplates = createDefaultRequisitionTemplates("admin")
      const defaultLegacyTemplates = createDefaultLegacyTemplates("admin")
      const initialState: OrganizationLocalDbState = {
        jobs: {},
        applications: {},
        walletTemplates: defaultWalletTemplates,
        requisitionTemplates: defaultRequisitionTemplates,
        legacyTemplates: defaultLegacyTemplates,
        questionnaires: {},
        placements: {},
        workforceGroups: {},
        currentOrganizationId: null,
        activeAdminWalletTemplateId: null,
        lastUpdated: undefined,
      }
      persistOrganizationLocalDb(initialState)
      console.log("Created initial templates:", {
        wallet: Object.keys(defaultWalletTemplates).length,
        requisition: Object.keys(defaultRequisitionTemplates).length,
        legacy: Object.keys(defaultLegacyTemplates).length
      })
      return initialState
    }
    const parsed = JSON.parse(raw) as Partial<OrganizationLocalDbState>
    
    // Initialize default wallet templates for "admin" organization if none exist
    const existingWalletTemplates = parsed.walletTemplates ?? {}
    const adminWalletTemplates = Object.values(existingWalletTemplates).filter(
      (t) => t.organizationId === "admin"
    )
    
    // Initialize default requisition templates for "admin" organization if none exist
    const existingRequisitionTemplates = parsed.requisitionTemplates ?? {}
    // Check if there are any admin requisition templates
    const adminRequisitionTemplates = existingRequisitionTemplates && typeof existingRequisitionTemplates === 'object'
      ? Object.values(existingRequisitionTemplates).filter(
          (t) => t && typeof t === 'object' && t.organizationId === "admin"
        )
      : []
    
    // Initialize default legacy templates for "admin" organization if none exist
    const existingLegacyTemplates = parsed.legacyTemplates ?? {}
    const adminLegacyTemplates = Object.values(existingLegacyTemplates).filter(
      (t) => t && t.organizationId === "admin"
    )
    
    let stateWithDefaults: OrganizationLocalDbState | null = null
    let needsUpdate = false
    
    // If no admin wallet templates exist, create default ones
    if (adminWalletTemplates.length === 0) {
      const defaultWalletTemplates = createDefaultWalletTemplates("admin")
      stateWithDefaults = {
        jobs: parsed.jobs ?? {},
        applications: parsed.applications ?? {},
        walletTemplates: { ...existingWalletTemplates, ...defaultWalletTemplates },
        requisitionTemplates: existingRequisitionTemplates,
        legacyTemplates: existingLegacyTemplates,
        questionnaires: parsed.questionnaires ?? {},
        placements: parsed.placements ?? {},
        workforceGroups: parsed.workforceGroups ?? {},
        currentOrganizationId: parsed.currentOrganizationId ?? null,
        activeAdminWalletTemplateId: parsed.activeAdminWalletTemplateId ?? null,
        lastUpdated: parsed.lastUpdated,
      }
      needsUpdate = true
    }
    
    // If no admin requisition templates exist, create default ones
    if (adminRequisitionTemplates.length === 0) {
      const defaultRequisitionTemplates = createDefaultRequisitionTemplates("admin")
      const currentState = stateWithDefaults || {
        jobs: parsed.jobs ?? {},
        applications: parsed.applications ?? {},
        walletTemplates: existingWalletTemplates,
        requisitionTemplates: existingRequisitionTemplates,
        legacyTemplates: existingLegacyTemplates,
        questionnaires: parsed.questionnaires ?? {},
        placements: parsed.placements ?? {},
        currentOrganizationId: parsed.currentOrganizationId ?? null,
        lastUpdated: parsed.lastUpdated,
      }
      stateWithDefaults = {
        ...currentState,
        requisitionTemplates: { ...currentState.requisitionTemplates, ...defaultRequisitionTemplates },
      }
      needsUpdate = true
    }
    
    // If no admin legacy templates exist, create default ones
    if (adminLegacyTemplates.length === 0) {
      const defaultLegacyTemplates = createDefaultLegacyTemplates("admin")
      const currentState = stateWithDefaults || {
        jobs: parsed.jobs ?? {},
        applications: parsed.applications ?? {},
        walletTemplates: existingWalletTemplates,
        requisitionTemplates: existingRequisitionTemplates,
        legacyTemplates: existingLegacyTemplates,
        questionnaires: parsed.questionnaires ?? {},
        placements: parsed.placements ?? {},
        workforceGroups: parsed.workforceGroups ?? {},
        currentOrganizationId: parsed.currentOrganizationId ?? null,
        activeAdminWalletTemplateId: parsed.activeAdminWalletTemplateId ?? null,
        lastUpdated: parsed.lastUpdated,
      }
      stateWithDefaults = {
        ...currentState,
        legacyTemplates: { ...currentState.legacyTemplates, ...defaultLegacyTemplates },
      }
      needsUpdate = true
    }
    
    if (needsUpdate && stateWithDefaults) {
      // Ensure questionnaires, placements, and workforceGroups fields exist
      if (!stateWithDefaults.questionnaires) {
        stateWithDefaults.questionnaires = {}
      }
      if (!stateWithDefaults.placements) {
        stateWithDefaults.placements = {}
      }
      if (!stateWithDefaults.workforceGroups) {
        stateWithDefaults.workforceGroups = {}
      }
      // Persist the default templates
      persistOrganizationLocalDb(stateWithDefaults)
      console.log("Initialized default templates:", {
        wallet: Object.keys(stateWithDefaults.walletTemplates).length,
        requisition: Object.keys(stateWithDefaults.requisitionTemplates).length,
        legacy: Object.keys(stateWithDefaults.legacyTemplates).length
      })
      return stateWithDefaults
    }
    
    return {
      jobs: parsed.jobs ?? {},
      applications: parsed.applications ?? {},
      walletTemplates: existingWalletTemplates,
      requisitionTemplates: existingRequisitionTemplates,
      legacyTemplates: existingLegacyTemplates,
      questionnaires: parsed.questionnaires ?? {},
      placements: parsed.placements ?? {},
      workforceGroups: parsed.workforceGroups ?? {},
      currentOrganizationId: parsed.currentOrganizationId ?? null,
      activeAdminWalletTemplateId: parsed.activeAdminWalletTemplateId ?? null,
      lastUpdated: parsed.lastUpdated,
    }
  } catch (error) {
    console.warn("Unable to parse organization local DB state", error)
    return defaultOrganizationLocalDbState
  }
}

export function persistOrganizationLocalDb(next: OrganizationLocalDbState) {
  if (typeof window === "undefined") {
    return
  }
  try {
    const stateWithTimestamp = {
      ...next,
      lastUpdated: new Date().toISOString(),
    }
    window.localStorage.setItem(ORGANIZATION_LOCAL_DB_KEY, JSON.stringify(stateWithTimestamp))
  } catch (error) {
    console.warn("Unable to persist organization local DB state", error)
  }
}

// Helper functions for jobs
export function getAllJobs(): OrganizationLocalDbJob[] {
  const state = readOrganizationLocalDb()
  return Object.values(state.jobs).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getJobsByOrganization(organizationId: string): OrganizationLocalDbJob[] {
  return getAllJobs().filter((job) => job.organizationId === organizationId)
}

export function getJobById(id: string): OrganizationLocalDbJob | null {
  const state = readOrganizationLocalDb()
  return state.jobs[id] || null
}

export function addJob(organizationId: string, job: Omit<OrganizationLocalDbJob, "id" | "organizationId" | "createdAt" | "updatedAt">): OrganizationLocalDbJob {
  const state = readOrganizationLocalDb()
  const newJob: OrganizationLocalDbJob = {
    ...job,
    id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    jobs: {
      ...state.jobs,
      [newJob.id]: newJob,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return newJob
}

export function updateJob(id: string, updates: Partial<Omit<OrganizationLocalDbJob, "id" | "organizationId" | "createdAt">>): OrganizationLocalDbJob | null {
  const state = readOrganizationLocalDb()
  const existing = state.jobs[id]
  if (!existing) {
    return null
  }
  const updatedJob: OrganizationLocalDbJob = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    jobs: {
      ...state.jobs,
      [id]: updatedJob,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return updatedJob
}

export function deleteJob(id: string): boolean {
  const state = readOrganizationLocalDb()
  if (!state.jobs[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.jobs
  const updatedState: OrganizationLocalDbState = {
    ...state,
    jobs: remaining,
  }
  persistOrganizationLocalDb(updatedState)
  return true
}

// Helper functions for applications
export function getAllApplications(): OrganizationLocalDbApplication[] {
  const state = readOrganizationLocalDb()
  return Object.values(state.applications).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getApplicationsByOrganization(organizationId: string): OrganizationLocalDbApplication[] {
  return getAllApplications().filter((app) => app.organizationId === organizationId)
}

export function getApplicationById(id: string): OrganizationLocalDbApplication | null {
  const state = readOrganizationLocalDb()
  return state.applications[id] || null
}

export function addApplication(organizationId: string, application: Omit<OrganizationLocalDbApplication, "id" | "organizationId" | "createdAt" | "updatedAt">): OrganizationLocalDbApplication {
  const state = readOrganizationLocalDb()
  const newApp: OrganizationLocalDbApplication = {
    ...application,
    id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    applications: {
      ...state.applications,
      [newApp.id]: newApp,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return newApp
}

export function updateApplication(id: string, updates: Partial<Omit<OrganizationLocalDbApplication, "id" | "organizationId" | "createdAt">>): OrganizationLocalDbApplication | null {
  const state = readOrganizationLocalDb()
  const existing = state.applications[id]
  if (!existing) {
    return null
  }
  const updatedApp: OrganizationLocalDbApplication = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    applications: {
      ...state.applications,
      [id]: updatedApp,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return updatedApp
}

// Helper functions for wallet templates
export function getWalletTemplatesByOrganization(organizationId: string): OrganizationLocalDbWalletTemplate[] {
  const state = readOrganizationLocalDb()
  return Object.values(state.walletTemplates)
    .filter((template) => {
      // Strict filtering: must match organizationId exactly, and never return "admin" templates for non-admin orgs
      if (template.organizationId !== organizationId) return false
      // Additional safeguard: if organizationId is not "admin", never return templates with organizationId "admin"
      if (organizationId !== "admin" && template.organizationId === "admin") return false
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function addWalletTemplate(organizationId: string, template: Omit<OrganizationLocalDbWalletTemplate, "id" | "organizationId" | "createdAt" | "updatedAt">): OrganizationLocalDbWalletTemplate {
  const state = readOrganizationLocalDb()
  const newTemplate: OrganizationLocalDbWalletTemplate = {
    ...template,
    id: `wallet-tmpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    walletTemplates: {
      ...state.walletTemplates,
      [newTemplate.id]: newTemplate,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return newTemplate
}

export function updateWalletTemplate(id: string, updates: Partial<Omit<OrganizationLocalDbWalletTemplate, "id" | "organizationId" | "createdAt">>): OrganizationLocalDbWalletTemplate | null {
  const state = readOrganizationLocalDb()
  const existing = state.walletTemplates[id]
  if (!existing) {
    return null
  }
  const updatedTemplate: OrganizationLocalDbWalletTemplate = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    walletTemplates: {
      ...state.walletTemplates,
      [id]: updatedTemplate,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return updatedTemplate
}

export function deleteWalletTemplate(id: string): boolean {
  const state = readOrganizationLocalDb()
  if (!state.walletTemplates[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.walletTemplates
  const updatedState: OrganizationLocalDbState = {
    ...state,
    walletTemplates: remaining,
  }
  persistOrganizationLocalDb(updatedState)
  return true
}

// Helper functions for requisition templates
export function getRequisitionTemplatesByOrganization(organizationId: string): OrganizationLocalDbRequisitionTemplate[] {
  const state = readOrganizationLocalDb()
  const allTemplates = Object.values(state.requisitionTemplates)
  
  console.log(`[getRequisitionTemplatesByOrganization] Requesting templates for org: ${organizationId}`)
  console.log(`[getRequisitionTemplatesByOrganization] Total templates in DB: ${allTemplates.length}`)
  
  const filtered = allTemplates
    .filter((template) => {
      // Strict filtering: must match organizationId exactly, and never return "admin" templates for non-admin orgs
      if (!template) {
        console.log(`[getRequisitionTemplatesByOrganization] Skipping null template`)
        return false
      }
      if (template.organizationId !== organizationId) {
        console.log(`[getRequisitionTemplatesByOrganization] Template "${template.name}" orgId "${template.organizationId}" doesn't match requested "${organizationId}"`)
        return false
      }
      // Additional safeguard: if organizationId is not "admin", never return templates with organizationId "admin"
      if (organizationId !== "admin" && template.organizationId === "admin") {
        console.warn(`[getRequisitionTemplatesByOrganization] BLOCKED: Template "${template.name}" has orgId "admin" but requested org is "${organizationId}"`)
        return false
      }
      console.log(`[getRequisitionTemplatesByOrganization] INCLUDING template "${template.name}" (orgId: ${template.organizationId})`)
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  console.log(`[getRequisitionTemplatesByOrganization] Returning ${filtered.length} templates for org ${organizationId}`)
  return filtered
}

export function addRequisitionTemplate(organizationId: string, template: Omit<OrganizationLocalDbRequisitionTemplate, "id" | "organizationId" | "createdAt" | "updatedAt">): OrganizationLocalDbRequisitionTemplate {
  const state = readOrganizationLocalDb()
  const newTemplate: OrganizationLocalDbRequisitionTemplate = {
    ...template,
    id: `req-tmpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    requisitionTemplates: {
      ...state.requisitionTemplates,
      [newTemplate.id]: newTemplate,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return newTemplate
}

export function updateRequisitionTemplate(id: string, updates: Partial<Omit<OrganizationLocalDbRequisitionTemplate, "id" | "organizationId" | "createdAt">>): OrganizationLocalDbRequisitionTemplate | null {
  const state = readOrganizationLocalDb()
  const existing = state.requisitionTemplates[id]
  if (!existing) {
    return null
  }
  const updatedTemplate: OrganizationLocalDbRequisitionTemplate = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    requisitionTemplates: {
      ...state.requisitionTemplates,
      [id]: updatedTemplate,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return updatedTemplate
}

export function getRequisitionTemplateById(id: string): OrganizationLocalDbRequisitionTemplate | null {
  const state = readOrganizationLocalDb()
  return state.requisitionTemplates[id] || null
}

export function deleteRequisitionTemplate(id: string): boolean {
  const state = readOrganizationLocalDb()
  if (!state.requisitionTemplates[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.requisitionTemplates
  const updatedState: OrganizationLocalDbState = {
    ...state,
    requisitionTemplates: remaining,
  }
  persistOrganizationLocalDb(updatedState)
  return true
}

// Set current organization (for login)
export function setCurrentOrganization(organizationId: string | null) {
  const state = readOrganizationLocalDb()
  
  // If an organization is logging in (not admin), ensure they have their own templates
  if (organizationId && organizationId !== "admin") {
    const existingRequisitionTemplates = state.requisitionTemplates ?? {}
    const existingLegacyTemplates = state.legacyTemplates ?? {}
    
    const orgRequisitionTemplates = Object.values(existingRequisitionTemplates).filter(
      (t) => t && t.organizationId === organizationId
    )
    const orgLegacyTemplates = Object.values(existingLegacyTemplates).filter(
      (t) => t && t.organizationId === organizationId
    )
    
    let needsUpdate = false
    let updatedState: OrganizationLocalDbState = { ...state, currentOrganizationId: organizationId }
    
    // ALWAYS ensure organization has default requisition templates (create if missing)
    if (orgRequisitionTemplates.length === 0) {
      const defaultRequisitionTemplates = createDefaultRequisitionTemplates(organizationId)
      updatedState = {
        ...updatedState,
        requisitionTemplates: { ...existingRequisitionTemplates, ...defaultRequisitionTemplates },
      }
      needsUpdate = true
      console.log(`[Organization Login] Created ${Object.keys(defaultRequisitionTemplates).length} default requisition templates for organization ${organizationId}`)
    } else {
      console.log(`[Organization Login] Organization ${organizationId} already has ${orgRequisitionTemplates.length} requisition templates`)
    }
    
    // ALWAYS ensure organization has default legacy templates (create if missing)
    if (orgLegacyTemplates.length === 0) {
      const defaultLegacyTemplates = createDefaultLegacyTemplates(organizationId)
      updatedState = {
        ...updatedState,
        legacyTemplates: { ...existingLegacyTemplates, ...defaultLegacyTemplates },
      }
      needsUpdate = true
      console.log(`[Organization Login] Created ${Object.keys(defaultLegacyTemplates).length} default legacy templates for organization ${organizationId}`)
    } else {
      console.log(`[Organization Login] Organization ${organizationId} already has ${orgLegacyTemplates.length} legacy templates`)
    }
    
    if (needsUpdate) {
      persistOrganizationLocalDb(updatedState)
      // Force a storage event to notify other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new StorageEvent("storage", {
          key: ORGANIZATION_LOCAL_DB_KEY,
          newValue: JSON.stringify(updatedState),
        }))
      }
      return
    }
  }
  
  const updatedState: OrganizationLocalDbState = {
    ...state,
    currentOrganizationId: organizationId,
  }
  persistOrganizationLocalDb(updatedState)
  // Force a storage event to notify other components
  if (typeof window !== "undefined") {
    window.dispatchEvent(new StorageEvent("storage", {
      key: ORGANIZATION_LOCAL_DB_KEY,
      newValue: JSON.stringify(updatedState),
    }))
  }
}

export function getCurrentOrganization(): string | null {
  const state = readOrganizationLocalDb()
  return state.currentOrganizationId
}

// Helper functions for legacy compliance templates
export function getLegacyTemplatesByOrganization(organizationId: string): OrganizationLocalDbLegacyTemplate[] {
  const state = readOrganizationLocalDb()
  return Object.values(state.legacyTemplates)
    .filter((template) => {
      // Strict filtering: must match organizationId exactly, and never return "admin" templates for non-admin orgs
      if (template.organizationId !== organizationId) return false
      // Additional safeguard: if organizationId is not "admin", never return templates with organizationId "admin"
      if (organizationId !== "admin" && template.organizationId === "admin") return false
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function addLegacyTemplate(organizationId: string, template: Omit<OrganizationLocalDbLegacyTemplate, "id" | "organizationId" | "createdAt" | "updatedAt">): OrganizationLocalDbLegacyTemplate {
  const state = readOrganizationLocalDb()
  const newTemplate: OrganizationLocalDbLegacyTemplate = {
    ...template,
    id: `legacy-tmpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    legacyTemplates: {
      ...state.legacyTemplates,
      [newTemplate.id]: newTemplate,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return newTemplate
}

export function updateLegacyTemplate(id: string, updates: Partial<Omit<OrganizationLocalDbLegacyTemplate, "id" | "organizationId" | "createdAt">>): OrganizationLocalDbLegacyTemplate | null {
  const state = readOrganizationLocalDb()
  const existing = state.legacyTemplates[id]
  if (!existing) {
    return null
  }
  const updatedTemplate: OrganizationLocalDbLegacyTemplate = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    legacyTemplates: {
      ...state.legacyTemplates,
      [id]: updatedTemplate,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return updatedTemplate
}

export function deleteLegacyTemplate(id: string): boolean {
  const state = readOrganizationLocalDb()
  if (!state.legacyTemplates[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.legacyTemplates
  const updatedState: OrganizationLocalDbState = {
    ...state,
    legacyTemplates: remaining,
  }
  persistOrganizationLocalDb(updatedState)
  return true
}

// Helper functions for questionnaires
export function getQuestionnaireByOrganization(organizationId: string): OrganizationQuestionnaire | null {
  const state = readOrganizationLocalDb()
  const questionnaire = Object.values(state.questionnaires).find(
    (q) => q.organizationId === organizationId
  )
  return questionnaire || null
}

export function addOrUpdateQuestionnaire(organizationId: string, questionnaire: Omit<OrganizationQuestionnaire, "id" | "organizationId" | "createdAt" | "updatedAt">): OrganizationQuestionnaire {
  const state = readOrganizationLocalDb()
  const existing = Object.values(state.questionnaires).find(
    (q) => q.organizationId === organizationId
  )

  if (existing) {
    // Update existing
    const updated: OrganizationQuestionnaire = {
      ...existing,
      customQuestions: questionnaire.customQuestions,
      updatedAt: new Date().toISOString(),
    }
    const updatedState: OrganizationLocalDbState = {
      ...state,
      questionnaires: {
        ...state.questionnaires,
        [existing.id]: updated,
      },
    }
    persistOrganizationLocalDb(updatedState)
    return updated
  } else {
    // Create new
    const newQuestionnaire: OrganizationQuestionnaire = {
      ...questionnaire,
      id: `questionnaire-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updatedState: OrganizationLocalDbState = {
      ...state,
      questionnaires: {
        ...state.questionnaires,
        [newQuestionnaire.id]: newQuestionnaire,
      },
    }
    persistOrganizationLocalDb(updatedState)
    return newQuestionnaire
  }
}

export function deleteQuestionnaire(organizationId: string): boolean {
  const state = readOrganizationLocalDb()
  const questionnaire = Object.values(state.questionnaires).find(
    (q) => q.organizationId === organizationId
  )
  if (!questionnaire) {
    return false
  }
  const { [questionnaire.id]: removed, ...remaining } = state.questionnaires
  const updatedState: OrganizationLocalDbState = {
    ...state,
    questionnaires: remaining,
  }
  persistOrganizationLocalDb(updatedState)
  return true
}

// Helper functions for placements
export function getAllPlacements(): OrganizationPlacement[] {
  const state = readOrganizationLocalDb()
  return Object.values(state.placements).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getPlacementsByOrganization(organizationId: string): OrganizationPlacement[] {
  return getAllPlacements().filter((placement) => placement.organizationId === organizationId)
}

export function getPlacementById(id: string): OrganizationPlacement | null {
  const state = readOrganizationLocalDb()
  return state.placements[id] || null
}

export function addPlacement(organizationId: string, placement: Omit<OrganizationPlacement, "id" | "organizationId" | "createdAt" | "updatedAt">): OrganizationPlacement {
  const state = readOrganizationLocalDb()
  const newPlacement: OrganizationPlacement = {
    ...placement,
    id: `placement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    placements: {
      ...state.placements,
      [newPlacement.id]: newPlacement,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return newPlacement
}

export function updatePlacement(id: string, updates: Partial<Omit<OrganizationPlacement, "id" | "organizationId" | "createdAt">>): OrganizationPlacement | null {
  const state = readOrganizationLocalDb()
  const existing = state.placements[id]
  if (!existing) {
    return null
  }
  const updatedPlacement: OrganizationPlacement = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    placements: {
      ...state.placements,
      [id]: updatedPlacement,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return updatedPlacement
}

export function deletePlacement(id: string): boolean {
  const state = readOrganizationLocalDb()
  if (!state.placements[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.placements
  const updatedState: OrganizationLocalDbState = {
    ...state,
    placements: remaining,
  }
  persistOrganizationLocalDb(updatedState)
  return true
}

export function getPlacementsByCandidate(candidateId: string): OrganizationPlacement[] {
  return getAllPlacements().filter((placement) => placement.candidateId === candidateId)
}

// Helper functions for workforce groups
export function getAllWorkforceGroups(): OrganizationWorkforceGroup[] {
  const state = readOrganizationLocalDb()
  return Object.values(state.workforceGroups).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getWorkforceGroupsByOrganization(organizationId: string): OrganizationWorkforceGroup[] {
  return getAllWorkforceGroups().filter((group) => group.organizationId === organizationId)
}

export function getWorkforceGroupById(id: string): OrganizationWorkforceGroup | null {
  const state = readOrganizationLocalDb()
  return state.workforceGroups[id] || null
}

export function addWorkforceGroup(organizationId: string, group: Omit<OrganizationWorkforceGroup, "id" | "organizationId" | "createdAt" | "updatedAt">): OrganizationWorkforceGroup {
  const state = readOrganizationLocalDb()
  const newGroup: OrganizationWorkforceGroup = {
    ...group,
    id: `wf-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    organizationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    workforceGroups: {
      ...state.workforceGroups,
      [newGroup.id]: newGroup,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return newGroup
}

export function updateWorkforceGroup(id: string, updates: Partial<Omit<OrganizationWorkforceGroup, "id" | "organizationId" | "createdAt">>): OrganizationWorkforceGroup | null {
  const state = readOrganizationLocalDb()
  const existing = state.workforceGroups[id]
  if (!existing) {
    return null
  }
  const updatedGroup: OrganizationWorkforceGroup = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  const updatedState: OrganizationLocalDbState = {
    ...state,
    workforceGroups: {
      ...state.workforceGroups,
      [id]: updatedGroup,
    },
  }
  persistOrganizationLocalDb(updatedState)
  return updatedGroup
}

export function deleteWorkforceGroup(id: string): boolean {
  const state = readOrganizationLocalDb()
  if (!state.workforceGroups[id]) {
    return false
  }
  const { [id]: removed, ...remaining } = state.workforceGroups
  const updatedState: OrganizationLocalDbState = {
    ...state,
    workforceGroups: remaining,
  }
  persistOrganizationLocalDb(updatedState)
  return true
}

// Helper functions for active admin wallet template
export function getActiveAdminWalletTemplateId(): string | null {
  const state = readOrganizationLocalDb()
  return state.activeAdminWalletTemplateId || null
}

export function setActiveAdminWalletTemplateId(templateId: string | null): void {
  const state = readOrganizationLocalDb()
  const updatedState: OrganizationLocalDbState = {
    ...state,
    activeAdminWalletTemplateId: templateId,
  }
  persistOrganizationLocalDb(updatedState)
}

