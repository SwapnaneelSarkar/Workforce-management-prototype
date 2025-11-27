import { Suspense } from "react"
import JobsList from "./jobs-list"

export default function JobsListPage() {
  return (
    <Suspense fallback={<JobsListFallback />}>
      <JobsList />
    </Suspense>
  )
}

function JobsListFallback() {
  return (
    <div className="space-y-4 p-8">
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
      <div className="space-y-2 rounded-xl border border-dashed border-border p-6">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-5 w-56 animate-pulse rounded bg-muted" />
        <div className="h-5 w-72 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
