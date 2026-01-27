# Guidely Left Nav Refactor

**Date:** 2026-01-26
**Status:** In Progress
**Rollback Point:** `876c727` (checkpoint: Pre-Guidely refactor)

---

## Overview

Restructure Agency Toolkit navigation to position **Guidely** as a distinct product with its own left sidebar. This creates a scalable foundation that can eventually stand alone as a separate SaaS product.

---

## Decisions Made

### Product Name: **Guidely**
- Domain target: getguidely.com (GG = Good Game)
- Sub-brand now: "Guidely by Agency Toolkit"
- Standalone later: Just "Guidely"

### URL Structure
- Abbreviated: `/g/tours`, `/g/checklists`, `/g/banners`, `/g/themes`, `/g/analytics`
- Dashboard: `/g`

### Sidebar Design
- **Collapsible:** 48px collapsed (icons only), 200px expanded
- **Hover to expand:** Shows labels when hovering
- **Click to pin:** Pin icon keeps sidebar expanded (persisted in localStorage)
- **No counts:** Clean labels only (metrics live on dashboard cards)
- **Active indicator:** Highlighted background on active item

### Top Nav Changes
- Remove "Customize" dropdown (features moved to Theme Builder)
- Update "Pro" dropdown: "Guidely" replaces "Onboarding Tours"
- "Images" stays in Pro dropdown
- Clicking "Guidely" goes to `/g` (Guidely dashboard)
- Logo click goes to AT dashboard (`/dashboard`)

### Builder Header Bar
```
│ ← Back │ Draft │ Tour Name          ✓ All changes saved  ⚙ Settings │▷ Publish│ ••• │
```
- Status badge: Draft (gray), Live (green), Archived (dark)
- Inline editable title
- Save indicator
- Settings button (opens sheet)
- Publish button (primary action)
- More menu: Duplicate, Archive, Delete

### Three-Column Layout
- Left panel: Steps/Items list (collapsible with << toggle)
- Center panel: Step/Item settings (collapsible with ✕, expands preview when closed)
- Right panel: Preview (largest, expands when center closes)
- Default ratios: ~20% / ~30% / ~50% (will set per-feature after build)

### Backlog Items (Not This Session)
- Resizable columns (drag to resize)
- Tour builder 3-column conversion (separate spec)
- Smart Tips builder (after this refactor)
- WYSIWYG editing in preview

---

## Implementation To-Do List

### Phase 1: Foundation

- [x] **1.1** Create `/g` route group and layout ✅
  - Created `app/(dashboard)/g/layout.tsx`
  - Wrapper for all Guidely routes
  - Renders GuidelySidebar component

- [x] **1.2** Create GuidelySidebar component ✅
  - Created `app/(dashboard)/g/_components/guidely-sidebar.tsx`
  - Collapsible (60px → 200px)
  - Hover to expand (100ms delay)
  - Pin button to stay expanded (localStorage persisted)
  - Active item highlighting with left indicator dot
  - Links: Tours, Checklists, Smart Tips (coming soon), Banners, Themes, Analytics
  - "Back to Toolkit" link at bottom

- [x] **1.3** Create Guidely dashboard page ✅
  - Created `app/(dashboard)/g/page.tsx`
  - Overview cards for Tours, Checklists, Smart Tips, Banners
  - Stats: live/draft counts from database
  - Utility cards: Themes, Analytics
  - Quick action buttons for creating new items

- [x] **1.4** Update top nav ✅
  - Modified `components/dashboard/main-nav.tsx`
  - Removed "Customize" dropdown
  - Updated "Pro" dropdown: Guidely → `/g`, Images → `/images`
  - Cleaned up unused imports

- [x] **1.5** Create BuilderHeader component ✅
  - Created `app/(dashboard)/g/_components/builder-header.tsx`
  - Status badge (Draft=gray, Live=green, Archived=dark)
  - Inline editable title
  - Save status indicator (Saving.../All changes saved/Unsaved changes)
  - Settings button
  - Publish/Unpublish button
  - More menu: Duplicate, Archive, Delete

### Phase 2: Route Migration

- [x] **2.1** Create Tours routes under /g ✅
  - Created `app/(dashboard)/g/tours/page.tsx` (list with search/filter)
  - Created `app/(dashboard)/g/tours/_components/tours-list-client.tsx`
  - Created `app/(dashboard)/g/tours/[id]/page.tsx` (builder)
  - Added `backHref` prop to TourEditor component

- [x] **2.2** Create Checklists routes under /g ✅
  - Created `app/(dashboard)/g/checklists/page.tsx` (list)
  - Created `app/(dashboard)/g/checklists/_components/checklists-list-client.tsx`
  - Created `app/(dashboard)/g/checklists/[id]/page.tsx` (builder)
  - Added `backHref` prop to ChecklistBuilder component

- [x] **2.3** Create Banners routes under /g ✅
  - Created `app/(dashboard)/g/banners/page.tsx` (list)
  - Created `app/(dashboard)/g/banners/_components/banners-list-client.tsx`
  - Created `app/(dashboard)/g/banners/[id]/page.tsx` (builder)
  - Added `backHref` prop to BannerBuilder component

- [x] **2.4** Create Themes routes under /g ✅
  - Created `app/(dashboard)/g/themes/page.tsx` (list)
  - Created `app/(dashboard)/g/themes/_components/themes-list-client.tsx`
  - Created `app/(dashboard)/g/themes/[id]/page.tsx` (builder)
  - Added `backHref` prop to ThemeEditorClient component

- [x] **2.5** Create Analytics route under /g ✅
  - Created `app/(dashboard)/g/analytics/page.tsx`
  - Dashboard showing aggregate stats for Tours, Checklists, Banners
  - Top performing items for each category
  - Placeholder for customer progress tracking (coming soon)

- [x] **2.6** Add redirects for backwards compatibility ✅
  - Added redirects in `next.config.ts`
  - `/tours` → `/g/tours`
  - `/tours/[id]` → `/g/tours/[id]`
  - `/tours/checklists/[id]` → `/g/checklists/[id]`
  - `/tours/themes/[id]` → `/g/themes/[id]`
  - `/tours/banners/[id]` → `/g/banners/[id]`

### Phase 3: Cleanup

- [ ] **3.1** Remove old routes (after redirects verified working)
- [ ] **3.2** Update any hardcoded links throughout app
- [ ] **3.3** Run full build, fix any issues
- [ ] **3.4** Test all navigation paths
- [ ] **3.5** Commit and push

---

## Files to Create

| File | Purpose |
|------|---------|
| `app/(dashboard)/g/layout.tsx` | Guidely layout with sidebar |
| `app/(dashboard)/g/page.tsx` | Guidely dashboard |
| `app/(dashboard)/g/_components/guidely-sidebar.tsx` | Collapsible sidebar |
| `app/(dashboard)/g/_components/builder-header.tsx` | Shared builder header |
| `app/(dashboard)/g/tours/page.tsx` | Tours list |
| `app/(dashboard)/g/tours/[id]/page.tsx` | Tour builder |
| `app/(dashboard)/g/checklists/page.tsx` | Checklists list |
| `app/(dashboard)/g/checklists/[id]/page.tsx` | Checklist builder |
| `app/(dashboard)/g/banners/page.tsx` | Banners list |
| `app/(dashboard)/g/banners/[id]/page.tsx` | Banner builder |
| `app/(dashboard)/g/themes/page.tsx` | Themes list |
| `app/(dashboard)/g/themes/[id]/page.tsx` | Theme builder |
| `app/(dashboard)/g/analytics/page.tsx` | Analytics dashboard |

## Files to Modify

| File | Changes |
|------|---------|
| `components/dashboard/main-nav.tsx` | Remove Customize, update Pro dropdown |
| `app/(dashboard)/tours/page.tsx` | Add redirect to /g/tours |
| `app/(dashboard)/tours/[id]/page.tsx` | Add redirect to /g/tours/[id] |

---

## Progress Log

### 2026-01-26

- [x] Created spec document
- [x] Checkpoint committed: `876c727`
- [x] **Phase 1 Complete** - Build passed
  - Created `/g` layout with sidebar
  - Created GuidelySidebar (collapsible, hover, pin)
  - Created Guidely dashboard with stats cards
  - Updated top nav (removed Customize, added Guidely to Pro)
  - Created BuilderHeader component
- [x] **Phase 2 Complete** - Build passed
  - Created Tours, Checklists, Banners, Themes list pages under /g
  - Created builder wrappers with `backHref` props
  - Created Analytics dashboard with aggregate stats
  - Added redirects for backwards compatibility in next.config.ts

---

## Testing Checklist

After implementation:

- [ ] Click "Guidely" in Pro dropdown → lands on `/g` dashboard
- [ ] Dashboard shows cards for Tours, Checklists, Banners, Themes
- [ ] Sidebar hover expands, shows labels
- [ ] Sidebar pin keeps it expanded
- [ ] Click Tours → `/g/tours` list page
- [ ] Click tour → `/g/tours/[id]` builder
- [ ] Builder header shows status, save indicator, settings, publish
- [ ] Old URLs redirect correctly (`/tours` → `/g/tours`)
- [ ] Build passes with no errors
