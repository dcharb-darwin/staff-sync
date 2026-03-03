# Standards — Pitfalls & Design Principles

> Single source of truth. All workers read this file before coding.
> AGENTS.md, CLAUDE.md, and codex-instructions.md point here.

---

## Pitfalls (P1–P10)

### P1: Drizzle `await` Required
Drizzle v0.45+ returns Promises even for SQLite. **Always `await`** on `.insert().returning()`, `.select()`, `.update()`, `.delete()`, `.run()`. Missing `await` → `TypeError: object is not iterable`.

### P2: Theme Must Default to Light
Always set `defaultTheme="light"`. Never `"system"` — caused dark-mode lock-in on TaskLine requiring full audit.

### P3: Navigation Structure is Locked
Nav redesign mid-build broke TaskLine → full git revert. Define nav in Phase 0, then only add pages.

### P4: Badge/Tag Contrast
Use oklch token pairs (`--foreground` on `--background` variants). Low contrast caused readability failures in TaskLine.

### P5: No Sensitive PII
Never store or display SSN, home address, DOB, bank info, compensation, or benefits data (PRD §3.2).

### P6: Worker File Conflicts
Claude Code and Codex share the filesystem. Never dispatch two workers to the same file.

### P7: Vite configFile in Docker
When creating Vite programmatically in `server/_core/index.ts`, always pass `configFile: path.resolve(import.meta.dirname, '../../vite.config.ts')`. Without it, Vite looks for config inside `client/` — works locally but fails in Docker.

### P8: Docker Required for Browser QA
`browser_subagent` uses Playwright in Docker. If Docker Desktop is not running, `open_browser_url` fails with `ERR_CONNECTION_REFUSED`.

### P9: Vite Alias Keys — No Trailing Slash
Use `"@"` not `"@/"` as Vite alias keys. Trailing slashes don't match imports like `@/lib/trpc`.

### P10: Shared Components Must Use Controlled Props
Never use internal state in a reusable component when the parent also needs that state. Always pass `mode`/`onModeChange` from the parent (standard controlled component pattern).

---

## Design Principles (D1–D3)

### D1: Universal Drill-Down + Source Provenance
Every data item displayed in the UI **must be clickable** and navigate to its detail view. Every detail view must show **where the data came from**.

- KPI card → drill into the list composing that number
- Employee name → process detail
- Validation check → show source system (AD, Infor, form)
- Form fields → reference SOP section

**Pattern:** Use `<Link>` from wouter on all identifiers, badges, and counts.

### D2: Card ↔ List Toggle
Wherever data is displayed as cards, provide a **toggle to switch between card and list view**. Use the shared `ViewToggle` component (`mode`/`onModeChange` props). Store preference in localStorage.

### D3: Visual Parity Across Darwin Projects
Staff Sync must match TaskLine and Invoice Processing:
- oklch tokens (blue-600 accent, slate-50 bg, white cards, shadow-sm)
- shadcn/ui components (Card, Badge, Button)
- InterVariable / system-ui font stack
- Sticky header, blue-50 active nav highlight

> If a component looks different from the same component in TaskLine, it's wrong.
