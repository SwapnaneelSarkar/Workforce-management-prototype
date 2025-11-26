"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MultiStepForm } from "@/components/system"
import { DatePicker } from "@/components/system/date-picker"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Input } from "@/components/ui/input"
import { ProgressBar } from "@/components/system/progress-bar"

const PREFERRED_LOCATIONS = ["California", "Texas", "Florida", "New York", "Washington", "Arizona", "Remote"]
const WORK_TYPES = ["Full-time", "Part-time", "Contract", "Travel", "Per Diem"]
const SHIFTS = ["Day Shift", "Night Shift", "Rotational Shift", "Weekend Shift"]
const CONTRACT_LENGTHS = ["4 weeks", "8 weeks", "12 weeks", "24 weeks", "Flexible"]
const OCCUPATIONS = [
  "Registered Nurse (RN)",
  "Licensed Vocational Nurse (LVN)",
  "Certified Nursing Assistant (CNA)",
  "Medical Technician",
  "Surgical Nurse",
]
const SPECIALTIES = [
  "Long Term Acute Care",
  "ICU",
  "ER",
  "Dialysis",
  "OR / Surgical",
  "Telemetry",
  "Labor & Delivery",
]
const LICENSE_TYPES = ["Compact State", "Single State"]
const CERTIFICATIONS = ["BLS", "ACLS", "PALS", "CPR", "CNA Certification", "RN License"]

type MultiSelectFieldProps = {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  maxSelections?: number
}

function MultiSelectChips({ options, value, onChange, maxSelections }: MultiSelectFieldProps) {
  const toggleOption = (option: string) => {
    const isSelected = value.includes(option)
    if (isSelected) {
      onChange(value.filter((item) => item !== option))
      return
    }
    if (maxSelections && value.length >= maxSelections) {
      return
    }
    onChange([...value, option])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value.includes(option)
        const disabled = maxSelections !== undefined && !selected && value.length >= maxSelections
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggleOption(option)}
            disabled={disabled}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              selected
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const { candidate, actions } = useDemoData()
  const [saving, setSaving] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [showUploadStep, setShowUploadStep] = useState(false)

  const [answers, setAnswers] = useState({
    preferredLocations: [] as string[],
    preferredWorkTypes: [] as string[],
    preferredShifts: [] as string[],
    contractLength: "",
    availableStart: "",
    recentJobTitle: "",
    totalExperienceYears: "",
    occupation: "",
    specialties: [] as string[],
    licenseType: "",
    dateOfBirth: "",
    certifications: [] as string[],
    summaryNote: "",
    requestedTimeOff1: "",
    requestedTimeOff2: "",
  })

  const steps = [
    {
      id: "preferences",
      title: "Where and how do you want to work?",
      description: "Tell us about your preferred locations, work types, shifts, and contract length.",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Preferred locations (up to 3)</p>
            <MultiSelectChips
              options={PREFERRED_LOCATIONS}
              value={answers.preferredLocations}
              onChange={(value) => setAnswers((prev) => ({ ...prev, preferredLocations: value }))}
              maxSelections={3}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Preferred work types</p>
            <MultiSelectChips
              options={WORK_TYPES}
              value={answers.preferredWorkTypes}
              onChange={(value) => setAnswers((prev) => ({ ...prev, preferredWorkTypes: value }))}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Preferred shifts</p>
            <MultiSelectChips
              options={SHIFTS}
              value={answers.preferredShifts}
              onChange={(value) => setAnswers((prev) => ({ ...prev, preferredShifts: value }))}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Preferred contract length</p>
            <MultiSelectChips
              options={CONTRACT_LENGTHS}
              value={answers.contractLength ? [answers.contractLength] : []}
              onChange={([first]) => setAnswers((prev) => ({ ...prev, contractLength: first ?? "" }))}
              maxSelections={1}
            />
          </div>
        </div>
      ),
    },
    {
      id: "experience",
      title: "Experience & availability",
      description: "Help us understand your background and when you can start.",
      content: (
        <div className="space-y-4">
          <DatePicker
            label="Available to start"
            value={answers.availableStart}
            onChange={(value) => setAnswers((prev) => ({ ...prev, availableStart: value }))}
          />
          <Input
            value={answers.recentJobTitle}
            onChange={(event) => setAnswers((prev) => ({ ...prev, recentJobTitle: event.target.value }))}
            placeholder="Most recent job title (e.g., Registered Nurse)"
          />
          <Input
            type="number"
            value={answers.totalExperienceYears}
            onChange={(event) => setAnswers((prev) => ({ ...prev, totalExperienceYears: event.target.value }))}
            placeholder="Total experience in years"
          />
        </div>
      ),
    },
    {
      id: "occupation-specialty",
      title: "Occupation & specialties",
      description: "Share your core occupation and any specialties you work in.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Occupation</p>
            <MultiSelectChips
              options={OCCUPATIONS}
              value={answers.occupation ? [answers.occupation] : []}
              onChange={([first]) => setAnswers((prev) => ({ ...prev, occupation: first ?? "" }))}
              maxSelections={1}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Specialties</p>
            <MultiSelectChips
              options={SPECIALTIES}
              value={answers.specialties}
              onChange={(value) => setAnswers((prev) => ({ ...prev, specialties: value }))}
            />
          </div>
        </div>
      ),
    },
    {
      id: "license-compliance",
      title: "License, certifications & DOB",
      description: "This helps us handle compliance and matching behind the scenes.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">License type</p>
            <div className="space-y-3">
              {LICENSE_TYPES.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="licenseType"
                    value={option}
                    checked={answers.licenseType === option}
                    onChange={(event) => setAnswers((prev) => ({ ...prev, licenseType: event.target.value }))}
                    className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Certifications</p>
            <MultiSelectChips
              options={CERTIFICATIONS}
              value={answers.certifications}
              onChange={(value) => setAnswers((prev) => ({ ...prev, certifications: value }))}
            />
          </div>
          <DatePicker
            label="Date of birth"
            value={answers.dateOfBirth}
            onChange={(value) => setAnswers((prev) => ({ ...prev, dateOfBirth: value }))}
          />
        </div>
      ),
    },
    {
      id: "extras",
      title: "Anything else we should know?",
      description: "Optional, but helpful for recruiters reviewing your profile.",
      content: (
        <div className="space-y-4">
          <textarea
            value={answers.summaryNote}
            onChange={(event) => setAnswers((prev) => ({ ...prev, summaryNote: event.target.value }))}
            placeholder="Quick summary (optional, up to 200 characters)"
            maxLength={200}
            className="w-full min-h-[80px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <DatePicker
              label="Requested time off 1"
              value={answers.requestedTimeOff1}
              onChange={(value) => setAnswers((prev) => ({ ...prev, requestedTimeOff1: value }))}
            />
            <DatePicker
              label="Requested time off 2"
              value={answers.requestedTimeOff2}
              onChange={(value) => setAnswers((prev) => ({ ...prev, requestedTimeOff2: value }))}
            />
          </div>
        </div>
      ),
    },
  ]

  const saveAllAnswers = async () => {
    setSaving(true)
    try {
      await actions.saveOnboardingStep(
        "personal",
        {
          preferredLocations: answers.preferredLocations,
          preferredWorkTypes: answers.preferredWorkTypes,
          preferredShifts: answers.preferredShifts,
          contractLength: answers.contractLength,
          availableStart: answers.availableStart,
          recentJobTitle: answers.recentJobTitle,
          totalExperienceYears: answers.totalExperienceYears,
          occupation: answers.occupation,
          specialties: answers.specialties,
          licenseType: answers.licenseType,
          dateOfBirth: answers.dateOfBirth,
          certifications: answers.certifications,
          summaryNote: answers.summaryNote,
          requestedTimeOff1: answers.requestedTimeOff1,
          requestedTimeOff2: answers.requestedTimeOff2,
        } as any,
      )
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async (nextStep: number) => {
    if (nextStep === steps.length) {
      await saveAllAnswers()
      setShowUploadStep(true)
    } else {
      setActiveStep(nextStep)
    }
  }

  const baseRequiredDocs = [
    "Resume",
    "Date of birth proof",
    "Certifications",
    "References",
    "License",
    "Summary note",
    "Requested time off 1",
    "Requested time off 2",
  ]
  const dynamicRequiredDocs =
    candidate.onboarding.requiredDocuments.length > 0 ? candidate.onboarding.requiredDocuments : candidate.profile.requiredDocuments
  const requiredDocs = Array.from(new Set([...baseRequiredDocs, ...dynamicRequiredDocs]))

  const [uploadedDocs, setUploadedDocs] = useState<string[]>([])

  const handleUpload = async (docType: string) => {
    setSaving(true)
    try {
      await actions.uploadDocument({ name: `${docType}.pdf`, type: docType })
      setUploadedDocs((prev) => (prev.includes(docType) ? prev : [...prev, docType]))
    } finally {
      setSaving(false)
    }
  }

  const finishToDashboard = () => {
    router.push("/candidate/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Candidate onboarding</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Let’s get to know you better</h1>
            <p className="mt-1 text-sm text-slate-600">
              Answer a few quick questions so we can match you to the right roles. This only takes a couple of minutes.
            </p>
          </div>
          {!showUploadStep && (
            <div className="hidden w-40 sm:block">
              <ProgressBar
                value={Math.round(((activeStep + 1) / steps.length) * 100)}
                label={`${activeStep + 1} of ${steps.length}`}
              />
            </div>
          )}
        </div>

        {!showUploadStep ? (
          <MultiStepForm
            steps={steps}
            activeStep={activeStep}
            onBack={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            onNext={async () => {
              const nextStep = activeStep + 1
              await handleNext(nextStep)
            }}
            onSave={saveAllAnswers}
            saving={saving}
            nextLabel="Next question"
            finishLabel="Continue"
          />
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">Upload your documents</h2>
              <p className="text-sm text-slate-600">These documents keep your compliance wallet in good standing.</p>
            </div>
            <div className="space-y-3">
              {requiredDocs.map((doc) => (
                <div
                  key={doc}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-slate-800">{doc}</span>
                  <button
                    type="button"
                    onClick={() => handleUpload(doc)}
                    disabled={saving || uploadedDocs.includes(doc)}
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {uploadedDocs.includes(doc) ? "Uploaded" : "Upload"}
                  </button>
                </div>
              ))}
              {requiredDocs.length === 0 && (
                <p className="text-sm text-slate-500">No required documents right now. You’re all set.</p>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={finishToDashboard}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={finishToDashboard}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
