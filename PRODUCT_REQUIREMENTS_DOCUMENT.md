# PRODUCT REQUIREMENTS DOCUMENT (PRD) / STATEMENT OF WORK (SOW)

## Workforce Management Platform

**Version:** 2.0  
**Last Updated:** January 2025  
**Status:** MVP (Prototype)  
**Project Type:** Multi-Portal Workforce Management System

---

## 1. Executive Summary

### 1.1 Project Purpose

To build a comprehensive workforce management platform that connects organizations, candidates, vendors, and administrators in a unified system. The platform enables organizations to create jobs with compliance requirements, manage candidate applications, and collaborate with vendors. Candidates can complete dynamic onboarding, maintain a reusable document wallet, and apply for jobs seamlessly.

### 1.2 Project Goals

Deliver a functional MVP that enables:

**Organizations:**
- Create and publish job postings with compliance checklist templates
- Manage multiple types of compliance templates
- View and filter all applications for jobs
- Track application status and candidate details

**Candidates:**
- Complete dynamic onboarding via questionnaire system
- Upload and manage compliance documents in a reusable Document Wallet
- Browse job listings and view job details
- Apply for jobs with automatic document attachment from wallet
- Track application status

**Administrators:**
- Manage organizations and their configurations
- Manage locations, departments, and system settings
- Manage compliance items and templates globally
- Monitor system health and access analytics

**Vendors:**
- View vendor directory and details
- Submit bids for jobs
- Track performance metrics and KPIs

### 1.3 Target Audience

- **Organizations**: Healthcare facilities, staffing agencies, and other organizations hiring workforce
- **Candidates**: Healthcare professionals, clinicians, and other workers seeking opportunities
- **Administrators**: Platform administrators managing the system
- **Vendors**: Third-party staffing vendors and MSPs

---

## 2. System Architecture

The platform consists of **four distinct portals**:

1. **Candidate Portal** - Profile & Onboarding, Document Wallet, Job browsing & application flow
2. **Organization Portal** - Job creation, Compliance template management, Application overview
3. **Admin Portal** - Organization management, System administration, Compliance management
4. **Vendor Portal** - Bid submission, Performance tracking, Vendor directory

---

## 3. Features & Functionality

### 3.1 Candidate Portal

#### 3.1.1 Authentication & Profile
- Email/password authentication
- Sign-up flow with occupation and specialty selection
- Google OAuth support
- Profile management (personal info, skills, specialties, experience)
- Availability preferences

#### 3.1.2 Dynamic Onboarding
- **Questionnaire System:**
  - Two-step questionnaire (Occupation-specific + General)
  - Dynamic questions based on selected occupation
  - File upload support within questions
  - Answer validation and auto-save
  
- **Document Requirements:**
  - Requirements determined dynamically by questionnaire answers
  - Mapping from answer options to compliance items
  - Documents uploaded during questionnaire automatically added to wallet
  - "Skip for now" option available (uploads are optional)

#### 3.1.3 Document Wallet
- Upload new documents with name, type, and expiry date
- Replace existing documents
- Delete documents
- Document preview
- Status tracking (Completed, Pending Verification, Expired, Pending Upload, Validation Failed)
- Filter by status
- Required vs optional indicators
- Source tracking (onboarding vs wallet uploads)
- Expiration date management

#### 3.1.4 Job Discovery & Application
- **Job Browsing:**
  - Job listing with filters (location, department, shift)
  - Search functionality
  - Job cards with key details
  
- **Job Details:**
  - Full job description
  - Requirements list
  - Compliance requirements display
  - Readiness check before application
  
- **Application Flow:**
  - Readiness engine checks:
    - Profile completeness
    - Required documents availability
    - Compliance status
  - Automatic document attachment from wallet
  - Missing documents alert
  - Application submission with status tracking

#### 3.1.5 Application Tracking
- Application list with status indicators
- Expandable rows for details
- Filter by status
- Document status per application
- Match score display
- Submitted date tracking

#### 3.1.6 Dashboard
- Job readiness status banner
- Onboarding completion percentage
- Document compliance status
- Quick action cards
- Recent activity feed
- Stats cards (Applications, Documents, Profile completion)

#### 3.1.7 Notifications
- Notification feed
- Mark as read/unread
- Filter by type (job, system)
- Notification preferences

### 3.2 Organization Portal

#### 3.2.1 Authentication
- Email + OTP authentication
- Organization lookup by email
- Organization context management

#### 3.2.2 Job Management
- **Job Creation:**
  - Full job creation form:
    - Title, location, department, unit, shift, hours
    - Pay range (min/max)
    - Description
    - Occupation selection
    - Compliance template selection (Requisition Templates or Legacy Templates)
  - Save as draft or publish
  - Validation and error handling
  
- **Job Listing:**
  - View all jobs (draft and published)
  - Filter by status
  - Job details and editing

#### 3.2.3 Compliance Template Management

**Legacy Templates:**
- Create/edit/delete compliance templates
- Add/remove compliance items
- Template name and description
- Used for general job requirements

**Requisition Templates:**
- Department-based templates
- Create templates per department
- Add compliance items
- Used when creating jobs

**Wallet Templates:**
- Occupation-based templates
- Define required documents per occupation
- Used to determine candidate document requirements

#### 3.2.4 Application Management
- **Applications List:**
  - View all applications for organization's jobs
  - Filter by job, status, date
  - Application status indicators
  - Document status per application
  
- **Application Details:**
  - Candidate information
  - Contact details
  - Compliance status
  - Document attachments
  - Application notes
  - Status updates (Submitted, Qualified, Interview, Offer, Accepted, Rejected)

#### 3.2.5 Dashboard
- Organization overview
- Job statistics
- Application metrics
- Quick actions

#### 3.2.6 Reports
- Reports dashboard
- Analytics and metrics
- Data visualization

### 3.3 Admin Portal

#### 3.3.1 Organization Management
- Create/edit/delete organizations
- Organization detail management:
  - Profile, locations, departments, users
  - Compliance templates, occupations, specialties
  - Workforce groups, tagging rules
  - Metrics, reports, audit logs
  - Billing, integrations, notifications

#### 3.3.2 Location Management
- Create/edit/delete locations
- Location detail pages
- Department management per location
- Organization association

#### 3.3.3 Compliance Management
- **Compliance Items Master List:**
  - CRUD operations for compliance items
  - Categorized items (Licenses, Certifications, Background Checks, etc.)
  - Global item definitions
  
- **Compliance Templates:**
  - Global template management
  - Create/edit/delete templates
  - Template items configuration

#### 3.3.4 User Management
- View all users
- User details and roles
- Organization association

#### 3.3.5 Vendor Management
- Vendor directory
- Vendor details
- Performance tracking

#### 3.3.6 System Administration
- Metrics dashboard
- Report library
- Audit logs
- MSP management
- Workforce groups
- Tagging rules

### 3.4 Vendor Portal

#### 3.4.1 Vendor Directory
- View all vendors
- Vendor cards with tier (Premier, Preferred, Approved)
- KPIs display (fill rate, response time, candidates supplied)
- Certifications list

#### 3.4.2 Vendor Details
- Detailed vendor information
- Description and metadata
- Certifications with expiration
- Agreements list
- Contacts directory
- Bids history
- Documents library

#### 3.4.3 Bid Submission
- Bid submission interface
- Bid list with status (Draft, Submitted, Awarded)
- Submit new bid
- Rate and availability input
- Job association

#### 3.4.4 Performance Metrics
- Performance metrics dashboard
- KPI cards
- Vendor leaderboard
- Score calculation
- Performance trends

---

## 4. Data Models & Relationships

### 4.1 Core Entities

**Organizations**
- One Organization → many Jobs
- One Organization → many Compliance Checklist Templates (Legacy, Requisition, Wallet)
- One Organization → many Users (org role)
- One Organization → many Locations
- One Organization → many Departments

**Users**
- Two roles: Candidate and Org User
- One Candidate → one Profile
- One Candidate → many Documents (Document Wallet)
- One Candidate → many Applications
- One Org User → belongs to one Organization

**Candidate Profile**
- One Profile → belongs to one Candidate
- One Profile → many Questionnaire Answers (used to determine required documents)
- Profile completion percentage tracked

**Questionnaire System**
- One Questionnaire → Many Questions
- One Question → many Answer Options
- One Answer Option → many Mapped Compliance Items (document requirements)
- Occupation-specific questionnaires
- General questionnaires

**Compliance System**
- **Compliance Item Templates** (Master List - Admin managed)
  - One Compliance Item Template → used by many Compliance Checklist Templates
  - One Compliance Item Template → used by many Candidate Documents
  
- **Compliance Checklist Templates** (Three Types)
  - **Legacy Templates**: General purpose templates
  - **Requisition Templates**: Department-based templates for job creation
  - **Wallet Templates**: Occupation-based templates for candidate document requirements
  
- One Checklist Template → many Checklist Template Items
- One Checklist Template Item → references one Compliance Item Template

**Document Wallet**
- One Candidate → many Candidate Documents
- One Candidate Document → references one Compliance Item Template
- Document status: "Completed" | "Pending Verification" | "Expired" | "Pending Upload" | "Validation Failed"
- Documents track expiration dates and upload sources (onboarding vs wallet)

**Jobs**
- One Organization → many Jobs
- One Job → one Compliance Checklist Template (Requisition Template)
- One Job → many Applications
- Job status: "Open" | "Closed" | "Draft"
- Jobs include: title, location, department, unit, shift, hours, bill rate, description, requirements, tags

**Applications**
- One Application → belongs to one Job
- One Application → belongs to one Candidate
- Application status: "Submitted" | "Qualified" | "Interview" | "Offer" | "Accepted" | "Rejected"
- Document status tracked per application: "Complete" | "Missing" | "Pending"
- Applications auto-attach available documents from candidate wallet
- Missing documents list stored in application payload

**Vendors**
- Vendor tier: "Premier" | "Preferred" | "Approved"
- One Vendor → many Bids
- One Vendor → many Certifications
- KPIs tracked: fill rate, response time, candidates supplied

**Bids**
- One Bid → belongs to one Job
- One Bid → belongs to one Vendor
- Bid status: "Draft" | "Submitted" | "Awarded"

---

## 5. User Flows

### 5.1 Candidate Journey

1. **Sign Up / Login**
   - Candidate signs up with email, password, occupation, specialty
   - Or logs in with existing credentials
   - Redirected to dashboard

2. **Onboarding**
   - Redirected to questionnaire page
   - Complete occupation-specific questionnaire
   - Complete general questionnaire
   - Upload required documents during questionnaire
   - Documents automatically added to wallet

3. **Profile Setup**
   - Complete profile information
   - Add skills, specialties, experience
   - Set availability preferences

4. **Document Management**
   - Upload additional documents to wallet
   - Replace expired documents
   - Track document status and expiration

5. **Job Application**
   - Browse available jobs
   - View job details and requirements
   - System checks readiness (profile, documents, compliance)
   - Apply to job (documents auto-attached from wallet)
   - Track application status

### 5.2 Organization Journey

1. **Login**
   - Enter organization email
   - Receive OTP
   - Verify OTP and access dashboard

2. **Compliance Template Setup**
   - Create legacy templates for general use
   - Create requisition templates for departments
   - Create wallet templates for occupations
   - Add compliance items to templates

3. **Job Creation**
   - Fill out job creation form
   - Select compliance template (requisition or legacy)
   - Save as draft or publish immediately

4. **Application Review**
   - View all applications for jobs
   - Filter by status, job, date
   - Review candidate details and documents
   - Update application status
   - Add notes

### 5.3 Admin Journey

1. **Login**
   - Admin credentials
   - Access admin dashboard

2. **Organization Management**
   - Create new organizations
   - Edit organization details
   - Manage organization locations and departments

3. **Compliance Management**
   - Manage compliance items master list
   - Create/edit global compliance templates
   - Review system-wide compliance

4. **System Monitoring**
   - View metrics dashboard
   - Access reports
   - Monitor system health

### 5.4 Vendor Journey

1. **Login**
   - Vendor authentication
   - Access vendor portal

2. **View Opportunities**
   - Browse available jobs
   - View job details

3. **Submit Bids**
   - Create bid for job
   - Enter rate and availability
   - Submit bid

4. **Track Performance**
   - View performance metrics
   - Check KPI scores
   - Review leaderboard

---

## 6. Assumptions & Constraints

### 6.1 Business Assumptions

1. Document uploads are optional in onboarding
2. Compliance templates are editable by orgs (and admins globally)
3. The system uses a single master compliance-item list for consistency
4. Organizations can have multiple compliance template types (legacy, requisition, wallet)
5. Candidates can apply to multiple jobs
6. Applications auto-attach available documents from wallet
7. Missing documents are tracked per application
8. Organizations can save jobs as drafts before publishing
9. Job status can be: Open, Closed, or Draft
10. Application status workflow: Submitted → Qualified → Interview → Offer → Accepted/Rejected

### 6.2 Functional Constraints

1. Single user per browser session
2. No concurrent multi-user support in current implementation
3. No real-time updates between users
4. Data persistence is browser-based (localStorage)
5. Authentication is simulated (no real OAuth/OTP integration in MVP)
6. Document uploads store file names only (no actual file storage in MVP)

---

## 7. Out of Scope (Current MVP)

The following features are **NOT** included in the current MVP:

### 7.1 Backend Features
- Real authentication (OAuth, OTP via email service)
- Database integration
- API endpoints
- File storage service
- Email service integration
- Real-time updates

### 7.2 Advanced Features
- Advanced candidate matching algorithms
- Interview scheduling functionality
- Video/document upload capabilities (real file processing)
- Multi-stage hiring workflows
- Email notifications beyond OTP
- Candidate messaging system
- Analytics and reporting dashboards (real data)
- Mobile applications (native)
- Payment processing
- Background check integrations
- Resume parsing/AI features
- Custom job template creation (only hardcoded templates)
- Role-based access control within organizations (multi-user orgs)
- Advanced search functionality
- Social media login options (real integration)

### 7.3 Production Features
- Error tracking and logging
- Performance monitoring
- Security hardening
- Data encryption
- Backup and recovery
- Scalability optimizations

---

## 8. Success Criteria

### 8.1 Functional Requirements
- All four portals functional end-to-end
- All core user flows working
- Data persistence functional
- No critical bugs in core flows

### 8.2 User Experience Requirements
- Intuitive navigation
- Clear status indicators
- Helpful error messages
- Responsive design

### 8.3 Business Requirements
- Organizations can create jobs with compliance templates
- Candidates can complete onboarding and apply for jobs
- Applications can be tracked and managed
- Compliance documents can be managed in wallet
- Vendors can submit bids and track performance

---

## 9. Future Enhancements (Post-MVP)

### 9.1 Backend Integration
- Replace client-side storage with real database
- Implement RESTful API or GraphQL
- Real authentication and authorization
- File storage service integration

### 9.2 Enhanced Features
- Real-time notifications
- Advanced search and filtering
- AI-powered candidate matching
- Interview scheduling
- Multi-stage application workflows
- Email and SMS notifications
- Advanced analytics and reporting

### 9.3 Mobile Support
- Responsive design improvements
- Progressive Web App (PWA)
- Native mobile applications

### 9.4 Enterprise Features
- Multi-tenant architecture
- Role-based access control
- Audit logging
- Data export/import
- Custom branding per organization
- API integrations
- Webhook support

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Original PRD for 2-week MVP |
| 2.0 | Jan 2025 | Updated to reflect current implementation with four portals |

---

**End of Document**





