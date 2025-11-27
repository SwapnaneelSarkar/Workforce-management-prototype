
import { Suspense } from "react"
import ApplicationsList from "./applications-list"

export default function ApplicationsListPage() {
  return (
    <Suspense fallback={<ApplicationsListFallback />}>
      <ApplicationsList />
    </Suspense>
  )
}

function ApplicationsListFallback() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="space-y-3 rounded-2xl border border-dashed border-border p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

