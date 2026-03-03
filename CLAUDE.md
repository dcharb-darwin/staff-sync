# CLAUDE.md — Project Instructions for Claude Code

> Read automatically by Claude Code CLI. Single-file worker context.

## ⚠️ CRITICAL — Never Violate

> **`await` ALL Drizzle ops | Light theme only | No PII ever**
> **Full rules: [`agents/standards.md`](agents/standards.md) — READ BEFORE CODING**

---

## Project Overview

**Staff Sync** — MVP mockup for COTA HR onboarding/transfer/offboarding tracking.
**Stack:** React 19 / Vite / tRPC / Drizzle / SQLite / TailwindCSS v4 / shadcn/ui
**Design:** Matches TaskLine — light mode default, blue-600 accent, oklch tokens
**Note:** Mockup — AD and Infor data simulated via seed data in SQLite.

## Architecture Map

```
server/
├── _core/
│   └── index.ts          ← Express server, tRPC middleware, Vite dev middleware
├── db/
│   ├── schema.ts         ← Drizzle ORM — 8 tables
│   ├── index.ts          ← DB connection (better-sqlite3, WAL mode)
│   └── seed.ts           ← Mock data: bus operators, admin hires, transfers
└── routers.ts            ← tRPC routers: dashboard, processes, employees, tasks, forms, validation

client/src/
├── main.tsx, App.tsx, index.css
├── lib/
│   ├── trpc.ts           ← tRPC React client
│   ├── utils.ts          ← cn() merge utility
│   └── badge-styles.ts   ← Shared badge style maps (single source of truth)
├── components/
│   ├── AppLayout.tsx     ← App shell — sticky header, nav links
│   ├── ViewToggle.tsx    ← Card/list toggle (controlled: mode/onModeChange props)
│   └── ui/               ← shadcn/ui primitives
└── pages/
    ├── Dashboard.tsx, Processes.tsx, ProcessDetail.tsx, EISForm.tsx, Readiness.tsx

shared/types.ts            ← Shared type definitions + label maps
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
| `adMockData` / `inforMockData` | Simulated AD + Infor | Mock external systems |

## Critical Conventions

- **Dates as ISO strings** — stored in DB, parsed with date-fns on client
- **JSON fields** for form section data — flexible for EIS vs BOIS variants
- **Tasks ordered** by `sortOrder` — step sequence from PRD §2.7
- **`data/` directory** must exist before opening SQLite DB
- **Badge styles** — import from `@/lib/badge-styles`, never define locally

## Read Order (MANDATORY)

1. `agents/standards.md` — pitfalls P1–P10 + design principles D1–D3
2. `PRD.MD` — business requirements, process flows, data classification
3. This file — architecture map, schema, conventions

## After Every Change

1. Run `npm run check` to verify TypeScript
2. Verify in browser if UI changed
3. Check that no PII was introduced
