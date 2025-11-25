"use client"

import { useEffect, useMemo, useState } from "react"
import { Paperclip, Send, X } from "lucide-react"
import { Card, Header, SkeletonLoader, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useToast } from "@/components/system"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function CandidateMessagesPage() {
  const { candidate, actions } = useDemoData()
  const { pushToast } = useToast()
  const [selectedThreadId, setSelectedThreadId] = useState(candidate.messages[0]?.id)
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState<{ id: string; name: string }[]>([])
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(timer)
  }, [])

  const selectedThread = useMemo(
    () => candidate.messages.find((thread) => thread.id === selectedThreadId),
    [candidate.messages, selectedThreadId],
  )

  useEffect(() => {
    if (!selectedThreadId) return
    setTyping(true)
    const timer = setTimeout(() => setTyping(false), 2500)
    return () => clearTimeout(timer)
  }, [selectedThreadId])

  const handleSend = async () => {
    if (!selectedThreadId || !reply.trim()) return
    setSending(true)
    await actions.sendMessage(selectedThreadId, reply.trim())
    pushToast({ title: "Reply sent", type: "success" })
    setReply("")
    setAttachments([])
    setSending(false)
  }

  const toggleRead = (threadId: string, unread: boolean) => {
    actions.markThreadRead(threadId, unread)
  }

  const handleAttach = () => {
    setAttachments((prev) => [...prev, { id: crypto.randomUUID(), name: `Attachment-${prev.length + 1}.pdf` }])
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((file) => file.id !== id))
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Message Center"
        subtitle="Threaded conversations between you and recruiters, compliance, and support."
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Messages" },
        ]}
      />

      {loading ? (
        <SkeletonLoader lines={8} className="mt-8" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <Card title="Conversations" subtitle="Pick a thread to see full history">
            <div className="flex flex-col gap-2">
              {candidate.messages.map((thread) => {
                const isActive = thread.id === selectedThreadId
                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{thread.participants[0]}</p>
                      {thread.unreadCount > 0 ? <StatusChip label={`${thread.unreadCount} unread`} tone="info" /> : null}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">{thread.subject}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{thread.lastMessage}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{new Date(thread.updatedAt).toLocaleString()}</span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleRead(thread.id, thread.unreadCount === 0)
                        }}
                        className="text-primary underline-offset-4 hover:underline"
                        aria-label={thread.unreadCount ? "Mark as read" : "Mark as unread"}
                      >
                        {thread.unreadCount ? "Mark read" : "Mark unread"}
                      </button>
                    </div>
                  </button>
                )
              })}
              {!candidate.messages.length ? <p className="text-sm text-muted-foreground">No conversations yet.</p> : null}
            </div>
          </Card>

          <Card
            title={selectedThread?.subject ?? "No thread selected"}
            subtitle={selectedThread ? `Participants: ${selectedThread.participants.join(", ")}` : undefined}
          >
            {selectedThread ? (
              <div className="space-y-4">
                <div className="max-h-[360px] space-y-4 overflow-y-auto rounded-xl bg-muted/40 p-4">
                  {typing && <p className="text-xs text-muted-foreground">Recruiter is typing…</p>}
                  {selectedThread.messages.map((message) => (
                    <div key={message.id} className="rounded-lg border border-border bg-card px-4 py-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{message.from}</span>
                        <span>{new Date(message.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="mt-1 text-sm text-foreground">{message.body}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <label htmlFor="reply" className="text-sm font-semibold text-foreground">
                    Quick Reply
                  </label>
                  {attachments.length ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {attachments.map((file) => (
                        <li key={file.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                          <Paperclip className="h-3.5 w-3.5" aria-hidden />
                          {file.name}
                          <button type="button" onClick={() => removeAttachment(file.id)} aria-label={`Remove ${file.name}`}>
                            <X className="h-3 w-3" aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Textarea
                    id="reply"
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Type your response..."
                    rows={4}
                    className="mt-2"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAttach}
                      className="inline-flex items-center gap-2"
                      aria-label="Attach file"
                    >
                      <Paperclip className="h-4 w-4" aria-hidden />
                      Attach mock file
                    </Button>
                    <Button onClick={handleSend} disabled={!reply.trim() || sending} aria-label="Send message">
                      {sending ? "Sending..." : "Send Reply"}
                      <Send className="ml-2 h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a conversation to view the thread.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

