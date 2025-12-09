"use client"

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import {
  addTaggingRule,
  getGeneralQuestionnaire,
  getActiveOccupations,
  getQuestionnaireByOccupationId,
  getActiveTags,
  type Occupation,
} from "@/lib/admin-local-db"

type QuestionOption = {
  id: string
  question: string
  source: string // "general" or occupation name
}

export default function AddTaggingRulePage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    ruleName: "",
    triggerQuestion: "",
    condition: "equals" as "equals" | "contains" | "is blank" | "is not blank",
    triggerValue: "",
    tagToApply: "",
    isActive: true,
  })
  const [availableQuestions, setAvailableQuestions] = useState<QuestionOption[]>([])
  const [occupations, setOccupations] = useState<Occupation[]>([])
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; taskType: string }>>([])

  useEffect(() => {
    loadQuestions()
    if (typeof window !== "undefined") {
      try {
        const occs = getActiveOccupations()
        setOccupations(occs)
        const tags = getActiveTags()
        setAvailableTags(tags.map((tag) => ({ id: tag.id, name: tag.name, taskType: tag.taskType })))
      } catch (error) {
        console.warn("Failed to load data", error)
      }
    }
  }, [])

  const loadQuestions = () => {
    const questions: QuestionOption[] = []
    
    // Add general questionnaire questions
    const generalQuestionnaire = getGeneralQuestionnaire()
    if (generalQuestionnaire) {
      generalQuestionnaire.questions.forEach((q) => {
        questions.push({
          id: `general-${q.id}`,
          question: q.question,
          source: "General Questionnaire",
        })
      })
    }
    
    // Add occupation-specific questions
    const allOccupations = getActiveOccupations()
    allOccupations.forEach((occ) => {
      const occQuestionnaire = getQuestionnaireByOccupationId(occ.id)
      if (occQuestionnaire && occQuestionnaire.isActive) {
        occQuestionnaire.questions.forEach((q) => {
          questions.push({
            id: `occ-${occ.id}-${q.id}`,
            question: q.question,
            source: `${occ.name} (${occ.code})`,
          })
        })
      }
    })
    
    setAvailableQuestions(questions)
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const value = field === "isActive"
      ? (e.target as HTMLInputElement).checked
      : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.ruleName.trim()) {
      pushToast({ title: "Validation Error", description: "Rule name is required." })
      return
    }

    if (!formData.triggerQuestion) {
      pushToast({ title: "Validation Error", description: "Trigger question is required." })
      return
    }

    if (!formData.tagToApply.trim()) {
      pushToast({ title: "Validation Error", description: "Tag to apply is required." })
      return
    }

    if ((formData.condition === "equals" || formData.condition === "contains") && !formData.triggerValue.trim()) {
      pushToast({ title: "Validation Error", description: "Trigger value is required for this condition." })
      return
    }

    setIsSubmitting(true)

    try {
      const selectedQuestion = availableQuestions.find((q) => q.id === formData.triggerQuestion)
      const questionText = selectedQuestion ? selectedQuestion.question : formData.triggerQuestion

      // Find the tag ID if the tag name matches an existing tag
      const selectedTag = availableTags.find((tag) => tag.name === formData.tagToApply.trim())
      
      const newRule = addTaggingRule({
        ruleName: formData.ruleName.trim(),
        triggerQuestion: questionText,
        condition: formData.condition,
        triggerValue: (formData.condition === "equals" || formData.condition === "contains")
          ? formData.triggerValue.trim()
          : undefined,
        tagToApply: formData.tagToApply.trim(),
        tagId: selectedTag?.id,
        isActive: formData.isActive,
      })

      pushToast({ title: "Success", description: `Tagging rule "${newRule.ruleName}" has been added successfully.` })
      router.push("/admin/workforce/tagging-rules")
    } catch (error) {
      pushToast({ title: "Error", description: "Failed to add tagging rule. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header
        title="Add Tagging Rule"
        subtitle="Create a new rule to automatically tag users based on questionnaire responses"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Workforce", href: "/admin/workforce-groups" },
          { label: "Tagging Rules", href: "/admin/workforce/tagging-rules" },
          { label: "Add Rule" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ruleName" className="text-sm font-semibold text-foreground">
                Rule Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ruleName"
                value={formData.ruleName}
                onChange={handleInputChange("ruleName")}
                placeholder="e.g., Tag ICU Nurses"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="triggerQuestion" className="text-sm font-semibold text-foreground">
                Trigger Question <span className="text-destructive">*</span>
              </Label>
              <select
                id="triggerQuestion"
                value={formData.triggerQuestion}
                onChange={handleInputChange("triggerQuestion")}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a question</option>
                {availableQuestions.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.question} ({q.source})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Select a question from general or occupation-specific questionnaires
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition" className="text-sm font-semibold text-foreground">
                Condition <span className="text-destructive">*</span>
              </Label>
              <select
                id="condition"
                value={formData.condition}
                onChange={handleInputChange("condition")}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="is blank">Is Blank</option>
                <option value="is not blank">Is Not Blank</option>
              </select>
            </div>

            {(formData.condition === "equals" || formData.condition === "contains") && (
              <div className="space-y-2">
                <Label htmlFor="triggerValue" className="text-sm font-semibold text-foreground">
                  Trigger Value <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="triggerValue"
                  value={formData.triggerValue}
                  onChange={handleInputChange("triggerValue")}
                  placeholder="e.g., ICU, Yes, 5 years"
                  required={formData.condition === "equals" || formData.condition === "contains"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The value that must match the answer for the rule to trigger
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tagToApply" className="text-sm font-semibold text-foreground">
                Tag to Apply <span className="text-destructive">*</span>
              </Label>
              <select
                id="tagToApply"
                value={formData.tagToApply}
                onChange={handleInputChange("tagToApply")}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a tag</option>
                {availableTags.map((tag) => (
                  <option key={tag.id} value={tag.name}>
                    {tag.name} ({tag.taskType})
                  </option>
                ))}
              </select>
              {formData.tagToApply && !availableTags.some((t) => t.name === formData.tagToApply) && (
                <Input
                  value={formData.tagToApply}
                  onChange={handleInputChange("tagToApply")}
                  placeholder="Or enter a custom tag name"
                  className="mt-2"
                />
              )}
              <p className="text-xs text-muted-foreground mt-1">
                This tag will be applied to the user profile (not visible to candidates)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange("isActive")}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="isActive" className="text-sm font-semibold text-foreground cursor-pointer">
                Active
              </Label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link href="/admin/workforce/tagging-rules" className="ph5-button-secondary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Link>
              <button type="submit" className="ph5-button-primary" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Rule"}
              </button>
            </div>
          </form>
        </Card>
      </section>
    </>
  )
}




