"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { 
  getQuestionnaireByOccupationId, 
  getGeneralQuestionnaire,
  getOccupationByCode,
  type OccupationQuestionnaire,
  type GeneralQuestionnaire,
} from "@/lib/admin-local-db"
import { FileText, Upload, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Question = (OccupationQuestionnaire["questions"][0] | GeneralQuestionnaire["questions"][0])
type QuestionnaireAnswers = Record<string, string | string[] | File | null>

export default function CandidateQuestionnairePage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const { data: localDb, saveOnboardingDetails, markDocumentUploaded } = useLocalDb()
  const { actions } = useDemoData()
  const [occupationCode, setOccupationCode] = useState<string | null>(null)
  const [occupationQuestionnaire, setOccupationQuestionnaire] = useState<OccupationQuestionnaire | null>(null)
  const [generalQuestionnaire, setGeneralQuestionnaire] = useState<GeneralQuestionnaire | null>(null)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)

  useEffect(() => {
    // Get occupation from sessionStorage (set during signup)
    const signupOccupation = typeof window !== "undefined" ? sessionStorage.getItem("candidate_signup_occupation") : null
    if (signupOccupation) {
      setOccupationCode(signupOccupation)
      sessionStorage.removeItem("candidate_signup_occupation")
    } else {
      // Fallback to occupation from onboarding details
      const onboardingOccupation = localDb.onboardingDetails?.occupation as string
      if (onboardingOccupation) {
        setOccupationCode(onboardingOccupation)
      }
    }
  }, [localDb])

  useEffect(() => {
    if (occupationCode) {
      const occupation = getOccupationByCode(occupationCode)
      if (occupation) {
        const occQuestionnaire = getQuestionnaireByOccupationId(occupation.id)
        setOccupationQuestionnaire(occQuestionnaire)
      } else {
        setOccupationQuestionnaire(null)
      }
    } else {
      setOccupationQuestionnaire(null)
    }
    const genQuestionnaire = getGeneralQuestionnaire()
    setGeneralQuestionnaire(genQuestionnaire)
  }, [occupationCode])

  // Load existing answers from local DB (only on initial load to prevent clearing unsaved fields)
  const [answersLoaded, setAnswersLoaded] = useState(false)
  useEffect(() => {
    if (!answersLoaded) {
      const existingAnswers = localDb.onboardingDetails?.questionnaireAnswers as QuestionnaireAnswers | undefined
      if (existingAnswers && Object.keys(existingAnswers).length > 0) {
        // Only load on initial mount
        setAnswers(existingAnswers)
        setAnswersLoaded(true)
      } else {
        // Mark as loaded even if no existing answers to prevent re-running
        setAnswersLoaded(true)
      }
    }
  }, [localDb.onboardingDetails?.questionnaireAnswers, answersLoaded])

  const handleAnswerChange = (questionId: string, value: string | string[] | File | null) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    // Clear error for this question when user starts typing/selecting
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[questionId]
        return next
      })
    }
  }

  const handleFileUpload = async (questionId: string, file: File | null, questionText: string) => {
    if (!file) {
      handleAnswerChange(questionId, null)
      return
    }

    setUploadingFiles((prev) => ({ ...prev, [questionId]: true }))
    try {
      // Upload to compliance wallet - map question text to document type
      const questionLower = questionText.toLowerCase()
      const docType = questionLower.includes("resume") ? "Resume"
        : questionLower.includes("license") ? "License"
        : questionText
      
      await actions.uploadDocument({ name: file.name, type: docType })
      markDocumentUploaded(docType, { name: file.name, source: "questionnaire" })
      
      handleAnswerChange(questionId, file)
      pushToast({ 
        title: "File uploaded", 
        description: `${file.name} uploaded successfully and added to your compliance wallet.`,
        type: "success" 
      })
    } catch (error) {
      pushToast({ 
        title: "Upload failed", 
        description: "Please try again.",
        type: "error" 
      })
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [questionId]: false }))
    }
  }

  const validateAnswers = (step: 1 | 2): { isValid: boolean; firstErrorId?: string } => {
    const newErrors: Record<string, string> = {}
    
    const validateQuestionnaire = (questions: Question[]) => {
      questions.forEach((question) => {
        const answer = answers[question.id]
        
        // Check if required field is empty
        if (question.required) {
          if (!answer) {
            newErrors[question.id] = "This field is required"
            return // Use return instead of continue in forEach
          }
          
          // Check for file uploads (can be File object or string filename)
          if (question.type === "file") {
            if (!(answer instanceof File) && !(typeof answer === "string" && answer.trim())) {
              newErrors[question.id] = "This field is required"
              return
            }
          }
          // Check for empty strings (but not for file uploads which are handled above)
          else if (typeof answer === "string" && !answer.trim()) {
            newErrors[question.id] = "This field is required"
            return
          }
          // Check for empty arrays (checkbox)
          else if (Array.isArray(answer) && answer.length === 0) {
            newErrors[question.id] = "Please select at least one option"
            return
          }
        }
        
        // Additional validations based on question type (only if answer exists)
        if (answer) {
          // Date validation - check if DOB year is 2007 or earlier
          if (question.type === "date" && question.id === "q-date-of-birth") {
            const dateValue = typeof answer === "string" ? answer : ""
            if (dateValue) {
              const date = new Date(dateValue)
              if (!isNaN(date.getTime())) {
                const year = date.getFullYear()
                if (year > 2007) {
                  newErrors[question.id] = "Date of birth must be in 2007 or earlier"
                }
              }
            }
          }
          
          // Number validation - ensure it's a valid positive number
          if (question.type === "number") {
            const numValue = typeof answer === "string" ? answer : ""
            if (numValue) {
              const num = parseFloat(numValue)
              if (isNaN(num) || num < 0) {
                newErrors[question.id] = "Please enter a valid number"
              }
            }
          }
          
          // Textarea validation - ensure it's not just whitespace (only for references)
          if (question.type === "textarea" && typeof answer === "string" && question.id === "q-references") {
            if (answer.trim().length < 10) {
              newErrors[question.id] = "Please provide more detailed information (at least 10 characters)"
            }
          }
        }
      })
    }

    if (step === 1 && occupationQuestionnaire) {
      validateQuestionnaire(occupationQuestionnaire.questions)
    }
    if (step === 2 && generalQuestionnaire) {
      validateQuestionnaire(generalQuestionnaire.questions)
    }

    setErrors(newErrors)
    const firstErrorId = Object.keys(newErrors)[0]
    return { isValid: Object.keys(newErrors).length === 0, firstErrorId }
  }

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate occupation questionnaire
      const validation = validateAnswers(1)
      if (!validation.isValid) {
        // Scroll to first error after state update
        setTimeout(() => {
          if (validation.firstErrorId) {
            const element = document.querySelector(`[data-question-id="${validation.firstErrorId}"]`)
            element?.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        }, 100)
        return
      }
      // Move to step 2
      setCurrentStep(2)
    }
  }

  const handleSkip = () => {
    // Skip general questionnaire and save
    handleSubmit(true)
  }

  const handleSubmit = async (skipGeneral = false) => {
    // Validate current step
    let validation: { isValid: boolean; firstErrorId?: string }
    
    if (currentStep === 1) {
      validation = validateAnswers(1)
      if (!validation.isValid) {
        // Scroll to first error after state update
        setTimeout(() => {
          if (validation.firstErrorId) {
            const element = document.querySelector(`[data-question-id="${validation.firstErrorId}"]`)
            element?.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        }, 100)
        return
      }
    } else if (currentStep === 2 && !skipGeneral) {
      // Only validate general questionnaire if not skipping
      validation = validateAnswers(2)
      if (!validation.isValid) {
        // Scroll to first error after state update
        setTimeout(() => {
          if (validation.firstErrorId) {
            const element = document.querySelector(`[data-question-id="${validation.firstErrorId}"]`)
            element?.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        }, 100)
        return
      }
    }

    setSaving(true)
    try {
      // Convert File objects to file names for storage
      // Also ensure uploaded files are marked in wallet
      const answersToSave: Record<string, string | string[]> = {}
      const allQuestions = [
        ...(occupationQuestionnaire?.questions || []),
        ...(skipGeneral ? [] : generalQuestionnaire?.questions || [])
      ]
      
      Object.entries(answers).forEach(([key, value]) => {
        // Only save answers for current step and previous steps
        const isOccupationQuestion = occupationQuestionnaire?.questions.some(q => q.id === key)
        const isGeneralQuestion = generalQuestionnaire?.questions.some(q => q.id === key)
        
        if (isOccupationQuestion || (!skipGeneral && isGeneralQuestion)) {
          if (value instanceof File) {
            answersToSave[key] = value.name
            // Find the question to get the document type
            const question = allQuestions.find(q => q.id === key)
            if (question) {
            const questionLower = question.question.toLowerCase()
            const docType = questionLower.includes("resume") ? "Resume"
              : questionLower.includes("license") ? "License"
              : question.question
              // Already marked in handleFileUpload, but ensure it's persisted
              markDocumentUploaded(docType, { name: value.name, source: "questionnaire" })
            }
          } else {
            answersToSave[key] = value as string | string[]
          }
        }
      })

      // Save to local DB
      saveOnboardingDetails({
        questionnaireAnswers: answersToSave,
      })

      pushToast({ 
        title: "Success", 
        description: skipGeneral ? "Occupation questionnaire saved successfully." : "Questionnaire saved successfully.",
        type: "success" 
      })

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/candidate/dashboard")
      }, 1000)
    } catch (error) {
      console.error("Failed to save questionnaire:", error)
      pushToast({ 
        title: "Error", 
        description: "Failed to save questionnaire. Please try again.",
        type: "error" 
      })
    } finally {
      setSaving(false)
    }
  }

  const renderQuestion = (question: Question, section: "occupation" | "general") => {
    const questionId = question.id
    const answer = answers[questionId]
    const error = errors[questionId]
    const isUploading = uploadingFiles[questionId]

    return (
      <div key={questionId} className="space-y-2" data-question-id={questionId}>
        <label className="text-sm font-semibold text-foreground">
          {question.question}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </label>

        {question.type === "text" && (
          <Input
            value={(answer as string) || ""}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder={question.placeholder || "Enter your answer"}
            className={cn(error && "border-destructive")}
          />
        )}

        {question.type === "textarea" && (
          <Textarea
            value={(answer as string) || ""}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder={question.placeholder || "Enter your answer"}
            rows={4}
            className={cn(error && "border-destructive")}
          />
        )}

        {question.type === "select" && (
          <div className="space-y-1">
            <select
              value={(answer as string) || ""}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              className={cn(
                "w-full rounded-md border border-border bg-input px-3 py-2 text-sm",
                error && "border-destructive"
              )}
            >
              <option value="">Select an option</option>
              {question.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {question.type === "checkbox" && (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const optionId = `${questionId}-${option}`
              const isChecked = Array.isArray(answer) && answer.includes(option)
              return (
                <div key={optionId} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={optionId}
                    checked={isChecked}
                    onChange={(e) => {
                      const currentAnswers = (answer as string[]) || []
                      if (e.target.checked) {
                        handleAnswerChange(questionId, [...currentAnswers, option])
                      } else {
                        handleAnswerChange(questionId, currentAnswers.filter((a) => a !== option))
                      }
                    }}
                    className={cn("rounded border-border", error && "border-destructive")}
                  />
                  <label htmlFor={optionId} className="text-sm text-foreground">
                    {option}
                  </label>
                </div>
              )
            })}
          </div>
        )}

        {question.type === "radiobox" && (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const optionId = `${questionId}-${option}`
              const isChecked = answer === option
              return (
                <div key={optionId} className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={optionId}
                    name={questionId}
                    checked={isChecked}
                    onChange={() => handleAnswerChange(questionId, option)}
                    className={cn("border-border", error && "border-destructive")}
                  />
                  <label htmlFor={optionId} className="text-sm text-foreground">
                    {option}
                  </label>
                </div>
              )
            })}
          </div>
        )}

        {question.type === "date" && (
          <div className="space-y-1">
            <Input
              type="date"
              value={(answer as string) || ""}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              max={question.id === "q-date-of-birth" ? "2007-12-31" : undefined}
              className={cn(error && "border-destructive")}
            />
            {question.id === "q-date-of-birth" && (
              <p className="text-xs text-muted-foreground">Date of birth must be in 2007 or earlier</p>
            )}
          </div>
        )}

        {question.type === "number" && (
          <Input
            type="number"
            value={(answer as string) || ""}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder={question.placeholder || "Enter a number"}
            className={cn(error && "border-destructive")}
          />
        )}

        {question.type === "file" && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <label
                htmlFor={`file-${questionId}`}
                className={cn(
                  "ph5-button-secondary cursor-pointer",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : (answer instanceof File || (typeof answer === "string" && answer)) ? "Change File" : "Upload File"}
              </label>
              <input
                id={`file-${questionId}`}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  handleFileUpload(questionId, file, question.question)
                }}
                disabled={isUploading}
              />
              {(answer instanceof File || (typeof answer === "string" && answer)) && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Uploaded</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{answer instanceof File ? answer.name : answer}</span>
                  </div>
                </div>
              )}
            </div>
            {question.placeholder && (
              <p className="text-xs text-muted-foreground">{question.placeholder}</p>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>
    )
  }

  const hasQuestions = 
    (occupationQuestionnaire && occupationQuestionnaire.questions.length > 0) ||
    (generalQuestionnaire && generalQuestionnaire.questions.length > 0)

  if (!hasQuestions) {
    return (
      <div className="space-y-6 p-8">
        <Header
          title="Questionnaire"
          subtitle="Complete the questionnaire to continue"
          breadcrumbs={[
            { label: "Candidate", href: "/candidate/dashboard" },
            { label: "Questionnaire" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No questionnaire available at this time.</p>
            <Button onClick={() => router.push("/candidate/dashboard")} className="ph5-button-primary">
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const hasOccupationQuestions = occupationQuestionnaire && occupationQuestionnaire.questions.length > 0
  const hasGeneralQuestions = generalQuestionnaire && generalQuestionnaire.questions.length > 0

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Complete Your Profile"
        subtitle={currentStep === 1 ? "Step 1: Answer occupation-specific questions" : "Step 2: Answer general questions (optional)"}
        breadcrumbs={[
          { label: "Candidate", href: "/candidate/dashboard" },
          { label: "Questionnaire" },
        ]}
      />

      {/* Step indicator */}
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex items-center gap-2",
          currentStep >= 1 ? "text-primary" : "text-muted-foreground"
        )}>
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2",
            currentStep >= 1 ? "border-primary bg-primary text-white" : "border-muted-foreground"
          )}>
            1
          </div>
          <span className="text-sm font-medium">Occupation Questions</span>
        </div>
        <div className="h-px flex-1 bg-border" />
        <div className={cn(
          "flex items-center gap-2",
          currentStep >= 2 ? "text-primary" : "text-muted-foreground"
        )}>
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2",
            currentStep >= 2 ? "border-primary bg-primary text-white" : "border-muted-foreground"
          )}>
            2
          </div>
          <span className="text-sm font-medium">General Questions</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Occupation Questionnaire */}
        {currentStep === 1 && hasOccupationQuestions && (
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Occupation-Specific Questions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Questions specific to your selected occupation.
                </p>
              </div>
              <div className="space-y-6">
                {occupationQuestionnaire.questions.map((question) => renderQuestion(question, "occupation"))}
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: General Questionnaire */}
        {currentStep === 2 && hasGeneralQuestions && (
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">General Questions</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  General questions for all candidates (e.g., resume upload, date of birth, certifications). These questions are optional.
                </p>
              </div>
              <div className="space-y-6">
                {generalQuestionnaire.questions.map((question) => renderQuestion(question, "general"))}
              </div>
            </div>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4">
          {currentStep === 1 ? (
            <div className="flex-1" />
          ) : (
            <Button 
              onClick={() => setCurrentStep(1)} 
              className="ph5-button-secondary"
              disabled={saving}
            >
              Back
            </Button>
          )}
          <div className="flex items-center gap-3">
            {currentStep === 2 && (
              <Button 
                onClick={handleSkip} 
                className="ph5-button-secondary"
                disabled={saving}
              >
                Skip General Questions
              </Button>
            )}
            {currentStep === 1 ? (
              <Button 
                onClick={handleNext} 
                className="ph5-button-primary"
                disabled={saving || !hasOccupationQuestions}
              >
                Next: General Questions
              </Button>
            ) : (
              <Button 
                onClick={() => handleSubmit(false)} 
                className="ph5-button-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save & Continue"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
