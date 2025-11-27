"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MultiStepForm } from "@/components/system"
import { DatePicker } from "@/components/system/date-picker"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
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
const MINIMUM_AGE_YEARS = 16
const initialAnswers = {
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
}
type AnswersState = typeof initialAnswers
type AnswerKey = keyof AnswersState
type StepId = "preferences" | "experience" | "occupation-specialty" | "license-compliance" | "extras"
const STEP_FIELD_MAP: Record<StepId, AnswerKey[]> = {
  preferences: ["preferredLocations", "preferredWorkTypes", "preferredShifts", "contractLength"],
  experience: ["availableStart", "recentJobTitle", "totalExperienceYears"],
  "occupation-specialty": ["occupation"],
  "license-compliance": ["licenseType", "dateOfBirth"],
  extras: [],
}
type ErrorsState = Partial<Record<AnswerKey, string>>

const getDobMaxDate = () => {
  const today = new Date()
  const cutoff = new Date(today.getFullYear() - MINIMUM_AGE_YEARS, today.getMonth(), today.getDate())
  return cutoff.toISOString().split("T")[0]
}

const getDobError = (value: string, maxDate: string) => {
  if (!value) {
    return ""
  }
  return value > maxDate ? `Must be ${MINIMUM_AGE_YEARS}+ years old` : ""
}

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
  const dobMaxDate = getDobMaxDate()
  const router = useRouter()
  const { candidate, actions } = useDemoData()
  const {
    data: localDb,
    hydrated: dbHydrated,
    saveOnboardingDetails: persistOnboardingDetails,
    markDocumentUploaded,
  } = useLocalDb()
  const [formSaving, setFormSaving] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [showUploadStep, setShowUploadStep] = useState(false)
  const [answers, setAnswers] = useState<AnswersState>(initialAnswers)
  const [prefilledAnswers, setPrefilledAnswers] = useState(false)
  const [errors, setErrors] = useState<ErrorsState>({})

  const dobError = getDobError(answers.dateOfBirth, dobMaxDate)

  useEffect(() => {
    if (!dbHydrated || prefilledAnswers) {
      return
    }
    if (Object.keys(localDb.onboardingDetails).length > 0) {
      setAnswers((prev) => ({ ...prev, ...(localDb.onboardingDetails as Partial<AnswersState>) }))
    }
    setPrefilledAnswers(true)
  }, [dbHydrated, localDb.onboardingDetails, prefilledAnswers])
  useEffect(() => {
    setErrors((prev) => {
      if (dobError) {
        if (prev.dateOfBirth === dobError) {
          return prev
        }
        return { ...prev, dateOfBirth: dobError }
      }
      if (!prev.dateOfBirth) {
        return prev
      }
      const next = { ...prev }
      delete next.dateOfBirth
      return next
    })
  }, [dobError])

  const clearError = (field: AnswerKey) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev
      }
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const updateAnswer = <K extends AnswerKey>(field: K, value: AnswersState[K]) => {
    setAnswers((prev) => ({ ...prev, [field]: value }))
    clearError(field)
  }

  const syncStepErrors = (stepId: StepId, stepErrors: ErrorsState) => {
    setErrors((prev) => {
      const relevantFields = STEP_FIELD_MAP[stepId] ?? []
      let changed = false
      const next = { ...prev }
      relevantFields.forEach((field) => {
        const message = stepErrors[field]
        if (message) {
          if (next[field] !== message) {
            next[field] = message
            changed = true
          }
        } else if (next[field]) {
          delete next[field]
          changed = true
        }
      })
      return changed ? next : prev
    })
  }

  const validateStep = (stepId: StepId): ErrorsState => {
    const stepErrors: ErrorsState = {}
    if (stepId === "preferences") {
      if (answers.preferredLocations.length === 0) {
        stepErrors.preferredLocations = "Select at least one location"
      }
      if (answers.preferredWorkTypes.length === 0) {
        stepErrors.preferredWorkTypes = "Select at least one work type"
      }
      if (answers.preferredShifts.length === 0) {
        stepErrors.preferredShifts = "Select at least one shift"
      }
      if (!answers.contractLength) {
        stepErrors.contractLength = "Select a contract length"
      }
    }
    if (stepId === "experience") {
      if (!answers.availableStart) {
        stepErrors.availableStart = "Choose a start date"
      }
      if (!answers.recentJobTitle.trim()) {
        stepErrors.recentJobTitle = "Enter your most recent job title"
      }
      const experienceValue = Number(answers.totalExperienceYears)
      if (!answers.totalExperienceYears) {
        stepErrors.totalExperienceYears = "Provide your total experience in years"
      } else if (Number.isNaN(experienceValue) || experienceValue < 0) {
        stepErrors.totalExperienceYears = "Enter a valid number of years"
      }
    }
    if (stepId === "occupation-specialty") {
      if (!answers.occupation) {
        stepErrors.occupation = "Select an occupation"
      }
    }
    if (stepId === "license-compliance") {
      if (!answers.licenseType) {
        stepErrors.licenseType = "Select a license type"
      }
      if (!answers.dateOfBirth) {
        stepErrors.dateOfBirth = "Enter your date of birth"
      } else if (dobError) {
        stepErrors.dateOfBirth = dobError
      }
    }
    return stepErrors
  }

  const renderErrorText = (field: AnswerKey) => {
    if (!errors[field]) {
      return null
    }
    return <p className="text-xs text-danger">{errors[field]}</p>
  }

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
              onChange={(value) => updateAnswer("preferredLocations", value)}
              maxSelections={3}
            />
            {renderErrorText("preferredLocations")}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Preferred work types</p>
            <MultiSelectChips
              options={WORK_TYPES}
              value={answers.preferredWorkTypes}
              onChange={(value) => updateAnswer("preferredWorkTypes", value)}
            />
            {renderErrorText("preferredWorkTypes")}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Preferred shifts</p>
            <MultiSelectChips
              options={SHIFTS}
              value={answers.preferredShifts}
              onChange={(value) => updateAnswer("preferredShifts", value)}
            />
            {renderErrorText("preferredShifts")}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Preferred contract length</p>
            <MultiSelectChips
              options={CONTRACT_LENGTHS}
              value={answers.contractLength ? [answers.contractLength] : []}
              onChange={([first]) => updateAnswer("contractLength", first ?? "")}
              maxSelections={1}
            />
            {renderErrorText("contractLength")}
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
            onChange={(value) => updateAnswer("availableStart", value)}
            error={errors.availableStart}
          />
          <div className="space-y-1">
            <Input
              value={answers.recentJobTitle}
              onChange={(event) => updateAnswer("recentJobTitle", event.target.value)}
              placeholder="Most recent job title (e.g., Registered Nurse)"
              aria-invalid={Boolean(errors.recentJobTitle)}
            />
            {renderErrorText("recentJobTitle")}
          </div>
          <div className="space-y-1">
            <Input
              type="number"
              value={answers.totalExperienceYears}
              onChange={(event) => updateAnswer("totalExperienceYears", event.target.value)}
              placeholder="Total experience in years"
              aria-invalid={Boolean(errors.totalExperienceYears)}
              min={0}
            />
            {renderErrorText("totalExperienceYears")}
          </div>
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
              onChange={([first]) => updateAnswer("occupation", first ?? "")}
              maxSelections={1}
            />
            {renderErrorText("occupation")}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Specialties</p>
            <MultiSelectChips
              options={SPECIALTIES}
              value={answers.specialties}
              onChange={(value) => updateAnswer("specialties", value)}
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
                    onChange={(event) => updateAnswer("licenseType", event.target.value)}
                    className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-500"
                    aria-invalid={Boolean(errors.licenseType)}
                  />
                  {option}
                </label>
              ))}
            </div>
            {renderErrorText("licenseType")}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Certifications</p>
            <MultiSelectChips
              options={CERTIFICATIONS}
              value={answers.certifications}
              onChange={(value) => updateAnswer("certifications", value)}
            />
          </div>
          <DatePicker
            label="Date of birth"
            value={answers.dateOfBirth}
            onChange={(value) => updateAnswer("dateOfBirth", value)}
            helper={`Must be ${MINIMUM_AGE_YEARS}+ years old`}
            max={dobMaxDate}
            error={dobError}
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
            onChange={(event) => updateAnswer("summaryNote", event.target.value)}
            placeholder="Quick summary (optional, up to 200 characters)"
            maxLength={200}
            className="w-full min-h-[80px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <DatePicker
              label="Requested time off 1"
              value={answers.requestedTimeOff1}
              onChange={(value) => updateAnswer("requestedTimeOff1", value)}
            />
            <DatePicker
              label="Requested time off 2"
              value={answers.requestedTimeOff2}
              onChange={(value) => updateAnswer("requestedTimeOff2", value)}
            />
          </div>
        </div>
      ),
    },
  ]

  const saveAllAnswers = async () => {
    setFormSaving(true)
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
      persistOnboardingDetails(answers as unknown as Record<string, string | string[]>)
    } finally {
      setFormSaving(false)
    }
  }

  const handleNext = async (nextStep: number) => {
    const currentStepId = steps[activeStep]?.id as StepId | undefined
    if (currentStepId) {
      const stepErrors = validateStep(currentStepId)
      syncStepErrors(currentStepId, stepErrors)
      if (Object.keys(stepErrors).length > 0) {
        return
      }
    }
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
  ]
  const dynamicRequiredDocs =
    candidate.onboarding.requiredDocuments.length > 0 ? candidate.onboarding.requiredDocuments : candidate.profile.requiredDocuments
  const requiredDocs = Array.from(new Set([...baseRequiredDocs, ...dynamicRequiredDocs]))

  const [uploadedDocs, setUploadedDocs] = useState<string[]>([])
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)

  useEffect(() => {
    if (!dbHydrated) {
      return
    }
    setUploadedDocs(Object.keys(localDb.uploadedDocuments))
  }, [dbHydrated, localDb.uploadedDocuments])

  const handleUpload = async (docType: string) => {
    if (uploadingDoc) {
      return
    }
    setUploadingDoc(docType)
    try {
      await actions.uploadDocument({ name: `${docType}.pdf`, type: docType })
      setUploadedDocs((prev) => (prev.includes(docType) ? prev : [...prev, docType]))
      markDocumentUploaded(docType, { source: "onboarding" })
    } finally {
      setUploadingDoc(null)
    }
  }

  const finishToDashboard = () => {
    router.push("/candidate/dashboard")
  }

  const activeStepId = steps[activeStep]?.id as StepId | undefined
  const disablePrimary = activeStepId === "license-compliance" && Boolean(errors.dateOfBirth)

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
            onBack={() => {
              if (activeStep === 0) {
                // If on first step, go back to previous page
                router.back()
              } else {
                // Otherwise, go to previous step
                setActiveStep((prev) => Math.max(0, prev - 1))
              }
            }}
            onNext={async () => {
              const nextStep = activeStep + 1
              await handleNext(nextStep)
            }}
            saving={formSaving}
            nextLabel="Next question"
            finishLabel="Continue"
            primaryDisabled={disablePrimary}
          />
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">Upload your documents</h2>
              <p className="text-sm text-slate-600">These documents keep your compliance wallet in good standing.</p>
            </div>
            <div className="space-y-3">
              {requiredDocs.map((doc) => {
                const isUploaded = uploadedDocs.includes(doc)
                const isUploading = uploadingDoc === doc
                const disableButton = isUploaded || Boolean(uploadingDoc && uploadingDoc !== doc)
                return (
                  <div
                    key={doc}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-slate-800">{doc}</span>
                    <button
                      type="button"
                      onClick={() => handleUpload(doc)}
                      disabled={disableButton}
                      className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {isUploaded ? (
                        "Uploaded"
                      ) : isUploading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                          Uploading...
                        </>
                      ) : (
                        "Upload"
                      )}
                    </button>
                  </div>
                )
              })}
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
