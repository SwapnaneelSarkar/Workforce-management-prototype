"use client"

import Link from "next/link"
import { ArrowRight, Building2, UsersRound } from "lucide-react"

const roles = [
  {
    title: "Candidate Workspace",
    description: "Apply faster, track onboarding tasks, and keep credentials synced with recruiters.",
    stats: "4k+ active assignments",
    href: "/candidate/login",
    badge: "Talent Portal",
    icon: UsersRound,
    footnote: "Real-time job matches • Secure document vault",
  },
  {
    title: "Organization Control Center",
    description: "Monitor requisitions, approvals, compliance tasks, and workforce costs in one view.",
    stats: "98% SLA adherence",
    href: "/organization/login",
    badge: "Enterprise Suite",
    icon: Building2,
    footnote: "Budget guardrails • Policy workflows",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <header className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">Workforce Management Platform</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Choose the login that fits your role</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600 sm:text-lg">
            Each workspace keeps permissions scoped to your responsibilities while preserving a single source of truth
            for workforce data.
          </p>
        </header>

        <div className="mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-2">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <Link
                key={role.title}
                href={role.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
              >
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-slate-50 p-2">
                    <Icon className="h-5 w-5 text-slate-600" />
                  </span>
                  {role.badge}
                </div>
                <h2 className="mt-6 text-xl font-semibold text-slate-900">{role.title}</h2>
                <p className="mt-3 text-sm text-slate-600">{role.description}</p>
                <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                  <span className="font-medium text-slate-800">{role.stats}</span>
                  <span className="inline-flex items-center gap-2 text-slate-700">
                    Continue
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
                <p className="mt-4 text-xs text-slate-500">{role.footnote}</p>
              </Link>
            )
          })}
        </div>

        <footer className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 md:flex md:items-center md:justify-between">
          <p className="max-w-2xl">
            Need to add a new stakeholder? Share this page so they can select the right workspace without extra setup.
          </p>
          <Link href="/FEATURES_DOCUMENTATION.md" className="mt-4 inline-flex items-center gap-2 text-slate-800 hover:text-slate-900 md:mt-0">
            Explore documentation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </footer>
      </div>
    </div>
  )
}
