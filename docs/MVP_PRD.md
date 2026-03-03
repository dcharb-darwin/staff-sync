# Staff Sync — MVP Product Requirements (Run 1)

**Product:** Staff Sync · **Client:** Central Ohio Transit Authority (COTA) · **Status:** MVP Complete · **Date:** March 2026

---

## 1. Overview

### What Staff Sync Is

Staff Sync is a lightweight web application that gives COTA's HR, IT Service Desk, and hiring managers a **unified view** of employee onboarding, transfer, and offboarding processes. It tracks status across teams, auto-generates EIS/BOIS forms from single data entry, and validates data consistency across disconnected systems before an employee's first day.

Staff Sync is a **read-only visibility and validation layer**. It does not replace Active Directory, Infor, the ticketing system, or any other source system.

### What Staff Sync Is Not

Not an HRIS, identity management platform, or ticketing system. Does not provision accounts, modify AD groups, update Infor records, or automate access control. Does not store sensitive PII (SSN, home address, compensation, bank details).

### The Problem

COTA's employee lifecycle processes are manual, fragmented across multiple systems, and reliant on email and Word documents as the primary coordination mechanism. This leads to:

- Names misspelled across systems — not caught until day one
- Email mismatches between AD and Infor causing access failures
- Employees arriving for orientation unable to complete compliance training
- HR generalists manually tracking 25–30 bus operators per class on personal spreadsheets
- Service desk analysts spending **up to 25 minutes per transfer** comparing AD group memberships line by line
- No single view of process status — stakeholders email each other for updates

---

## 2. MVP Scope — Four Capabilities

### 2.1 Onboarding Status Tracker Dashboard

Per-employee and aggregate views of all active processes, with task ownership, status, and timestamps visible to all stakeholders (role-filtered per §6).

![Dashboard — aggregate KPIs, active processes, readiness summary](screenshots/mvp-dashboard.png)

### 2.2 Day-One Readiness Validation

Automated pre-start-date checks that cross-reference name, email, badge/employee ID, and account status across AD and Infor, flagging mismatches for resolution before orientation.

**Pass/Fail Criteria:**

| Status | Meaning | Action |
|--------|---------|--------|
| **Pass** | Data matches across all checked systems | None — employee is ready |
| **Warning** | Data present but may not match exactly (e.g., "Robert" vs "Bob") | HR reviews and acknowledges |
| **Fail** | Critical data missing or wrong (no AD account, disabled account, blank email) | Must resolve before start date |

**7 Validation Checks:** AD account exists · Name consistency · Email match (AD vs Infor) · Badge/ID reconciliation · EIS/BOIS form complete · Service desk provisioning · Non-AD systems

![Readiness page — per-employee validation results with pass/warning/fail](screenshots/mvp-readiness.png)

### 2.3 EIS/BOIS Form Auto-Generation

HR enters employee data once → Staff Sync generates the form → hiring manager completes Section 2 via web link → HR reviews and submits to service desk as a tracked task. **Eliminates 3 email handoffs and 2 manual document edits.**

**Fallback:** "Print/Export to Word" button for hiring managers who require a downloadable document.

### 2.4 Email Address Sync Monitoring

Comparison of AD email vs. Infor email (if Infor access is granted), with mismatch alerts to HR and service desk before start date.

---

## 3. Process Flows

### 3.1 New Hire — Bus Operator (16 steps)

Bus operators onboarded in classes of 15–30 on ~six-week cycles. Highest-risk flow for errors.

**Flow:** HR collects data → reserves badge → creates BOIS → sends to hiring manager → hiring manager completes Section 2 → HR submits to service desk → analyst creates AD account, configures network drives, forks non-AD tickets → ITS provisions non-AD systems → analyst sends email/badge to HRIS → HRIS enters in Infor → ticket closed → orientation

**Staff Sync inserts at:** Auto-generate BOIS (after step 3), status tracking (all steps), day-one readiness check (before orientation).

**Known failures:** Name misspellings, email mismatches from manual re-entry, over-provisioned access from copy-from profiles, inactive copy-from profiles, volume timing pressure (1–2 days lead time).

### 3.2 New Hire — Admin/Non-Operator

Same flow as 3.1 but uses EIS form instead of BOIS. Individual hires (not classes). HRIS notified via ticket closure only.

### 3.3 Transfer/Promotion (10 steps)

Most manually intensive process for service desk. HR submits updated EIS → analyst compares AD group memberships line by line (up to 25 min) → removes old groups, adds new → updates network drives → forks non-AD ticket if needed.

**Timing constraint:** Changes executed outside work hours (Sunday night / end of day). AD propagation takes 30–60 minutes.

**Staff Sync inserts at:** Status tracking, membership diff display (groups to remove vs add as checklist).

### 3.4 Offboarding (7 steps)

Security-critical — access termination begins immediately. Disable AD → copy memberships to notes → reset password → terminate sessions/MFA → remove all groups → close ticket.

### 3.5 Rehire (variation of New Hire)

Complications: Infor record may exist with different employee ID, badge number mismatch, AD account disabled from previous offboarding. Staff Sync flags name/badge matches with prior records.

---

## 4. User Stories

### HR Generalist (US-1 through US-7)

| ID | Story | Priority |
|----|-------|----------|
| US-1 | Initiate onboarding — enter non-sensitive details, start tracked process | Must-have |
| US-2 | Auto-generate EIS/BOIS from entered data (no manual Word doc) | Must-have |
| US-3 | Route form to hiring manager via email link for Section 2 | Must-have |
| US-4 | Dashboard of all active processes with completion %, pending tasks, owners | Must-have |
| US-5 | Day-one readiness check — validate name, email, badge/ID, AD status | Must-have |
| US-6 | Rehire detection — alert on name/badge matches with prior employees | Must-have |
| US-7 | Initiate transfer/promotion with old role, new role, profile-to-copy | Must-have |

### Service Desk Analyst (US-8 through US-12)

| ID | Story | Priority |
|----|-------|----------|
| US-8 | View assigned tasks with all needed info (no email attachment hunting) | Must-have |
| US-9 | Mark each step complete (AD created, BAT edited, ticket forked) | Must-have |
| US-10 | View membership diff for transfers (current vs target groups) | Must-have |
| US-11 | Offboarding checklist with audit trail | Must-have |
| US-12 | Track forked ticket completion by ITS | Must-have |

### Hiring Manager (US-13 through US-14)

| ID | Story | Priority |
|----|-------|----------|
| US-13 | Complete Section 2 of EIS/BOIS via web link (no Word editing) | Must-have |
| US-14 | View onboarding status for own hires | Must-have |

### HR Manager (US-15 through US-16)

| ID | Story | Priority |
|----|-------|----------|
| US-15 | Aggregate dashboard — all processes, filterable by type/date/status | Must-have |
| US-16 | Class readiness check — run across entire bus operator class at once | Must-have |

---

## 5. Data Sources

| Source | Data Read | Sensitivity | Access Status |
|--------|-----------|-------------|---------------|
| **Active Directory** | Account existence, status, groups, email, display name | Non-sensitive | ✅ Confirmed |
| **Infor (HRIS)** | Name, employee ID, email, title, start date | Mixed (contains sensitive PII) | ⚠️ TBD |
| **Badge Spreadsheet** | Badge number, employee ID, rehire flag | Non-sensitive | ⚠️ TBD |
| **Ticketing System** | Ticket ID, status, assignee, dates | Non-sensitive | ⚠️ TBD |
| **EIS/BOIS Form** | All Section 1 + 2 fields | Non-sensitive | ✅ Replaced by Staff Sync |
| **Personal Data Form** | SSN, address, DOB, bank info | ❌ Highly sensitive | ❌ Never ingested |

### Data Flow

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
     Generates    Reads from     Reads from
     EIS/BOIS     AD (API)     Infor (TBD)
      form           |             |
                     v             v
              Validation Engine
                     |
              Day-One Readiness
              Dashboard & Alerts
```

---

## 6. Role-Based Access & Visibility

### Role Definitions

| Role | Description | Example Users |
|------|-------------|---------------|
| HR Generalist | Initiates/manages processes, enters data, generates forms | Kimberly Minh |
| HR Manager | Supervisory view across all processes, aggregate reporting | Alexandra Swogger |
| Service Desk Analyst | Executes IT provisioning tasks, updates status | Anthony Perez, Jason Hernandez |
| Service Desk Manager | Supervisory view across service desk workload | Michael Boyce |
| Hiring Manager | Completes Section 2, views own hires only | Various |
| HRIS Analyst | Views limited data for Infor reconciliation | Sarah Chen |

### Visibility Matrix

| Data Element | HR Gen | HR Mgr | SD Analyst | SD Mgr | Hiring Mgr | HRIS |
|-------------|:---:|:---:|:---:|:---:|:---:|:---:|
| Employee name | ✓ | ✓ | ✓ | ✓ | ✓ (own) | ✓ |
| Badge number | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Employee ID | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Job title / department | ✓ | ✓ | ✓ | ✓ | ✓ (own) | ✓ |
| AD group memberships | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| Membership diff | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| Process status & tasks | ✓ | ✓ | ✓ (own) | ✓ | ✓ (own) | ✗ |
| Readiness results | ✓ | ✓ | ✓ | ✓ | ✓ (own) | ✗ |
| Aggregate dashboard | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |

---

## 7. MVP Screenshots

![Dashboard — KPI cards, active processes, readiness overview](screenshots/mvp-dashboard.png)

![Processes — list view with status badges and filters](screenshots/mvp-processes.png)

![Process Detail — task checklist, form status, employee info](screenshots/mvp-process-detail.png)

![Readiness — day-one validation results grid](screenshots/mvp-readiness.png)

![Admin Overview — read-only configuration (MVP badge)](screenshots/mvp-admin-overview.png)

![Admin Integrations — connection status display](screenshots/mvp-admin-integrations.png)

---

## 8. Open Questions

| # | Question | Impact if Unresolved |
|---|----------|---------------------|
| OQ-1 | Can COTA grant read-only API access to Infor for non-sensitive fields? | Email validation falls back to manual |
| OQ-2 | Badge number spreadsheet format and location? | Determines import vs replace strategy |
| OQ-3 | Current ticketing system API availability? | Ticket tracking: automated vs manual |
| OQ-4 | Azure AD permissions for session/MFA checks? | Offboarding validation may be manual |
| OQ-5 | Will hiring managers accept web-based Section 2? | May need Word doc download/re-upload |
| OQ-6 | HR side of offboarding — follow-up session needed? | Offboarding flow incomplete |
| OQ-7 | SSO via Azure AD / Entra ID for authentication? | Affects architecture |
| OQ-8 | Data residency requirements — cloud or on-premises? | Affects infrastructure |
| OQ-9 | Timeline for Infor TA module and FreshService? | Determines scope of Staff Sync features |

---

## 9. Strategic Candor

Staff Sync is a tracking and validation layer built on top of manual processes and disconnected systems. It makes the current broken workflow more visible and catches errors earlier — but **does not fix the underlying problems**.

**The decision gate:**

- **If Infor TA + FreshService within 6 months:** Descope to validation-only (readiness checks + email sync). Don't build form routing or status tracking.
- **If 12+ months away:** Build all four MVP features. Current process causes measurable harm now.
- **If timeline unknown:** Build validation first. Add form routing after 60 days if platform timeline remains unclear.

**Core principle:** Staff Sync's **permanent value** is cross-system validation (something platform systems may never fully cover). Its **temporary value** is process tracking and form routing. Build the permanent value first.
