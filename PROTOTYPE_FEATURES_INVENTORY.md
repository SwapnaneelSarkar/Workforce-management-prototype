# Prototype Features Inventory

Complete module-wise and page-wise list of all features implemented in the Workforce Management Platform prototype.

**Last Updated:** January 2025  
**Status:** Frontend-Only Prototype

---

## Table of Contents

1. [Landing Page](#landing-page)
2. [Candidate Portal](#candidate-portal)
3. [Organization Portal](#organization-portal)
4. [Admin Portal](#admin-portal)

---

## Landing Page

### `/` - Role Selector
**File:** `app/page.tsx`

**Features:**
- Three portal selection cards:
  - Candidate Workspace
  - Organization Control Center
  - Admin Portal
- Portal descriptions and statistics
- Visual icons for each portal
- Responsive grid layout (3 columns on large screens)
- Navigation links to each portal

---

## Candidate Portal

### Authentication & Access

#### `/candidate/login` - Login Page
**File:** `app/candidate/login/page.tsx`

**Features:**
- Email/password authentication form
- Simulated login functionality
- Redirect to dashboard after login
- Branded candidate portal styling

#### `/candidate/no-profile` - No Profile Redirect
**File:** `app/candidate/no-profile/page.tsx`

**Features:**
- Redirect page for incomplete profiles
- Prompt to complete onboarding
- Link to onboarding page

---

### Dashboard & Overview

#### `/candidate/dashboard` - Dashboard
**File:** `app/candidate/dashboard/page.tsx`

**Features:**
- Job readiness status banner (Ready/Not Ready)
- Onboarding completion percentage indicator
- Document compliance status display
- Quick action cards:
  - Profile
  - Jobs
  - Documents
  - Applications
- Recent activity feed
- Stats cards:
  - Total applications
  - Documents count
  - Profile completion percentage
- Integration with readiness engine
- Visual status indicators

---

### Profile Management

#### `/candidate/profile` - Profile Editor
**File:** `app/candidate/profile/page.tsx`

**Features:**
- Profile editor form
- Personal information fields:
  - Name
  - Email
  - Phone
  - Location
- Role and experience information
- Specialties and skills management
- Summary/notes section
- Vendor partner display
- Save functionality with toast notifications
- Form validation

#### `/candidate/profile-setup` - Profile Setup
**File:** `app/candidate/profile-setup/page.tsx`

**Features:**
- Initial profile setup flow
- Profile completion wizard

---

### Onboarding & Questionnaire

#### `/candidate/onboarding` - Multi-Step Onboarding
**File:** `app/candidate/onboarding/page.tsx`

**Features:**
- Multi-step onboarding form with progress indicator
- **Step 1: Personal Information**
  - Name, DOB, contact details
- **Step 2: Work Preferences**
  - Preferred locations
  - Work types
  - Shift preferences
- **Step 3: Experience**
  - Job title
  - Years of experience
  - Occupation selection
- **Step 4: Skills & Specialties**
  - Skills list
  - Specialty selection
- **Step 5: Availability**
  - Start date
  - Time off preferences
- **Step 6: Documents**
  - Resume upload
  - Document uploads
- Local storage persistence
- Dynamic document requirements based on answers
- Form validation
- Back/Next navigation
- Progress tracking

#### `/candidate/questionnaire` - Questionnaire
**File:** `app/candidate/questionnaire/page.tsx`

**Features:**
- Questionnaire system
- Dynamic questions based on occupation
- Answer validation
- Auto-save functionality

---

### Job Discovery & Application

#### `/candidate/jobs` - Job Marketplace
**File:** `app/candidate/jobs/page.tsx`

**Features:**
- Job marketplace listing
- Filter by:
  - Location
  - Department
  - Shift type
- Search functionality
- Job cards with key details:
  - Job title
  - Location
  - Department
  - Shift
  - Bill rate
- Link to job detail pages
- Responsive grid layout

#### `/candidate/jobs/[id]` - Job Detail Page
**File:** `app/candidate/jobs/[id]/page.tsx`

**Features:**
- Detailed job information display
- Full job description
- Requirements list
- Compliance requirements display
- Location and shift details
- Bill rate display
- Apply button with readiness check
- Link back to job listing

#### `/candidate/apply` - Application Readiness Checker
**File:** `app/candidate/apply/page.tsx`

**Features:**
- Application readiness checker
- Three-section checklist:
  - Onboarding completeness
  - Required documents availability
  - Compliance status
- Readiness score calculation
- Missing items display
- Apply button (enabled when ready)
- Visual status indicators
- Integration with readiness engine

#### `/candidate/submission-ready` - Submission Confirmation
**File:** `app/candidate/submission-ready/page.tsx`

**Features:**
- Post-application submission confirmation
- Next steps guidance
- Success message display

---

### Application Tracking

#### `/candidate/applications` - Application Tracker
**File:** `app/candidate/applications/page.tsx`

**Features:**
- Application tracker table
- Status indicators:
  - Submitted
  - Qualified
  - Interview
  - Offer
  - Accepted
  - Rejected
- Document status per application
- Match score display
- Submitted date (relative time)
- Expandable rows for details
- Filter by status
- Search functionality
- Application details view

#### `/candidate/applications/[id]` - Application Detail
**File:** `app/candidate/applications/[id]/page.tsx`

**Features:**
- Detailed application view
- Application status tracking
- Candidate information
- Job details
- Document attachments
- Timeline view

---

### Document Management

#### `/candidate/documents` - Document Wallet
**File:** `app/candidate/documents/page.tsx`

**Features:**
- Document wallet interface
- Document list with status:
  - Completed
  - Pending Verification
  - Expired
  - Pending Upload
  - Validation Failed
- Upload new document functionality
- Replace existing document
- Document preview modal
- Expiration date tracking
- Required vs optional indicators
- Filter by status
- File type icons
- Document source tracking (onboarding vs wallet)
- Delete document functionality

---

### Placements

#### `/candidate/placements` - Placements List
**File:** `app/candidate/placements/page.tsx`

**Features:**
- Placements listing
- Placement status tracking
- Placement details view

#### `/candidate/placements/[id]` - Placement Detail
**File:** `app/candidate/placements/[id]/page.tsx`

**Features:**
- Detailed placement information
- Placement timeline
- Related documents

#### `/candidate/placements/[id]/timecard` - Timecard Management
**File:** `app/candidate/placements/[id]/timecard/page.tsx`

**Features:**
- Timecard listing
- Timecard submission
- Time tracking

#### `/candidate/placements/[id]/timecard/[timecardId]` - Timecard Detail
**File:** `app/candidate/placements/[id]/timecard/[timecardId]/page.tsx`

**Features:**
- Detailed timecard view
- Time entry details
- Approval status

---

### Communication & Support

#### `/candidate/notifications` - Notifications
**File:** `app/candidate/notifications/page.tsx`

**Features:**
- Notification feed
- Mark as read/unread functionality
- Mark all as read
- Filter by type (job, system)
- Relative time display
- Notification preferences (email, SMS, push)
- Notification status indicators

#### `/candidate/news-feed` - News Feed
**File:** `app/candidate/news-feed/page.tsx`

**Features:**
- News feed display
- Updates and announcements
- Feed filtering

#### `/candidate/support` - Support
**File:** `app/candidate/support/page.tsx`

**Features:**
- Support page
- Help resources
- Contact information

---

### Settings

#### `/candidate/settings` - Account Settings
**File:** `app/candidate/settings/page.tsx`

**Features:**
- Account settings management
- Email update
- Notification preferences toggle
- Profile management links
- Password change (simulated)

---

## Organization Portal

### Authentication

#### `/organization/login` - Organization Login
**File:** `app/organization/login/page.tsx`

**Features:**
- Organization authentication
- Email + OTP authentication (simulated)
- Organization lookup by email
- Simulated login flow

---

### Dashboard & Overview

#### `/organization/dashboard` - Organization Dashboard
**File:** `app/organization/dashboard/page.tsx`

**Features:**
- Organization overview
- Total jobs count
- Draft vs published jobs
- Total applications count
- Quick links to key sections
- Statistics cards
- Activity summary

#### `/organization/command-center` - Command Center
**File:** `app/organization/command-center/page.tsx`

**Features:**
- Command center dashboard
- Centralized view of operations
- Quick actions
- Key metrics overview

---

### Job Management

#### `/organization/jobs` - Job Requisitions List
**File:** `app/organization/jobs/page.tsx`  
**Component:** `app/organization/jobs/jobs-list.tsx`

**Features:**
- Requisition list table
- Job status indicators (Open, Closed, Draft)
- Filter by status
- Create new job button
- Edit existing jobs
- Publish/Draft toggle
- Job details display
- Search functionality
- Job statistics
- Suspense fallback for loading states

#### `/organization/jobs/create` - Job Creation Wizard
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
- Form validation
- Preview before publishing

---

### Application Management

#### `/organization/applications` - Applications List
**File:** `app/organization/applications/page.tsx`  
**Component:** `app/organization/applications/applications-list.tsx`

**Features:**
- Application list with inline actions
- Status management:
  - Submitted
  - Qualified
  - Shortlisted
  - Offer
  - Accepted
  - Withdrawn
  - Rejected
- Status filter buttons with counts
- Match score display
- Document status indicators
- Vendor information
- Quick actions dropdown:
  - View Details
  - View Profile
- Filter and search functionality
- Application statistics
- Status counts display
- Candidate Profile Modal:
  - View candidate profile
  - Add to Talent Community
  - Contact information
  - Professional information
  - Application details
  - Documents list
- Suspense fallback for loading states

#### `/organization/applications/[id]` - Application Detail View
**File:** `app/organization/applications/[id]/page.tsx`

**Features:**
- Detailed application view
- Candidate contact information:
  - Workforce Group
  - Phone
  - Email
  - Address
- Occupation & Specialty information
- Core Candidate Information:
  - Preferred Shifts
  - Shift Types
  - Available Start Date
  - Most Recent Job Title
  - Total Years of Experience
  - Date of Birth
  - SSN Last Four
- Occupational Questionnaire Responses
- Specialty Questionnaire Responses
- Requested Time Off (RTO) management:
  - Single Date entries
  - Date Range entries
  - Add new RTO entries
  - Remove RTO entries
- Priority Factors:
  - Compliance percentage
  - Locations Willing to Work
  - Floating Preference
  - Flexible Shift Types
  - Extension Willingness
- Compliance Checklist (at time of submission):
  - Document status (Uploaded/Missing)
  - Upload date tracking
  - Upload button for missing documents
- Candidate Summary Note:
  - Existing summary note display
  - Edit/update summary note
  - Save note functionality
- Status management sidebar:
  - Status dropdown (Submitted, Qualified, Shortlisted, Offer, Accepted, Withdrawn, Rejected)
  - Status update functionality
- Candidate Profile Modal:
  - View candidate profile from application list
  - Add to Talent Community functionality
  - Contact information
  - Professional information
  - Application details
  - Documents list

---

### Compliance Management

#### `/organization/compliance/templates` - Legacy Compliance Templates
**File:** `app/organization/compliance/templates/page.tsx`

**Features:**
- Compliance template list
- Create new template
- Edit existing templates
- Template items management
- Template name and description
- Add/remove compliance items

#### `/organization/compliance/templates/create` - Create Template
**File:** `app/organization/compliance/templates/create/page.tsx`

**Features:**
- Create new compliance template
- Template configuration
- Add compliance items

#### `/organization/compliance/requisition-templates` - Requisition Templates
**File:** `app/organization/compliance/requisition-templates/page.tsx`

**Features:**
- Requisition template list
- Department-based templates
- Create templates per department
- Add compliance items
- Template management

#### `/organization/compliance/requisition-templates/create` - Create Requisition Template
**File:** `app/organization/compliance/requisition-templates/create/page.tsx`

**Features:**
- Create new requisition template
- Department selection
- Compliance items configuration

#### `/organization/compliance/requisition-templates/[id]` - Edit Requisition Template
**File:** `app/organization/compliance/requisition-templates/[id]/page.tsx`

**Features:**
- Edit requisition template
- Compliance items management
- Template configuration

#### `/organization/compliance/wallet-templates` - Wallet Templates
**File:** `app/organization/compliance/wallet-templates/page.tsx`

**Features:**
- Wallet template management
- Occupation-based templates
- Add/edit/delete templates
- Template items configuration

#### `/organization/compliance/wallet-templates/create` - Create Wallet Template
**File:** `app/organization/compliance/wallet-templates/create/page.tsx`

**Features:**
- Create new wallet template
- Occupation assignment
- Compliance items selection

#### `/organization/compliance/wallet-templates/[id]` - Edit Wallet Template
**File:** `app/organization/compliance/wallet-templates/[id]/page.tsx`

**Features:**
- Wallet template editor
- Add/remove compliance items
- Occupation assignment
- Template configuration

#### `/organization/compliance/questionnaire` - Questionnaire Management
**File:** `app/organization/compliance/questionnaire/page.tsx`

**Features:**
- Questionnaire management
- Question configuration
- Answer option mapping

#### `/organization/expiring-credentials` - Expiring Credentials
**File:** `app/organization/expiring-credentials/page.tsx`

**Features:**
- Expiring credentials tracking
- Alert system
- Credential management

---

### Workforce Management

#### `/organization/workforce/talent-community` - Talent Community
**File:** `app/organization/workforce/talent-community/page.tsx`

**Features:**
- Talent community directory
- Candidate profiles
- Search and filter
- Talent pool management

#### `/organization/workforce/workforce-groups` - Workforce Groups
**File:** `app/organization/workforce/workforce-groups/page.tsx`

**Features:**
- Workforce groups listing
- Group management
- Create/edit groups

#### `/organization/workforce/workforce-groups/create` - Create Workforce Group
**File:** `app/organization/workforce/workforce-groups/create/page.tsx`

**Features:**
- Create new workforce group
- Group configuration
- Member assignment

#### `/organization/workforce/workforce-groups/[id]` - Workforce Group Detail
**File:** `app/organization/workforce/workforce-groups/[id]/page.tsx`

**Features:**
- Workforce group details
- Member management
- Group settings

#### `/organization/workforce/placements` - Placements
**File:** `app/organization/workforce/placements/page.tsx`

**Features:**
- Placements listing
- Placement management
- Status tracking

#### `/organization/workforce/placements/create` - Create Placement
**File:** `app/organization/workforce/placements/create/page.tsx`

**Features:**
- Create new placement
- Placement configuration
- Candidate assignment

#### `/organization/workforce/locations-departments` - Locations & Departments
**File:** `app/organization/workforce/locations-departments/page.tsx`

**Features:**
- Locations and departments management
- Hierarchical view
- Add/edit locations and departments

#### `/organization/active-workforce` - Active Workforce
**File:** `app/organization/active-workforce/page.tsx`

**Features:**
- Active workforce listing
- Workforce statistics
- Status tracking

---

### Timekeeping & Billing

#### `/organization/timekeeping` - Timekeeping
**File:** `app/organization/timekeeping/page.tsx`

**Features:**
- Timekeeping dashboard
- Timecard management
- Approval workflow

#### `/organization/timekeeping/[timecardId]` - Timecard Detail
**File:** `app/organization/timekeeping/[timecardId]/page.tsx`

**Features:**
- Detailed timecard view
- Time entry details
- Approval actions

#### `/organization/time-billing/timekeeping` - Time Billing Timekeeping
**File:** `app/organization/time-billing/timekeeping/page.tsx`

**Features:**
- Time billing timekeeping view
- Billing-related time tracking

#### `/organization/time-billing/timekeeping/[timecardId]` - Timecard Detail (Billing)
**File:** `app/organization/time-billing/timekeeping/[timecardId]/page.tsx`

**Features:**
- Timecard detail for billing
- Billing calculations

#### `/organization/time-billing/invoicing` - Invoicing
**File:** `app/organization/time-billing/invoicing/page.tsx`

**Features:**
- Invoice management
- Invoice creation
- Invoice tracking

---

### Finance

#### `/organization/finance` - Finance Dashboard
**File:** `app/organization/finance/page.tsx`

**Features:**
- Finance overview
- Financial metrics
- Quick actions

#### `/organization/finance/spend-analytics` - Spend Analytics
**File:** `app/organization/finance/spend-analytics/page.tsx`

**Features:**
- Spending analytics
- Data visualization
- Trend analysis

#### `/organization/finance/invoice-drafts` - Invoice Drafts
**File:** `app/organization/finance/invoice-drafts/page.tsx`

**Features:**
- Invoice drafts management
- Draft creation and editing
- Approval workflow

#### `/organization/finance/final-invoices` - Final Invoices
**File:** `app/organization/finance/final-invoices/page.tsx`

**Features:**
- Final invoices listing
- Invoice details
- Payment tracking

---

### Hiring & Operations

#### `/organization/hiring-funnel` - Hiring Funnel
**File:** `app/organization/hiring-funnel/page.tsx`

**Features:**
- Hiring funnel visualization
- Stage tracking
- Conversion metrics

#### `/organization/operations` - Operations
**File:** `app/organization/operations/page.tsx`

**Features:**
- Operations dashboard
- Operational metrics
- Process management

#### `/organization/shift` - Shift Management
**File:** `app/organization/shift/page.tsx`

**Features:**
- Shift scheduling
- Shift templates
- Shift management

---

### Management

#### `/organization/management/users` - User Management
**File:** `app/organization/management/users/page.tsx`

**Features:**
- User listing
- User management
- Role assignment

#### `/organization/management/vendors` - Vendor Management
**File:** `app/organization/management/vendors/page.tsx`

**Features:**
- Vendor listing
- Vendor management
- Vendor relationships

#### `/organization/management/notes` - Notes Management
**File:** `app/organization/management/notes/page.tsx`

**Features:**
- Notes listing
- Note creation and editing
- Note organization

---

### Admin Settings

#### `/organization/admin` - Admin Dashboard
**File:** `app/organization/admin/page.tsx`

**Features:**
- Admin overview
- Administrative tools
- Quick actions

#### `/organization/admin/shift-templates` - Shift Templates
**File:** `app/organization/admin/shift-templates/page.tsx`

**Features:**
- Shift template management
- Template creation
- Template configuration

#### `/organization/admin/workforce-group-status` - Workforce Group Status
**File:** `app/organization/admin/workforce-group-status/page.tsx`

**Features:**
- Workforce group status tracking
- Status management
- Group monitoring

#### `/organization/admin/billing` - Billing
**File:** `app/organization/admin/billing/page.tsx`

**Features:**
- Billing management
- Payment settings
- Billing history

#### `/organization/admin/approvals` - Approvals
**File:** `app/organization/admin/approvals/page.tsx`

**Features:**
- Approval workflow
- Pending approvals
- Approval actions

---

### Reports & Analytics

#### `/organization/reports` - Reports Dashboard
**File:** `app/organization/reports/page.tsx`

**Features:**
- Reports dashboard
- Analytics and metrics
- Data visualization
- Report generation

---

### Settings

#### `/organization/settings` - Organization Settings
**File:** `app/organization/settings/page.tsx`

**Features:**
- Organization settings
- Configuration management
- Preferences

---

## Admin Portal

### Authentication

#### `/admin/login` - Admin Login
**File:** `app/admin/login/page.tsx`

**Features:**
- Admin authentication
- System stats display
- Full access description
- Simulated login flow

---

### Dashboard & Overview

#### `/admin/dashboard` - Admin Dashboard
**File:** `app/admin/dashboard/page.tsx`

**Features:**
- Admin overview
- Total organizations count
- Total locations count
- Active organizations
- Organizations list
- Quick actions (Add Organization)
- System statistics
- Recent activity

#### `/admin/metrics` - Metrics Dashboard
**File:** `app/admin/metrics/page.tsx`

**Features:**
- System-wide metrics
- Analytics dashboard
- Data visualization
- Key performance indicators

---

### Organization Management

#### `/admin/organizations` - Organizations List
**File:** `app/admin/organizations/page.tsx`

**Features:**
- Organizations listing
- Organization cards
- Search and filter
- Organization statistics
- Quick actions

#### `/admin/organizations/add` - Add Organization
**File:** `app/admin/organizations/add/page.tsx`

**Features:**
- Create new organization
- Organization form:
  - Name
  - Email
  - Phone
  - Website
  - Industry
  - Description
- Add locations
- Location form:
  - Name
  - Address
  - City, State, Zip
  - Phone
  - Email
- Save to localStorage
- Form validation

#### `/admin/organizations/[id]` - Organization Detail
**File:** `app/admin/organizations/[id]/page.tsx`

**Features:**
- Organization detail page
- Edit organization information
- Manage locations
- View organization data
- Tabbed interface:
  - Profile
  - Locations
  - Departments
  - Users
  - Vendors
  - Workforce Groups
  - Compliance Templates
  - Occupations
  - Specialties
  - Metrics
  - Reports
  - Audit Logs
  - Billing
  - Integrations
  - Notifications
  - Settings
  - Permissions
  - Branding
  - Data Import/Export

#### `/admin/organizations/[id]/profile` - Organization Profile
**File:** `app/admin/organizations/[id]/profile.tsx`

**Features:**
- Organization profile editor
- Basic information
- Contact details
- Industry information

#### `/admin/organizations/[id]/locations` - Organization Locations
**File:** `app/admin/organizations/[id]/locations.tsx`  
**Page:** `app/admin/organizations/[id]/locations/page.tsx`

**Features:**
- Locations management
- Add/edit/delete locations
- Location details
- Department management per location

#### `/admin/organizations/[id]/departments` - Organization Departments
**File:** `app/admin/organizations/[id]/departments.tsx`  
**Page:** `app/admin/organizations/[id]/departments/page.tsx`

**Features:**
- Departments management
- Department hierarchy
- Add/edit/delete departments

#### `/admin/organizations/[id]/users` - Organization Users
**File:** `app/admin/organizations/[id]/users/page.tsx`

**Features:**
- User listing for organization
- User management
- Role assignment
- User details

#### `/admin/organizations/[id]/vendors` - Organization Vendors
**File:** `app/admin/organizations/[id]/vendors/page.tsx`

**Features:**
- Vendor listing for organization
- Vendor management
- Vendor relationships
- Vendor details

#### `/admin/organizations/[id]/vendors/[vendorId]` - Vendor Detail (Org Context)
**File:** `app/admin/organizations/[id]/vendors/[vendorId]/page.tsx`

**Features:**
- Vendor detail in organization context
- Read-only vendor information
- Vendor documents
- Vendor notes
- Vendor occupations
- Vendor users

#### `/admin/organizations/[id]/workforce-groups` - Organization Workforce Groups
**File:** `app/admin/organizations/[id]/workforce-groups/page.tsx`

**Features:**
- Workforce groups for organization
- Group management
- Group configuration

#### `/admin/organizations/[id]/document-wallet-templates` - Document Wallet Templates
**File:** `app/admin/organizations/[id]/document-wallet-templates/page.tsx`

**Features:**
- Document wallet templates for organization
- Template management
- Template configuration

#### `/admin/organizations/[id]/occupations` - Organization Occupations
**File:** `app/admin/organizations/[id]/occupations/page.tsx`

**Features:**
- Occupations for organization
- Occupation management
- Occupation configuration

#### `/admin/organizations/[id]/specialties` - Organization Specialties
**File:** `app/admin/organizations/[id]/specialties/page.tsx`

**Features:**
- Specialties for organization
- Specialty management
- Specialty configuration

#### `/admin/organizations/[id]/tagging-rules` - Tagging Rules
**File:** `app/admin/organizations/[id]/tagging-rules/page.tsx`

**Features:**
- Tagging rules for organization
- Rule management
- Rule configuration

#### `/admin/organizations/[id]/metrics-dashboard` - Metrics Dashboard
**File:** `app/admin/organizations/[id]/metrics-dashboard/page.tsx`

**Features:**
- Organization-specific metrics
- Analytics dashboard
- Performance indicators

#### `/admin/organizations/[id]/reports-library` - Reports Library
**File:** `app/admin/organizations/[id]/reports-library/page.tsx`

**Features:**
- Reports library for organization
- Report generation
- Report templates

#### `/admin/organizations/[id]/audit-logs` - Audit Logs
**File:** `app/admin/organizations/[id]/audit-logs/page.tsx`

**Features:**
- Audit log viewing
- Activity tracking
- Log filtering

#### `/admin/organizations/[id]/billing` - Billing
**File:** `app/admin/organizations/[id]/billing/page.tsx`

**Features:**
- Billing management
- Payment settings
- Billing history

#### `/admin/organizations/[id]/integrations` - Integrations
**File:** `app/admin/organizations/[id]/integrations/page.tsx`

**Features:**
- Integration management
- API configuration
- Third-party integrations

#### `/admin/organizations/[id]/notifications` - Notifications
**File:** `app/admin/organizations/[id]/notifications/page.tsx`

**Features:**
- Notification settings
- Notification configuration
- Notification templates

#### `/admin/organizations/[id]/settings` - Settings
**File:** `app/admin/organizations/[id]/settings/page.tsx`

**Features:**
- Organization settings
- Configuration management
- Preferences

#### `/admin/organizations/[id]/permissions` - Permissions
**File:** `app/admin/organizations/[id]/permissions/page.tsx`

**Features:**
- Permission management
- Role-based access control
- Permission configuration

#### `/admin/organizations/[id]/branding` - Branding
**File:** `app/admin/organizations/[id]/branding/page.tsx`

**Features:**
- Branding customization
- Logo upload
- Color scheme
- Theme configuration

#### `/admin/organizations/[id]/data-import-export` - Data Import/Export
**File:** `app/admin/organizations/[id]/data-import-export/page.tsx`

**Features:**
- Data import functionality
- Data export functionality
- Import/export templates

#### `/admin/organizations/[id]/timekeeping` - Timekeeping
**File:** `app/admin/organizations/[id]/timekeeping/page.tsx`

**Features:**
- Timekeeping management
- Timecard viewing
- Time tracking

#### `/admin/organizations/[id]/timekeeping/[timecardId]` - Timecard Detail
**File:** `app/admin/organizations/[id]/timekeeping/[timecardId]/page.tsx`

**Features:**
- Detailed timecard view
- Time entry details
- Approval actions

#### `/admin/organizations/[id]/time-approvals` - Time Approvals
**File:** `app/admin/organizations/[id]/time-approvals/page.tsx`

**Features:**
- Time approval workflow
- Pending approvals
- Approval actions

#### `/admin/organizations/[id]/invoice-templates` - Invoice Templates
**File:** `app/admin/organizations/[id]/invoice-templates/page.tsx`

**Features:**
- Invoice template management
- Template creation
- Template configuration

#### `/admin/organizations/[id]/posting-feed` - Posting Feed
**File:** `app/admin/organizations/[id]/posting-feed/page.tsx`

**Features:**
- Posting feed management
- Feed configuration
- Content management

#### `/admin/organizations/[id]/general-questionnaire` - General Questionnaire
**File:** `app/admin/organizations/[id]/general-questionnaire/page.tsx`

**Features:**
- General questionnaire management
- Question configuration
- Answer mapping

#### `/admin/organizations/[id]` - Organization Detail (includes tabs)
**File:** `app/admin/organizations/[id]/page.tsx`

**Features:**
- Organization detail page with tabbed interface
- **Profile Tab:**
  - Organization profile editor
  - Basic information (name, type, industry)
  - Contact details (email, phone, address)
  - Organization logo upload/management
  - Timezone selection
  - Service agreement management
  - Agreement renewal date
  - Expected annual spend
  - Description/notes
  - Status toggle (Active/Inactive)
- **Locations Tab:**
  - Locations management interface
  - Add new location
  - Edit existing location
  - Delete location
  - Location form fields (name, address, city, state, zip, phone, location type)
  - Locations table
  - Department count per location
- **Departments Tab:**
  - Departments management interface
  - Add new department
  - Edit existing department
  - Delete department
  - Department form fields (name, type, cost centre, related users, related occupations/specialties)
  - Filter departments by location
  - Departments table
  - Department statistics
- **Workforce Groups Tab:**
  - Workforce groups management interface
  - Add new workforce group
  - Edit existing workforce group
  - Delete workforce group
  - Workforce group form fields (modality, name, shift visibility settings, routing position, status)
  - Workforce groups table
  - Group statistics
- **Documents Tab:**
  - Document management for organization
  - Add new documents
  - Document types (Legal, Marketing, Finance, HR, Project)
  - Document upload
  - Document filtering (search, date range, type)
  - Documents table with download and delete actions
  - Pagination
- **Notes Tab:**
  - Notes management
  - Note creation
  - Note type filtering (General, Billing, Issue, Request, Follow-up)
  - Date range filtering
  - Search functionality
  - Notes history table
  - Pagination

---

### Location Management

#### `/admin/locations` - All Locations
**File:** `app/admin/locations/page.tsx`

**Features:**
- All locations across organizations
- Location details
- Organization association
- Departments per location
- Add/edit locations
- Search and filter

#### `/admin/locations/[id]` - Location Detail
**File:** `app/admin/locations/[id]/page.tsx`

**Features:**
- Location detail page
- Edit location information
- Department management (add/remove/update)
- Organization context
- Location settings

---

### User Management

#### `/admin/users` - Users List
**File:** `app/admin/users/page.tsx`

**Features:**
- View all users
- User details and roles
- Organization association
- User statistics
- Search and filter

#### `/admin/users/[id]` - User Detail
**File:** `app/admin/users/[id]/page.tsx`

**Features:**
- User detail page
- User information
- Role management
- Activity tracking

---

### Vendor Management

#### `/admin/vendors` - Vendors List
**File:** `app/admin/vendors/page.tsx`

**Features:**
- Vendor directory
- Vendor listing
- Vendor statistics
- Search and filter

#### `/admin/vendors/[id]` - Vendor Detail (includes tabs)
**File:** `app/admin/vendors/[id]/page.tsx`

**Features:**
- Detailed vendor information with tabbed interface
- **Profile Tab:**
  - Vendor profile editor
  - Vendor logo upload/management
  - Vendor name, industries, certified business classifications
  - About vendor description
  - Tax ID Number, phone, website, address
  - Annual revenue, employee count
  - Internal Vendor ID Number (read-only)
  - Created Date (read-only)
  - Active/Inactive status toggle
  - Activation/Inactivation date tracking
  - Associated Organizations component
- **Documents Tab:**
  - Document management for vendor
  - Add/edit/delete documents
  - Document types (Legal, Marketing, Finance, HR, Project, Other)
  - Document upload and description
  - Document filtering (search, date range, type)
  - Documents table with pagination
  - Download functionality
- **Notes Tab:**
  - Notes management for vendor
  - Add/edit/delete notes
  - Note types (General, Billing, Issue, Request, Other)
  - Organization association (optional)
  - Notes filtering (organization, type, date range, search)
  - Notes history table with pagination
- **Occupations Tab:**
  - Vendor occupation specialization management
  - Two-column interface (Available/Selected)
  - Search functionality for both columns
  - Checkbox selection with transfer buttons
  - Alphabetical sorting
- **Vendor Users Tab:**
  - Vendor users management
  - Add/edit/delete vendor users
  - User form fields (name, title, email, phones, status)
  - Users table with sortable columns
  - Search functionality
- **Associated Organizations Tab:**
  - Vendor-organization associations management
  - Add/edit/delete associations
  - Association form fields (organization, status, dates, notes)
  - Associations list display with status badges
  - Link to organization detail page

#### `/admin/vendors/[id]/view` - Vendor View
**File:** `app/admin/vendors/[id]/view/page.tsx`

**Features:**
- Vendor view page
- Read-only vendor information

---

### MSP Management

#### `/admin/msp` - MSPs List
**File:** `app/admin/msp/page.tsx`

**Features:**
- MSP listing
- MSP management
- MSP statistics

#### `/admin/msp/[id]` - MSP Detail (includes tabs)
**File:** `app/admin/msp/[id]/page.tsx`

**Features:**
- MSP detail page with tabbed interface
- **Profile Tab:**
  - MSP profile management
  - Profile information display
  - Profile editing
- **Documents Tab:**
  - MSP documents management
  - Document listing
  - Document upload
  - Document management
- **Notes Tab:**
  - MSP notes management
  - Notes listing
  - Note creation
  - Note editing

---

### Workforce Management

#### `/admin/occupations` - Occupations
**File:** `app/admin/occupations/page.tsx`

**Features:**
- Occupations listing
- Occupation management
- Add/edit/delete occupations
- Occupation details

#### `/admin/occupations/[id]` - Occupation Detail
**File:** `app/admin/occupations/[id]/page.tsx`

**Features:**
- Occupation detail page
- Occupation information
- Related specialties
- Questionnaire configuration

#### `/admin/occupations/[id]/questionnaire` - Occupation Questionnaire
**File:** `app/admin/occupations/[id]/questionnaire/page.tsx`

**Features:**
- Occupation-specific questionnaire
- Question management
- Answer option mapping

#### `/admin/occupations/[id]/specialties` - Occupation Specialties
**File:** `app/admin/occupations/[id]/specialties/page.tsx`

**Features:**
- Specialties for occupation
- Specialty management
- Specialty configuration

#### `/admin/specialties` - Specialties
**File:** `app/admin/specialties/page.tsx`

**Features:**
- Specialties listing
- Specialty management
- Add/edit/delete specialties

#### `/admin/workforce-groups` - Workforce Groups
**File:** `app/admin/workforce-groups/page.tsx`

**Features:**
- Workforce groups listing
- Group management
- Add/edit/delete groups

#### `/admin/workforce-groups/add` - Add Workforce Group
**File:** `app/admin/workforce-groups/add/page.tsx`

**Features:**
- Create new workforce group
- Group configuration
- Member assignment

#### `/admin/workforce-groups/[id]` - Workforce Group Detail
**File:** `app/admin/workforce-groups/[id]/page.tsx`

**Features:**
- Workforce group details
- Member management
- Group settings

#### `/admin/workforce-groups/[id]/edit` - Edit Workforce Group
**File:** `app/admin/workforce-groups/[id]/edit/page.tsx`

**Features:**
- Edit workforce group
- Update group configuration
- Modify members

#### `/admin/workforce/tagging-rules` - Tagging Rules
**File:** `app/admin/workforce/tagging-rules/page.tsx`

**Features:**
- Tagging rules listing
- Rule management
- Add/edit/delete rules

#### `/admin/workforce/tagging-rules/add` - Add Tagging Rule
**File:** `app/admin/workforce/tagging-rules/add/page.tsx`

**Features:**
- Create new tagging rule
- Rule configuration
- Rule conditions

#### `/admin/workforce/tagging-rules/[id]` - Tagging Rule Detail
**File:** `app/admin/workforce/tagging-rules/[id]/page.tsx`

**Features:**
- Tagging rule details
- Rule configuration
- Rule conditions

#### `/admin/workforce/tagging-rules/[id]/edit` - Edit Tagging Rule
**File:** `app/admin/workforce/tagging-rules/[id]/edit/page.tsx`

**Features:**
- Edit tagging rule
- Update rule configuration
- Modify conditions

---

### Compliance Management

#### `/admin/compliance/list-items` - Compliance List Items
**File:** `app/admin/compliance/list-items/page.tsx`

**Features:**
- Compliance items master list
- CRUD operations for compliance items
- Categorized items:
  - Licenses
  - Certifications
  - Background Checks
  - etc.
- Global item definitions
- Search and filter

#### `/admin/compliance/list-items/add` - Add Compliance Item
**File:** `app/admin/compliance/list-items/add/page.tsx`

**Features:**
- Create new compliance item
- Item configuration
- Category assignment
- Expiration type

#### `/admin/compliance/list-items/[id]` - Compliance Item Detail
**File:** `app/admin/compliance/list-items/[id]/page.tsx`

**Features:**
- Compliance item details
- Item information
- Usage tracking

#### `/admin/compliance/list-items/[id]/edit` - Edit Compliance Item
**File:** `app/admin/compliance/list-items/[id]/edit/page.tsx`

**Features:**
- Edit compliance item
- Update item configuration
- Modify category

#### `/admin/compliance/templates` - Compliance Templates
**File:** `app/admin/compliance/templates/page.tsx`

**Features:**
- Global compliance template management
- Template list
- Create/edit/delete templates
- Template items configuration

#### `/admin/compliance/templates/create` - Create Template
**File:** `app/admin/compliance/templates/create/page.tsx`

**Features:**
- Create new compliance template
- Template name and description
- Add compliance items

#### `/admin/compliance/templates/[id]` - Edit Template
**File:** `app/admin/compliance/templates/[id]/page.tsx`

**Features:**
- Edit compliance template
- Manage template items
- Add/remove items using modal


#### `/admin/document-wallet-templates` - Document Wallet Templates (Invoice Templates)
**File:** `app/admin/document-wallet-templates/page.tsx`

**Features:**
- Document wallet templates (global)
- Template management
- Template configuration
- Note: This appears to be labeled as "Invoice Templates" in navigation but may serve dual purpose

---

### Tags Management

#### `/admin/tags` - Tags
**File:** `app/admin/tags/page.tsx`

**Features:**
- Tags listing
- Tag management
- Add/edit/delete tags
- Tag usage tracking

---

### Reports & Analytics

#### `/admin/reports` - Report Library
**File:** `app/admin/reports/page.tsx`

**Features:**
- Report library
- Report generation
- Report templates
- System-wide reports

---

### Position Transfers

#### `/admin/position-transfers` - Position Transfer List
**File:** `app/admin/position-transfers/page.tsx`

**Features:**
- Position transfer listing
- Transfer management
- Transfer tracking

---

### Notifications

#### `/admin/notifications` - Notifications
**File:** `app/admin/notifications/page.tsx`

**Features:**
- Notification management
- Notification configuration
- System notifications

---

### Questionnaire

#### `/admin/questionnaire` - Questionnaire Management
**File:** `app/admin/questionnaire/page.tsx`

**Features:**
- Questionnaire management
- Question configuration
- Answer option mapping
- Global questionnaire settings

---

## Summary Statistics

### Total Pages by Module:
- **Candidate Portal:** 18 pages
- **Organization Portal:** 40+ pages
- **Admin Portal:** 80+ pages
- **Landing:** 1 page

### User-Facing Features:
- **Tab-Based Interfaces:** Organization detail, Vendor detail (admin view), MSP detail pages use tabbed interfaces for organized information display
- **Multi-Select Components:** Advanced multi-select with search for users, occupations, specialties
- **Sortable Tables:** Multiple tables with column sorting functionality
- **Pagination:** Pagination support in multiple list views
- **Advanced Filtering:** Date range filters, type filters, search filters across multiple pages
- **Global Search:** Command palette (⌘K) for quick navigation
- **Dark Mode:** Theme switching support
- **Responsive Design:** Mobile-first approach with breakpoints

### Key Features:
- ✅ Multi-portal architecture (3 accessible portals: Candidate, Organization, Admin)
- ✅ Authentication (simulated)
- ✅ Profile management
- ✅ Document wallet system
- ✅ Job management
- ✅ Application tracking
- ✅ Compliance template system
- ✅ Questionnaire system
- ✅ Timekeeping
- ✅ Billing & invoicing
- ✅ Reporting & analytics
- ✅ User management
- ✅ Vendor management
- ✅ Organization management
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Local storage persistence

---

**End of Document**

