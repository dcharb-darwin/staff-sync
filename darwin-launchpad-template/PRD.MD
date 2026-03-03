# PRD — {Project Name}

> Product Requirements Document
> Status: **Draft** | Last Updated: {YYYY-MM-DD}

---

## 1. Overview

### What is {Project}?

> {2-3 sentences describing what the application does and who it serves.}

### What It Is Not

> {Explicit boundaries — what this project will NOT do. Prevents scope creep.}

### The Problem

> {The pain point this project addresses. Why does it need to exist? What happens if we don't build it?}

---

## 2. Process Flows

> Swim-lane diagrams for each major workflow. Define actors, steps, decision points.

### 2.1 {Primary Flow Name}

```
{Actor A}          {Actor B}          {System}
─────────          ─────────          ────────
│                  │                  │
│  {Step 1}        │                  │
│─────────────────>│                  │
│                  │  {Step 2}        │
│                  │─────────────────>│
│                  │                  │  {Step 3}
│                  │<─────────────────│
```

> {Add additional flows as needed — one subsection per flow.}

---

## 3. Data Sources & PII Classification

### 3.1 Data Source Inventory

| Source | Type | Fields Used | Refresh Frequency | Notes |
|--------|------|-------------|-------------------|-------|
| {Source 1} | {API/DB/File} | {field list} | {real-time/daily/manual} | |
| {Source 2} | | | | |

### 3.2 PII Classification

| Category | Classification | Storage Policy |
|----------|---------------|----------------|
| Name, Badge Number | Non-Sensitive | Stored in local DB |
| Email (work) | Non-Sensitive | Stored in local DB |
| SSN, DOB, Home Address | **NEVER STORE** | Not collected, not displayed |
| Compensation, Benefits | **NEVER STORE** | Not collected, not displayed |

> **Never-Store Boundary:** This application must never collect, store, display, or transmit data classified as "NEVER STORE" above. This is a hard constraint, not a preference.

---

## 4. Integrations

### 4.1 API Inventory

| System | Access Method | Status | Owner | Notes |
|--------|-------------|--------|-------|-------|
| {System 1} | {REST/LDAP/File} | {Available/Pending/Blocked} | {team} | |
| {System 2} | | | | |

### 4.2 Fallback Strategies

| Integration | If Unavailable | MVP Approach |
|-------------|---------------|-------------|
| {System 1} | {fallback behavior} | Mock data in SQLite seed |
| {System 2} | | |

> All integrations are **simulated via seed data** in MVP. Live connections are Vision scope.

---

## 5. User Stories

### By Role: {Role 1}

| ID | Story | Priority |
|----|-------|----------|
| US-1 | As a {role}, I want to {action} so that {outcome}. | Must-Have |
| US-2 | As a {role}, I want to {action} so that {outcome}. | Nice-to-Have |

### By Role: {Role 2}

| ID | Story | Priority |
|----|-------|----------|
| US-3 | As a {role}, I want to {action} so that {outcome}. | Must-Have |

> Use **US-N** format for all story IDs. Must-Have = MVP scope. Nice-to-Have = Vision scope.

---

## 6. RBAC — Role-Based Access Control

### 6.1 Role Definitions

| Role | Description | Example Users |
|------|------------|---------------|
| {Role 1} | {what this role does} | {example names/titles} |
| {Role 2} | | |

### 6.2 Visibility Matrix

| Feature / Page | {Role 1} | {Role 2} | {Role 3} |
|---------------|----------|----------|----------|
| Dashboard | View | View | View |
| {Feature 1} | View + Edit | View | Hidden |
| Admin Settings | Full Access | Read-Only | Hidden |

---

## 7. Open Questions

| ID | Question | Impact if Unresolved | Owner | Status |
|----|----------|---------------------|-------|--------|
| OQ-1 | {question} | {what breaks or stalls if unanswered} | {who can answer} | Open |
| OQ-2 | | | | |

> Track all unknowns here. Resolve before advancing past MVP.

---

## 8. Strategic Candor

> Honest assessment of the build-vs-wait decision for this project.

### Why Build Now?

> {What makes this the right time? What leverage do we have?}

### Why Wait?

> {What risks exist? What dependencies are unresolved? What could change?}

### Recommendation

> {Build / Wait / Build-MVP-then-reassess. Justify the call.}
