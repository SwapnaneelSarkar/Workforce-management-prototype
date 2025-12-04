"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Plus, Edit, Trash2 } from "lucide-react"
import {
  getAllWorkforceGroups,
  deleteWorkforceGroup,
  type WorkforceGroup,
} from "@/lib/admin-local-db"

export default function WorkforceGroupsPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [groups, setGroups] = useState<WorkforceGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = () => {
    setLoading(true)
    const allGroups = getAllWorkforceGroups()
    setGroups(allGroups)
    setLoading(false)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = deleteWorkforceGroup(id)
      if (success) {
        pushToast({ title: "Success", description: "Workforce group deleted successfully." })
        loadGroups()
      } else {
        pushToast({ title: "Error", description: "Failed to delete workforce group." })
      }
    }
  }

  return (
    <>
      <Header
        title="Workforce Groups"
        subtitle="Manage workforce group for order of shift distribution"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Workforce Groups" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Workforce Groups</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {loading ? "Loading..." : `${groups.length} ${groups.length === 1 ? "group" : "groups"}`}
                </p>
              </div>
              <Link href="/admin/workforce-groups/add" className="ph5-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Workforce Group
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No workforce groups yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Modality</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Limit Shift Visibility</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Routing Position</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group) => (
                      <tr key={group.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">{group.modality}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-foreground">{group.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">{group.limitShiftVisibility ? "Yes" : "No"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">{group.routingPosition}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              group.isActive
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {group.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/workforce-groups/${group.id}/edit`}
                              className="p-2 rounded-md hover:bg-muted transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            <button
                              type="button"
                              className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                              onClick={() => handleDelete(group.id, group.name)}
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
