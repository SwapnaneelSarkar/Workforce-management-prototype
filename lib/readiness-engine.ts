import type { CandidateProfile, CandidateDocument, Job } from "./mock-data"

export type ReadinessStatus = "Ready" | "Partially Ready" | "Not Ready"

export type ReadinessCheck = {
  status: ReadinessStatus
  score: number
  onboardingComplete: boolean
  documentsComplete: boolean
  complianceComplete: boolean
  missingItems: {
    onboarding: string[]
    documents: string[]
    compliance: string[]
  }
  message: string
}

export function checkJobReadiness(
  candidate: CandidateProfile,
  job: Job,
  onboardingData: {
    personal: Record<string, string>
    skills: Record<string, string | string[]>
    availability: Record<string, string>
  },
): ReadinessCheck {
  const missingItems = {
    onboarding: [] as string[],
    documents: [] as string[],
    compliance: [] as string[],
  }

  // Check onboarding completeness
  const onboardingChecks = {
    personal: !!(onboardingData.personal.firstName && onboardingData.personal.lastName && onboardingData.personal.email),
    specialty: !!(onboardingData.skills.specialty || candidate.specialties.length > 0),
    skills: Object.keys(onboardingData.skills).length > 0 || candidate.skills.length > 0,
    preferences: !!(onboardingData.availability.shift || candidate.shiftPreference),
  }

  if (!onboardingChecks.personal) missingItems.onboarding.push("Personal information")
  if (!onboardingChecks.specialty) missingItems.onboarding.push("Specialty/Role selection")
  if (!onboardingChecks.skills) missingItems.onboarding.push("Skills assessment")
  if (!onboardingChecks.preferences) missingItems.onboarding.push("Work preferences")

  const onboardingComplete = Object.values(onboardingChecks).every((check) => check)

  // Check document wallet completeness
  const requiredDocs = job.requirements || []
  const completedDocTypes = candidate.documents
    .filter((doc) => doc.status === "Completed")
    .map((doc) => doc.type)

  const missingDocs = requiredDocs.filter((req) => !completedDocTypes.includes(req))
  missingItems.documents = missingDocs

  const documentsComplete = missingDocs.length === 0 && requiredDocs.length > 0

  // Check compliance completeness
  const expiredDocs = candidate.documents.filter((doc) => doc.status === "Expired")
  const pendingDocs = candidate.documents.filter(
    (doc) => doc.status === "Pending Verification" || doc.status === "Pending Upload",
  )
  const failedDocs = candidate.documents.filter((doc) => doc.status === "Validation Failed")
  const complianceIssues = [
    ...expiredDocs.map((d) => `${d.type} (expired)`),
    ...pendingDocs.map((d) => `${d.type} (pending verification)`),
    ...failedDocs.map((d) => `${d.type} (validation failed)`),
  ]

  missingItems.compliance = complianceIssues
  const complianceComplete = expiredDocs.length === 0 && pendingDocs.length === 0 && failedDocs.length === 0

  // Calculate overall readiness
  const checks = [onboardingComplete, documentsComplete, complianceComplete]
  const completedChecks = checks.filter((c) => c).length
  const score = Math.round((completedChecks / checks.length) * 100)

  let status: ReadinessStatus
  let message: string

  if (completedChecks === checks.length) {
    status = "Ready"
    message = "You're ready to apply! All requirements are met."
  } else if (completedChecks >= 2) {
    status = "Partially Ready"
    message = "Almost there! Complete the remaining items to apply."
  } else {
    status = "Not Ready"
    message = "Please complete onboarding and upload required documents before applying."
  }

  return {
    status,
    score,
    onboardingComplete,
    documentsComplete,
    complianceComplete,
    missingItems,
    message,
  }
}

export function getReadinessChecklist(readiness: ReadinessCheck): Array<{ label: string; status: "complete" | "incomplete"; items?: string[] }> {
  return [
    {
      label: "Onboarding",
      status: readiness.onboardingComplete ? "complete" : "incomplete",
      items: readiness.missingItems.onboarding,
    },
    {
      label: "Required Documents",
      status: readiness.documentsComplete ? "complete" : "incomplete",
      items: readiness.missingItems.documents,
    },
    {
      label: "Compliance Status",
      status: readiness.complianceComplete ? "complete" : "incomplete",
      items: readiness.missingItems.compliance,
    },
  ]
}

