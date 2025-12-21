"use client"

import { useEffect, useState } from "react"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save } from "lucide-react"
import {
  getCurrentOrganization,
  getQuestionnaireByOrganization,
  addOrUpdateQuestionnaire,
  type OrganizationQuestionnaireQuestion,
} from "@/lib/organization-local-db"

// Required questions that are read-only
const REQUIRED_QUESTIONS: OrganizationQuestionnaireQuestion[] = [
  {
    id: "req-1",
    question: "Are you eligible to work in the United States?",
    type: "yesno",
    required: true,
    isReadOnly: true,
  },
  {
    id: "req-2",
    question: "Have you ever been convicted of a felony?",
    type: "yesno",
    required: true,
    isReadOnly: true,
  },
  {
    id: "req-3",
    question: "Do you have a valid professional license?",
    type: "yesno",
    required: true,
    isReadOnly: true,
  },
]

export default function OrganizationQuestionnairePage() {
  const { pushToast } = useToast()
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [customQuestions, setCustomQuestions] = useState<OrganizationQuestionnaireQuestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orgId = getCurrentOrganization()
      setCurrentOrgId(orgId)
      loadQuestionnaire(orgId)
    }
  }, [])

  const loadQuestionnaire = (organizationId: string | null) => {
    if (!organizationId) {
      setLoading(false)
      return
    }

    const questionnaire = getQuestionnaireByOrganization(organizationId)
    if (questionnaire) {
      setCustomQuestions(questionnaire.customQuestions)
    } else {
      setCustomQuestions([])
    }
    setLoading(false)
  }

  const addQuestion = () => {
    const newQuestion: OrganizationQuestionnaireQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: "",
      type: "text",
      required: false,
    }
    setCustomQuestions([...customQuestions, newQuestion])
  }

  const updateQuestion = (questionId: string, updates: Partial<OrganizationQuestionnaireQuestion>) => {
    setCustomQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    )
  }

  const removeQuestion = (questionId: string) => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }

  const handleSave = () => {
    if (!currentOrgId) {
      pushToast({
        title: "Error",
        description: "No organization selected.",
        type: "error",
      })
      return
    }

    // Validate questions
    const invalidQuestions = customQuestions.filter((q) => !q.question.trim())
    if (invalidQuestions.length > 0) {
      pushToast({
        title: "Validation Error",
        description: "Please fill in all question texts.",
        type: "error",
      })
      return
    }

    try {
      addOrUpdateQuestionnaire(currentOrgId, {
        customQuestions: customQuestions.map((q) => ({
          ...q,
          question: q.question.trim(),
        })),
      })

      pushToast({
        title: "Success",
        description: "Questionnaire saved successfully.",
        type: "success",
      })
    } catch (error) {
      pushToast({
        title: "Error",
        description: "Failed to save questionnaire.",
        type: "error",
      })
    }
  }

  if (loading) {
    return (
      <>
        <Header
          title="General Questionnaire"
          subtitle="Configure questions for all applicants"
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Compliance", href: "/organization/compliance" },
            { label: "Questionnaire" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Card>
      </>
    )
  }

  const allQuestions = [...REQUIRED_QUESTIONS, ...customQuestions]

  return (
    <>
      <Header
        title="General Questionnaire"
        subtitle="Configure questions for all applicants"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance", href: "/organization/compliance" },
          { label: "Questionnaire" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Required Questions</h2>
              <p className="text-sm text-muted-foreground mb-4">
                These questions are required for all applicants and cannot be modified.
              </p>
            </div>

            <div className="space-y-4">
              {REQUIRED_QUESTIONS.map((question, index) => (
                <div
                  key={question.id}
                  className="p-4 border border-border rounded-lg bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {index + 1}. {question.question}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                          Read-only
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground capitalize">
                          {question.type === "yesno" ? "Yes/No" : question.type}
                        </span>
                        {question.required && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">Custom Questions</h2>
                  <p className="text-sm text-muted-foreground">
                    Add custom questions specific to your organization.
                  </p>
                </div>
                <Button onClick={addQuestion} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {customQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {REQUIRED_QUESTIONS.length + index + 1}.
                          </span>
                          <Input
                            value={question.question}
                            onChange={(e) =>
                              updateQuestion(question.id, { question: e.target.value })
                            }
                            placeholder="Enter your question"
                            className="flex-1"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Select
                            value={question.type}
                            onValueChange={(value: "text" | "yesno") =>
                              updateQuestion(question.id, { type: value })
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="yesno">Yes/No</SelectItem>
                            </SelectContent>
                          </Select>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) =>
                                updateQuestion(question.id, { required: e.target.checked })
                              }
                              className="rounded border-border"
                            />
                            <span className="text-sm text-foreground">Required</span>
                          </label>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {customQuestions.length === 0 && (
                  <div className="py-8 text-center border-2 border-dashed border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                      No custom questions yet. Add your first question to get started.
                    </p>
                    <Button onClick={addQuestion} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSave} className="ph5-button-primary">
                <Save className="h-4 w-4 mr-2" />
                Save Questionnaire
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}

