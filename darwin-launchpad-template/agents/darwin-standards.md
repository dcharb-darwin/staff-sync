# Darwin Development Standards

> Cross-project architectural bible for all Darwin Launchpad applications.
> This file is the single source of truth. Worker files (CLAUDE.md, codex-instructions.md) point here.

---

## §1 — Launchpad Process

Darwin applications follow a two-run delivery cycle:

| Run | Phase | Scope | Data | Admin |
|-----|-------|-------|------|-------|
| **Run 1 (MVP)** | Phase 0 + Phase 1 | Core pages, seeded mock data, read-only admin | SQLite with seed.ts | Read-only, `[MVP]` badge |
| **Run 2 (Vision)** | Phase 2 | Live integrations, full admin CRUD, automation, production deploy | Live API connections | Full CRUD mutations |

- **Phase 0 — Foundation:** Repo, folder structure, pinned stack, agent files, Docker, base UI shell, PRD
- **Phase 1 — MVP Features:** Schema + seed, tRPC routers, core pages, admin (read-only), QA, docs
- **Phase 2 — Vision Features:** Live integrations, admin CRUD, notifications, analytics, SSO, production deploy

---

## §2 — Tech Stack

| Layer | Technology | Version Pin | Notes |
|-------|-----------|-------------|-------|
| Runtime | Node.js | 22 LTS | `FROM node:22-slim` in Docker |
| Framework | React | ~19.1.0 | |
| Bundler | Vite | ~7.0.0 | `@vitejs/plugin-react` |
| Router | wouter | latest | Lightweight alternative to react-router |
| API | tRPC | ~11.0.0 | End-to-end type safety |
| Query | @tanstack/react-query | ~5.0.0 | |
| ORM | Drizzle | ~0.44.0 | **Always `await` all operations** (P1) |
| DB | SQLite | — | `better-sqlite3`, WAL mode |
| CSS | TailwindCSS | v4 | `@tailwindcss/vite` plugin |
| Components | shadcn/ui | — | Radix primitives, copy-paste model |
| Icons | lucide-react | — | |
| Validation | Zod | ~4.0.0 | Runtime + compile-time validation |
| Server | Express | ~4.21.0 | Hosts tRPC + Vite dev middleware |
| PM | npm | — | `npm ci` when lockfile exists |

**Version strategy:** Tilde ranges (`~major.minor.0`) prevent silent breaking changes while allowing patch updates.

---

## §3 — Design System

### Visual Identity
- **Theme:** Light mode default (`defaultTheme="light"`). Never use `"system"` — causes dark-mode lock-in (P2).
- **Accent:** blue-600 (`oklch(0.546 0.245 262.881)`)
- **Typography:** InterVariable / system-ui
- **Background:** slate-50 gradient, white cards, shadow-sm

### The 50/900 Rule (Badge Contrast)
Tailwind v4 oklch `*-100` bg / `*-700` text produces insufficient contrast. Use:

| Semantic | Background | Text | Border |
|----------|-----------|------|--------|
| Blue / Info | `bg-sky-50` | `text-sky-900` | `border-sky-200` |
| Green / Success | `bg-emerald-50` | `text-emerald-900` | `border-emerald-200` |
| Amber / Warning | `bg-amber-50` | `text-amber-900` | `border-amber-200` |
| Red / Danger | `bg-rose-50` | `text-rose-900` | `border-rose-200` |
| Neutral | `bg-slate-50` | `text-slate-900` | `border-slate-200` |

**Badge styles:** Centralized in `client/src/lib/badge-styles.ts`. All components import from there.

**Design tokens:** Live in `client/src/index.css` — copy from template, do not modify ad-hoc.

### Design Principles
- **D1: Universal Drill-Down** — Every data item is clickable to a detail view with source provenance.
- **D2: Card ↔ List Toggle** — Shared `ViewToggle` component on all list views. Parent owns state via `useViewMode()` hook, passes `mode`/`onModeChange` as controlled props.
- **D3: Visual Parity** — All Darwin apps must be visually indistinguishable from the TaskLine standard.

---

## §4 — Architecture

### Standard Folder Structure

```
project-root/
├── PRD.MD                         # Business requirements
├── AGENTS.md                      # Orchestrator guardrails
├── CLAUDE.md                      # Claude Code pointer
├── codex-instructions.md          # Codex CLI pointer
├── Dockerfile / docker-compose.yml
├── package.json / vite.config.ts / tsconfig.json / drizzle.config.ts
│
├── agents/
│   ├── darwin-standards.md        # This file
│   ├── standards.md               # Project pitfalls + design principles
│   ├── lessons.md                 # Append-only learnings
│   └── sessions.md                # Session log
│
├── .agents/workflows/             # launchpad, dispatch, qa, post-qa-docs
│
├── server/
│   ├── _core/index.ts             # Express + tRPC + Vite middleware
│   ├── db/schema.ts               # Drizzle ORM schema
│   ├── db/index.ts                # DB connection (WAL mode)
│   ├── db/seed.ts                 # Mock data seeder
│   └── routers.ts                 # tRPC routers
│
├── client/src/
│   ├── main.tsx, App.tsx, index.css
│   ├── contexts/                  # ViewModeContext, ThemeContext
│   ├── components/                # AppLayout, ViewToggle, ui/
│   ├── pages/                     # Dashboard, AdminSettings, etc.
│   └── lib/                       # trpc client, badge-styles, utils
│
├── shared/types.ts                # Shared TS types + label maps
│
├── docs/
│   └── screenshots/               # QA evidence
│
└── scripts/setup.sh               # mkdir -p data && npm ci
```

### Single-Port Architecture
Express hosts both tRPC API and Vite dev server on a single port. Port is env-driven via `PORT` variable (default 3000).

### Port Registry
> Note: This registry is maintained centrally. Update when adding new projects.

| Project | Port |
|---------|------|
| TaskLine | 3000 |
| Staff Sync | 3001 |
| IPC / Lake Stevens | 3002 |
| New projects | 3003+ |

### Key Rules
- `data/` directory must exist before opening SQLite DB
- Vite dev middleware needs explicit `configFile` path in Docker (P7)
- Vite alias: `"@"` not `"@/"` — no trailing slash (P9)
- All Drizzle operations must be `await`ed (P1)

---

## §5 — Admin Configuration Pattern

Every Darwin app must include an Admin page with these default tabs:

| Tab | Content | MVP | Vision |
|-----|---------|-----|--------|
| **System Overview** | App name/version, environment, DB stats, view mode | Read-only | Read-only |
| **Integrations** | External system cards (health, sync status, field mapping) | Read-only, mock status | Live connection testing |
| **Notifications** | Trigger list, email templates | Read-only templates | Editable templates, SMTP config |
| **Process Config** | Workflow templates, validation rules | Read-only | Full CRUD |
| **Users & Roles** | User list, role assignments, visibility matrix | Read-only | Add/edit/deactivate users |

This is the **default admin IA**. Projects may add domain-specific tabs or rename existing ones, but the 5 base categories should be present.

**MVP indicator:** Each section displays `<Badge variant="outline">MVP</Badge>` when in MVP mode.

---

## §6 — Documentation Standards

Every Darwin project must produce 5 documentation files in `docs/`:

| Document | Content |
|----------|---------|
| `docs/DATA_MODEL.md` | Schema reference, mermaid ER diagram, PII classification, enum values |
| `docs/MVP_PRD.md` | Run 1 scope — process flows, user stories, RBAC, screenshots |
| `docs/VISION_PRD.md` | Run 2 scope — integrations, admin CRUD, automation, roadmap |
| `docs/WALKTHROUGH.md` | Developer guide — setup, routes, agent pipeline, seed data, QA evidence |
| `README.md` (root) | GitHub landing page — description, features, tech stack, quick start |

**Screenshots:** All images in `docs/screenshots/` using relative paths for GitHub rendering.

---

## §7 — Architectural Patterns

### Pattern A: Visibility & Validation Layer

Darwin dashboards are **read-only visibility and validation layers**. They do not replace source systems (AD, HRIS, ERP, ticketing). They read from them, track process state, and flag inconsistencies.

**Integration Matrix:**

| Layer | System Type | Data Role | Integration |
|-------|-------------|-----------|-------------|
| Identity/Auth | AD / Azure | Validation (email, name, status) | Real-time API / OAuth |
| Financial/ERP | Springbrook / Oracle | Financial visibility (budget codes, POs) | Read-only / Excel export |
| Document Mgmt | SharePoint / GDrive | Source provenance (signed PDFs, contracts) | External deep links |
| Operations | TaskLine / IPC | Process state (schedules, invoices) | Bidirectional sync / manual import |

**Validation Engine:** Every app has a domain-specific validation engine:
- Staff Sync: "Day-One Readiness" — compares names, emails, badges across AD and Infor
- IPC: "Gut-Check Engine" — compares % spent vs % scope complete

### Pattern B: Honest Source Labels

Every data field displayed must indicate its source provenance:

| Priority | Source Type | Detected By | UI Label | Styling |
|----------|-----------|-------------|----------|---------|
| 1 | Real Source | `.pdf`, `.xlsx`, `.docx` | `📄 Source PDF` | Bold, primary blue |
| 2 | External Link | `http://`, `https://` | `🔗 External Link` | Standard link blue |
| 3 | Demo/Mockup | `.html` (local) | `📄 Demo` | Gray, italicized |
| 4 | No Source | `null`, `""` | `(no source)` | Muted/faded |

**Rules:** Idempotent display (same label everywhere). Pluggable storage (no assumptions about SharePoint vs S3). Demo transparency (demo docs include watermark).

---

## §8 — Seed Data Conventions

Every project needs mock data for MVP:

1. `seed.ts` runs on startup, checks `if (count > 0) skip` — idempotent
2. **Deterministic IDs and dates** — same seed produces same data every time
3. **Realistic but fake data** — use plausible names, departments, dates
4. **No PII in seed payloads** — no SSN, home address, DOB, bank info, compensation
5. **Reset:** `rm -f data/*.db` before restart to re-seed
6. **Variety:** Include edge cases and realistic failure scenarios (mismatches, missing data, warnings)

---

## §9 — Agent Pipeline

### Instruction Chain
1. `agents/darwin-standards.md` (this file) — cross-project bible
2. `agents/standards.md` — project pitfalls P1-P10+ and design principles D1-D3+
3. `PRD.MD` — business requirements
4. Worker files (`CLAUDE.md`, `codex-instructions.md`) — thin pointers to above

### Dispatch Rules
- **Batch size:** Max 5 files or ~500 lines per dispatch
- **Non-overlapping targets:** No two agents edit the same file
- **Sequential vs parallel:** Shared infra first, then pages in parallel
- **Claude Code:** `claude -p '...' --dangerously-skip-permissions` (single-quoted prompts)
- **Codex CLI:** `CODEX_SKIP_MEMORY_GATE=1 /opt/homebrew/bin/codex exec '...'`

### Memory Files
- `agents/lessons.md` — append-only learnings (never delete)
- `agents/sessions.md` — append-only session log

### Anti-Reversion Rule
If the orchestrator catches itself editing 3+ implementation files directly, STOP. Dispatch to Claude Code or Codex instead.
