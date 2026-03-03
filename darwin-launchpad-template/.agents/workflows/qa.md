---
description: Spin up the dev server in Docker for real-time QA and browser testing
---

## Live QA Workflow (Docker)

// turbo-all

### Start Dev Server (Docker)
1. Build and start the container:
```bash
docker compose up --build -d
```

2. Verify the container started:
```bash
docker compose logs --tail 5
```
Look for: `{PROJECT_NAME} server running on http://localhost:${PORT}`

If you see errors, check `docker compose logs` for details and fix before proceeding.

The app will be available at **http://localhost:${PORT}** (default 3000).

### Browser QA
3. Use the `browser_subagent` tool to open http://localhost:${PORT} and verify. Each check is mandatory.

#### Core Checks (universal — every project)

**Pre-Flight**
- App loads without Vite error overlay
- Theme is LIGHT mode (white/slate background, not dark) — **P2 check**
- No PII visible (no SSN, home address, DOB, compensation) — **P5 check**

**Navigation (cross-cutting) — P3 check**
- All nav links navigate correctly
- Active route is visually highlighted in nav bar
- No broken links or 404 errors
- Browser back/forward works

**Design Consistency — D3 check**
- Matches TaskLine: slate-50 gradient bg, white cards, blue-600 accent, shadow-sm
- Typography is consistent (Inter/system font, proper heading hierarchy)
- All badges/tags are readable (good contrast) — **P4 check**
- Spacing and padding match TaskLine patterns

#### Project-Specific Checks

<!-- TODO: Add domain-specific QA checks for each page below -->
<!-- Example:
**Dashboard**
- KPI cards render with mock data
- Active item list shows entries with type badges
- All data items are clickable (D1)

**Detail Page**
- Task/item checklist renders with owners and status
- Validation results show pass/warning/fail with correct colors
-->

### Stop Dev Server
4. When done:
```bash
docker compose down
```

### Automated Verification (local, not Docker)
5. Run the full verification gate locally:
```bash
npm run verify
```
This runs TypeScript check + production build without Docker.
