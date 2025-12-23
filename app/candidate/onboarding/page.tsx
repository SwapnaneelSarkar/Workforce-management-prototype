"use client"

import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { ChevronDown, CheckCircle2, Circle, Sparkles, TrendingUp, FileText, MapPin, Briefcase, Calendar, Award, User, Clock } from "lucide-react"
import { StatusChip } from "@/components/system"
import { DatePicker } from "@/components/system/date-picker"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNavigation } from "@/lib/use-navigation"
import { getActiveOccupations, getOccupationByCode } from "@/lib/admin-local-db"

const PREFERRED_LOCATIONS = ["California", "Texas", "Florida", "New York", "Washington", "Arizona", "Remote"]
const WORK_TYPES = ["Full-time", "Part-time", "Contract", "Travel", "Per Diem"]
const SHIFTS = ["Day Shift", "Night Shift", "Rotational Shift", "Weekend Shift"]
const CONTRACT_LENGTHS = ["4 weeks", "8 weeks", "12 weeks", "24 weeks", "Flexible"]

const initialAnswers = {
  preferredLocations: [] as string[],
  preferredWorkTypes: [] as string[],
  preferredShifts: [] as string[],
  contractLength: "",
  availableStart: "",
  recentJobTitle: "",
  totalExperienceYears: "",
  occupation: "",
  licenseType: "",
  dateOfBirth: "",
  summaryNote: "",
  requestedTimeOff1: "",
  requestedTimeOff2: "",
  resumeFileName: "",
}

type AnswersState = typeof initialAnswers
type AnswerKey = keyof AnswersState
type ChecklistItemId =
  | "preferredLocations"
  | "preferredWorkTypes"
  | "preferredShifts"
  | "contractLength"
  | "availableStart"
  | "recentJobTitle"
  | "totalExperienceYears"
  | "occupation"
  | "licenseType"
  | "dateOfBirth"
  | "resumeFileName"

type ErrorsState = Partial<Record<AnswerKey, string>>

const ITEM_FIELD_MAP: Record<ChecklistItemId, AnswerKey[]> = {
  preferredLocations: ["preferredLocations"],
  preferredWorkTypes: ["preferredWorkTypes"],
  preferredShifts: ["preferredShifts"],
  contractLength: ["contractLength"],
  availableStart: ["availableStart"],
  recentJobTitle: ["recentJobTitle"],
  totalExperienceYears: ["totalExperienceYears"],
  occupation: ["occupation"],
  licenseType: ["licenseType"],
  dateOfBirth: ["dateOfBirth"],
  resumeFileName: ["resumeFileName"],
}

const checklistOrder: ChecklistItemId[] = [
  "preferredLocations",
  "preferredWorkTypes",
  "preferredShifts",
  "contractLength",
  "availableStart",
  "recentJobTitle",
  "totalExperienceYears",
  "occupation",
  "licenseType",
  "dateOfBirth",
  "resumeFileName",
]

const checklistMeta: Record<ChecklistItemId, { label: string; description: string }> = {
  preferredLocations: {
    label: "Preferred locations",
    description: "Select up to three states or regions you want to work in.",
  },
  preferredWorkTypes: {
    label: "Preferred work types",
    description: "Tell us how you like to engage (travel, contract, per diem, etc.).",
  },
  preferredShifts: {
    label: "Preferred shifts",
    description: "Pick the shift patterns that fit your lifestyle.",
  },
  contractLength: {
    label: "Contract length",
    description: "Select the commitment length that works best for you.",
  },
  availableStart: {
    label: "Available start date",
    description: "Let us know when you can begin your next assignment.",
  },
  recentJobTitle: {
    label: "Recent job title",
    description: "Share the title from your most recent role.",
  },
  totalExperienceYears: {
    label: "Experience (years)",
    description: "Provide your total years of relevant experience.",
  },
  occupation: {
    label: "Occupation",
    description: "Tell us the occupation or specialty you identify with.",
  },
  licenseType: {
    label: "License type",
    description: "Capture the primary license or certification you hold.",
  },
  dateOfBirth: {
    label: "Date of birth",
    description: "We only use this for compliance verification.",
  },
  resumeFileName: {
    label: "Resume / CV",
    description: "Upload your latest resume so recruiters can review it.",
  },
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
              selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export default function OnboardingPage() {
  const { actions } = useDemoData()
  const {
    data: localDb,
    hydrated: dbHydrated,
    saveOnboardingDetails: persistOnboardingDetails,
    markDocumentUploaded,
  } = useLocalDb()
  const { pushToast } = useToast()
  const { goCandidateDashboard } = useNavigation()
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const [answers, setAnswers] = useState<AnswersState>(initialAnswers)
  const [errors, setErrors] = useState<ErrorsState>({})
  const [prefilledAnswers, setPrefilledAnswers] = useState(false)
  const [expandedItem, setExpandedItem] = useState<ChecklistItemId | null>("preferredLocations")
  const [savingItem, setSavingItem] = useState<ChecklistItemId | null>(null)
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([])
  const [uploadingResume, setUploadingResume] = useState(false)
  const [questionnaireSaving, setQuestionnaireSaving] = useState(false)
  const [occupationOptions, setOccupationOptions] = useState<Array<{ label: string; value: string }>>([
    { label: "Select occupation", value: "" },
  ])
  const today = new Date().toISOString().split("T")[0]
  const resumeUploaded = uploadedDocs.includes("Resume")

  // Load occupation options from admin
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const occs = getActiveOccupations()
        const options = [{ label: "Select occupation", value: "" }]
        occs.forEach((occ) => {
          options.push({ label: occ.name, value: occ.code })
        })
        setOccupationOptions(options)
      } catch (error) {
        // Fallback to default options
        setOccupationOptions([
          { label: "Select occupation", value: "" },
          { label: "RN", value: "RN" },
          { label: "LPN/LVN", value: "LPN/LVN" },
          { label: "CNA", value: "CNA" },
          { label: "Medical Assistant", value: "Medical Assistant" },
          { label: "Surgical Tech", value: "Surgical Tech" },
          { label: "Physical Therapist", value: "PT" },
          { label: "Occupational Therapist", value: "OT" },
          { label: "Respiratory Therapist", value: "RT" },
          { label: "Nurse Practitioner", value: "Nurse Practitioner" },
          { label: "Physician Assistant", value: "Physician Assistant" },
        ])
      }
    }
  }, [])

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
    if (!dbHydrated) {
      return
    }
    setUploadedDocs(Object.keys(localDb.uploadedDocuments))
    const resumeMeta = localDb.uploadedDocuments?.Resume as { name?: string } | undefined
    if (resumeMeta?.name) {
      setAnswers((prev) => (prev.resumeFileName ? prev : { ...prev, resumeFileName: resumeMeta.name }))
    }
  }, [dbHydrated, localDb.uploadedDocuments])

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

  const persistPartialAnswers = async (partial: Partial<AnswersState>) => {
    const nextAnswers = { ...answers, ...partial }
    setAnswers(nextAnswers)
    await actions.saveOnboardingStep(
      "personal",
      {
        preferredLocations: nextAnswers.preferredLocations,
        preferredWorkTypes: nextAnswers.preferredWorkTypes,
        preferredShifts: nextAnswers.preferredShifts,
        contractLength: nextAnswers.contractLength,
        availableStart: nextAnswers.availableStart,
        recentJobTitle: nextAnswers.recentJobTitle,
        totalExperienceYears: nextAnswers.totalExperienceYears,
        occupation: nextAnswers.occupation,
        licenseType: nextAnswers.licenseType,
        dateOfBirth: nextAnswers.dateOfBirth,
        summaryNote: nextAnswers.summaryNote,
        requestedTimeOff1: nextAnswers.requestedTimeOff1,
        requestedTimeOff2: nextAnswers.requestedTimeOff2,
        resumeFileName: nextAnswers.resumeFileName,
      } as any,
    )
    persistOnboardingDetails(nextAnswers as unknown as Record<string, string | string[]>)
  }

  const handleResumeUpload = async (fileName: string) => {
    if (!fileName || uploadingResume) {
      return
    }
    setUploadingResume(true)
    try {
      await actions.uploadDocument({ name: fileName, type: "Resume" })
      setUploadedDocs((prev) => (prev.includes("Resume") ? prev : [...prev, "Resume"]))
      markDocumentUploaded("Resume", { source: "profile-progress" })
      await persistPartialAnswers({ resumeFileName: fileName })
      pushToast({ title: "Resume uploaded", description: "Your resume has been added to your wallet.", type: "success" })
    } catch (error) {
      pushToast({ title: "Upload failed", description: "Please try again.", type: "error" })
    } finally {
      setUploadingResume(false)
    }
  }

  const handleResumeFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    updateAnswer("resumeFileName", file.name)
    await handleResumeUpload(file.name)
    event.target.value = ""
  }

  const applyItemErrors = (itemId: ChecklistItemId, itemErrors: ErrorsState) => {
    const fields = ITEM_FIELD_MAP[itemId]
    setErrors((prev) => {
      const next = { ...prev }
      fields.forEach((field) => {
        if (itemErrors[field]) {
          next[field] = itemErrors[field]
        } else {
          delete next[field]
        }
      })
      return next
    })
  }

  const validateItem = (itemId: ChecklistItemId): ErrorsState => {
    const itemErrors: ErrorsState = {}
    switch (itemId) {
      case "preferredLocations":
        if (answers.preferredLocations.length === 0) {
          itemErrors.preferredLocations = "Select at least one location"
        }
        break
      case "preferredWorkTypes":
        if (answers.preferredWorkTypes.length === 0) {
          itemErrors.preferredWorkTypes = "Select at least one work type"
        }
        break
      case "preferredShifts":
        if (answers.preferredShifts.length === 0) {
          itemErrors.preferredShifts = "Select at least one shift"
        }
        break
      case "contractLength":
        if (!answers.contractLength) {
          itemErrors.contractLength = "Select a contract length"
        }
        break
      case "availableStart":
        if (!answers.availableStart) {
          itemErrors.availableStart = "Choose your available start date"
        }
        break
      case "recentJobTitle":
        if (!answers.recentJobTitle.trim()) {
          itemErrors.recentJobTitle = "Enter your most recent job title"
        }
        break
      case "totalExperienceYears": {
        const experienceValue = Number(answers.totalExperienceYears)
        if (!answers.totalExperienceYears) {
          itemErrors.totalExperienceYears = "Provide your total experience in years"
        } else if (Number.isNaN(experienceValue) || experienceValue < 0) {
          itemErrors.totalExperienceYears = "Enter a valid number of years"
        }
        break
      }
      case "occupation":
        if (!answers.occupation.trim()) {
          itemErrors.occupation = "Enter your occupation"
        }
        break
      case "licenseType":
        if (!answers.licenseType.trim()) {
          itemErrors.licenseType = "Enter your active license type"
        }
        break
      case "dateOfBirth":
        if (!answers.dateOfBirth) {
          itemErrors.dateOfBirth = "Provide your date of birth"
        }
        break
      case "resumeFileName":
        if (!resumeUploaded && !answers.resumeFileName) {
          itemErrors.resumeFileName = "Upload your latest resume"
        }
        break
      default:
        break
    }
    return itemErrors
  }

  const handleItemSave = async (itemId: ChecklistItemId) => {
    const itemErrors = validateItem(itemId)
    applyItemErrors(itemId, itemErrors)
    if (Object.keys(itemErrors).length > 0) {
      pushToast({ title: "Unable to save", description: "Resolve the highlighted fields.", type: "error" })
      return
    }
    const fields = ITEM_FIELD_MAP[itemId]
    const partial: Partial<AnswersState> = {}
    fields.forEach((field) => {
      partial[field] = answers[field]
    })
    setSavingItem(itemId)
    try {
      await persistPartialAnswers(partial)
      pushToast({ title: "Checklist updated", description: `${checklistMeta[itemId].label} saved.`, type: "success" })
    } catch (error) {
      pushToast({ title: "Save failed", description: "Please try again.", type: "error" })
    } finally {
      setSavingItem(null)
    }
  }

  const isItemComplete = (itemId: ChecklistItemId) => {
    switch (itemId) {
      case "preferredLocations":
        return answers.preferredLocations.length > 0
      case "preferredWorkTypes":
        return answers.preferredWorkTypes.length > 0
      case "preferredShifts":
        return answers.preferredShifts.length > 0
      case "contractLength":
        return Boolean(answers.contractLength)
      case "availableStart":
        return Boolean(answers.availableStart)
      case "recentJobTitle":
        return Boolean(answers.recentJobTitle.trim())
      case "totalExperienceYears":
        return Boolean(answers.totalExperienceYears)
      case "occupation":
        return Boolean(answers.occupation.trim())
      case "licenseType":
        return Boolean(answers.licenseType.trim())
      case "dateOfBirth":
        return Boolean(answers.dateOfBirth)
      case "resumeFileName":
        return Boolean(answers.resumeFileName || resumeUploaded)
      default:
        return false
    }
  }

  const hasAnyValueForItem = (itemId: ChecklistItemId) => {
    switch (itemId) {
      case "preferredLocations":
        return answers.preferredLocations.length > 0
      case "preferredWorkTypes":
        return answers.preferredWorkTypes.length > 0
      case "preferredShifts":
        return answers.preferredShifts.length > 0
      case "contractLength":
        return Boolean(answers.contractLength)
      case "availableStart":
        return Boolean(answers.availableStart)
      case "recentJobTitle":
        return Boolean(answers.recentJobTitle)
      case "totalExperienceYears":
        return Boolean(answers.totalExperienceYears)
      case "occupation":
        return Boolean(answers.occupation)
      case "licenseType":
        return Boolean(answers.licenseType)
      case "dateOfBirth":
        return Boolean(answers.dateOfBirth)
      case "resumeFileName":
        return Boolean(answers.resumeFileName || resumeUploaded)
      default:
        return false
    }
  }

  const getItemStatus = (itemId: ChecklistItemId) => {
    const complete = isItemComplete(itemId)
    const hasAny = hasAnyValueForItem(itemId)
    if (complete) {
      return { label: "Completed", tone: "success" as const }
    }
    if (hasAny) {
      return { label: "Pending", tone: "warning" as const }
    }
    return { label: "Missing", tone: "neutral" as const }
  }

  const renderErrorText = (field: AnswerKey) => {
    if (!errors[field]) {
      return null
    }
    return <p className="text-xs text-danger">{errors[field]}</p>
  }

  const renderItemContent = (itemId: ChecklistItemId) => {
    switch (itemId) {
      case "preferredLocations":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Select up to 3 preferred locations.</p>
            <MultiSelectChips
              options={PREFERRED_LOCATIONS}
              value={answers.preferredLocations}
              onChange={(value) => updateAnswer("preferredLocations", value)}
              maxSelections={3}
            />
            {renderErrorText("preferredLocations")}
          </div>
        )
      case "preferredWorkTypes":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Choose all work styles you're open to.</p>
            <MultiSelectChips options={WORK_TYPES} value={answers.preferredWorkTypes} onChange={(value) => updateAnswer("preferredWorkTypes", value)} />
            {renderErrorText("preferredWorkTypes")}
          </div>
        )
      case "preferredShifts":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Pick at least one shift preference.</p>
            <MultiSelectChips options={SHIFTS} value={answers.preferredShifts} onChange={(value) => updateAnswer("preferredShifts", value)} />
            {renderErrorText("preferredShifts")}
          </div>
        )
      case "contractLength":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Select the contract length that fits.</p>
            <MultiSelectChips
              options={CONTRACT_LENGTHS}
              value={answers.contractLength ? [answers.contractLength] : []}
              onChange={([first]) => updateAnswer("contractLength", first ?? "")}
              maxSelections={1}
            />
            {renderErrorText("contractLength")}
          </div>
        )
      case "availableStart":
        return (
          <DatePicker
            label="Available start date"
            value={answers.availableStart}
            onChange={(value) => updateAnswer("availableStart", value)}
            error={errors.availableStart}
          />
        )
      case "recentJobTitle":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Most recent job title</label>
            <Input
              value={answers.recentJobTitle}
              onChange={(event) => updateAnswer("recentJobTitle", event.target.value)}
              placeholder="e.g., Registered Nurse"
              aria-invalid={Boolean(errors.recentJobTitle)}
            />
            {renderErrorText("recentJobTitle")}
          </div>
        )
      case "totalExperienceYears":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Total experience</label>
            <Input
              type="number"
              min={0}
              value={answers.totalExperienceYears}
              onChange={(event) => updateAnswer("totalExperienceYears", event.target.value)}
              placeholder="Years of experience"
              aria-invalid={Boolean(errors.totalExperienceYears)}
            />
            {renderErrorText("totalExperienceYears")}
          </div>
        )
      case "occupation":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Occupation / specialty</label>
            <select
              value={answers.occupation}
              onChange={(event) => updateAnswer("occupation", event.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-invalid={Boolean(errors.occupation)}
            >
              {occupationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {renderErrorText("occupation")}
          </div>
        )
      case "licenseType":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Primary license type</label>
            <Input
              value={answers.licenseType}
              onChange={(event) => updateAnswer("licenseType", event.target.value)}
              placeholder="e.g., CA RN"
              aria-invalid={Boolean(errors.licenseType)}
            />
            {renderErrorText("licenseType")}
          </div>
        )
      case "dateOfBirth":
        return (
          <DatePicker
            label="Date of birth"
            value={answers.dateOfBirth}
            max={today}
            onChange={(value) => updateAnswer("dateOfBirth", value)}
            error={errors.dateOfBirth}
          />
        )
      case "resumeFileName":
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Upload your Resume / CV</p>
            <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeFileChange} />
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-muted-foreground">
                  {resumeUploaded ? `Uploaded: ${answers.resumeFileName || "Resume"}` : "Upload your most recent Resume or CV in PDF or DOC format."}
                </div>
                <Button type="button" variant="outline" onClick={() => resumeInputRef.current?.click()} disabled={uploadingResume}>
                  {uploadingResume ? "Uploading..." : resumeUploaded ? "Replace file" : "Upload file"}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Accepted formats: PDF, DOC, DOCX.</p>
              {renderErrorText("resumeFileName")}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const completedChecklistItems = checklistOrder.filter((itemId) => isItemComplete(itemId)).length
  const totalChecklistItems = checklistOrder.length
  const completionPercent = Math.round((completedChecklistItems / totalChecklistItems) * 100)

  const handleQuestionnaireSave = async () => {
    setQuestionnaireSaving(true)
    try {
      await persistPartialAnswers({
        summaryNote: answers.summaryNote,
        requestedTimeOff1: answers.requestedTimeOff1,
        requestedTimeOff2: answers.requestedTimeOff2,
      })
      pushToast({ title: "Questionnaire saved", description: "We captured your additional context.", type: "success" })
      // Navigate to dashboard after successful save
      goCandidateDashboard()
    } catch (error) {
      pushToast({ title: "Save failed", description: "Please try again.", type: "error" })
      setQuestionnaireSaving(false)
    }
  }

  const getItemIcon = (itemId: ChecklistItemId) => {
    const iconMap: Record<ChecklistItemId, typeof MapPin> = {
      preferredLocations: MapPin,
      preferredWorkTypes: Briefcase,
      preferredShifts: Clock,
      contractLength: Calendar,
      availableStart: Calendar,
      recentJobTitle: Briefcase,
      totalExperienceYears: TrendingUp,
      occupation: User,
      licenseType: Award,
      dateOfBirth: User,
      resumeFileName: FileText,
    }
    return iconMap[itemId] || Circle
  }

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Candidate / Profile Progress
            </p>
            <h1 className="text-3xl font-bold text-foreground mt-1">Let's get to know u better</h1>
          </div>
        </div>
        <p className="text-base text-muted-foreground max-w-2xl">
          Complete any requirement in any order. Each save updates your readiness instantly.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
        <div className="rounded-3xl border-2 border-border/50 bg-gradient-to-br from-card/90 via-card/70 to-card/50 p-6 shadow-xl backdrop-blur-sm">
          <div className="sticky top-0 z-20 mb-6 -mx-6 -mt-6 flex flex-col gap-3 rounded-t-3xl border-b-2 border-border/40 bg-gradient-to-r from-card/98 via-card/95 to-card/98 px-6 py-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">Interactive Checklist</p>
              <p className="text-xs text-muted-foreground">Open any item to update its details. Save to lock progress.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{completedChecklistItems}</p>
                <p className="text-xs font-medium text-muted-foreground">of {totalChecklistItems} complete</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <CheckCircle2 className={cn("h-6 w-6", completedChecklistItems === totalChecklistItems ? "text-success" : "text-primary/60")} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {checklistOrder.map((itemId) => {
              const item = checklistMeta[itemId]
              const isExpanded = expandedItem === itemId
              const { label: statusLabel, tone: statusTone } = getItemStatus(itemId)
              const isSaving = savingItem === itemId
              const disableSave = isSaving || (itemId === "resumeFileName" && uploadingResume)
              const isComplete = isItemComplete(itemId)
              const Icon = getItemIcon(itemId)
              return (
                <div 
                  key={itemId} 
                  className={cn(
                    "rounded-2xl border-2 transition-all duration-300",
                    isComplete 
                      ? "border-success/40 bg-gradient-to-br from-success/10 via-success/5 to-transparent shadow-md" 
                      : isExpanded
                      ? "border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg scale-[1.01]"
                      : "border-border/60 bg-gradient-to-br from-background/90 via-background/80 to-background/70 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left group"
                    onClick={() => setExpandedItem((current) => (current === itemId ? null : itemId))}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 mt-0.5",
                        isComplete 
                          ? "bg-success/20 text-success" 
                          : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className={cn("font-semibold text-foreground mb-1", isComplete && "text-success")}>{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusChip label={statusLabel} tone={statusTone} />
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-all duration-300",
                          isExpanded && "rotate-180 text-primary"
                        )}
                      />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="space-y-4 border-t-2 border-border/40 bg-gradient-to-br from-muted/30 via-muted/20 to-muted/10 px-5 py-5 animate-in slide-in-from-top-2 duration-300">
                      {renderItemContent(itemId)}
                      <div className="flex justify-end pt-2">
                        <Button 
                          onClick={() => handleItemSave(itemId)} 
                          disabled={disableSave}
                          className="min-w-[120px] bg-primary hover:bg-primary/90"
                        >
                          {isSaving ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Saving...
                            </>
                          ) : (
                            "Save item"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-3xl border-2 border-border/50 bg-gradient-to-br from-card/90 via-card/70 to-card/50 p-6 shadow-xl backdrop-blur-sm">
          <div className="space-y-2 mb-6">
            <p className="text-sm font-bold text-foreground">Progress Snapshot</p>
            <p className="text-xs text-muted-foreground">Keep every tile green to unlock auto-matching.</p>
          </div>
          <div className="mt-6 rounded-2xl border-2 border-border/60 bg-gradient-to-br from-background/90 via-background/80 to-background/70 p-8 text-center shadow-inner">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-xl" />
              <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-4 border-primary/20">
                <p className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">{completionPercent}%</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground mb-4">Complete</p>
            <div className="mt-4 h-3 rounded-full bg-muted/60 overflow-hidden shadow-inner">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out shadow-sm",
                  completionPercent === 100 
                    ? "bg-gradient-to-r from-success to-success/80" 
                    : completionPercent >= 75
                    ? "bg-gradient-to-r from-primary to-primary/80"
                    : "bg-gradient-to-r from-warning to-warning/80"
                )} 
                style={{ width: `${completionPercent}%` }} 
              />
            </div>
            <div className="mt-6 pt-6 border-t border-border/40">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{completedChecklistItems}</p>
                  <p className="text-muted-foreground">Completed</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{totalChecklistItems - completedChecklistItems}</p>
                  <p className="text-muted-foreground">Remaining</p>
                </div>
              </div>
            </div>

          </div>
          <div className="mt-6 space-y-3 text-xs text-muted-foreground bg-muted/30 rounded-xl p-4 border border-border/40">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <p>Save each item independently. Changes persist instantly.</p>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p>Resume is required for recruiters to review your profile.</p>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p>Compliance and preferences feed recommendations and AutoApply.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border-2 border-border/50 bg-gradient-to-br from-card/90 via-card/70 to-card/50 p-6 shadow-xl backdrop-blur-sm">
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Additional candidate questionnaire</p>
              <h2 className="text-xl font-bold text-foreground mt-1">Tell us anything else we should know</h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Use this space to highlight context for recruiters, requested time off, or upcoming plans.
          </p>
        </div>
        <div className="space-y-4">
          <textarea
            value={answers.summaryNote}
            onChange={(event) => updateAnswer("summaryNote", event.target.value)}
            placeholder="Quick summary (optional, up to 200 characters)"
            maxLength={200}
            className="w-full min-h-[100px] rounded-xl border-2 border-border/60 bg-background/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <DatePicker label="Requested time off 1" value={answers.requestedTimeOff1} onChange={(value) => updateAnswer("requestedTimeOff1", value)} />
            <DatePicker label="Requested time off 2" value={answers.requestedTimeOff2} onChange={(value) => updateAnswer("requestedTimeOff2", value)} />
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button 
            onClick={handleQuestionnaireSave} 
            disabled={questionnaireSaving}
            className="min-w-[160px] bg-primary hover:bg-primary/90"
          >
            {questionnaireSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              "Save questionnaire"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

