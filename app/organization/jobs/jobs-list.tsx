"use client"

import Link from "next/link"
import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useComplianceTemplatesStore } from "@/lib/compliance-templates-store"
import { Header, Card } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"

export default function JobsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sortBy = searchParams.get("sort") ?? "created"
  const { organization, actions } = useDemoData()
  const { templates } = useComplianceTemplatesStore()

  const jobs = React.useMemo(() => {
    const withCounts = organization.jobs.map((job) => ({
      ...job,
      applicationCount: organization.applications.filter((app) => app.jobId === job.id).length,
    }))
    if (sortBy === "status") {
      return [...withCounts].sort((a, b) => a.status.localeCompare(b.status))
    }
    return withCounts
  }, [organization.jobs, organization.applications, sortBy])

  const getTemplateName = (templateId?: string) => templates.find((t) => t.id === templateId)?.name ?? "—"

  const togglePublish = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Draft" ? "Open" : "Draft"
    actions.updateJob(id, { status: nextStatus as typeof organization.jobs[number]["status"] })
  }

  const setSort = (value: "status" | "created") => {
    const params = new URLSearchParams(searchParams?.toString())
    if (value === "created") {
      params.delete("sort")
    } else {
      params.set("sort", value)
    }
    router.push(`/organization/jobs?${params.toString()}`)
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Jobs"
        subtitle="Review open and draft jobs and access applicants."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Jobs" },
        ]}
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/organization/jobs/create" className="ph5-button-primary">
            Create job
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort by:</span>
            <button
              type="button"
              onClick={() => setSort("created")}
              className={sortBy === "created" ? "ph5-button-secondary" : "ph5-button-ghost"}
            >
              Creation order
            </button>
            <button
              type="button"
              onClick={() => setSort("status")}
              className={sortBy === "status" ? "ph5-button-secondary" : "ph5-button-ghost"}
            >
              Status
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="ph5-table w-full">
            <thead>
              <tr>
                <th className="ph5-table-header text-left">Job title</th>
                <th className="ph5-table-header text-left">Status</th>
                <th className="ph5-table-header text-left">Compliance template</th>
                <th className="ph5-table-header text-left">Applications</th>
                <th className="ph5-table-header text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="ph5-table-row border-b border-border">
                  <td className="ph5-table-cell font-medium text-foreground">{job.title}</td>
                  <td className="ph5-table-cell">
                    <span className={job.status === "Draft" ? "ph5-badge-warning" : "ph5-badge-success"}>
                      {job.status === "Draft" ? "Draft" : "Published"}
                    </span>
                  </td>
                  <td className="ph5-table-cell text-sm text-muted-foreground">
                    {getTemplateName((job as any).complianceTemplateId)}
                  </td>
                  <td className="ph5-table-cell text-sm text-muted-foreground">{(job as any).applicationCount}</td>
                  <td className="ph5-table-cell">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/organization/applications?jobId=${job.id}`}
                        className="ph5-button-secondary text-xs"
                      >
                        View applicants
                      </Link>
                      <button
                        type="button"
                        className="ph5-button-ghost text-xs"
                        onClick={() => togglePublish(job.id, job.status)}
                      >
                        {job.status === "Draft" ? "Publish" : "Unpublish"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!jobs.length && (
                <tr>
                  <td colSpan={5} className="ph5-table-cell text-sm text-muted-foreground">
                    No jobs yet. Create a job to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}




