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
Look for: `Staff Sync server running on http://localhost:3000`

If you see errors, check `docker compose logs` for details and fix before proceeding.

The app will be available at **http://localhost:3000**.

### Browser QA
3. Use the `browser_subagent` tool to open http://localhost:3000 and verify. Each check is mandatory.

**Pre-Flight (every QA session)**
- App loads without Vite error overlay
- Theme is LIGHT mode (white/slate background, not dark) — **P2 check**
- No PII visible (no SSN, home address, DOB, compensation) — **P5 check**

**Dashboard**
- KPI cards render with mock data (Active Processes, Pending Tasks, Readiness)
- Active process list shows employee names with type badges
- Readiness alerts section shows employees with validation issues
- All badges/tags are readable (good contrast) — **P4 check**

**Processes**
- Process list loads with filter controls (type, status)
- Filters update the list correctly
- Click on a process row navigates to ProcessDetail

**Process Detail**
- Header shows employee name, process type badge, status, start date
- Task checklist renders ordered tasks with owner, status, timestamps
- EIS/BOIS form section shows form status (if applicable)
- Validation results show pass/warning/fail indicators with correct colors

**EIS/BOIS Form**
- Section 1 fields render (name, badge #, employee ID, job title, department, start date, type)
- Section 2 fields render (profile to copy, laptop, peripherals, map drives, instructions)
- Form is interactive — fields can be filled

**Day-One Readiness**
- Employees with upcoming start dates displayed
- Validation results with pass (green) / warning (amber) / fail (red) indicators
- Summary: Ready / Needs Attention / Not Ready counts

**Navigation (cross-cutting) — P3 check**
- All nav links (Dashboard, Processes, Readiness) navigate correctly
- Active route is visually highlighted in nav bar
- No broken links or 404 errors
- Browser back/forward works

**Design Consistency**
- Matches TaskLine: slate-50 gradient bg, white cards, blue-600 accent, shadow-sm
- Typography is consistent (Inter/system font, proper heading hierarchy)
- Spacing and padding match TaskLine patterns

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
