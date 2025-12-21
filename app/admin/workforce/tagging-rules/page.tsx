"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Plus, Edit, Trash2 } from "lucide-react"
import {
  getAllTaggingRules,
  deleteTaggingRule,
  type TaggingRule,
} from "@/lib/admin-local-db"

export default function TaggingRulesPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [rules, setRules] = useState<TaggingRule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = () => {
    setLoading(true)
    const allRules = getAllTaggingRules()
    setRules(allRules)
    setLoading(false)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = deleteTaggingRule(id)
      if (success) {
        pushToast({ title: "Success", description: "Tagging rule deleted successfully." })
        loadRules()
      } else {
        pushToast({ title: "Error", description: "Failed to delete tagging rule." })
      }
    }
  }

  return (
    <>
      <Header
        title="Tagging Rules"
        subtitle="Manage rules to automatically tag users based on questionnaire responses"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Workforce", href: "/admin/workforce-groups" },
          { label: "Tagging Rules" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Tagging Rules</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {loading ? "Loading..." : `${rules.length} ${rules.length === 1 ? "rule" : "rules"}`}
                </p>
              </div>
              <Link href="/admin/workforce/tagging-rules/add" className="ph5-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Tagging Rule
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : rules.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No tagging rules yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Rule Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Trigger Question</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Condition</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Trigger Value</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Tag to Apply</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-foreground">{rule.ruleName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">{rule.triggerQuestion}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">{rule.condition}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-muted-foreground">{rule.triggerValue || "—"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">{rule.tagToApply}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              rule.isActive
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {rule.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/workforce/tagging-rules/${rule.id}/edit`}
                              className="p-2 rounded-md hover:bg-muted transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            <button
                              type="button"
                              className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                              onClick={() => handleDelete(rule.id, rule.ruleName)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </section>
    </>
  )
}








