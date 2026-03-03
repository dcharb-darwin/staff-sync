# Codex CLI — Project Instructions

> Context for OpenAI Codex CLI when working in this project.

## ⚠️ CRITICAL — Never Violate

> **`await` ALL Drizzle ops | Light theme only | No PII ever**
> **Darwin standards: [`agents/darwin-standards.md`](agents/darwin-standards.md)** (stack, design, architecture)
> **Project rules: [`agents/standards.md`](agents/standards.md)** (pitfalls P1–P10, design principles D1–D3)

---

## Project Overview

**Staff Sync** — MVP mockup for COTA HR onboarding/transfer/offboarding tracking.
**Stack:** React 19 / Vite / tRPC / Drizzle / SQLite / TailwindCSS v4 / shadcn/ui
**Design:** Matches TaskLine — light mode, blue-600 accent, oklch tokens
**Note:** Mockup — AD and Infor data simulated via seed data.

## Architecture Map

```
server/
├── _core/index.ts        ← Express + tRPC + Vite dev middleware
├── db/
│   ├── schema.ts         ← 8 tables (employees, processes, tasks, forms, validations, mock AD/Infor)
│   ├── index.ts          ← DB connection (better-sqlite3, WAL mode)
│   └── seed.ts           ← Mock data
└── routers.ts            ← tRPC routers

client/src/
├── main.tsx, App.tsx, index.css
├── lib/ (trpc.ts, utils.ts, badge-styles.ts)
├── components/ (AppLayout, ViewToggle, ui/)
└── pages/ (Dashboard, Processes, ProcessDetail, EISForm, Readiness)

shared/types.ts
```

## Database Schema (8 tables)

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `users` | name, email, role | 6 roles per PRD §6.1 |
| `employees` | firstName, lastName, badgeNumber, startDate | Non-sensitive only |
| `processes` | employeeId, processType, status | onboarding/transfer/offboarding |
| `tasks` | processId, description, ownerId, status, sortOrder | Ordered checklist |
| `eisBoisForms` | processId, formType, section1Data/section2Data (JSON) | Web-first form |
| `validationChecks` | processId, checkType, status (pass/warning/fail) | Day-one readiness |
| `adMockData` / `inforMockData` | Simulated external systems | Mock AD + Infor |

## Critical Conventions

- **Design matches TaskLine** — light mode, blue-600 accent, oklch tokens
- **Dates as ISO strings** — parsed with date-fns
- **JSON fields** for EIS/BOIS form sections
- **Tasks ordered** by `sortOrder`
- **`data/` directory** must exist before SQLite DB opens
- **Badge styles** — import from `@/lib/badge-styles`, never define locally

## Read Order (MANDATORY)

1. `agents/darwin-standards.md` → 2. `agents/standards.md` → 3. `PRD.MD` → 4. This file
