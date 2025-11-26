"use client"

import Link from "next/link"
import { Header, Card } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"

export default function OrganizationDashboardPage() {
  const { organization } = useDemoData()

  const totalJobs = organization.jobs.length
  const totalDraftJobs = organization.jobs.filter((job) => job.status === "Draft").length
  const totalPublishedJobs = organization.jobs.filter((job) => job.status !== "Draft").length
  const totalApplications = organization.applications.length

  return (
    <>
      <Header
        title="Organization dashboard"
        subtitle="Create jobs, review existing openings, and monitor basic volume."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Dashboard" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <div className="flex flex-wrap gap-3">
            <Link href="/organization/jobs/create" className="ph5-button-primary">
              Create job
            </Link>
            <Link href="/organization/jobs" className="ph5-button-secondary">
              View jobs
            </Link>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="ph5-label mb-2">Total jobs</p>
            <p className="text-3xl font-semibold text-foreground">{totalJobs}</p>
          </Card>
          <Card>
            <p className="ph5-label mb-2">Total draft jobs</p>
            <p className="text-3xl font-semibold text-foreground">{totalDraftJobs}</p>
          </Card>
          <Card>
            <p className="ph5-label mb-2">Total published jobs</p>
            <p className="text-3xl font-semibold text-foreground">{totalPublishedJobs}</p>
          </Card>
          <Card>
            <p className="ph5-label mb-2">Total applications</p>
            <p className="text-3xl font-semibold text-foreground">{totalApplications}</p>
          </Card>
        </div>
      </section>
    </>
  )
}

