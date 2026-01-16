# CRITICAL SESSION NOTES - 2026-01-16

## NEXT SESSION: MUST RESEARCH FIRST

### 1. Toast Animation Direction
Toast NOW WORKS on Loading Animations page!
User wants: slide in from RIGHT (horizontal), not drop down from top

Current: `<Toaster position="top-right" />`
Research: How to make Sonner slide horizontally from right edge

Optional styling (for later):
- Light green background like "Currently Active" box
- Colors: background #ecfdf5, border #a7f3d0, text #065f46

### 2. Colors Page - No Save on Built-in Theme Select
Loading page saves work. Colors page does NOT save when clicking built-in theme.
This is a CODE issue in `colors-client.tsx` - `handleSelectBuiltInPreset` doesn't call save.
Need to add `saveAgencyColors()` call when selecting built-in theme.

### 3. React Error #306 - RESOLVED
Was caused by Toaster styling syntax. Simplified version works.
Can add styling back once slide animation is figured out.

---

## Status: FIXES DEPLOYED - BUG INTRODUCED

### Commit: 4633617
- Added Toaster to layout (top-right, green styling)
- Fixed RLS in loading-actions.ts, color-actions.ts, menu-actions.ts, login-actions.ts
- All now use createAdminClient() instead of createClient()

### What to Test:
1. Go to Loading Animations - click an animation - should see green toast + save to DB
2. Go to Dashboard Colors - select a theme - should save
3. Go to Menu - create a preset - should save
4. Check Supabase: agencies.settings should no longer be all nulls

---

## ORIGINAL STATUS: BLOCKING ISSUES IDENTIFIED

This session identified critical bugs that prevent the app from functioning. Document this for continuity if session ends.

---

## CRITICAL BUG #1: Nothing Saves to Database

### Root Cause
All server actions use `createClient()` (anon key) but RLS policies require `auth.jwt()` from Supabase Auth. We use Clerk for auth, not Supabase Auth, so `auth.jwt()` is always null.

### Evidence
```sql
-- RLS policy on agencies table for UPDATE:
clerk_user_id = (auth.jwt() ->> 'sub'::text)
-- auth.jwt() returns null with Clerk, so all UPDATEs fail silently
```

### Database State (confirmed via Supabase MCP)
```json
{
  "agencies.settings": {
    "menu": null,
    "login": null,
    "colors": null,
    "loading": null
  },
  "menu_presets": "0 rows",
  "color_presets": "0 rows",
  "login_designs": "0 rows"
}
```

### Fix Required
Change ALL mutation server actions to use `createAdminClient()`:

| File | Status |
|------|--------|
| `app/(dashboard)/loading/_actions/loading-actions.ts` | NEEDS FIX |
| `app/(dashboard)/colors/_actions/color-actions.ts` | NEEDS FIX |
| `app/(dashboard)/menu/_actions/menu-actions.ts` | NEEDS CHECK |
| `app/(dashboard)/login/_actions/login-actions.ts` | NEEDS CHECK |
| `app/(dashboard)/tours/_actions/tour-actions.ts` | Already uses admin client |

---

## CRITICAL BUG #2: Toasts Don't Show

### Root Cause
`<Toaster />` component from Sonner is NOT in the root layout.

### Current app/layout.tsx
```tsx
<body className={inter.className} suppressHydrationWarning>
  {children}
  <SpeedInsights />
  // MISSING: <Toaster />
</body>
```

### Fix Required
Add `import { Toaster } from 'sonner'` and `<Toaster />` to layout.

---

## CONFIRMED: Embed Script Handles Everything

The embed script (`app/embed.js/route.ts`) contains functions for ALL customizations:

| Function | Lines | Purpose |
|----------|-------|---------|
| `applyMenuConfig()` | 90-151 | Hide/rename menu items, hide banners |
| `applyColorConfig()` | 153-181 | Dashboard color theme |
| `applyLoadingConfig()` | 183-249+ | Custom loading animation |
| `applyLoginDesign()` | 340+ | Login page customization |

### Conclusion
The "Generate CSS" section on the Menu page is **REDUNDANT** and should be removed. The embed script handles everything automatically.

---

## UX Issues Identified

### Current State (Confusing)
- 4 separate pages: Menu, Colors, Loading, Login
- Each has different save/apply patterns
- Menu page has redundant CSS section
- Colors page: clicking theme doesn't save, shows "Unsaved changes" forever
- Loading page: clicking animation should save but doesn't (RLS bug)
- No toast feedback (Toaster missing)

### User's Vision: Unified Theme Builder
```
/theme-builder (single page)
├── Tab: Menu
├── Tab: Colors
├── Tab: Loading
├── Tab: Login
└── Actions: Save | Preview | Apply
```

Benefits:
- Single unified experience
- Consistent save/apply pattern across all customizations
- Preview entire theme before applying
- Clearer UX

---

## Immediate Fix Priority

1. **Add Toaster to layout** - 1 line fix, enables feedback
2. **Fix RLS in all actions** - Change `createClient()` to `createAdminClient()`
3. **Test saves work** - Verify data appears in Supabase
4. **Remove CSS section from Menu page** - It's redundant
5. **Plan Theme Builder consolidation** - Future sprint

---

## Files to Modify

### Quick Fixes (Do First)
- `app/layout.tsx` - Add Toaster
- `app/(dashboard)/loading/_actions/loading-actions.ts` - Use admin client
- `app/(dashboard)/colors/_actions/color-actions.ts` - Use admin client

### UX Improvements (After Saves Work)
- `app/(dashboard)/menu/_components/css-preview-panel.tsx` - Remove entirely
- `app/(dashboard)/colors/_components/colors-client.tsx` - Save on theme select
- Consider unified Theme Builder page

---

## Production URLs

- App: https://toolkit.getrapidreviews.com
- Embed: `<script src="https://toolkit.getrapidreviews.com/embed.js?key=al_f63631494c1ade12"></script>`

---

## Agency Token
`al_f63631494c1ade12`

## Clerk User ID (Production)
`user_38Li2xwb1pw7uN5WnduNkkaOt5j`

## Supabase Project ID
`hldtxlzxneifdzvoobte`

---

## REMAINING WORK (Next Session)

### After Testing Confirms Saves Work:
1. Remove CSS section from Menu page (redundant - embed handles it)
2. Fix Colors page - call `saveAgencyColors()` when selecting built-in theme
3. Consider unified Theme Builder with tabs (user's vision)

### Theme Builder UI Reference:
User shared image showing simple toggle pattern:
- "Sidebar Theme - Toolkit V1" header
- Orange "Activated" toggle
- Tabs: Description | Presets | Customize

### Security Verified:
- Admin client is server-side only
- getCurrentAgency() verifies Clerk auth before any mutation
- All queries filter by agency_id
- No client-side exposure of admin keys
