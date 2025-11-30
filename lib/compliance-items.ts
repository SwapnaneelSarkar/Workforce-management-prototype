import type { ComplianceItem } from "./compliance-templates-store"

// Mock compliance items grouped by category (from Admin Compliance List Items)
export const complianceItemsByCategory: Record<string, ComplianceItem[]> = {
  Background: [
    {
      id: "bg-1",
      name: "Background Check",
      type: "Background",
      expirationType: "Recurring",
      requiredAtSubmission: false,
    },
    {
      id: "bg-2",
      name: "Drug Screening",
      type: "Background",
      expirationType: "Recurring",
      requiredAtSubmission: false,
    },
    {
      id: "bg-3",
      name: "Criminal Background Check",
      type: "Background",
      expirationType: "Recurring",
      requiredAtSubmission: true,
    },
  ],
  Licenses: [
    {
      id: "lic-1",
      name: "Active RN License",
      type: "License",
      expirationType: "Fixed Date",
      requiredAtSubmission: true,
    },
    {
      id: "lic-2",
      name: "LPN License",
      type: "License",
      expirationType: "Fixed Date",
      requiredAtSubmission: true,
    },
    {
      id: "lic-3",
      name: "PT License",
      type: "License",
      expirationType: "Fixed Date",
      requiredAtSubmission: true,
    },
    {
      id: "lic-4",
      name: "OT License",
      type: "License",
      expirationType: "Fixed Date",
      requiredAtSubmission: true,
    },
    {
      id: "lic-5",
      name: "CNA License",
      type: "License",
      expirationType: "Fixed Date",
      requiredAtSubmission: true,
    },
  ],
  Certifications: [
    {
      id: "cert-1",
      name: "ACLS Certification",
      type: "Certification",
      expirationType: "Fixed Date",
      requiredAtSubmission: true,
    },
    {
      id: "cert-2",
      name: "BLS Certification",
      type: "Certification",
      expirationType: "Fixed Date",
      requiredAtSubmission: true,
    },
    {
      id: "cert-3",
      name: "CPR Certification",
      type: "Certification",
      expirationType: "Fixed Date",
      requiredAtSubmission: true,
    },
    {
      id: "cert-4",
      name: "PALS Certification",
      type: "Certification",
      expirationType: "Fixed Date",
      requiredAtSubmission: true,
    },
    {
      id: "cert-5",
      name: "TNCC Certification",
      type: "Certification",
      expirationType: "Fixed Date",
      requiredAtSubmission: false,
    },
  ],
  Training: [
    {
      id: "train-1",
      name: "HIPAA Training",
      type: "Training",
      expirationType: "Recurring",
      requiredAtSubmission: false,
    },
    {
      id: "train-2",
      name: "Safety Training",
      type: "Training",
      expirationType: "Recurring",
      requiredAtSubmission: false,
    },
    {
      id: "train-3",
      name: "Infection Control Training",
      type: "Training",
      expirationType: "Recurring",
      requiredAtSubmission: false,
    },
  ],
  Other: [
    {
      id: "other-1",
      name: "Immunization Record",
      type: "Other",
      expirationType: "Fixed Date",
      requiredAtSubmission: true,
    },
    {
      id: "other-2",
      name: "Travel Agreement",
      type: "Other",
      expirationType: "None",
      requiredAtSubmission: false,
    },
    {
      id: "other-3",
      name: "Fatigue Acknowledgement",
      type: "Other",
      expirationType: "None",
      requiredAtSubmission: false,
    },
  ],
}

export const allComplianceItems: ComplianceItem[] = Object.values(complianceItemsByCategory).flat()
