---
name: endsession
description: End the session — run quality checks, update SESSION_LOG.md, and commit
user_invocable: true
---

# End Session

Run the end-of-session checklist from `.claude-rules.md`. Do each step in order — do not skip any.

## Step 1: Quality Checks

Run lint and build using pnpm (not npm):

```bash
pnpm lint
pnpm build
```

If either fails, fix the issues and re-run until both pass. Do not proceed until they pass.

## Step 2: Update SESSION_LOG.md

Read `SESSION_LOG.md`, then prepend a new entry at the top (below the header and `<!-- New entries go below this line. Most recent first. -->` comment) using this format:

```markdown
## [TODAY'S DATE] — [SHORT TITLE OF WORK DONE]

### What I did
- (list completed tasks — be specific about what changed)

### What's next
- (immediate next steps for this project)

### Blockers
- (anything preventing progress, or "None")

### Cross-project notes
- (anything that affects other projects: shared component changes, pattern decisions, etc. Or "None")
```

Base the content on what was actually done in this conversation. Review the conversation history to write an accurate summary.

## Step 3: Commit

Stage all changes (including the session log update) and commit. Follow the project's commit workflow:

1. Run `git status` and show the user all modified/untracked files
2. Ask the user which files to include and get approval before committing
3. Commit with an appropriate message
4. Do NOT push unless the user explicitly asks
