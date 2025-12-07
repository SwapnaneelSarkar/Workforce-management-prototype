"use client"

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import {
  getTaggingRuleById,
  updateTaggingRule,
  getGeneralQuestionnaire,
  getActiveOccupations,
  getQuestionnaireByOccupationId,
  type Occupation,
} from "@/lib/admin-local-db"

type QuestionOption = {
  id: string
  question: string
  source: string
}

export default function EditTaggingRulePage() {
  const params = useParams()
  const router = useRouter()
  const { pushToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rule, setRule] = useState<ReturnType<typeof getTaggingRuleById>>(null)
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

  useEffect(() => {
    const ruleId = params.id as string
    const existingRule = getTaggingRuleById(ruleId)
    if (existingRule) {
      setRule(existingRule)
      // Find matching question ID or use the question text
      loadQuestions().then(() => {
        const matchingQuestion = availableQuestions.find((q) => q.question === existingRule.triggerQuestion)
        setFormData({
          ruleName: existingRule.ruleName,
          triggerQuestion: matchingQuestion?.id || existingRule.triggerQuestion,
          condition: existingRule.condition,
          triggerValue: existingRule.triggerValue || "",
          tagToApply: existingRule.tagToApply,
          isActive: existingRule.isActive,
        })
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [params.id])

  const loadQuestions = async () => {
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
    
    if (typeof window !== "undefined") {
      try {
        const occs = getActiveOccupations()
        setOccupations(occs)
      } catch (error) {
        console.warn("Failed to load occupations", error)
      }
    }
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

    if (!rule) return

    setIsSubmitting(true)

    try {
      const selectedQuestion = availableQuestions.find((q) => q.id === formData.triggerQuestion)
      const questionText = selectedQuestion ? selectedQuestion.question : formData.triggerQuestion

      const updated = updateTaggingRule(rule.id, {
        ruleName: formData.ruleName.trim(),
        triggerQuestion: questionText,
        condition: formData.condition,
        triggerValue: (formData.condition === "equals" || formData.condition === "contains")
          ? formData.triggerValue.trim()
          : undefined,
        tagToApply: formData.tagToApply.trim(),
        isActive: formData.isActive,
      })

      if (updated) {
        pushToast({ title: "Success", description: `Tagging rule "${updated.ruleName}" has been updated successfully.` })
        router.push("/admin/workforce/tagging-rules")
      } else {
        pushToast({ title: "Error", description: "Failed to update tagging rule. Please try again." })
      }
    } catch (error) {
      pushToast({ title: "Error", description: "Failed to update tagging rule. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!rule) {
    return (
      <div className="space-y-6 p-8">
        <p className="text-muted-foreground">Tagging rule not found.</p>
        <Link href="/admin/workforce/tagging-rules" className="ph5-button-secondary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tagging Rules
        </Link>
      </div>
    )
  }

  return (
    <>
      <Header
        title="Edit Tagging Rule"
        subtitle="Update the tagging rule configuration"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Workforce", href: "/admin/workforce-groups" },
          { label: "Tagging Rules", href: "/admin/workforce/tagging-rules" },
          { label: "Edit Rule" },
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
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="tagToApply" className="text-sm font-semibold text-foreground">
                Tag to Apply <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tagToApply"
                value={formData.tagToApply}
                onChange={handleInputChange("tagToApply")}
                placeholder="e.g., ICU-Specialist, High-Experience, Certified"
                required
              />
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
                {isSubmitting ? "Updating..." : "Update Rule"}
              </button>
            </div>
          </form>
        </Card>
      </section>
    </>
  )
}




