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

---

## Session 3 — Documentation Package (2026-03-02)

**What was built:**
- 5 documentation files: DATA_MODEL.md, MVP_PRD.md, VISION_PRD.md, WALKTHROUGH.md, README.md
- 1,158 lines of documentation across 13 files (5 docs + 8 screenshots tracked)
- Pushed commit `2473561` to `dcharb-darwin/staff-sync` main

**Decisions made:**
- Agent dispatch (Claude Code + Codex) attempted but both timed out → wrote docs directly as orchestrator
- Single-quoted prompts for CLI dispatch (zsh `!` escaping fix)
- Doc write order: DATA_MODEL → MVP_PRD → VISION_PRD → WALKTHROUGH → README
- All screenshot paths use relative format for GitHub rendering

**Issues encountered:**
1. Claude Code CLI: zsh `event not found` from `!` in double-quoted markdown — switched to single quotes
2. Both Claude Code and Codex CLI: 15+ min timeout with zero output — possible supermemory/GPT conflict
3. Codex `script -q /dev/null` wrapper returned no output — first dispatch returned empty
