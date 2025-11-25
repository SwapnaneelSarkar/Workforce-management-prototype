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
- **State**: `DemoDataProvider` exposes candidate, organization, and vendor slices plus imperative helpers (upload docs, create jobs, approve timesheets, submit bids, etc.). Each helper simulates latency via `simulateDelay` for UI realism.
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
- **Candidate slice**: profile, documents, favorites, messages, referral code, notification prefs, onboarding answers, required document list, applications scoped to the signed-in candidate, and notification feed.
- **Organization slice**: jobs/requisitions, every application in the system, compliance templates, approval chains, timesheets, invoices.
- **Vendor slice**: vendor roster, submitted bids, leaderboard KPIs.
- **Latency simulation**: `simulateDelay(min, max)` introduces 300–900 ms delays for async helpers so loading states feel real.

### DemoDataProvider API (functions & consumers)

| Function | Purpose | Primary screens invoking it |
| --- | --- | --- |
| `toggleFavorite(jobId)` | Adds/removes job IDs from `candidate.favorites`. | `/candidate/jobs`, `/candidate/favorites` |
| `uploadDocument({ name, type })` | Creates a pending credential with default expiry + timestamps. | `/candidate/documents`, `/candidate/jobs/[id]` (missing doc modal) |
| `replaceDocument(docId, updates)` | Updates doc status/date (used to mark completed). | `/candidate/documents` |
| `generateReferralCode()` | Generates `REF-XXXXXX` codes & stores `generatedAt`. | `/candidate/refer` |
| `markThreadRead(threadId, unread)` | Flips unread counters. | `/candidate/messages` |
| `sendMessage(threadId, body)` | Appends outbound replies, zeroes unread count. | `/candidate/messages` |
| `updateNotificationPrefs(partial)` | Persists email/SMS/push toggles. | `/candidate/settings` |
| `updateEmail(email)` | Writes profile email after validation. | `/candidate/settings` |
| `saveOnboardingStep(step, data)` | Saves answers + auto-adds required docs mapped via `onboardingDocumentMappings`. | `/candidate/onboarding` |
| `submitJobApplication(jobId)` | Creates application stub, pushes notification, prevents duplicates. | `/candidate/jobs/[id]`, `/candidate/apply` |
| `createJob(payload)` | Publishes new requisition with chosen template + tags. | `/organization/jobs/create` |
| `updateApplicationStatus(id, status)` | Moves applicants between pipeline stages. | `/organization/applications` |
| `rejectApplication(id)` | Shortcut to mark status `Rejected`. | `/organization/applications` |
| `addTemplateItem(templateId, item)` | Appends compliance requirements. | `/organization/compliance/templates` |
| `removeTemplateItem(templateId, itemId)` | Deletes requirements. | `/organization/compliance/templates` |
| `updateTemplateItem(templateId, itemId, updates)` | Toggles required-at-submission or other item metadata. | `/organization/compliance/templates` |
| `updateApprovalStep(chainId, stepId, status)` | Records decisions + timestamps per approver. | `/organization/approvals` |
| `updateTimesheetStatus(id, status)` | Approves/rejects timesheets inline. | `/organization/timekeeping` |
| `updateInvoiceStatus(id, status)` | Marks invoices paid/overdue. | `/organization/finance`, `/organization/finance/invoices` |
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
- Uses `Header` with breadcrumbs plus three quick-action cards (book interview, upload credentials, refer).
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
- Apply sidebar enforces missing-doc gating, shows `StatusChip`s for each requirement, and offers upload shortcuts (which call `uploadDocument`).
- Benefits list, assignment overview, similar roles list, and compliance status cards round out the details; modal reiterates missing docs when apply is attempted early.

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

### `/candidate/messages`
- Left rail shows message threads with unread counters (`StatusChip`), mark read/unread button, and timestamps.
- Right pane lists messages in a scrollable area and provides quick-reply textarea + send button which triggers `sendMessage` and toasts.

### `/candidate/notifications`
- Header includes “Mark all read” action that toggles loading to show skeleton.
- Filter select adjusts `typeFilter`, and `StatusChip` reflects count for the selection.
- Digest preferences grid lists job/system/message categories with icon and “Enabled” text (static for now).

### `/candidate/favorites`
- Summary bar shows saved-job count along with a search field to filter saved roles by keyword.
- Each card reuses organization job data, includes Save/Saved button tied to `toggleFavorite`, and displays job metadata plus tags, shift/hours, and bill rate.

### `/candidate/refer`
- Multiple cards cover referral rewards (`Gift` icon), active referral code (with generate/copy actions), recommended roles, and referral activity feed (re-using notifications).
- Modal flow collects invite email and reuses `generateReferralCode` before sending a mock invite (toast-based).

### `/candidate/settings`
- Notification preferences card exposes toggles for email/SMS/push; hooks into `updateNotificationPrefs`.
- Change email card shows current email, new/confirm inputs, and Save button that validates and calls `updateEmail` with success/error toasts.

---

## Organization Portal (All Routes)

### `/organization/login`
- Parity with candidate login but with organization-focused copy, SSO helper text, and icons (e.g., `Building2`).
- Keeps user signed in toggle, forgot password link, security note referencing SOC2 controls; redirect goes to `/organization/dashboard`.

### `/organization/dashboard`
- KPI grid derived from `mockRequisitions`/`mockApplications`.
- Requisition table uses `StatusChip`s and progress bars to show fill-rate targets plus overflow menu buttons.
- Recommended actions card provides quick links (create job, manage compliance, review applications, export report).
- Recent applications card lists latest submissions with tone-coded chips.

### `/organization/jobs`
- Summary stats (total requisitions, open positions, active requisitions).
- Main table lists each requisition with status badge and view/hide toggle that reveals submission details and approval chain list.
- “New Requisition” button links to create flow.

### `/organization/jobs/create`
- Four-step `MultiStepForm` (General, Details, Invite vendors, Review & publish) with select inputs, textarea, compliance template picker, and vendor invitation field.
- Save button animates per step; final publish view surfaces job summary plus success confirmation once `createJob` resolves.

### `/organization/applications`
- Status tabs (“All”, “Submitted”, … “Rejected”) filter application cards.
- Cards show avatar initials, vendor badge, match-score bar, status chip, and action buttons (Qualify, Interview, Reject) that call provider actions.
- Schedule interview modal collects date input; reject modal confirms destructive action.

### `/organization/applications/[id]`
- Placeholder layout showing intended sections (candidate info, documents, compliance checklist, sidebar actions). No live data yet.

### `/organization/compliance/templates`
- Left rail selects template; right pane lists items with toggles for `requiredAtSubmission`, remove buttons, and metadata (type, expiration).
- Add requirement form collects name, type, expiration style, and required toggle before calling `addTemplateItem`.
- Footer displays `StatusChip` with item count and “Changes saved instantly” note.

### `/organization/compliance/[id]`
- Placeholder grid mirroring future template editor (rows for item type, description, expiration, required, action).

### `/organization/approvals`
- Approval chain card lists each approver with name/role, status chip, and Approve/Reject buttons for pending steps. `updateApprovalStep` records decisions and timestamp.

### `/organization/timekeeping`
- Stat cards summarize pending/approved/rejected timesheets.
- Queue list shows staff, date, hours, type, and status, alongside Approve/Reject buttons acting on `updateTimesheetStatus`.

### `/organization/finance`
- Stat cards compute pending and overdue totals (aggregating invoice amounts) plus open requisition count.
- “Recent invoices” card shows top five invoices with amount, due date, status chip, and View link to invoices page.

### `/organization/finance/invoices`
- Full invoice register listing every invoice with status chip, Details modal button, and “Mark paid” control that calls `updateInvoiceStatus`.
- Modal surfaces vendor/amount/due date information.

### `/organization/reports`
- Snapshot grid for open requisitions, application count, and pending approvals (computed from approval chains).

---

## Vendor Module (All Routes)

### `/vendor/login`
- Mirrored login hero with vendor-specific copy, stats, and iconography (`Factory`). Form logic matches other portals and redirects to `/vendor/vendors`.

### `/vendor/vendors`
- Summary stats for active vendors, total clients, and distinct services.
- Two-column layout: table of vendors (click to select) and sticky detail panel showing contact info, certifications, client count, mock document list, and action buttons (Edit, Upload Document). Upload mode exposes file-name input and stub button.

### `/vendor/vendors/[id]`
- Placeholder detail page with sections for logo, vendor info, certifications, sub-vendor agreements, and action buttons (Edit/Suspend/Delete) awaiting real data.

### `/vendor/bids`
- “Available jobs” card lists first six organization jobs with bill-rate chips and Submit bid button (opens modal).
- Modal collects hourly rate + availability notes, then calls `submitVendorBid`.
- Submitted bids card shows vendor submissions from provider state with status chips.

### `/vendor/performance`
- KPI cards (pulled from `vendorPerformanceKpis`) summarize metrics like fulfillment rate, response time, etc.
- Vendor snapshot list and fulfillment leaderboard bars visualize partner performance, with progress bars sized to fill-rate percentages.

---

## Organization Portal (Routes & Features)

| Route | Highlights |
| --- | --- |
| `/organization/login` | Mirrored UX to candidate login but targeted copy for hiring teams, SSO helper text, redirect to dashboard. |
| `/organization/dashboard` | KPI tiles (open positions, active reqs, pipeline size, fill rate sparkline), requisition table with progress visuals, recommended action shortcuts, recent applications feed with tone-specific chips. |
| `/organization/jobs` | Aggregate stats, primary action to create requisition, table with expandable rows showing submission date, hiring leader, approval chain timeline. |
| `/organization/jobs/create` | Four-step `MultiStepForm` (General, Details, Invite vendors, Review), compliance template picker, review summary, publish success state that links back to jobs. |
| `/organization/applications` | Status tab filters, stat tiles, candidate cards with vendor badges + match score bars, inline action buttons (qualify/interview/reject) that mutate provider state, interview scheduling modal, reject confirmation modal. |
| `/organization/applications/[id]` | Placeholder wireframe for deep applicant view (future enhancement). |
| `/organization/compliance/templates` | Left rail template selector, item list with toggles + remove actions, add-requirement form (name/type/expiration/required), instant feedback chips (“n requirements”). |
| `/organization/compliance/[id]` | Placeholder layout for template editor detail (future work). |
| `/organization/approvals` | Approval chain viewer with per-approver status chip, approve/reject buttons that update chain state plus decision timestamp. |
| `/organization/timekeeping` | Timesheet stats, queue list with approve/reject controls that call `updateTimesheetStatus`. |
| `/organization/finance` | Pending/overdue totals (calculated), open requisitions count, latest invoices list with status chips and link to invoices page. |
| `/organization/finance/invoices` | Full invoice register, detail modal showing vendor/amount/due date, “Mark paid” button updates provider state. |
| `/organization/reports` | Snapshot cards for open requisitions, total applications, pending approvals (computed from approval chains). |

---

## Vendor Module (Routes & Features)

| Route | Highlights |
| --- | --- |
| `/vendor/login` | Vendor-specific hero copy, secure login form, redirect to vendor workspace, parity with other login experiences. |
| `/vendor/vendors` | Vendor list with stats (active vendors, total clients, services), selectable rows powering a sticky detail panel (contact info, certifications, client count, documents pulled from `mockVendorDocuments`, upload form). |
| `/vendor/vendors/[id]` | Placeholder scaffold for a dedicated detail page (logo, info, certifications, agreements, actions). |
| `/vendor/bids` | Available jobs list with bill-rate chips, submit-bid modal (rate + availability) wired to `submitVendorBid`, submitted bids list referencing provider state. |
| `/vendor/performance` | KPI cards, vendor snapshot list, fulfillment leaderboard bars displaying fill-rate percentage per partner. |

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
- **Modal**: Accessible overlay with title/description, used for missing-doc warnings, schedule interview, reject confirmation, referral invites, invoice details, bid submission.
- **SkeletonLoader**: Provides shimmer placeholders while fake latency resolves (documents, jobs, messages).
- **FloatingActionButton**: On job marketplace for quick filter reset.
- **Toast system**: `useToast` surfaces success/error info after uploads, referrals, messages, etc.
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
- `progress-bar`: base progress visuals reused for fill-rate and onboarding.
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
- `/candidate/messages`
- `/candidate/notifications`
- `/candidate/favorites`
- `/candidate/refer`
- `/candidate/settings`

### Organization
- `/organization/login`
- `/organization/dashboard`
- `/organization/jobs`
- `/organization/jobs/create`
- `/organization/applications`
- `/organization/applications/[id]` *(placeholder)*
- `/organization/compliance/templates`
- `/organization/compliance/[id]` *(placeholder)*
- `/organization/approvals`
- `/organization/timekeeping`
- `/organization/finance`
- `/organization/finance/invoices`
- `/organization/reports`

### Vendor
- `/vendor/login`
- `/vendor/vendors`
- `/vendor/vendors/[id]` *(placeholder)*
- `/vendor/bids`
- `/vendor/performance`

---

## Mock Data Collections
- **Candidates**: Baseline profile + documents + onboarding requirements.
- **Jobs / Requisitions**: Department/unit/shift/rate metadata plus requirements & benefits lists.
- **Applications**: Candidate/job pairing with status, match score, vendor attribution, submitted timestamps.
- **Notifications & Messages**: Feeds for dashboard/activity cards plus threaded conversations.
- **Compliance Templates**: Template + items (type, expiration, submission requirement) editable in UI.
- **Approvals**: Chains with approver metadata, statuses, and decision timestamps.
- **Timesheets**: Staff name, date, hours, type, status.
- **Invoices**: Amount, due date, status for finance workflows.
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
- `/organization/applications/[id]`, `/organization/compliance/[id]`, and `/vendor/vendors/[id]` are still wireframe placeholders; real data bindings and controls are pending.
- There is no dedicated candidate “application tracking” route yet; readiness sits under `/candidate/apply`.
- Assignments/workforce routes mentioned in early plans are not present in code; future scope may reintroduce them.
- Authentication flows are mocked; MFA copy references future backend integration.

---

## Deployment Readiness
- The prototype is fully navigable, responsive, and matches the PH5 grayscale design language.
- Because everything runs client-side with mock data, it can be deployed to any static-friendly hosting service without extra services.
- Demonstrates complete end-to-end flows for requisition creation, candidate onboarding, compliance management, finance, and vendor bid submission within a single session.
