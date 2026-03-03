# Lessons Learned

> Accumulated learnings across agent sessions. Append-only — never delete entries.

---

## Pre-Session — Imported from TaskLine + LakeStevens (2026-03-02)

### Drizzle ORM (from LakeStevens Session 2)
- Drizzle v0.45+ returns Promises even for synchronous SQLite — **always use `await`** on `.insert().returning()`, `.select()`, `.update()`, `.delete()`, `.run()`
- Destructuring without await causes `TypeError: object is not iterable`
- Must ensure `data/` directory exists before opening SQLite DB

### Orchestration (from LakeStevens Session 2)
- **Antigravity = orchestrator, Claude Code + Codex = workers**
- Direct `run_command` backgrounding (`&`) causes SIGINT (exit 130) — processes get killed
- **Working pattern:** `screen -dmS <name> bash -c '...'` for process isolation
- Claude Code flags: `-p "prompt" --dangerously-skip-permissions` for autonomous file writes
- Codex flags: `--full-auto "prompt"` — requires TTY, use `script -q` inside screen
- Workers share filesystem — coordinate to avoid write conflicts (assign non-overlapping files)

### Design (from TaskLine + LakeStevens)
- Light-mode-first: slate-50 bg, white cards, blue-600 accent, Inter font, shadow-sm
- `defaultTheme="light"` — never `"system"` (caused dark-mode lock-in on TaskLine requiring full audit)
- oklch token pairs for badge/tag contrast — low contrast caused readability failures on TaskLine
- Navigation structure should be locked early — redesign mid-build broke TaskLine, required full revert

### Memory Bank (from LakeStevens)
- 7-file memory bank went stale mid-session (`current-state.md` stuck at Module 1 while Modules 2-3 were built)
- Phase-based updates work better than timer-based anti-drift
- Simplified to 2 files: sessions.md + lessons.md

---

## Session 1 — Staff Sync MVP Build (2026-03-02)

### Claude Code Dispatch

**Screen + tee doesn't capture Claude output.** Claude Code CLI uses an interactive terminal mode — `screen -dmS name bash -c 'claude -p "..." 2>&1 | tee /tmp/output.log'` produces empty log files. The screen session completes but no output is captured.

**Working dispatch pattern:** Run Claude directly (no screen wrapper) and wait for it:
```bash
claude -p "..." --dangerously-skip-permissions 2>&1 | tail -5
```
Use `run_command` with large `WaitMsBeforeAsync` (300000) and monitor via `command_status`. This captures the tail output and provides exit code.

**Don't one-shot massive prompts.** A 200-line prompt covering all 23 files failed silently. Breaking into 3–4 focused tasks of 2–5 files each worked reliably:
- Task 1: Project config files (5 files) — ✅ partial (3/5)
- Task 2: UI components (18 files) — ✅ complete
- Task 3: Server foundation (5 files) — ✅ complete (2,308 lines)
- Task 4+5: Pages (5 files, split into 2 parallel dispatches) — ✅ complete

**Parallel dispatches work.** Two Claude instances editing non-overlapping files completed successfully in parallel. Just ensure file targets don't overlap.

### Vite Configuration

**Alias keys: no trailing slashes.** `"@/"` does NOT match imports like `@/lib/trpc`. Must use `"@"` (without trailing slash) as the alias key. This caused the first browser load failure.

**`import.meta.dirname` not `__dirname`.** ESM modules don't have `__dirname`. Use `import.meta.dirname` (Node 21.2+). This applies to both `vite.config.ts` and `server/_core/index.ts`.

**Vite dev middleware needs explicit `configFile`.** When creating Vite programmatically in `server/_core/index.ts` with `createServer({ root: '../../client' })`, Vite looks for `vite.config.ts` inside the `client/` directory — but our config is at the project root. Must pass `configFile: path.resolve(import.meta.dirname, '../../vite.config.ts')` explicitly. This works locally by accident (Vite walks up the directory tree) but fails in Docker.

### Database

**Tables don't auto-create with Drizzle.** Drizzle ORM defines schema in TypeScript but doesn't auto-create SQLite tables. For a mockup, raw `CREATE TABLE IF NOT EXISTS` SQL in `db/index.ts` is simpler than running `drizzle-kit push` at startup. The seed function tries to query tables immediately, so creation must happen before the seed call.

### Docker

**Docker is required for browser_subagent.** The browser QA tool uses Playwright in Docker. If Docker Desktop is not running, `open_browser_url` fails with `ERR_CONNECTION_REFUSED`. Always start Docker before browser QA.

**Docker dev server: same Dockerfile pattern as LakeStevens.** `FROM node:22-slim`, `npm ci`, `EXPOSE 3000`, `CMD npm run dev`. Single port for Express + Vite dev middleware.

### Process

**`npm run dev | head -30` blocks.** Piping the dev server through `head` causes the shell to wait for the pipe to close, which never happens since the server keeps running. Use `run_command` with background (`WaitMsBeforeAsync: 10000`) instead, then check logs separately.

**Always delete stale DB before restart.** `rm -f data/staff-sync.db` before `npm run dev` ensures clean seed data. Otherwise the seed check (`if users > 0, skip`) keeps old potentially-mismatched data.

---

## Session 2 — Design Principles + Full Audit (2026-03-02)

### Shared Component State (ViewToggle Bug)

**Never use internal state in a reusable component when the parent also needs that state.** The `ViewToggle` component originally used its own `useViewMode()` hook internally AND the parent page called `useViewMode()` separately — creating two independent React state instances. They shared the same localStorage key, so the toggle button *looked* correct, but the parent's rendering logic never re-rendered.

**Fix:** Reusable UI components that affect parent rendering MUST use controlled props (`mode`/`onModeChange`). Parent owns state via the hook, passes it down. This is standard React controlled component pattern — enforce it on all shared components.

**Pipeline impact:** Added as guidance in dispatch prompts: "ViewToggle accepts `mode` and `onModeChange` props — parent drives state via `useViewMode()` hook."

### Design Principles Before Code

**Codify design principles BEFORE building pages, not after.** Session 1 built all 5 pages without D1/D2/D3 rules → required a full audit + 15 fixes across 8 files. Session 2 added D1-D3 first → all future dispatches will enforce them automatically because they're in CLAUDE.md/codex-instructions.md.

**Pattern:** PRD defines WHAT → Design Principles define HOW → THEN dispatch page work.

### Shared Infrastructure Gating Works

**Creating shared files (badge-styles.ts, ViewToggle.tsx, types.ts additions) BEFORE dispatching page edits to Claude** prevented merge conflicts, ensured all pages import from one source, and eliminated badge color inconsistencies. This validates Gating Rule #1.

### Claude Dispatch: Explicit Rendering Instructions

**Claude workers add components but may not wire conditional rendering.** Two workers correctly imported ViewToggle and added `useViewMode` state, but didn't always connect the state to `{viewMode === "card" ? <CardLayout> : <ListLayout>}` branches. 

**Fix:** When dispatching view-mode work, explicitly state: "When card mode: render `<div className='grid grid-cols-3'>` with `<Card>` per item. When list mode: render existing layout. Use `viewMode === 'card' ? (...) : (...)` ternary."

---

## Session 3 — Documentation Package (2026-03-02)

### Agent CLI Timeouts

**Both Claude Code and Codex CLI timed out (15+ min, zero output) during documentation dispatch.** Attempted two rounds of parallel dispatches — neither produced any files. Possible causes: supermemory/GPT extension conflicts, CLI auth session expiration, or prompt complexity for doc-only tasks.

**First dispatch failed to shell escaping.** Using double-quoted prompts with markdown image syntax (`![alt](path)`) caused zsh `event not found` error — zsh interprets `!` as history expansion inside double quotes. **Fix:** Always use single-quoted prompts for Claude/Codex CLI dispatch to avoid zsh special character expansion (`!`, `$`, backticks).

**Fallback: orchestrator writes docs directly.** When agents are unavailable, documentation-only work (markdown files, no code changes) is within orchestrator scope — these are not implementation code files. All 5 docs (1,158 lines) were written and committed in ~10 minutes vs 15+ minutes of failed agent waiting.

### Documentation Workflow

**Darwin doc package = 5 files.** Per `agents/darwin-standards.md` §5 and the documentation KI:
1. `docs/DATA_MODEL.md` — schema reference + ER diagram + PII classification
2. `docs/MVP_PRD.md` — Run 1 scope with screenshots
3. `docs/VISION_PRD.md` — Run 2 scope with roadmap
4. `docs/WALKTHROUGH.md` — developer guide + QA evidence
5. `README.md` (root) — GitHub landing page

**Write foundational docs first.** DATA_MODEL.md should be written before PRDs since both reference it. MVP_PRD before VISION_PRD since Vision references MVP scope.

**Screenshots use relative paths for GitHub rendering.** All image embeds must use `screenshots/mvp-dashboard.png` (relative to `docs/`), not absolute paths, so they render correctly on GitHub.
