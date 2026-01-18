# Embed Script Rebuild Plan

Tracking document for the systematic rebuild of the Agency Toolkit embed script.

**Created:** 2026-01-18
**Status:** Planning Phase - No code changes until approach finalized

---

## Background

On 2026-01-18, testing revealed critical issues with the embed script:
- CSS selectors hiding entire sidebar (`.lead-connector` bug)
- Timing/caching issues causing inconsistent behavior
- Partial application of styles
- Questions about whether JavaScript approach is right for all features

---

## Current Bugs to Fix

### Bug 1: Theme Not Updating After Delete/Save
**Reported:** 2026-01-18
**Severity:** High
**Type:** Theme Builder Bug (NOT embed script)
**Description:** User deleted custom theme, selected built-in theme (Fresh Mint), clicked Save. After 6+ minutes and hard refresh, old brown color still showing.

**Likely Causes:**
- Delete action not properly removing from database
- Built-in theme selection not overwriting custom theme data in `agencies.color_config`
- The "delete" only removes from `color_presets` table but doesn't clear `agencies.color_config`
- Save action for built-in themes may not be updating the agency record

**Expected Behavior:**
1. Deleting a custom theme should clear it from presets AND clear `agencies.color_config` if it was active
2. Selecting a built-in theme and clicking Save should update `agencies.color_config` with the built-in values
3. Built-in theme selection should be the source of truth

**Files to investigate:**
- `app/(dashboard)/colors/_actions/color-actions.ts` - deleteColorPreset, saveAgencyColors
- `app/(dashboard)/theme-builder/_components/brand-colors-tab.tsx` - save handler
- API `/api/config` - verify it returns current color_config

---

### Bug 2: Menu Renames Not All Applying
**Reported:** 2026-01-18
**Severity:** Medium
**Type:** Embed Script Bug
**Description:** From screenshot, not all menu renames are applying correctly.

**Observations from 2026-01-18 screenshot:**

| Menu Item | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Launchpad | Connect Google | Connect Google | ✅ Working |
| Dashboard | Dashboard | Dashboard | ✅ (no rename) |
| Conversations | Inbox | Conversations | ❌ NOT RENAMED |
| Contacts | Contacts | Contacts | ✅ (no rename) |
| AI Agents | AI Agents | AI Agents | ✅ (no rename) |
| Email Marketing | Social Planner | Social Planner | ✅ Working |
| Automation | Automation | Automation | ✅ (no rename) |
| Media Storage | Media Storage | Media Storage | ✅ (no rename) |
| Reputation | Reviews | NOT VISIBLE | ❌ MISSING |
| Audit Dashboard | (custom link) | Audit Dashboard | ⚠️ Custom link |

**Items that SHOULD be hidden but are showing:**
- Calendars - NOT in screenshot (may be hidden ✅)
- Opportunities - NOT in screenshot (may be hidden ✅)
- Payments - NOT in screenshot (may be hidden ✅)
- Sites - Showing ❌
- Memberships - Showing ❌
- Media Storage - Showing ❌
- Reporting - NOT in screenshot (may be hidden ✅)
- App Marketplace - NOT in screenshot (may be hidden ✅)

**Likely Causes:**
- Selector mismatch for `sb_conversations` and `sb_reputation`
- These items may have different DOM structure
- Possible: GHL has different IDs for some items than we discovered

**To Investigate:**
- Run discovery script on page showing Conversations
- Check actual ID attribute of Conversations menu item
- Check if Reputation/Reviews item has different ID

---

### Bug 3: Custom Menu Links Not Identifiable
**Reported:** 2026-01-18
**Severity:** Low
**Description:** Custom links added by user (like "Audit Dashboard") have different DOM structure. Need to identify how to target/exclude these.

**To Research:**
- DOM structure of custom menu links
- How to differentiate from native menu items
- Whether to style them or leave them alone

---

## Key Questions to Resolve Before Coding

### Q1: JavaScript vs CSS-Only for Theme Builder?

**Option A: Pure CSS (user pastes code)**
- User makes changes in Theme Builder
- Theme Builder generates CSS code
- User manually copies CSS into GHL Settings → Company → Custom CSS
- Changes apply immediately in GHL

**Option B: JavaScript Embed (current approach)**
- User makes changes in Theme Builder
- Embed script fetches config and injects CSS
- Changes apply after cache clears (up to 5 minutes)

**Option C: Hybrid**
- Theme Builder = CSS only (user pastes)
- Tours/Social Proof = JavaScript embed (requires dynamic behavior)

**Decision needed from user:** Which approach preferred?

---

### Q2: What is the 5-Minute Cache?

The embed script response includes this header:
```
Cache-Control: public, max-age=300, s-maxage=300
```

This tells browsers and CDNs: "You can serve a cached copy of this script for up to 300 seconds (5 minutes) without checking if it changed."

**Why it exists:** Performance - prevents every page load from hitting our server

**The problem:** When user makes changes in Theme Builder, they may not see them for up to 5 minutes

**Options:**
1. Reduce cache time (e.g., 60 seconds) - more server load
2. Add version parameter to URL - forces fresh fetch after changes
3. Accept the delay - document it for users
4. Remove caching entirely - not recommended for production

---

### Q3: Kill Switch URL Parameter?

**Proposal:** Allow `?at_disable=true` on any GHL URL to completely disable Agency Toolkit customizations.

**Use cases:**
- Debugging when something breaks
- Comparing styled vs unstyled
- Emergency disable without removing embed code

**Implementation:** Early check in embed script, if param present, exit immediately.

---

### Q4: Minimal Test Script?

**Proposal:** Before rebuilding features, deploy a minimal script that just logs to console to verify:
1. Script is loading correctly
2. Config is fetching correctly
3. Timing of when script runs vs DOM ready

**Example minimal script would:**
```javascript
console.log('[AgencyToolkit] Script loaded');
// Fetch config
// console.log('[AgencyToolkit] Config received', config);
// console.log('[AgencyToolkit] DOM state:', document.readyState);
```

**Purpose:** Confirm the delivery mechanism works before adding features.

---

### Q5: Builder Mode / Element Selector Approach?

**Current approach:** Floating toolbar in GHL, user clicks elements to select for tours

**Concerns:**
- JavaScript in GHL is risky
- Cross-origin issues if using iframe
- Maintenance burden when GHL changes

**Alternative approaches:**
1. **Iframe in Agency Toolkit** - Load GHL inside our app, select elements there
2. **Manual selector input** - User types/pastes CSS selectors (technical)
3. **Visual library** - Pre-defined selectors for common GHL elements
4. **Chrome extension** - Like Userpilot does

**To explore:** Can we use iframe approach? What are the cross-origin limitations?

---

## Rebuild Phases (DRAFT - Not Started)

### Phase A: Infrastructure Verification
- [ ] Verify script loading mechanism
- [ ] Verify config fetching
- [ ] Implement kill switch parameter
- [ ] Reduce cache time for development
- [ ] Add comprehensive logging

### Phase B: Color Customizations (Low Risk)
- [ ] Sidebar background
- [ ] Sidebar text
- [ ] Test isolation before proceeding

### Phase C: Extended Colors
- [ ] Top nav
- [ ] Buttons
- [ ] Inputs
- [ ] Cards
- [ ] Links

### Phase D: Menu Hiding (Medium Risk)
- [ ] Use ONLY precise ID selectors
- [ ] Test each menu item individually
- [ ] Document which items work/don't work

### Phase E: Menu Renaming (Medium Risk)
- [ ] CSS ::after technique
- [ ] Test each rename individually
- [ ] Handle edge cases

### Phase F: Loading Animation (Medium Risk)
- [ ] Careful replacement of GHL loader
- [ ] Test all 4 loading states
- [ ] Ensure fallback to GHL default if issues

### Phase G: Login Page (Lower Risk)
- [ ] Separate page, less interaction with main app
- [ ] Background, form styling, etc.

### Phase H: Tours (Requires JavaScript)
- [ ] Depends on Q5 decision about approach
- [ ] May need different delivery mechanism

### Phase I: Social Proof Widget (Requires JavaScript)
- [ ] Real-time notifications
- [ ] Positioning, animations

---

## Open Items / Parking Lot

- [ ] How to handle GHL updates that change selectors
- [ ] Automated selector monitoring (see BACKLOG.md)
- [ ] Per-customer CSS isolation (if needed)
- [ ] Icon customization (mentioned but deferred)
- [ ] Personalized Image Generator integration

---

## Session Notes: 2026-01-18

### User Clarifications
- The "Connect Google" and "Social Planner" renames in screenshot were from **manual CSS the user added previously**, NOT our embed script
- Conversations → Inbox rename is broken (our code)
- User likes **hybrid approach** but concerned about reinstalling CSS each time
- User likes **GHL Style interface** - live preview on right as you change colors on left
- Floating toolbar for tours may be too complex - explore **iframe wrapper approach** instead
- Need to research: Can you select elements inside an iframe? Cross-origin issues?

### Decisions Pending (Next Session)
1. **Cache time** - User questions benefit of 5-min cache; need to explain or reduce
2. **Hybrid approach** - How to minimize reinstall friction?
3. **Element selector** - Iframe wrapper vs floating toolbar vs pre-built library?
4. **GHL Style-like interface** - Consider redesigning Theme Builder preview

### To Implement (Agreed)
- [x] Kill switch parameter (`?at_disable=true`) - ✅ DEPLOYED v2.0.0
- [x] Console logging for debugging (`[AgencyToolkit] Script loaded`) - ✅ DEPLOYED v2.0.0
- [ ] Fix Theme Builder save/delete bug (brown color persisting) - NOT STARTED

---

## Session 2: 2026-01-18 (Later) - v2.0.0 Deployed

### What Was Deployed

| Feature | Status | Commit |
|---------|--------|--------|
| Kill switch `?at_disable=true` | ✅ Working | 546615a |
| Also respects `?customCode=false` | ✅ Working | 546615a |
| Console logging with `[AgencyToolkit]` | ✅ Working | 546615a |
| Version parameter `?v=` for cache busting | ✅ Deployed | 546615a |
| Builder Mode Tailwind selector fix | ✅ Fixed | 546615a |

### Research Completed
- **Iframe element selection**: Cross-origin policy blocks it - cannot access DOM across origins
- **White-label domains**: Same problem - `app.agencytoolkit.com` cannot access `crm.youragency.com` iframe
- **GHL Style interface**: They use mockups, NOT live iframes - similar to our current approach
- **Hybrid approach decided**: JS embed handles everything, CSS export optional for manual tweaks

### Decisions Made
1. **Cache**: Keep 5-min cache + version parameter `?v=` forces fresh fetch
2. **Hybrid**: JS embed still handles all features; CSS export is OPTIONAL alternative
3. **Element selector**: Keep Builder Mode (toolbar), add pre-built element library later

### Verified Working
- [x] Script v2.0.0 loading (console shows version)
- [x] `?at_disable=true` stops all customizations
- [x] `?customCode=false` stops all customizations
- [x] Builder Mode toolbar appears
- [x] Element clicking no longer crashes (Tailwind class bug fixed)

### Still Broken
- [ ] Element data not showing in tour step after selection (UI feedback missing)
- [ ] Theme Builder save/delete bug (brown persists)
- [ ] Conversations → Inbox rename
- [ ] Reputation → Reviews rename/visibility

---

## Next Session Prompt

```
Continue Agency Toolkit embed script rebuild.

Read these files first:
1. docs/EMBED_SCRIPT_REBUILD.md - Full context and bugs
2. docs/GHL_SELECTORS.md - Known CSS selectors

Priority tasks:
1. Show captured element in tour step editor after Builder Mode selection
2. Fix Theme Builder save/delete bug (investigate color-actions.ts)
3. Fix Conversations (sb_conversations) and Reputation (sb_reputation) menu selectors
4. Add CSS export card to Settings page below embed code

v2.0.0 is deployed with kill switch, logging, and selector fix working.
```

### Files to Reference

| Priority | File | Why |
|----------|------|-----|
| 1 | `docs/EMBED_SCRIPT_REBUILD.md` | Full context, bugs, decisions |
| 2 | `docs/GHL_SELECTORS.md` | Discovered CSS selectors |
| 3 | `app/(dashboard)/tours/[id]/_components/element-selector-field.tsx` | Element UI feedback |
| 4 | `app/(dashboard)/colors/_actions/color-actions.ts` | Theme delete bug |
| 5 | `app/embed.js/route.ts` | Embed script (v2.0.0) |
| 6 | `app/(dashboard)/settings/page.tsx` | Add CSS export card |

---

*Document created: 2026-01-18*
*Last updated: 2026-01-18 - v2.0.0 deployed*
