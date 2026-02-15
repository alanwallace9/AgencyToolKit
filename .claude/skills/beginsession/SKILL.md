---
name: beginsession
description: Start a new session — review context, summarize last session, and plan focus
user_invocable: true
---

# Begin Session

Run the start-of-session workflow. Do each step in order.

## Step 1: Read Project Context

Read `CLAUDE.md` to load project rules, architecture, and conventions.

## Step 2: Read Last Session Log

Read `SESSION_LOG.md` and find the most recent entry (the first entry below the header).

## Step 3: Check Current State

Run `git status` to see if there are any uncommitted changes from a previous session.

## Step 4: Present Summary

Give the user a brief, scannable summary with these sections:

**Last Session** — What was accomplished (2-4 bullet points from the session log)

**What's Next** — Priority items listed in the session log's "What's next" section

**Blockers** — Any blockers noted, or "None"

**Repo State** — Note any uncommitted changes or if the working tree is clean

Keep it concise — no more than 15 lines total.

## Step 5: Ask the User

After the summary, ask:
1. How much time do you have today?
2. What do you want to focus on?
