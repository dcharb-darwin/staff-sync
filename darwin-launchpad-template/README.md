# {PROJECT_NAME}

**{Brief description}**

> Built with the [Darwin Launchpad Template](https://github.com/dcharb-darwin) · Status: Phase 0

---

## How to Use This Template

1. Copy this folder to a new project directory
2. Find and replace all `{PROJECT_NAME}` and `{project-name}` placeholders
3. Run setup:
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```
4. Start developing:
   ```bash
   npm run dev
   ```
5. Follow the Launchpad checklist: `.agents/workflows/launchpad.md`

---

## Quick Start

### Docker (recommended for QA)

```bash
docker compose up --build -d
open http://localhost:3000
```

### Local Development

```bash
npm install
npm run dev
open http://localhost:3000
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 · Vite 7 · TailwindCSS v4 · shadcn/ui · wouter |
| Backend | Express · tRPC · Drizzle ORM · SQLite |
| Design | oklch tokens · InterVariable font · blue-600 accent |
| Infrastructure | Docker · Node.js 22 LTS |

---

## Project Structure

```
├── AGENTS.md                  ← Orchestrator guardrails
├── CLAUDE.md                  ← Claude Code worker context
├── codex-instructions.md      ← Codex CLI worker context
├── PRD.MD                     ← Business requirements
├── agents/                    ← Standards + session memory
├── .agents/workflows/         ← Launchpad, dispatch, QA workflows
├── server/                    ← Express + tRPC + Drizzle
├── client/                    ← React + Vite + Tailwind
├── shared/                    ← Shared TypeScript types
└── docs/                      ← Documentation + screenshots
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Launchpad Checklist](.agents/workflows/launchpad.md) | Phase 0/1/2 project checklist |
| [Dispatch Workflow](.agents/workflows/dispatch.md) | Agent dispatch patterns |
| [QA Workflow](.agents/workflows/qa.md) | Docker + browser QA |
| [Darwin Standards](agents/darwin-standards.md) | Cross-project bible |

---

## License

Proprietary — Darwin Customer Solutions © 2026
