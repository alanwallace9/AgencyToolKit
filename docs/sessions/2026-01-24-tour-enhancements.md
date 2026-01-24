# Session: Tour Enhancements & Checklist Feature

**Date:** 2026-01-24
**Status:** In Progress

---

## Decisions Made

### 1. Tour Interaction Behavior
- **Decision:** Keep tooltip in place during user actions, allow page interaction
- **Rationale:** Simpler implementation; user can complete action then click Next
- **Future:** Could add minimize/restore animation later if needed

### 2. Checklist Feature (Feature 26/27)
- **Decision:** Build from scratch as a new feature
- **UI Concept:** Floating widget (see reference image user provided)
  - Header with title + close button
  - Progress bar (e.g., "50%")
  - Checklist items with checkmarks
  - "Get Started" / "Resume Tour" button
  - "Dismiss checklist" link
- **Lifecycle:**
  - Present during tour alongside Driver.js popover
  - After tour ends: shrinks to Manila folder tab at bottom-right
  - Tab shows tour name, click to expand
  - Persists across page visits until tour completed
  - Future: Add FAQ/Help section that stays persistent

### 3. CORS for Analytics
- **Decision:** Accept requests from agency's specific GHL domain (from settings)
- **Not:** Wildcard `*`
- **Rationale:** Secure - each agency only allows their own configured domain

### 4. Photo Upload for Customers
- **Options Discussed:**
  - A) Customer uploads directly to Agency Toolkit (we can track it)
  - B) Customer uploads to GHL media, agency owner grabs it
- **Decision:** Let agency owner choose in settings which method
- **Implementation:** Could add photo field to customer record, or dedicated upload page
- **Storage:** Vercel Blob (not Cloudflare R2)

### 5. Action Detection in Tours
| Step Type | Detection Method |
|-----------|------------------|
| Informational | Auto-advance on Next click |
| Click Action | `allowInteraction: true`, detect click |
| External OAuth (CRM Connector) | Manual "Mark Complete" (no API access) |
| Upload to Our System | Detect via our API |
| GHL Native (contacts) | Watch DOM or manual |

### 6. Tour Step Configuration
- Steps need `allowInteraction: true` for actionable steps
- Last step needs "Done" button instead of "Next"

---

## P0 Fixes (Implementing Now)

### Fix 1: CORS on Analytics API
- **File:** `/app/api/tours/analytics/route.ts`
- **Change:** Add CORS headers allowing agency's GHL domain
- **Fallback:** If domain not found, allow common GHL domains

### Fix 2: Done Button on Last Step
- **File:** `/app/embed.js/route.ts`
- **Change:** Configure Driver.js with `doneBtnText: 'Done'`

---

## Backlog Items

### RLS Error on Customers Page
- **Error:** "new row violates row-level security policy for table 'customers'"
- **Location:** Add Customer modal
- **Priority:** P1 - needs fix before customers feature works
- **Likely Cause:** RLS policy not matching the insert operation

### Dashboard Tour Count
- **Issue:** Shows "Tours: 0" but tours exist
- **Priority:** P2 - cosmetic/query issue

### Feature 26/27: Checklist Widget
- **Status:** Needs spec file created
- **Dependencies:** Tour system working first

---

## Related Files
- `docs/sessions/2026-01-24-driver-js-bug.md` - Driver.js loading fix (completed)
- `docs/features/feature-21-tour-preview.md`
- `docs/features/feature-22-apply-tours-embed.md`
