"use client"

import React, { useState, useEffect, useMemo, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dropdown, type DropdownOption } from "@/components/system/dropdown"
import { DatePicker } from "@/components/system/date-picker"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useToast } from "@/components/system"
import { cn } from "@/lib/utils"
import { CheckCircle2, Upload, X } from "lucide-react"
import {
  getActiveOccupations,
  getOccupationById,
  getAdminWalletTemplatesByOccupation,
  getComplianceListItemById,
  getAllComplianceListItems,
  getOccupationSpecialtiesByOccupation,
  getSpecialtyById,
} from "@/lib/admin-local-db"

type StepDefinition = {
  id: string
  title: string
  description?: string
  content: React.ReactNode
}

const TIME_ZONES = [
  { label: "Select your time zone", value: "" },
  { label: "Eastern Time (ET)", value: "America/New_York" },
  { label: "Central Time (CT)", value: "America/Chicago" },
  { label: "Mountain Time (MT)", value: "America/Denver" },
  { label: "Pacific Time (PT)", value: "America/Los_Angeles" },
  { label: "Alaska Time (AKT)", value: "America/Anchorage" },
  { label: "Hawaii Time (HST)", value: "Pacific/Honolulu" },
  { label: "Arizona Time (MST)", value: "America/Phoenix" },
]

const YEARS_OF_EXPERIENCE = [
  { label: "Select experience level", value: "" },
  { label: "Less than 1 year", value: "0-1" },
  { label: "1-2 years", value: "1-2" },
  { label: "3-5 years", value: "3-5" },
  { label: "6-10 years", value: "6-10" },
  { label: "11-15 years", value: "11-15" },
  { label: "16-20 years", value: "16-20" },
  { label: "More than 20 years", value: "20+" },
]

type ProfileSetupData = {
  phoneNumber: string
  timeZone: string
  city: string
  state: string
  zipCode: string
  occupation: string
  specialty: string
  yearsOfExperience: string
  employmentTypes: string[]
  preferredShift: string
  willingToTravel: string
}

export default function CandidateProfileSetupPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const { saveOnboardingDetails, data: localDb, markDocumentUploaded } = useLocalDb()
  const { actions, candidate } = useDemoData()
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [occupationOptions, setOccupationOptions] = useState<DropdownOption[]>([
    { label: "Select your occupation", value: "" },
  ])
  const [specialtyOptions, setSpecialtyOptions] = useState<DropdownOption[]>([
    { label: "Select your specialty", value: "" },
  ])
  const [formData, setFormData] = useState<ProfileSetupData>({
    phoneNumber: "",
    timeZone: "",
    city: "",
    state: "",
    zipCode: "",
    occupation: "",
    specialty: "",
    yearsOfExperience: "",
    employmentTypes: [],
    preferredShift: "",
    willingToTravel: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileSetupData, string>>>({})
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({})
  const [documentFiles, setDocumentFiles] = useState<Record<string, { file: File; expiryDate: string }>>({})

  // Load occupation options on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const occupations = getActiveOccupations()
        const options: DropdownOption[] = [{ label: "Select your occupation", value: "" }]
        const seenCodes = new Set<string>()
        occupations.forEach((occ) => {
          const uniqueCode = occ.code || occ.id || occ.name
          if (!uniqueCode || seenCodes.has(uniqueCode)) return
          seenCodes.add(uniqueCode)
          options.push({
            label: occ.code ? `${occ.name} (${occ.code})` : occ.name,
            value: occ.id ?? uniqueCode,
          })
        })
        setOccupationOptions(options)
      } catch (error) {
        console.error("Failed to load occupations:", error)
      }
    }
  }, [])

  // Load specialties when occupation is selected
  useEffect(() => {
    if (typeof window !== "undefined" && formData.occupation) {
      try {
        const occupationSpecialties = getOccupationSpecialtiesByOccupation(formData.occupation)
        const options: DropdownOption[] = [{ label: "Select your specialty", value: "" }]
        
        occupationSpecialties.forEach((occSpec) => {
          const specialty = getSpecialtyById(occSpec.specialtyId)
          if (specialty && specialty.isActive) {
            options.push({
              label: specialty.name,
              value: specialty.id,
            })
          }
        })
        
        setSpecialtyOptions(options)
        
        // Reset specialty if occupation changes
        if (formData.specialty) {
          const currentSpecialty = getSpecialtyById(formData.specialty)
          const isValidSpecialty = occupationSpecialties.some(
            (occSpec) => occSpec.specialtyId === formData.specialty
          )
          if (!isValidSpecialty || !currentSpecialty?.isActive) {
            setFormData((prev) => ({ ...prev, specialty: "" }))
          }
        }
      } catch (error) {
        console.error("Failed to load specialties:", error)
        setSpecialtyOptions([{ label: "Select your specialty", value: "" }])
      }
    } else {
      setSpecialtyOptions([{ label: "Select your specialty", value: "" }])
      if (formData.specialty) {
        setFormData((prev) => ({ ...prev, specialty: "" }))
      }
    }
  }, [formData.occupation])

  // Basic documents that are always required (shown in profile section)
  const BASIC_DOCUMENTS = [
    "Resume",
    "Date of birth proof",
    "Certifications",
    "References",
    "License",
  ]

  // Get compliance documents based on selected occupation
  const complianceDocuments = useMemo(() => {
    const itemSet = new Set<string>()

    // Always include basic documents
    BASIC_DOCUMENTS.forEach((doc) => itemSet.add(doc))

    // If occupation is selected, add occupation-specific documents
    if (formData.occupation && typeof window !== "undefined") {
      try {
        // Get occupation by ID
        const occupation = getOccupationById(formData.occupation)
        if (occupation && occupation.code) {
          // Get wallet templates for this occupation
          const templates = getAdminWalletTemplatesByOccupation(occupation.code)
          templates.forEach((template) => {
            // Only include general occupation templates (without specialty)
            if (!template.specialtyId) {
              template.listItemIds.forEach((listItemId) => {
                const listItem = getComplianceListItemById(listItemId)
                if (listItem && listItem.isActive) {
                  itemSet.add(listItem.name)
                }
              })
            }
          })
        }
      } catch (error) {
        console.error("Failed to load occupation-specific documents:", error)
      }
    }

    // Also add all compliance list items that are marked for candidate display
    // These are basic/general items not specific to any occupation
    if (typeof window !== "undefined") {
      try {
        const allComplianceItems = getAllComplianceListItems()
        const displayableItems = allComplianceItems.filter((item) => item.displayToCandidate && item.isActive)
        displayableItems.forEach((item) => {
          itemSet.add(item.name)
        })
      } catch (error) {
        console.error("Failed to load displayable compliance items:", error)
      }
    }

    return Array.from(itemSet).sort()
  }, [formData.occupation, candidate.documents, localDb.uploadedDocuments, documentFiles])

  // Check which documents are already uploaded
  const getDocumentStatus = (docName: string) => {
    // Check in candidate.documents
    const existingDoc = candidate.documents.find((doc) => doc.type === docName)
    if (existingDoc) {
      return {
        status: existingDoc.status,
        uploaded: true,
        name: existingDoc.name,
      }
    }
    // Check in localDB
    if (localDb.uploadedDocuments[docName]) {
      return {
        status: "Pending Verification",
        uploaded: true,
        name: localDb.uploadedDocuments[docName].name || docName,
      }
    }
    // Check if file is selected but not uploaded yet
    if (documentFiles[docName]) {
      return {
        status: "Ready to Upload",
        uploaded: false,
        name: documentFiles[docName].file.name,
      }
    }
    return {
      status: "Not Started",
      uploaded: false,
      name: null,
    }
  }

  const handleFileSelect = (docName: string, file: File | null) => {
    if (!file) {
      const { [docName]: removed, ...rest } = documentFiles
      setDocumentFiles(rest)
      return
    }
    setDocumentFiles((prev) => ({
      ...prev,
      [docName]: { file, expiryDate: "" },
    }))
  }

  const handleExpiryDateChange = (docName: string, date: string) => {
    setDocumentFiles((prev) => {
      if (!prev[docName]) return prev
      return {
        ...prev,
        [docName]: { ...prev[docName], expiryDate: date },
      }
    })
  }

  const handleUploadDocument = async (docName: string) => {
    const docData = documentFiles[docName]
    if (!docData || !docData.file) {
      pushToast({
        title: "No file selected",
        description: "Please select a file to upload.",
        type: "error",
      })
      return
    }

    if (!docData.expiryDate) {
      pushToast({
        title: "Expiry date required",
        description: "Please select an expiry date for this document.",
        type: "error",
      })
      return
    }

    setUploadingDocs((prev) => ({ ...prev, [docName]: true }))

    try {
      // Upload document
      const newDoc = await actions.uploadDocument({
        name: docData.file.name,
        type: docName,
      })
      
      // Update with expiry date
      await actions.replaceDocument(newDoc.id, {
        expiresOn: docData.expiryDate,
        status: "Pending Verification",
      })

      // Mark in localDB
      markDocumentUploaded(docName, {
        name: docData.file.name,
        source: "profile-setup",
      })

      // Remove from pending files
      const { [docName]: removed, ...rest } = documentFiles
      setDocumentFiles(rest)

      pushToast({
        title: "Document uploaded",
        description: `${docName} has been uploaded and is pending verification.`,
        type: "success",
      })
    } catch (error) {
      console.error("Failed to upload document:", error)
      pushToast({
        title: "Upload failed",
        description: "Please try again.",
        type: "error",
      })
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [docName]: false }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof ProfileSetupData, string>> = {}

    if (step === 0) {
      // Step 1: Basic Info
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required"
      } else if (!/^[\d\s\-\(\)]+$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
        newErrors.phoneNumber = "Please enter a valid phone number"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ProfileSetupData) => (value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleEmploymentTypeToggle = (type: string) => {
    setFormData((prev) => {
      const currentTypes = prev.employmentTypes || []
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type]
      return { ...prev, employmentTypes: newTypes }
    })
    // Clear error when user makes a selection
    if (errors.employmentTypes) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.employmentTypes
        return next
      })
    }
  }

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Format phone number as user types
    const cleaned = value.replace(/\D/g, "")
    let formatted = ""
    if (cleaned.length > 0) {
      if (cleaned.length <= 3) {
        formatted = `(${cleaned}`
      } else if (cleaned.length <= 6) {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
      } else {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
      }
    }
    handleInputChange("phoneNumber")(formatted)
  }

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await handleFinish()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = async () => {
    if (!validateStep(currentStep)) {
      return
    }

    setSaving(true)
    try {
      // Get occupation name/code from ID
      let occupationName = formData.occupation
      if (formData.occupation) {
        try {
          const occupation = getOccupationById(formData.occupation)
          if (occupation) {
            // Save occupation code or name (prefer code for wallet templates)
            occupationName = occupation.code || occupation.name || formData.occupation
          }
        } catch (error) {
          console.warn("Failed to get occupation details:", error)
        }
      }

      // Get specialty name if selected
      let specialtyName = formData.specialty
      if (formData.specialty) {
        try {
          const specialty = getSpecialtyById(formData.specialty)
          if (specialty) {
            specialtyName = specialty.name || formData.specialty
          }
        } catch (error) {
          console.warn("Failed to get specialty details:", error)
        }
      }

      // Save profile setup data
      saveOnboardingDetails({
        ...localDb.onboardingDetails,
        phoneNumber: formData.phoneNumber,
        timeZone: formData.timeZone,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        occupation: occupationName,
        specialty: specialtyName,
        yearsOfExperience: formData.yearsOfExperience,
        employmentTypes: formData.employmentTypes,
        preferredShift: formData.preferredShift,
        willingToTravel: formData.willingToTravel,
      })

      // Initialize wallet with occupation if selected
      if (occupationName) {
        try {
          await actions.initializeCandidateWalletWithOccupation(occupationName)
        } catch (error) {
          console.warn("Failed to initialize wallet:", error)
          // Continue even if wallet initialization fails
        }
      }

      pushToast({
        title: "Profile setup complete",
        description: "Your profile has been saved successfully.",
        type: "success",
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/candidate/dashboard")
      }, 1000)
    } catch (error) {
      console.error("Failed to save profile:", error)
      pushToast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        type: "error",
      })
      setSaving(false)
    }
  }

  const handleSkip = async () => {
    setSaving(true)
    try {
      // Save whatever data we have
      saveOnboardingDetails({
        ...localDb.onboardingDetails,
        phoneNumber: formData.phoneNumber,
        timeZone: formData.timeZone,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        occupation: formData.occupation,
        specialty: formData.specialty,
        yearsOfExperience: formData.yearsOfExperience,
        employmentTypes: formData.employmentTypes,
        preferredShift: formData.preferredShift,
        willingToTravel: formData.willingToTravel,
      })

      pushToast({
        title: "Profile saved",
        description: "You can complete your profile later.",
        type: "success",
      })

      setTimeout(() => {
        router.push("/candidate/dashboard")
      }, 1000)
    } catch (error) {
      console.error("Failed to save profile:", error)
      pushToast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        type: "error",
      })
      setSaving(false)
    }
  }

  const steps: StepDefinition[] = [
    {
      id: "basic-info",
      title: "Basic Information",
      description: "Tell us a bit about yourself",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone Number <span className="text-destructive">*</span>
            </label>
            <Input
              type="tel"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567"
              className={cn(errors.phoneNumber && "border-destructive")}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-destructive mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          <div>
            <Dropdown
              label="Time Zone"
              value={formData.timeZone}
              onChange={handleInputChange("timeZone")}
              options={TIME_ZONES as DropdownOption[]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">City</label>
            <Input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange("city")(e.target.value)}
              placeholder="Boston"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">State</label>
            <Input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange("state")(e.target.value)}
              placeholder="MA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Zip Code</label>
            <Input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleInputChange("zipCode")(e.target.value)}
              placeholder="02101"
              maxLength={10}
            />
          </div>
        </div>
      ),
    },
    {
      id: "professional",
      title: "Professional Role",
      description: "Help us understand your professional background",
      content: (
        <div className="space-y-6">
          <div>
            <Dropdown
              label="Primary Occupation"
              value={formData.occupation}
              onChange={handleInputChange("occupation")}
              options={occupationOptions}
            />
          </div>

          {formData.occupation && (
            <div>
              <Dropdown
                label="Specialty"
                value={formData.specialty}
                onChange={handleInputChange("specialty")}
                options={specialtyOptions}
              />
            </div>
          )}

          <div>
            <Dropdown
              label="Years of Experience"
              value={formData.yearsOfExperience}
              onChange={handleInputChange("yearsOfExperience")}
              options={YEARS_OF_EXPERIENCE as DropdownOption[]}
            />
          </div>
        </div>
      ),
    },
    {
      id: "preferences",
      title: "Work Preferences",
      description: "Help us find the best job matches for you",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Employment Type <span className="text-slate-500 font-normal">(Select all that apply)</span>
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.employmentTypes.includes("Long-term")}
                  onChange={() => handleEmploymentTypeToggle("Long-term")}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary">Long-term</span>
                  <p className="text-xs text-slate-500 mt-0.5">Contracts typically 13+ weeks</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.employmentTypes.includes("Per diem")}
                  onChange={() => handleEmploymentTypeToggle("Per diem")}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary">Per diem</span>
                  <p className="text-xs text-slate-500 mt-0.5">Flexible day-to-day shifts</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.employmentTypes.includes("Permanent")}
                  onChange={() => handleEmploymentTypeToggle("Permanent")}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary">Permanent</span>
                  <p className="text-xs text-slate-500 mt-0.5">Full-time employment</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Preferred Shift</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="preferredShift"
                  value="Day"
                  checked={formData.preferredShift === "Day"}
                  onChange={(e) => handleInputChange("preferredShift")(e.target.value)}
                  className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground group-hover:text-primary">Day</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="preferredShift"
                  value="Night"
                  checked={formData.preferredShift === "Night"}
                  onChange={(e) => handleInputChange("preferredShift")(e.target.value)}
                  className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground group-hover:text-primary">Night</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="preferredShift"
                  value="Flexible"
                  checked={formData.preferredShift === "Flexible"}
                  onChange={(e) => handleInputChange("preferredShift")(e.target.value)}
                  className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground group-hover:text-primary">Flexible</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Willing to travel?</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="willingToTravel"
                  value="Yes"
                  checked={formData.willingToTravel === "Yes"}
                  onChange={(e) => handleInputChange("willingToTravel")(e.target.value)}
                  className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground group-hover:text-primary">Yes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="willingToTravel"
                  value="No"
                  checked={formData.willingToTravel === "No"}
                  onChange={(e) => handleInputChange("willingToTravel")(e.target.value)}
                  className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground group-hover:text-primary">No</span>
              </label>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "compliance",
      title: "Compliance Documents",
      description: "Based on your role, these documents are commonly required",
      content: (
        <div className="space-y-6">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              Upload your compliance documents now or complete your profile and upload them later from your Document Wallet.
            </p>
          </div>

          {complianceDocuments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">
                No compliance documents found. Documents may be added later by your administrator.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {complianceDocuments.map((docName) => {
                const docStatus = getDocumentStatus(docName)
                const isUploaded = docStatus.uploaded
                const isUploading = uploadingDocs[docName]
                const hasFile = Boolean(documentFiles[docName])

                return (
                  <div
                    key={docName}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 mt-1",
                          isUploaded
                            ? "bg-green-100"
                            : hasFile
                              ? "bg-blue-100"
                              : "bg-slate-100"
                        )}>
                          {isUploaded ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Upload className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{docName}</p>
                          {isUploaded ? (
                            <div className="mt-1">
                              <p className="text-xs text-green-600 font-medium">
                                {docStatus.status === "Completed" ? "Verified" : "Pending Verification"}
                              </p>
                              {docStatus.name && (
                                <p className="text-xs text-slate-500 mt-0.5">{docStatus.name}</p>
                              )}
                            </div>
                          ) : hasFile ? (
                            <div className="mt-1">
                              <p className="text-xs text-blue-600 font-medium">Ready to Upload</p>
                              <p className="text-xs text-slate-500 mt-0.5">{documentFiles[docName].file.name}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 mt-1">Not Started</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isUploaded && (
                      <div className="mt-4 space-y-3 pt-4 border-t border-slate-100">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Select File
                            </label>
                            <input
                              type="file"
                              onChange={(e) => handleFileSelect(docName, e.target.files?.[0] || null)}
                              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                          </div>
                          <div>
                            <DatePicker
                              label="Expiry Date"
                              value={documentFiles[docName]?.expiryDate || ""}
                              onChange={(value) => handleExpiryDateChange(docName, value)}
                              min={new Date().toISOString().split("T")[0]}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleUploadDocument(docName)}
                          disabled={!hasFile || !documentFiles[docName]?.expiryDate || isUploading}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          {isUploading ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Document
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ),
    },
  ]

  const progressValue = Math.round(((currentStep + 1) / steps.length) * 100)
  const currentStepData = steps[currentStep]

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Welcome to the Candidate Portal</h1>
          <p className="mt-2 text-slate-600">Let's set up your profile in just a few minutes</p>
        </div>

        {/* Step indicators */}
        <div className="mb-8">
          <div className="mb-4 text-center">
            <p className="text-sm font-semibold text-slate-500">
              Step {currentStep + 1} of {steps.length}
            </p>
            <p className="mt-1 text-sm text-slate-600">{progressValue}% Complete</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                      index < currentStep
                        ? "border-primary bg-primary text-white"
                        : index === currentStep
                          ? "border-primary bg-primary text-white"
                          : "border-slate-300 bg-white text-slate-400",
                    )}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-1 text-xs font-medium",
                      index <= currentStep ? "text-slate-900" : "text-slate-400",
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 h-0.5 w-12 transition-colors",
                      index < currentStep ? "bg-primary" : "bg-slate-300",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{currentStepData.title}</h2>
              {currentStepData.description && (
                <p className="mt-1 text-sm text-slate-600">{currentStepData.description}</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              {currentStepData.content}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {currentStep === 0 || currentStep === 1 || currentStep === 2 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    disabled={saving}
                    className="text-slate-600"
                  >
                    Skip for now
                  </Button>
                  {currentStep === 0 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={saving || !formData.phoneNumber.trim()}
                      className="bg-slate-900 text-white hover:bg-slate-800"
                    >
                      Continue
                    </Button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={saving}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={saving}
                        className="bg-slate-900 text-white hover:bg-slate-800"
                      >
                        Continue
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/candidate/dashboard")}
                    disabled={saving}
                    className="text-slate-600"
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    type="button"
                    onClick={handleFinish}
                    disabled={saving}
                    className="bg-slate-900 text-white hover:bg-slate-800"
                  >
                    {saving ? "Saving..." : "Complete Setup"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

