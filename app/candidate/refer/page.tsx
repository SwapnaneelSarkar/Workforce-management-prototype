"use client"

import { useEffect, useMemo, useState } from "react"
import { Copy, Gift, Link2 } from "lucide-react"
import { Card, Header, Modal, SkeletonLoader, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function CandidateReferPage() {
  const { candidate, organization, actions } = useDemoData()
  const { pushToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [referralCode, setReferralCode] = useState(candidate.referralCode?.value ?? "")
  const [inviteEmail, setInviteEmail] = useState("")
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 320)
    return () => clearTimeout(timer)
  }, [])

  const availableJobs = useMemo(() => organization.jobs.slice(0, 3), [organization.jobs])

  const handleGenerate = async () => {
    setGenerating(true)
    const code = await actions.generateReferralCode()
    setReferralCode(code)
    pushToast({ title: "Referral code ready", description: "Share this code with your colleague.", type: "success" })
    setGenerating(false)
  }

  const copyCode = async () => {
    if (!referralCode) return
    await navigator.clipboard.writeText(referralCode)
    pushToast({ title: "Copied to clipboard", type: "info" })
  }

  const sendInvite = () => {
    if (!inviteEmail || !referralCode) return
    pushToast({ title: `Invite sent to ${inviteEmail}`, type: "success" })
    setInviteEmail("")
    setModalOpen(false)
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Refer a Friend"
        subtitle="Earn rewards by inviting trusted clinicians to open assignments."
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Refer" },
        ]}
        actions={[
          {
            id: "new-referral",
            label: "Generate Referral",
            variant: "primary",
            onClick: () => setModalOpen(true),
          },
        ]}
      />

      {loading ? (
        <SkeletonLoader lines={6} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Referral Rewards" subtitle="Redeem once your referral is hired.">
            <div className="grid gap-4 sm:grid-cols-2">
              <RewardItem icon={<Gift className="h-5 w-5 text-primary" />} label="$500 Bonus" description="Paid 30 days after start" />
              <RewardItem icon={<Link2 className="h-5 w-5 text-primary" />} label="Leaderboards" description="Track invites and tiers" />
            </div>
          </Card>

          <Card title="Active Referral Code" subtitle="Share this link directly with your colleague.">
            {referralCode ? (
              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-dashed border-primary bg-primary/5 px-4 py-3 text-center text-lg font-semibold text-primary">
                  {referralCode}
                </div>
                <Button variant="outline" onClick={copyCode} aria-label="Copy referral code">
                  <Copy className="mr-2 h-4 w-4" aria-hidden />
                  Copy Code
                </Button>
              </div>
            ) : (
              <Button onClick={handleGenerate} disabled={generating} aria-label="Generate referral code">
                {generating ? "Generating..." : "Generate Code"}
              </Button>
            )}
          </Card>

          <Card title="Recommended Roles" subtitle="Perfect matches for your peers right now.">
            <div className="flex flex-col gap-4">
              {availableJobs.map((job) => (
                <div key={job.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.location}</p>
                    </div>
                    <StatusChip label={job.billRate} tone="info" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Referral Activity" subtitle="Track who you invited and their progress.">
            <div className="space-y-3 text-sm text-foreground">
              {candidate.notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <div>
                    <p className="font-semibold">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.subtitle}</p>
                  </div>
                  <StatusChip label={notif.time} tone="neutral" />
                </div>
              ))}
              {!candidate.notifications.length ? (
                <p className="text-sm text-muted-foreground">You have no referral updates yet.</p>
              ) : null}
            </div>
          </Card>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Send Referral Invite"
        description="Generate a referral code and email it directly to your colleague."
      >
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground" htmlFor="inviteEmail">
            Recipient email
          </label>
          <Input
            id="inviteEmail"
            type="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="nurse@example.com"
          />
          <Button className="w-full" onClick={handleGenerate} disabled={generating}>
            {referralCode ? "Refresh Code" : generating ? "Generating..." : "Generate Code"}
          </Button>
          <Button className="w-full" onClick={sendInvite} disabled={!inviteEmail || !referralCode}>
            Send Invite
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function RewardItem({
  icon,
  label,
  description,
}: {
  icon: React.ReactNode
  label: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2">{icon}</div>
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}

