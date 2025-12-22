"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react"
import { ArrowLeft, ArrowRight, CheckCircle2, Shield, RefreshCw, AlertCircle, UserPlus, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"

type SupportedSsoProvider = "google" | "apple" | "microsoft"

const SSO_PROVIDERS: Array<{
  id: SupportedSsoProvider
  label: string
  helper: string
  icon: ReactNode
}> = [
  {
    id: "google",
    label: "Google",
    helper: "Work email",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-2 2.9v2.4h3.2c1.9-1.8 3-4.5 3-7.5 0-.7-.1-1.3-.2-1.9H12z" />
        <path fill="#4285F4" d="M12 21c2.7 0 5-1 6.6-2.7l-3.2-2.4c-.9.6-2 1-3.4 1-2.6 0-4.9-1.8-5.7-4.2H3v2.6C4.7 18.9 8.1 21 12 21z" />
        <path fill="#FBBC05" d="M6.3 12c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V5.8H3A9 9 0 0 0 3 18.2l3.3-2.6c-.2-.6-.3-1.2-.3-1.6z" />
        <path fill="#34A853" d="M12 4.5c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 1.2 14.7 0 12 0 8.1 0 4.7 2.1 3 5.8l3.3 2.6C7.1 5.4 9.4 4.5 12 4.5z" />
      </svg>
    ),
  },
  {
    id: "apple",
    label: "Apple",
    helper: "Company devices",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M16.3 2c0 1-.4 1.9-1 2.6a3.2 3.2 0 0 1-2.5 1.2c0-1.1.4-2 1-2.8S15.7 2 16.3 2zm4.2 15.3c-.4 1.1-.6 1.6-1.2 2.5-.8 1.3-1.8 3-3.2 3-1.2 0-1.6-.8-3-.8-1.5 0-2 .7-3.1.8-1.3.1-2.2-1.4-3-2.7-1.6-2.4-2.8-6.7-1.2-9.6.8-1.4 2.1-2.3 3.5-2.3 1.3 0 2.4.9 3.1.9.7 0 2-.9 3.4-.9.6 0 2.3.2 3.4 1.8-.1.1-2 1.2-2 3.6 0 2.8 2.5 3.8 2.6 3.9z" />
      </svg>
    ),
  },
  {
    id: "microsoft",
    label: "Microsoft",
    helper: "Entra ID",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path fill="#F25022" d="M11.5 11.5H2V2h9.5z" />
        <path fill="#00A4EF" d="M22 11.5h-9.5V2H22z" />
        <path fill="#7FBA00" d="M11.5 22H2v-9.5h9.5z" />
        <path fill="#FFB900" d="M22 22h-9.5v-9.5H22z" />
      </svg>
    ),
  },
]

export default function CandidateLoginPage() {
  const router = useRouter()
  const { actions } = useDemoData()
  const { saveOnboardingDetails } = useLocalDb()
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "joanne.rose@email.com",
    password: "password",
    confirmPassword: "",
    remember: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current)
      }
    }
  }, [])

  const handleChange =
  (
    field: "firstName" | "lastName" | "email" | "password" | "confirmPassword" | "remember",
  ) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = field === "remember" ? event.target.checked : event.target.value
      setFormState((prev) => ({ ...prev, [field]: value }))
      setError(null)
      setShowRetry(false)
    }

  const simulateAuth = async () => {
    setError(null)
    setIsSubmitting(true)
    setShowRetry(false)

    // Simulate network latency
    const delay = Math.random() * 500 + 300
    await new Promise((resolve) => setTimeout(resolve, delay))

    // Simulate random failures (10% chance)
    const shouldFail = Math.random() < 0.1 && retryCount < 2

    if (shouldFail) {
      setIsSubmitting(false)
      setError(
        isSignUp ? "Sign up failed. Please try again." : "Invalid credentials. Please check your email and password.",
      )
      setShowRetry(true)
      setRetryCount((prev) => prev + 1)
      return
    }

    // On signup, save basic form data
    if (isSignUp) {
      // Save basic signup form data to local DB
      saveOnboardingDetails({
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
      })

      // Update candidate profile email with signup data
      try {
        await actions.updateEmail(formState.email)
      } catch (error) {
        console.error("Failed to update profile email:", error)
        // Continue with signup even if profile update fails
      }
    }

    // Success - redirect based on auth flow
    redirectTimeout.current = setTimeout(() => {
      if (isSignUp) {
        router.push("/candidate/profile-setup")
      } else {
        router.push("/candidate/dashboard")
      }
    }, 400)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.email || !formState.password) {
      setError("Please provide both your email and password to continue.")
      return
    }

    if (isSignUp) {
      if (!formState.firstName || !formState.lastName) {
        setError("Please provide your first and last name to create your account.")
        return
      }
      if (formState.password !== formState.confirmPassword) {
        setError("Passwords do not match. Please try again.")
        return
      }
      if (formState.password.length < 8) {
        setError("Password must be at least 8 characters long.")
        return
      }
    }

    simulateAuth()
  }

  const handleRetry = () => {
    handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>)
  }

  const handleSsoSignIn = async (providerId: SupportedSsoProvider) => {
    if (isSubmitting) return

    if (redirectTimeout.current) {
      clearTimeout(redirectTimeout.current)
    }

    setError(null)
    setIsSubmitting(true)
    setShowRetry(false)

    // Placeholder for real provider SDK handoff
    await new Promise((resolve) => setTimeout(resolve, 600))

    redirectTimeout.current = setTimeout(() => {
      router.push(`/candidate/dashboard?sso=${providerId}`)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-2">
        <section className="space-y-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">Candidate Portal</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900">
              {isSignUp ? "Join our talent network" : "Welcome back, talent partner"}
            </h1>
            <p className="mt-4 text-slate-600">
              {isSignUp
                ? "Create your account to access curated jobs, onboarding tasks, and real-time recruiter notes. Get started in minutes."
                : "Access curated jobs, onboarding tasks, and real-time recruiter notes. This login keeps your documents synced across every staffing partner you collaborate with."}
            </p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              { value: "92%", label: "Match accuracy" },
              { value: "24h", label: "Average feedback time" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6">
                <dt className="text-sm text-slate-500">{stat.label}</dt>
                <dd className="text-3xl font-semibold text-slate-900">{stat.value}</dd>
              </div>
            ))}
          </dl>
          <ul className="space-y-4 text-sm text-slate-600">
            {[
              "Save and reuse credential packets securely.",
              "Share availability with recruiters in real time.",
              "Track offer status with proactive nudges.",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-slate-700" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Toggle between Sign Up and Sign In */}
          <div className="mb-6 flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false)
                setError(null)
                setFormState((prev) => ({ ...prev, confirmPassword: "" }))
              }}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition",
                !isSignUp
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true)
                setError(null)
              }}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition",
                isSignUp
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <UserPlus className="h-4 w-4" />
              Sign Up
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <p className="text-sm font-medium text-slate-500">
                {isSignUp ? "Create your account" : "Sign in securely"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                {isSignUp ? "Candidate Sign Up" : "Candidate Login"}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {isSignUp
                  ? "Enter your information to get started."
                  : "Use the credentials shared via your recruiter or talent lead."}
              </p>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold">{error}</p>
                    {showRetry && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-800 underline-offset-2 hover:underline"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry {isSignUp ? "sign up" : "authentication"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isSubmitting && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <span className="font-semibold">
                    {isSignUp ? "Creating your account..." : "Authenticating..."}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {isSignUp && (
                <>
                  <label className="block text-sm font-medium text-slate-700">
                    First name
                    <input
                      type="text"
                      autoComplete="given-name"
                      value={formState.firstName}
                      onChange={handleChange("firstName")}
                      disabled={isSubmitting}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Joanne"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Last name
                    <input
                      type="text"
                      autoComplete="family-name"
                      value={formState.lastName}
                      onChange={handleChange("lastName")}
                      disabled={isSubmitting}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Rose"
                    />
                  </label>
                </>
              )}

              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  autoComplete="email"
                  value={formState.email}
                  onChange={handleChange("email")}
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="you@email.com"
                />
              </label>


              <label className="block text-sm font-medium text-slate-700">
                Password
                <input
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  value={formState.password}
                  onChange={handleChange("password")}
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </label>

              {isSignUp && (
                <label className="block text-sm font-medium text-slate-700">
                  Confirm Password
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={formState.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                </label>
              )}

              {!isSignUp && (
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
                  <Link href="/candidate/login?forgot=1" className="text-slate-800 hover:text-slate-900">
                    Forgot password?
                  </Link>
                </div>
              )}
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
                    {isSignUp ? "Creating account..." : "Authenticating..."}
                  </>
                ) : (
                  <>
                    {isSignUp ? "Create account" : "Sign in with password"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {!isSignUp && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    <span className="h-px flex-1 bg-slate-200" />
                    Or continue with
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {SSO_PROVIDERS.map((provider) => (
                      <Button
                        key={provider.id}
                        variant="outline"
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSsoSignIn(provider.id)}
                        className="flex w-full flex-col items-center gap-2 rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white">
                          {provider.icon}
                        </span>
                        <span className="text-slate-900">{provider.label}</span>
                        <span className="text-xs font-normal text-slate-500">{provider.helper}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-4 w-4 text-slate-700" />
              {isSignUp
                ? "By signing up, you agree to our terms of service and privacy policy."
                : "We require MFA for new devices and automatically log out idle sessions."}
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
