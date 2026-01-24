# Session: Tour System Issues & Backlog

**Date:** 2026-01-24
**Status:** Multiple issues in progress

---

## CRITICAL ISSUES (Blocking)

### 1. Done Button Not Working
- **Status:** ❌ Not fixed
- **Symptom:** Done button shows on step 4/4, but clicking does nothing
- **Root Cause:** Driver.js 'next' button on last step doesn't auto-destroy. Need explicit `onNextClick` handler to call `destroy()` on last step.
- **Fix Needed:** Add `onNextClick` callback that checks if on last step and calls `driverInstance.destroy()`

### 2. Analytics Not Recording
- **Status:** ❌ Not fixed
- **Symptom:** Tours page shows "0 views, 0% completion" despite running tours
- **Note:** Console no longer shows 405 error (proxy.ts fix may have worked), but data still not appearing
- **Possible Issues:**
  - Supabase RPC function `increment_tour_stat` may not exist
  - Analytics table may not exist
  - Data may be logging to console but not persisted
- **Fix Needed:** Verify Supabase schema has required tables/functions

### 3. Can't Interact During Tour
- **Status:** ❌ Not implemented
- **Symptom:** User can't click on highlighted elements or interact with page
- **Root Cause:** Need `allowInteraction: true` per step for actionable steps
- **Fix Needed:** Add `allowInteraction` support in embed.js based on step config

---

## COMPLETED FIXES

| Fix | File | Status |
|-----|------|--------|
| Driver.js IIFE access path | embed.js | ✅ `window.driver.js.driver()` |
| Skip tour when builder toolbar present | embed.js | ✅ Checks for `#at-builder-toolbar` |
| proxy.ts warning in CLAUDE.md | CLAUDE.md | ✅ Added |
| Analytics route public | proxy.ts | ✅ Added `/api/tours/analytics` |
| Customer RLS error | customer-actions.ts | ✅ Use `createAdminClient` |
| doneBtnText at driver level | embed.js | ✅ Moved from step to driver config |
| CORS headers for analytics | next.config.ts | ✅ Added |

---

## BACKLOG ITEMS

### P1 - High Priority
1. **Dashboard tour count shows 0** - Query issue, not counting tours properly
2. **Button positions in tour builder** - Primary/Secondary reversed from actual tour
3. **Button action dropdown** - "Complete tour", "Dismiss tour" actions not wired up

### P2 - Medium Priority
4. **Checklist feature** (Feature 26/27) - Floating checklist widget
5. **Tour minimize/restore** - Shrink to tab during user actions
6. **Photo upload to our system** - Customer uploads to Vercel Blob

### P3 - Future
7. **Auto-detect step completion** - Watch for DOM changes, OAuth returns
8. **Tour analytics dashboard** - Per-step completion rates for agency owners
9. **FAQ/Help section** - Persistent help in checklist after tour

---

## DECISIONS MADE

1. **CORS:** Accept from agency's GHL domain (currently `*` for simplicity)
2. **Checklist:** Build from scratch, shrinks to Manila tab after tour
3. **Photo uploads:** Agency owner can choose: upload to our system OR GHL
4. **Button positions:** Should swap in UI to match tour orientation (pending)
5. **proxy.ts:** NEVER rename or delete - documented in CLAUDE.md

---

## NEXT SESSION PROMPT

```
Continue working on Agency Toolkit tour system. Priority issues:

1. DONE BUTTON: Add onNextClick handler in embed.js that calls
   driver.destroy() when on last step. Current code at ~line 2800.

2. ANALYTICS: Check if increment_tour_stat RPC function exists in
   Supabase. Check tour_analytics table. Console log shows tour
   events but dashboard shows 0 views.

3. ALLOW INTERACTION: Add allowInteraction:true support for steps
   so users can click highlighted elements during tour.

Read: docs/sessions/2026-01-24-tour-issues-backlog.md for full context.
```

---

## FILES MODIFIED THIS SESSION

- `app/embed.js/route.ts` - Multiple Driver.js fixes
- `proxy.ts` - Added analytics to public routes
- `next.config.ts` - CORS headers for analytics
- `CLAUDE.md` - proxy.ts warning added
- `app/(dashboard)/customers/_actions/customer-actions.ts` - RLS fix
- `docs/sessions/2026-01-24-tour-enhancements.md` - Earlier session doc
- `docs/sessions/2026-01-24-driver-js-bug.md` - Driver.js loading fix
