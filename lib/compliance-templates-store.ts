import { create } from "zustand"
import {
  getLegacyTemplatesByOrganization,
  addLegacyTemplate,
  updateLegacyTemplate,
  deleteLegacyTemplate,
  getCurrentOrganization,
  ORGANIZATION_LOCAL_DB_KEY,
} from "@/lib/organization-local-db"

export type ComplianceItem = {
  id: string
  name: string
  type: "License" | "Certification" | "Background" | "Training" | "Other"
  expirationType: "None" | "Fixed Date" | "Recurring"
  requiredAtSubmission: boolean
}

export type ComplianceTemplate = {
  id: string
  name: string
  description?: string
  items: ComplianceItem[]
}

type ComplianceTemplateState = {
  templates: ComplianceTemplate[]
  organizationId: string | null
  loadTemplates: () => void
  addTemplate: (template: Omit<ComplianceTemplate, "id">) => ComplianceTemplate
  updateTemplate: (id: string, updates: Partial<Omit<ComplianceTemplate, "id">>) => void
  deleteTemplate: (id: string) => void
}

// Helper function to load templates from local DB
function loadTemplatesFromDb(): ComplianceTemplate[] {
  if (typeof window === "undefined") {
    return []
  }
  try {
    const organizationId = getCurrentOrganization() || "admin"
    const dbTemplates = getLegacyTemplatesByOrganization(organizationId)
    return dbTemplates.map((dbTemplate) => ({
      id: dbTemplate.id,
      name: dbTemplate.name,
      description: dbTemplate.description,
      items: dbTemplate.items,
    }))
  } catch (error) {
    console.warn("Failed to load templates from local DB", error)
    return []
  }
}

export const useComplianceTemplatesStore = create<ComplianceTemplateState>((set, get) => ({
  templates: typeof window !== "undefined" ? loadTemplatesFromDb() : [],
  organizationId: typeof window !== "undefined" ? getCurrentOrganization() : null,
  loadTemplates: () => {
    const templates = loadTemplatesFromDb()
    const organizationId = typeof window !== "undefined" ? getCurrentOrganization() : null
    set({ templates, organizationId })
  },
  addTemplate: (template) => {
    if (typeof window === "undefined") {
      // Fallback for SSR
      const newTemplate: ComplianceTemplate = {
        id: crypto.randomUUID(),
        ...template,
      }
      set((state) => ({ templates: [...state.templates, newTemplate] }))
      return newTemplate
    }

    try {
      const organizationId = getCurrentOrganization() || "admin"
      const dbTemplate = addLegacyTemplate(organizationId, {
        name: template.name,
        description: template.description,
        items: template.items,
      })
      
      const newTemplate: ComplianceTemplate = {
        id: dbTemplate.id,
        name: dbTemplate.name,
        description: dbTemplate.description,
        items: dbTemplate.items,
      }
      
      set((state) => ({ templates: [...state.templates, newTemplate] }))
      return newTemplate
    } catch (error) {
      console.warn("Failed to save template to local DB", error)
      // Fallback: add to state only
      const newTemplate: ComplianceTemplate = {
        id: crypto.randomUUID(),
        ...template,
      }
      set((state) => ({ templates: [...state.templates, newTemplate] }))
      return newTemplate
    }
  },
  updateTemplate: (id, updates) => {
    if (typeof window === "undefined") {
      // Fallback for SSR
      set((state) => ({
        templates: state.templates.map((template) =>
          template.id === id ? { ...template, ...updates } : template,
        ),
      }))
      return
    }

    try {
      const updated = updateLegacyTemplate(id, updates)
      if (updated) {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? {
                  id: updated.id,
                  name: updated.name,
                  description: updated.description,
                  items: updated.items,
                }
              : template,
          ),
        }))
      } else {
        // Fallback: update state only if DB update failed
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id ? { ...template, ...updates } : template,
          ),
        }))
      }
    } catch (error) {
      console.warn("Failed to update template in local DB", error)
      // Fallback: update state only
      set((state) => ({
        templates: state.templates.map((template) =>
          template.id === id ? { ...template, ...updates } : template,
        ),
      }))
    }
  },
  deleteTemplate: (id) => {
    if (typeof window === "undefined") {
      // Fallback for SSR
      set((state) => ({
        templates: state.templates.filter((template) => template.id !== id),
      }))
      return
    }

    try {
      const deleted = deleteLegacyTemplate(id)
      if (deleted) {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        }))
      }
    } catch (error) {
      console.warn("Failed to delete template from local DB", error)
      // Fallback: update state only
      set((state) => ({
        templates: state.templates.filter((template) => template.id !== id),
      }))
    }
  },
}))

// Listen for storage changes to sync templates
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === ORGANIZATION_LOCAL_DB_KEY) {
      useComplianceTemplatesStore.getState().loadTemplates()
    }
  })
  
  // Also poll periodically to catch same-tab changes
  setInterval(() => {
    const currentOrgId = getCurrentOrganization()
    const storeOrgId = useComplianceTemplatesStore.getState().organizationId
    if (currentOrgId !== storeOrgId) {
      useComplianceTemplatesStore.getState().loadTemplates()
    }
  }, 2000)
}





