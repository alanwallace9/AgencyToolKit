# Session: Driver.js Loading Bug

**Date:** 2026-01-24
**Status:** ✅ Fixed - ready for testing

---

## The Bug

Tours fail to run in production with error:
```
[AgencyToolkit] ❌ Driver.js not loaded correctly. window.driver: {js: Module}
```

## Root Cause

The Driver.js 1.3.1 IIFE build from jsDelivr exposes the driver function at:
```javascript
window.driver.js.driver()  // CORRECT
```

NOT at:
```javascript
window.driver.driver()  // WRONG - what we had
window.driver()         // WRONG - what we tried
```

## The Fix

In `app/embed.js/route.ts`, change all instances of Driver.js initialization from:
```javascript
var driverFn = typeof window.driver.driver === 'function' ? window.driver.driver : window.driver;
```

To:
```javascript
var driverFn = window.driver.js.driver;
```

There are **2 places** to fix:
1. Preview mode (~line 2391)
2. Production mode (~line 2780)

## Files to Modify

| File | Change |
|------|--------|
| `app/embed.js/route.ts` | Update Driver.js function access path |

## Verification

After fix, console should show:
```
[AgencyToolkit] 🚀 Starting tour: Welcome
[AgencyToolkit] Driver.js loaded, window.driver: object {js: Module}
[AgencyToolkit] Using window.driver.js.driver()
```

And the tour should actually render with Driver.js popovers.

---

## Other Fixes Already Deployed (Working)

These fixes from this session are deployed and working:
- Live Preview uses step's pageUrl instead of ghlDomain
- Test All Elements uses step's pageUrl instead of ghlDomain
- Element name lookup checks agency's renamed_items

---

## Related Files

- `docs/sessions/TOUR_PREVIEW_TESTING.md` - Testing checklist
- `docs/features/feature-21-tour-preview.md`
- `docs/features/feature-22-apply-tours-embed.md`
