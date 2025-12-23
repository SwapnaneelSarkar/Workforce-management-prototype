"use client"

import { useState } from "react"
import Link from "next/link"
import { Header, Card } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/system"
import { Mail, Phone, MessageCircle, HelpCircle, Send, ChevronDown, ChevronUp, FileText, Clock, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

type FAQCategory = "All Questions" | "Applications & Jobs" | "Documents & Compliance" | "Timecards & Payments" | "Profile & Settings" | "Assignments & Scheduling" | "Technical Support"

type FAQItem = {
  id: string
  question: string
  answer: string
  category: FAQCategory
}

const faqData: FAQItem[] = [
  // Applications & Jobs
  {
    id: "1",
    question: "How do I apply for a job?",
    answer: "Browse available jobs in the 'Matches & Job Search' section. Click on a job to view details, then click 'Apply' if you meet the requirements. Make sure your profile is complete and all required documents are uploaded before applying.",
    category: "Applications & Jobs"
  },
  {
    id: "2",
    question: "How long does it take to get approved for a job?",
    answer: "Approval times vary depending on the organization and position. Typically, you'll hear back within 3-7 business days. You can track your application status in the 'Submissions' section of your dashboard.",
    category: "Applications & Jobs"
  },
  {
    id: "3",
    question: "Can I work multiple assignments at once?",
    answer: "Yes, you can work multiple assignments simultaneously as long as there are no scheduling conflicts. Make sure to coordinate with your placement managers to avoid any conflicts.",
    category: "Applications & Jobs"
  },
  {
    id: "4",
    question: 'What does my "Submission Ready Status" mean?',
    answer: "Your Submission Ready Status shows how prepared you are to apply for jobs. Tier 1 (Minimum Ready) means your basic profile is complete. Tier 2 (Submission Ready) means you have 80%+ documents approved and preferences completed. Tier 3 (Priority Ready) means you have no missing or expired documents.",
    category: "Applications & Jobs"
  },
  // Documents & Compliance
  {
    id: "5",
    question: "What documents do I need to upload?",
    answer: "Required documents vary by occupation and job. Common documents include licenses, certifications, background checks, drug screenings, and health records. Check your Document Wallet to see what's required for your occupation.",
    category: "Documents & Compliance"
  },
  {
    id: "6",
    question: "What if my license or certification expires?",
    answer: "You'll receive notifications when documents are expiring. Upload updated documents before they expire to maintain compliance. Expired documents will prevent you from applying to new jobs until renewed.",
    category: "Documents & Compliance"
  },
  {
    id: "7",
    question: "Why don't I see Background Check or Drug Screening in my Document Wallet?",
    answer: "These documents are typically initiated by the organization after you're selected for a position. You'll receive notifications when these are required and can track their status in your Document Wallet.",
    category: "Documents & Compliance"
  },
  {
    id: "8",
    question: "How do I know which documents are missing?",
    answer: "Check your Document Wallet dashboard. Missing documents will be marked with a 'Pending Upload' status. Your Submission Ready Status card also shows what's needed to reach the next tier.",
    category: "Documents & Compliance"
  },
  // Timecards & Payments
  {
    id: "9",
    question: "How do I submit my timecard?",
    answer: "Navigate to your active placement and click 'Submit Timecard'. Enter your hours for the pay period, review, and submit. Timecards must be submitted by the deadline shown in your placement details.",
    category: "Timecards & Payments"
  },
  {
    id: "10",
    question: "When will I get paid?",
    answer: "Pay periods and payment schedules vary by organization. Typically, you'll be paid bi-weekly or weekly. Check your placement details for specific payment information.",
    category: "Timecards & Payments"
  },
  {
    id: "11",
    question: "What if I made a mistake on my timecard?",
    answer: "Contact your placement manager or submit a support request immediately. If the timecard hasn't been approved yet, you may be able to edit it. Once approved, corrections may take additional time.",
    category: "Timecards & Payments"
  },
  // Profile & Settings
  {
    id: "12",
    question: "How do I update my profile information?",
    answer: "Go to your Profile page and click 'Edit' on the section you want to update. Changes are saved automatically. Some information may require verification before it's updated.",
    category: "Profile & Settings"
  },
  {
    id: "13",
    question: "How do I change my password?",
    answer: "Go to Settings and select 'Account Security'. Enter your current password and your new password. Make sure your new password meets the security requirements.",
    category: "Profile & Settings"
  },
  {
    id: "14",
    question: "How do I update my work preferences?",
    answer: "You can update your work preferences in the Profile section or by completing the General Questionnaire. Preferences include shift types, employment types, travel willingness, and location preferences.",
    category: "Profile & Settings"
  },
  // Assignments & Scheduling
  {
    id: "15",
    question: "Who do I contact if I have issues during an assignment?",
    answer: "Contact your placement manager or the organization's point of contact listed in your placement details. For urgent issues, you can also submit a support request through this page.",
    category: "Assignments & Scheduling"
  },
  {
    id: "16",
    question: "How do I view my upcoming shifts?",
    answer: "Go to the Placements section and click on your active placement. Your schedule and upcoming shifts will be displayed there. You can also check the Shifts section when it becomes available.",
    category: "Assignments & Scheduling"
  },
  {
    id: "17",
    question: "Can I request time off?",
    answer: "Yes, contact your placement manager to request time off. Submit requests as early as possible to allow for coverage arrangements. Some organizations may have specific procedures for time-off requests.",
    category: "Assignments & Scheduling"
  },
  // Technical Support
  {
    id: "18",
    question: "I'm having trouble uploading documents. What should I do?",
    answer: "Make sure your file is in a supported format (PDF, JPG, PNG) and under the size limit (typically 10MB). Try clearing your browser cache or using a different browser. If issues persist, contact support.",
    category: "Technical Support"
  },
  {
    id: "19",
    question: "The portal is running slowly or not loading. What can I do?",
    answer: "Try refreshing the page or clearing your browser cache. Check your internet connection. If the issue persists, try using a different browser or device. Report ongoing issues through the support form.",
    category: "Technical Support"
  },
  {
    id: "20",
    question: "How do I enable notifications?",
    answer: "Go to Settings and select 'Notification Preferences'. You can enable email, SMS, and in-app notifications for various events like application updates, document expirations, and placement changes.",
    category: "Technical Support"
  },
]

export default function CandidateSupportPage() {
  const { pushToast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>("All Questions")
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [supportFormData, setSupportFormData] = useState({
    subject: "",
    message: "",
    category: "General"
  })
  const [submitting, setSubmitting] = useState(false)

  const categories: FAQCategory[] = [
    "All Questions",
    "Applications & Jobs",
    "Documents & Compliance",
    "Timecards & Payments",
    "Profile & Settings",
    "Assignments & Scheduling",
    "Technical Support"
  ]

  const filteredFAQs = selectedCategory === "All Questions" 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory)

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      pushToast({
        title: "Support request submitted",
        description: "We'll get back to you within 24 hours.",
        type: "success"
      })
      setSupportFormData({ subject: "", message: "", category: "General" })
      setSubmitting(false)
    }, 1000)
  }

  return (
    <div className="space-y-6 p-8">
      <Header
        title="Support"
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "Support" },
        ]}
      />

      {/* Contact Information */}
      <Card>
        <h2 className="text-xl font-semibold text-foreground mb-4">How Can We Help?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Browse our FAQ or contact our support team
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-border">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Email Support</h3>
              <p className="text-sm text-muted-foreground">support@example.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border border-border">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Phone Support</h3>
              <p className="text-sm text-muted-foreground">(555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border border-border">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Mon-Fri 9AM-5PM ET</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        {/* Support Request Form */}
        <Card>
          <h3 className="text-lg font-semibold text-foreground mb-2">Need Direct Assistance?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Submit a support request and we'll get back to you
          </p>
          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Category
              </label>
              <select
                value={supportFormData.category}
                onChange={(e) => setSupportFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              >
                <option value="General">General</option>
                <option value="Technical">Technical</option>
                <option value="Billing">Billing</option>
                <option value="Documents">Documents</option>
                <option value="Placements">Placements</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Subject
              </label>
              <Input
                value={supportFormData.subject}
                onChange={(e) => setSupportFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of your issue"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Message
              </label>
              <Textarea
                value={supportFormData.message}
                onChange={(e) => setSupportFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Please provide details about your issue..."
                rows={6}
                required
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Contact Support"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Card>

        {/* FAQ Section */}
        <Card>
          <h3 className="text-lg font-semibold text-foreground mb-4">Frequently Asked Questions</h3>
          
          {/* Category Filter */}
          <div className="mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as FAQCategory)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* FAQ List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="border border-border rounded-lg"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{faq.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">{faq.category}</p>
                  </div>
                  {expandedFAQ === faq.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                  )}
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-4 pb-4 border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Resources */}
      <Card>
        <h3 className="text-lg font-semibold text-foreground mb-4">Additional Resources</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button 
            variant="outline" 
            className="h-auto flex-col items-start p-4"
            onClick={() => {
              pushToast({
                title: "Coming Soon",
                description: "Getting Started Guide will be available soon.",
                type: "info"
              })
            }}
          >
            <HelpCircle className="h-5 w-5 mb-2 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Getting Started Guide</p>
            <p className="text-xs text-muted-foreground mt-1">Learn how to use the Candidate Portal</p>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col items-start p-4"
            onClick={() => {
              window.location.href = "/candidate/documents"
            }}
          >
            <FileText className="h-5 w-5 mb-2 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Document Requirements</p>
            <p className="text-xs text-muted-foreground mt-1">View all required compliance documents</p>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col items-start p-4"
            onClick={() => {
              pushToast({
                title: "Coming Soon",
                description: "Timecard Instructions will be available soon.",
                type: "info"
              })
            }}
          >
            <Clock className="h-5 w-5 mb-2 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Timecard Instructions</p>
            <p className="text-xs text-muted-foreground mt-1">Step-by-step guide to submitting timecards</p>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col items-start p-4"
            onClick={() => {
              setSelectedCategory("Timecards & Payments")
              setExpandedFAQ(null)
            }}
          >
            <DollarSign className="h-5 w-5 mb-2 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Payment FAQs</p>
            <p className="text-xs text-muted-foreground mt-1">Common questions about payments</p>
          </Button>
        </div>
      </Card>
    </div>
  )
}

