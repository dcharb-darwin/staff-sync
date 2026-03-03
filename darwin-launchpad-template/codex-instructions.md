# codex-instructions.md — {Project Name}

> Read `agents/darwin-standards.md` + `agents/standards.md` + `PRD.MD` before any work.
> Invocation: `CODEX_SKIP_MEMORY_GATE=1 /opt/homebrew/bin/codex exec '{prompt}'`

## CRITICAL — Never Violate

> **`await` ALL Drizzle ops | No PII ever | Light theme default**

---

## What This App Does

> {2-3 sentences — what this project does and why it exists.}

---

## Architecture Map

```
server/
├── _core/
│   └── index.ts          ← Express + tRPC + Vite dev middleware
├── db/
│   ├── schema.ts         ← Drizzle ORM schema
│   ├── index.ts          ← DB connection (better-sqlite3, WAL mode)
│   └── seed.ts           ← Mock/seed data
└── routers.ts            ← tRPC routers

client/src/
├── main.tsx, App.tsx, index.css
├── contexts/             ← ViewModeContext, ThemeContext
├── hooks/                ← Custom React hooks
├── lib/
│   ├── trpc.ts           ← tRPC React client
│   ├── utils.ts          ← cn() merge utility
│   └── badge-styles.ts   ← Shared badge style maps
├── components/
│   ├── AppLayout.tsx     ← App shell — sticky header, nav
│   ├── ViewToggle.tsx    ← Card/list toggle (controlled props)
│   └── ui/               ← shadcn/ui primitives
└── pages/

shared/types.ts            ← Shared type definitions + label maps
```

---

## Conventions

- **Single-port server** — Express hosts tRPC + Vite dev on `PORT` (env-driven, default `3000`)
- **Database** — Drizzle + SQLite in `data/` directory (must exist before DB opens)
- **View modes** — `ViewModeContext` controls MVP vs Vision rendering
- **Dates** — ISO strings in DB, parsed with date-fns on client
- **Badge styles** — Import from `@/lib/badge-styles`, never define locally

---

## Architecture Overrides

> {Only what differs from Darwin standard. Leave blank if none.}

---

## Read Order (MANDATORY)

1. `agents/darwin-standards.md` — cross-project standards
2. `agents/standards.md` — project pitfalls P1–P10 + design principles D1–D3
3. `PRD.MD` — business requirements, process flows, data classification
4. This file — architecture map, schema, conventions

## After Every Change

1. Run `npm run check` to verify TypeScript
2. Verify in browser if UI changed
3. Check that no PII was introduced
