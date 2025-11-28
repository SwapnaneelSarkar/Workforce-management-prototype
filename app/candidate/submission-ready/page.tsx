"use client"

import { useMemo, useState } from "react"

import { Card, DatePicker, Header } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

type ReferenceContact = {
  name: string
  relationship: string
  phone: string
  email: string
}

export default function CandidateSubmissionReadyPage() {
  const { candidate } = useDemoData()

  const profileExtras = candidate.profile as typeof candidate.profile & {
    occupation?: string
    specialty?: string
  }

  const occupation = profileExtras.occupation ?? candidate.profile.role ?? "Not provided"
  const specialty =
    profileExtras.specialty ??
    (candidate.profile.specialties.length > 0 ? candidate.profile.specialties.join(", ") : "Not provided")

  const licenseOptions = [
    "Registered Nurse (RN)",
    "Licensed Practical Nurse (LPN)",
    "Nurse Practitioner (NP)",
    "Physician Assistant (PA)",
    "Allied Health",
    "Other",
  ]

  const today = useMemo(() => new Date().toISOString().split("T")[0], [])
  const isClinicalOccupation = useMemo(() => /nurse|physician|clinician|provider|tech|therapist/i.test(occupation), [occupation])
  const emailRequiredForRefs = isClinicalOccupation
  const resumeDoc = useMemo(
    () => candidate.documents.find((doc) => doc.type.toLowerCase().includes("resume") || doc.name.toLowerCase().includes("resume")),
    [candidate.documents],
  )

  const [licenseType, setLicenseType] = useState(licenseOptions[0])
  const [licenseNumber, setLicenseNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [ssnLast4, setSsnLast4] = useState("")
  const [summaryStatement, setSummaryStatement] = useState("")
  const [timeOffStart, setTimeOffStart] = useState("")
  const [timeOffEnd, setTimeOffEnd] = useState("")
  const [resumeReplacementName, setResumeReplacementName] = useState("")
  const [certificationUploads, setCertificationUploads] = useState<string[]>([])
  const [licenseVerificationFile, setLicenseVerificationFile] = useState("")
  const [skillsChecklistFile, setSkillsChecklistFile] = useState("")
  const [references, setReferences] = useState<ReferenceContact[]>([
    { name: "", relationship: "", phone: "", email: "" },
    { name: "", relationship: "", phone: "", email: "" },
  ])

  const handleLast4Change = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 4)
    setSsnLast4(digitsOnly)
  }

  const handleTimeOffStartChange = (value: string) => {
    setTimeOffStart(value)
    if (timeOffEnd && value && value > timeOffEnd) {
      setTimeOffEnd(value)
    }
  }

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setResumeReplacementName(file.name)
      event.target.value = ""
    }
  }

  const handleCertificationUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length) {
      setCertificationUploads((prev) => [...prev, ...files.map((file) => file.name)])
      event.target.value = ""
    }
  }

  const handleLicenseVerificationUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLicenseVerificationFile(file.name)
      event.target.value = ""
    }
  }

  const handleSkillsChecklistUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSkillsChecklistFile(file.name)
      event.target.value = ""
    }
  }

  const updateReference = (index: number, field: keyof ReferenceContact, value: string) => {
    setReferences((prev) => prev.map((ref, idx) => (idx === index ? { ...ref, [field]: value } : ref)))
  }

  const addReferenceRow = () => {
    setReferences((prev) => [...prev, { name: "", relationship: "", phone: "", email: "" }])
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Be Submission Ready"
        subtitle="Application-ready checklist to help you get submitted faster."
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Submission Ready" },
        ]}
      />

      <Card title="Profile Overview" subtitle="Information collected during your registration">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="ph5-label mb-1">Occupation</dt>
            <dd className="font-semibold text-foreground">{occupation}</dd>
          </div>
          <div>
            <dt className="ph5-label mb-1">Specialty</dt>
            <dd className="font-semibold text-foreground">{specialty}</dd>
          </div>
        </dl>
      </Card>

      <Card
        title="Required Additional Information"
        subtitle="Compliance and recruiting teams use this to verify your identity, licensing, and availability."
      >
        <div className="space-y-8">
          {isClinicalOccupation && (
            <section className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Identity & Licensing</p>
                <p className="text-xs text-muted-foreground">
                  Provide the license details that align with your current occupation.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="ph5-label mb-2 block">
                    License Type <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={licenseType}
                    onChange={(event) => setLicenseType(event.target.value)}
                    className="ph5-input w-full cursor-pointer"
                    aria-label="License type"
                  >
                    {licenseOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="ph5-label mb-2 block">
                    License Number <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={licenseNumber}
                    onChange={(event) => setLicenseNumber(event.target.value)}
                    placeholder="e.g., RN-123456"
                    aria-label="License number"
                  />
                </div>
              </div>
            </section>
          )}

          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="ph5-label mb-2 block">
                Date of Birth <span className="text-destructive">*</span>
              </label>
              <DatePicker value={dateOfBirth} onChange={setDateOfBirth} max={today} />
            </div>
            <div>
              <label className="ph5-label mb-2 block">
                Last 4 of SSN <span className="text-destructive">*</span>
              </label>
              <Input
                inputMode="numeric"
                maxLength={4}
                value={ssnLast4}
                onChange={(event) => handleLast4Change(event.target.value)}
                placeholder="0000"
                aria-label="Last four digits of Social Security Number"
              />
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="ph5-label block">
                Summary Statement <span className="text-destructive">*</span>
              </label>
              <span className="text-xs text-muted-foreground">{summaryStatement.length}/600</span>
            </div>
            <Textarea
              value={summaryStatement}
              onChange={(event) => setSummaryStatement(event.target.value.slice(0, 600))}
              placeholder="Provide a brief summary of your experience or why you believe you’re a strong fit for roles."
              aria-label="Summary statement"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Prompt example: &ldquo;Provide a brief summary of your experience or why you believe you’re a strong fit for roles.&rdquo;
            </p>
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Time Off</p>
              <p className="text-xs text-muted-foreground">Share upcoming time off so recruiters can align submissions.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="ph5-label mb-2 block">Requested Time Off - Start</label>
                <DatePicker value={timeOffStart} onChange={handleTimeOffStartChange} min={today} />
              </div>
              <div>
                <label className="ph5-label mb-2 block">Requested Time Off - End</label>
                <DatePicker value={timeOffEnd} onChange={setTimeOffEnd} min={timeOffStart || today} />
              </div>
            </div>
          </section>
        </div>
      </Card>

      <Card
        title="Supporting Documents & Related Items"
        subtitle="Upload refreshed compliance documents and provide references needed for submission."
      >
        <div className="space-y-10">
          <section className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Resume / CV</p>
              <p className="text-xs text-muted-foreground">We use this version when clients request your submission package.</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/40 p-4">
              {resumeDoc ? (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{resumeDoc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Status: {resumeDoc.status} · Updated {resumeDoc.lastUpdated}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">Type: {resumeDoc.type}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No resume on file yet.</p>
              )}
              <div className="mt-4 space-y-2">
                <label className="ph5-label block">Replace / Re-upload Resume</label>
                <Input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} aria-label="Upload updated resume or CV" />
                {resumeReplacementName && (
                  <p className="text-xs text-muted-foreground">Selected file: {resumeReplacementName}</p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Certifications</p>
              <p className="text-xs text-muted-foreground">
                Upload any specialty certifications that are required for the assignment (ACLS, BLS, etc.).
              </p>
            </div>
            <div className="space-y-3">
              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.png"
                onChange={handleCertificationUpload}
                aria-label="Upload certification files"
              />
              {certificationUploads.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {certificationUploads.map((fileName, index) => (
                    <li key={`${fileName}-${index}`}>{fileName}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Reference Contacts</p>
              <p className="text-xs text-muted-foreground">
                Share professional references recruiters can contact quickly. Email is {emailRequiredForRefs ? "required" : "optional"} for your occupation.
              </p>
            </div>
            <div className="space-y-4">
              {references.map((reference, index) => (
                <div key={`reference-${index}`} className="space-y-4 rounded-2xl border border-border/70 p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Reference #{index + 1}</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="ph5-label mb-2 block">Name</label>
                      <Input value={reference.name} onChange={(event) => updateReference(index, "name", event.target.value)} placeholder="Full name" />
                    </div>
                    <div>
                      <label className="ph5-label mb-2 block">Relationship / Role</label>
                      <Input
                        value={reference.relationship}
                        onChange={(event) => updateReference(index, "relationship", event.target.value)}
                        placeholder="Charge Nurse, Supervisor, etc."
                      />
                    </div>
                    <div>
                      <label className="ph5-label mb-2 block">Phone</label>
                      <Input
                        type="tel"
                        value={reference.phone}
                        onChange={(event) => updateReference(index, "phone", event.target.value)}
                        placeholder="(555) 555-5555"
                      />
                    </div>
                    <div>
                      <label className="ph5-label mb-2 block">
                        Email {emailRequiredForRefs && <span className="text-destructive">*</span>}
                      </label>
                      <Input
                        type="email"
                        value={reference.email}
                        onChange={(event) => updateReference(index, "email", event.target.value)}
                        placeholder="reference@email.com"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {references.length < 5 && (
                <Button variant="outline" onClick={addReferenceRow}>
                  Add Another Reference
                </Button>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground">License Verification</p>
              <p className="text-xs text-muted-foreground">Upload the official verification pulled from your licensing board.</p>
            </div>
            <div className="space-y-2">
              <Input type="file" accept=".pdf,.jpg,.png" onChange={handleLicenseVerificationUpload} aria-label="Upload license verification document" />
              {licenseVerificationFile && (
                <p className="text-xs text-muted-foreground">Selected file: {licenseVerificationFile}</p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Skills Checklist</p>
              <p className="text-xs text-muted-foreground">
                Provide the latest skills checklist relevant to the specialty you&apos;re targeting.
              </p>
            </div>
            <div className="space-y-2">
              <Input type="file" accept=".pdf" onChange={handleSkillsChecklistUpload} aria-label="Upload skills checklist" />
              {skillsChecklistFile && <p className="text-xs text-muted-foreground">Selected file: {skillsChecklistFile}</p>}
            </div>
          </section>
        </div>
      </Card>
    </div>
  )
}
