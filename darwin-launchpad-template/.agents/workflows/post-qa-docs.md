---
description: Update all project docs after successful QA of a feature
---

# Post-QA Documentation Update

After every successful QA session, update these docs to reflect the new feature.

// turbo-all

## Checklist

1. **PRD** (`PRD.MD`) — Update relevant sections: data models, process flows, user stories, integration details.

2. **CLAUDE.md** — Update architecture map if new files/routers were added.

3. **codex-instructions.md** — Keep synced with CLAUDE.md.

4. **README** (`README.md`) — Update Features list if the feature is user-visible.

5. **Walkthrough** (`docs/WALKTHROUGH.md`) — Add new screenshots and QA evidence.

## After Updates

```bash
git add PRD.MD CLAUDE.md codex-instructions.md README.md docs/
git commit -m "docs: update all docs for [feature name]"
```
