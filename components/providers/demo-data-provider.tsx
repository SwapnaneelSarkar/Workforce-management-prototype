"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type {
  Application,
  ApplicationInsight,
  ApprovalStep,
  Assignment,
  CandidateDocument,
  CandidateProfile,
  ComplianceTemplate,
  ComplianceTemplateItem,
  Invoice,
  Job,
  MessageThread,
  Notification,
  Timesheet,
  Vendor,
  VendorBid,
  VendorDetail,
  VendorLeaderboardRow,
  WorkforceMember,
} from "@/lib/mock-data"
import {
  applications as initialApplications,
  applicationInsights,
  approvalChains as initialApprovalChains,
  assignments as initialAssignments,
  candidates as initialCandidates,
  complianceTemplates as initialTemplates,
  invoices as initialInvoices,
  jobs as initialJobs,
  messageThreads as initialThreads,
  notifications as initialNotifications,
  onboardingDocumentMappings,
  timesheets as initialTimesheets,
  vendorBids as initialVendorBids,
  vendorPerformanceKpis,
  vendorDetails as initialVendorDetails,
  workforceMembers as initialWorkforceMembers,
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
    favorites: string[]
    messages: MessageThread[]
    referralCode?: { value: string; generatedAt: string }
    notificationPrefs: CandidatePreferences
    onboarding: OnboardingState
    applications: Application[]
    notifications: Notification[]
  }
  organization: {
    jobs: Job[]
    applications: Application[]
    templates: ComplianceTemplate[]
    approvals: typeof initialApprovalChains
    timesheets: Timesheet[]
    invoices: Invoice[]
    assignments: Assignment[]
    workforce: WorkforceMember[]
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
    toggleFavorite: (jobId: string) => void
    uploadDocument: (payload: { name: string; type: string }) => Promise<CandidateDocument>
    replaceDocument: (docId: string, updates: Partial<CandidateDocument>) => Promise<void>
    generateReferralCode: () => Promise<string>
    markThreadRead: (threadId: string, unread: boolean) => void
    sendMessage: (threadId: string, body: string) => Promise<void>
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
      complianceTemplateId: string
      description: string
      requirements: string[]
      benefits: string[]
      tags: string[]
      status?: Job["status"]
    }) => Promise<Job>
    updateApplicationStatus: (id: string, status: Application["status"]) => void
    rejectApplication: (id: string) => void
    addTemplateItem: (templateId: string, item: ComplianceTemplateItem) => void
    removeTemplateItem: (templateId: string, itemId: string) => void
    updateTemplateItem: (templateId: string, itemId: string, updates: Partial<ComplianceTemplateItem>) => void
    addTemplateItem: (templateId: string, item: ComplianceTemplateItem) => void
    removeTemplateItem: (templateId: string, itemId: string) => void
    updateTemplateItem: (templateId: string, itemId: string, updates: Partial<ComplianceTemplateItem>) => void
    updateApprovalStep: (chainId: string, stepId: string, status: ApprovalStep["status"]) => Promise<void>
    updateTimesheetStatus: (timesheetId: string, status: Timesheet["status"]) => void
    updateInvoiceStatus: (invoiceId: string, status: Invoice["status"]) => void
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
  const [favorites, setFavorites] = useState<string[]>([])
  const [messages, setMessages] = useState<MessageThread[]>(initialThreads)
  const [referralCode, setReferralCode] = useState<{ value: string; generatedAt: string }>()
  const [notificationPrefs, setNotificationPrefs] = useState<CandidatePreferences>({ email: true, sms: false, push: true })
  const [onboarding, setOnboarding] = useState<OnboardingState>({
    personal: {},
    workHistory: {},
    skills: {},
    availability: {},
    requiredDocuments: profile.requiredDocuments,
  })
  const [applicationsState, setApplicationsState] = useState<Application[]>(initialApplications)
  const [jobsState, setJobsState] = useState<Job[]>(initialJobs)
  const [templates, setTemplates] = useState<ComplianceTemplate[]>(initialTemplates)
  const [approvals, setApprovals] = useState(initialApprovalChains)
  const [timesheetsState, setTimesheets] = useState<Timesheet[]>(initialTimesheets)
  const [invoicesState, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [vendorsState, setVendors] = useState<Vendor[]>(initialVendors)
  const [bidsState, setBids] = useState<VendorBid[]>(initialVendorBids)
  const [notificationList, setNotificationList] = useState<Notification[]>(initialNotifications)
  const [assignmentsState] = useState<Assignment[]>(initialAssignments)
  const [workforceState] = useState<WorkforceMember[]>(initialWorkforceMembers)
  const [vendorDetailsState] = useState<VendorDetail[]>(initialVendorDetails)

  const primaryCandidate = useMemo(() => ({ ...profile, documents }), [profile, documents])
  const candidatePool = useMemo(() => [primaryCandidate, ...initialCandidates.slice(1)], [primaryCandidate])

  const normalizedTimesheets = useMemo(
    () => timesheetsState.map((sheet) => ({ ...sheet, hours: Math.max(0, Math.min(24, sheet.hours)) })),
    [timesheetsState],
  )

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

  const toggleFavorite = useCallback((jobId: string) => {
    setFavorites((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
  }, [])

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

  const generateReferralCode = useCallback(async () => {
    await simulateDelay()
    const code = `REF-${Math.random().toString(36).toUpperCase().slice(2, 8)}`
    const generatedAt = new Date().toISOString()
    setReferralCode({ value: code, generatedAt })
    return code
  }, [])

  const markThreadRead = useCallback((threadId: string, unread: boolean) => {
    setMessages((prev) =>
      prev.map((thread) => (thread.id === threadId ? { ...thread, unreadCount: unread ? 1 : 0 } : thread)),
    )
  }, [])

  const sendMessage = useCallback(async (threadId: string, body: string) => {
    await simulateDelay()
    setMessages((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              unreadCount: 0,
              lastMessage: body,
              updatedAt: new Date().toISOString(),
              messages: [
                ...thread.messages,
                { id: crypto.randomUUID(), from: profile.name, body, timestamp: new Date().toISOString() },
              ],
            }
          : thread,
      ),
    )
  }, [profile.name])

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
      const application: Application = {
        id: crypto.randomUUID(),
        jobId,
        candidateId: profile.id,
        candidateName: profile.name,
        status: "Submitted",
        submittedAt: new Date().toISOString().slice(0, 10),
        documentStatus: "Complete",
        vendorName: "Internal Talent",
        matchScore: 78,
        submittedRelative: "Just now",
      }
      setApplicationsState((prev) => [...prev, application])
      setNotificationList((prev) => [
        { id: crypto.randomUUID(), title: "Application submitted", subtitle: job.title, time: "Just now", type: "job", read: false },
        ...prev,
      ])
      return application
    },
    [applicationsState, jobsState, profile.id, profile.name],
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
      complianceTemplateId: string
      description: string
      requirements: string[]
      benefits: string[]
      tags: string[]
      status?: Job["status"]
    }) => {
      await simulateDelay(400, 900)
      const job: Job = {
        id: crypto.randomUUID(),
        ...payload,
        status: payload.status ?? "Draft",
      }
      setJobsState((prev) => [...prev, job])
      return job
    },
    [],
  )

  const updateApplicationStatus = useCallback((id: string, status: Application["status"]) => {
    setApplicationsState((prev) => prev.map((app) => (app.id === id ? { ...app, status } : app)))
  }, [])

  const rejectApplication = useCallback((id: string) => {
    setApplicationsState((prev) => prev.map((app) => (app.id === id ? { ...app, status: "Rejected" } : app)))
  }, [])

  const addTemplateItem = useCallback((templateId: string, item: ComplianceTemplateItem) => {
    setTemplates((prev) =>
      prev.map((template) => (template.id === templateId ? { ...template, items: [...template.items, item] } : template)),
    )
  }, [])

  const removeTemplateItem = useCallback((templateId: string, itemId: string) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId ? { ...template, items: template.items.filter((item) => item.id !== itemId) } : template,
      ),
    )
  }, [])

  const updateTemplateItem = useCallback((templateId: string, itemId: string, updates: Partial<ComplianceTemplateItem>) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? {
              ...template,
              items: template.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
            }
          : template,
      ),
    )
  }, [])

  const updateApprovalStep = useCallback(async (chainId: string, stepId: string, status: ApprovalStep["status"]) => {
    await simulateDelay()
    setApprovals((prev) =>
      prev.map((chain) =>
        chain.id === chainId
          ? {
              ...chain,
              approvers: chain.approvers.map((step) =>
                step.id === stepId ? { ...step, status, decisionAt: new Date().toISOString().slice(0, 10) } : step,
              ),
            }
          : chain,
      ),
    )
  }, [])

  const updateTimesheetStatus = useCallback((timesheetId: string, status: Timesheet["status"]) => {
    setTimesheets((prev) => prev.map((sheet) => (sheet.id === timesheetId ? { ...sheet, status } : sheet)))
  }, [])

  const updateInvoiceStatus = useCallback((invoiceId: string, status: Invoice["status"]) => {
    setInvoices((prev) => prev.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status } : invoice)))
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
        favorites,
        messages,
        referralCode,
        notificationPrefs,
        onboarding,
        applications: enrichedApplications.filter((app) => app.candidateId === primaryCandidate.id),
        notifications: notificationList,
      },
      organization: {
        jobs: jobsState,
        applications: enrichedApplications,
        templates,
        approvals,
        timesheets: normalizedTimesheets,
        invoices: invoicesState,
        assignments: assignmentsState,
        workforce: workforceState,
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
        toggleFavorite,
        uploadDocument,
        replaceDocument,
        generateReferralCode,
        markThreadRead,
        sendMessage,
        updateNotificationPrefs,
        markAllNotificationsRead,
        setNotificationRead,
        updateEmail,
        saveOnboardingStep,
        submitJobApplication,
        createJob,
        updateApplicationStatus,
        rejectApplication,
        addTemplateItem,
        removeTemplateItem,
        updateTemplateItem,
        updateApprovalStep,
        updateTimesheetStatus,
        updateInvoiceStatus,
        submitVendorBid,
      },
    }),
    [
      applicationInsights,
      assignmentsState,
      candidatePool,
      documents,
      enrichedApplications,
      approvals,
      bidsState,
      favorites,
      jobsState,
      messages,
      normalizedTimesheets,
      notificationList,
      notificationPrefs,
      onboarding,
      primaryCandidate,
      referralCode,
      templates,
      toggleFavorite,
      uploadDocument,
      replaceDocument,
      generateReferralCode,
      markThreadRead,
      sendMessage,
      updateNotificationPrefs,
      markAllNotificationsRead,
      setNotificationRead,
      updateEmail,
      saveOnboardingStep,
      submitJobApplication,
      createJob,
      updateApplicationStatus,
      rejectApplication,
      addTemplateItem,
      removeTemplateItem,
      updateTemplateItem,
      updateApprovalStep,
      updateTimesheetStatus,
      updateInvoiceStatus,
      submitVendorBid,
      vendorsState,
      invoicesState,
      vendorLeaderboardState,
      vendorDetailsState,
      workforceState,
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

