# Guidely Tour Improvements — Backlog

Discovered during QA on 2026-03-05. These are not yet scheduled for a sprint.

---

## Bug Fix (Done): X Button Closes Tour

**Status:** ✅ Fixed 2026-03-05

**Root cause:** Driver.js 1.x treats `onDestroyStarted` as an interception hook — if you provide the callback, you must call `driver.destroy()` yourself to complete the close. The production embed script provided the callback but never called destroy, so clicking X cleaned up the auto-advance listener but left the tour open.

**Fix:** Added `driverRef.destroy()` at the end of `onDestroyStarted` in `app/embed.js/route.ts`.

---

## Backlog Item 1: Resume Tour at Saved Step

**Problem:** If a user closes a tour mid-way (e.g., step 3 of 6), the next time they log in the tour either doesn't reappear (dismissed state) or restarts from step 1. There's no "resume where you left off" behavior.

**Proposed behavior:**

| User Action | State Saved | Next Visit |
|-------------|-------------|------------|
| Clicks X mid-tour | `in_progress`, `currentStep: N` | Resumes at step N |
| Clicks Done on last step | `completed` | Tour not shown again |
| Clicks "Don't show again" (future) | `dismissed` | Never shown again |

**Changes needed in `app/embed.js/route.ts`:**
1. `onDestroyed` — when not completed, save `in_progress` + `currentStep` instead of `dismissed: true`
2. `shouldShowTour()` — allow `in_progress` tours to show again (currently only blocks `completed` and `dismissed`)
3. `runProductionTour()` startup — check for existing `in_progress` state and call `driverInstance.drive(state.currentStep)` instead of `drive()`

---

## Backlog Item 2: Step Completion Verification

**Problem:** There's no way to know if a user actually completed the action described in a tour step (e.g., "Connect Google") vs. just clicking Next. Progress is entirely self-reported.

**Options (ranked by feasibility):**

### Option A: DOM Completion Selector ⭐ Recommended
Add an optional CSS selector field per step. Before enabling Next, the embed engine checks the page DOM for that selector — which should only exist after the action is done.

- Example: `".google-integration-status.connected"`
- If selector not found: dim the Next button + show nudge text like "Looks like this isn't done yet — still want to skip?"
- User can still advance (soft gate), but gets the reminder
- Uses existing element-targeting logic already in `lib/tour-engine/targeting.ts`

**Changes needed:**
- Tour step editor: add "Completion Check" field (selector + mode + fallback text)
- DB: step config JSONB already supports arbitrary fields, no schema change needed
- `app/embed.js/route.ts`: check selector in `onNextClick` before advancing

### Option B: URL Change Detection
If completing the action causes a page navigation or query param change, detect it and auto-advance. Less reliable, brittle for SPAs like GHL.

### Option C: Periodic DOM Polling
After showing a step, poll for a success selector every 2 seconds and auto-advance when it appears. Good for async actions where you don't want a manual Next click at all.

**Changes needed:** Same as Option A for config; add polling loop in `onHighlightStarted`.

### Option D: GHL Webhook Integration
GHL fires a webhook when an integration event occurs → your backend records it → embed script checks backend on next page load. Accurate but complex; requires per-sub-account GHL API access.

**Changes needed:** New webhook endpoint, new DB table, polling or SSE from embed script.

---

## Notes

- Option A (DOM selector) is the right first step — low effort, high signal, matches how Appcues and Intercom Product Tours handle this
- Option D is the "right" answer long-term for integrations like Google/Stripe connect, but requires GHL OAuth scope
- Backlog Item 1 (resume at step) is a quick win and pairs naturally with the X button fix
