"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { ArrowLeft } from "lucide-react"
import {
  getComplianceListItemById,
  type ComplianceListItem,
} from "@/lib/admin-local-db"

export default function ViewComplianceListItemPage() {
  const params = useParams()
  const [item, setItem] = useState<ComplianceListItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const itemId = params.id as string
    const existingItem = getComplianceListItemById(itemId)
    setItem(existingItem)
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <>
        <Header
          title="Loading..."
          subtitle=""
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Compliance List Items", href: "/admin/compliance/list-items" },
            { label: "View" },
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

  if (!item) {
    return (
      <>
        <Header
          title="Compliance List Item Not Found"
          subtitle=""
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Compliance List Items", href: "/admin/compliance/list-items" },
            { label: "Not Found" },
          ]}
        />
        <Card>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Compliance list item not found.</p>
            <Link href="/admin/compliance/list-items" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              Back to List Items
            </Link>
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      <Header
        title={item.name}
        subtitle="View compliance list item details."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Compliance List Items", href: "/admin/compliance/list-items" },
          { label: item.name },
        ]}
      />

      <section className="space-y-6">
        <div className="flex gap-3">
          <Link href="/admin/compliance/list-items" className="ph5-button-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List Items
          </Link>
        </div>

        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Compliance List Item Details</h2>
              <p className="mt-1 text-sm text-muted-foreground">View details for this compliance item.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Compliance Item Name</p>
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Category</p>
                <p className="text-sm text-foreground">{item.category}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Expiration Type</p>
                <p className="text-sm text-foreground">{item.expirationType}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Display To Candidate</p>
                <p className="text-sm text-foreground">{item.displayToCandidate ? "Yes" : "No"}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    item.isActive
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Created</p>
                <p className="text-sm text-foreground">
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Link href={`/admin/compliance/list-items/${item.id}/edit`} className="ph5-button-primary">
                Edit Item
              </Link>
              <Link href="/admin/compliance/list-items" className="ph5-button-secondary">
                Back to List
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}









