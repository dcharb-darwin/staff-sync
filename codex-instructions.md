# Codex CLI — Project Instructions

> This file provides context for OpenAI Codex CLI when working in this project.
> It syncs with `AGENTS.md` (the master config) — do not diverge.

## ⚠️ PITFALLS — Read Before Anything

1. **`await` ALL Drizzle operations.** Drizzle v0.45+ returns Promises even on SQLite. Missing `await` → `TypeError: object is not iterable`.
2. **Theme = "light" always.** `defaultTheme="light"` on ThemeProvider. Never `"system"` or `"dark"`.
3. **No PII anywhere.** No SSN, home address, DOB, bank info, compensation, benefits. Hard boundary from PRD §3.2.
4. **Role visibility.** Data display must respect PRD §6.2 visibility matrix.
5. **Badge contrast.** Use oklch token pairs. Dark text on dark background caused readability failures on TaskLine.

---

## Project Overview

**Staff Sync** — MVP mockup for COTA HR onboarding/transfer/offboarding tracking.

**Stack:** React 19 / Vite / tRPC / Drizzle / SQLite / TailwindCSS v4 / shadcn/ui
**Design:** Matches TaskLine — light mode default, blue-600 accent, oklch tokens
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
├── components/ (AppLayout, ui/)
└── pages/ (Dashboard, Processes, ProcessDetail, EISForm, Readiness)

shared/types.ts
```

## Database Schema (8 tables)

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `users` | name, email, role | 6 roles per PRD §6.1 |
| `employees` | firstName, lastName, badgeNumber, employeeId, startDate | Non-sensitive only |
| `processes` | employeeId, processType, status | onboarding/transfer/offboarding |
| `tasks` | processId, description, ownerId, status, sortOrder | Ordered checklist |
| `eisBoisForms` | processId, formType, section1Data (JSON), section2Data (JSON) | Web-first form |
| `validationChecks` | processId, checkType, status (pass/warning/fail) | Day-one readiness |
| `adMockData` | email, displayName, accountEnabled, memberOf (JSON) | Simulated AD |
| `inforMockData` | employeeId, email, name, jobTitle | Simulated Infor |

## Critical Conventions

- **Design matches TaskLine** — light mode, blue-600 accent, oklch tokens
- **Dates as ISO strings** — parsed with date-fns
- **JSON fields** for EIS/BOIS form sections
- **Tasks ordered** by `sortOrder`
- **`data/` directory** must exist before SQLite DB opens
- **Always `await`** Drizzle operations

## Design Principles (MANDATORY — see AGENTS.md for full details)

**D1: Universal Drill-Down + Source Provenance.** Every data item shown must be clickable → navigates to detail. Every detail view shows where data came from (system name, SOP reference, source document link). Never display a data point that can't be explored.

**D2: Card ↔ List Toggle.** Wherever cards are used, add a toggle to switch to list/table view. Use `ViewToggle` component (LayoutGrid / List icons). Store preference in localStorage.

**D3: Visual Parity.** Must be indistinguishable from TaskLine and Invoice Processing. Same oklch tokens, shadcn patterns, spacing, typography, animations. If it looks different from TaskLine, it's wrong.

## Read Order (MANDATORY)

1. `AGENTS.md` → 2. `PRD.MD` → 3. This file
