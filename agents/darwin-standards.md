# Darwin Standards — Cross-Project Reference

> Living document. Governs all Darwin dashboard projects.
> Derived from patterns across TaskLine, IPC, and Staff Sync.
> 3-agent consensus (Antigravity + Claude + Codex).

---

## 1. Launchpad Process

### Run 1: MVP (= Phase 0 Foundation + Phase 1 MVP)
- Core workflows only — what the customer sees in the first demo
- All data is seeded mock / simulated — no live integrations
- Admin/Config page **always visible** — read-only with `<Badge>MVP</Badge>` indicator
- PRD.MD at project root with screenshots mapped to discovery findings
- Walkthrough with QA evidence (screenshots, browser recordings)

### Run 2: Vision (= Phase 2)
- All features from the full PRD — admin, integrations, reporting
- Admin/Config fully functional (editable forms, mutation endpoints)
- PRD.MD updated with Vision features + updated walkthrough
- Deploy-ready

### MVP ↔ Vision Toggle (Required for phased projects)
```tsx
// ViewModeContext pattern (from TaskLine)
type ViewMode = "mvp" | "vision";
// <ViewModeProvider> wraps app
// Routes: {!isMvp && <Route path="/admin/advanced" ... />}
// Sections: {!isMvp && <VisionOnlyPanel />}
// Admin: always routed — MVP renders read-only, Vision adds mutations
// Default: "mvp" — persisted in localStorage
```

### Standalone but Integration-Ready
- Each project: own DB, own Docker, own port (allocate in docs)
- Shared conventions: entity IDs, webhook payloads, type patterns
- Integration fields (`externalId`, `metadata`, `tags`) are opaque to local UI

---

## 2. Tech Stack

| Layer | Technology | Version Pin | Notes |
|-------|-----------|-------------|-------|
| Runtime | Node.js | 22 LTS | `FROM node:22-slim` |
| Framework | React | ~19.1.0 | |
| Bundler | Vite | ~7.0.0 | `@vitejs/plugin-react` |
| Router | wouter | latest | Lightweight SPA routing |
| API | tRPC | ~11.0.0 | Type-safe RPC |
| Query | @tanstack/react-query | ~5.0.0 | tRPC adapter |
| ORM | Drizzle | ~0.45.0 | ⚠️ Always `await` all ops |
| DB | SQLite (better-sqlite3) | — | WAL mode, `data/` dir |
| CSS | TailwindCSS | v4 | `@tailwindcss/vite` |
| Components | shadcn/ui | — | Radix primitives |
| Icons | lucide-react | — | |
| Validation | Zod | ~4.0.0 | tRPC input validation |
| Server | Express | ~5.0.0 | tRPC + Vite dev middleware |
| PM | npm | — | Standardized across projects |

> Run `npm outdated` before starting Vision run. Update deliberately, not automatically.

---

## 3. Design System

### Visual Identity
- **Theme:** Light default (`defaultTheme="light"`, **never** `"system"`)
- **Accent:** blue-600
- **Background:** slate-50, white cards, shadow-sm
- **Typography:** InterVariable / system-ui
- **Spacing:** container, py-8 main, p-6 cards
- **Nav:** Sticky header, blue-50 active highlight

### Design Principles (details in project `agents/standards.md`)
- **D1:** Universal drill-down + source provenance
- **D2:** Card ↔ list toggle (shared `ViewToggle`, controlled props)
- **D3:** Visual parity — if it looks different from TaskLine, it's wrong

### Badge Colors (shared `badge-styles.ts`)
| Status | Background | Text |
|--------|-----------|------|
| Active / In Progress | blue-100 | blue-700 |
| Completed / Pass | green-100 | green-700 |
| Warning / Attention | amber-100 | amber-700 |
| Failed / Not Ready | red-100 | red-700 |

---

## 4. Architecture Standard

```
project-root/
├── AGENTS.md              ← Orchestrator guardrails
├── CLAUDE.md              ← Claude worker (thin — points to standards)
├── codex-instructions.md  ← Codex worker (thin — points to standards)
├── PRD.MD                 ← Product requirements (MVP scope → Vision scope)
├── Dockerfile / docker-compose.yml
├── package.json / vite.config.ts / tsconfig.json / drizzle.config.ts
│
├── agents/
│   ├── darwin-standards.md ← This file (cross-project reference)
│   ├── standards.md        ← Project-specific pitfalls + design principles
│   ├── lessons.md          ← Append-only learnings
│   └── sessions.md         ← Append-only session log
│
├── .agents/workflows/      ← launchpad.md, dispatch.md, qa.md, post-qa-docs.md
│
├── docs/                   ← Screenshots, recordings, QA evidence
│
├── server/
│   ├── _core/index.ts      ← Express + tRPC + Vite dev middleware (port 3000)
│   ├── db/ (schema.ts, index.ts, seed.ts)
│   └── routers.ts
│
├── client/src/
│   ├── main.tsx, App.tsx, index.css (oklch tokens)
│   ├── contexts/ (ViewModeContext, ThemeContext)
│   ├── hooks/, lib/ (trpc, utils, badge-styles)
│   ├── components/ (AppLayout, ViewToggle, ui/)
│   └── pages/ (Dashboard, details, AdminSettings)
│
└── shared/types.ts
```

### Key Conventions
- Single Express server hosts tRPC + Vite dev on port 3000
- New DB fields: **nullable** or have defaults
- **Always `await`** Drizzle operations
- `data/` directory must exist before SQLite opens
- Vite alias: `"@"` (no trailing slash)
- Memory bank: 2 files only (`lessons.md` + `sessions.md`)
- Docker **required for QA** (`browser_subagent`). Local dev uses `npm run dev`
- Worktrees for multi-day branches. Single-session MVP works on main

---

## 5. Documentation

| Doc | Location | Content |
|-----|----------|---------|
| PRD | `PRD.MD` (root) | Requirements, user stories, data classification |
| Screenshots | `docs/` | Running app screenshots, browser recordings |
| Walkthrough | `docs/` or artifact | QA evidence, commit hashes, pass/fail tables |
| Schema | `server/db/schema.ts` | The source of truth (don't duplicate) |

### Requirements for Both Runs
- Screenshots from running app (Docker + browser_subagent)
- Browser recordings (.webp) for user flows
- Explanations mapped to discovery findings where available
- Data classification (sensitive vs. non-sensitive)

---

## 6. Admin / Config

| Run | Visibility | Behavior |
|-----|-----------|----------|
| MVP | Always in nav | Read-only tables, `<Badge>MVP</Badge>`, seeded config data |
| Vision | Always in nav | Fully editable forms, mutation endpoints, audit log |

The Admin route exists from Phase 0 (P3: nav structure locked). MVP renders read-only. Vision replaces with editable.

---

## 7. Per-Project CLAUDE.md Template

```markdown
# CLAUDE.md — [Project Name]

## ⚠️ Critical — Never Violate
> await ALL Drizzle ops | Light theme only | No PII ever
> Full rules: agents/darwin-standards.md + agents/standards.md — READ FIRST

## What This App Does
> 2-3 sentences — what's unique about THIS project.

## Architecture Overrides
> Only what DIFFERS from Darwin standard. Leave blank if none.

## Schema
> Project-specific table summary.

## Read Order
> 1. agents/darwin-standards.md → 2. agents/standards.md → 3. PRD.MD → 4. This file
```
