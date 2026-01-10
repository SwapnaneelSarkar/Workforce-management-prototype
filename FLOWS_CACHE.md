## Cached user-flow prompts (Eraser-style)

This file captures the **latest updated versions** of the flow prompts from this chat so we can reuse them later.

---

### Module: Users + Workforce Groups + Talent Community

```text
title Admin, Org, Candidate Flow (Module: Users + Workforce Groups + Talent Community)
direction right

Start [shape: oval, icon: play]

// =====================================================
// SECTION: Admin (Platform Admin)
// =====================================================
Admin Manage Vendors [shape: rectangle, color: lightblue, icon: users]
Admin Create/Edit/Delete Vendor [shape: rectangle, color: lightblue, icon: settings]
Admin Vendor network updated [shape: rectangle, color: green, icon: check-circle]

Admin Manage Workforce Groups (routing order) [shape: rectangle, color: lightblue, icon: layers]
Admin Add/Edit/Delete Workforce Group [shape: rectangle, color: lightblue, icon: settings]
Admin Workforce groups updated [shape: rectangle, color: green, icon: check-circle]

// Relationships (Admin)
Start > Admin Manage Vendors
Admin Manage Vendors > Admin Create/Edit/Delete Vendor
Admin Create/Edit/Delete Vendor > Admin Vendor network updated

Start > Admin Manage Workforce Groups (routing order)
Admin Manage Workforce Groups (routing order) > Admin Add/Edit/Delete Workforce Group
Admin Add/Edit/Delete Workforce Group > Admin Workforce groups updated


// =====================================================
// SECTION: Org (Org portal instance)
// =====================================================
Org Portal Login [shape: rectangle, color: lightpurple, icon: log-in]
Org Determine user persona [shape: diamond, color: orange, icon: users]
Org Org User [shape: rectangle, color: lightpurple, icon: user]
Org Program User (MSP/super-admin) [shape: rectangle, color: lightpurple, icon: shield]
Org Vendor User (agency) [shape: rectangle, color: lightpurple, icon: building]

// --- Users (Management > Users)
Org Users (list) [shape: rectangle, color: lightpurple, icon: user-cog]
Org Search/filter users [shape: rectangle, color: lightpurple, icon: search]
Org Invite user [shape: rectangle, color: lightpurple, icon: mail-plus]
Org Invite email provided? [shape: diamond, color: orange, icon: check-square]
Org User invited (status=Invited) [shape: rectangle, color: green, icon: user-plus]
Org Roles & permissions (read-only) [shape: rectangle, color: gray, icon: lock]

// --- Workforce Groups (Workforce > Workforce Groups)
Org Workforce Groups (list) [shape: rectangle, color: lightpurple, icon: layers]
Org Create Workforce Group [shape: rectangle, color: lightpurple, icon: plus-square]
Org Group name provided? [shape: diamond, color: orange, icon: check-square]
Org At least one occupation selected? [shape: diamond, color: orange, icon: briefcase]
Org Validation error [shape: rectangle, color: red, icon: alert-triangle]
Org Optional: specialties + compliance template [shape: rectangle, color: lightpurple, icon: file-check]
Org Workforce group saved [shape: rectangle, color: green, icon: check-circle]
Org Workforce group detail (edit / change template) [shape: rectangle, color: lightpurple, icon: file-text]
Org Add members (placeholder) [shape: rectangle, color: gray, icon: user-plus]

// --- Talent Community (Workforce > Talent Community)
Org Talent Community (list) [shape: rectangle, color: lightpurple, icon: users]
Org Filter/search candidates [shape: rectangle, color: lightpurple, icon: filter]
Org View candidate profile (read-only) [shape: rectangle, color: lightpurple, icon: eye]
Org Deactivate/remove (placeholder) [shape: rectangle, color: gray, icon: user-x]

// Relationships (Org) — entry + persona
Start > Org Portal Login
Org Portal Login > Org Determine user persona
Org Determine user persona > Org Org User: Org User
Org Determine user persona > Org Program User (MSP/super-admin): Program User
Org Determine user persona > Org Vendor User (agency): Vendor User

// Relationships (Org) — Users
Org Org User > Org Users (list)
Org Program User (MSP/super-admin) > Org Users (list)
Org Users (list) > Org Search/filter users
Org Users (list) > Org Invite user
Org Invite user > Org Invite email provided?
Org Invite email provided? > Org User invited (status=Invited): Yes
Org Invite email provided? > Org Invite user: No
Org Users (list) > Org Roles & permissions (read-only)

// Relationships (Org) — Workforce Groups
Org Org User > Org Workforce Groups (list)
Org Program User (MSP/super-admin) > Org Workforce Groups (list)
Org Workforce Groups (list) > Org Create Workforce Group
Org Create Workforce Group > Org Group name provided?
Org Group name provided? > Org Validation error: No
Org Group name provided? > Org At least one occupation selected?: Yes
Org At least one occupation selected? > Org Validation error: No
Org At least one occupation selected? > Org Optional: specialties + compliance template: Yes
Org Optional: specialties + compliance template > Org Workforce group saved
Org Workforce group saved > Org Workforce group detail (edit / change template)
Org Workforce group detail (edit / change template) > Org Add members (placeholder)

// Relationships (Org) — Talent Community
Org Org User > Org Talent Community (list)
Org Program User (MSP/super-admin) > Org Talent Community (list)
Org Vendor User (agency) > Org Talent Community (list)
Org Talent Community (list) > Org Filter/search candidates
Org Talent Community (list) > Org View candidate profile (read-only)
Org Talent Community (list) > Org Deactivate/remove (placeholder)

// Back-links (Org errors)
Org Create Workforce Group < Org Validation error
Org Invite user < Org Invite email provided?


// =====================================================
// SECTION: Candidate (Candidate portal instance)
// =====================================================
Candidate Sign up (net new) [shape: rectangle, color: peach, icon: user-plus]
Candidate Login [shape: rectangle, color: peach, icon: log-in]
Candidate Profile setup (occupation + specialty + preferences) [shape: rectangle, color: peach, icon: form-input]
Candidate Record created [shape: rectangle, color: green, icon: id-card]

// Relationships (Candidate)
Start > Candidate Sign up (net new)
Start > Candidate Login
Candidate Sign up (net new) > Candidate Profile setup (occupation + specialty + preferences)
Candidate Login > Candidate Profile setup (occupation + specialty + preferences)
Candidate Profile setup (occupation + specialty + preferences) > Candidate Record created

// Cross-links (key outcomes)
Candidate Record created > Org Talent Community (list)
Org Workforce group saved > Org Filter/search candidates
```

---

### Module 4: Jobs → Apply → Submissions → Accepted → Auto-Placement

```text
title Admin, Org, Candidate Flow (Module 4: Jobs → Apply → Submissions → Accepted → Auto-Placement)
direction right

Start [shape: oval, icon: play]

// ====================
// SECTION: Admin
// ====================
Admin Create Compliance List Items [shape: rectangle, color: lightblue, icon: list-checks]
Admin Create Compliance Template (uses list items) [shape: rectangle, color: lightblue, icon: layers]
Admin Compliance Template ready [shape: rectangle, color: green, icon: check-circle]

// Relationships (Admin)
Start > Admin Create Compliance List Items
Admin Create Compliance List Items > Admin Create Compliance Template (uses list items)
Admin Create Compliance Template (uses list items) > Admin Compliance Template ready


// ====================
// SECTION: Org
// ====================
Org Create Requisition Template (uses Admin Compliance Template) [shape: rectangle, color: lightpurple, icon: clipboard-list]
Org Requisition Template ready [shape: rectangle, color: green, icon: check-circle]

Org Jobs List [shape: rectangle, color: lightpurple, icon: list]
Org Create Job (wizard) [shape: rectangle, color: lightpurple, icon: plus-square]
Org Select requisition template [shape: rectangle, color: lightpurple, icon: clipboard-list]
Org Job details + submission rules [shape: rectangle, color: lightpurple, icon: form-input]
Org Job valid? [shape: diamond, color: orange, icon: check-square]
Org Fix job errors [shape: rectangle, color: red, icon: alert-triangle]
Org Publish Job [shape: rectangle, color: lightpurple, icon: send]
Org Job Published (Open) [shape: rectangle, color: green, icon: check-circle]

Org Submissions List [shape: rectangle, color: lightpurple, icon: inbox]
Org Review Submission [shape: rectangle, color: lightpurple, icon: file-text]
Org Set status = Accepted/Selected [shape: rectangle, color: lightpurple, icon: user-check]
Org Placement auto-created (system) [shape: rectangle, color: green, icon: badge-check]

// Relationships (Org)
Start > Org Create Requisition Template (uses Admin Compliance Template)
Org Create Requisition Template (uses Admin Compliance Template) > Org Requisition Template ready

Start > Org Jobs List
Org Jobs List > Org Create Job (wizard)
Org Create Job (wizard) > Org Select requisition template
Org Select requisition template > Org Job details + submission rules
Org Job details + submission rules > Org Job valid?
Org Job valid? > Org Fix job errors: No
Org Job valid? > Org Publish Job: Yes
Org Fix job errors > Org Job details + submission rules
Org Publish Job > Org Job Published (Open)
Org Job Published (Open) > Org Jobs List

Org Job Published (Open) > Org Submissions List
Org Submissions List > Org Review Submission
Org Review Submission > Org Set status = Accepted/Selected
Org Set status = Accepted/Selected > Org Placement auto-created (system)


// ====================
// SECTION: Candidate
// ====================
Candidate Job Marketplace [shape: rectangle, color: peach, icon: search]
Candidate View Job Details [shape: rectangle, color: peach, icon: file-text]
Candidate Eligible to apply? (job open + docs ready) [shape: diamond, color: orange, icon: check-square]
Candidate Cannot apply [shape: rectangle, color: red, icon: alert-triangle]
Candidate Submit application [shape: rectangle, color: peach, icon: send]
Candidate Application submitted [shape: rectangle, color: green, icon: check-circle]
Candidate See submission status [shape: rectangle, color: peach, icon: activity]
Candidate Placement visible (auto) [shape: rectangle, color: peach, icon: badge]

// Relationships (Candidate)
Start > Candidate Job Marketplace
Candidate Job Marketplace > Candidate View Job Details
Candidate View Job Details > Candidate Eligible to apply? (job open + docs ready)
Candidate Eligible to apply? (job open + docs ready) > Candidate Cannot apply: No
Candidate Eligible to apply? (job open + docs ready) > Candidate Submit application: Yes
Candidate Cannot apply > Candidate View Job Details
Candidate Submit application > Candidate Application submitted
Candidate Application submitted > Candidate See submission status
Candidate See submission status > Candidate Placement visible (auto)


// ====================
// Cross-links / Dependencies
// ====================
Admin Compliance Template ready > Org Create Requisition Template (uses Admin Compliance Template)
Org Requisition Template ready > Org Select requisition template

Org Job Published (Open) > Candidate Job Marketplace
Candidate Application submitted > Org Submissions List
Org Set status = Accepted/Selected > Candidate See submission status
Org Placement auto-created (system) > Candidate Placement visible (auto)
```

---

### Module 5: Timekeeping → Monthly Invoice Drafts → Dispute/Approve → Final Invoice → Paid

```text
title Admin, Org, Candidate Flow (Module 5: Timekeeping → Monthly Invoice Drafts → Dispute/Approve → Final Invoice → Paid)
direction right

Start [shape: oval, icon: play]

// ====================
// SECTION: Admin
// ====================
Candidate accepted + auto-placement active (from Module 4) [shape: rectangle, color: lightblue, icon: user-check]

// Relationships (Admin)
Start > Candidate accepted + auto-placement active (from Module 4)


// ====================
// SECTION: Org
// ====================
Org Placement active (system) [shape: rectangle, color: lightpurple, icon: badge-check]
Org System generates timecard(s) [shape: rectangle, color: green, icon: clipboard]

Org Review time entries [shape: rectangle, color: lightpurple, icon: eye]
Org Timecard disputed? [shape: diamond, color: orange, icon: alert-triangle]
Org Timecard approved (if not disputed) [shape: rectangle, color: green, icon: check-circle]

Org Dispute received (within window) [shape: rectangle, color: lightpurple, icon: flag]
Org Dispute window check (e.g., 3 days) [shape: rectangle, color: lightpurple, icon: calendar]
Org Resolve dispute (correct entry / re-import) [shape: rectangle, color: lightpurple, icon: edit]
Org Timecard approved after resolution [shape: rectangle, color: green, icon: check]

Org Monthly invoice draft auto-generated [shape: rectangle, color: green, icon: file-text]
Org Invoice amount = Σ(hours × pay rate × pay-code multiplier) [shape: rectangle, color: lightpurple, icon: calculator]

Org Invoice Drafts (review) [shape: rectangle, color: lightpurple, icon: folder]
Org Send draft for dispute? [shape: diamond, color: orange, icon: flag]
Org Draft disputed (fix / adjust) [shape: rectangle, color: lightpurple, icon: wrench]
Org Draft approved → moves to Final Invoices [shape: rectangle, color: green, icon: check-circle]

Org Final Invoices (review) [shape: rectangle, color: lightpurple, icon: file-check]
Org Final approve? [shape: diamond, color: orange, icon: check-square]
Org Final invoice approved [shape: rectangle, color: green, icon: stamp]
Org Mark invoice as Paid [shape: rectangle, color: green, icon: credit-card]

// Relationships (Org) — timekeeping
Candidate accepted + auto-placement active (from Module 4) > Org Placement active (system)
Org Placement active (system) > Org System generates timecard(s)
Org System generates timecard(s) > Org Review time entries
Org Review time entries > Org Timecard disputed?
Org Timecard disputed? > Org Dispute received (within window): Yes
Org Timecard disputed? > Org Timecard approved (if not disputed): No
Org Dispute received (within window) > Org Dispute window check (e.g., 3 days)
Org Dispute window check (e.g., 3 days) > Org Resolve dispute (correct entry / re-import)
Org Resolve dispute (correct entry / re-import) > Org Timecard approved after resolution
Org Timecard approved after resolution > Org Timecard approved (if not disputed)

// Relationships (Org) — invoicing
Org Timecard approved (if not disputed) > Org Monthly invoice draft auto-generated
Org Monthly invoice draft auto-generated > Org Invoice amount = Σ(hours × pay rate × pay-code multiplier)
Org Invoice amount = Σ(hours × pay rate × pay-code multiplier) > Org Invoice Drafts (review)
Org Invoice Drafts (review) > Org Send draft for dispute?
Org Send draft for dispute? > Org Draft disputed (fix / adjust): Yes
Org Draft disputed (fix / adjust) > Org Invoice Drafts (review)
Org Send draft for dispute? > Org Draft approved → moves to Final Invoices: No
Org Draft approved → moves to Final Invoices > Org Final Invoices (review)
Org Final Invoices (review) > Org Final approve?
Org Final approve? > Org Final invoice approved: Yes
Org Final invoice approved > Org Mark invoice as Paid


// ====================
// SECTION: Candidate
// ====================
Candidate Placement visible [shape: rectangle, color: peach, icon: badge]
Candidate Timecard detail [shape: rectangle, color: peach, icon: file-text]
Candidate Enter hours (mobile/app) OR hours imported (integration) [shape: rectangle, color: peach, icon: clock]
Candidate Submit time entry [shape: rectangle, color: peach, icon: send]
Candidate Sees timecard status updates [shape: rectangle, color: peach, icon: activity]

// Relationships (Candidate)
Start > Candidate Placement visible
Candidate Placement visible > Candidate Timecard detail
Candidate Timecard detail > Candidate Enter hours (mobile/app) OR hours imported (integration)
Candidate Enter hours (mobile/app) OR hours imported (integration) > Candidate Submit time entry
Candidate Submit time entry > Candidate Sees timecard status updates


// ====================
// Cross-links / Dependencies
// ====================
Candidate Submit time entry > Org Review time entries
Org Timecard approved (if not disputed) > Candidate Sees timecard status updates
```

