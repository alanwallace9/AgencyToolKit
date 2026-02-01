# Smart Tips Session Handoff

**Date:** 2026-01-27
**Status:** Partially Complete - Layout Scroll Bug Remains

---

## What Was Completed ✅

### 1. Beacon Target Mode Bug Fix
- **Issue:** Tooltip anchored to wrong position when switching target modes
- **Solution:** Moved tooltip rendering INSIDE the beacon container when beacon is target
- **Files:** `app/(dashboard)/g/tips/[id]/_components/tip-preview.tsx`

### 2. UX: Replaced Cards with Dropdown
- **Before:** Two large card buttons for Element/Beacon selection
- **After:** Compact Select dropdown with three options: Automatic | Element | Beacon
- **Files:** `app/(dashboard)/g/tips/[id]/_components/tip-settings-panel.tsx`

### 3. Added 'automatic' Target Option
- Added `'automatic'` to `SmartTipBeaconTarget` type in `types/database.ts`
- When beacon is toggled ON, target auto-switches from 'element' to 'automatic'
- 'Automatic' means: use beacon if enabled, else element

### 4. Embed Script Updated
- Updated `app/embed.js/route.ts` to handle 'automatic' target
- Two locations: trigger setup and tooltip positioning

---

## Remaining Issue ❌

### Whole-Page Scroll on Smart Tips Builder

**Problem:** The Smart Tips builder page (`/g/tips/[id]`) scrolls the entire page with empty white space at the bottom. The Banners builder does NOT have this issue.

**Screenshots show:**
- Page can scroll down revealing white space
- Header gets cut off when scrolled
- "Add Tip" button is visible but page shouldn't scroll at all

### What Was Tried (Didn't Work)

1. **Height calculations:**
   - `h-full` - didn't constrain properly
   - `h-[calc(100vh-4rem)]` - still scrolled
   - `h-[calc(100vh-8rem)]` - still scrolled

2. **Overflow settings:**
   - `overflow-hidden` on builder - didn't prevent parent scroll
   - Changed layout's main from `overflow-auto` to `overflow-hidden` - broke list pages

3. **Fixed positioning:**
   - `fixed inset-0 top-16` - worked but covered the Guidely sidebar

4. **Negative margins:**
   - `-my-8 -mx-8 lg:-mx-14` to break out of padding - math didn't add up correctly

### Current State of Files

**`app/(dashboard)/g/layout.tsx`:**
```tsx
<div className="flex h-[calc(100vh-4rem-4rem)] -my-8 -mx-8 lg:-mx-14">
  <GuidelySidebar />
  <main className="flex-1 overflow-hidden py-8 px-8 lg:px-14">
    {children}
  </main>
</div>
```

**`app/(dashboard)/g/tips/[id]/_components/smart-tips-builder.tsx`:**
```tsx
<div className="flex flex-col h-[calc(100vh-8rem)] -my-8 -mx-8 lg:-mx-14 overflow-hidden bg-background">
```

**List pages** (tips/page.tsx, etc.) were updated to have their own scroll wrappers:
```tsx
<div className="h-full overflow-auto -my-8 -mx-8 lg:-mx-14 py-8 px-8 lg:px-14">
```

---

## Investigation Needed

### Compare to Banners Builder
The Banners builder (`/g/banners/[id]`) does NOT have this scroll issue. Need to:

1. Read `app/(dashboard)/g/banners/[id]/_components/banner-builder.tsx`
2. Compare its root element styling to SmartTipsBuilder
3. See what height/overflow approach it uses

### Key Files to Compare
- `app/(dashboard)/g/banners/[id]/_components/banner-builder.tsx` ← WORKING
- `app/(dashboard)/g/tips/[id]/_components/smart-tips-builder.tsx` ← BROKEN

---

## Next Session Prompt

```
Continue fixing Smart Tips builder scroll issue.

**Problem:** The Smart Tips builder page (/g/tips/[id]) has whole-page scrolling with white space at the bottom. The Banners builder does NOT have this issue.

**Action needed:**
1. Read the Banners builder: app/(dashboard)/g/banners/[id]/_components/banner-builder.tsx
2. Read the Smart Tips builder: app/(dashboard)/g/tips/[id]/_components/smart-tips-builder.tsx
3. Compare the root element styling (height, overflow, margins)
4. Apply whatever approach the Banners builder uses to the Smart Tips builder

**Context:**
- Both are 3-panel layouts (list | settings | preview)
- Both are inside the Guidely layout which has its own height constraints
- The Banners builder works correctly - copy that approach

**Files to check:**
- app/(dashboard)/g/layout.tsx (Guidely layout)
- app/(dashboard)/g/banners/[id]/_components/banner-builder.tsx (WORKING)
- app/(dashboard)/g/tips/[id]/_components/smart-tips-builder.tsx (BROKEN)

See docs/features/smart-tips-session-handoff.md for full context.
```

---

## Files Modified This Session

| File | Changes |
|------|---------|
| `types/database.ts` | Added 'automatic' to SmartTipBeaconTarget |
| `tip-preview.tsx` | Fixed beacon tooltip positioning, removed unused code |
| `tip-settings-panel.tsx` | Replaced cards with dropdown, auto-switch to automatic |
| `embed.js/route.ts` | Handle 'automatic' target (2 locations) |
| `smart-tips-builder.tsx` | Various height/overflow attempts (current: broken) |
| `g/layout.tsx` | Changed to overflow-hidden |
| `g/tips/page.tsx` | Added scroll wrapper |
| `g/page.tsx` | Added scroll wrapper |
| `g/tours/page.tsx` | Added scroll wrapper |
| `g/checklists/page.tsx` | Added scroll wrapper |
| `g/banners/page.tsx` | Added scroll wrapper |
| `g/themes/page.tsx` | Added scroll wrapper |
| `g/analytics/page.tsx` | Added scroll wrapper |
| `feature-28-29-smart-tips.md` | Updated with session 3 fixes |
