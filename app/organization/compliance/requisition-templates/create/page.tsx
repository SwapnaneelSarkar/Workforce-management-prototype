"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header, Card, DatePicker } from "@/components/system"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/system"
import {
  getCurrentOrganization,
  addRequisitionTemplate,
  getWalletTemplatesByOrganization,
} from "@/lib/organization-local-db"
import { 
  getAllComplianceListItems,
  getActiveOccupations,
  getOccupationById,
  getOccupationByCode,
  getOccupationSpecialtiesByOccupation,
  getSpecialtyById,
  getAllLocations,
  getOrganizationById,
  getPortalUsers,
  getVendorOrganizationsByOrganizationId,
  getAllVendors,
  getVendorById,
} from "@/lib/admin-local-db"

const TEMPLATE_TYPES = [
  {
    id: "long-term",
    title: "Long-term Order/Assignment",
    summary: "Temporary assignments with defined start and end dates, typically 8-26 weeks",
    bullets: [
      "Fixed duration contract",
      "Defined start and end dates",
      "Full-time or part-time schedules",
      "Compliance requirements tracked",
    ],
  },
  {
    id: "permanent",
    title: "Permanent Job",
    summary: "Full-time permanent positions with no defined end date",
    bullets: [
      "Indefinite employment",
      "Full benefits package",
      "Standard work schedule",
      "Long-term career opportunity",
    ],
  },
  {
    id: "per-diem",
    title: "Per Diem Job",
    summary: "Flexible shifts on an as-needed basis, paid per shift",
    bullets: [
      "Shift-by-shift basis",
      "Flexible scheduling",
      "No guaranteed hours",
      "Quick onboarding",
    ],
  },
]

interface ComplianceListItem {
  id: string
  name: string
  category?: string
  expirationType?: string
}

export default function CreateRequisitionTemplatePage() {
  const router = useRouter()
  const { pushToast } = useToast()

  const [orgId, setOrgId] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState("")
  const [description, setDescription] = useState("")
  const [occupation, setOccupation] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [location, setLocation] = useState("")
  const [department, setDepartment] = useState("")
  const [unitName, setUnitName] = useState("")
  const [status, setStatus] = useState<"Draft" | "Active">("Draft")
  
  // Shift & Schedule fields
  const [startDate, setStartDate] = useState("")
  const [lengthWeeks, setLengthWeeks] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [shiftType, setShiftType] = useState("")
  const [shiftHours, setShiftHours] = useState("")
  const [shiftsPerWeek, setShiftsPerWeek] = useState("")
  const [hoursPerWeek, setHoursPerWeek] = useState("")
  
  // Compensation & Hiring fields
  const [billRate, setBillRate] = useState("")
  const [numberOfPositions, setNumberOfPositions] = useState("")
  const [interviewRequired, setInterviewRequired] = useState("")
  const [hiringManager, setHiringManager] = useState("")
  
  // Compliance template selection
  const [selectedComplianceTemplateId, setSelectedComplianceTemplateId] = useState("")
  const [complianceTemplates, setComplianceTemplates] = useState<Array<{
    id: string
    name: string
    occupation: string
    occupationName: string
    specialty?: string
    specialtyName?: string
    itemCount: number
    requiredCount: number
    status: string
  }>>([])
  
  // Submission Rules fields
  const [workflowType, setWorkflowType] = useState<"client-managed" | "vendor-submission">("vendor-submission")
  const [whoCanSubmit, setWhoCanSubmit] = useState<"all-vendors" | "selected-vendors">("all-vendors")
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([])
  const [internalNotes, setInternalNotes] = useState("")
  const [availableVendors, setAvailableVendors] = useState<Array<{ id: string; name: string }>>([])
  const [items, setItems] = useState<ComplianceListItem[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Options for dropdowns
  const [occupationOptions, setOccupationOptions] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [specialtyOptions, setSpecialtyOptions] = useState<Array<{ id: string; name: string }>>([])
  const [locationOptions, setLocationOptions] = useState<Array<{ id: string; name: string }>>([])
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ id: string; name: string }>>([])
  const [hiringManagerOptions, setHiringManagerOptions] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const current = getCurrentOrganization() || "admin"
      setOrgId(current)
      console.log("[Requisition Template Create] Current organization ID:", current)
      
      // Load compliance list items
      const listItems = getAllComplianceListItems()
      const normalized: ComplianceListItem[] = listItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category || "General",
        expirationType: item.expirationType,
      }))
      setItems(normalized)

      // Load occupations from admin localDB
      const occupations = getActiveOccupations()
      setOccupationOptions(occupations.map(occ => ({ id: occ.id, name: occ.name, code: occ.code })))
      
      // Specialties will be loaded when occupation is selected
      
      // Load organization details from admin localDB
      let organization = getOrganizationById(current)
      console.log("[Requisition Template Create] Current org ID:", current, "Organization found:", organization ? "Yes" : "No")
      
      // If organization is "admin" or not found, use first available organization as fallback
      if (!organization || current === "admin") {
        console.log("[Requisition Template Create] Using fallback - loading from all locations")
        const allLocations = getAllLocations()
        const orgLocations = current === "admin" 
          ? allLocations // For admin, show all locations
          : allLocations.filter(loc => loc.organizationId === current)
        
        console.log("[Requisition Template Create] Locations found:", orgLocations.length)
        setLocationOptions(orgLocations.map(loc => ({ id: loc.id, name: loc.name })))
        
        const departmentMap = new Map<string, { id: string; name: string }>()
        
        orgLocations.forEach(location => {
          console.log("[Requisition Template Create] Location:", location.name, "Departments:", location.departments?.length || 0)
          if (location.departments && Array.isArray(location.departments) && location.departments.length > 0) {
            location.departments.forEach(dept => {
              if (dept && dept.id && dept.name && !departmentMap.has(dept.id)) {
                console.log("[Requisition Template Create] Adding department:", dept.name, dept.id)
                departmentMap.set(dept.id, { id: dept.id, name: dept.name })
              }
            })
          }
        })
        
        const departments = Array.from(departmentMap.values())
        console.log("[Requisition Template Create] Total departments found:", departments.length)
        setDepartmentOptions(departments)
        
        // Load hiring managers from organization users (fallback - all active org users)
        const allOrgUsers = getPortalUsers({ userType: "Organization" })
        const activeUsers = allOrgUsers
          .filter(user => user.status === "Active")
          .map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}${user.title ? ` - ${user.title}` : ""}`
          }))
        console.log("[Requisition Template Create] Fallback - Hiring managers found:", activeUsers.length)
        setHiringManagerOptions(activeUsers)
      } else {
        // Load locations for current organization from organization details
        const orgLocations = organization.locations || []
        console.log("[Requisition Template Create] Organization locations:", orgLocations.length)
        setLocationOptions(orgLocations.map(loc => ({ id: loc.id, name: loc.name })))
        
        // Load departments from organization's locations
        const departmentMap = new Map<string, { id: string; name: string }>()
        
        orgLocations.forEach(location => {
          console.log("[Requisition Template Create] Location:", location.name, "Departments:", location.departments?.length || 0)
          if (location.departments && Array.isArray(location.departments) && location.departments.length > 0) {
            location.departments.forEach(dept => {
              if (dept && dept.id && dept.name && !departmentMap.has(dept.id)) {
                console.log("[Requisition Template Create] Adding department:", dept.name, dept.id)
                departmentMap.set(dept.id, { id: dept.id, name: dept.name })
              }
            })
          }
        })
        
        const departments = Array.from(departmentMap.values())
        console.log("[Requisition Template Create] Total departments found:", departments.length)
        setDepartmentOptions(departments)
        
        // Load hiring managers from organization users
        const orgUsers = getPortalUsers({ userType: "Organization" })
        // Filter users by organization name (groupName matches organization name)
        const orgHiringManagers = orgUsers
          .filter(user => user.status === "Active" && user.groupName === organization.name)
          .map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}${user.title ? ` - ${user.title}` : ""}`
          }))
        console.log("[Requisition Template Create] Hiring managers found:", orgHiringManagers.length, "for org:", organization.name)
        setHiringManagerOptions(orgHiringManagers)
      }
      
      // Load compliance templates (wallet templates) for the organization
      const walletTemplates = getWalletTemplatesByOrganization(current)
      console.log("[Requisition Template Create] Wallet templates found:", walletTemplates.length)
      
      const templatesWithDetails = walletTemplates.map(template => {
        // Get occupation name from code
        const occ = getOccupationByCode(template.occupation || "")
        const occupationName = occ ? occ.name : template.occupation || "—"
        
        // Count items and required items
        const itemCount = template.items?.length || 0
        const requiredCount = template.items?.filter(item => item.requiredAtSubmission)?.length || 0
        
        // Get specialty if available (wallet templates might not have specialty directly)
        // For now, we'll show "—" if no specialty
        const specialtyName = undefined // Wallet templates don't have specialty in the current structure
        
        return {
          id: template.id,
          name: template.name,
          occupation: template.occupation || "",
          occupationName,
          specialty: undefined,
          specialtyName: specialtyName || "—",
          itemCount,
          requiredCount,
          status: "Active", // Wallet templates are always active in current structure
        }
      })
      
      console.log("[Requisition Template Create] Compliance templates processed:", templatesWithDetails.length)
      setComplianceTemplates(templatesWithDetails)
    } catch (error) {
      console.error("[Requisition Template Create] Failed to load data", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Update specialties when occupation changes
  useEffect(() => {
    if (!occupation) {
      setSpecialtyOptions([])
      setSpecialty("")
      return
    }

    try {
      // Get occupation by code
      const selectedOccupation = getOccupationByCode(occupation)
      if (!selectedOccupation) {
        setSpecialtyOptions([])
        setSpecialty("")
        return
      }

      // Get occupation-specialty relationships for this occupation
      const occupationSpecialties = getOccupationSpecialtiesByOccupation(selectedOccupation.id)
      
      // Get specialty details for each relationship
      const specialties = occupationSpecialties
        .map(occSpec => {
          const specialty = getSpecialtyById(occSpec.specialtyId)
          return specialty ? { id: specialty.id, name: specialty.name } : null
        })
        .filter((spec): spec is { id: string; name: string } => spec !== null)

      setSpecialtyOptions(specialties)
      
      // Clear selected specialty if it's not available for the new occupation
      if (specialty && !specialties.find(s => s.id === specialty)) {
        setSpecialty("")
      }
    } catch (error) {
      console.warn("Failed to load specialties for occupation", error)
      setSpecialtyOptions([])
      setSpecialty("")
    }
  }, [occupation, specialty])

  const groupedItems = useMemo(() => {
    const groups: Record<string, ComplianceListItem[]> = {}
    items.forEach((item) => {
      const key = item.category || "Other"
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    return groups
  }, [items])

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleNext = () => {
    if (!selectedType) {
      pushToast({ title: "Validation", description: "Please select a template type", type: "error" })
      return
    }
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSave = () => {
    if (!templateName.trim()) {
      pushToast({ title: "Validation", description: "Template name is required", type: "error" })
      return
    }
    if (!orgId) {
      pushToast({ title: "Error", description: "No organization selected", type: "error" })
      return
    }
    if (!selectedType) {
      pushToast({ title: "Error", description: "Template type is required", type: "error" })
      return
    }
    if (!selectedComplianceTemplateId) {
      pushToast({ title: "Validation", description: "Please select a compliance template", type: "error" })
      return
    }

    setSaving(true)
    try {
      const templateType = TEMPLATE_TYPES.find((t) => t.id === selectedType)?.title || "Requisition"
      
      // Get compliance template items if available
      const complianceTemplate = complianceTemplates.find(t => t.id === selectedComplianceTemplateId)
      const walletTemplate = complianceTemplate ? getWalletTemplatesByOrganization(orgId).find(t => t.id === selectedComplianceTemplateId) : null
      const listItemIds = walletTemplate?.items?.map(item => {
        // Try to find the ComplianceListItem ID by name
        const allItems = getAllComplianceListItems()
        const listItem = allItems.find(li => li.name === item.name && li.isActive)
        return listItem?.id || item.id
      }).filter(Boolean) || []
      
      const created = addRequisitionTemplate(orgId, {
        name: templateName.trim(),
        department: department || templateType,
        occupation: occupation || undefined,
        listItemIds: listItemIds,
        description: description || undefined,
        // Extended fields
        templateType: selectedType,
        specialty: specialty || undefined,
        location: location || undefined,
        unitName: unitName || undefined,
        status: status,
        startDate: startDate || undefined,
        lengthWeeks: lengthWeeks || undefined,
        endDate: endDate || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        shiftType: shiftType || undefined,
        shiftHours: shiftHours || undefined,
        shiftsPerWeek: shiftsPerWeek || undefined,
        hoursPerWeek: hoursPerWeek || undefined,
        billRate: billRate || undefined,
        numberOfPositions: numberOfPositions || undefined,
        interviewRequired: interviewRequired || undefined,
        hiringManager: hiringManager || undefined,
        complianceTemplateId: selectedComplianceTemplateId,
        workflowType: workflowType,
        whoCanSubmit: workflowType === "vendor-submission" ? whoCanSubmit : undefined,
        selectedVendorIds: workflowType === "vendor-submission" && whoCanSubmit === "selected-vendors" ? selectedVendorIds : undefined,
        internalNotes: internalNotes || undefined,
      } as any)

      pushToast({ title: "Template created", description: "Requisition template saved." })
      router.push(`/organization/compliance/requisition-templates/${created.id}`)
    } catch (error) {
      console.error(error)
      pushToast({ title: "Error", description: "Failed to create template", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <Header
          title="Create Requisition Template"
          subtitle="Choose the type of requisition template you want to create"
          breadcrumbs={[
            { label: "Organization", href: "/organization/dashboard" },
            { label: "Compliance", href: "/organization/compliance" },
            { label: "Requisition Templates", href: "/organization/compliance/requisition-templates" },
            { label: "Create" },
          ]}
        />
        <Card>
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        </Card>
      </div>
    )
  }

  // Step 1: Select Type
  if (step === 1) {
  return (
    <div className="space-y-6 p-8">
      <Header
          title="Create Requisition Template – Select Type"
        subtitle="Choose the type of requisition template you want to create"
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance", href: "/organization/compliance" },
          { label: "Requisition Templates", href: "/organization/compliance/requisition-templates" },
          { label: "Create" },
        ]}
      />

        <Card>
          <div className="space-y-4">
            {TEMPLATE_TYPES.map((type) => (
              <button
                key={type.id}
                className={`w-full rounded-lg border p-4 text-left transition hover:border-primary ${selectedType === type.id ? "border-primary bg-primary/5" : "border-border"}`}
                onClick={() => setSelectedType(type.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-base font-semibold text-foreground">{type.title}</p>
                    <p className="text-sm text-muted-foreground">{type.summary}</p>
                  </div>
                  {selectedType === type.id && (
                  <span className="text-sm text-primary font-semibold">Select this type</span>
                  )}
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {type.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-6 border-t border-border mt-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleNext} 
              className="ph5-button-primary" 
              disabled={!selectedType}
            >
              Next
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Step 2: Template Details
  if (step === 2) {
    const selectedTypeTitle = TEMPLATE_TYPES.find((t) => t.id === selectedType)?.title || "Template"
    const typeDisplayName = selectedType === "per-diem" ? "Per Diem" : selectedType === "long-term" ? "Long term assignment" : "Full time job"
    
    return (
    <div className="space-y-6 p-8">
      <Header
        title="View Requisition Template"
        subtitle={`${typeDisplayName}`}
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance", href: "/organization/compliance" },
          { label: "Requisition Templates", href: "/organization/compliance/requisition-templates" },
          { label: "Create" },
        ]}
      />

        <div className="space-y-6">
          <Card title="Template Details">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Template Name *</label>
              <Input 
                value={templateName} 
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., RN - ICU Standard Template"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Occupation *</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select occupation</option>
                {occupationOptions.map((occ) => (
                  <option key={occ.id} value={occ.code}>
                    {occ.name} ({occ.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Specialty *</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select specialty</option>
                {specialtyOptions.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Location *</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select location</option>
                {locationOptions.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={departmentOptions.length === 0}
              >
                <option value="">
                  {departmentOptions.length === 0 ? "No departments available (optional)" : "Select department (optional)"}
                </option>
                {departmentOptions.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {departmentOptions.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No departments found. You can proceed without selecting a department, or add departments to your organization locations in the admin portal.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Unit Name</label>
              <Input 
                value={unitName} 
                onChange={(e) => setUnitName(e.target.value)} 
                placeholder="e.g., ICU - Night Unit" 
              />
              </div>
              <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Job Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter job description..."
                rows={6}
                />
              </div>
              <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="Draft"
                    checked={status === "Draft"}
                    onChange={(e) => setStatus(e.target.value as "Draft" | "Active")}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-foreground">Draft</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="Active"
                    checked={status === "Active"}
                    onChange={(e) => setStatus(e.target.value as "Draft" | "Active")}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-foreground">Active</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setStep(1)}
          >
            Back
          </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
          <Button 
            onClick={() => setStep(3)} 
            className="ph5-button-primary"
            disabled={!templateName.trim() || !occupation || !specialty || !location}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
    )
  }

  // Step 3: Shift & Schedule
  if (step === 3) {
    const selectedTypeTitle = TEMPLATE_TYPES.find((t) => t.id === selectedType)?.title || "Template"
    const typeDisplayName = selectedType === "per-diem" ? "Per Diem" : selectedType === "long-term" ? "Long-term Assignment" : "Full time job"
    
    const shiftTypeOptions = [
      { value: "", label: "Select shift type" },
      { value: "Day", label: "Day" },
      { value: "Evening", label: "Evening" },
      { value: "Night", label: "Night" },
      { value: "Weekend", label: "Weekend" },
      { value: "Flexible", label: "Flexible" },
    ]
    
    return (
    <div className="space-y-6 p-8">
      <Header
        title="View Requisition Template"
        subtitle={`${typeDisplayName}`}
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance", href: "/organization/compliance" },
          { label: "Requisition Templates", href: "/organization/compliance/requisition-templates" },
          { label: "Create" },
        ]}
      />

      <div className="space-y-6">
        <Card title="Shift & Schedule">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Length (Weeks)</label>
              <Input 
                type="number"
                value={lengthWeeks} 
                onChange={(e) => setLengthWeeks(e.target.value)} 
                placeholder="e.g., 13"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Shift Type *</label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {shiftTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Shift Hours</label>
              <Input 
                type="number"
                value={shiftHours} 
                onChange={(e) => setShiftHours(e.target.value)} 
                placeholder="e.g., 12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Shifts Per Week</label>
              <Input 
                type="number"
                value={shiftsPerWeek} 
                onChange={(e) => setShiftsPerWeek(e.target.value)} 
                placeholder="e.g., 3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Hours Per Week</label>
              <Input 
                type="number"
                value={hoursPerWeek} 
                onChange={(e) => setHoursPerWeek(e.target.value)} 
                placeholder="e.g., 36"
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setStep(2)}
          >
            Back
          </Button>
          <Button 
            onClick={() => setStep(4)} 
            className="ph5-button-primary"
            disabled={!startDate || !endDate || !shiftType}
          >
            Next
                </Button>
        </div>
      </div>
    </div>
    )
  }

  // Step 4: Compensation & Hiring
  if (step === 4) {
    const selectedTypeTitle = TEMPLATE_TYPES.find((t) => t.id === selectedType)?.title || "Template"
    const typeDisplayName = selectedType === "per-diem" ? "Per Diem" : selectedType === "long-term" ? "Long-term Assignment" : "Full time job"
    
    const interviewRequiredOptions = [
      { value: "", label: "Select option" },
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" },
    ]
    
    const hiringManagerSelectOptions = [
      { value: "", label: "Select manager" },
      ...hiringManagerOptions.map(manager => ({
        value: manager.id,
        label: manager.name
      }))
    ]
    
    return (
    <div className="space-y-6 p-8">
      <Header
        title="View Requisition Template"
        subtitle={`${typeDisplayName}`}
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance", href: "/organization/compliance" },
          { label: "Requisition Templates", href: "/organization/compliance/requisition-templates" },
          { label: "Create" },
        ]}
      />

      <div className="space-y-6">
        <Card title="Compensation & Hiring">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bill Rate *</label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number"
                  step="0.01"
                  value={billRate} 
                  onChange={(e) => setBillRate(e.target.value)} 
                  placeholder="95.00"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">per hour</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Number of Positions *</label>
              <Input 
                type="number"
                value={numberOfPositions} 
                onChange={(e) => setNumberOfPositions(e.target.value)} 
                placeholder="e.g., 2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Interview Required</label>
              <select
                value={interviewRequired}
                onChange={(e) => setInterviewRequired(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {interviewRequiredOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Hiring Manager</label>
              <select
                value={hiringManager}
                onChange={(e) => setHiringManager(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={hiringManagerOptions.length === 0}
              >
                {hiringManagerSelectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {hiringManagerOptions.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No hiring managers found. Add users to your organization in the admin portal.
                </p>
              )}
              </div>
            </div>
          </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setStep(3)}
          >
            Back
          </Button>
          <Button 
            onClick={() => setStep(5)} 
            className="ph5-button-primary"
            disabled={!billRate || !numberOfPositions}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
    )
  }

  // Step 5: Compliance
  if (step === 5) {
    const selectedTypeTitle = TEMPLATE_TYPES.find((t) => t.id === selectedType)?.title || "Template"
    const typeDisplayName = selectedType === "per-diem" ? "Per Diem" : selectedType === "long-term" ? "Long-term Assignment" : "Full time job"
    
    return (
    <div className="space-y-6 p-8">
      <Header
        title="View Requisition Template"
        subtitle={`${typeDisplayName}`}
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance", href: "/organization/compliance" },
          { label: "Requisition Templates", href: "/organization/compliance/requisition-templates" },
          { label: "Create" },
        ]}
      />

      <div className="space-y-6">
        <Card title="Compliance">
            <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Compliance Template *</label>
              <p className="text-xs text-muted-foreground mb-3">
                Select a compliance template that defines required documents for candidates
              </p>
              <div className="space-y-2">
                {complianceTemplates.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No compliance templates found. Create compliance templates in the Compliance Wallet Templates section.
                  </p>
                ) : (
                  complianceTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedComplianceTemplateId(template.id)}
                      className={`w-full rounded-lg border p-4 text-left transition hover:border-primary ${
                        selectedComplianceTemplateId === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-base font-semibold text-foreground">{template.name}</p>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              template.status === "Active" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            }`}>
                              {template.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-2">
                            <div>
                              <span className="font-medium">Occupation:</span> {template.occupationName}
                            </div>
                            <div>
                              <span className="font-medium">Specialty:</span> {template.specialtyName}
                            </div>
                            <div>
                              <span className="font-medium">{template.itemCount} items</span>
                            </div>
                        <div>
                              <span className="font-medium">{template.requiredCount} required</span>
                            </div>
                          </div>
                        </div>
                        {selectedComplianceTemplateId === template.id && (
                          <span className="text-sm text-primary font-semibold ml-4">Selected</span>
                        )}
                  </div>
                    </button>
                  ))
                )}
                </div>
            </div>
            </div>
          </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setStep(4)}
          >
            Back
          </Button>
          <Button 
            onClick={() => setStep(6)} 
            className="ph5-button-primary"
            disabled={!selectedComplianceTemplateId}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

  // Step 6: Submission Rules
  if (step === 6) {
    const selectedTypeTitle = TEMPLATE_TYPES.find((t) => t.id === selectedType)?.title || "Template"
    const typeDisplayName = selectedType === "per-diem" ? "Per Diem" : selectedType === "long-term" ? "Long-term Assignment" : "Full time job"
    
    return (
    <div className="space-y-6 p-8">
      <Header
        title="View Requisition Template"
        subtitle={`${typeDisplayName}`}
        breadcrumbs={[
          { label: "Organization", href: "/organization/dashboard" },
          { label: "Compliance", href: "/organization/compliance" },
          { label: "Requisition Templates", href: "/organization/compliance/requisition-templates" },
          { label: "Create" },
        ]}
      />

      <div className="space-y-6">
        <Card title="Submission Rules">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Workflow Type</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                  <input
                    type="radio"
                    name="workflowType"
                    value="client-managed"
                    checked={workflowType === "client-managed"}
                    onChange={(e) => setWorkflowType(e.target.value as "client-managed" | "vendor-submission")}
                    className="w-4 h-4 text-primary"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Client Managed</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                  <input
                    type="radio"
                    name="workflowType"
                    value="vendor-submission"
                    checked={workflowType === "vendor-submission"}
                    onChange={(e) => setWorkflowType(e.target.value as "client-managed" | "vendor-submission")}
                    className="w-4 h-4 text-primary"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Vendor → Candidate Submission</p>
                  </div>
                </label>
              </div>
            </div>

            {workflowType === "vendor-submission" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Who Can Submit</label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                      <input
                        type="radio"
                        name="whoCanSubmit"
                        value="all-vendors"
                        checked={whoCanSubmit === "all-vendors"}
                        onChange={(e) => {
                          setWhoCanSubmit(e.target.value as "all-vendors" | "selected-vendors")
                          if (e.target.value === "all-vendors") {
                            setSelectedVendorIds([])
                          }
                        }}
                        className="w-4 h-4 text-primary mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">All Vendors</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Any approved vendor in your network can submit candidates
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                      <input
                        type="radio"
                        name="whoCanSubmit"
                        value="selected-vendors"
                        checked={whoCanSubmit === "selected-vendors"}
                        onChange={(e) => setWhoCanSubmit(e.target.value as "all-vendors" | "selected-vendors")}
                        className="w-4 h-4 text-primary mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Selected Vendors</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Choose specific vendors who can submit
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {whoCanSubmit === "selected-vendors" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Select Vendors</label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Choose one or more vendors. Only selected vendors will be able to view and submit candidates to this requisition.
                    </p>
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                      {availableVendors.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No vendors found associated with your organization.
                        </p>
                      ) : (
                        availableVendors.map((vendor) => (
                          <label
                            key={vendor.id}
                            className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedVendorIds.includes(vendor.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedVendorIds([...selectedVendorIds, vendor.id])
                                } else {
                                  setSelectedVendorIds(selectedVendorIds.filter(id => id !== vendor.id))
                                }
                              }}
                            />
                            <span className="text-sm text-foreground">{vendor.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Internal Notes</label>
              <p className="text-xs text-muted-foreground mb-2">
                Vendors cannot see this
              </p>
              <Textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add internal notes..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setStep(5)}
          >
            Back
          </Button>
          <Button 
            onClick={handleSave} 
            className="ph5-button-primary"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
    )
  }

  // Default fallback
  return null
}


