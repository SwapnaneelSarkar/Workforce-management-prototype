# Data Model Reference

Complete reference for all data types and structures used in the workforce management platform.

## Core Types

### CandidateProfile
```typescript
{
  id: string
  name: string
  email: string
  phone: string
  role: string
  location: string
  avatar: string
  shiftPreference: string
  experienceYears: number
  specialties: string[]
  skills: string[]
  summary: string
  vendorPartner?: string
  availabilityNotes?: string
  profileCompletePct: number
  requiredDocuments: string[]
  documents: CandidateDocument[]
}
```

### CandidateDocument
```typescript
{
  id: string
  name: string
  type: string
  status: "Completed" | "Pending" | "Expired"
  expiresOn: string
  lastUpdated: string
}
```

### Job
```typescript
{
  id: string
  title: string
  location: string
  department: string
  unit: string
  shift: string
  hours: string
  billRate: string
  status: "Open" | "Closed" | "Draft"
  description: string
  requirements: string[]
  tags: string[]
}
```

### Application
```typescript
{
  id: string
  jobId: string
  candidateId: string
  candidateName: string
  status: "Submitted" | "Qualified" | "Interview" | "Offer" | "Accepted" | "Rejected"
  submittedAt: string
  documentStatus: "Complete" | "Missing" | "Pending"
  vendorName?: string
  matchScore?: number
  submittedRelative?: string
}
```

### ApplicationInsight
```typescript
{
  applicationId: string
  candidateId: string
  contact: { email: string; phone: string }
  vendorName?: string
  highlights: string[]
  compliance: ComplianceItem[]
  attachments: ApplicationAttachment[]
  notes: ApplicationNote[]
}
```

### Vendor
```typescript
{
  id: string
  name: string
  tier: "Premier" | "Preferred" | "Approved"
  certifications: string[]
  contact: string
  kpis: {
    fillRate: number
    responseTimeHours: number
    candidatesSupplied: number
  }
}
```

### VendorDetail
```typescript
{
  vendorId: string
  description: string
  metadata: {
    founded: string
    headcount: number
    coverage: string[]
    avgFillDays: number
  }
  certificationsDetailed: Certification[]
  agreements: VendorAgreement[]
  contacts: VendorContact[]
  bids: VendorBid[]
  documents: VendorDocument[]
}
```

### VendorBid
```typescript
{
  id: string
  vendorName: string
  jobId: string
  status: "Draft" | "Submitted" | "Awarded"
  submittedAt?: string
  rate: string
  availability: string
}
```

### Notification
```typescript
{
  id: string
  title: string
  subtitle: string
  time: string
  type: "job" | "system"
  read?: boolean
}
```

## Data Relationships

### Candidate → Documents
- One-to-many relationship
- Documents linked via `candidate.documents[]`

### Job → Applications
- One-to-many relationship
- Applications linked via `application.jobId`

### Application → Candidate
- Many-to-one relationship
- Linked via `application.candidateId`

### Application → Insight
- One-to-one relationship
- Linked via `insight.applicationId`

### Vendor → Bids
- One-to-many relationship
- Bids filtered by `bid.vendorName`

### Vendor → Details
- One-to-one relationship
- Linked via `detail.vendorId`

## State Management

### DemoDataProvider Structure
```typescript
{
  candidate: {
    profile: CandidateProfile
    documents: CandidateDocument[]
    notificationPrefs: { email: boolean; sms: boolean; push: boolean }
    onboarding: OnboardingState
    applications: Application[]
    notifications: Notification[]
  }
  organization: {
    jobs: Job[]
    applications: Application[]
    insights: ApplicationInsight[]
    candidates: CandidateProfile[]
  }
  vendor: {
    vendors: Vendor[]
    bids: VendorBid[]
    kpis: KPI[]
    leaderboard: VendorLeaderboardRow[]
    details: VendorDetail[]
  }
  actions: {
    // All mutation functions
  }
}
```

## Data Flow

1. **Initial Load**: Mock data loaded from `lib/mock-data.ts`
2. **State Update**: Actions mutate state via `DemoDataProvider`
3. **UI Update**: React re-renders based on state changes
4. **Simulated Delay**: Async actions include `simulateDelay()` for realism

## Computed Properties

### Match Score
- Calculated from candidate skills, documents, and job requirements
- Formula: `base + requirementMatches * 6 + skillMatches * 4 + specialtyBonus + completionBonus - docPenalty`

### Vendor Leaderboard
- Computed from vendor bids and KPIs
- Score: `awarded * 8 + fillRate * 0.35 + (100 - responseTimeHours * 5) * 0.3`

### Enriched Timestamps
- Relative time formatting (e.g., "2h ago", "Yesterday • 14:05")
- Formatted via `formatDateTime()` helper

## Data Validation

Currently, validation is minimal. In production:
- Add schema validation (Zod/Yup)
- Validate on form submission
- Show inline error messages
- Prevent invalid state transitions

## Data Persistence

Currently, all data is in-memory. In production:
- Replace with API calls
- Add caching layer
- Implement optimistic updates
- Handle offline scenarios
