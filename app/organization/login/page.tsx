"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { ArrowRight, Building2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/system"

export default function OrganizationLoginPage() {
  const router = useRouter()
  const { pushToast } = useToast()
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null)
  const [email, setEmail] = useState("admin@novahealth.com")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current)
      }
    }
  }, [])

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    if (error) setError(null)
  }

  const handleOtpChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value.replace(/\D/g, "").slice(0, 6)
    setOtp(next)
    if (error) setError(null)
  }

  const handleSendOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim()) {
      setError("Enter a work email to receive your OTP.")
      return
    }
    setError(null)
    pushToast({ title: "OTP sent to your email" })
    setStep("otp")
  }

  const handleVerifyOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP from your email.")
      return
    }
    setError(null)
    setIsSubmitting(true)
    redirectTimeout.current = setTimeout(() => {
      router.push("/organization/dashboard")
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-2">
        <section className="space-y-8">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white p-3">
              <Building2 className="h-5 w-5 text-slate-700" />
            </span>
            Organization Portal
          </div>
          <div>
            <h1 className="text-4xl font-semibold text-slate-900">Sign in with email + OTP</h1>
            <p className="mt-4 text-slate-600">
              Organization users access the hiring console using a one-time code sent to their work email. No passwords or social
              logins are required.
            </p>
          </div>
          <ul className="space-y-4 text-sm text-slate-600">
            {["Email-based access only", "6-digit one-time codes", "No passwords or social logins"].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-slate-700" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {step === "email" ? (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div>
                <p className="text-sm font-medium text-slate-500">Step 1 of 2</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Enter work email</h2>
                <p className="mt-2 text-sm text-slate-600">We&apos;ll send a 6-digit OTP to this address.</p>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              <label className="block text-sm font-medium text-slate-700">
                Work email
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
                  placeholder="you@company.com"
                />
              </label>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                Send OTP
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <p className="text-sm font-medium text-slate-500">Step 2 of 2</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Enter OTP</h2>
                <p className="mt-2 text-sm text-slate-600">We sent a 6-digit code to {email}. Any 6 digits will be accepted in this demo.</p>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              <label className="block text-sm font-medium text-slate-700">
                One-time code
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp}
                  onChange={handleOtpChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-2xl tracking-[0.4em] text-slate-900 placeholder-slate-300 focus:border-slate-400 focus:outline-none"
                  placeholder="••••••"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Verify & continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

