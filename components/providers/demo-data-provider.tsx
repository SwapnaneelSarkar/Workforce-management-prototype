"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useComplianceTemplatesStore } from "@/lib/compliance-templates-store"
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
  }
  vendor: {
    vendors: Vendor[]
    bids: VendorBid[]
    kpis: typeof vendorPerformanceKpis
    leaderboard: VendorLeaderboardRow[]
    details: VendorDetail[]
  }
  actions: {
    uploadDocument: (payload: { name: string; type: string }) => Promise<CandidateDocument>
    replaceDocument: (docId: string, updates: Partial<CandidateDocument>) => Promise<void>
    updateNotificationPrefs: (prefs: Partial<CandidatePreferences>) => void
    markAllNotificationsRead: () => void
    setNotificationRead: (id: string, read: boolean) => void
    updateEmail: (email: string) => Promise<void>
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
      complianceTemplateId?: string
      startDate?: string
    }) => Promise<Job>
    updateJob: (id: string, updates: Partial<Job>) => void
    updateApplicationStatus: (id: string, status: Application["status"]) => void
    rejectApplication: (id: string) => void
    submitVendorBid: (payload: { jobId: string; vendorName: string; rate: string; availability: string }) => Promise<VendorBid>
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
  const [applicationsState, setApplicationsState] = useState<Application[]>(initialApplications)
  const [jobsState, setJobsState] = useState<Job[]>(initialJobs)
  const [vendorsState, setVendors] = useState<Vendor[]>(initialVendors)
  const [bidsState, setBids] = useState<VendorBid[]>(initialVendorBids)
  const [notificationList, setNotificationList] = useState<Notification[]>(initialNotifications)
  const [vendorDetailsState] = useState<VendorDetail[]>(initialVendorDetails)
  const templates = useComplianceTemplatesStore((state) => state.templates)

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
      setApplicationsState((prev) => [...prev, application])
      setNotificationList((prev) => [
        { id: crypto.randomUUID(), title: "Application submitted", subtitle: job.title, time: "Just now", type: "job", read: false },
        ...prev,
      ])
      return application
    },
    [applicationsState, documents, jobsState, profile.id, profile.name, templates],
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
      complianceTemplateId?: string
      startDate?: string
    }) => {
      await simulateDelay(400, 900)
      const job: Job = {
        id: crypto.randomUUID(),
        ...payload,
        status: payload.status ?? "Draft",
        startDate: payload.startDate ?? new Date().toISOString().slice(0, 10),
      }
      setJobsState((prev) => [...prev, job])
      return job
    },
    [],
  )

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    setJobsState((prev) => prev.map((job) => (job.id === id ? { ...job, ...updates } : job)))
  }, [])

  const updateApplicationStatus = useCallback((id: string, status: Application["status"]) => {
    setApplicationsState((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)))
  }, [])

  const rejectApplication = useCallback((id: string) => {
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
        jobs: jobsState,
        applications: enrichedApplications,
        insights: applicationInsights,
        candidates: candidatePool,
      },
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
        updateNotificationPrefs,
        markAllNotificationsRead,
        setNotificationRead,
        updateEmail,
        saveOnboardingStep,
        submitJobApplication,
        createJob,
        updateJob,
        updateApplicationStatus,
        rejectApplication,
        submitVendorBid,
      },
    }),
    [
      applicationInsights,
      candidatePool,
      documents,
      enrichedApplications,
      bidsState,
      jobsState,
      notificationList,
      notificationPrefs,
      onboarding,
      primaryCandidate,
      uploadDocument,
      replaceDocument,
      updateNotificationPrefs,
      markAllNotificationsRead,
      setNotificationRead,
      updateEmail,
      saveOnboardingStep,
      submitJobApplication,
      createJob,
      updateApplicationStatus,
      rejectApplication,
      submitVendorBid,
      vendorsState,
      vendorLeaderboardState,
      vendorDetailsState,
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

