---
description: Launchpad checklist for new Darwin dashboard projects — Phase 0 foundation, Phase 1 MVP, Phase 2 Vision
---

# Darwin Launchpad Checklist

> Use this when starting a new Darwin project or verifying an existing one.
> Phase 0 + Phase 1 = Run 1 (MVP). Phase 2 = Run 2 (Vision).

## Phase 0 — Foundation

- [ ] Create repo (dcharb-darwin org)
- [ ] Standard folder structure (see agents/darwin-standards.md §4)
- [ ] package.json with pinned stack (~major.minor.0)
- [ ] AGENTS.md, CLAUDE.md (thin pointer), codex-instructions.md
- [ ] agents/darwin-standards.md (copy from template project)
- [ ] agents/standards.md (project-specific pitfalls + design principles)
- [ ] .agents/workflows/ (dispatch.md, qa.md, post-qa-docs.md, launchpad.md)
- [ ] Dockerfile + docker-compose.yml (node:22-slim, port 3000)
- [ ] Vite + TailwindCSS v4 + shadcn/ui configured
- [ ] Express + tRPC + Drizzle + SQLite wired
- [ ] ViewModeContext (MVP/Vision toggle, default: mvp)
- [ ] ThemeProvider (defaultTheme="light")
- [ ] AppLayout with sticky header + nav links
- [ ] Nav structure defined and LOCKED (P3)
- [ ] PRD.MD with MVP scope + data model
- [ ] **Gate:** `npm run check` passes, `npm run dev` serves blank shell

## Phase 1 — MVP (completes Run 1)

- [ ] Drizzle schema + seed data (NO PII — P5)
- [ ] tRPC routers for core entities
- [ ] Core pages (Dashboard + 2-3 detail pages)
- [ ] AdminSettings page — read-only, `<Badge>MVP</Badge>` indicator
- [ ] D1: All data items clickable with drill-down
- [ ] D2: ViewToggle on all card-based views
- [ ] D3: Visual parity spot-check vs TaskLine (3 screenshots)
- [ ] Docker build + browser QA (`browser_subagent`)
- [ ] PRD.MD updated with MVP screenshots
- [ ] Walkthrough with QA evidence (screenshots + recordings)
- [ ] **Gate:** Full QA passes, all audit items green
- [ ] Commit + push

## Phase 2 — Vision (= Run 2)

- [ ] Full PRD with all features documented
- [ ] Extended schema + integration endpoints
- [ ] AdminSettings fully functional (editable, mutations)
- [ ] All Vision-only routes and sections enabled
- [ ] Integration points wired (or simulated with adapters)
- [ ] Updated walkthrough with Vision screenshots
- [ ] **Gate:** Final QA sweep, all pages verified
- [ ] Commit + push
