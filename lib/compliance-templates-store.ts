import { create } from "zustand"

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
  addTemplate: (template: Omit<ComplianceTemplate, "id">) => ComplianceTemplate
  updateTemplate: (id: string, updates: Partial<Omit<ComplianceTemplate, "id">>) => void
}

const initialTemplates: ComplianceTemplate[] = [
  {
    id: "tmpl-icu-core",
    name: "ICU Core Checklist",
    description: "Standard ICU requirements (license + ACLS + background).",
    items: [
      {
        id: "icu-1",
        name: "Active RN License",
        type: "License",
        expirationType: "Fixed Date",
        requiredAtSubmission: true,
      },
      {
        id: "icu-2",
        name: "ACLS Certification",
        type: "Certification",
        expirationType: "Fixed Date",
        requiredAtSubmission: true,
      },
      {
        id: "icu-3",
        name: "Background Check",
        type: "Background",
        expirationType: "Recurring",
        requiredAtSubmission: false,
      },
    ],
  },
  {
    id: "tmpl-med-surg",
    name: "Med Surg Baseline",
    description: "Baseline onboarding for Med Surg roles.",
    items: [
      {
        id: "ms-1",
        name: "Active RN License",
        type: "License",
        expirationType: "Fixed Date",
        requiredAtSubmission: true,
      },
      {
        id: "ms-2",
        name: "CPR Certification",
        type: "Certification",
        expirationType: "Fixed Date",
        requiredAtSubmission: true,
      },
    ],
  },
]

export const useComplianceTemplatesStore = create<ComplianceTemplateState>((set, get) => ({
  templates: initialTemplates,
  addTemplate: (template) => {
    const newTemplate: ComplianceTemplate = {
      id: crypto.randomUUID(),
      ...template,
    }
    set((state) => ({ templates: [...state.templates, newTemplate] }))
    return newTemplate
  },
  updateTemplate: (id, updates) => {
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === id ? { ...template, ...updates } : template,
      ),
    }))
  },
}))




