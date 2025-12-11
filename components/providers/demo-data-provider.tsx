"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useComplianceTemplatesStore, type ComplianceItem } from "@/lib/compliance-templates-store"
import {
  getAllJobs,
  getJobsByOrganization,
  addJob as addJobToDb,
  updateJob as updateJobInDb,
  getWalletTemplatesByOrganization,
  getRequisitionTemplatesByOrganization,
  addWalletTemplate as addWalletTemplateToDb,
  updateWalletTemplate as updateWalletTemplateInDb,
  addRequisitionTemplate as addRequisitionTemplateToDb,
  updateRequisitionTemplate as updateRequisitionTemplateInDb,
  deleteRequisitionTemplate as deleteRequisitionTemplateFromDb,
  getCurrentOrganization,
  getAllApplications,
  getApplicationsByOrganization,
  addApplication as addApplicationToDb,
  updateApplication as updateApplicationInDb,
  ORGANIZATION_LOCAL_DB_KEY,
  type OrganizationLocalDbJob,
} from "@/lib/organization-local-db"
import type {
  Application,
  ApplicationInsight,
  CandidateDocument,
  CandidateProfile,
  Job,
  Notification,
  Vendor,
  VendorBid,
  VendorDetail,
  VendorLeaderboardRow,
} from "@/lib/mock-data"
import {
  applications as initialApplications,
  applicationInsights,
  candidates as initialCandidates,
  jobs as initialJobs,
  notifications as initialNotifications,
  onboardingDocumentMappings,
  vendorBids as initialVendorBids,
  vendorPerformanceKpis,
  vendorDetails as initialVendorDetails,
  vendors as initialVendors,
  buildVendorLeaderboard,
} from "@/lib/mock-data"

type CandidatePreferences = {
  email: boolean
  sms: boolean
  push: boolean
}

type OnboardingState = {
  personal: Record<string, string>
  workHistory: Record<string, string>
  skills: Record<string, string | string[]>
  availability: Record<string, string>
  requiredDocuments: string[]
}

export type WalletTemplate = {
  id: string
  name: string
  occupation?: string
  items: ComplianceItem[]
}

export type RequisitionTemplate = {
  id: string
  name: string
  department?: string
  occupation?: string
  listItemIds: string[] // References to ComplianceListItem.id from admin module
}

type DemoDataContextValue = {
  candidate: {
    profile: CandidateProfile
    documents: CandidateDocument[]
    notificationPrefs: CandidatePreferences
    onboarding: OnboardingState
    applications: Application[]
    notifications: Notification[]
  }
  organization: {
    jobs: Job[]
    applications: Application[]
    insights: ApplicationInsight[]
    candidates: CandidateProfile[]
    walletTemplates: WalletTemplate[]
    requisitionTemplates: RequisitionTemplate[]
  }
  vendor: {
    vendors: Vendor[]
    bids: VendorBid[]
    kpis: typeof vendorPerformanceKpis
    leaderboard: VendorLeaderboardRow[]
    details: VendorDetail[]
  }
  // All jobs from all organizations (for candidate portal)
  allJobs: Job[]
  actions: {
    uploadDocument: (payload: { name: string; type: string }) => Promise<CandidateDocument>
    replaceDocument: (docId: string, updates: Partial<CandidateDocument>) => Promise<void>
    deleteDocument: (docId: string) => Promise<CandidateDocument | undefined>
    updateNotificationPrefs: (prefs: Partial<CandidatePreferences>) => void
    markAllNotificationsRead: () => void
    setNotificationRead: (id: string, read: boolean) => void
    updateEmail: (email: string) => Promise<void>
    updateProfile: (updates: Partial<CandidateProfile>) => Promise<void>
    saveOnboardingStep: (step: keyof OnboardingState, data: Record<string, string | string[]>) => Promise<void>
    submitJobApplication: (jobId: string) => Promise<Application>
    createJob: (payload: {
      title: string
      location: string
      department: string
      unit: string
      shift: string
      hours: string
      billRate: string
      description: string
      requirements: string[]
      tags: string[]
      status?: Job["status"]
      complianceItems?: ComplianceItem[]
      complianceTemplateId?: string
      startDate?: string
      occupation?: string
    }) => Promise<Job>
    updateJob: (id: string, updates: Partial<Job>) => void
    updateApplicationStatus: (id: string, status: Application["status"]) => void
    rejectApplication: (id: string) => void
    submitVendorBid: (payload: { jobId: string; vendorName: string; rate: string; availability: string }) => Promise<VendorBid>
    createWalletTemplate: (payload: { name: string; occupation?: string }) => Promise<WalletTemplate>
    updateWalletTemplate: (id: string, updates: Partial<Omit<WalletTemplate, "id">>) => void
    addWalletTemplateItem: (templateId: string, item: ComplianceItem) => void
    removeWalletTemplateItem: (templateId: string, itemId: string) => void
    createRequisitionTemplate: (payload: { name: string; department?: string; occupation?: string }) => Promise<RequisitionTemplate>
    updateRequisitionTemplate: (id: string, updates: Partial<Omit<RequisitionTemplate, "id">>) => void
    deleteRequisitionTemplate: (id: string) => void
    addRequisitionTemplateItem: (templateId: string, item: ComplianceItem) => void
    removeRequisitionTemplateItem: (templateId: string, itemId: string) => void
    initializeCandidateWalletWithOccupation: (occupation: string) => Promise<void>
  }
}

const DemoDataContext = createContext<DemoDataContextValue | undefined>(undefined)

const simulateDelay = (min = 300, max = 600) =>
  new Promise<void>((resolve) => {
    const duration = Math.floor(Math.random() * (max - min + 1)) + min
    setTimeout(() => resolve(), duration)
  })

const formatDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString("en-US", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CandidateProfile>(initialCandidates[0])
  const [documents, setDocuments] = useState<CandidateDocument[]>(initialCandidates[0].documents)
  const [notificationPrefs, setNotificationPrefs] = useState<CandidatePreferences>({ email: true, sms: false, push: true })
  const [onboarding, setOnboarding] = useState<OnboardingState>({
    personal: {},
    workHistory: {},
    skills: {},
    availability: {},
    requiredDocuments: ["Resume", "Date of birth proof", "Certifications", "References", "License"],
  })
  const [vendorsState, setVendors] = useState<Vendor[]>(initialVendors)
  const [bidsState, setBids] = useState<VendorBid[]>(initialVendorBids)
  const [notificationList, setNotificationList] = useState<Notification[]>(initialNotifications)
  const [vendorDetailsState] = useState<VendorDetail[]>(initialVendorDetails)
  const templates = useComplianceTemplatesStore((state) => state.templates)

  // Get current organization ID from local DB (reactive state)
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return getCurrentOrganization()
  })

  // Sync current organization ID from local DB periodically and on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const syncOrgId = () => {
      const orgId = getCurrentOrganization()
      setCurrentOrganizationId(orgId)
    }
    syncOrgId()
    // Also listen for storage changes (in case another tab logs in)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ORGANIZATION_LOCAL_DB_KEY) {
        syncOrgId()
      }
    }
    window.addEventListener("storage", handleStorageChange)
    // Poll every 2 seconds to catch local changes (since storage event doesn't fire for same-tab changes)
    const interval = setInterval(syncOrgId, 2000)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Load jobs from organization-local-db
  // Always initialize with initialJobs to prevent hydration mismatch
  const [jobsState, setJobsState] = useState<Job[]>(initialJobs)

  // Load applications from organization-local-db
  // Always initialize with initialApplications to prevent hydration mismatch
  const [applicationsState, setApplicationsState] = useState<Application[]>(initialApplications)

  // Load wallet templates from organization-local-db
  // Always initialize with empty array to prevent hydration mismatch
  const [walletTemplates, setWalletTemplates] = useState<WalletTemplate[]>([])

  // Load requisition templates from organization-local-db
  // Always initialize with empty array to prevent hydration mismatch
  // For admin context (no currentOrganizationId), load templates with organizationId "admin"
  const [requisitionTemplates, setRequisitionTemplates] = useState<RequisitionTemplate[]>([])

  // Sync jobs from local DB periodically and on mount
  // This runs only on the client after hydration to prevent mismatch
  useEffect(() => {
    if (typeof window === "undefined") return
    const syncJobs = () => {
      try {
        const allJobs = getAllJobs()
        const jobs = allJobs.map((job) => ({
          id: job.id,
          title: job.title,
          location: job.location,
          department: job.department,
          unit: job.unit,
          shift: job.shift,
          hours: job.hours,
          billRate: job.billRate,
          description: job.description,
          requirements: job.requirements,
          tags: job.tags,
          status: job.status,
          complianceItems: job.complianceItems,
          complianceTemplateId: job.complianceTemplateId,
          startDate: job.startDate,
          occupation: job.occupation,
        }))
        setJobsState(jobs)
      } catch (error) {
        console.warn("Failed to sync jobs from local DB", error)
      }
    }
    // Load from localStorage on mount (after hydration)
    syncJobs()
    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ORGANIZATION_LOCAL_DB_KEY) {
        syncJobs()
      }
    }
    window.addEventListener("storage", handleStorageChange)
    // Poll every 2 seconds to catch updates from same-tab operations
    const interval = setInterval(syncJobs, 2000)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Sync applications from local DB periodically and on mount
  // This runs only on the client after hydration to prevent mismatch
  useEffect(() => {
    if (typeof window === "undefined") return
    const syncApplications = () => {
      try {
        const allApps = getAllApplications()
        const apps = allApps.map((app) => ({
          id: app.id,
          jobId: app.jobId,
          candidateId: app.candidateId,
          candidateName: app.candidateName,
          status: app.status,
          submittedAt: app.submittedAt,
          documentStatus: app.documentStatus,
          vendorName: app.vendorName,
          matchScore: app.matchScore,
          submittedRelative: app.submittedRelative,
          missingDocuments: app.missingDocuments,
        }))
        setApplicationsState(apps)
      } catch (error) {
        console.warn("Failed to sync applications from local DB", error)
      }
    }
    // Load from localStorage on mount (after hydration)
    syncApplications()
    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ORGANIZATION_LOCAL_DB_KEY) {
        syncApplications()
      }
    }
    window.addEventListener("storage", handleStorageChange)
    // Poll every 2 seconds to catch updates from same-tab operations
    const interval = setInterval(syncApplications, 2000)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Sync templates when organization changes and periodically
  // Only load templates for the current organization (don't fall back to "admin" for organization users)
  useEffect(() => {
    if (typeof window === "undefined") {
      setWalletTemplates([])
      setRequisitionTemplates([])
      return
    }
    
    // Immediately clear templates when organization ID changes to prevent showing wrong templates
    setWalletTemplates([])
    setRequisitionTemplates([])
    
    const syncTemplates = () => {
      try {
        // Only load templates if we have a current organization ID
        // Don't fall back to "admin" - organizations should only see their own templates
        if (!currentOrganizationId) {
          console.log("[Template Sync] No organization ID, clearing templates")
          setWalletTemplates([])
          setRequisitionTemplates([])
          return
        }
        
        console.log(`[Template Sync] Syncing templates for organization: ${currentOrganizationId}`)
        
        // Get templates directly from DB - these functions should already filter by organizationId
        const allWalletTmpls = getWalletTemplatesByOrganization(currentOrganizationId)
        const allReqTmpls = getRequisitionTemplatesByOrganization(currentOrganizationId)
        
        console.log(`[Template Sync] Found ${allReqTmpls.length} requisition templates in DB for org ${currentOrganizationId}`)
        
        // Double-check filtering (safety check)
        const walletTmpls = allWalletTmpls
          .filter((tmpl) => {
            if (!tmpl) return false
            // Never show "admin" templates to organization users
            if (currentOrganizationId !== "admin" && tmpl.organizationId === "admin") {
              console.warn(`[Template Sync] Found admin wallet template "${tmpl.name}" when org is ${currentOrganizationId}`)
              return false
            }
            // Only show templates that match the current organization
            if (tmpl.organizationId !== currentOrganizationId) {
              console.warn(`[Template Sync] Wallet template "${tmpl.name}" orgId "${tmpl.organizationId}" doesn't match "${currentOrganizationId}"`)
              return false
            }
            return true
          })
          .map((tmpl) => ({
            id: tmpl.id,
            name: tmpl.name,
            occupation: tmpl.occupation,
            items: tmpl.items,
          }))
        setWalletTemplates(walletTmpls)

        const reqTmpls = allReqTmpls
          .filter((tmpl) => {
            if (!tmpl) return false
            // Never show "admin" templates to organization users
            if (currentOrganizationId !== "admin" && tmpl.organizationId === "admin") {
              console.warn(`[Template Sync] Found admin requisition template "${tmpl.name}" when org is ${currentOrganizationId}`)
              return false
            }
            // Only show templates that match the current organization
            if (tmpl.organizationId !== currentOrganizationId) {
              console.warn(`[Template Sync] Requisition template "${tmpl.name}" orgId "${tmpl.organizationId}" doesn't match "${currentOrganizationId}"`)
              return false
            }
            return true
          })
          .map((tmpl) => ({
            id: tmpl.id,
            name: tmpl.name,
            department: tmpl.department,
            occupation: tmpl.occupation,
            listItemIds: tmpl.listItemIds,
          }))
        console.log(`[Template Sync] Setting ${reqTmpls.length} requisition templates for org ${currentOrganizationId}:`, reqTmpls.map(t => `${t.name} (${t.id})`))
        setRequisitionTemplates(reqTmpls)
      } catch (error) {
        console.error("Failed to sync templates from local DB", error)
        setWalletTemplates([])
        setRequisitionTemplates([])
      }
    }

    // Immediate sync
    syncTemplates()
    // Also poll every 1 second to catch updates
    const interval = setInterval(syncTemplates, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [currentOrganizationId])

  const primaryCandidate = useMemo(() => ({ ...profile, documents }), [profile, documents])
  const candidatePool = useMemo(() => [primaryCandidate, ...initialCandidates.slice(1)], [primaryCandidate])

  const computeMatchScore = useCallback(
    (application: Application) => {
      const candidate = candidatePool.find((item) => item.id === application.candidateId)
      const job = jobsState.find((item) => item.id === application.jobId)
      if (!candidate || !job) {
        return application.matchScore ?? 70
      }
      const requirementMatches = job.requirements.filter((req) =>
        candidate.documents.some((doc) => doc.type === req && doc.status === "Completed"),
      ).length
      const skillMatches = candidate.skills.filter((skill) =>
        job.tags.some((tag) => tag.toLowerCase().includes(skill.toLowerCase())),
      ).length
      const docPenalty = candidate.documents.filter((doc) => doc.status !== "Completed").length * 2
      const specialtyBonus = candidate.specialties.some((spec) => job.department.toLowerCase().includes(spec.toLowerCase())) ? 8 : 0
      const completionBonus = Math.round((candidate.profileCompletePct - 70) / 3)
      const base = 55 + requirementMatches * 6 + skillMatches * 4 + specialtyBonus + completionBonus - docPenalty
      return Math.max(45, Math.min(99, base))
    },
    [candidatePool, jobsState],
  )

  const enrichedApplications = useMemo(
    () =>
      applicationsState.map((application) => ({
        ...application,
        matchScore: computeMatchScore(application),
        submittedRelative: formatDateTime(application.submittedAt),
      })),
    [applicationsState, computeMatchScore],
  )

  const vendorLeaderboardState = useMemo(
    () => buildVendorLeaderboard(vendorsState, bidsState),
    [vendorsState, bidsState],
  )

  const uploadDocument = useCallback(
    async ({ name, type }: { name: string; type: string }) => {
      await simulateDelay()
      const newDoc: CandidateDocument = {
        id: crypto.randomUUID(),
        name,
        type,
        status: "Pending Verification",
        expiresOn: new Date(Date.now() + 31536000000).toISOString().slice(0, 10),
        lastUpdated: new Date().toISOString().slice(0, 10),
      }
      setDocuments((prev) => [...prev, newDoc])
      return newDoc
    },
    [],
  )

  const replaceDocument = useCallback(async (docId: string, updates: Partial<CandidateDocument>) => {
    await simulateDelay()
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, ...updates, lastUpdated: new Date().toISOString().slice(0, 10) } : doc)),
    )
  }, [])

  const deleteDocument = useCallback(async (docId: string) => {
    await simulateDelay()
    const docToDelete = documents.find((doc) => doc.id === docId)
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId))
    return docToDelete
  }, [documents])

  const updateNotificationPrefs = useCallback((prefs: Partial<CandidatePreferences>) => {
    setNotificationPrefs((prev) => ({ ...prev, ...prefs }))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotificationList((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }, [])

  const setNotificationRead = useCallback((id: string, read: boolean) => {
    setNotificationList((prev) => prev.map((notification) => (notification.id === id ? { ...notification, read } : notification)))
  }, [])

  const updateEmail = useCallback(async (email: string) => {
    await simulateDelay()
    setProfile((prev) => ({ ...prev, email }))
  }, [])

  const updateProfile = useCallback(async (updates: Partial<CandidateProfile>) => {
    await simulateDelay()
    setProfile((prev) => ({ ...prev, ...updates }))
  }, [])

  const saveOnboardingStep = useCallback(
    async (step: keyof OnboardingState, data: Record<string, string | string[]>) => {
      await simulateDelay()
      setOnboarding((prev) => {
        const next = { ...prev, [step]: data }
        const answers = Object.values(data)
        const requiredDocs = new Set(prev.requiredDocuments)
        answers.forEach((answer) => {
          const value = Array.isArray(answer) ? answer : [answer]
          value.forEach((entry) => {
            onboardingDocumentMappings
              .filter((mapping) => mapping.answer === entry)
              .forEach((mapping) => mapping.documents.forEach((doc) => requiredDocs.add(doc)))
          })
        })
        next.requiredDocuments = Array.from(requiredDocs)
        return next
      })
    },
    [],
  )

  const submitJobApplication = useCallback(
    async (jobId: string) => {
      await simulateDelay(500, 900)
      const job = jobsState.find((item) => item.id === jobId)
      if (!job) {
        throw new Error("Job not found")
      }
      const existing = applicationsState.find((app) => app.jobId === jobId && app.candidateId === profile.id)
      if (existing) {
        return existing
      }

      const template = job.complianceTemplateId ? templates.find((item) => item.id === job.complianceTemplateId) : undefined
      const templateRequirements = template
        ? template.items.filter((item) => item.requiredAtSubmission).map((item) => item.name)
        : []
      const requirementNames = (templateRequirements.length ? templateRequirements : job.requirements) ?? []
      const availableDocTypes = documents.map((doc) => doc.type)
      const missingDocuments = requirementNames.filter((req) => !availableDocTypes.includes(req))
      const documentStatus: Application["documentStatus"] = missingDocuments.length ? "Missing" : "Complete"
      const submissionTimestamp = new Date().toISOString()

      // Get organization ID from job (need to find it from local DB)
      let organizationId = currentOrganizationId || null
      if (!organizationId && typeof window !== "undefined") {
        try {
          const dbJob = getAllJobs().find((j) => j.id === jobId)
          if (dbJob) {
            organizationId = dbJob.organizationId
          }
        } catch (error) {
          console.warn("Failed to get organization ID from job", error)
        }
      }

      const application: Application = {
        id: crypto.randomUUID(),
        jobId,
        candidateId: profile.id,
        candidateName: profile.name,
        status: "Submitted",
        submittedAt: submissionTimestamp,
        documentStatus,
        vendorName: "Internal Talent",
        matchScore: 78,
        submittedRelative: "Just now",
        missingDocuments,
      }

      // Save to organization-local-db if we have organization ID
      if (organizationId && typeof window !== "undefined") {
        try {
          addApplicationToDb(organizationId, {
            jobId: application.jobId,
            candidateId: application.candidateId,
            candidateName: application.candidateName,
            status: application.status,
            submittedAt: application.submittedAt,
            documentStatus: application.documentStatus,
            vendorName: application.vendorName,
            matchScore: application.matchScore,
            submittedRelative: application.submittedRelative,
            missingDocuments: application.missingDocuments,
          })
          // Refresh applications from DB to ensure consistency
          const allApps = getAllApplications()
          const apps = allApps.map((app) => ({
            id: app.id,
            jobId: app.jobId,
            candidateId: app.candidateId,
            candidateName: app.candidateName,
            status: app.status,
            submittedAt: app.submittedAt,
            documentStatus: app.documentStatus,
            vendorName: app.vendorName,
            matchScore: app.matchScore,
            submittedRelative: app.submittedRelative,
            missingDocuments: app.missingDocuments,
          }))
          setApplicationsState(apps)
        } catch (error) {
          console.warn("Failed to save application to local DB", error)
          // Fallback: Update state directly if DB save fails
          setApplicationsState((prev) => [...prev, application])
        }
      } else {
        // Fallback: Update state directly if no organization ID
        setApplicationsState((prev) => [...prev, application])
      }
      setNotificationList((prev) => [
        { id: crypto.randomUUID(), title: "Application submitted", subtitle: job.title, time: "Just now", type: "job", read: false },
        ...prev,
      ])
      return application
    },
    [applicationsState, documents, jobsState, profile.id, profile.name, templates, currentOrganizationId],
  )

  const createJob = useCallback(
    async (payload: {
      title: string
      location: string
      department: string
      unit: string
      shift: string
      hours: string
      billRate: string
      description: string
      requirements: string[]
      tags: string[]
      status?: Job["status"]
      complianceItems?: ComplianceItem[]
      complianceTemplateId?: string
      startDate?: string
      occupation?: string
    }) => {
      await simulateDelay(400, 900)
      
      if (!currentOrganizationId) {
        throw new Error("No organization logged in")
      }

      // Save to organization-local-db
      const dbJob = addJobToDb(currentOrganizationId, {
        title: payload.title,
        location: payload.location,
        department: payload.department,
        unit: payload.unit,
        shift: payload.shift,
        hours: payload.hours,
        billRate: payload.billRate,
        description: payload.description,
        requirements: payload.requirements,
        tags: payload.tags,
        status: payload.status ?? "Draft",
        complianceItems: payload.complianceItems,
        complianceTemplateId: payload.complianceTemplateId,
        startDate: payload.startDate ?? new Date().toISOString().slice(0, 10),
        occupation: payload.occupation,
      })

      // Convert to Job format and update state
      const job: Job = {
        id: dbJob.id,
        title: dbJob.title,
        location: dbJob.location,
        department: dbJob.department,
        unit: dbJob.unit,
        shift: dbJob.shift,
        hours: dbJob.hours,
        billRate: dbJob.billRate,
        description: dbJob.description,
        requirements: dbJob.requirements,
        tags: dbJob.tags,
        status: dbJob.status,
        complianceItems: dbJob.complianceItems,
        complianceTemplateId: dbJob.complianceTemplateId,
        startDate: dbJob.startDate,
        occupation: dbJob.occupation,
      }
      
      // Refresh jobs from DB to include the new job
      if (typeof window !== "undefined") {
        try {
          const allJobs = getAllJobs()
          const updatedJobs = allJobs.map((j) => ({
            id: j.id,
            title: j.title,
            location: j.location,
            department: j.department,
            unit: j.unit,
            shift: j.shift,
            hours: j.hours,
            billRate: j.billRate,
            description: j.description,
            requirements: j.requirements,
            complianceItems: j.complianceItems,
            tags: j.tags,
            status: j.status,
            complianceTemplateId: j.complianceTemplateId,
            startDate: j.startDate,
            occupation: j.occupation,
          }))
          setJobsState(updatedJobs)
        } catch (error) {
          console.warn("Failed to refresh jobs from local DB", error)
          setJobsState((prev) => [...prev, job])
        }
      } else {
        setJobsState((prev) => [...prev, job])
      }
      return job
    },
    [currentOrganizationId],
  )

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    // Update in local DB
    if (typeof window !== "undefined") {
      try {
        updateJobInDb(id, updates)
        // Refresh jobs from DB to ensure consistency
        const allJobs = getAllJobs()
        const jobs = allJobs.map((job) => ({
          id: job.id,
          title: job.title,
          location: job.location,
          department: job.department,
          unit: job.unit,
          shift: job.shift,
          hours: job.hours,
          billRate: job.billRate,
          description: job.description,
          requirements: job.requirements,
          tags: job.tags,
          status: job.status,
          complianceTemplateId: job.complianceTemplateId,
          startDate: job.startDate,
          occupation: job.occupation,
        }))
        setJobsState(jobs)
        return
      } catch (error) {
        console.warn("Failed to update job in local DB", error)
      }
    }
    // Fallback: Update state directly if DB update fails
    setJobsState((prev) => prev.map((job) => (job.id === id ? { ...job, ...updates } : job)))
  }, [])

  const updateApplicationStatus = useCallback((id: string, status: Application["status"]) => {
    // Update in local DB
    if (typeof window !== "undefined") {
      try {
        updateApplicationInDb(id, { status })
        // Refresh applications from DB to ensure consistency
        const allApps = getAllApplications()
        const apps = allApps.map((app) => ({
          id: app.id,
          jobId: app.jobId,
          candidateId: app.candidateId,
          candidateName: app.candidateName,
          status: app.status,
          submittedAt: app.submittedAt,
          documentStatus: app.documentStatus,
          vendorName: app.vendorName,
          matchScore: app.matchScore,
          submittedRelative: app.submittedRelative,
          missingDocuments: app.missingDocuments,
        }))
        setApplicationsState(apps)
        return
      } catch (error) {
        console.warn("Failed to update application in local DB", error)
      }
    }
    // Fallback: Update state directly if DB update fails
    setApplicationsState((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)))
  }, [])

  const rejectApplication = useCallback((id: string) => {
    // Update in local DB
    if (typeof window !== "undefined") {
      try {
        updateApplicationInDb(id, { status: "Rejected" })
        // Refresh applications from DB to ensure consistency
        const allApps = getAllApplications()
        const apps = allApps.map((app) => ({
          id: app.id,
          jobId: app.jobId,
          candidateId: app.candidateId,
          candidateName: app.candidateName,
          status: app.status,
          submittedAt: app.submittedAt,
          documentStatus: app.documentStatus,
          vendorName: app.vendorName,
          matchScore: app.matchScore,
          submittedRelative: app.submittedRelative,
          missingDocuments: app.missingDocuments,
        }))
        setApplicationsState(apps)
        return
      } catch (error) {
        console.warn("Failed to update application in local DB", error)
      }
    }
    // Fallback: Update state directly if DB update fails
    setApplicationsState((prev) => prev.map((app) => (app.id === id ? { ...app, status: "Rejected" } : app)))
  }, [])

  const submitVendorBid = useCallback(
    async ({ jobId, vendorName, rate, availability }: { jobId: string; vendorName: string; rate: string; availability: string }) => {
      await simulateDelay()
      const bid: VendorBid = {
        id: crypto.randomUUID(),
        vendorName,
        jobId,
        status: "Submitted",
        submittedAt: new Date().toISOString().slice(0, 10),
        rate,
        availability,
      }
      setBids((prev) => [...prev, bid])
      return bid
    },
    [],
  )

  const createWalletTemplate = useCallback(
    async (payload: { name: string; occupation?: string }) => {
      await simulateDelay()
      
      if (!currentOrganizationId) {
        throw new Error("No organization logged in")
      }

      // Save to organization-local-db
      const dbTemplate = addWalletTemplateToDb(currentOrganizationId, {
        name: payload.name,
        occupation: payload.occupation,
        items: [],
      })

      const template: WalletTemplate = {
        id: dbTemplate.id,
        name: dbTemplate.name,
        occupation: dbTemplate.occupation,
        items: dbTemplate.items,
      }
      
      setWalletTemplates((prev) => [...prev, template])
      return template
    },
    [currentOrganizationId],
  )

  const updateWalletTemplate = useCallback((id: string, updates: Partial<Omit<WalletTemplate, "id">>) => {
    // Update in local DB
    if (typeof window !== "undefined" && currentOrganizationId) {
      try {
        updateWalletTemplateInDb(id, updates)
        // Refresh templates from DB to ensure consistency
        const walletTmpls = getWalletTemplatesByOrganization(currentOrganizationId).map((tmpl) => ({
          id: tmpl.id,
          name: tmpl.name,
          occupation: tmpl.occupation,
          items: tmpl.items,
        }))
        setWalletTemplates(walletTmpls)
        return
      } catch (error) {
        console.warn("Failed to update wallet template in local DB", error)
      }
    }
    // Fallback: Update state directly if DB update fails
    setWalletTemplates((prev) => prev.map((template) => (template.id === id ? { ...template, ...updates } : template)))
  }, [currentOrganizationId])

  const addWalletTemplateItem = useCallback((templateId: string, item: ComplianceItem) => {
    // Update in local DB
    if (typeof window !== "undefined" && currentOrganizationId) {
      try {
        const current = walletTemplates.find((t) => t.id === templateId)
        if (current) {
          updateWalletTemplateInDb(templateId, { items: [...current.items, item] })
          // Refresh templates from DB
          const walletTmpls = getWalletTemplatesByOrganization(currentOrganizationId).map((tmpl) => ({
            id: tmpl.id,
            name: tmpl.name,
            occupation: tmpl.occupation,
            items: tmpl.items,
          }))
          setWalletTemplates(walletTmpls)
          return
        }
      } catch (error) {
        console.warn("Failed to update wallet template in local DB", error)
      }
    }
    // Fallback: Update state directly if DB update fails
    setWalletTemplates((prev) =>
      prev.map((template) => (template.id === templateId ? { ...template, items: [...template.items, item] } : template)),
    )
  }, [walletTemplates, currentOrganizationId])

  const removeWalletTemplateItem = useCallback((templateId: string, itemId: string) => {
    // Update in local DB
    if (typeof window !== "undefined" && currentOrganizationId) {
      try {
        const current = walletTemplates.find((t) => t.id === templateId)
        if (current) {
          updateWalletTemplateInDb(templateId, { items: current.items.filter((item) => item.id !== itemId) })
          // Refresh templates from DB
          const walletTmpls = getWalletTemplatesByOrganization(currentOrganizationId).map((tmpl) => ({
            id: tmpl.id,
            name: tmpl.name,
            occupation: tmpl.occupation,
            items: tmpl.items,
          }))
          setWalletTemplates(walletTmpls)
          return
        }
      } catch (error) {
        console.warn("Failed to update wallet template in local DB", error)
      }
    }
    // Fallback: Update state directly if DB update fails
    setWalletTemplates((prev) =>
      prev.map((template) => (template.id === templateId ? { ...template, items: template.items.filter((item) => item.id !== itemId) } : template)),
    )
  }, [walletTemplates, currentOrganizationId])

  const createRequisitionTemplate = useCallback(
    async (payload: { name: string; department?: string; occupation?: string }) => {
      await simulateDelay()
      
      // Require organization ID - organizations must be logged in to create templates
      if (!currentOrganizationId) {
        throw new Error("No organization logged in")
      }

      // Save to organization-local-db
      const dbTemplate = addRequisitionTemplateToDb(currentOrganizationId, {
        name: payload.name,
        department: payload.department,
        occupation: payload.occupation,
        listItemIds: [],
      })

      const template: RequisitionTemplate = {
        id: dbTemplate.id,
        name: dbTemplate.name,
        department: dbTemplate.department,
        occupation: dbTemplate.occupation,
        listItemIds: dbTemplate.listItemIds,
      }
      
      setRequisitionTemplates((prev) => [...prev, template])
      return template
    },
    [currentOrganizationId],
  )

  const updateRequisitionTemplate = useCallback((id: string, updates: Partial<Omit<RequisitionTemplate, "id">>) => {
    // Update in local DB
    if (typeof window !== "undefined" && currentOrganizationId) {
      try {
        updateRequisitionTemplateInDb(id, updates)
        // Refresh templates from DB
        const reqTmpls = getRequisitionTemplatesByOrganization(currentOrganizationId).map((tmpl) => ({
          id: tmpl.id,
          name: tmpl.name,
          department: tmpl.department,
          occupation: tmpl.occupation,
          listItemIds: tmpl.listItemIds,
        }))
        setRequisitionTemplates(reqTmpls)
        return
      } catch (error) {
        console.warn("Failed to update requisition template in local DB", error)
      }
    }
    // Fallback: Update state directly if DB update fails
    setRequisitionTemplates((prev) => prev.map((template) => (template.id === id ? { ...template, ...updates } : template)))
  }, [currentOrganizationId])

  const deleteRequisitionTemplate = useCallback((id: string) => {
    // Delete from local DB
    if (typeof window !== "undefined") {
      try {
        deleteRequisitionTemplateFromDb(id)
      } catch (error) {
        console.warn("Failed to delete requisition template from local DB", error)
      }
    }
    // Update state
    setRequisitionTemplates((prev) => prev.filter((template) => template.id !== id))
  }, [])

  const addRequisitionTemplateItem = useCallback((templateId: string, item: ComplianceItem) => {
    // Extract list item ID from the ComplianceItem (it should have the original list item ID)
    // The AddItemModal creates items with list item IDs
    const listItemId = item.id
    
    // Update in local DB
    if (typeof window !== "undefined" && currentOrganizationId) {
      try {
        const current = requisitionTemplates.find((t) => t.id === templateId)
        if (current && listItemId) {
          // Check if already exists
          if (current.listItemIds.includes(listItemId)) {
            return
          }
          updateRequisitionTemplateInDb(templateId, { listItemIds: [...current.listItemIds, listItemId] })
          // Refresh templates from DB
          const reqTmpls = getRequisitionTemplatesByOrganization(currentOrganizationId).map((tmpl) => ({
            id: tmpl.id,
            name: tmpl.name,
            department: tmpl.department,
            listItemIds: tmpl.listItemIds,
          }))
          setRequisitionTemplates(reqTmpls)
          return
        }
      } catch (error) {
        console.warn("Failed to update requisition template in local DB", error)
      }
    }
    // Fallback: Update state directly if DB update fails
    if (listItemId) {
      setRequisitionTemplates((prev) =>
        prev.map((template) => 
          template.id === templateId && !template.listItemIds.includes(listItemId)
            ? { ...template, listItemIds: [...template.listItemIds, listItemId] }
            : template
        ),
      )
    }
  }, [requisitionTemplates, currentOrganizationId])

  const removeRequisitionTemplateItem = useCallback((templateId: string, itemId: string) => {
    // itemId is the compliance list item ID to remove
    // Update in local DB
    if (typeof window !== "undefined" && currentOrganizationId) {
      try {
        const current = requisitionTemplates.find((t) => t.id === templateId)
        if (current) {
          updateRequisitionTemplateInDb(templateId, { listItemIds: current.listItemIds.filter((id) => id !== itemId) })
          // Refresh templates from DB
          const reqTmpls = getRequisitionTemplatesByOrganization(currentOrganizationId).map((tmpl) => ({
            id: tmpl.id,
            name: tmpl.name,
            department: tmpl.department,
            listItemIds: tmpl.listItemIds,
          }))
          setRequisitionTemplates(reqTmpls)
          return
        }
      } catch (error) {
        console.warn("Failed to update requisition template in local DB", error)
      }
    }
    // Fallback: Update state directly if DB update fails
    setRequisitionTemplates((prev) =>
      prev.map((template) => (template.id === templateId ? { ...template, listItemIds: template.listItemIds.filter((id) => id !== itemId) } : template)),
    )
  }, [requisitionTemplates, currentOrganizationId])

  const initializeCandidateWalletWithOccupation = useCallback(
    async (occupation: string) => {
      // Map signup occupation values to wallet template occupation codes
      const occupationMapping: Record<string, string> = {
        "RN": "RN",
        "LPN/LVN": "LPN",
        "CNA": "CNA",
        "Medical Assistant": "MT", // Medical Tech/Assistant
        "Surgical Tech": "ST",
        "Physical Therapist": "PT",
        "Occupational Therapist": "OT",
        "Respiratory Therapist": "RT",
        "Nurse Practitioner": "RN", // Use RN template as fallback
        "Physician Assistant": "MT", // Use Medical Tech template as fallback
      }

      // Get the template occupation code
      const templateOccupation = occupationMapping[occupation] || occupation
      
      if (typeof window === "undefined") return
      
      try {
        const {
          getAdminWalletTemplatesByOccupation,
          getComplianceListItemById,
        } = require("@/lib/admin-local-db")
        
        // Get admin wallet templates for this occupation
        const templates = getAdminWalletTemplatesByOccupation(templateOccupation)
        
        if (templates.length === 0) {
          // If no template found, don't initialize documents
          return
        }

        // Collect all list items from all templates
        const itemNames = new Set<string>()
        templates.forEach((template: any) => {
          template.listItemIds.forEach((listItemId: string) => {
            const listItem = getComplianceListItemById(listItemId)
            if (listItem && listItem.isActive) {
              itemNames.add(listItem.name)
            }
          })
        })

        // Check if wallet is already initialized (avoid duplicates on login)
        const existingDocTypes = new Set(documents.map((doc) => doc.type))
        
        // Create documents from template items that don't already exist
        const newDocuments: CandidateDocument[] = Array.from(itemNames)
          .filter((itemName) => !existingDocTypes.has(itemName))
          .map((itemName) => ({
            id: crypto.randomUUID(),
            name: itemName,
            type: itemName,
            status: "Pending Upload" as const,
            expiresOn: "",
            lastUpdated: new Date().toISOString().slice(0, 10),
          }))

        if (newDocuments.length > 0) {
          setDocuments((prev) => [...prev, ...newDocuments])
        }
      } catch (error) {
        console.warn("Failed to initialize candidate wallet with occupation", error)
      }
    },
    [documents],
  )

  // Filter jobs and applications for organization (only show their own data)
  const organizationJobs = useMemo(() => {
    if (!currentOrganizationId) return []
    try {
      return getJobsByOrganization(currentOrganizationId).map((job) => ({
        id: job.id,
        title: job.title,
        location: job.location,
        department: job.department,
        unit: job.unit,
        shift: job.shift,
        hours: job.hours,
        billRate: job.billRate,
        description: job.description,
        requirements: job.requirements,
        tags: job.tags,
        status: job.status,
        complianceTemplateId: job.complianceTemplateId,
        startDate: job.startDate,
        occupation: job.occupation,
      }))
    } catch (error) {
      console.warn("Failed to get organization jobs", error)
      return []
    }
  }, [currentOrganizationId])

  const organizationApplications = useMemo(() => {
    if (!currentOrganizationId) return []
    try {
      return getApplicationsByOrganization(currentOrganizationId).map((app) => ({
        id: app.id,
        jobId: app.jobId,
        candidateId: app.candidateId,
        candidateName: app.candidateName,
        status: app.status,
        submittedAt: app.submittedAt,
        documentStatus: app.documentStatus,
        vendorName: app.vendorName,
        matchScore: app.matchScore,
        submittedRelative: app.submittedRelative,
        missingDocuments: app.missingDocuments,
      }))
    } catch (error) {
      console.warn("Failed to get organization applications", error)
      return []
    }
  }, [currentOrganizationId, applicationsState.length])

  const value: DemoDataContextValue = useMemo(
    () => ({
      candidate: {
        profile: primaryCandidate,
        documents,
        notificationPrefs,
        onboarding,
        applications: enrichedApplications.filter((app) => app.candidateId === primaryCandidate.id),
        notifications: notificationList,
      },
      organization: {
        // Organization sees only their jobs when logged in, otherwise show all (for candidate view)
        jobs: currentOrganizationId ? organizationJobs : jobsState,
        applications: currentOrganizationId ? organizationApplications : enrichedApplications,
        insights: applicationInsights,
        candidates: candidatePool,
        walletTemplates,
        requisitionTemplates,
      },
      // Expose all jobs for candidate portal (all organizations) - only show "Open" status jobs
      allJobs: jobsState.filter((job) => job.status === "Open"),
      vendor: {
        vendors: vendorsState,
        bids: bidsState,
        kpis: vendorPerformanceKpis,
        leaderboard: vendorLeaderboardState,
        details: vendorDetailsState,
      },
      actions: {
        uploadDocument,
        replaceDocument,
        deleteDocument,
        updateNotificationPrefs,
        markAllNotificationsRead,
        setNotificationRead,
        updateEmail,
        updateProfile,
        saveOnboardingStep,
        submitJobApplication,
        createJob,
        updateJob,
        updateApplicationStatus,
        rejectApplication,
        submitVendorBid,
        createWalletTemplate,
        updateWalletTemplate,
        addWalletTemplateItem,
        removeWalletTemplateItem,
        createRequisitionTemplate,
        updateRequisitionTemplate,
        deleteRequisitionTemplate,
        addRequisitionTemplateItem,
        removeRequisitionTemplateItem,
        initializeCandidateWalletWithOccupation,
      },
    }),
    [
      applicationInsights,
      candidatePool,
      documents,
      enrichedApplications,
      bidsState,
      jobsState,
      organizationJobs,
      organizationApplications,
      currentOrganizationId,
      notificationList,
      notificationPrefs,
      onboarding,
      primaryCandidate,
      uploadDocument,
      replaceDocument,
      deleteDocument,
      updateNotificationPrefs,
      markAllNotificationsRead,
      setNotificationRead,
      updateEmail,
      updateProfile,
      saveOnboardingStep,
      submitJobApplication,
      createJob,
      updateJob,
      updateApplicationStatus,
      rejectApplication,
      submitVendorBid,
      vendorsState,
      vendorLeaderboardState,
      vendorDetailsState,
      walletTemplates,
      requisitionTemplates,
      createWalletTemplate,
      updateWalletTemplate,
      addWalletTemplateItem,
      removeWalletTemplateItem,
      createRequisitionTemplate,
      updateRequisitionTemplate,
      deleteRequisitionTemplate,
      addRequisitionTemplateItem,
      removeRequisitionTemplateItem,
      initializeCandidateWalletWithOccupation,
    ],
  )

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>
}

export function useDemoData() {
  const context = useContext(DemoDataContext)
  if (!context) {
    throw new Error("useDemoData must be used within DemoDataProvider")
  }
  return context
}

