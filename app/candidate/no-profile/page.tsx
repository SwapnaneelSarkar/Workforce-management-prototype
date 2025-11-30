"use client"

import Link from "next/link"
import { AlertCircle, ArrowRight, FileText, UserPlus } from "lucide-react"
import { Card, Header } from "@/components/system"
import { Button } from "@/components/ui/button"

export default function NoMatchingProfilePage() {
  return (
    <div className="space-y-6 p-8">
      <Header
        title="No Matching Profile Found"
        subtitle="We couldn't find a profile that matches your credentials."
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Profile Setup" },
        ]}
      />

      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="rounded-full bg-warning/10 p-4">
                <AlertCircle className="h-12 w-12 text-warning" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Profile Not Found</h2>
              <p className="text-muted-foreground">
                We couldn't match your information to an existing candidate profile. This might happen if:
              </p>
            </div>
            <ul className="text-left space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-warning mt-1">•</span>
                <span>Your email or credentials don't match our records</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-1">•</span>
                <span>You're a new candidate who hasn't completed onboarding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-1">•</span>
                <span>Your profile needs to be created by a recruiter</span>
              </li>
            </ul>
          </div>
        </Card>

        <Card title="Next Steps" subtitle="Choose an option to continue:">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Start Onboarding</h3>
                  <p className="text-xs text-muted-foreground">Create your profile from scratch</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete the onboarding process to set up your candidate profile, upload documents, and start
                applying to jobs.
              </p>
              <Button
                asChild
                className="w-full"
                onClick={() => {
                  window.location.href = "/candidate/onboarding"
                }}
              >
                <Link href="/candidate/onboarding">
                  Begin Onboarding
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-500/10 p-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Contact Support</h3>
                  <p className="text-xs text-muted-foreground">Get help from our team</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                If you believe you should have an existing profile, contact support to resolve the issue.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="mailto:support@workforce.io">
                  Email Support
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <Button variant="ghost" asChild>
            <Link href="/candidate/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}






