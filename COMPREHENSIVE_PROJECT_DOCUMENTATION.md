# Comprehensive Project Documentation
## Workforce Management Platform

**Last Updated:** 2025-01-XX  
**Version:** 0.1.0  
**Status:** Frontend-Only Prototype

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Routes & Pages](#routes--pages)
5. [Components](#components)
6. [Data Models](#data-models)
7. [State Management](#state-management)
8. [Design System](#design-system)
9. [Utilities & Helpers](#utilities--helpers)
10. [Configuration](#configuration)
11. [Features & Functionality](#features--functionality)
12. [Development Workflow](#development-workflow)

---

## Project Overview

This is a comprehensive frontend-only workforce management platform prototype built with Next.js 16, React 19, TypeScript, and Tailwind CSS. The application simulates a complete multi-tenant system for managing candidates, organizations, vendors, and administrators without requiring a backend.

### Key Characteristics

- **Multi-Portal Architecture**: Four distinct portals (Candidate, Organization, Vendor, Admin)
- **Frontend-Only**: All data managed in-memory with localStorage persistence
- **Type-Safe**: Full TypeScript implementation
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark Mode Support**: Theme switching via next-themes
- **Component Library**: Custom system components + shadcn/ui primitives

---

## Technology Stack

### Core Framework
- **Next.js**: 16.0.3 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Node.js**: ES6+ target

### Styling
- **Tailwind CSS**: 4.1.9
- **PostCSS**: 8.5
- **Custom Design Tokens**: `lib/tokens.js`
- **CSS Variables**: Defined in `app/globals.css`

### UI Components
- **shadcn/ui**: Base component library
- **Radix UI**: Headless component primitives
- **Lucide React**: Icon library (0.454.0)
- **Custom System Components**: `components/system/`

### State Management
- **React Context**: DemoDataProvider, LocalDbProvider
- **Zustand**: 5.0.8 (for compliance templates store)
- **localStorage**: Client-side persistence

### Form Handling
- **React Hook Form**: 7.60.0
- **Zod**: 3.25.76 (validation)
- **@hookform/resolvers**: 3.10.0

### Additional Libraries
- **date-fns**: 4.1.0 (date formatting)
- **next-themes**: 0.4.6 (theme management)
- **cmdk**: 1.0.4 (command palette)
- **sonner**: 1.7.4 (toast notifications)
- **recharts**: 2.15.4 (data visualization)

---

## Project Structure

```
workforce-management-ui/
├── app/                          # Next.js App Router
│   ├── admin/                   # Admin portal routes
│   │   ├── compliance/          # Compliance template management
│   │   ├── dashboard/           # Admin dashboard
│   │   ├── locations/           # Location management
│   │   ├── organizations/       # Organization management
│   │   └── login/               # Admin login
│   ├── candidate/               # Candidate portal routes
│   │   ├── applications/       # Application tracking
│   │   ├── apply/               # Application readiness
│   │   ├── dashboard/           # Candidate dashboard
│   │   ├── documents/           # Document wallet
│   │   ├── jobs/                # Job marketplace
│   │   ├── notifications/       # Notification feed
│   │   ├── onboarding/          # Multi-step onboarding
│   │   ├── profile/             # Profile editor
│   │   ├── settings/            # Account settings
│   │   └── login/               # Candidate login
│   ├── organization/            # Organization portal routes
│   │   ├── applications/        # Application management
│   │   ├── compliance/         # Compliance templates
│   │   ├── dashboard/           # Organization dashboard
│   │   ├── jobs/                # Job requisitions
│   │   ├── reports/             # Reports dashboard
│   │   └── login/               # Organization login
│   ├── vendor/                  # Vendor portal routes
│   │   ├── bids/                # Bid submission
│   │   ├── performance/         # Performance metrics
│   │   ├── vendors/             # Vendor directory
│   │   └── login/               # Vendor login
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page (role selector)
│   └── globals.css              # Global styles
├── components/
│   ├── compliance/              # Compliance-specific components
│   │   ├── add-item-modal.tsx
│   │   └── admin-add-item-modal.tsx
│   ├── providers/               # Context providers
│   │   ├── app-providers.tsx
│   │   ├── demo-data-provider.tsx
│   │   └── local-db-provider.tsx
│   ├── system/                  # Custom system components
│   │   ├── avatar.tsx
│   │   ├── avatar-dropdown.tsx
│   │   ├── breadcrumbs.tsx
│   │   ├── card.tsx
│   │   ├── date-picker.tsx
│   │   ├── dropdown.tsx
│   │   ├── expandable-row.tsx
│   │   ├── fab.tsx
│   │   ├── file-preview-modal.tsx
│   │   ├── form-field.tsx
│   │   ├── global-search.tsx
│   │   ├── header.tsx
│   │   ├── map.tsx
│   │   ├── modal.tsx
│   │   ├── multi-step-form.tsx
│   │   ├── notification-dropdown.tsx
│   │   ├── progress-bar.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton-loader.tsx
│   │   ├── status-chip.tsx
│   │   ├── table.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── toast.tsx
│   │   └── index.ts
│   ├── ui/                      # shadcn/ui primitives (50+ components)
│   └── theme-provider.tsx
├── lib/
│   ├── admin-local-db.ts        # Admin localStorage management
│   ├── compliance-items.ts      # Compliance item definitions
│   ├── compliance-templates-store.ts  # Zustand store for templates
│   ├── local-db.ts              # Candidate localStorage management
│   ├── mock-data.ts             # All mock data and types
│   ├── navigation-links.ts      # Route metadata
│   ├── organizations-store.ts   # Organization store helpers
│   ├── readiness-engine.ts      # Application readiness checker
│   ├── tokens.d.ts              # TypeScript token definitions
│   ├── tokens.js                # Design tokens
│   ├── typography.js            # Typography scale
│   ├── use-navigation.ts        # Navigation hook
│   └── utils.ts                 # Utility functions (cn)
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
├── public/                      # Static assets
├── styles/
│   └── globals.css
├── components.json               # shadcn/ui config
├── next.config.mjs              # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.mjs           # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
└── Documentation Files:
    ├── COMPONENT_INVENTORY.md
    ├── DATA_MODEL_REFERENCE.md
    ├── DESIGN_TOKENS.json
    ├── DEVELOPER_HANDOFF.md
    ├── ROUTE_MAP.md
    └── design-guidelines.md
```

---

## Routes & Pages

### Landing Page
**Route:** `/`  
**File:** `app/page.tsx`  
**Description:** Role selector landing page with three portal options

**Features:**
- Three portal cards: Candidate Workspace, Organization Control Center, Admin Portal
- Each card shows description, stats, and navigation link
- Responsive grid layout
- Visual icons for each portal type

---

### Candidate Portal

#### `/candidate/login`
**File:** `app/candidate/login/page.tsx`  
**Features:**
- Email/password authentication form
- Simulated login with redirect to dashboard
- Branded candidate portal styling

#### `/candidate/dashboard`
**File:** `app/candidate/dashboard/page.tsx`  
**Features:**
- Job readiness status banner (Ready/Not Ready)
- Onboarding completion percentage
- Document compliance status
- Quick action cards (Profile, Jobs, Documents, Applications)
- Recent activity feed
- Stats cards (Applications, Documents, Profile completion)
- Integration with readiness engine

#### `/candidate/jobs`
**File:** `app/candidate/jobs/page.tsx`  
**Features:**
- Job marketplace listing
- Filter by location, department, shift
- Search functionality
- Job cards with key details
- Link to job detail pages

#### `/candidate/jobs/[id]`
**File:** `app/candidate/jobs/[id]/page.tsx`  
**Features:**
- Detailed job information
- Requirements list
- Apply button (checks readiness)
- Job description
- Location and shift details
- Bill rate display

#### `/candidate/apply`
**File:** `app/candidate/apply/page.tsx`  
**Features:**
- Application readiness checker
- Three-section checklist:
  - Onboarding completeness
  - Required documents
  - Compliance status
- Readiness score calculation
- Missing items display
- Apply button (enabled when ready)

#### `/candidate/applications`
**File:** `app/candidate/applications/page.tsx`  
**Features:**
- Application tracker table
- Status indicators (Submitted, Qualified, Interview, Offer, Accepted, Rejected)
- Document status per application
- Match score display
- Submitted date (relative time)
- Expandable rows for details
- Filter by status

#### `/candidate/profile`
**File:** `app/candidate/profile/page.tsx`  
**Features:**
- Profile editor form
- Personal information (name, email, phone, location)
- Role and experience
- Specialties and skills
- Summary/notes
- Vendor partner display
- Save functionality with toast notifications

#### `/candidate/onboarding`
**File:** `app/candidate/onboarding/page.tsx`  
**Features:**
- Multi-step onboarding form
- Steps:
  1. Personal Information (name, DOB, contact)
  2. Work Preferences (locations, work types, shifts)
  3. Experience (job title, years, occupation)
  4. Skills & Specialties
  5. Availability (start date, time off)
  6. Documents (resume upload)
- Progress indicator
- Local storage persistence
- Dynamic document requirements based on answers
- Form validation

#### `/candidate/documents`
**File:** `app/candidate/documents/page.tsx`  
**Features:**
- Document wallet interface
- Document list with status (Completed, Pending Verification, Expired, Pending Upload, Validation Failed)
- Upload new document
- Replace existing document
- Document preview modal
- Expiration date tracking
- Required vs optional indicators
- Filter by status
- File type icons

#### `/candidate/notifications`
**File:** `app/candidate/notifications/page.tsx`  
**Features:**
- Notification feed
- Mark as read/unread
- Mark all as read
- Filter by type (job, system)
- Relative time display
- Notification preferences (email, SMS, push)

#### `/candidate/settings`
**File:** `app/candidate/settings/page.tsx`  
**Features:**
- Account settings
- Email update
- Notification preferences toggle
- Profile management links

#### `/candidate/no-profile`
**File:** `app/candidate/no-profile/page.tsx`  
**Features:**
- Redirect page for incomplete profiles
- Prompt to complete onboarding

#### `/candidate/submission-ready`
**File:** `app/candidate/submission-ready/page.tsx`  
**Features:**
- Post-application submission confirmation
- Next steps guidance

---

### Organization Portal

#### `/organization/login`
**File:** `app/organization/login/page.tsx`  
**Features:**
- Organization authentication
- Simulated login flow

#### `/organization/dashboard`
**File:** `app/organization/dashboard/page.tsx`  
**Features:**
- Organization overview
- Total jobs count
- Draft vs published jobs
- Total applications
- Quick links to key sections

#### `/organization/jobs`
**File:** `app/organization/jobs/page.tsx`  
**Component:** `app/organization/jobs/jobs-list.tsx`  
**Features:**
- Requisition list table
- Job status (Open, Closed, Draft)
- Filter by status
- Create new job button
- Edit existing jobs
- Publish/Draft toggle
- Job details display

#### `/organization/jobs/create`
**File:** `app/organization/jobs/create/page.tsx`  
**Features:**
- Job creation wizard
- Multi-step form:
  1. Basic Info (title, location, department, unit)
  2. Schedule (shift, hours, start date)
  3. Compensation (bill rate)
  4. Description & Requirements
  5. Compliance Template Selection
- Save as Draft or Publish
- Compliance template integration

#### `/organization/applications`
**File:** `app/organization/applications/page.tsx`  
**Component:** `app/organization/applications/applications-list.tsx`  
**Features:**
- Application list with inline actions
- Status management (Qualify, Reject, Interview, Offer)
- Match score display
- Document status indicators
- Vendor information
- Quick actions dropdown
- Filter and search

#### `/organization/applications/[id]`
**File:** `app/organization/applications/[id]/page.tsx`  
**Features:**
- Detailed application view
- Candidate contact information
- Application insights
- Compliance checklist
- Attachments list
- Notes section (add/view)
- Status update actions
- Document preview

#### `/organization/compliance/templates`
**File:** `app/organization/compliance/templates/page.tsx`  
**Features:**
- Compliance template list
- Create new template
- Edit existing templates
- Template items management

#### `/organization/compliance/wallet-templates`
**File:** `app/organization/compliance/wallet-templates/page.tsx`  
**Features:**
- Wallet template management
- Occupation-based templates
- Add/edit/delete templates
- Template items configuration

#### `/organization/compliance/wallet-templates/[id]`
**File:** `app/organization/compliance/wallet-templates/[id]/page.tsx`  
**Features:**
- Wallet template editor
- Add/remove compliance items
- Occupation assignment

#### `/organization/compliance/requisition-templates`
**File:** `app/organization/compliance/requisition-templates/page.tsx`  
**Features:**
- Requisition template list
- Department-based templates
- Template management

#### `/organization/compliance/requisition-templates/[id]`
**File:** `app/organization/compliance/requisition-templates/[id]/page.tsx`  
**Features:**
- Requisition template editor
- Compliance items management

#### `/organization/reports`
**File:** `app/organization/reports/page.tsx`  
**Features:**
- Reports dashboard
- Analytics and metrics
- Data visualization

---

### Vendor Portal

#### `/vendor/login`
**File:** `app/vendor/login/page.tsx`  
**Features:**
- Vendor authentication
- Login form

#### `/vendor/vendors`
**File:** `app/vendor/vendors/page.tsx`  
**Features:**
- Vendor directory listing
- Vendor cards with tier (Premier, Preferred, Approved)
- KPIs display (fill rate, response time, candidates supplied)
- Certifications list
- Link to vendor details

#### `/vendor/vendors/[id]`
**File:** `app/vendor/vendors/[id]/page.tsx`  
**Features:**
- Detailed vendor information
- Description and metadata
- Certifications with expiration
- Agreements list
- Contacts directory
- Bids history
- Documents library

#### `/vendor/bids`
**File:** `app/vendor/bids/page.tsx`  
**Features:**
- Bid submission interface
- Bid list with status (Draft, Submitted, Awarded)
- Submit new bid
- Rate and availability input
- Job association

#### `/vendor/performance`
**File:** `app/vendor/performance/page.tsx`  
**Features:**
- Performance metrics dashboard
- KPI cards
- Vendor leaderboard
- Score calculation
- Performance trends

---

### Admin Portal

#### `/admin/login`
**File:** `app/admin/login/page.tsx`  
**Features:**
- Admin authentication
- System stats display
- Full access description

#### `/admin/dashboard`
**File:** `app/admin/dashboard/page.tsx`  
**Features:**
- Admin overview
- Total organizations count
- Total locations count
- Active organizations
- Organizations list
- Quick actions (Add Organization)

#### `/admin/locations`
**File:** `app/admin/locations/page.tsx`  
**Features:**
- All locations across organizations
- Location details
- Organization association
- Departments per location
- Add/edit locations

#### `/admin/locations/[id]`
**File:** `app/admin/locations/[id]/page.tsx`  
**Features:**
- Location detail page
- Edit location information
- Department management (add/remove/update)
- Organization context

#### `/admin/organizations/add`
**File:** `app/admin/organizations/add/page.tsx`  
**Features:**
- Create new organization
- Organization form (name, email, phone, website, industry, description)
- Add locations
- Location form (name, address, city, state, zip, phone, email)
- Save to localStorage

#### `/admin/organizations/[id]`
**File:** `app/admin/organizations/[id]/page.tsx`  
**Features:**
- Organization detail page
- Edit organization information
- Manage locations
- View organization data

#### `/admin/compliance/templates`
**File:** `app/admin/compliance/templates/page.tsx`  
**Features:**
- Global compliance template management
- Template list
- Create/edit/delete templates
- Template items configuration

#### `/admin/compliance/templates/create`
**File:** `app/admin/compliance/templates/create/page.tsx`  
**Features:**
- Create new compliance template
- Template name and description
- Add compliance items

#### `/admin/compliance/templates/[id]`
**File:** `app/admin/compliance/templates/[id]/page.tsx`  
**Features:**
- Edit compliance template
- Manage template items
- Add/remove items using modal

---

## Components

### System Components (`components/system/`)

All system components are exported from `components/system/index.ts` for easy importing.

#### Header
**File:** `components/system/header.tsx`  
**Props:**
- `title: string` - Page title
- `subtitle?: string` - Optional subtitle
- `breadcrumbs?: Array<{label: string, href?: string}>` - Breadcrumb trail
- `actions?: HeaderAction[]` - Action buttons
- `className?: string` - Additional classes

**Features:**
- Integrated GlobalSearch component
- ThemeToggle button
- AvatarDropdown menu
- Responsive layout
- Breadcrumb navigation

#### Card
**File:** `components/system/card.tsx`  
**Props:**
- `title?: string` - Card title
- `subtitle?: string` - Card subtitle
- `actions?: ReactNode` - Action buttons
- `children: ReactNode` - Card content
- `footer?: ReactNode` - Footer content
- `bleed?: boolean` - Remove default padding
- `className?: string` - Additional classes

**Features:**
- Hover elevation effect
- Consistent padding (20px default)
- Border and shadow styling
- Gradient border on hover

#### Modal
**File:** `components/system/modal.tsx`  
**Props:**
- `open: boolean` - Modal visibility
- `title: string` - Modal title
- `description?: string` - Optional description
- `children: ReactNode` - Modal content
- `footer?: ReactNode` - Footer actions
- `onClose: () => void` - Close handler
- `size?: "sm" | "md" | "lg"` - Modal size

**Features:**
- ESC key to close
- Click outside to close
- Accessible ARIA attributes
- Focus management
- Backdrop blur

#### FilePreviewModal
**File:** `components/system/file-preview-modal.tsx`  
**Props:**
- `open: boolean` - Modal visibility
- `fileName: string` - File name
- `fileType: string` - File type
- `fileSize?: string` - File size
- `onClose: () => void` - Close handler

**Features:**
- Simulated document preview
- Download button
- File type icons
- ESC key support

#### StatusChip
**File:** `components/system/status-chip.tsx`  
**Props:**
- `label: string` - Chip text
- `tone?: "neutral" | "success" | "warning" | "danger" | "info"` - Color variant
- `className?: string` - Additional classes

**Usage:**
```tsx
<StatusChip label="Active" tone="success" />
<StatusChip label="Pending" tone="warning" />
```

#### SkeletonLoader
**File:** `components/system/skeleton-loader.tsx`  
**Props:**
- `lines?: number` - Number of skeleton lines
- `className?: string` - Additional classes

**Features:**
- Shimmer animation
- Configurable line count
- Used during loading states

#### FloatingActionButton (FAB)
**File:** `components/system/fab.tsx`  
**Props:**
- `icon: ReactNode` - Icon element
- `label: string` - Button label
- `onClick: () => void` - Click handler

**Features:**
- Fixed position
- Mobile-optimized
- Accessible

#### Breadcrumbs
**File:** `components/system/breadcrumbs.tsx`  
**Props:**
- `items: Array<{label: string, href?: string}>` - Breadcrumb items

**Features:**
- Automatic link generation
- Responsive truncation

#### GlobalSearch
**File:** `components/system/global-search.tsx`  
**Features:**
- Command palette (⌘K keyboard shortcut)
- Search jobs, candidates, vendors
- Keyboard navigation
- Quick navigation to results

#### ThemeToggle
**File:** `components/system/theme-toggle.tsx`  
**Features:**
- Light/dark mode switch
- Uses next-themes
- Accessible button
- Icon-based toggle

#### Avatar & AvatarDropdown
**Files:** `components/system/avatar.tsx`, `avatar-dropdown.tsx`  
**Features:**
- Initials fallback
- Dropdown menu
- User actions (Profile, Settings, Logout)
- Image support

#### MultiStepForm
**File:** `components/system/multi-step-form.tsx`  
**Props:**
- `steps: Step[]` - Form steps
- `activeStep: number` - Current step
- `onBack: () => void` - Back handler
- `onNext: () => void` - Next handler
- `onSave: () => void` - Save handler

**Features:**
- Step indicator
- Progress tracking
- Animated transitions

#### FormField
**File:** `components/system/form-field.tsx`  
**Props:**
- `label: string` - Field label
- `htmlFor?: string` - Input ID
- `helper?: string` - Helper text
- `error?: string` - Error message
- `required?: boolean` - Required indicator
- `children: ReactNode` - Input element
- `className?: string` - Additional classes

**Features:**
- Label association
- Error display
- Consistent styling
- Required indicator

#### DatePicker
**File:** `components/system/date-picker.tsx`  
**Features:**
- Calendar popup
- Date selection
- Formatting
- Integration with react-day-picker

#### Table (DataTable)
**File:** `components/system/table.tsx`  
**Features:**
- Responsive design
- Zebra striping
- Hover effects
- Consistent padding (16px)
- Header styling

#### ExpandableRow
**File:** `components/system/expandable-row.tsx`  
**Features:**
- Accordion behavior
- Nested content
- Smooth animations

#### ProgressBar
**File:** `components/system/progress-bar.tsx`  
**Props:**
- `value: number` - Progress percentage
- `max?: number` - Maximum value

**Features:**
- Animated gradient
- Smooth transitions
- Shimmer effect

#### Sidebar
**File:** `components/system/sidebar.tsx`  
**Features:**
- Collapsible
- Mobile drawer
- Active route highlighting
- Custom header/footer support
- Icon + label navigation

#### Dropdown
**File:** `components/system/dropdown.tsx`  
**Features:**
- Menu items
- Keyboard navigation
- Click outside to close

#### Toast
**File:** `components/system/toast.tsx`  
**Features:**
- Toast notifications
- Multiple variants (success, error, info)
- Auto-dismiss
- Queue management

#### Map
**File:** `components/system/map.tsx`  
**Features:**
- Location display
- Map visualization
- Placeholder map images

#### NotificationDropdown
**File:** `components/system/notification-dropdown.tsx`  
**Features:**
- Notification list
- Mark as read
- Filter by type
- Relative time display

---

### Compliance Components

#### AddItemModal
**File:** `components/compliance/add-item-modal.tsx`  
**Props:**
- `open: boolean`
- `onClose: () => void`
- `onAdd: (item: ComplianceItem) => void`
- `existingItemIds?: string[]`

**Features:**
- Category-based item selection
- Filter out already added items
- Item details display
- Expiration type information

#### AdminAddItemModal
**File:** `components/compliance/admin-add-item-modal.tsx`  
**Props:**
- `open: boolean`
- `onClose: () => void`
- `onAdd: (item: ComplianceItem) => void`
- `existingItemIds?: string[]`

**Features:**
- Three-step wizard:
  1. Select category
  2. Select item
  3. Review expiration type
- Category display names
- Back navigation
- Item preview

---

### UI Primitives (`components/ui/`)

These are shadcn/ui components adapted for the project. Full list includes:

**Form Controls:**
- Button (primary, secondary, ghost, destructive variants)
- Input (text input with validation states)
- Textarea (multi-line text input)
- Select (dropdown selection)
- Switch (toggle switch)
- Checkbox (checkbox input)
- RadioGroup (radio button group)
- DatePicker (date selection via Calendar)
- InputOTP (OTP input)

**Display Components:**
- Card (base card component)
- Badge (status badges)
- Avatar (user avatars)
- Skeleton (loading skeletons)
- Progress (progress indicators)
- Separator (visual divider)
- Empty (empty state)

**Overlay Components:**
- Dialog (modal dialogs)
- Sheet (slide-in panels)
- Popover (popover menus)
- Tooltip (tooltips)
- Alert (alert messages)
- Toast (toast notifications)
- AlertDialog (confirmation dialogs)

**Navigation Components:**
- Tabs (tab navigation)
- Accordion (accordion panels)
- Breadcrumb (breadcrumb navigation)
- Command (command palette)
- NavigationMenu (navigation menu)
- Menubar (menu bar)
- ContextMenu (context menu)
- DropdownMenu (dropdown menu)
- HoverCard (hover card)

**Data Display:**
- Table (data tables)
- Chart (data visualization)
- Carousel (image carousel)
- AspectRatio (aspect ratio container)
- Resizable (resizable panels)

**Layout:**
- ScrollArea (scrollable area)
- Separator (divider)

**Other:**
- Kbd (keyboard key display)
- Toggle (toggle button)
- ToggleGroup (toggle group)
- Spinner (loading spinner)

---

