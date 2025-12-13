"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Plus, Edit, Trash2, Eye, Download } from "lucide-react"
import {
  getAllComplianceListItems,
  getComplianceListItemsByCategory,
  deleteComplianceListItem,
  type ComplianceListItem,
} from "@/lib/admin-local-db"

const CATEGORIES: ComplianceListItem["category"][] = [
  "Background & Identification",
  "License",
  "Certification",
  "Training",
  "Other",
]

export default function ComplianceListItemsPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const [items, setItems] = useState<ComplianceListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = () => {
    setLoading(true)
    const allItems = getAllComplianceListItems()
    setItems(allItems)
    setLoading(false)
  }

  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, ComplianceListItem[]> = {}
    CATEGORIES.forEach((category) => {
      grouped[category] = items.filter((item) => item.category === category)
    })
    return grouped
  }, [items])

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = deleteComplianceListItem(id)
      if (success) {
        pushToast({ title: "Success", description: "Compliance list item deleted successfully." })
        loadItems()
      } else {
        pushToast({ title: "Error", description: "Failed to delete compliance list item." })
      }
    }
  }

  const totalItems = items.length

  return (
    <>
      <Header
        title="List Items"
        subtitle="Manage compliance list items to be used for wallet and requisition templates."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Compliance List Items" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Compliance List Items</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  TOTAL ITEMS <span className="font-bold">{totalItems}</span>
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {CATEGORIES.map((category) => {
                  const categoryItems = itemsByCategory[category] || []
                  if (categoryItems.length === 0) return null

                  return (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground">{category}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="p-2 rounded-md hover:bg-muted transition-colors"
                            title="Export"
                          >
                            <Download className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <Link
                            href={`/admin/compliance/list-items/add?category=${encodeURIComponent(category)}`}
                            className="ph5-button-primary text-sm"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add New Item
                          </Link>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Compliance Item</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Expiration Type</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Display To Candidate (Y/N)</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categoryItems.map((item) => (
                              <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-4">
                                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-foreground">{item.expirationType}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-foreground">{item.displayToCandidate ? "Yes" : ""}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                      item.isActive
                                        ? "bg-success/10 text-success"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {item.isActive ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-end gap-2">
                                    <Link
                                      href={`/admin/compliance/list-items/${item.id}`}
                                      className="p-2 rounded-md hover:bg-muted transition-colors"
                                      title="View"
                                    >
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                    <Link
                                      href={`/admin/compliance/list-items/${item.id}/edit`}
                                      className="p-2 rounded-md hover:bg-muted transition-colors"
                                      title="Edit"
                                    >
                                      <Edit className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                    <button
                                      type="button"
                                      className="p-2 rounded-md hover:bg-destructive/10 transition-colors"
                                      onClick={() => handleDelete(item.id, item.name)}
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
                    </div>
                  )
                })}

                {totalItems === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No compliance list items yet. Create one to get started.</p>
                    <Link href="/admin/compliance/list-items/add" className="mt-4 inline-block ph5-button-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Item
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </section>
    </>
  )
}






