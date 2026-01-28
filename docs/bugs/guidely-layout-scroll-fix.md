# Guidely Layout Scroll Fix

**Date:** 2026-01-28
**Status:** In Progress

---

## Problem Summary

When the center "Settings" panel opens in Guidely builders (Smart Tips, etc.), the **entire page** gets a scrollbar and shows white space at the bottom. Only individual columns should scroll, never the full page.

**Expected Behavior:**
- Page itself NEVER scrolls
- Left column: Scrolls internally only if many items
- Center column: Scrolls internally when open (lots of settings)
- Right column: Fixed preview, no scroll

**Current Behavior:**
- Settings panel closed: Page looks correct
- Settings panel opens: Page scrolls, white space appears at bottom

---

## Root Cause Analysis

### Layout Hierarchy
```
Dashboard Layout (min-h-screen flex flex-col)
├── Header (h-16 sticky top-0)
└── Main (flex-1 py-8 px-8)
    └── Guidely Layout (h-[calc(100vh-4rem)] -my-8 -mx-8) ← PROBLEM
        ├── GuidelySidebar
        └── Main (flex-1 overflow-hidden)
            └── Builder Component (h-full)
```

### Why It Breaks
1. Dashboard layout uses `min-h-screen` — allows content to grow beyond viewport
2. Guidely layout uses `h-[calc(100vh-4rem)]` with negative margins to escape parent padding
3. This calc + negative margin approach is fragile
4. When a conditional panel appears, flex recalculates and overflow escapes up the DOM

### File Locations
- Dashboard Layout: `/app/(dashboard)/layout.tsx`
- Guidely Layout: `/app/(dashboard)/g/layout.tsx`
- Smart Tips Builder: `/app/(dashboard)/g/tips/[id]/_components/smart-tips-builder.tsx`
- Tip Settings Panel: `/app/(dashboard)/g/tips/[id]/_components/tip-settings-panel.tsx`

---

## The Fix

### Change G Layout to Fixed Positioning

**Before (broken):**
```tsx
// app/(dashboard)/g/layout.tsx
<div className="flex h-[calc(100vh-4rem)] -my-8 -mx-8 lg:-mx-14">
  <GuidelySidebar />
  <main className="flex-1 overflow-hidden">
    {children}
  </main>
</div>
```

**After (fixed):**
```tsx
// app/(dashboard)/g/layout.tsx
<div className="fixed inset-0 top-16 flex">
  <GuidelySidebar />
  <main className="flex-1 overflow-hidden">
    {children}
  </main>
</div>
```

**Why this works:**
- `fixed inset-0 top-16` — Positions element relative to viewport, not parent
- `top-16` (64px) — Accounts for the dashboard header height
- No calc needed, no negative margins needed
- The fixed container can NEVER cause page scroll
- Only internal elements with `overflow-y-auto` will scroll

---

## Architecture Consolidation

### Current State (Messy)
Components are split between `/tours/` and `/g/`:

```
/g/banners/[id]/page.tsx    → imports from /tours/banners/
/g/checklists/[id]/page.tsx → imports from /tours/checklists/
/g/tours/[id]/page.tsx      → imports from /tours/[id]/
/g/tips/[id]/page.tsx       → native to /g/ ✓
/g/themes/[id]/page.tsx     → native to /g/ ✓
```

### Target State (Clean)
All Guidely components should live in `/g/`:

```
/g/banners/[id]/_components/banner-builder.tsx     (copied, then modified)
/g/checklists/[id]/_components/checklist-builder.tsx
/g/tours/[id]/_components/tour-builder.tsx
/g/tips/[id]/_components/smart-tips-builder.tsx    (already here)
/g/themes/[id]/_components/guidely-theme-editor.tsx (already here)
```

### Migration Plan
1. Copy component files from `/tours/` to `/g/`
2. Update imports in `/g/` page files to use local components
3. Redesign each builder to use consistent pattern:
   - Left: List of items (tips, steps, banners, etc.)
   - Center: Slide-out settings panel
   - Right: Large preview
4. Delete `/tours/` folder when complete

---

## Consistent Builder Pattern

All Guidely builders should follow this structure:

```
┌─────────────────────────────────────────────────────────────────┐
│ Header (shrink-0)                                               │
│ [← Back] [Name input] [Status Badge]        [Settings] [Publish]│
├────────────┬─────────────────┬──────────────────────────────────┤
│ Left Panel │ Center Panel    │ Right Panel                      │
│ (w-64)     │ (w-96, slides)  │ (flex-1)                         │
│            │                 │                                  │
│ List of    │ Settings for    │ Live Preview                     │
│ items      │ selected item   │                                  │
│            │                 │                                  │
│ [+ Add]    │ (scrolls)       │                                  │
├────────────┴─────────────────┴──────────────────────────────────┤
│ Internal scroll only - page never scrolls                       │
└─────────────────────────────────────────────────────────────────┘
```

**Key Principles:**
- Left panel: Always visible, shows list of items
- Center panel: Slides out when item selected, contains settings
- Right panel: Expands when center is closed, shows preview
- Header: Fixed height, contains name/status/actions
- Only columns scroll, never the page

---

## UI Simplification Notes

The current Banner builder has oversized UI elements:
- Position: Two large cards (Top/Bottom) → Could be a dropdown
- Display Mode: Radio cards → Could be a dropdown
- Style Preset: Color cards → Could be a compact picker

Target: Compact left panel with dropdowns/toggles, more room for preview.

---

## Files to Modify

### Phase 1: Fix Layout (Current Task)
- [ ] `/app/(dashboard)/g/layout.tsx` — Change to fixed positioning

### Phase 2: Consolidate Components (Future)
- [ ] Copy `/tours/banners/[id]/_components/*` to `/g/banners/[id]/_components/`
- [ ] Copy `/tours/checklists/[id]/_components/*` to `/g/checklists/[id]/_components/`
- [ ] Copy `/tours/[id]/_components/*` to `/g/tours/[id]/_components/`
- [ ] Update all imports in `/g/` page files
- [ ] Delete `/tours/` folder

### Phase 3: Redesign Builders (Future)
- [ ] Redesign Banner builder (left list + slide-out center)
- [ ] Redesign Checklist builder
- [ ] Redesign Tour builder
- [ ] Simplify UI (dropdowns instead of cards)

---

## Testing Checklist

After applying the fix:
- [ ] Smart Tips: Open settings panel, verify no page scroll
- [ ] Smart Tips: Scroll settings panel, verify only that column scrolls
- [ ] Themes: Verify editor still works correctly
- [ ] Banners: Verify page still works
- [ ] Checklists: Verify page still works
- [ ] Tours: Verify page still works
- [ ] Check modals/dialogs still position correctly with fixed layout

---

## Related Files

- Bug report: `/docs/bugs/smart-tips-scroll-issue.md`
- This doc: `/docs/bugs/guidely-layout-scroll-fix.md`
