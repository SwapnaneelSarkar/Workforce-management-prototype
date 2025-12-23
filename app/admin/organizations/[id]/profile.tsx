"use client"

import { useState } from "react"
import { Card } from "@/components/system"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import type { Organization } from "@/lib/organizations-store"

type OrganizationProfileProps = {
  organization: Organization
}

export default function OrganizationProfile({ organization }: OrganizationProfileProps) {
  const [formData, setFormData] = useState({
    name: organization.name || "",
    orgType: organization.orgType || "",
    industry: organization.industry || "",
    address: organization.locations[0]?.address || "",
    email: organization.email || "",
    phone: organization.phone || "",
    website: organization.website || "",
    timezone: organization.timezone || "",
    renewalDate: organization.agreementRenewalDate || "",
    annualSpend: "",
    serviceAgreement: organization.serviceAgreement || "",
    description: organization.description || "",
    status: "Active",
  })

  const [logo, setLogo] = useState(organization.logo || null)

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Organization Profile</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter the basic information for the organization.</p>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Status:</Label>
            <Switch checked={formData.status === "Active"} onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "Active" : "Inactive" })} />
            <span className="text-sm font-medium text-foreground">{formData.status}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Organization Logo</Label>
              {logo ? (
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">V</span>
                  </div>
                  <button
                    onClick={() => setLogo(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary">
                  <span className="text-sm text-muted-foreground">Upload Logo</span>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Organization Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St, Anytown, USA"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@organization.com"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Service Agreement</Label>
              <Input
                value={formData.serviceAgreement}
                onChange={(e) => setFormData({ ...formData, serviceAgreement: e.target.value })}
                placeholder="Vitality MSA.pdf"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the organization..."
                rows={4}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Organization Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Vitality Health Group"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Organization Type <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.orgType} onValueChange={(value) => setFormData({ ...formData, orgType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hospital Network">Hospital Network</SelectItem>
                  <SelectItem value="Clinic">Clinic</SelectItem>
                  <SelectItem value="Pharmaceutical">Pharmaceutical</SelectItem>
                  <SelectItem value="Medical Device">Medical Device</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Organization Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Time Zone</Label>
              <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EST">Eastern Standard Time (EST)</SelectItem>
                  <SelectItem value="CST">Central Standard Time (CST)</SelectItem>
                  <SelectItem value="MST">Mountain Standard Time (MST)</SelectItem>
                  <SelectItem value="PST">Pacific Standard Time (PST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Agreement Renewal Date</Label>
              <Input
                type="date"
                value={formData.renewalDate}
                onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                placeholder="12/01/2025"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Expected Annual Spend</Label>
              <Input
                type="text"
                value={formData.annualSpend}
                onChange={(e) => setFormData({ ...formData, annualSpend: e.target.value })}
                placeholder="Currency"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}






