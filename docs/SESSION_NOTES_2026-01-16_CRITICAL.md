# CRITICAL SESSION NOTES - 2026-01-16

## Status: BLOCKING ISSUES IDENTIFIED

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
