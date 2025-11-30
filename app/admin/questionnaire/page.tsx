"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import {
  getGeneralQuestionnaire,
  addOrUpdateGeneralQuestionnaire,
  deleteGeneralQuestionnaire,
  type GeneralQuestionnaire,
} from "@/lib/admin-local-db"

type Question = GeneralQuestionnaire["questions"][0]

export default function GeneralQuestionnairePage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [questionnaire, setQuestionnaire] = useState<GeneralQuestionnaire | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const existingQuestionnaire = getGeneralQuestionnaire()
    if (existingQuestionnaire) {
      setQuestionnaire(existingQuestionnaire)
      setQuestions(existingQuestionnaire.questions)
    } else {
      setQuestionnaire(null)
      setQuestions([])
    }
    setLoading(false)
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      question: "",
      type: "text",
      required: false,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q)),
    )
  }

  const removeQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }

  const handleSave = () => {
    // Validate questions
    const invalidQuestions = questions.filter((q) => !q.question.trim())
    if (invalidQuestions.length > 0) {
      pushToast({
        title: "Validation Error",
        description: "Please fill in all question texts.",
      })
      return
    }

    const updatedQuestionnaire = addOrUpdateGeneralQuestionnaire({
      questions: questions.map((q) => ({
        ...q,
        question: q.question.trim(),
      })),
    })

    setQuestionnaire(updatedQuestionnaire)
    pushToast({ title: "Success", description: "General questionnaire saved successfully." })
  }

  const handleDelete = () => {
    if (!questionnaire) return
    if (confirm("Are you sure you want to delete the entire general questionnaire? This action cannot be undone.")) {
      deleteGeneralQuestionnaire()
      setQuestionnaire(null)
      setQuestions([])
      pushToast({ title: "Success", description: "General questionnaire deleted successfully." })
    }
  }

  if (loading) {
    return (
      <>
        <Header
          title="Loading..."
          subtitle=""
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "General Questionnaire" },
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

  return (
    <>
      <Header
        title="General Questionnaire"
        subtitle="Create and manage general questions shown to all candidates during onboarding (e.g., resume upload, DOB, certifications)."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "General Questionnaire" },
        ]}
      />

      <section className="space-y-6">
        <div className="flex gap-3">
          <Link href="/admin/dashboard" className="ph5-button-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">General Questionnaire Questions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add questions that will be shown to all candidates during sign-up or onboarding, regardless of their occupation.
                Examples: Upload Resume, Date of Birth, Certifications, etc.
              </p>
            </div>

            {questions.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground mb-4">No questions yet. Add your first question to get started.</p>
                <Button onClick={addQuestion} variant="default">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="border border-border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Question {index + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">
                        Question Text <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={question.question}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateQuestion(question.id, { question: e.target.value })
                        }
                        placeholder="e.g., Upload your resume"
                        required
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Question Type</label>
                        <select
                          value={question.type}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            updateQuestion(question.id, {
                              type: e.target.value as Question["type"],
                              options: e.target.value === "select" || e.target.value === "checkbox" || e.target.value === "radiobox" ? [] : undefined,
                            })
                          }
                          className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="select">Select (Dropdown)</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="radiobox">Radio Button</option>
                          <option value="date">Date</option>
                          <option value="number">Number</option>
                          <option value="file">File Upload</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Placeholder (optional)</label>
                        <Input
                          value={question.placeholder || ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateQuestion(question.id, { placeholder: e.target.value })
                          }
                          placeholder="e.g., Enter your answer"
                        />
                      </div>
                    </div>

                    {(question.type === "select" || question.type === "checkbox" || question.type === "radiobox") && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Options (one per line)</label>
                        <Textarea
                          value={question.options?.join("\n") || ""}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            updateQuestion(question.id, {
                              options: e.target.value
                                .split("\n")
                                .map((line) => line.trim())
                                .filter((line) => line.length > 0),
                            })
                          }
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          rows={4}
                        />
                        <p className="text-xs text-muted-foreground">Enter each option on a new line</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`required-${question.id}`}
                        checked={question.required}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateQuestion(question.id, { required: e.target.checked })
                        }
                        className="rounded border-border"
                      />
                      <label htmlFor={`required-${question.id}`} className="text-sm font-semibold text-foreground">
                        Required
                      </label>
                    </div>
                  </div>
                ))}

                <Button onClick={addQuestion} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-4 border-t">
              {questionnaire && (
                <Button onClick={handleDelete} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Questionnaire
                </Button>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <Button onClick={handleSave} className="ph5-button-primary">
                  Save Questionnaire
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}
