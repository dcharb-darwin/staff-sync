# CLAUDE.md — Project Instructions for Claude Code

> This file is read automatically by Claude Code CLI when working in this project.
> It syncs with `AGENTS.md` (the master config) — do not diverge.

## ⚠️ PITFALLS — Read Before Anything

1. **`await` ALL Drizzle operations.** Drizzle v0.45+ returns Promises even on SQLite. Missing `await` → `TypeError: object is not iterable`.
2. **Theme = "light" always.** `defaultTheme="light"` on ThemeProvider. Never `"system"` or `"dark"` — caused lock-in on TaskLine.
3. **No PII anywhere.** No SSN, home address, DOB, bank info, compensation, benefits. Hard boundary from PRD §3.2.
4. **Role visibility.** Data display must respect PRD §6.2 visibility matrix. Hiring managers see only their own hires. HRIS analysts see only reconciliation data.
5. **Badge contrast.** Use oklch token pairs. Dark text on dark background caused readability failures on TaskLine.

---

## Project Overview

**Staff Sync** — MVP mockup for COTA HR onboarding/transfer/offboarding tracking.
Tracks employee lifecycle processes, auto-generates EIS/BOIS forms, and validates day-one readiness across disconnected systems.

**Stack:** React 19 / Vite / tRPC / Drizzle / SQLite / TailwindCSS v4 / shadcn/ui
**Design:** Matches TaskLine — light mode default, blue-600 accent, oklch tokens
**Note:** This is a mockup — AD and Infor data is simulated via seed data in SQLite.

## Architecture Map (ALWAYS reference before building)

```
server/
├── _core/
│   └── index.ts          ← Express server, tRPC middleware, Vite dev middleware
├── db/
│   ├── schema.ts         ← Drizzle ORM — 8 tables (employees, processes, tasks, forms, validations, mock AD/Infor)
│   ├── index.ts          ← DB connection (better-sqlite3, WAL mode, ensures data/ dir exists)
│   └── seed.ts           ← Mock data: bus operator class of 8, admin hires, transfers, rehire with mismatch
└── routers.ts            ← tRPC routers: dashboard, processes, employees, tasks, forms, validation

client/
├── index.html            ← HTML entry point
└── src/
    ├── main.tsx           ← React entry, tRPC + React Query providers
    ├── index.css          ← TailwindCSS v4 + oklch design tokens (light/dark)
    ├── App.tsx            ← Routing (wouter), ThemeProvider (default: light), providers
    ├── lib/
    │   ├── trpc.ts        ← tRPC React client
    │   └── utils.ts       ← cn() merge utility
    ├── components/
    │   ├── AppLayout.tsx  ← App shell — sticky header, Staff Sync branding, nav links
    │   └── ui/            ← shadcn/ui primitives (card, button, badge, dialog, etc.)
    └── pages/
        ├── Dashboard.tsx      ← KPI cards, active processes, readiness alerts
        ├── Processes.tsx      ← Process list with type/status/date filters
        ├── ProcessDetail.tsx  ← Task checklist, EIS/BOIS form status, validation results
        ├── EISForm.tsx        ← EIS/BOIS form (Section 1 HR entry + Section 2 hiring manager)
        └── Readiness.tsx      ← Day-one readiness dashboard (per-employee + per-class)

shared/
└── types.ts               ← Shared type definitions
```

## Database Schema (8 tables)

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `users` | name, email, role | 6 roles per PRD §6.1 |
| `employees` | firstName, lastName, badgeNumber, employeeId, startDate, employeeType | Non-sensitive only |
| `processes` | employeeId, processType (onboarding/transfer/offboarding), status | Polymorphic lifecycle |
| `tasks` | processId, description, ownerId, ownerRole, status, sortOrder | Ordered checklist |
| `eisBoisForms` | processId, formType (eis/bois), section1Data (JSON), section2Data (JSON) | Web-first form |
| `validationChecks` | processId, checkType, status (pass/warning/fail), details | Day-one readiness |
| `adMockData` | email, displayName, accountEnabled, memberOf (JSON) | Simulated AD |
| `inforMockData` | employeeId, email, name, jobTitle | Simulated Infor |

## Critical Conventions

- **Design matches TaskLine** — light mode default, blue-600 accent, InterVariable font, oklch tokens
- **Dates as ISO strings** — stored in DB, parsed with date-fns on client
- **JSON fields** for form section data — keeps schema flexible for EIS vs BOIS variants
- **Process tasks ordered** by `sortOrder` — represents the step sequence from PRD §2.7
- **Validation checks** match PRD §2.8 pass/warning/fail criteria exactly
- **`data/` directory** must exist before opening SQLite DB — create in db/index.ts

## Before Every Session — Read Order (MANDATORY)

1. `AGENTS.md` — orchestration protocol, pitfalls, gating rules
2. `PRD.MD` — full business requirements, process flows, user stories, data classification
3. This file — architecture map, schema, conventions

## After Every Change

1. Run `npm run check` to verify TypeScript
2. Verify in browser if UI changed
3. Check that no PII was introduced
