"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command"
import { useDemoData } from "@/components/providers/demo-data-provider"

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { organization, vendor } = useDemoData()

  const { jobs, candidates } = organization
  const vendorList = vendor.vendors
  const applications = organization.applications

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", down)
    return () => window.removeEventListener("keydown", down)
  }, [])

  const candidateItems = useMemo(
    () =>
      candidates.map((candidate) => {
        const application = applications.find((app) => app.candidateId === candidate.id)
        return {
          ...candidate,
          applicationId: application?.id,
        }
      }),
    [applications, candidates],
  )

  const closeAndNavigate = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-[0_2px_8px_rgba(16,24,40,0.08)] transition-all duration-200 hover:border-primary hover:shadow-[0_4px_12px_rgba(49,130,206,0.15)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setOpen(true)}
        aria-label="Open global search"
      >
        <Search className="h-4 w-4" aria-hidden />
        Search
        <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Global search" description="Jump to jobs, candidates, or vendors.">
        <CommandInput placeholder="Search jobs, candidates, vendors…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Jobs">
            {jobs.map((job) => (
              <CommandItem key={`job-${job.id}`} value={`job ${job.title} ${job.location}`} onSelect={() => closeAndNavigate("/organization/jobs")}>
                <span className="font-semibold text-foreground">{job.title}</span>
                <CommandShortcut>{job.location}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Candidates">
            {candidateItems.map((candidate) => (
              <CommandItem
                key={`candidate-${candidate.id}`}
                value={`candidate ${candidate.name} ${candidate.role}`}
                onSelect={() => closeAndNavigate(candidate.applicationId ? `/organization/applications/${candidate.applicationId}` : "/organization/applications")}
              >
                <span className="font-semibold text-foreground">{candidate.name}</span>
                <CommandShortcut>{candidate.role}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Vendors">
            {vendorList.map((item) => (
              <CommandItem key={`vendor-${item.id}`} value={`vendor ${item.name}`} onSelect={() => closeAndNavigate(`/vendor/vendors/${item.id}`)}>
                <span className="font-semibold text-foreground">{item.name}</span>
                <CommandShortcut>{item.tier}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

