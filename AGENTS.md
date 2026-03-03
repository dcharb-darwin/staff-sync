# Agent Workflow Guardrails — Staff Sync

This repository must be operated from a real git worktree.
Remote: `https://github.com/dcharb-darwin/staff-sync.git`

## Project Overview

**Staff Sync** — MVP mockup for COTA HR onboarding/transfer/offboarding tracking.
**Stack:** React 19 / Vite / tRPC / Drizzle / SQLite / TailwindCSS v4 / shadcn/ui
**Design:** Matches TaskLine and Invoice Processing — light mode default, blue-600 accent, oklch design tokens.

> This is a **mockup** — all external system data (AD, Infor, ticketing) is seeded mock data in SQLite. No live integrations.

---

## ⚠️ Standards — READ FIRST

> **All pitfalls (P1–P10) and design principles (D1–D3) are in [`agents/standards.md`](agents/standards.md).**
> Workers, orchestrator, and QA all reference this single file. Update rules there — not here.

**Critical (never violate):** `await` ALL Drizzle ops | Light theme only | No PII ever

---

## Orchestrator Protocol

**Antigravity is the ORCHESTRATOR, not a worker.** It reads this file, plans work, dispatches to Claude Code CLI or Codex CLI, monitors results, and reports to the user.

### Dispatch Agents

| Agent | Command | Auto-reads |
|-------|---------|------------|
| Claude Code | `claude -p "<prompt>"` | `CLAUDE.md` |
| Codex CLI | `codex exec "<prompt>"` | `codex-instructions.md` |
| Browser QA | `browser_subagent` | N/A |

### Dispatch Syntax

```bash
# Claude Code — direct invocation (DO NOT use screen+tee — produces empty logs)
claude -p "Read CLAUDE.md first. TASK: ..." --dangerously-skip-permissions 2>&1 | tail -5

# Max 5 files per dispatch. Break larger tasks into sequential batches.
# Use run_command with WaitMsBeforeAsync: 300000 and monitor with command_status.
```

### Dispatch Template

```
"Read CLAUDE.md AND PRD.MD first for full architecture and design context.

SYSTEM CONTEXT: [Brief summary of how this feature relates to other pages/components]
CROSS-CUTTING: [Any pages/components that render the same data — must stay consistent]
TASK: [Specific implementation instructions]
FILES TO EDIT: [Explicit list — prevents worker overlap]"
```

### Gating Rules

1. **No component edit without shared infrastructure.** If the same pattern appears in 2+ files, create a shared helper/component FIRST.
2. **No code before PRD.** Design goes in PRD.MD before implementation.
3. **No data-specific logic.** Never hardcode for a specific employee, department, or dataset in app code (seed data is excepted).
4. **Cross-cutting verification.** After ANY UI change, verify all pages showing the same entity type render consistently (`browser_subagent`).
5. **No PII.** Never store or display SSN, home address, DOB, compensation, bank info, benefits (PRD §3.2).
6. **Role visibility.** All data display must respect the visibility matrix in PRD §6.2.

---

## Schema Change Rules

When modifying `server/db/schema.ts`:

1. **New fields must be nullable** or have a default so existing data is unaffected.
2. **`await` on ALL Drizzle operations** — see P1 in `agents/standards.md`.
3. Run `npm run check` immediately after schema changes.

## Git & Worktree Flow

**Remote:** `https://github.com/dcharb-darwin/staff-sync.git` (identity: `dcharb-darwin`)
**Main branch:** `main`

### Preflight Checks
1. `git rev-parse --is-inside-work-tree` must return `true`
2. `git rev-parse --show-toplevel` must match this repository path
3. `git branch --show-current` must be printed in kickoff
4. `git remote -v` must include `dcharb-darwin/staff-sync`

### Worktree Strategy
```bash
# Create a worktree for feature work
git worktree add ../staff-sync-<feature> -b feature/<name>

# After work is done, commit and push from worktree
cd ../staff-sync-<feature>
git add -A && git commit -m "feat: <description>"
git push origin feature/<name>

# Clean up
cd ../HR
git worktree remove ../staff-sync-<feature>
```

### Commit Flow
1. Run validation: `npm run check`, `npm run build`.
2. Commit with conventional prefix: `feat:`, `fix:`, `docs:`, `refactor:`.
3. Push to origin.

## Docker Workflow

**Dev server runs in Docker** (same pattern as LakeStevens/IPC):
```bash
# Build and start
docker compose up --build -d

# Check logs
docker compose logs --tail 10

# Stop
docker compose down
```

Port 3000 serves Express + Vite dev middleware. Data volume persists SQLite DB.

## QA Protocol

Follow `.agents/workflows/qa.md` after every phase. QA uses Docker + `browser_subagent`.
**Prerequisite:** Docker Desktop must be running (P8 in `agents/standards.md`).

## Memory Bank

| File | Purpose | Update Cadence |
|------|---------|----------------|
| `agents/sessions.md` | Append-only session log | After every phase |
| `agents/lessons.md` | Pitfalls, gotchas, things that broke | When something breaks |
| `agents/standards.md` | Pitfalls P1–P10 + Design Principles D1–D3 | When rules change |
