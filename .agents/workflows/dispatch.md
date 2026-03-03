---
description: How to dispatch focused tasks to Claude Code or Codex CLI agents
---

# Agent Dispatch Workflow

// turbo-all

## Pre-Dispatch Checklist

1. **Is this a pattern or a one-off?** Patterns update PRD first, one-offs dispatch directly.
2. **File scope defined?** Every dispatch must list explicit `FILES TO CREATE` or `FILES TO EDIT`. Never leave it open-ended.
3. **Non-overlapping targets?** If dispatching multiple agents in parallel, ensure no two agents touch the same file.
4. **Break large tasks.** Max 5 files or ~500 lines per dispatch. If larger, split into sequential tasks.

## Dispatch Pattern (Claude Code)

```bash
# Direct invocation (captures output, waits for completion)
claude -p "Read CLAUDE.md first.

SYSTEM CONTEXT: [How this relates to other components]
TASK: [Specific instructions]
FILES TO CREATE: [Explicit list]
FILES TO EDIT: [Explicit list]

ONLY create/edit the listed files. Nothing else." --dangerously-skip-permissions 2>&1 | tail -5
```

### ⚠️ DO NOT use screen + tee (empty logs — Claude uses interactive terminal mode)
### ⚠️ DO NOT one-shot 20+ files (fails silently, break into 3-5 file batches)

Run via `run_command` with `WaitMsBeforeAsync: 300000` and monitor with `command_status`.

## Dispatch Pattern (Codex CLI)

```bash
# Codex needs TTY — use script wrapper
script -q /dev/null codex --full-auto "Read codex-instructions.md first. TASK: ..."
```

## Parallel Dispatch

Two Claude instances can run in parallel if:
- File targets don't overlap
- Both use `run_command` with unique command IDs
- Monitor both with `command_status`

Example: Task 4 (Dashboard + Processes pages) and Task 5 (ProcessDetail + EISForm + Readiness pages) ran successfully in parallel.

## After Dispatch

1. Verify files were created: `find <dir> -type f -name "*.tsx" | sort`
2. Run TypeScript check: `npx tsc --noEmit`
3. If Docker running: `docker compose down && docker compose up --build -d`
4. Check Docker logs: `docker compose logs --tail 10`
