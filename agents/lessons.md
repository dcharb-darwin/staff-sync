# Lessons Learned

> Accumulated learnings across agent sessions. Append-only — never delete entries.

---

## Pre-Session — Imported from TaskLine + LakeStevens (2026-03-02)

### Drizzle ORM (from LakeStevens Session 2)
- Drizzle v0.45+ returns Promises even for synchronous SQLite — **always use `await`** on `.insert().returning()`, `.select()`, `.update()`, `.delete()`, `.run()`
- Destructuring without await causes `TypeError: object is not iterable`
- Must ensure `data/` directory exists before opening SQLite DB

### Orchestration (from LakeStevens Session 2)
- **Antigravity = orchestrator, Claude Code + Codex = workers**
- Direct `run_command` backgrounding (`&`) causes SIGINT (exit 130) — processes get killed
- **Working pattern:** `screen -dmS <name> bash -c '...'` for process isolation
- Claude Code flags: `-p "prompt" --dangerously-skip-permissions` for autonomous file writes
- Codex flags: `--full-auto "prompt"` — requires TTY, use `script -q` inside screen
- Workers share filesystem — coordinate to avoid write conflicts (assign non-overlapping files)

### Design (from TaskLine + LakeStevens)
- Light-mode-first: slate-50 bg, white cards, blue-600 accent, Inter font, shadow-sm
- `defaultTheme="light"` — never `"system"` (caused dark-mode lock-in on TaskLine requiring full audit)
- oklch token pairs for badge/tag contrast — low contrast caused readability failures on TaskLine
- Navigation structure should be locked early — redesign mid-build broke TaskLine, required full revert

### Memory Bank (from LakeStevens)
- 7-file memory bank went stale mid-session (`current-state.md` stuck at Module 1 while Modules 2-3 were built)
- Phase-based updates work better than timer-based anti-drift
- Simplified to 2 files: sessions.md + lessons.md
