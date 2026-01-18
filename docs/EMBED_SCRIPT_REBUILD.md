# Embed Script Rebuild Plan

Tracking document for the systematic rebuild of the Agency Toolkit embed script.

**Created:** 2026-01-18
**Last Updated:** 2026-01-18
**Status:** Phase 0 Complete - Quick Wins Deployed

---

## Session Summary: 2026-01-18

### What Was Accomplished

#### Quick Wins Deployed (v2.0.0)
| Feature | Status | Notes |
|---------|--------|-------|
| Kill switch `?at_disable=true` | ✅ Deployed | Also respects `?customCode=false` |
| Enhanced logging | ✅ Deployed | `[AgencyToolkit]` prefix, always shows version |
| Version parameter `?v=` | ✅ Deployed | Cache busting when config changes |
| Builder Mode selector bug fix | ✅ Deployed | Fixed Tailwind `:` class crash |

#### Research Completed
- **Iframe element selection**: Cross-origin blocks it completely (same-origin policy)
- **White-label domains**: Still blocked - different origin than our app
- **GHL Style interface**: Uses mockups, not live iframes - similar to our approach
- **Hybrid approach**: CSS for themes, JS only for tours/social proof

### Decisions Made
1. **Cache**: Keep 5-min cache + version parameter for instant updates
2. **Hybrid**: JS embed still handles everything, CSS export is optional
3. **Element selector**: Builder Mode (current) + Pre-built library (future)

---

## Verified Working (2026-01-18)

| Feature | Status | How to Test |
|---------|--------|-------------|
| Script loading | ✅ | Console shows `[AgencyToolkit] Script loaded {version: "2.0.0"}` |
| Kill switch | ✅ | `?at_disable=true` disables all customizations |
| `?customCode=false` | ✅ | GHL native param now respected |
| Builder Mode toolbar | ✅ | Appears when URL has `?at_builder_mode=true` |
| Element click selection | ✅ | Fixed crash, now captures selectors |
| Color customizations | ✅ | Brown sidebar applying correctly |
| Menu customizations | ✅ | Renames working |

---

## Known Bugs Still Open

### Bug 1: Theme Builder Save/Delete
**Severity:** Medium
**Description:** Deleting custom theme doesn't clear brown color. After delete + select built-in + save, old color persists.
**To Investigate:** `app/(dashboard)/colors/_actions/color-actions.ts`

### Bug 2: Element Selector UI Feedback
**Severity:** Low
**Description:** After selecting element in Builder Mode, no visual confirmation in tour step editor showing what was captured.
**To Fix:** Update `element-selector-field.tsx` to display captured element data

### Bug 3: Menu Renames Not All Applying
**Severity:** Medium
**Description:** Conversations → Inbox rename not working
**Likely Cause:** Selector mismatch for `sb_conversations`

---

## Architecture Understanding

### Embed Script Flow
```
Agency installs embed code in GHL Agency Settings
  → Applies to ALL sub-accounts automatically
  → Script fetches config from /api/config?key=xxx
  → Injects CSS for colors, menu hiding/renaming
  → For Builder Mode: shows toolbar, captures element clicks
```

### Builder Mode Flow
```
1. User clicks "Select Element" in Tour Builder
2. Opens GHL in new tab: ?at_builder_mode=true&at_session=xxx
3. GHL SPA strips params → sessionStorage preserves them
4. Embed script detects builder mode, shows toolbar
5. User toggles ON, clicks element
6. Selector generated (with Tailwind class filtering)
7. BroadcastChannel sends data back to Tour Builder
```

### CSS vs JS Hybrid
```
ALWAYS via JS embed (current approach):
├── Colors (sidebar, buttons, inputs)
├── Menu hiding/renaming
├── Loading animations
└── Login page styling

OPTIONAL CSS export (future):
└── Same CSS, user can paste manually if preferred

JS-ONLY features (require embed):
├── Onboarding tours (Driver.js)
├── Social proof widget
└── Builder Mode element selector
```

---

## Next Session Tasks

### Priority 1: UI/UX Fixes
- [ ] Show captured element in step editor after selection
- [ ] Add CSS export card to Settings page (below embed code)
- [ ] Update Theme Builder wording ("Go to Settings" link)

### Priority 2: Bug Fixes
- [ ] Investigate Theme Builder save/delete bug
- [ ] Fix Conversations menu rename (`sb_conversations` selector)
- [ ] Verify all 16 menu item selectors

### Priority 3: Features
- [ ] Pre-built element library for common GHL elements
- [ ] Tour preview in iframe
- [ ] Apply tours via embed script (Driver.js)

---

## Code Changes (v2.0.0)

### File: `app/embed.js/route.ts`

**Added:**
- Kill switch checking (`?at_disable=true`, `?customCode=false`)
- Tiered logging system (`logInfo`, `log`, `logError`, `logWarn`)
- Version parameter support (`?v=`)
- Script version constant (`SCRIPT_VERSION = '2.0.0'`)
- Debug indicator for Builder Mode
- Better error handling in selector generation

**Fixed:**
- Tailwind class selector crash (filter out `:`, `[`, `]` characters)
- Added `CSS.escape()` for IDs with special characters
- Added try-catch around all querySelector calls

---

## Testing Checklist

### Quick Tests (After Deployment)
- [x] Console shows `[AgencyToolkit] Script loaded {version: "2.0.0"}`
- [x] `?at_disable=true` stops all customizations
- [x] `?customCode=false` stops all customizations
- [x] Builder Mode toolbar appears
- [x] Clicking elements no longer crashes
- [ ] Element data appears in tour step after selection

### Full Tests (When Time Permits)
- [ ] All 16 menu items hide correctly
- [ ] All menu renames work
- [ ] All extended color elements style correctly
- [ ] Loading animation replacement works
- [ ] Login page styling works

---

## Reference Links

- **GHL Selectors:** `docs/GHL_SELECTORS.md`
- **Product Scope:** `docs/PRODUCT_SCOPE.md`
- **GHL Research:** `docs/GHL_INTEGRATION_RESEARCH.md`
- **Sprint Status:** `docs/SPRINT.md`

---

*Document created: 2026-01-18*
*Last updated: 2026-01-18 - v2.0.0 deployed*
