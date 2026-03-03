# Session Log

> Append-only. Update after every phase completion.

---

## Session 1 — MVP Mockup Build (2026-03-02)

**What was built:**
- Full-stack MVP mockup: 48 files, 12,247 lines
- 5 pages: Dashboard, Processes, ProcessDetail, EISForm, Readiness
- 18 shadcn/ui components + design system (oklch from TaskLine)
- Server: Express + tRPC + Drizzle + SQLite (8 tables, 14 employees seeded)
- Docker: Dockerfile + docker-compose.yml for dev workflow
- Pipeline: AGENTS.md (9 pitfalls), CLAUDE.md, codex-instructions.md, 3 workflows, memory bank
- Pushed 2 commits to `dcharb-darwin/staff-sync` main

**Decisions made:**
- Simplified memory bank (2 files vs LakeStevens's 7)
- Combined Express + Vite middleware on single port 3000 (vs LakeStevens dual port)
- Raw CREATE TABLE SQL instead of drizzle-kit push (simpler for mockup)
- Claude Code direct invocation (no screen+tee — doesn't capture output)
- Max 5 files per Claude dispatch (one-shot 20+ file prompt failed silently)
- Docker-first dev workflow matching LakeStevens/TaskLine pattern

**Issues encountered & resolved:**
1. Claude screen+tee empty logs → switched to direct invocation
2. Vite alias `@/` not matching → removed trailing slash
3. `no such table: users` → added CREATE TABLE IF NOT EXISTS SQL
4. Docker Vite configFile → added explicit configFile path
5. Docker Desktop not running → documented as P8 pitfall
