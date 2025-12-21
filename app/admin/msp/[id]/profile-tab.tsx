"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/system"
import { useToast } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Download, Eye, X, Edit } from "lucide-react"
import {
  getMSPById,
  updateMSP,
  getMSPOrganizationsByMSPId,
  getAllOrganizations,
  getOrganizationById,
  addMSPOrganization,
  updateMSPOrganization,
  deleteMSPOrganization,
  getMSPOrganizationByMSPAndOrg,
  calculateMSPTotalAnnualSpend,
  calculateExpectedMSPRevenue,
  calculateExpectedSASRevenue,
  type MSP,
  type MSPOrganization,
} from "@/lib/admin-local-db"
import Image from "next/image"

type MSPProfileTabProps = {
  mspId: string
}

export default function MSPProfileTab({ mspId }: MSPProfileTabProps) {
  const { pushToast } = useToast()
  const [msp, setMSP] = useState<MSP | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    organizationType: "MSP firm" as "Staffing agency" | "MSP firm" | "Organization staffing office",
    headquartersStreet: "",
    headquartersCity: "",
    headquartersState: "",
    headquartersZip: "",
    headquartersCountry: "United States",
    billingSameAsHeadquarters: true,
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "United States",
    organizationPhone: "",
    timezone: "",
    msaDocument: "",
    agreementRenewalDate: "",
  })
  const [logo, setLogo] = useState<string | null>(null)
  const [relatedOrgs, setRelatedOrgs] = useState<MSPOrganization[]>([])
  const [allOrganizations, setAllOrganizations] = useState<any[]>([])
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false)
  const [isEditOrgModalOpen, setIsEditOrgModalOpen] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")
  const [orgFormData, setOrgFormData] = useState({
    organizationId: "",
    addendumAgreement: "",
    mspFeePercentage: "",
    sasFeePercentage: "",
    agreementStartDate: "",
    agreementRenewalDate: "",
    possibleCancellationDate: "",
  })
  const [editingMSPOrg, setEditingMSPOrg] = useState<MSPOrganization | null>(null)
  const [filterData, setFilterData] = useState({
    orgName: "",
    startDateFrom: "",
    startDateTo: "",
    renewalDateFrom: "",
    renewalDateTo: "",
    minMSPPercent: "",
    maxMSPPercent: "",
    minSASPercent: "",
    maxSASPercent: "",
  })

  useEffect(() => {
    loadData()
  }, [mspId])

  const loadData = () => {
    setLoading(true)
    const mspData = getMSPById(mspId)
    if (mspData) {
      setMSP(mspData)
      setLogo(mspData.logo || null)
      setFormData({
        name: mspData.name,
        industry: mspData.industry || "",
        organizationType: mspData.organizationType,
        headquartersStreet: mspData.headquartersStreet || "",
        headquartersCity: mspData.headquartersCity || "",
        headquartersState: mspData.headquartersState || "",
        headquartersZip: mspData.headquartersZip || "",
        headquartersCountry: mspData.headquartersCountry || "United States",
        billingSameAsHeadquarters: mspData.billingSameAsHeadquarters,
        billingStreet: mspData.billingStreet || "",
        billingCity: mspData.billingCity || "",
        billingState: mspData.billingState || "",
        billingZip: mspData.billingZip || "",
        billingCountry: mspData.billingCountry || "United States",
        organizationPhone: mspData.organizationPhone || "",
        timezone: mspData.timezone || "",
        msaDocument: mspData.msaDocument || "",
        agreementRenewalDate: mspData.agreementRenewalDate || "",
      })
      
      // Load billing address if not same as headquarters
      if (!mspData.billingSameAsHeadquarters) {
        setFormData((prev) => ({
          ...prev,
          billingStreet: mspData.billingStreet || "",
          billingCity: mspData.billingCity || "",
          billingState: mspData.billingState || "",
          billingZip: mspData.billingZip || "",
          billingCountry: mspData.billingCountry || "United States",
        }))
      }
    }
    
    const orgs = getMSPOrganizationsByMSPId(mspId)
    setRelatedOrgs(orgs)
    
    const allOrgs = getAllOrganizations()
    setAllOrganizations(allOrgs)
    
    setLoading(false)
  }

  const handleSave = () => {
    if (!msp) return

    const updates: Partial<MSP> = {
      name: formData.name,
      industry: formData.industry,
      organizationType: formData.organizationType,
      headquartersStreet: formData.headquartersStreet,
      headquartersCity: formData.headquartersCity,
      headquartersState: formData.headquartersState,
      headquartersZip: formData.headquartersZip,
      headquartersCountry: formData.headquartersCountry,
      billingSameAsHeadquarters: formData.billingSameAsHeadquarters,
      organizationPhone: formData.organizationPhone,
      timezone: formData.timezone,
      msaDocument: formData.msaDocument,
      agreementRenewalDate: formData.agreementRenewalDate,
    }

    if (formData.billingSameAsHeadquarters) {
      updates.billingStreet = formData.headquartersStreet
      updates.billingCity = formData.headquartersCity
      updates.billingState = formData.headquartersState
      updates.billingZip = formData.headquartersZip
      updates.billingCountry = formData.headquartersCountry
    } else {
      updates.billingStreet = formData.billingStreet
      updates.billingCity = formData.billingCity
      updates.billingState = formData.billingState
      updates.billingZip = formData.billingZip
      updates.billingCountry = formData.billingCountry
    }

    if (logo) {
      updates.logo = logo
    }

    const updated = updateMSP(mspId, updates)
    if (updated) {
      pushToast({ title: "Success", description: "MSP profile updated successfully." })
      loadData()
    } else {
      pushToast({ title: "Error", description: "Failed to update MSP profile." })
    }
  }

  const handleBillingSameAsHeadquartersChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      billingSameAsHeadquarters: checked,
      billingStreet: checked ? prev.headquartersStreet : prev.billingStreet,
      billingCity: checked ? prev.headquartersCity : prev.billingCity,
      billingState: checked ? prev.headquartersState : prev.billingState,
      billingZip: checked ? prev.headquartersZip : prev.billingZip,
      billingCountry: checked ? prev.headquartersCountry : prev.billingCountry,
    }))
  }

  const handleAddOrganization = () => {
    setSelectedOrgId("")
    setOrgFormData({
      organizationId: "",
      addendumAgreement: "",
      mspFeePercentage: "",
      sasFeePercentage: "",
      agreementStartDate: "",
      agreementRenewalDate: "",
      possibleCancellationDate: "",
    })
    setEditingMSPOrg(null)
    setIsAddOrgModalOpen(true)
  }

  const handleEditOrganization = (mspOrg: MSPOrganization) => {
    setEditingMSPOrg(mspOrg)
    setOrgFormData({
      organizationId: mspOrg.organizationId,
      addendumAgreement: mspOrg.addendumAgreement || "",
      mspFeePercentage: mspOrg.mspFeePercentage?.toString() || "",
      sasFeePercentage: mspOrg.sasFeePercentage?.toString() || "",
      agreementStartDate: mspOrg.agreementStartDate || "",
      agreementRenewalDate: mspOrg.agreementRenewalDate || "",
      possibleCancellationDate: mspOrg.possibleCancellationDate || "",
    })
    setIsEditOrgModalOpen(true)
  }

  const handleSaveOrganization = () => {
    if (!orgFormData.organizationId) {
      pushToast({ title: "Error", description: "Please select an organization." })
      return
    }

    try {
      if (editingMSPOrg) {
        const updated = updateMSPOrganization(editingMSPOrg.id, {
          addendumAgreement: orgFormData.addendumAgreement || undefined,
          mspFeePercentage: orgFormData.mspFeePercentage ? parseFloat(orgFormData.mspFeePercentage) : undefined,
          sasFeePercentage: orgFormData.sasFeePercentage ? parseFloat(orgFormData.sasFeePercentage) : undefined,
          agreementStartDate: orgFormData.agreementStartDate || undefined,
          agreementRenewalDate: orgFormData.agreementRenewalDate || undefined,
          possibleCancellationDate: orgFormData.possibleCancellationDate || undefined,
        })
        
        if (updated) {
          pushToast({ title: "Success", description: "Organization relationship updated successfully." })
          loadData()
          setIsEditOrgModalOpen(false)
          setEditingMSPOrg(null)
        } else {
          pushToast({ title: "Error", description: "Failed to update organization relationship." })
        }
      } else {
        // Check if already exists
        const existing = getMSPOrganizationByMSPAndOrg(mspId, orgFormData.organizationId)
        if (existing) {
          pushToast({ title: "Error", description: "This organization is already linked to this MSP." })
          return
        }

        addMSPOrganization({
          mspId: mspId,
          organizationId: orgFormData.organizationId,
          addendumAgreement: orgFormData.addendumAgreement || undefined,
          mspFeePercentage: orgFormData.mspFeePercentage ? parseFloat(orgFormData.mspFeePercentage) : undefined,
          sasFeePercentage: orgFormData.sasFeePercentage ? parseFloat(orgFormData.sasFeePercentage) : undefined,
          agreementStartDate: orgFormData.agreementStartDate || undefined,
          agreementRenewalDate: orgFormData.agreementRenewalDate || undefined,
          possibleCancellationDate: orgFormData.possibleCancellationDate || undefined,
        })
        
        pushToast({ title: "Success", description: "Organization linked successfully." })
        loadData()
        setIsAddOrgModalOpen(false)
      }
    } catch (error: any) {
      pushToast({ title: "Error", description: error.message || "Failed to save organization relationship." })
    }
  }

  const handleDeleteOrganization = (id: string) => {
    if (!confirm("Are you sure you want to remove this organization from the MSP?")) {
      return
    }

    const success = deleteMSPOrganization(id)
    if (success) {
      pushToast({ title: "Success", description: "Organization removed successfully." })
      loadData()
    } else {
      pushToast({ title: "Error", description: "Failed to remove organization." })
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    } catch {
      return dateString
    }
  }

  const filteredOrgs = relatedOrgs.filter((mspOrg) => {
    const org = getOrganizationById(mspOrg.organizationId)
    if (!org) return false

    if (filterData.orgName && !org.name.toLowerCase().includes(filterData.orgName.toLowerCase())) {
      return false
    }

    if (filterData.startDateFrom && mspOrg.agreementStartDate && mspOrg.agreementStartDate < filterData.startDateFrom) {
      return false
    }
    if (filterData.startDateTo && mspOrg.agreementStartDate && mspOrg.agreementStartDate > filterData.startDateTo) {
      return false
    }

    if (filterData.renewalDateFrom && mspOrg.agreementRenewalDate && mspOrg.agreementRenewalDate < filterData.renewalDateFrom) {
      return false
    }
    if (filterData.renewalDateTo && mspOrg.agreementRenewalDate && mspOrg.agreementRenewalDate > filterData.renewalDateTo) {
      return false
    }

    if (filterData.minMSPPercent && (!mspOrg.mspFeePercentage || mspOrg.mspFeePercentage < parseFloat(filterData.minMSPPercent))) {
      return false
    }
    if (filterData.maxMSPPercent && (!mspOrg.mspFeePercentage || mspOrg.mspFeePercentage > parseFloat(filterData.maxMSPPercent))) {
      return false
    }

    if (filterData.minSASPercent && (!mspOrg.sasFeePercentage || mspOrg.sasFeePercentage < parseFloat(filterData.minSASPercent))) {
      return false
    }
    if (filterData.maxSASPercent && (!mspOrg.sasFeePercentage || mspOrg.sasFeePercentage > parseFloat(filterData.maxSASPercent))) {
      return false
    }

    return true
  })

  const totalExpectedMSPRevenue = filteredOrgs.reduce((sum, mspOrg) => {
    return sum + calculateExpectedMSPRevenue(mspOrg)
  }, 0)

  const totalExpectedSASRevenue = filteredOrgs.reduce((sum, mspOrg) => {
    return sum + calculateExpectedSASRevenue(mspOrg)
  }, 0)

  const availableOrgs = allOrganizations.filter((org) => {
    return !relatedOrgs.some((mspo) => mspo.organizationId === org.id)
  })

  if (loading || !msp) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Loading MSP profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section 1: MSP Core Profile Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">MSP Core Profile Information</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">MSP Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="MSP Name"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">MSP Logo</Label>
              <div className="flex items-center gap-4">
                {logo ? (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center border border-border">
                      <span className="text-2xl font-bold text-primary">L</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">MSPCorp_Logo.png</p>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">No Logo</span>
                  </div>
                )}
                <Button variant="outline" size="sm" className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Replace Logo
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Organization Type</Label>
              <Select
                value={formData.organizationType}
                onValueChange={(value) =>
                  setFormData({ ...formData, organizationType: value as "Staffing agency" | "MSP firm" | "Organization staffing office" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Staffing agency">Staffing agency</SelectItem>
                  <SelectItem value="MSP firm">MSP firm</SelectItem>
                  <SelectItem value="Organization staffing office">Organization staffing office</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 2: Headquarters and Billing Addresses */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Headquarters and Billing Addresses</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Headquarters Address</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Street</Label>
                <Input
                  value={formData.headquartersStreet}
                  onChange={(e) => setFormData({ ...formData, headquartersStreet: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">City</Label>
                <Input
                  value={formData.headquartersCity}
                  onChange={(e) => setFormData({ ...formData, headquartersCity: e.target.value })}
                  placeholder="Anytown"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">State</Label>
                <Select
                  value={formData.headquartersState}
                  onValueChange={(value) => setFormData({ ...formData, headquartersState: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="WA">Washington</SelectItem>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                    <SelectItem value="CO">Colorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Zip / Postal Code</Label>
                <Input
                  value={formData.headquartersZip}
                  onChange={(e) => setFormData({ ...formData, headquartersZip: e.target.value })}
                  placeholder="10001"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Country</Label>
                <Select
                  value={formData.headquartersCountry}
                  onValueChange={(value) => setFormData({ ...formData, headquartersCountry: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Mexico">Mexico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                id="billing-same"
                checked={formData.billingSameAsHeadquarters}
                onCheckedChange={handleBillingSameAsHeadquartersChange}
              />
              <Label htmlFor="billing-same" className="text-sm font-medium text-foreground cursor-pointer">
                Billing address same as headquarters
              </Label>
            </div>
            {formData.billingSameAsHeadquarters && (
              <p className="text-sm text-muted-foreground">Billing address copied from Headquarters</p>
            )}

            {!formData.billingSameAsHeadquarters && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Billing Address</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">Street</Label>
                    <Input
                      value={formData.billingStreet}
                      onChange={(e) => setFormData({ ...formData, billingStreet: e.target.value })}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">City</Label>
                    <Input
                      value={formData.billingCity}
                      onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                      placeholder="Anytown"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">State</Label>
                    <Select
                      value={formData.billingState}
                      onValueChange={(value) => setFormData({ ...formData, billingState: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="IL">Illinois</SelectItem>
                        <SelectItem value="WA">Washington</SelectItem>
                        <SelectItem value="MA">Massachusetts</SelectItem>
                        <SelectItem value="CO">Colorado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">Zip / Postal Code</Label>
                    <Input
                      value={formData.billingZip}
                      onChange={(e) => setFormData({ ...formData, billingZip: e.target.value })}
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">Country</Label>
                    <Select
                      value={formData.billingCountry}
                      onValueChange={(value) => setFormData({ ...formData, billingCountry: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Mexico">Mexico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Section 3: Contact and Operational Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Contact and Operational Details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Organization Phone Number</Label>
            <Input
              value={formData.organizationPhone}
              onChange={(e) => setFormData({ ...formData, organizationPhone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Time Zone</Label>
            <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="(UTC-05:00) Eastern Time (US & Canada)">(UTC-05:00) Eastern Time (US & Canada)</SelectItem>
                <SelectItem value="(UTC-06:00) Central Time (US & Canada)">(UTC-06:00) Central Time (US & Canada)</SelectItem>
                <SelectItem value="(UTC-07:00) Mountain Time (US & Canada)">(UTC-07:00) Mountain Time (US & Canada)</SelectItem>
                <SelectItem value="(UTC-08:00) Pacific Time (US & Canada)">(UTC-08:00) Pacific Time (US & Canada)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Section 4: Master Services Agreement */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Master Services Agreement (MSA)</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Master Services Agreement</Label>
            <div className="flex items-center gap-4">
              {formData.msaDocument && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{formData.msaDocument}</span>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View / Download
                  </Button>
                </div>
              )}
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                {formData.msaDocument ? "Replace Document" : "Upload Document"}
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Agreement Renewal Date</Label>
            <Input
              type="date"
              value={formData.agreementRenewalDate}
              onChange={(e) => setFormData({ ...formData, agreementRenewalDate: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Section 5: Financial Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Financial Summary</h2>
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Total Portfolio Annual Spend</Label>
          <div className="text-2xl font-semibold text-primary">
            {formatCurrency(calculateMSPTotalAnnualSpend(mspId))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sum of Estimated Annual Spend from organizations related to this MSP. Updates dynamically.
          </p>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="ph5-button-primary">
          Save Changes
        </Button>
      </div>

      {/* Section 6: Related Organizations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Related Organizations</h2>
          <Button onClick={handleAddOrganization} className="ph5-button-primary">
            Link Selected Organizations
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1 block">Filter by Org Name</Label>
              <Input
                value={filterData.orgName}
                onChange={(e) => setFilterData({ ...filterData, orgName: e.target.value })}
                placeholder="Organization name"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date From</Label>
              <Input
                type="date"
                value={filterData.startDateFrom}
                onChange={(e) => setFilterData({ ...filterData, startDateFrom: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date To</Label>
              <Input
                type="date"
                value={filterData.startDateTo}
                onChange={(e) => setFilterData({ ...filterData, startDateTo: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1 block">Renewal Date From</Label>
              <Input
                type="date"
                value={filterData.renewalDateFrom}
                onChange={(e) => setFilterData({ ...filterData, renewalDateFrom: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1 block">Renewal Date To</Label>
              <Input
                type="date"
                value={filterData.renewalDateTo}
                onChange={(e) => setFilterData({ ...filterData, renewalDateTo: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1 block">Min MSP %</Label>
              <Input
                type="number"
                value={filterData.minMSPPercent}
                onChange={(e) => setFilterData({ ...filterData, minMSPPercent: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1 block">Max MSP %</Label>
              <Input
                type="number"
                value={filterData.maxMSPPercent}
                onChange={(e) => setFilterData({ ...filterData, maxMSPPercent: e.target.value })}
                placeholder="100"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1 block">Min SAS %</Label>
              <Input
                type="number"
                value={filterData.minSASPercent}
                onChange={(e) => setFilterData({ ...filterData, minSASPercent: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1 block">Max SAS %</Label>
              <Input
                type="number"
                value={filterData.maxSASPercent}
                onChange={(e) => setFilterData({ ...filterData, maxSASPercent: e.target.value })}
                placeholder="100"
              />
            </div>
          </div>
        </div>

        {/* Summary Totals */}
        <div className="flex gap-6 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Expected MSP Revenue:</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalExpectedMSPRevenue)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Expected SAS Revenue:</p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalExpectedSASRevenue)}</p>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Organization Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Addendum Agreement</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">MSP Fee %</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">SAS Fee %</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Agreement Start Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Possible Cancellation Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Agreement Renewal Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Expected MSP Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Expected SAS Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Year-to-Date Invoiced Amount</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-muted-foreground">
                    No organizations found. Click "Link Selected Organizations" to add organizations.
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((mspOrg) => {
                  const org = getOrganizationById(mspOrg.organizationId)
                  const expectedMSPRevenue = calculateExpectedMSPRevenue(mspOrg)
                  const expectedSASRevenue = calculateExpectedSASRevenue(mspOrg)

                  return (
                    <tr key={mspOrg.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm text-foreground">{org?.name || "-"}</td>
                      <td className="py-3 px-4 text-sm">
                        {mspOrg.addendumAgreement ? (
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {mspOrg.mspFeePercentage !== undefined ? `${mspOrg.mspFeePercentage.toFixed(2)}` : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {mspOrg.sasFeePercentage !== undefined ? `${mspOrg.sasFeePercentage.toFixed(2)}` : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">{formatDate(mspOrg.agreementStartDate)}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{formatDate(mspOrg.possibleCancellationDate)}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{formatDate(mspOrg.agreementRenewalDate)}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{formatCurrency(expectedMSPRevenue)}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{formatCurrency(expectedSASRevenue)}</td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {formatCurrency(0)} {/* Year-to-date invoiced - would come from invoicing data */}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOrganization(mspOrg)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOrganization(mspOrg.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Organization Modal */}
      {isAddOrgModalOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Link Organization</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsAddOrgModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Organization *</Label>
                <Select
                  value={orgFormData.organizationId}
                  onValueChange={(value) => setOrgFormData({ ...orgFormData, organizationId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrgs.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Addendum Agreement</Label>
                <Input
                  value={orgFormData.addendumAgreement}
                  onChange={(e) => setOrgFormData({ ...orgFormData, addendumAgreement: e.target.value })}
                  placeholder="Document name"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">MSP Fee %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={orgFormData.mspFeePercentage}
                    onChange={(e) => setOrgFormData({ ...orgFormData, mspFeePercentage: e.target.value })}
                    placeholder="5.00"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">SAS Fee %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={orgFormData.sasFeePercentage}
                    onChange={(e) => setOrgFormData({ ...orgFormData, sasFeePercentage: e.target.value })}
                    placeholder="2.00"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Agreement Start Date</Label>
                  <Input
                    type="date"
                    value={orgFormData.agreementStartDate}
                    onChange={(e) => setOrgFormData({ ...orgFormData, agreementStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Agreement Renewal Date</Label>
                  <Input
                    type="date"
                    value={orgFormData.agreementRenewalDate}
                    onChange={(e) => setOrgFormData({ ...orgFormData, agreementRenewalDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Possible Cancellation Date</Label>
                  <Input
                    type="date"
                    value={orgFormData.possibleCancellationDate}
                    onChange={(e) => setOrgFormData({ ...orgFormData, possibleCancellationDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <Button variant="outline" onClick={() => setIsAddOrgModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveOrganization} className="ph5-button-primary">
                Link Organization
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {isEditOrgModalOpen && editingMSPOrg && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Edit Organization Relationship</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsEditOrgModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Organization</Label>
                <Input
                  value={getOrganizationById(orgFormData.organizationId)?.name || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Addendum Agreement</Label>
                <Input
                  value={orgFormData.addendumAgreement}
                  onChange={(e) => setOrgFormData({ ...orgFormData, addendumAgreement: e.target.value })}
                  placeholder="Document name"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">MSP Fee %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={orgFormData.mspFeePercentage}
                    onChange={(e) => setOrgFormData({ ...orgFormData, mspFeePercentage: e.target.value })}
                    placeholder="5.00"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">SAS Fee %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={orgFormData.sasFeePercentage}
                    onChange={(e) => setOrgFormData({ ...orgFormData, sasFeePercentage: e.target.value })}
                    placeholder="2.00"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Agreement Start Date</Label>
                  <Input
                    type="date"
                    value={orgFormData.agreementStartDate}
                    onChange={(e) => setOrgFormData({ ...orgFormData, agreementStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Agreement Renewal Date</Label>
                  <Input
                    type="date"
                    value={orgFormData.agreementRenewalDate}
                    onChange={(e) => setOrgFormData({ ...orgFormData, agreementRenewalDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Possible Cancellation Date</Label>
                  <Input
                    type="date"
                    value={orgFormData.possibleCancellationDate}
                    onChange={(e) => setOrgFormData({ ...orgFormData, possibleCancellationDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <Button variant="outline" onClick={() => setIsEditOrgModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveOrganization} className="ph5-button-primary">
                Update Relationship
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

