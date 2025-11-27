"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CheckCircle2, FileWarning, ShieldCheck, AlertCircle, XCircle, Clock, ChevronRight } from "lucide-react"
import { Card, Header, Modal, SkeletonLoader, StatusChip, Map } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { useToast } from "@/components/system"
import { checkJobReadiness, getReadinessChecklist } from "@/lib/readiness-engine"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
type PageProps = {
  params: Promise<{ id: string }>
}

export default function JobDetailsPage({ params }: PageProps) {
  const { id } = React.use(params)
  const { organization, candidate, actions } = useDemoData()
  const { data: localDb, markJobApplied } = useLocalDb()
  const { pushToast } = useToast()
  const job = organization.jobs.find((item) => item.id === id) ?? organization.jobs[0]
  const [showRequirements, setShowRequirements] = useState(true)
  const [readinessModalOpen, setReadinessModalOpen] = useState(false)
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [applying, setApplying] = useState(false)
  const [submittedApplication, setSubmittedApplication] = useState<any>(null)

  // Calculate readiness
  const readiness = useMemo(() => {
    const onboardingData = {
      personal: candidate.onboarding.personal || {},
      skills: candidate.onboarding.skills || {},
      availability: candidate.onboarding.availability || {},
    }
    return checkJobReadiness(candidate.profile, job, onboardingData)
  }, [candidate.profile, job, candidate.onboarding])

  const checklist = useMemo(() => getReadinessChecklist(readiness), [readiness])

  const hasApplied = Boolean(localDb.jobApplications[job.id])
  const canApply = readiness.status === "Ready" && !hasApplied

  useEffect(() => {
    if (readinessModalOpen && canApply) {
      setReadinessModalOpen(false)
    }
  }, [readinessModalOpen, canApply])

  const handleApply = async () => {
    if (!canApply) {
      setReadinessModalOpen(true)
      return
    }

    setApplying(true)
    try {
      if (hasApplied) {
        setConfirmationModalOpen(true)
        return
      }
      const application = await actions.submitJobApplication(job.id)
      setSubmittedApplication(application)
      setConfirmationModalOpen(true)
      markJobApplied(job.id)
      pushToast({ title: "Application submitted", description: `${job.title} • ${job.location}`, type: "success" })
    } catch (error) {
      pushToast({ title: "Application failed", description: "Please try again.", type: "error" })
    } finally {
      setApplying(false)
    }
  }

  const uploadMockDoc = async (type: string) => {
    await actions.uploadDocument({ name: `${type}.pdf`, type })
    pushToast({ title: `${type} uploaded`, type: "success" })
  }

  const getReadinessIcon = () => {
    switch (readiness.status) {
      case "Ready":
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case "Partially Ready":
        return <Clock className="h-5 w-5 text-warning" />
      default:
        return <XCircle className="h-5 w-5 text-destructive" />
    }
  }

  const getReadinessColor = () => {
    switch (readiness.status) {
      case "Ready":
        return "border-success/40 bg-success/10 text-success"
      case "Partially Ready":
        return "border-warning/40 bg-warning/10 text-warning"
      default:
        return "border-destructive/40 bg-destructive/10 text-destructive"
    }
  }

  const [activeTab, setActiveTab] = useState<"details" | "facility">("details")
  const [descriptionExpanded, setDescriptionExpanded] = useState(true)

  // Required items for submission
  const requiredItems = [
    "License Verification",
    "Resume",
    "Skills checklist",
    "Certifications",
  ]

  return (
    <div className="space-y-6 p-8">
      <Header
        title={job.title}
        subtitle={`${job.location} • ${job.department}`}
        breadcrumbs={[
          { label: "Jobs", href: "/candidate/jobs" },
          { label: job.title },
        ]}
      />

      {/* Map Section */}
      <Card className="p-0 overflow-hidden">
        <Map 
          location={job.location}
          address="994 North Tustin Avenue"
          height="h-80"
          interactive
        />
      </Card>

      {/* Job Title */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-4">{job.title}</h1>
        
        {/* Tabs */}
        <div className="flex gap-6 border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "pb-3 px-1 text-sm font-semibold border-b-2 transition-colors",
              activeTab === "details"
                ? "text-foreground border-foreground"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            Job Details
          </button>
          <button
            onClick={() => setActiveTab("facility")}
            className={cn(
              "pb-3 px-1 text-sm font-semibold border-b-2 transition-colors",
              activeTab === "facility"
                ? "text-foreground border-foreground"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            Facility Info
          </button>
        </div>

        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Reminder Section */}
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">Reminder</p>
                  <p className="text-xs text-yellow-700">
                    You need to complete some items below in order to be submitted for the job
                  </p>
                </div>
              </div>
            </div>

            {/* Required Items */}
            <Card>
              <div className="space-y-2">
                {requiredItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Job Information */}
            <Card>
              <div className="space-y-4">
                <InfoRow label="Contract Dates" value="10/1-12/31 - 13 Weeks" />
                <InfoRow label="Location" value={job.location} />
                <InfoRow label="Address" value="994 North Tustin Avenue" />
                <InfoRow label="Spoken Languages" value="English, Spanish" />
              </div>
            </Card>

            {/* Description Section */}
            <Card>
              <button
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="text-lg font-semibold text-foreground">Description</h3>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    descriptionExpanded && "rotate-90"
                  )}
                />
              </button>
              {descriptionExpanded && (
                <div className="text-sm text-foreground leading-relaxed">
                  <p className="mb-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                  <p className="mb-2">
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  </p>
                </div>
              )}
            </Card>

          </div>
        )}

        {activeTab === "facility" && (
          <Card>
            <p className="text-sm text-muted-foreground">Facility information will be displayed here.</p>
          </Card>
        )}
      </div>

      {/* Apply Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleApply}
          disabled={applying || !canApply}
          className="bg-gray-800 text-white hover:bg-gray-700 min-w-[120px]"
        >
          {applying ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Applying...
            </>
          ) : hasApplied ? (
            "Applied"
          ) : (
            "Apply"
          )}
        </Button>
      </div>

      {/* Readiness Gate Modal */}
      <Modal
        open={readinessModalOpen}
        onClose={() => setReadinessModalOpen(false)}
        title="Not ready to apply"
        description="Please complete the following items before applying:"
      >
        <div className="space-y-4">
          {checklist.map((item) => {
            if (item.status === "complete") return null
            return (
              <div key={item.label} className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="font-semibold text-foreground">{item.label}</span>
                </div>
                {item.items && item.items.length > 0 && (
                  <ul className="space-y-1 pl-6 text-sm text-muted-foreground">
                    {item.items.map((missingItem) => (
                      <li key={missingItem} className="list-disc">
                        {missingItem}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setReadinessModalOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setReadinessModalOpen(false)
                window.location.href = "/candidate/onboarding"
              }}
              className="flex-1"
            >
              Go to Onboarding
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        open={confirmationModalOpen}
        onClose={() => {
          setConfirmationModalOpen(false)
          window.location.href = "/candidate/applications"
        }}
        title="Application Submitted!"
        description="Your application has been successfully submitted."
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-success/40 bg-success/10 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="font-semibold text-success">{job.title}</p>
                <p className="text-sm text-success/80">{job.location}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Your application has been received and is being reviewed by the hiring team.
            </p>
            <p className="text-muted-foreground">
              You'll receive updates via email and can track your application status in the Applications section.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmationModalOpen(false)
                window.location.href = "/candidate/jobs"
              }}
              className="flex-1"
            >
              Browse More Jobs
            </Button>
            <Button
              onClick={() => {
                setConfirmationModalOpen(false)
                window.location.href = "/candidate/applications"
              }}
              className="flex-1"
            >
              View Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm font-semibold text-muted-foreground">{label}:</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}
