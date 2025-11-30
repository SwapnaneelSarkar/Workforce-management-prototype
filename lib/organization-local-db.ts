export const ORGANIZATION_LOCAL_DB_KEY = "wf_organization_local_db"

import type { Job, Application } from "@/lib/mock-data"
import type { WalletTemplate, RequisitionTemplate } from "@/components/providers/demo-data-provider"
import type { ComplianceItem } from "@/lib/compliance-templates-store"
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
}

export type OrganizationLocalDbState = {
  jobs: Record<string, OrganizationLocalDbJob>
  applications: Record<string, OrganizationLocalDbApplication>
  walletTemplates: Record<string, OrganizationLocalDbWalletTemplate>
  requisitionTemplates: Record<string, OrganizationLocalDbRequisitionTemplate>
  currentOrganizationId: string | null
  lastUpdated?: string
}

export const defaultOrganizationLocalDbState: OrganizationLocalDbState = {
  jobs: {},
  applications: {},
  walletTemplates: {},
  requisitionTemplates: {},
  currentOrganizationId: null,
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

// Default requisition templates for different occupations
export function createDefaultRequisitionTemplates(organizationId: string): Record<string, OrganizationLocalDbRequisitionTemplate> {
  const allItems = Object.values(complianceItemsByCategory).flat()
  const getItem = (name: string): ComplianceItem | undefined => allItems.find(item => item.name === name)
  
  const templates: OrganizationLocalDbRequisitionTemplate[] = [
    {
      id: `req-rn-icu-${organizationId}`,
      name: "RN - ICU Requisition Template",
      occupation: "RN",
      department: "ICU",
      organizationId,
      items: [
        getItem("Active RN License")!,
        getItem("ACLS Certification")!,
        getItem("BLS Certification")!,
        getItem("Background Check")!,
        getItem("Drug Screening")!,
        getItem("Immunization Record")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `req-rn-er-${organizationId}`,
      name: "RN - ER Requisition Template",
      occupation: "RN",
      department: "Emergency",
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
    {
      id: `req-lpn-${organizationId}`,
      name: "LPN Requisition Template",
      occupation: "LPN",
      department: "Med-Surg",
      organizationId,
      items: [
        getItem("LPN License")!,
        getItem("BLS Certification")!,
        getItem("CPR Certification")!,
        getItem("Background Check")!,
        getItem("Drug Screening")!,
        getItem("Immunization Record")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `req-cna-${organizationId}`,
      name: "CNA Requisition Template",
      occupation: "CNA",
      department: "Long-term Care",
      organizationId,
      items: [
        getItem("CNA License")!,
        getItem("CPR Certification")!,
        getItem("Background Check")!,
        getItem("Drug Screening")!,
        getItem("Immunization Record")!,
      ].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `req-pt-${organizationId}`,
      name: "PT Requisition Template",
      occupation: "PT",
      department: "Rehabilitation",
      organizationId,
      items: [
        getItem("PT License")!,
        getItem("BLS Certification")!,
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
  }, {} as Record<string, OrganizationLocalDbRequisitionTemplate>)
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
      const initialState: OrganizationLocalDbState = {
        jobs: {},
        applications: {},
        walletTemplates: defaultWalletTemplates,
        requisitionTemplates: defaultRequisitionTemplates,
        currentOrganizationId: null,
        lastUpdated: undefined,
      }
      persistOrganizationLocalDb(initialState)
      console.log("Created initial templates:", {
        wallet: Object.keys(defaultWalletTemplates).length,
        requisition: Object.keys(defaultRequisitionTemplates).length
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
        currentOrganizationId: parsed.currentOrganizationId ?? null,
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
        currentOrganizationId: parsed.currentOrganizationId ?? null,
        lastUpdated: parsed.lastUpdated,
      }
      stateWithDefaults = {
        ...currentState,
        requisitionTemplates: { ...currentState.requisitionTemplates, ...defaultRequisitionTemplates },
      }
      needsUpdate = true
    }
    
    if (needsUpdate && stateWithDefaults) {
      // Persist the default templates
      persistOrganizationLocalDb(stateWithDefaults)
      console.log("Initialized default templates:", {
        wallet: Object.keys(stateWithDefaults.walletTemplates).length,
        requisition: Object.keys(stateWithDefaults.requisitionTemplates).length
      })
      return stateWithDefaults
    }
    
    return {
      jobs: parsed.jobs ?? {},
      applications: parsed.applications ?? {},
      walletTemplates: existingWalletTemplates,
      requisitionTemplates: existingRequisitionTemplates,
      currentOrganizationId: parsed.currentOrganizationId ?? null,
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
    .filter((template) => template.organizationId === organizationId)
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
  return Object.values(state.requisitionTemplates)
    .filter((template) => template && template.organizationId === organizationId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
  const updatedState: OrganizationLocalDbState = {
    ...state,
    currentOrganizationId: organizationId,
  }
  persistOrganizationLocalDb(updatedState)
}

export function getCurrentOrganization(): string | null {
  const state = readOrganizationLocalDb()
  return state.currentOrganizationId
}


