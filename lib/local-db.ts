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

export type LocalDbState = {
  onboardingDetails: LocalDbOnboardingDetails
  uploadedDocuments: Record<string, LocalDbDocumentEntry>
  jobApplications: Record<string, LocalDbJobApplicationEntry>
  lastUpdated?: string
}

export const defaultLocalDbState: LocalDbState = {
  onboardingDetails: {},
  uploadedDocuments: {},
  jobApplications: {},
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

