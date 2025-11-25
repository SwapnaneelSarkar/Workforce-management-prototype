"use client"

import { useEffect, useMemo, useState } from "react"
import { Heart, Search } from "lucide-react"
import { Card, Header, SkeletonLoader, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useToast } from "@/components/system"

export default function CandidateFavoritesPage() {
  const { candidate, organization, actions } = useDemoData()
  const { pushToast } = useToast()
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 380)
    return () => clearTimeout(timer)
  }, [])

  const filteredJobs = useMemo(() => {
    const normalized = query.toLowerCase()
    return organization.jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(normalized) ||
        job.location.toLowerCase().includes(normalized) ||
        job.tags.some((tag) => tag.toLowerCase().includes(normalized)),
    )
  }, [organization.jobs, query])

  const toggleFavorite = (jobId: string, isFavorite: boolean) => {
    actions.toggleFavorite(jobId)
    pushToast({
      title: isFavorite ? "Removed from favorites" : "Saved to favorites",
      type: isFavorite ? "info" : "success",
    })
  }

  const savedCount = candidate.favorites.length

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Saved Jobs"
        subtitle="Bookmark interesting roles and revisit them when you're ready to apply."
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Favorites" },
        ]}
        actions={[
          {
            id: "view-saved",
            label: `${savedCount} saved`,
            variant: "secondary",
          },
        ]}
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <StatusChip label={`${savedCount} favorites`} tone="info" />
          <p>Use favorites to plan your applications and stay organized.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search saved jobs"
            className="w-full rounded-full border border-border bg-input py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Search favorite jobs"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonLoader lines={10} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredJobs.map((job) => {
            const isFavorite = candidate.favorites.includes(job.id)
            return (
              <Card
                key={job.id}
                title={job.title}
                subtitle={`${job.location} • ${job.department}`}
                actions={
                  <button
                    onClick={() => toggleFavorite(job.id, isFavorite)}
                    aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition ${
                      isFavorite ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} aria-hidden />
                    {isFavorite ? "Saved" : "Save"}
                  </button>
                }
              >
                <div className="space-y-3 text-sm text-foreground">
                  <p>{job.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{job.shift} • {job.hours}</span>
                    <span>{job.billRate}</span>
                  </div>
                </div>
              </Card>
            )
          })}
          {!filteredJobs.length ? (
            <Card title="No favorites found" subtitle="Try adjusting your search keywords.">
              <p className="text-sm text-muted-foreground">Saved jobs that match your filters will appear here.</p>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  )
}

