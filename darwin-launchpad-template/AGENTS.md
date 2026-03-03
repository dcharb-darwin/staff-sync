# AGENTS.md — Orchestrator Guardrails

> Identity: **dcharb-darwin**
> Remote format: `dcharb-darwin/{project-name}.git`

---

## Dispatch Rules

| Agent | Invocation | Use When |
|-------|-----------|----------|
| Claude Code | `claude -p '{prompt}'` | UI work, tRPC routers, schema changes, component authoring |
| Codex | `CODEX_SKIP_MEMORY_GATE=1 /opt/homebrew/bin/codex exec '{prompt}'` | Docs, refactors, mechanical edits, code review |

> **Single-quote** all prompts passed to `claude -p`.
> **Always** set `CODEX_SKIP_MEMORY_GATE=1` and use the full path for Codex.

---

## Gating Rules

1. **Shared infra before components** — Do not edit any page or component until `server/db/schema.ts`, `server/routers.ts`, and `shared/types.ts` are stable.
2. **PRD before code** — No feature work until `PRD.MD` is updated with the relevant user story or section.
3. **No data-specific logic** — Workers must not hardcode data values, department names, or business rules. All domain data comes from seed or config.
4. **Cross-cutting QA after UI changes** — After any UI change, verify: badge contrast (P4), theme compliance (P2), nav stability (P3), drill-down links (D1).

---

## Anti-Reversion Rule

> If a task requires editing **3 or more files** directly, **STOP** and dispatch to a worker agent instead.

The orchestrator coordinates — it does not bulk-edit. Dispatching ensures atomic changes with proper context.

---

## Standards References

All agents **must** read before any work:

1. `agents/darwin-standards.md` — Cross-project stack, design, architecture
2. `agents/standards.md` — Project pitfalls P1–P10, design principles D1–D3

---

## Consensus Methodology

**Council of Agents** — used for architectural decisions, PRD updates, and cross-cutting changes.

1. **Orchestrator drafts** the proposal (plan, schema change, or design decision).
2. **Worker agents review** — each provides approval, objections, or alternatives.
3. **Up to 5 rounds** of revision until consensus is reached.
4. If no consensus after 5 rounds, orchestrator makes the final call and documents the dissent in `agents/lessons.md`.
5. All decisions are logged with rationale.
