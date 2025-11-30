"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command"
import { useDemoData } from "@/components/providers/demo-data-provider"

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { organization, vendor, allJobs } = useDemoData()

  // Use allJobs for candidate portal, organization.jobs for org portal
  const jobs = pathname?.startsWith("/candidate") ? allJobs : organization.jobs
  const { candidates } = organization
  const vendorList = vendor.vendors
  const applications = organization.applications

  // Detect current portal context
  const isCandidatePortal = pathname?.startsWith("/candidate")
  const isVendorPortal = pathname?.startsWith("/vendor")
  const isOrganizationPortal = pathname?.startsWith("/organization")

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

  // Get navigation path based on portal context
  const getJobPath = (jobId: string) => {
    if (isCandidatePortal) {
      return `/candidate/jobs/${jobId}`
    }
    return "/organization/jobs"
  }

  const getCandidatePath = (applicationId?: string) => {
    if (isCandidatePortal) {
      return "/candidate/applications"
    }
    if (applicationId) {
      return `/organization/applications/${applicationId}`
    }
    return "/organization/applications"
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
      <CommandDialog open={open} onOpenChange={setOpen} title="Global search" description={isCandidatePortal ? "Search for jobs and applications." : "Jump to jobs, candidates, or vendors."}>
        <CommandInput placeholder={isCandidatePortal ? "Search jobs…" : "Search jobs, candidates, vendors…"} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Jobs">
            {jobs.map((job) => (
              <CommandItem key={`job-${job.id}`} value={`job ${job.title} ${job.location}`} onSelect={() => closeAndNavigate(getJobPath(job.id))}>
                <span className="font-semibold text-foreground">{job.title}</span>
                <CommandShortcut>{job.location}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          {!isCandidatePortal && (
            <CommandGroup heading="Candidates">
              {candidateItems.map((candidate) => (
                <CommandItem
                  key={`candidate-${candidate.id}`}
                  value={`candidate ${candidate.name} ${candidate.role}`}
                  onSelect={() => closeAndNavigate(getCandidatePath(candidate.applicationId))}
                >
                  <span className="font-semibold text-foreground">{candidate.name}</span>
                  <CommandShortcut>{candidate.role}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {!isCandidatePortal && (
            <CommandGroup heading="Vendors">
              {vendorList.map((item) => (
                <CommandItem key={`vendor-${item.id}`} value={`vendor ${item.name}`} onSelect={() => closeAndNavigate(`/vendor/vendors/${item.id}`)}>
                  <span className="font-semibold text-foreground">{item.name}</span>
                  <CommandShortcut>{item.tier}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}

