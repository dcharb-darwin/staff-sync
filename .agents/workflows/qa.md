---
description: Spin up the dev server for real-time QA and browser testing
---

## Live QA Workflow

// turbo-all

### Start Dev Server
1. Run the dev server:
```bash
npm run dev
```
The app will be available at **http://localhost:3000**.

### Browser QA
2. Use the `browser_subagent` tool to open http://localhost:3000 and verify the following. Each check is mandatory.

**Pre-Flight (every QA session)**
- App loads without console errors
- Theme is LIGHT mode (white/slate background, not dark) — **P2 check**
- No PII visible (no SSN, home address, DOB, compensation) — **P5 check**

**Dashboard**
- KPI cards render with mock data (Active Processes, Pending Tasks, Readiness)
- Active process list shows employee names with type badges
- Readiness alerts section shows employees with validation issues
- All badges/tags are readable (good contrast) — **P4 check**

**Processes**
- Process list loads with filter controls (type, status, date)
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
- Form is interactive — fields can be filled and saved

**Day-One Readiness**
- Employees with upcoming start dates displayed
- Validation results with pass (green) / warning (amber) / fail (red) indicators
- Run readiness check button triggers mock validation
- Per-class summary shows Ready / Needs Attention / Not Ready counts

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
3. When done, stop the server with Ctrl+C or by terminating the command.

### Automated Verification
4. Run the full verification gate:
```bash
npm run verify
```
This runs TypeScript check + production build.
