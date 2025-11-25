"use client"

import { useRouter } from "next/navigation"

export function useNavigation() {
  const router = useRouter()

  return {
    goHome: () => router.push("/"),
    goCandidateLogin: () => router.push("/candidate/login"),
    goCandidateDashboard: () => router.push("/candidate/dashboard"),
    goCandidateProfile: () => router.push("/candidate/profile"),
    goCandidateJobs: () => router.push("/candidate/jobs"),
    goCandidateJobDetail: (id: string) => router.push(`/candidate/jobs/${id}`),
    goCandidateOnboarding: () => router.push("/candidate/onboarding"),
    goCandidateDocuments: () => router.push("/candidate/documents"),
    goCandidateApply: () => router.push("/candidate/apply"),
    goOrgLogin: () => router.push("/organization/login"),
    goOrgDashboard: () => router.push("/organization/dashboard"),
    goOrgJobs: () => router.push("/organization/jobs"),
    goOrgJobCreate: () => router.push("/organization/jobs/create"),
    goOrgApplications: () => router.push("/organization/applications"),
    goOrgCompliance: () => router.push("/organization/compliance/templates"),
    goOrgComplianceDetail: (id: string) => router.push(`/organization/compliance/${id}`),
    goOrgVendors: () => router.push("/organization/vendors"),
    goVendorLogin: () => router.push("/vendor/login"),
    goVendorList: () => router.push("/vendor/vendors"),
  }
}
