# Workforce Management Platform — Feature Documentation

This document captures the current, code-backed feature set for the multi-tenant workforce management prototype that lives in `/Users/swapnaneelsarkar/Downloads/workforce-management-ui`. Every route under `app/` has been reviewed and summarized below.

---

## Project Overview
- Next.js 14 / React app with three distinct workspaces (candidate, organization, vendor) plus a neutral landing page.
- Tailwind-esque utility classes plus handcrafted components in `components/system` drive a consistent PH5 visual language.
- All business state comes from `lib/mock-data.ts` and is proxied through `components/providers/demo-data-provider.tsx`, enabling realistic read/write flows without a backend.
- Lucide icons, toast notifications, modals, progress indicators, tables, and filters are used extensively to simulate day-to-day staffing workflows.

---

## Technology & Architecture
- **Routing**: App Router with nested layouts per portal (`app/candidate/layout.tsx`, etc.) so each area has isolated navigation chrome.
- **State**: `DemoDataProvider` exposes candidate, organization, and vendor slices plus imperative helpers (upload docs, create jobs, update applications, submit bids, etc.). Each helper simulates latency via `simulateDelay` for UI realism.
- **UI Kit**: `components/system` exports `Header`, `Card`, `MultiStepForm`, `Modal`, `FloatingActionButton`, `SkeletonLoader`, `StatusChip`, `FAB`, `DatePicker`, etc., ensuring consistent spacing, typography, and feedback affordances across routes.
- **Styling**: Global tokens live in `app/globals.css` with semantic classnames (`ph5-button-primary`, `ph5-label`, etc.) to keep the grayscale foundation intact while allowing accent colors (#3182CE primary).

---

## Entry Experience
- **Landing page (`/app/page.tsx`)**: Three role cards (Candidate Workspace, Organization Control Center, Vendor Performance Hub) advertise key stats, icons, and CTAs that navigate to their respective login flows. Hero copy explains the multi-tenant concept, while the footer links to this documentation for quick onboarding.

---

## Layouts & Navigation
- **Root layout (`app/layout.tsx`)**: Applies Geist fonts, locks the UI in light theme by default, injects `AppProviders`. Every page is wrapped with Theme, Demo Data, and Toast providers via `components/providers/app-providers.tsx`.
- **Portal layouts (`app/candidate/layout.tsx`, `app/organization/layout.tsx`, `app/vendor/layout.tsx`)**: Render sidebar navigation (using `components/system/Sidebar`) with role-specific navigation links pulled from `lib/navigation-links.ts`. Login routes bypass the sidebar to provide focused authentication screens.
- **Navigation helpers (`lib/navigation-links.ts`, `lib/use-navigation.ts`)**: Centralize route metadata for the sidebar and expose `useNavigation()` helpers for imperative route changes (e.g., `goCandidateJobDetail(id)`).

---

## Demo Data & Actions
- **Provider surface area**: `components/providers/demo-data-provider.tsx` wraps every page (via `components/providers/app-providers.tsx`) so routes can call `useDemoData()`.
- **Candidate slice**: profile, documents, notification prefs, onboarding answers, required document list, applications scoped to the signed-in candidate, and notification feed.
- **Organization slice**: jobs/requisitions, every application in the system, application insights, and the candidate pool.
- **Vendor slice**: vendor roster, submitted bids, leaderboard KPIs.
- **Latency simulation**: `simulateDelay(min, max)` introduces 300–900 ms delays for async helpers so loading states feel real.

### DemoDataProvider API (functions & consumers)

| Function | Purpose | Primary screens invoking it |
| --- | --- | --- |
| `uploadDocument({ name, type })` | Creates a pending credential with default expiry + timestamps. | `/candidate/documents`, `/candidate/jobs/[id]` (missing doc modal) |
| `replaceDocument(docId, updates)` | Updates doc status/date (used to mark completed). | `/candidate/documents` |
| `updateNotificationPrefs(partial)` | Persists email/SMS/push toggles. | `/candidate/settings` |
| `updateEmail(email)` | Writes profile email after validation. | `/candidate/settings` |
| `saveOnboardingStep(step, data)` | Saves answers + auto-adds required docs mapped via `onboardingDocumentMappings`. | `/candidate/onboarding` |
| `submitJobApplication(jobId)` | Creates application stub, pushes notification, prevents duplicates. | `/candidate/jobs/[id]`, `/candidate/apply` |
| `createJob(payload)` | Creates a new requisition with core job fields, tags, optional `status`, and optional `complianceTemplateId`. | `/organization/jobs/create` |
| `updateJob(id, updates)` | Updates an existing job (e.g., toggling status Draft/Open or changing details). | `/organization/jobs` |
| `updateApplicationStatus(id, status)` | Updates the current stage for an application. | `/organization/applications` |
| `rejectApplication(id)` | Shortcut to mark status `Rejected`. | `/organization/applications` |
| `submitVendorBid({ jobId, vendorName, rate, availability })` | Stores vendor submissions with status `Submitted`. | `/vendor/bids` |

Every route uses `useDemoData()` to destructure the slice(s) it needs (`const { candidate, organization, vendor, actions } = useDemoData()`), making the coupling between UI features and data functions explicit.

---

---

## Candidate Portal (All Routes)

### `/candidate/login`
- Split hero + secure login card, with stat tiles and benefit list describing the portal.
- Controlled form defaults to mock credentials, exposes remember-me checkbox, forgot password link, and security notice.
- On submit, validates fields, shows `Authenticating...`, then redirects to `/candidate/dashboard`.

### `/candidate/dashboard`
- Uses `Header` with breadcrumbs plus three quick-action cards (browse jobs, upload credentials, check applications).
- Onboarding progress wheel (`CircularProgress`) visualizes completed documents vs. total, with CTA buttons to onboarding/documents flows.
- Profile snapshot displays key candidate metadata.
- Recent activity list surfaces the latest five notifications.
- Document wallet preview shows expiring documents with `StatusChip`s and `View full wallet` link.

### `/candidate/jobs`
- Search input + department filter (chip counter reflects filtered result count) backed by `useMemo`.
- Loading state uses `SkeletonLoader`; results render as responsive cards with department labels, tags, bill-rate info tags, and status chips.
- Each card links to `/candidate/jobs/[id]`; `FloatingActionButton` resets filters on mobile.

### `/candidate/jobs/[id]`
- Job header displays breadcrumbs and dynamic CTA button (Apply vs. Review requirements) that calls `submitJobApplication`.
- Info tile grid highlights department/unit/shift/hours/bill rate with highlighted styling for monetary values.
- Requirement checklist compares job requirements to candidate documents, showing `Completed`/`Missing`.
- Apply sidebar enforces missing-doc gating, shows `StatusChip`s for each requirement, and offers upload shortcuts (which call `uploadDocument`). A contract info card summarizes dates, location, and language preferences.

### `/candidate/apply`
- Three checklist cards (Profile, Document wallet, Onboarding) compute readiness in real time from provider data.
- Status chip toggles between Ready / Not ready depending on thresholds, with CTA to browse jobs once all checks are green.

### `/candidate/profile`
- Editable personal information form seeded from `mockCandidateProfile`.
- Professional info panel for role/location/shift preference.
- Action list (“Provide 2 recent references”, etc.) toggles details with `selectedAction` state; CTA button opens stub action card.

### `/candidate/onboarding`
- Four-step `MultiStepForm` (personal, work history, skills, availability) wired to `saveOnboardingStep`.
- Uses shared `InputField` plus `DatePicker` for availability start date; Save button shows busy state while action runs.
- Required documents panel lists `candidate.onboarding.requiredDocuments` with `StatusChip` tone “Needed”.

### `/candidate/documents`
- Upload form with name + type select; `Upload` button disabled until populated and uses `uploadDocument`.
- Wallet grid shows every credential with status chip, last updated, expiry pill colored by tone, and Replace button calling `replaceDocument`.
- Skeleton loader simulates fetch delay on first mount.


### `/candidate/notifications`
- Header includes “Mark all read” action that toggles loading to show skeleton.
- Filter select adjusts `typeFilter`, and `StatusChip` reflects count for the selection.
- Digest preferences grid lists job/system categories with icon and “Enabled” text (static for now).

### `/candidate/settings`
- Notification preferences card exposes toggles for email/SMS/push; hooks into `updateNotificationPrefs`.
- Change email card shows current email, new/confirm inputs, and Save button that validates and calls `updateEmail` with success/error toasts.

---

## Organization Portal (All Routes)

### `/organization/login`
- Two-step email + OTP flow tailored for hiring teams, with `Building2` iconography and explainer copy about passwordless access.
- Step 1 collects a work email and sends a demo OTP; Step 2 validates any 6-digit code and then redirects to `/organization/dashboard`, with inline error messaging and toast confirmation for the sent OTP.

### `/organization/dashboard`
- Simple KPI card grid summarizing total jobs, draft jobs, published jobs, and total applications from provider state.
- Quick-access actions let users create a new job or navigate to the jobs list.

### `/organization/jobs`
- Header and action bar let users create jobs and toggle sort order between creation sequence and status.
- Main table lists each job with status pill (Draft vs. Published), attached compliance template name, and application counts pulled from provider data.
- Row actions include deep link to `/organization/applications?jobId={id}` plus Publish/Unpublish toggle wired to `actions.updateJob`.

### `/organization/jobs/create`
- Single-page job creation form for title, location select, pay range, optional description, and required compliance template.
- Validation ensures title, location, pay range, and template are present before calling `actions.createJob`; errors show inline above the form.
- Supports “Save as draft” and “Publish job” flows, which map to `Draft` vs `Open` status and redirect back to `/organization/jobs` after saving.

### `/organization/applications`
- Filterable-by-job applications list (via `jobId` query param) showing only candidate identity and applied date.
- Inline actions allow Accept and Reject flows wired to `actions.updateApplicationStatus` and `actions.rejectApplication`.
- “View candidate” opens a modal with basic profile info, a document wallet section using `StatusChip`s, and a “Missing compliance items” checklist based on the job’s attached compliance template.

### `/organization/reports`
- Placeholder only for this MVP; route exists but currently returns `null` with no UI rendered.

### `/organization/compliance/templates`
- Workspace for managing compliance checklist templates, including creating, selecting, and editing templates and their items.
- Template details panel supports name/description editing and item-level configuration (type, expiration, and whether required at submission).

---

## Vendor Module (All Routes)

### `/vendor/login`
- Mirrored login hero with vendor-specific copy, stats, and iconography (`Factory`). Form logic matches other portals and redirects to `/vendor/vendors`.

### `/vendor/vendors`
- Summary stats for active vendors, total clients, and distinct services.
- Two-column layout: table of vendors (click to select) and sticky detail panel showing contact info, certifications, client count, mock document list, and action buttons (Edit, Upload Document). Upload mode exposes file-name input and stub button.

### `/vendor/vendors/[id]`
- Detail page with editable vendor metadata, certifications, agreements, contacts, document list, and contextual actions (contact vendor, save metadata). Toast feedback confirms saves.

### `/vendor/bids`
- “Available jobs” card lists first six organization jobs with bill-rate chips and Submit bid button (opens modal).
- Modal collects hourly rate + availability notes, then calls `submitVendorBid`.
- Submitted bids card shows vendor submissions from provider state with status chips.

### `/vendor/performance`
- KPI cards (pulled from `vendorPerformanceKpis`) summarize metrics like active vendors, response time, candidates supplied, and active requisitions.
- Vendor snapshot list and leaderboard bars visualize partner performance, with progress bars sized to aggregate scores.

---

## Organization Portal (Routes & Features)

| Route | Highlights |
| --- | --- |
| `/organization/login` | Two-step passwordless login (email + 6-digit OTP) with hiring-team copy, toast confirmation, and redirect to dashboard. |
| `/organization/dashboard` | Simple KPI tiles for total jobs, draft jobs, published jobs, and applications, plus actions to create or view jobs. |
| `/organization/jobs` | Sortable jobs table (by creation or status) with status badges, compliance template labels, application counts, and publish/unpublish toggle. |
| `/organization/jobs/create` | Single-screen job form capturing basics plus a required compliance template, with Save as draft vs Publish actions. |
| `/organization/applications` | Applications list filterable by job, with accept/reject actions and a candidate detail modal that surfaces documents and missing compliance checklist items. |
| `/organization/reports` | Placeholder route for future reporting; currently returns `null` with no UI rendered. |
| `/organization/compliance/templates` | Compliance template workspace for creating, editing, and maintaining reusable checklist templates and their items. |

---

## Vendor Module (Routes & Features)

| Route | Highlights |
| --- | --- |
| `/vendor/login` | Vendor-specific hero copy, secure login form, redirect to vendor workspace, parity with other login experiences. |
| `/vendor/vendors` | Vendor list with stats (active vendors, total clients, services), selectable rows powering a sticky detail panel (contact info, certifications, client count, documents pulled from `mockVendorDocuments`, upload form). |
| `/vendor/vendors/[id]` | Detail page with vendor profile metadata editing, certifications, agreements, documents, and contextual actions (contact vendor, save metadata). |
| `/vendor/bids` | Available jobs list with bill-rate chips, submit-bid modal (rate + availability) wired to `submitVendorBid`, submitted bids list referencing provider state. |
| `/vendor/performance` | KPI cards, vendor snapshot list, partner leaderboard bars displaying aggregate performance scores. |

---

## Shared UI / Design System

### Color & Typography
- Primary slate #2D3748 text palette with accent blue #3182CE, success green #48BB78, warning orange #ED8936, error red #F56565, and soft neutral backgrounds #F7F7F9 / #EDF2F7.
- Typography lockups: 28px titles, 18px section headers, 14px body, 12px supporting labels consistent via utility classes (`ph5-label`, `ph5-page-title`).

### Components & Patterns
- **Header**: Standardized page title, subtitle, breadcrumbs, optional action buttons.
- **Card**: Base container with optional title/subtitle/action slot; reused for stats, forms, and tables.
- **StatusChip**: Tone variants (`success`, `warning`, `danger`, `info`, `neutral`) communicate state across portals.
- **MultiStepForm**: Stepper UI with Next/Back/Save hooks used by candidate onboarding and org job creation.
- **Modal**: Accessible overlay with title/description, used for missing-doc warnings, schedule interview, reject confirmation, and bid submission.
- **SkeletonLoader**: Provides shimmer placeholders while fake latency resolves (documents, jobs, applications).
- **FloatingActionButton**: On job marketplace for quick filter reset.
- **Toast system**: `useToast` surfaces success/error info after uploads, job submissions, scheduling actions, etc.
- **Tables & Lists**: `ph5-table` classes enforce zebra rows, header styling, padding, and responsive overflow wrappers.
- **Forms**: Consistent label placement, rounded inputs, select dropdowns, toggles (Shadcn `Switch`), CTA buttons with busy/disabled states.

---

## Component Inventory

### System Layer (`components/system/*`)
- `avatar`, `avatar-dropdown`: reusable identity chips and dropdown menu used in headers.
- `breadcrumbs`: builds breadcrumb trail consumed by every `Header`.
- `card`: shared shell around Shadcn card primitives with PH5 spacing.
- `date-picker`: wrapper around calendar input used in onboarding.
- `dropdown`: stylized action menus (e.g., organization dashboard table overflow).
- `expandable-row`: handles accordion-row logic for tables that expand (e.g., requisitions).
- `fab`: floating action button logic for mobile filter reset.
- `form-field`: label + validation helper used inside custom forms.
- `header`: hero block with breadcrumbs, metadata, action buttons.
- `modal`: accessible dialog container used across portals.
- `multi-step-form`: orchestrates steps, CTA buttons, disabled states.
- `progress-bar`: base progress visuals reused for onboarding and match scores.
- `skeleton-loader`: shimmer placeholder generator.
- `sidebar`: nav scaffolding for sections that would one day have persistent menus.
- `status-chip`: tonal pill component for statuses (success/warning/danger/info/neutral).
- `table`: base table markup + styling helpers.
- `toast`: provider + hook integration (aliases `components/system/toast.tsx` & `components/ui/sonner.tsx`).

All of the above are re-exported via `components/system/index.ts` for ergonomic imports (`import { Header, Card } from "@/components/system"`).

### UI Primitives (`components/ui/*`)
Borrowed/adapted from Shadcn, these primitives support edge cases beyond the PH5 core. The project ships the full set so designers can unblock future screens:

`accordion.tsx`, `alert.tsx`, `alert-dialog.tsx`, `aspect-ratio.tsx`, `avatar.tsx`, `badge.tsx`, `breadcrumb.tsx`, `button.tsx`, `button-group.tsx`, `calendar.tsx`, `card.tsx`, `carousel.tsx`, `chart.tsx`, `checkbox.tsx`, `collapsible.tsx`, `command.tsx`, `context-menu.tsx`, `dialog.tsx`, `drawer.tsx`, `dropdown-menu.tsx`, `empty.tsx`, `field.tsx`, `form.tsx`, `hover-card.tsx`, `input.tsx`, `input-group.tsx`, `input-otp.tsx`, `item.tsx`, `kbd.tsx`, `label.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `pagination.tsx`, `popover.tsx`, `progress.tsx`, `radio-group.tsx`, `resizable.tsx`, `scroll-area.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `sidebar.tsx`, `skeleton.tsx`, `slider.tsx`, `spinner.tsx`, `switch.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`, `toast.tsx`, `toggle.tsx`, `toggle-group.tsx`, `tooltip.tsx`, `use-mobile.tsx`, `use-toast.ts`, plus helpers like `button.tsx` (PH5 variant) and `sonner.tsx` (toast host).

Each primitive exports typed props so custom system components can wrap them without re-implementing accessibility attributes.

### Providers
- `components/providers/app-providers.tsx`: wraps the app with `DemoDataProvider`, `ThemeProvider`, and toast host so every route has access to theme + data context.
- `components/theme-provider.tsx`: controls light/dark/system theme toggles (currently defaulted to light to match grayscale UI).

---

## Hooks & Utilities
- `hooks/use-mobile.ts`: media-query helper that reports if the viewport is below the configured breakpoint; used to alter layouts (e.g., FAB vs. inline actions).
- `hooks/use-toast.ts`: light wrapper returning the `useToast` hook from the Shadcn system.
- `components/system/toast.tsx` + `components/ui/sonner.tsx`: integrate the hook with the toast viewport (`<Toaster />`) rendered near the root layout.

---

### Interactive States
- Buttons show “Uploading…/Submitting…/Saving…” text while awaiting provider promises.
- Toggle chips and filters use color + iconography (e.g., bell icon for notification preferences) so color is not the sole indicator.
- Tab filters (applications) highlight the active state with solid background; others use muted pills.

---

## Navigation Map (Actual Routes)

### Landing
- `/` — role selector + documentation link.

### Candidate
- `/candidate/login`
- `/candidate/dashboard`
- `/candidate/jobs`
- `/candidate/jobs/[id]`
- `/candidate/apply`
- `/candidate/profile`
- `/candidate/onboarding`
- `/candidate/documents`
- `/candidate/applications`
- `/candidate/notifications`
- `/candidate/settings`

### Organization
- `/organization/login`
- `/organization/dashboard`
- `/organization/jobs`
- `/organization/jobs/create`
- `/organization/applications`
- `/organization/reports`
- `/organization/compliance/templates`

### Vendor
- `/vendor/login`
- `/vendor/vendors`
- `/vendor/vendors/[id]`
- `/vendor/bids`
- `/vendor/performance`

---

## Mock Data Collections
- **Candidates**: Baseline profile + documents + onboarding requirements.
- **Jobs / Requisitions**: Department/unit/shift/rate metadata plus requirements & tag lists.
- **Applications**: Candidate/job pairing with status, match score, vendor attribution, submitted timestamps.
- **Notifications**: Feeds for dashboard/activity cards.
- **Vendors & Bids**: Vendor roster, certifications, KPIs, submitted bids.
- **Onboarding Document Mappings**: Links questionnaire answers to required docs to keep wallet in sync.

---

## Frontend-Only Implementation Notes
- React hooks (`useState`, `useMemo`, `useCallback`) manage local UI and provider state.
- No persistence layer—refresh resets to mock defaults unless provider state remains in memory.
- Async interactions use `simulateDelay` to mimic network latency, giving progress states a reason to exist.
- File uploads, emails, and SMS actions are simulated via provider actions + toasts; no external APIs are called.

---

## Accessibility & Quality
- Semantic elements (`header`, `section`, `table`, `button`, `label/input`) are consistently applied.
- ARIA labels on icons/buttons where text alone would be ambiguous (filters, FAB, upload buttons).
- Focus-visible outlines maintained on interactive components, especially list buttons and pills.
- Status communicates via text/icons plus color to avoid chromatic-only cues.

---

## Known Gaps & Follow-Ups
- `/vendor/vendors/[id]` saves metadata locally only—no persistence or validation yet.
- Assignments/workforce routes mentioned in early plans are not present in code; future scope may reintroduce them.
- Authentication flows are mocked; MFA copy references future backend integration.

---

## Deployment Readiness
- The prototype is fully navigable, responsive, and matches the PH5 grayscale design language.
- Because everything runs client-side with mock data, it can be deployed to any static-friendly hosting service without extra services.
- Demonstrates complete end-to-end flows for requisition creation, candidate onboarding, document readiness, and vendor bid submission within a single session.
