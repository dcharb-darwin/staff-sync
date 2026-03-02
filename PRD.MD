# Staff Sync — Product Requirements Document (MVP)

**Product Name:** Staff Sync
**Client:** Central Ohio Transit Authority (COTA)
**Prepared by:** Darwin Customer Solutions
**Status:** Draft
**Date:** March 2026

---

## 1. Overview & Problem Statement

### What Staff Sync Is

Staff Sync is a lightweight web application that provides COTA's HR, IT Service Desk, and hiring managers with a unified view of employee onboarding, transfer, and offboarding processes. It tracks status across teams, auto-generates EIS/BOIS forms from initial data entry, and validates data consistency across disconnected systems before an employee's first day.

Staff Sync is a **read-only visibility and validation layer**. It does not replace Active Directory, Infor, the ticketing system, or any other source system. It reads from them (where access is available), tracks process state in its own database, and alerts teams when something doesn't match.

### What Staff Sync Is Not

Staff Sync is not an HRIS, an identity management platform, or a ticketing system. It does not provision accounts, modify AD groups, update Infor records, or automate access control. It does not store sensitive PII (SSN, home address, compensation, bank details). It is not a replacement for the Infor Talent Acquisition module or FreshService — both of which are on COTA's roadmap and will address deeper systemic issues that Staff Sync does not attempt to solve.

### The Problem

COTA's current employee lifecycle processes are manual, fragmented across multiple systems and teams, and reliant on email and Word documents as the primary coordination mechanism. This leads to: names misspelled across systems that aren't caught until day one, email addresses mismatched between Active Directory and Infor causing access failures, employees arriving for orientation unable to complete compliance training because their accounts aren't ready, HR generalists manually tracking 25–30 bus operators per class on personal spreadsheets, service desk analysts spending up to 25 minutes per transfer manually comparing AD group memberships line by line, and no single view of where an employee is in the onboarding process — requiring stakeholders to email each other for status updates.

### MVP Scope

Staff Sync MVP delivers four capabilities:

1. **Onboarding status tracker dashboard** — per-employee and aggregate views of all active processes, with task ownership, status, and timestamps visible to all stakeholders (role-filtered).
2. **Day-one readiness validation** — automated pre-start-date checks that cross-reference name, email, badge/employee ID, and account status across AD and Infor (where accessible), flagging mismatches for resolution before orientation.
3. **EIS/BOIS form auto-generation** — HR enters employee data once; Staff Sync generates a web-based form. The hiring manager completes Section 2 directly within Staff Sync via a link. The completed form is then forwarded to the service desk as a tracked task. A "Print/Export to Word" option is available as a fallback for teams that require a downloadable document.
4. **Email address sync monitoring** — comparison of AD email vs. Infor email (if Infor access is granted), with mismatch alerts to HR and service desk before the employee's start date.

### Stakeholders

| Role | Name(s) | Involvement |
|------|---------|-------------|
| Director of Customer Solutions, Darwin | Melissa | Product owner, governance |
| Senior Cloud Solutions Architect, COTA | Brent Miller | Technical stakeholder, AD access |
| Senior Program Manager, IT & Innovations | Terrie Turner | Program oversight, Infor TA / FreshService context |
| Senior Manager, Talent & Engagement | Alexandra Swogger | HR process owner, approval authority |
| HR Generalist | Kimberly Minh | Primary end user (HR side), process expert |
| Service Desk Manager | Michael Boyce | Service desk oversight |
| IT Support Analysts | Anthony Perez, Jason Hernandez | Primary end users (service desk side) |
| Darwin Technical Lead | Ravi Thambireddy | Implementation lead |

## 2. Process Flows

Staff Sync is a visibility and validation layer that sits across COTA's existing onboarding, transfer, and offboarding processes. It does not replace any system — it reads from them, tracks status, and flags problems before they impact employees on day one.

Each flow below is documented as a swim-lane sequence showing handoffs between teams. For each step, we note where Staff Sync provides value (status tracking, validation checkpoints, or auto-generation) and where known failure modes exist today.

---

### 2.1 New Hire — Bus Operator

Bus operators are onboarded in classes of 15–30 on a roughly six-week cycle. Volume and tight timelines make this the highest-risk flow for errors.

#### Swim Lane Sequence

| Step | Owner | Action | Current Method |
|------|-------|--------|----------------|
| 1 | HR Generalist | Collects personal data form from incoming employee | Adobe PDF form, collected in advance of start date |
| 2 | HR Generalist | Reserves badge number; checks if rehire (see Flow 2.5) | Manual lookup in badge number spreadsheet |
| 3 | HR Generalist | Creates BOIS (Bus Operator Information Sheet) form using personal data + badge number + employee ID | Word document, manually populated |
| 4 | HR Generalist | Sends BOIS to hiring manager via email for Section 2 completion (access profile to copy from, laptop Y/N, peripherals, map drives, special instructions) | Email with Word attachment |
| 5 | Hiring Manager | Completes Section 2, returns BOIS to HR via email | Email reply with edited Word attachment |
| 6 | HR Generalist | Sends completed BOIS to service desk and onboarding distribution list | Email to shared inbox / distribution list, creates ticket |
| 7 | Service Desk Analyst | Validates profile-to-copy is an active AD user | Manual check in Active Directory |
| 8 | Service Desk Analyst | Creates new AD account by copying designated profile (all group memberships mirrored) | Right-click → Copy in Active Directory |
| 9 | Service Desk Analyst | Reviews second page: map drives, peripherals, special instructions | Manual review of form |
| 10 | Service Desk Analyst | Edits BAT file on server for login script / network drive mapping | Manual file edit |
| 11 | Service Desk Analyst | If non-AD systems needed (NICE, Vontas, etc.), forks ticket to ITS | Duplicate ticket created manually |
| 12 | ITS | Provisions access in non-AD systems, closes forked ticket to signal completion | Ticket system |
| 13 | Service Desk Analyst | Sends email to HRIS with new employee's email address and badge number | Manual email to HRIS team |
| 14 | HRIS | Enters employee information into Infor using personal data form + service desk email | Manual data entry |
| 15 | Service Desk Analyst | Closes ticket → notification sent to submitter | Ticket system auto-notification |
| 16 | L&D | New hire orientation — employee uses systems for compliance training on day one | In-person, system-dependent |

#### Where Staff Sync Inserts

- **After Step 3:** Auto-generate BOIS from personal data input — eliminates manual Word document creation.
- **Steps 1–15:** Status tracking — each step is a task with owner, status (pending/in-progress/done), and timestamp.
- **Before Step 16 (Day-One Readiness Check):** Validation checkpoint that cross-references: name spelling consistent across badge spreadsheet, AD, and Infor; badge number matches employee ID (or mismatch is flagged and acknowledged for rehires); email address in AD matches email address in Infor; AD account exists and is active; all forked tickets (non-AD systems) are closed.

#### Known Failure Modes

- **Name misspellings:** Name entered differently across personal data form, AD, and Infor. Not caught until employee can't log in during orientation.
- **Email mismatch:** AD email created manually, communicated to HRIS via email, re-entered manually into Infor. Mismatches cause downstream access failures across multiple systems.
- **Over-provisioned access:** Profile-to-copy may be a manager or the only person in that role. Intern gets leadership group memberships; employee resource group subscriptions carry over. No standard role-based template exists today.
- **Profile-to-copy inactive:** If the only person in that job title has left and been deactivated in AD, there's no one to copy from.
- **Volume timing pressure:** Classes of 15–30 with sometimes only 1–2 days lead time. Errors multiply across the class.

---

### 2.2 New Hire — Admin / Non-Operator

Identical flow to 2.1 with the following differences:

- **Form name:** EIS (Employee Information Sheet) instead of BOIS.
- **Volume pattern:** Individual hires rather than classes. Typically submitted a week or more before start date, but can be as short as 1–2 days.
- **Step 13 (HRIS notification):** For non-operators, the service desk does not send a separate email to HRIS. HRIS is notified via ticket closure only.
- **Failure modes:** Same as 2.1, but lower volume reduces blast radius of individual errors.

Staff Sync treatment is identical to 2.1. The tool should support both BOIS and EIS as form variants generated from the same personal data input, differentiated by employee type selection.

---

### 2.3 Transfer / Promotion

Transfers and promotions are initiated when an employee changes roles within COTA. This is the most manually intensive process for the service desk.

#### Swim Lane Sequence

| Step | Owner | Action | Current Method |
|------|-------|--------|----------------|
| 1 | HR Generalist | Submits updated EIS form noting the change: old role → new role, new profile to copy from, new access requirements | Email with Word attachment |
| 2 | Service Desk Analyst | Receives ticket from EIS submission | Ticket system |
| 3 | Service Desk Analyst | Identifies current AD group memberships for the employee | Manual lookup in AD |
| 4 | Service Desk Analyst | Identifies target AD group memberships from profile-to-copy | Manual lookup in AD |
| 5 | Service Desk Analyst | Manually compares memberships line by line: removes old groups, adds new groups | Manual editing in AD — up to 25 minutes per transfer |
| 6 | Service Desk Analyst | Edits BAT file for updated network drive mappings | Manual file edit on server |
| 7 | Service Desk Analyst | If non-AD systems involved, forks ticket to ITS | Duplicate ticket |
| 8 | ITS | Updates access in non-AD systems, closes forked ticket | Ticket system |
| 9 | Service Desk Analyst | Closes ticket | Ticket system |
| 10 | HRIS | Updates title, compensation, reporting structure in Infor | Manual — triggered separately by HR |

#### Timing Constraint

Access changes must be executed outside work hours to avoid disrupting the employee mid-session. Service desk typically performs changes on Sunday night or end of day before the effective date. AD propagation takes 30–60 minutes after changes are made.

#### Where Staff Sync Inserts

- **Steps 1–9:** Status tracking with task owners and timestamps.
- **Step 5 area:** Staff Sync could surface the membership diff (groups to remove vs. groups to add) as a checklist for the analyst to confirm, reducing line-by-line comparison time and error risk. This is a display/validation aid, not automated provisioning — the analyst still makes the changes in AD.

#### Known Failure Modes

- **Similar group name prefixes:** Groups with near-identical names lead to wrong group being added or removed. Anthony noted this is a real error source.
- **Timing gaps:** Employee starts new role Monday but access wasn't switched over the weekend. They can't do their job.
- **Incomplete non-AD provisioning:** Forked ticket to ITS not completed before role change takes effect.
- **Represented → non-represented transitions:** Operator promoted to supervisor/trainer involves significant access changes across multiple system categories.

---

### 2.4 Offboarding (Service Desk Side Only)

Note: Only the service desk portion of offboarding was discussed in the discovery session. The HR side involves a different team not present. A follow-up session is needed to document the full flow.

#### Swim Lane Sequence

| Step | Owner | Action | Current Method |
|------|-------|--------|----------------|
| 1 | HR (offboarding team) | Sends termination form to service desk | Email / form submission → ticket |
| 2 | Service Desk Analyst | Disables user account in AD | Manual — done immediately |
| 3 | Service Desk Analyst | Copies all group memberships to the ticket notes (rehire reference) | Manual copy-paste |
| 4 | Service Desk Analyst | Resets password | Manual |
| 5 | Service Desk Analyst | Terminates all active sessions in Azure, revokes MFA | Manual — Azure admin portal |
| 6 | Service Desk Analyst | Removes user from all AD groups | Manual |
| 7 | Service Desk Analyst | Closes ticket | Ticket system |

#### Timing Constraint

Offboarding is security-critical. Access termination begins immediately upon receipt — there is no scheduling delay like onboarding or transfers.

#### Where Staff Sync Inserts

- **Steps 1–7:** Status tracking — particularly valuable for audit trail purposes (when was access revoked, by whom).
- **After Step 7:** Validation that account is disabled, sessions terminated, groups removed. Confirmation record for compliance.

#### Known Failure Modes

- Not fully documented in this session. Follow-up needed with HR offboarding team.

---

### 2.5 Rehire (Variation of New Hire)

Rehires are a variant of the new hire flow (2.1 or 2.2) with specific complications around identity matching.

#### Key Differences from Standard New Hire

- **Infor record may already exist:** The employee was previously in the system. They may already have an employee ID that differs from their new or prior badge number.
- **Badge number mismatch:** A rehire may have a previously issued badge number, but if they're not in Infor, a new employee ID must be reserved. These two numbers may not match, and when they don't, downstream systems get confused.
- **AD account may be inactive:** Their old AD account was disabled during offboarding. It cannot be used as a copy-from profile (must be active).
- **Group memberships archived on ticket:** During offboarding (Step 3 of Flow 2.4), their old memberships were copied to the ticket. These could theoretically be referenced, but this is informal and not systematically retrievable.

#### Current Mitigation

The pilot program added a field to the EIS/BOIS form where HR notates that this is a rehire and provides the differing employee ID if applicable. This information is provided up front on the form.

#### Where Staff Sync Inserts

- **During personal data input:** Flag that this name/SSN last four/badge number matches a prior employee record. Surface the prior employee ID and badge number for reconciliation before the form is generated.
- **Validation checkpoint:** Confirm that the badge number and employee ID relationship is acknowledged (matching or intentionally mismatched with documentation).

#### Known Failure Modes

- **Undetected rehire:** If HR doesn't recognize the person as a rehire, the badge/ID mismatch won't be notated and downstream systems break.
- **Stale archived memberships:** Old group memberships from the offboarding ticket may no longer be valid (groups renamed, restructured, or deleted).

---

### 2.6 EIS/BOIS Form Delivery Model

A key design decision for MVP: how does the EIS/BOIS form get created, completed, and delivered?

**Decision: Web-first, with export fallback.**

The form lives inside Staff Sync as a web-based workflow, not as a downloadable Word document. The flow is:

1. **HR Generalist** enters employee data (name, badge number, employee ID, job title, department, start date, employee type) into Staff Sync. This populates Section 1 of the EIS/BOIS.
2. **Staff Sync** sends an email notification to the hiring manager with a direct link to the form.
3. **Hiring Manager** clicks the link, authenticates via SSO, and completes Section 2 (profile to copy from, laptop Y/N, peripherals, map drives, special instructions) directly within Staff Sync's web interface.
4. **Staff Sync** notifies HR that Section 2 is complete. HR reviews and submits, which creates a tracked task for the service desk.
5. **Service Desk Analyst** views the completed form data within their Staff Sync task view — no email attachment to hunt for.

**Fallback:** A "Print/Export to Word" button generates a formatted Word document matching the current EIS/BOIS layout. This covers scenarios where a hiring manager refuses to use the web tool (see OQ-5) or where a paper copy is required for physical files.

**What this replaces:** The current workflow of HR manually populating a Word doc → emailing it to the hiring manager → hiring manager editing and emailing back → HR emailing to service desk. Staff Sync eliminates 3 email handoffs and 2 manual document edits.

**What this does not replace:** The personal data form (Adobe PDF) remains outside Staff Sync. HR continues to collect it separately and enters only the non-sensitive subset into Staff Sync.

---

### 2.7 Task Definition & Granularity

The process flows in Sections 2.1–2.5 describe 7–16 steps per flow. Not all steps become individually tracked tasks in Staff Sync. This section defines which steps are tracked, who updates them, and what granularity means in practice.

**Principle:** A "task" in Staff Sync is a discrete action that has a clear owner, a definable start/end, and where visibility of completion matters to another team. Internal sub-steps (e.g., "open AD console") are not tasks.

#### New Hire Tasks (Bus Operator / Admin)

| Task | Owner | Tracked in Staff Sync? | Notes |
|------|-------|----------------------|-------|
| Enter personal data into Staff Sync | HR Generalist | Yes — auto-tracked on submission | Initiates the process |
| Reserve badge number | HR Generalist | Yes — manual confirmation | HR marks done after assigning badge # |
| Generate EIS/BOIS form | System | Yes — auto-tracked | Triggered by HR after data entry |
| Complete Section 2 | Hiring Manager | Yes — auto-tracked on submission | Hiring manager fills in web form |
| Review and submit to service desk | HR Generalist | Yes — manual confirmation | HR reviews completed form, clicks submit |
| Validate profile-to-copy is active | Service Desk Analyst | Yes — manual confirmation | Analyst checks AD, marks done |
| Create AD account | Service Desk Analyst | Yes — manual confirmation | Analyst creates account in AD, marks done |
| Configure network drives (BAT file) | Service Desk Analyst | Yes — manual confirmation | Analyst edits BAT file, marks done |
| Fork ticket for non-AD systems | Service Desk Analyst | Yes — manual confirmation | If applicable; analyst marks sent |
| Non-AD provisioning complete | ITS | Yes — manual or ticket-API driven | ITS closes forked ticket; status updates |
| Send email/badge to HRIS | Service Desk Analyst | Yes — manual confirmation | Bus operators only |
| HRIS enters data in Infor | HRIS Analyst | Yes — manual confirmation | HRIS marks done after Infor entry |
| Day-one readiness check | System | Yes — auto-generated | Runs on schedule or on demand |

**Who updates:** Each task owner is responsible for marking their own task complete within Staff Sync. This is a manual click (~30 seconds) in MVP. System-generated tasks (form generation, readiness checks) update automatically.

**What's NOT a task:** Opening the AD console, reading the form, internal team discussions, physical file creation, printing documents. These are sub-steps within a task, not independently tracked.

---

### 2.8 Day-One Readiness: Pass/Fail Criteria

The day-one readiness check (US-5, US-16) runs a set of validations against available data sources. Each check returns one of three statuses:

| Status | Meaning | Action Required |
|--------|---------|-----------------|
| **Pass** | Data matches across all checked systems. | None — employee is ready. |
| **Warning** | Data is present but may not match exactly (e.g., "Robert" in AD vs. "Bob" in Infor). | HR reviews and either corrects the mismatch or acknowledges it as acceptable. Warning does not block onboarding. |
| **Fail** | Critical data is missing or definitely wrong (e.g., no AD account exists, account is disabled, email field is blank in AD). | Must be resolved before start date. Notification sent to task owner. |

#### Validation Checks

| Check | Data Sources | Pass | Warning | Fail |
|-------|-------------|------|---------|------|
| AD account exists | AD | Account found, `accountEnabled` = true | — | Account not found, or `accountEnabled` = false |
| Name consistency | Staff Sync input vs. AD (`displayName`, `givenName`, `surname`) | Exact match (case-insensitive) | Partial match — e.g., nickname vs. legal name, middle initial present in one but not the other | No match — first or last name differs entirely |
| Email match | AD (`userPrincipalName`) vs. Infor email (if available) | Exact match | — | Mismatch, or email blank in either system |
| Badge/Employee ID reconciliation | Staff Sync input (badge #, employee ID) | Numbers match, or mismatch is flagged as acknowledged rehire | — | Numbers differ with no rehire acknowledgment |
| EIS/BOIS form complete | Staff Sync process state | All sections submitted | Section 2 submitted but not yet reviewed by HR | Section 2 not started, or form not generated |
| Service desk provisioning | Staff Sync task status | All service desk tasks marked complete | Tasks in progress with start date >2 business days away | Tasks not started with start date ≤2 business days away |
| Non-AD systems (if applicable) | Staff Sync task status (forked ticket) | Forked ticket closed / marked complete | Forked ticket open with start date >2 business days away | Forked ticket open with start date ≤2 business days away |

**Overall readiness:**
- **Ready:** All checks pass.
- **Needs attention:** One or more warnings. HR reviews and acknowledges.
- **Not ready:** One or more fails. Must be resolved. Onboarding can proceed at HR Manager's discretion with documented risk acceptance, but Staff Sync flags it prominently.

**When it runs:** Automatically nightly for all employees with start dates in the next 5 business days. Can also be triggered on demand by HR Generalist or HR Manager for any individual or class.

## 3. Data Sources & Data Types

Staff Sync reads from multiple disconnected systems to provide a unified status view. It does not write to any source system in MVP — it is read-only and display-only, with the exception of its own internal process state (task status, timestamps, owner assignments).

This section maps every data source, what we read from it, whether the data is sensitive, and the current access status.

---

### 3.1 Data Source Inventory

| Source System | Data Read | Sensitivity | Access Status | Notes |
|--------------|-----------|-------------|---------------|-------|
| **Active Directory (AD)** | User account existence, active/disabled status, group memberships, email address, display name, job title | Non-sensitive (organizational data) | **Confirmed — Read access available** | Primary validation source. Used for day-one readiness checks and membership diff display for transfers. |
| **Infor (HRIS)** | Employee name, employee ID, email address, job title, department, start date | **Mixed — contains sensitive PII** (SSN, home address, compensation) | **TBD — Read access not confirmed. May not be feasible for a sensitive system.** | Staff Sync only needs a narrow slice of Infor data (name, ID, email, title, start date). If direct API access is not granted, alternatives include: (a) scheduled export of non-sensitive fields to a flat file, or (b) manual entry by HRIS team into Staff Sync. |
| **Badge Number Spreadsheet** | Badge number, employee ID, assignment date, rehire flag | Non-sensitive | **TBD — format and location unknown** | Currently maintained manually by HR. May be an Excel file on SharePoint. Staff Sync could either read from it or replace it entirely as the badge number source of record for tracking purposes. |
| **Ticketing System** (current; migrating to FreshService) | Ticket ID, ticket status (open/closed), assignee, creation date, closure date, forked ticket references | Non-sensitive | **TBD — depends on system API availability** | Used to track service desk task completion. In MVP, ticket status could be entered manually by the service desk analyst within Staff Sync if API integration isn't feasible. |
| **EIS / BOIS Form** (Word document) | All fields from Sections 1 and 2: employee name, badge number, employee ID, profile to copy from, laptop Y/N, peripherals, map drives, special instructions, hiring manager name | Non-sensitive (no SSN, no compensation, no home address on EIS) | **N/A — Staff Sync replaces this** | In MVP, the form is generated by Staff Sync from personal data input. The Word document ceases to be a data source and becomes an output (if a printable/emailable version is still needed). |
| **Personal Data Form** (Adobe PDF) | Full name, home address, SSN, date of birth, emergency contact, bank/payroll information | **Highly sensitive — PII and financial data** | **Staff Sync does NOT ingest this form.** | HR collects this form separately. Staff Sync only receives the non-sensitive subset that HR manually enters (name, badge number, employee ID, start date, job title, department). The personal data form remains outside Staff Sync's boundary. |
| **SharePoint** | Uploaded employee documents, payroll information files | **Sensitive** | **Out of scope for MVP** | HR uploads physical file scans and payroll docs to SharePoint. Staff Sync does not read from or write to SharePoint in MVP. |
| **Azure AD / Entra ID** | Session status, MFA status (offboarding validation only) | Non-sensitive (status flags only) | **TBD — Read access for session/MFA status checks** | Used only in offboarding flow to validate that sessions have been terminated. Could be deferred if access is not straightforward. |

---

### 3.2 Data Classification

Staff Sync enforces a strict boundary between sensitive and non-sensitive data. This is an MVP requirement, not a nice-to-have.

**Non-Sensitive (displayed in Staff Sync to all authorized users):**
Employee name (first, middle initial, last), badge number, employee ID, job title, department, start date, assigned hiring manager, process status and task ownership, ticket references (ID and status only), AD group membership names, email address (AD and Infor — for mismatch detection).

**Sensitive (never stored or displayed in Staff Sync):**
Social Security number, home address, date of birth, bank/payroll information, compensation/salary, emergency contact details, benefits enrollment data, personal data form contents.

**Restricted Non-Sensitive (visible only to HR roles in Staff Sync):**
Employee type (bus operator, admin, contractor, vendor), rehire status and prior employment details, badge/employee ID mismatch notes, full EIS/BOIS form content.

---

### 3.3 Data Flow Direction

```
Personal Data Form (PDF)          Badge Spreadsheet
        |                                |
        v                                v
  [ HR enters non-sensitive    [ HR enters badge #
    subset into Staff Sync ]     into Staff Sync  ]
        |                                |
        +---------- Staff Sync ----------+
                       |
          +------------+-------------+
          |            |             |
          v            v             v
     Generates    Reads from     Reads from
     EIS/BOIS     AD (API)     Infor (TBD)
      form           |             |
                     v             v
              Validation Engine:
              - Name match across systems
              - Email match (AD vs Infor)
              - Badge/ID reconciliation
              - Account active check
              - Ticket status check
                     |
                     v
              Day-One Readiness
              Dashboard & Alerts
```

Staff Sync is a **read + validate + display** layer. It does not provision accounts, modify AD groups, create tickets, or update Infor. Humans continue to perform all actions in source systems. Staff Sync tells them what needs to be done and whether it's been done correctly.

---

## 4. Integrations Required

Each integration is classified by priority (must-have for MVP vs. can-degrade-gracefully) and by current feasibility.

### 4.1 Integration Matrix

| System | Integration Type | Priority | Feasibility | Fallback if No API |
|--------|-----------------|----------|-------------|-------------------|
| **Active Directory** | Read-only API (LDAP or Microsoft Graph) | **Must-have** | **Confirmed** | None — this integration is required for core validation. |
| **Infor (HRIS)** | Read-only API — narrow scope (name, employee ID, email, title, start date) | **Must-have for email validation; degraded mode without it** | **Unknown — sensitive system, access may not be granted** | Option A: Scheduled CSV/Excel export of non-sensitive fields from HRIS team. Option B: HRIS team manually confirms data points in Staff Sync. Option C: Email validation deferred; Staff Sync tracks only AD-side data. |
| **Ticketing System** | Read-only API — ticket status, assignee, timestamps | **Nice-to-have for MVP** | **TBD — current system may not have API; FreshService (future) will** | Service desk analyst manually updates task status within Staff Sync. Adds ~30 seconds per ticket but is viable for MVP volumes. |
| **Azure AD / Entra ID** | Read-only — session and MFA status | **Nice-to-have (offboarding only)** | **TBD** | Service desk analyst confirms in Staff Sync that sessions have been terminated. Manual checkbox. |
| **Email (SMTP or webhook)** | Outbound notifications | **Must-have** | **Feasible** | Staff Sync sends notifications when: a process is initiated (to hiring manager, service desk), a task is assigned, a validation check fails, day-one readiness report is generated. |
| **Badge Number Spreadsheet** | File read (Excel/CSV on SharePoint or local) | **Must-have** | **Feasible — depends on file location and format** | Staff Sync becomes the badge number source of record. HR enters badge numbers directly into Staff Sync instead of a spreadsheet. Eliminates the integration entirely. |

---

### 4.2 Integration Detail: Active Directory

**Protocol:** LDAP query or Microsoft Graph API (Graph preferred if COTA is on Azure AD / Entra ID).

**Data read:**

- `userPrincipalName` — email address
- `displayName`, `givenName`, `surname` — name fields for cross-reference
- `jobTitle`, `department` — role context
- `accountEnabled` — active/disabled status
- `memberOf` — group memberships (list of group distinguished names)

**Frequency:** On-demand per employee lookup + scheduled batch check for day-one readiness validation (e.g., nightly for all employees with start dates in the next 5 business days).

**Scope:** Read-only. Staff Sync never modifies AD objects.

---

### 4.3 Integration Detail: Infor

**Status: RISK — Access may not be granted.**

If read access is granted, Staff Sync needs only:

- Employee name (first, middle, last)
- Employee ID
- Email address
- Job title
- Department
- Start date

This is a narrow, non-sensitive subset. The request to COTA should emphasize that Staff Sync does not need access to compensation, SSN, benefits, or any other sensitive fields. A scoped API endpoint or database view limited to these fields would satisfy the requirement.

**If access is denied**, the MVP can still function with degraded validation:

- Email mismatch detection would require HRIS to manually enter the Infor email into Staff Sync (or be deferred entirely).
- Name cross-referencing would rely on AD + Staff Sync input only (no Infor confirmation).
- The day-one readiness check would have fewer data points but would still validate AD account, badge number, and ticket completion.

---

### 4.4 Integration Detail: Notifications

Staff Sync sends outbound notifications at key process milestones:

| Trigger | Recipient | Channel | Content |
|---------|-----------|---------|---------|
| New process initiated | Hiring Manager, Service Desk | Email | "New hire [Name] — EIS/BOIS ready for your section" |
| Task assigned | Task owner | Email | "[Name] — [Task description] assigned to you" |
| Validation failure detected | HR Generalist, Process owner | Email | "Day-one readiness check for [Name]: [X] issues found" |
| Day-one readiness: all clear | HR Generalist, Hiring Manager | Email | "[Name] — all systems confirmed ready for [Start Date]" |
| Process completed | All stakeholders | Email | "[Name] onboarding complete" |

---

## 5. User Stories

Organized by role. Each story follows the format: *As a [role], I want to [action], so that [outcome].*

---

### 5.1 HR Generalist

**US-1: Initiate onboarding process**
As an HR Generalist, I want to enter a new employee's non-sensitive personal details (name, badge number, employee ID, job title, department, start date, employee type) into Staff Sync, so that the onboarding process is tracked from the beginning and the EIS/BOIS form can be auto-generated.

**US-2: Auto-generate EIS/BOIS form**
As an HR Generalist, I want Staff Sync to generate a completed EIS or BOIS form from the data I've entered, so that I don't have to manually populate a Word document and can eliminate transcription errors.

**US-3: Route form to hiring manager**
As an HR Generalist, I want to send the generated form to the hiring manager for Section 2 completion directly from Staff Sync (via email notification with link), so that the handoff is tracked and I don't lose visibility into where the form is.

**US-4: Track all active onboarding processes**
As an HR Generalist managing up to 25–30 bus operators simultaneously, I want a dashboard showing all active processes with their completion percentage, pending tasks, and owners, so that I can identify bottlenecks without maintaining a personal tracking spreadsheet.

**US-5: Day-one readiness report**
As an HR Generalist, I want to run a day-one readiness check for any employee (or all employees starting in the next week) that validates name consistency, email match, badge/ID reconciliation, and AD account status, so that problems are caught before orientation — not during it.

**US-6: Flag rehires**
As an HR Generalist, I want Staff Sync to alert me if an incoming employee's name or badge number matches a prior employee record, so that I can note the rehire status and reconcile any ID mismatches before the form is generated.

**US-7: Initiate transfer/promotion process**
As an HR Generalist, I want to create a transfer/promotion process in Staff Sync by entering the employee's name, old role, new role, and profile to copy from, so that the service desk receives a tracked request rather than an email with a Word attachment.

---

### 5.2 Service Desk Analyst

**US-8: Receive and view onboarding tasks**
As a Service Desk Analyst, I want to see my assigned onboarding/transfer/offboarding tasks in Staff Sync with all the information I need (employee name, profile to copy from, laptop Y/N, peripherals, map drives, special instructions), so that I don't have to dig through email attachments and tickets to find what I need.

**US-9: Update task status**
As a Service Desk Analyst, I want to mark each step as complete (AD account created, BAT file edited, forked ticket sent, etc.) within Staff Sync, so that HR and hiring managers can see progress without emailing me for updates.

**US-10: View membership diff for transfers**
As a Service Desk Analyst processing a transfer, I want Staff Sync to display the current group memberships alongside the target group memberships (from the profile-to-copy), so that I can see what needs to be removed and added without manually comparing line by line in AD.

**US-11: Offboarding checklist**
As a Service Desk Analyst, I want a step-by-step offboarding checklist (disable account, copy memberships to notes, reset password, terminate sessions, remove groups) that I mark complete as I go, so that no step is missed and there's an audit trail of when each action was taken.

**US-12: Track forked tickets**
As a Service Desk Analyst, I want visibility into whether the forked ticket for non-AD systems (NICE, Vontas, etc.) has been completed by ITS, so that I know when the full provisioning is done — not just my portion.

---

### 5.3 Hiring Manager

**US-13: Complete Section 2 of EIS/BOIS**
As a Hiring Manager, I want to receive a notification that a new hire's form is ready for my input, click a link, and fill in Section 2 (profile to copy from, laptop, peripherals, map drives, special instructions) within Staff Sync, so that I don't have to edit a Word document and email it back.

**US-14: View onboarding status for my new hire**
As a Hiring Manager, I want to see where my incoming employee is in the onboarding process — what's done, what's pending, who's responsible for the next step — so that I can answer "are they ready for Monday?" without emailing HR and the service desk.

---

### 5.4 HR Manager / Senior Manager of Talent

**US-15: Aggregate dashboard view**
As an HR Manager, I want to see all active onboarding, transfer, and offboarding processes across COTA in a single view — filterable by employee type, start date range, and status — so that I can identify systemic bottlenecks and resource allocation issues.

**US-16: Day-one readiness across a class**
As an HR Manager preparing for a bus operator orientation class of 20+ people, I want to run the day-one readiness check across the entire class at once and see a summary of who's clear, who has issues, and what those issues are, so that I can triage problems days before orientation — not the morning of.

---

## 6. Role-Based Access & Visibility

Role-based visibility is a **vital MVP requirement**. Staff Sync handles non-sensitive data, but certain fields and views must be restricted by role.

---

### 6.1 Role Definitions

| Role | Description | Example Users |
|------|-------------|---------------|
| **HR Generalist** | Initiates and manages onboarding/transfer processes. Enters employee data. Generates forms. | Kimberly Minh |
| **HR Manager** | Supervisory view across all processes. Aggregate reporting. | Alexandra Swogger |
| **Service Desk Analyst** | Executes IT provisioning tasks. Updates task status. | Anthony Perez, Jason Hernandez |
| **Service Desk Manager** | Supervisory view across service desk workload. | Michael Boyce |
| **Hiring Manager** | Completes Section 2 of EIS/BOIS. Views status of their own hires only. | (Various — per hire) |
| **HRIS Analyst** | Views limited data for Infor reconciliation. | HRIS team members |

---

### 6.2 Visibility Matrix

| Data Element | HR Generalist | HR Manager | Service Desk Analyst | Service Desk Manager | Hiring Manager | HRIS Analyst |
|-------------|:---:|:---:|:---:|:---:|:---:|:---:|
| Employee name | ✓ | ✓ | ✓ | ✓ | ✓ (own hires) | ✓ |
| Badge number | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Employee ID | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Job title / department | ✓ | ✓ | ✓ | ✓ | ✓ (own hires) | ✓ |
| Start date | ✓ | ✓ | ✓ | ✓ | ✓ (own hires) | ✓ |
| Employee type | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Rehire status & ID mismatch notes | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| EIS/BOIS full form content | ✓ | ✓ | ✓ | ✓ | Section 2 only | ✗ |
| AD group memberships | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| Membership diff (transfers) | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| Process status & task ownership | ✓ | ✓ | ✓ (own tasks) | ✓ | ✓ (own hires) | ✗ |
| Day-one readiness results | ✓ | ✓ | ✓ | ✓ | ✓ (own hires) | ✗ |
| Aggregate dashboard (all processes) | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Email address (AD vs Infor) | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |

---

### 6.3 Boundary: What Staff Sync Never Has

Regardless of role, no user of Staff Sync can see: Social Security numbers, home addresses, dates of birth, bank or payroll information, compensation or salary data, benefits enrollment details, personal data form PDF contents. These remain exclusively in Infor, SharePoint, and the physical HR file. Staff Sync has no mechanism to ingest, store, or display this data.

---

## 7. Assumptions & Open Questions

### 7.1 Assumptions

- **A1:** COTA will grant read-only access to Active Directory via LDAP or Microsoft Graph API. (Confirmed in discovery.)
- **A2:** Staff Sync is a web application accessible via browser. No desktop client or mobile app for MVP.
- **A3:** Authentication for Staff Sync users will leverage COTA's existing identity provider (SSO via Azure AD / Entra ID). No separate credential management.
- **A4:** The EIS/BOIS form auto-generated by Staff Sync will be accepted by existing downstream consumers (service desk, hiring managers) as equivalent to the current Word document.
- **A5:** HR will continue to collect the personal data form (Adobe PDF) outside of Staff Sync. Only the non-sensitive subset is entered into Staff Sync by HR.
- **A6:** Service desk analysts will manually update task status in Staff Sync during MVP. This adds minimal overhead (~30 seconds per update) and is viable at current volumes.
- **A7:** The badge number spreadsheet can either be imported into Staff Sync or replaced by Staff Sync as the tracking mechanism for badge number assignments.
- **A8:** Notification emails from Staff Sync will be accepted by COTA's email infrastructure (no SMTP relay restrictions that would block an internal tool).
- **A9:** The Infor Talent Acquisition module implementation (6–12+ months out) and FreshService migration are separate projects. Staff Sync is designed to complement them, not compete or overlap.

### 7.2 Open Questions

| # | Question | Impact if Unresolved | Owner | Target Resolution |
|---|----------|---------------------|-------|-------------------|
| **OQ-1** | Can COTA grant Staff Sync read-only API access to Infor for a limited set of non-sensitive fields (name, employee ID, email, title, start date)? | Email mismatch validation (MVP feature #4) cannot be automated. Falls back to manual HRIS confirmation. | COTA IT / HRIS | Before development begins |
| **OQ-2** | What is the format and location of the badge number spreadsheet? Excel on SharePoint? Local file? | Determines whether Staff Sync reads it or replaces it. | HR (Kimberly / Alex) | Before development begins |
| **OQ-3** | Does the current ticketing system have an API for reading ticket status? | Determines whether ticket tracking is automated or manually entered by service desk in MVP. | COTA IT (Michael Boyce) | Before development begins |
| **OQ-4** | What Azure AD / Entra ID permissions are required for session and MFA status checks (offboarding validation)? | Offboarding validation may be limited to manual confirmation if permissions are restrictive. | COTA IT | Can defer — offboarding validation is lower priority within MVP |
| **OQ-5** | Will hiring managers accept completing Section 2 inside a web tool (Staff Sync) instead of editing a Word document? | If not, Staff Sync must generate a Word document for download/email and accept the completed version back — adding complexity. | HR Manager (Alex) | Before UX design finalized |
| **OQ-6** | Who is responsible for the HR side of offboarding? Can we schedule a follow-up discovery session? | Offboarding flow (2.4) is incomplete. | COTA HR | Follow-up session needed |
| **OQ-7** | How should Staff Sync authenticate users? SSO via existing Azure AD / Entra ID? | Affects architecture and deployment. | COTA IT | Before development begins |
| **OQ-8** | Are there any data residency requirements — must Staff Sync data stay on-premises or can it be cloud-hosted? | Affects infrastructure decisions. | COTA IT / Legal | Before development begins |
| **OQ-9** | What is the confirmed timeline for Infor Talent Acquisition module and FreshService implementation? | Determines whether Staff Sync should include form routing and status tracking (see Section 8 decision gate). | Terrie Turner / COTA IT | Before scope is finalized |

---

### 7.3 Scoping: "Own Hires" and "Own Tasks"

Several user stories and the visibility matrix reference filtered views — hiring managers see "own hires" and service desk analysts see "own tasks." This section defines how ownership is determined.

**Hiring Manager → Employee assignment:** When an HR Generalist initiates a new onboarding or transfer process in Staff Sync, they select the hiring manager from a dropdown (populated from AD). This creates an `assigned_hiring_manager` field on the process record. The hiring manager can only see processes where `assigned_hiring_manager` matches their identity. If a hiring manager changes mid-process (e.g., reorg), HR can reassign. The previous manager loses visibility; the new manager gains it.

**Service Desk Analyst → Task assignment:** When a completed EIS/BOIS is submitted to the service desk, a Service Desk Manager (or the system, based on workload rules TBD) assigns the process to an analyst. That analyst sees all tasks within their assigned processes. Other analysts do not see those tasks unless they are also assigned. Service Desk Managers see all service desk tasks across all analysts.

**HRIS Analyst → Limited scope:** HRIS analysts see only the data elements marked ✓ in the visibility matrix (Section 6.2). They do not see process status, tasks, or the aggregate dashboard. Their view is limited to reconciliation data needed for Infor entry.

---

### 7.4 Next Steps: Artifacts Required Before Development

This PRD defines business requirements, process flows, data boundaries, and user stories. The following artifacts are needed before engineering work begins and are explicitly out of scope for this document:

1. **UI/UX wireframes:** Screen designs for the dashboard home view (aggregate and per-employee), the EIS/BOIS web form (Sections 1 and 2), the service desk task view, the membership diff display for transfers, and the day-one readiness report. The Figma mockup shown during the discovery session can serve as a starting point.

2. **Database schema:** Entity-relationship model for processes, tasks, employees, users, and role assignments. Key design decision: are onboarding, transfer, and offboarding modeled as separate entities or as one polymorphic process type? Recommendation: polymorphic with a `process_type` enum.

3. **API contracts:** Request/response schemas for the AD integration (Microsoft Graph preferred), and for the Infor integration if access is granted. Also: internal API design for Staff Sync's own endpoints (process CRUD, task updates, readiness checks).

4. **Authentication and authorization design:** SSO integration spec (Azure AD / Entra ID), role-to-permission mapping implementation, and session management approach.

5. **Notification templates:** Email subject lines, body content, and branding for each trigger defined in Section 4.4.

6. **Acceptance criteria for user stories:** Testable pass/fail criteria for each user story in Section 5, derived from this PRD's flow definitions and readiness criteria (Section 2.8). Priority stories for first sprint: US-1, US-2, US-4, US-5, US-8, US-9.

---

## 8. Appendix: Strategic Candor — Why This May Not Be the Right Investment

This section is included deliberately. Before committing development resources, COTA and Darwin should consider whether Staff Sync is the right solution — or whether the same energy is better spent accelerating the system improvements already in the pipeline.

### What Staff Sync Is

Staff Sync is a tracking and validation layer built on top of manual processes and disconnected systems. It makes the current broken workflow more visible and catches errors earlier. It does not fix the underlying problems: manual data entry across multiple systems, absence of role-based access control, no system-to-system integration, and Word documents as the primary data exchange format.

### The Bandaid Problem

The pain points surfaced in discovery — name misspellings, email mismatches, over-provisioned access, lost-in-email handoffs — are symptoms of not having integrated systems. Every mature HRIS and IT service management platform on the market (ServiceNow, Workday, BambooHR + Okta, even Infor's own TA module) solves these problems natively by making the employee record the single source of truth that flows through provisioning, ticketing, and validation automatically.

Staff Sync addresses the symptoms without addressing the cause. It adds another system to COTA's already fragmented landscape — one that itself requires integration, maintenance, and user adoption.

### What Already Exists

COTA has two system modernization efforts already identified or underway: the Infor Talent Acquisition module (which would make the personal data form electronic and flow data through to provisioning) and FreshService (which replaces the ticketing system and could integrate with Infor). If both are implemented, they would eliminate the need for Staff Sync's core features (form auto-generation, status tracking, email-based handoffs).

### When Staff Sync Makes Sense Anyway

Staff Sync is justified if any of the following are true: the Infor TA module and/or FreshService timelines are genuinely 12+ months away and the current error rate is causing measurable harm now (failed orientations, security incidents from over-provisioning, HR staff burnout from manual tracking of 30-person classes); COTA wants to use Staff Sync as a requirements-gathering tool — building the lightweight version now to validate workflows before configuring the larger platforms; the Infor TA module will not cover the cross-system validation use case (AD ↔ Infor ↔ badge spreadsheet), in which case Staff Sync retains value even after TA is implemented.

### Recommendation: A Decision Gate, Not a Contradiction

This PRD defines four MVP features. The Strategic Candor section flags that two of them (form routing, status tracking) overlap with what Infor TA and FreshService will eventually provide. This is not a contradiction — it's a decision gate:

**If Infor TA and FreshService are confirmed for delivery within 6 months:** Descope Staff Sync to validation-only (day-one readiness checks + email sync monitoring). Do not build form auto-generation or status tracking — those investments will be replaced.

**If Infor TA and FreshService are 12+ months away:** Build all four MVP features. The current process is causing measurable harm now (failed orientations, 25-minute manual transfers, HR tracking 30 people on personal spreadsheets). Waiting 12+ months for a platform solution is not acceptable when a lightweight tool can reduce errors in weeks.

**If the timeline is genuinely unknown:** Build the validation features first (day-one readiness, email sync). Add form routing and status tracking as a second increment only if the platform timeline remains unclear after 60 days. This minimizes wasted investment while delivering immediate value.

The core principle: Staff Sync's permanent value is cross-system validation — something the platform systems may never fully cover because they each own their own data silo. Its temporary value is process tracking and form routing. Build the permanent value first. Add the temporary value only if the wait for proper tooling is too long.
