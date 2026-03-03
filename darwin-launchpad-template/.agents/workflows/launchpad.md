---
description: Launchpad checklist for new Darwin dashboard projects — Phase 0 foundation, Phase 1 MVP, Phase 2 Vision
---

# Darwin Launchpad Checklist

> Use this when starting a new Darwin project or verifying an existing one.
> Phase 0 + Phase 1 = Run 1 (MVP). Phase 2 = Run 2 (Vision).

## Phase 0 — Foundation

- [ ] Create repo (`dcharb-darwin/{project-name}`)
- [ ] Standard folder structure (see `agents/darwin-standards.md` §4)
- [ ] `package.json` with pinned stack (`~major.minor.0`)
- [ ] `AGENTS.md`, `CLAUDE.md` (thin pointer), `codex-instructions.md`
- [ ] `agents/darwin-standards.md` (copy from template)
- [ ] `agents/standards.md` (project-specific pitfalls + design principles)
- [ ] `.agents/workflows/` (dispatch.md, qa.md, post-qa-docs.md, launchpad.md)
- [ ] `Dockerfile` + `docker-compose.yml` (`node:22-slim`, port via `$PORT`)
- [ ] Vite + TailwindCSS v4 + shadcn/ui configured
- [ ] Express + tRPC + Drizzle + SQLite wired
- [ ] `ViewModeContext` (MVP/Vision toggle, default: mvp)
- [ ] `ThemeProvider` (`defaultTheme="light"`) — P2
- [ ] `AppLayout` with sticky header + nav links
- [ ] Nav structure defined and LOCKED — P3
- [ ] `PRD.MD` with MVP scope + data model
- [ ] `scripts/setup.sh` run (creates `data/`, installs deps)
- [ ] **Gate:** `npm run check` passes, `npm run dev` serves blank shell

## Phase 1 — MVP (completes Run 1)

- [ ] Drizzle schema + seed data (NO PII — P5, deterministic — §8)
- [ ] tRPC routers for core entities
- [ ] Core pages (Dashboard + 2–3 detail pages)
- [ ] AdminSettings page — read-only, `<Badge>MVP</Badge>` indicator
- [ ] D1: All data items clickable with drill-down
- [ ] D2: ViewToggle on all card-based views
- [ ] D3: Visual parity spot-check vs TaskLine (3 screenshots)
- [ ] Badge contrast check — P4 (50/900 rule)
- [ ] Docker build + browser QA (`/qa` workflow)
- [ ] Documentation: `docs/MVP_PRD.md`, `docs/DATA_MODEL.md`, `docs/WALKTHROUGH.md`, root `README.md`
- [ ] PRD.MD updated with MVP screenshots
- [ ] **Gate:** Full QA passes, all audit items green
- [ ] Commit + push to `dcharb-darwin/{project-name}`

## Phase 2 — Vision (= Run 2)

- [ ] `docs/VISION_PRD.md` with full feature set
- [ ] Extended schema + integration endpoints
- [ ] AdminSettings fully functional (editable, mutations)
- [ ] All Vision-only routes and sections enabled
- [ ] Integration points wired (or simulated with adapters)
- [ ] Notification engine (email templates, SMTP config)
- [ ] Updated walkthrough with Vision screenshots
- [ ] **Gate:** Final QA sweep, all pages verified
- [ ] Commit + push
