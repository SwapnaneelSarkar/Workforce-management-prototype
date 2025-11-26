# Route Map

Complete mapping of all routes in the workforce management platform.

## Landing

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `app/page.tsx` | Role selector landing page |

## Candidate Portal

| Route | Component | Description |
|-------|-----------|-------------|
| `/candidate/login` | `app/candidate/login/page.tsx` | Candidate authentication |
| `/candidate/dashboard` | `app/candidate/dashboard/page.tsx` | Candidate dashboard with stats |
| `/candidate/jobs` | `app/candidate/jobs/page.tsx` | Job marketplace |
| `/candidate/jobs/[id]` | `app/candidate/jobs/[id]/page.tsx` | Job detail page |
| `/candidate/apply` | `app/candidate/apply/page.tsx` | Application readiness checker |
| `/candidate/applications` | `app/candidate/applications/page.tsx` | Application tracker with detail view |
| `/candidate/profile` | `app/candidate/profile/page.tsx` | Profile editor |
| `/candidate/onboarding` | `app/candidate/onboarding/page.tsx` | Multi-step onboarding form |
| `/candidate/documents` | `app/candidate/documents/page.tsx` | Document wallet |
| `/candidate/notifications` | `app/candidate/notifications/page.tsx` | Notification feed |
| `/candidate/settings` | `app/candidate/settings/page.tsx` | Account settings |

## Organization Portal

| Route | Component | Description |
|-------|-----------|-------------|
| `/organization/login` | `app/organization/login/page.tsx` | Organization authentication |
| `/organization/dashboard` | `app/organization/dashboard/page.tsx` | Organization dashboard |
| `/organization/jobs` | `app/organization/jobs/page.tsx` | Requisition list |
| `/organization/jobs/create` | `app/organization/jobs/create/page.tsx` | Job creation wizard |
| `/organization/applications` | `app/organization/applications/page.tsx` | Application list and inline actions |
| `/organization/applications/[id]` | `app/organization/applications/[id]/page.tsx` | Application detail view |
| `/organization/reports` | `app/organization/reports/page.tsx` | Reports dashboard |

## Vendor Portal

| Route | Component | Description |
|-------|-----------|-------------|
| `/vendor/login` | `app/vendor/login/page.tsx` | Vendor authentication |
| `/vendor/vendors` | `app/vendor/vendors/page.tsx` | Vendor list |
| `/vendor/vendors/[id]` | `app/vendor/vendors/[id]/page.tsx` | Vendor detail page |
| `/vendor/bids` | `app/vendor/bids/page.tsx` | Bid submission |
| `/vendor/performance` | `app/vendor/performance/page.tsx` | Performance metrics |

## Route Patterns

### Dynamic Routes
- `[id]` - Dynamic ID parameter for detail pages
- Used in: jobs, applications, vendors

### Nested Routes
- Organization portal has nested routes under `/organization/*`
- Candidate portal has nested routes under `/candidate/*`
- Vendor portal has nested routes under `/vendor/*`

### Layout Structure
Each portal has its own layout (`layout.tsx`) that provides:
- Sidebar navigation
- Portal-specific styling
- Route isolation

## Navigation Flow

### Candidate Journey
1. Login → Dashboard
2. Browse Jobs → Job Detail → Apply
3. Applications → Application Detail → Overview
4. Documents → Upload/Replace

### Organization Journey
1. Login → Dashboard
2. Create Job → Publish
3. Applications → Review → Qualify/Reject/Interview
4. Application Detail → View Documents → Add Notes

### Vendor Journey
1. Login → Vendors
2. View Vendors → Vendor Detail
3. Bids → Submit Bid → Track Status
4. Performance → View Metrics

## Route Guards

Currently, routes are not protected. In production:
- Add authentication checks
- Redirect unauthenticated users
- Role-based access control
- Session management

## SEO Considerations

- All routes are client-side rendered
- Add metadata for better SEO
- Implement proper canonical URLs
- Add structured data
