"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { ArrowLeft, ArrowRight, CheckCircle2, Shield, AlertCircle, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminLoginPage() {
  const router = useRouter()
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null)
  const [formState, setFormState] = useState({
    email: "admin@workforce.io",
    password: "admin123",
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
      setError(null)
    }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.email || !formState.password) {
      setError("Please provide both your email and password to continue.")
      return
    }

    // Simple validation - in production, this would be an API call
    if (formState.email !== "admin@workforce.io" || formState.password !== "admin123") {
      setError("Invalid credentials. Please check your email and password.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    // Simulate network latency
    redirectTimeout.current = setTimeout(() => {
      router.push("/admin/dashboard")
    }, 400)
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-2">
        <section className="space-y-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">Admin Portal</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900">Welcome back, Administrator</h1>
            <p className="mt-4 text-slate-600">
              Manage organizations, monitor system health, and oversee platform operations. Full administrative access to all
              workforce management features.
            </p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              { value: "100%", label: "System uptime" },
              { value: "24/7", label: "Support coverage" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6">
                <dt className="text-sm text-slate-500">{stat.label}</dt>
                <dd className="text-3xl font-semibold text-slate-900">{stat.value}</dd>
              </div>
            ))}
          </dl>
          <ul className="space-y-4 text-sm text-slate-600">
            {[
              "Manage all organizations and their configurations.",
              "Monitor system performance and user activity.",
              "Access comprehensive platform analytics.",
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
              <p className="text-sm font-medium text-slate-500">Administrative access</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Admin Login</h2>
              <p className="mt-2 text-sm text-slate-600">Use your administrator credentials to access the platform.</p>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {isSubmitting && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <span className="font-semibold">Authenticating...</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  autoComplete="email"
                  value={formState.email}
                  onChange={handleChange("email")}
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="admin@workforce.io"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Password
                <input
                  type="password"
                  autoComplete="current-password"
                  value={formState.password}
                  onChange={handleChange("password")}
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </label>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formState.remember}
                    onChange={handleChange("remember")}
                    disabled={isSubmitting}
                    className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-400 disabled:opacity-50"
                  />
                  Keep me signed in on this device
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign in with password
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <p className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-4 w-4 text-slate-700" />
              Administrative access is logged and monitored for security purposes.
            </p>
          </form>

          <div className="mt-8 flex items-center justify-between text-sm text-slate-600">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-800 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Back to login options
            </Link>
            <span className="text-slate-500">Need help? support@workforce.io</span>
          </div>
        </section>
      </div>
    </div>
  )
}


