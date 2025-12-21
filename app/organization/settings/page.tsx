"use client"

import { useState } from "react"
import { Header, Card, StatusChip } from "@/components/system"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

export default function OrganizationSettingsPage() {
  const [tab, setTab] = useState("profile")

  return (
    <>
      <Header
        title="Organization Settings"
        subtitle="Manage your organization profile and settings."
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Settings" },
        ]}
      />

      <section className="space-y-6">
        <Card>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <div className="mt-4">
              <TabsContent value="profile">
                <ProfileTab />
              </TabsContent>
              <TabsContent value="documents">
                <DocumentsTab />
              </TabsContent>
              <TabsContent value="notes">
                <NotesTab />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </section>
    </>
  )
}

function ProfileTab() {
  const [primaryAddress, setPrimaryAddress] = useState("442 Stockbridge Road")
  const [city, setCity] = useState("Great Barrington")
  const [state, setState] = useState("MA")
  const [zip, setZip] = useState("01230")
  const [phone, setPhone] = useState("413-528-9311")
  const [email, setEmail] = useState("esheridan@chpberkshires.org")
  const [description, setDescription] = useState(
    "Community Health Programs is a non-profit federally qualified health center (FQHC) network serving patients of all ages. CHP Berkshires spans Berkshire County with nine practice locations in Great Barrington, Lee, Pittsfield, and Adams. They provide comprehensive, inclusive healthcare to more than 35,000 Berkshire residents each year, offering primary care, women's health, dental services, nutrition, and behavioral health support.",
  )

  const handleSave = () => {
    // For now this is a mock – in a real app we'd persist to local DB or API
    // eslint-disable-next-line no-console
    console.log("Saved organization profile", {
      primaryAddress,
      city,
      state,
      zip,
      phone,
      email,
      description,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Primary Address
          </p>
          <Input
            value={primaryAddress}
            onChange={(e) => setPrimaryAddress(e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              City
            </p>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              State
            </p>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MA">MA</SelectItem>
                <SelectItem value="NY">NY</SelectItem>
                <SelectItem value="CT">CT</SelectItem>
                <SelectItem value="VT">VT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            ZIP Code
          </p>
          <Input
            value={zip}
            onChange={(e) => setZip(e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Phone Number
            </p>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Main Contact Email
            </p>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Description
          </p>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border/60">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}

function DocumentsTab() {
  const docs = [
    { id: "license", name: "Business License", expires: "Dec 2025" },
    { id: "liability", name: "Liability Insurance", expires: "Mar 2025" },
    { id: "accreditation", name: "Accreditation Certificate", expires: "Jun 2026" },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Manage organization-level documents and certifications.
      </p>
      <div className="space-y-3">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/40 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{doc.name}</p>
              <p className="text-xs text-muted-foreground">Expires: {doc.expires}</p>
            </div>
            <StatusChip label="Valid" tone="success" />
          </div>
        ))}
      </div>
    </div>
  )
}

function NotesTab() {
  const notes = [
    {
      id: "license-renewal",
      title: "Annual renewal for business license scheduled for December 2025.",
      updated: "Dec 10, 2024",
      author: "John Smith",
    },
    {
      id: "insurance-coverage",
      title:
        "Contact insurance provider to update coverage amounts before March renewal.",
      updated: "Nov 28, 2024",
      author: "Sarah Miller",
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Internal notes and reminders for organization settings.
      </p>
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="rounded-xl bg-muted/40 px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">
              Last updated: {note.updated} by {note.author}
            </p>
            <p className="mt-1 text-sm text-foreground">
              {note.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
