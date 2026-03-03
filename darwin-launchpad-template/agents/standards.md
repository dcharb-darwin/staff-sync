# Project-Specific Standards

> Project: {PROJECT_NAME}
> Extends: `darwin-standards.md` (cross-project bible)

---

## Universal Pitfalls (inherited from Darwin stack)

These pitfalls apply to ALL Darwin projects using the standard tech stack.

- **P1: Always `await` Drizzle operations.** Drizzle v0.45+ returns Promises even for synchronous SQLite. Destructuring without await causes `TypeError: object is not iterable`. Source: LakeStevens Session 2.
- **P2: Light theme default.** Always `defaultTheme="light"`. Never use `"system"` — caused dark-mode lock-in on TaskLine requiring full audit + revert. Source: TaskLine Session.
- **P3: Navigation structure locked early.** Define nav links in Phase 0 and lock them. Mid-build navigation redesign broke TaskLine routing, required full git revert. Source: TaskLine Session.
- **P4: Badge/tag contrast — use the 50/900 rule.** Tailwind v4 oklch `*-100/*-700` produces tint-on-tint with insufficient contrast. Use `bg-*-50 text-*-900 border-*-200`. Source: TaskLine.
- **P5: No PII ever.** No SSN, home address, DOB, bank/payroll info, compensation, benefits, emergency contacts. No mechanism to ingest. No fields, columns, or ingestion paths. Source: Darwin-wide policy.
- **P6: Worker file conflicts.** When dispatching multiple agents in parallel, assign non-overlapping file targets. Workers share the filesystem — concurrent writes to the same file cause data loss. Source: LakeStevens.
- **P7: Vite `configFile` in Docker.** When creating Vite programmatically in `server/_core/index.ts`, pass explicit `configFile: path.resolve(import.meta.dirname, '../../vite.config.ts')`. Vite walks up the directory tree locally but fails in Docker containers. Source: Staff Sync.
- **P8: Docker required for `browser_subagent` QA.** The browser QA tool uses Playwright in Docker. If Docker Desktop is not running, `open_browser_url` fails with `ERR_CONNECTION_REFUSED`. Always start Docker before browser QA. Source: Staff Sync.
- **P9: Vite alias — no trailing slash.** Use `"@"` not `"@/"` as the alias key. `"@/"` does not match imports like `@/lib/trpc`. Source: Staff Sync.
- **P10: Controlled props on shared components.** Never use internal state in a reusable component when the parent also needs that state. `ViewToggle` must accept `mode`/`onModeChange` props — parent drives state via `useViewMode()` hook. Source: Staff Sync.

## Project-Specific Pitfalls (P11+)

<!-- Add domain-specific pitfalls as they are discovered during development -->

- **P11:** <!-- Add as discovered -->
- **P12:** <!-- Add as discovered -->

---

## Design Principles

Universal design principles across all Darwin applications:

- **D1: Universal Drill-Down.** Every data item is clickable to a detail view with source provenance. If the source is mock data, label it honestly (see §7 Pattern B in darwin-standards.md).
- **D2: Card ↔ List Toggle.** Shared `ViewToggle` component on all list/grid views. Parent owns state via `useViewMode()` hook, passes `mode` and `onModeChange` as controlled props.
- **D3: Visual Parity.** All Darwin apps must be visually indistinguishable from the TaskLine standard. Same typography, spacing, card styles, badge colors, and layout patterns.

## Project-Specific Design Principles (D4+)

<!-- Add domain-specific design principles as they emerge -->

- **D4:** TODO
