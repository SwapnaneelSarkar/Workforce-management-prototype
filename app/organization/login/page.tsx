"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Shield } from "lucide-react"

export default function OrganizationLoginPage() {
  const router = useRouter()
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null)
  const [formState, setFormState] = useState({
    email: "admin@novahealth.com",
    password: "password",
    remember: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current)
      }
    }
  }, [])

  const handleChange =
    (field: "email" | "password" | "remember") => (event: ChangeEvent<HTMLInputElement>) => {
      const value = field === "remember" ? event.target.checked : event.target.value
      setFormState((prev) => ({ ...prev, [field]: value }))
    }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.email || !formState.password) {
      setError("An email and password are required to access the organization console.")
      return
    }

    setError(null)
    setIsSubmitting(true)

    redirectTimeout.current = setTimeout(() => {
      router.push("/organization/dashboard")
    }, 800)
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-2">
        <section className="space-y-8">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white p-3">
              <Building2 className="h-5 w-5 text-slate-700" />
            </span>
            Organization Control Center
          </div>
          <div>
            <h1 className="text-4xl font-semibold text-slate-900">Operational command for hiring teams</h1>
            <p className="mt-4 text-slate-600">
              Approvals, compliance, and vendor collaboration flow through this console. Role-based access controls and
              audit-ready logs make every action traceable.
            </p>
          </div>
          <ul className="space-y-4 text-sm text-slate-600">
            {[
              "Instant visibility into fill rates and spend guardrails.",
              "Side-by-side vendor scorecards and service health.",
              "Automated alerts for compliance expirations.",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-slate-700" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <p className="text-sm font-medium text-slate-500">Secure access</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Organization Login</h2>
              <p className="mt-2 text-sm text-slate-600">SSO users: start here before being redirected to your IdP.</p>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <label className="block text-sm font-medium text-slate-700">
              Work email
              <input
                type="email"
                autoComplete="email"
                value={formState.email}
                onChange={handleChange("email")}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                placeholder="you@company.com"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={formState.password}
                onChange={handleChange("password")}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                placeholder="••••••••"
              />
            </label>

            <div className="flex items-center justify-between text-sm text-slate-600">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formState.remember}
                  onChange={handleChange("remember")}
                  className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-400"
                />
                Keep me signed in for 30 days
              </label>
              <Link href="/organization/login?forgot=1" className="text-slate-800 hover:text-slate-900">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Verifying..." : "Login"}
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-4 w-4 text-slate-700" />
              All actions are logged with ISO 27001 controls & SOC 2 monitoring.
            </p>
          </form>

          <div className="mt-8 flex items-center justify-between text-sm text-slate-600">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-800 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Back to login options
            </Link>
            <span className="text-slate-500">Need access? it@workforce.io</span>
          </div>
        </section>
      </div>
    </div>
  )
}
