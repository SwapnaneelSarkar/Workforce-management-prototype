"use client"

import { useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { Card, Header, SkeletonLoader } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useToast } from "@/components/system"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function CandidateSettingsPage() {
  const { candidate, actions } = useDemoData()
  const { pushToast } = useToast()
  const [prefs, setPrefs] = useState(candidate.notificationPrefs)
  const [email, setEmail] = useState(candidate.profile.email)
  const [newEmail, setNewEmail] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 360)
    return () => clearTimeout(timer)
  }, [])

  const handleToggle = (key: keyof typeof prefs, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }))
    actions.updateNotificationPrefs({ [key]: value })
  }

  const onSaveEmail = async () => {
    if (!newEmail || newEmail !== confirmEmail) {
      pushToast({ title: "Emails do not match", type: "error" })
      return
    }
    setSaving(true)
    await actions.updateEmail(newEmail)
    setEmail(newEmail)
    setNewEmail("")
    setConfirmEmail("")
    pushToast({ title: "Email updated", type: "success" })
    setSaving(false)
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Settings"
        subtitle="Control notifications and account information."
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Settings" },
        ]}
      />

      {loading ? (
        <SkeletonLoader lines={6} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Notification Preferences" subtitle="Choose how you want to stay informed.">
            <div className="space-y-4">
              <PreferenceToggle
                label="Email job invites"
                helper="Receive invitations and important updates."
                checked={prefs.email}
                onCheckedChange={(value) => handleToggle("email", value)}
              />
              <PreferenceToggle
                label="SMS compliance alerts"
                helper="Get text alerts when documents expire."
                checked={prefs.sms}
                onCheckedChange={(value) => handleToggle("sms", value)}
              />
              <PreferenceToggle
                label="Push messages"
                helper="Enable push notifications for new messages."
                checked={prefs.push}
                onCheckedChange={(value) => handleToggle("push", value)}
              />
            </div>
          </Card>

          <Card title="Change email" subtitle="Update your login email address.">
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Current email</label>
              <div className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">{email}</div>
              <Input placeholder="new.email@example.com" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} />
              <Input
                placeholder="Confirm new email"
                value={confirmEmail}
                onChange={(event) => setConfirmEmail(event.target.value)}
              />
              <Button onClick={onSaveEmail} disabled={saving}>
                {saving ? "Saving..." : "Save Email"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function PreferenceToggle({
  label,
  helper,
  checked,
  onCheckedChange,
}: {
  label: string
  helper: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  )
}

