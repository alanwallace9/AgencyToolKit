# Executive Plan: Guidely UI Restructure

**Date:** 2026-01-26
**Status:** Awaiting Approval
**Affects:** Navigation, Routes, All Guidely Features (Tours, Checklists, Tips, Banners)

---

## What We're Building

A new navigation structure that positions **Guidely** as a distinct product within Agency Toolkit. This includes a collapsible left sidebar for Guidely features, consistent 3-column builders, and improved header controls. The goal is to create a professional, scalable UI that can eventually stand alone as a separate product.

---

## Agency Owner Workflow Analysis

### Current Pain Points

| Issue | Impact |
|-------|--------|
| **Scattered navigation** | Tours, Checklists buried under "Pro" dropdown → hard to find |
| **Inconsistent layouts** | Tours page uses cards, Checklists uses 3-column → confusing |
| **Wasted vertical space** | Top nav + page header + cards = less room for actual work |
| **No product identity** | "Tours" doesn't convey the full DAP capability |
| **Context switching** | Jumping between Tours/Checklists/Themes loses mental context |

### Ideal Workflow (After Restructure)

```
Agency Owner Journey:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DISCOVER
   Owner clicks "Pro ▼" → sees "Guidely" → clicks → lands on Guidely dashboard

   "Oh, this is a whole product for onboarding my customers!"

2. ORIENT
   Dashboard shows: Tours (5), Checklists (3), Tips (0), Banners (2)
   Recent activity feed shows what's working

   "I can see everything at a glance. Let me create a tour."

3. CREATE
   Clicks Tours in sidebar → sees tour list → clicks "+ New Tour"
   3-column builder opens: Steps | Settings | Large Preview

   "I can see exactly what my customer will see while I build."

4. REFINE
   Hover sidebar to switch to Themes → customize colors
   Back to Tours → theme automatically applied in preview

   "Everything stays in context. I don't lose my place."

5. PUBLISH
   Click "Publish" button → tour goes live
   Status badge changes from "Draft" to "Live"

   "One click and it's live. Love the confirmation."

6. MONITOR
   Click Analytics in sidebar → see completion rates
   Filter by tour/checklist → identify drop-off points

   "I can see which tours are working and which need improvement."
```

### Key UX Improvements

| Before | After | Benefit |
|--------|-------|---------|
| Hunt through dropdowns | Persistent sidebar | Always know where you are |
| Cards eat up space | 3-column layout | More room for actual work |
| Small preview panel | Large preview (50%+) | See exactly what customers see |
| No status visibility | Header status badge | Know if draft/live at a glance |
| Manual save anxiety | "All changes saved" | Peace of mind, auto-save |
| Publish buried in settings | Prominent Publish button | Clear call-to-action |

---

## UI Components

### 1. Top Navigation (Agency Toolkit Level)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔧 Agency Toolkit    Dashboard   Customers   Pro ▼         Settings        │
│                                               │                             │
│                                               ├─ Guidely      → /g          │
│                                               └─ [Images]     → /i          │
│                                                  (future name)              │
└─────────────────────────────────────────────────────────────────────────────┘

Notes:
- "Customize" dropdown removed (Menu, Login, Loading, Colors move elsewhere or stay)
- "Pro" dropdown contains premium products: Guidely, Images
- Clicking "Guidely" goes to /g (Guidely dashboard)
```

### 2. Guidely Sidebar (Collapsible)

```
COLLAPSED (48px)              EXPANDED (200px, on hover)           PINNED (200px, stays open)
─────────────────             ──────────────────────────           ────────────────────────────

┌────┐                        ┌────────────────────────┐           ┌────────────────────────┬───┐
│ 📍 │ ← active dot           │ 📍  Tours         (12) │           │ 📍  Tours         (12) │ 📌│ ← pin icon
│ ✓  │                        │ ✓   Checklists    (4)  │           │ ✓   Checklists    (4)  │   │
│ 💡 │                        │ 💡  Smart Tips    (0)  │           │ 💡  Smart Tips    (0)  │   │
│ 📢 │                        │ 📢  Banners       (2)  │           │ 📢  Banners       (2)  │   │
│────│                        │─────────────────────────│           │─────────────────────────│   │
│ 🎨 │                        │ 🎨  Themes        (3)  │           │ 🎨  Themes        (3)  │   │
│ 📊 │                        │ 📊  Analytics          │           │ 📊  Analytics          │   │
└────┘                        └────────────────────────┘           └────────────────────────┴───┘

Behavior:
- Default: Collapsed (icons only)
- Hover: Expands to show labels + counts
- Click pin icon: Stays expanded (persisted in localStorage)
- Click unpin: Returns to collapsed mode
- Active item: Highlighted background + dot indicator
```

### 3. Builder Header Bar

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  ← Back    │ Draft │    Welcome Tour                    ✓ All changes saved    ⚙ Settings  │▷ Publish│ ••• │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

Components:
┌──────────┬─────────────────────────────────────────────────────────────────────────────────┐
│ ← Back   │ Returns to list (e.g., /g/tours)                                               │
├──────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ │Draft│  │ Status badge: Draft (gray), Live (green), Archived (dark)                      │
├──────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Title    │ Editable inline (click to edit, blur to save)                                  │
├──────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ ✓ Saved  │ "All changes saved" or "Saving..." or "Unsaved changes"                        │
├──────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Settings │ Opens settings sheet (targeting, theme, etc.)                                  │
├──────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Publish  │ Primary action button (or "Unpublish" if live)                                 │
├──────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ •••      │ More menu: Duplicate, Archive, Delete                                          │
└──────────┴─────────────────────────────────────────────────────────────────────────────────┘
```

### 4. Three-Column Builder Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  ← Back  │Draft│  Welcome Tour                      ✓ All changes saved  ⚙ Settings │▷ Publish│•••│
├──────────────────────┬──────────────────────┬───────────────────────────────────────────────┤
│                      │                      │                                               │
│  STEPS/ITEMS         │  SETTINGS            │              LIVE PREVIEW                     │
│  (20%)               │  (30%)               │              (50%)                            │
│  ──────────────      │  ─────────────       │              ────────────                     │
│                      │                      │                                               │
│  Scrollable list     │  Context-sensitive   │   ┌─────────────────────────────────────┐    │
│  of steps/items      │  settings for        │   │                                     │    │
│                      │  selected item       │   │                                     │    │
│  ○ Step 1            │                      │   │         Actual size preview         │    │
│  ● Step 2 (selected) │  Title: [________]   │   │         of what customer            │    │
│  ○ Step 3            │                      │   │         will see                    │    │
│                      │  Description:        │   │                                     │    │
│  + Add Step          │  [________________]  │   │         ┌─────────────────┐         │    │
│                      │  [________________]  │   │         │  Tour Popover   │         │    │
│                      │                      │   │         │  ─────────────  │         │    │
│                      │  Element:            │   │         │  Welcome to     │         │    │
│                      │  [🎯 #btn________]   │   │         │  the dashboard! │         │    │
│                      │                      │   │         │                 │         │    │
│                      │  Position: [Top ▼]   │   │         │  [Next]  1/5    │         │    │
│                      │                      │   │         └─────────────────┘         │    │
│                      │                      │   │                                     │    │
│                      │                      │   └─────────────────────────────────────┘    │
│                      │                      │                                               │
│                      │                      │   Device: [Desktop ▼]  Zoom: [100% ▼]        │
│                      │                      │                                               │
└──────────────────────┴──────────────────────┴───────────────────────────────────────────────┘

Column Ratios:
- Steps/Items: 20% (narrow, just a list)
- Settings: 30% (forms, dropdowns)
- Preview: 50% (largest, the star of the show)

Minimum widths:
- Steps: 200px
- Settings: 280px
- Preview: 400px
```

### 5. Guidely Dashboard (/g)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Guidely                                                              [+ Quick Create ▼]    │
│  Help your customers succeed with guided experiences                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐     │
│  │  📍 Tours               │  │  ✓  Checklists          │  │  💡 Smart Tips          │     │
│  │  ────────────────────   │  │  ────────────────────   │  │  ────────────────────   │     │
│  │                         │  │                         │  │                         │     │
│  │  5 Live · 2 Draft       │  │  3 Live · 1 Draft       │  │  Coming Soon            │     │
│  │                         │  │                         │  │                         │     │
│  │  ┌─────────────────┐    │  │  ┌─────────────────┐    │  │  Contextual tooltips    │     │
│  │  │▓▓▓▓▓▓▓▓░░│ 78%  │    │  │  │▓▓▓▓▓░░░░░│ 45%  │    │  │  that appear on hover   │     │
│  │  └─────────────────┘    │  │  └─────────────────┘    │  │                         │     │
│  │  Avg completion rate    │  │  Avg completion rate    │  │  [View →]               │     │
│  │                         │  │                         │  │                         │     │
│  │  [View All →]           │  │  [View All →]           │  │                         │     │
│  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘     │
│                                                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐     │
│  │  📢 Banners             │  │  🎨 Themes              │  │  📊 Analytics           │     │
│  │  ────────────────────   │  │  ────────────────────   │  │  ────────────────────   │     │
│  │                         │  │                         │  │                         │     │
│  │  2 Live · 0 Draft       │  │  4 themes               │  │  This week              │     │
│  │                         │  │                         │  │                         │     │
│  │  Announcements &        │  │  Brand Blue (default)   │  │  1,234 tour views       │     │
│  │  promotional banners    │  │  Sunset Orange          │  │  892 completions        │     │
│  │                         │  │  + 2 more               │  │  156 checklist starts   │     │
│  │                         │  │                         │  │                         │     │
│  │  [View All →]           │  │  [Manage Themes →]      │  │  [View Details →]       │     │
│  └─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘     │
│                                                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  Recent Activity                                                           [View All →]     │
│  ───────────────────────────────────────────────────────────────────────────────────────    │
│  • "Welcome Tour" completed by Acme Plumbing                              2 min ago        │
│  • "Getting Started" checklist started by Joe's HVAC                      15 min ago       │
│  • New tour "Feature Highlight" published                                 1 hour ago       │
│  • "Onboarding" checklist reached 100% by Smith Roofing                   3 hours ago      │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Route Structure

```
Agency Toolkit Routes (unchanged):
/dashboard              → AT dashboard
/customers              → Customers list
/customers/[id]         → Customer detail
/menu                   → Menu customizer
/login                  → Login designer
/loading                → Loading animations
/colors                 → Dashboard colors
/settings               → AT settings

Guidely Routes (new):
/g                      → Guidely dashboard
/g/tours                → Tours list
/g/tours/new            → Create tour (redirect to /g/tours/[id])
/g/tours/[id]           → Tour builder (3-column)
/g/checklists           → Checklists list
/g/checklists/new       → Create checklist
/g/checklists/[id]      → Checklist builder (3-column)
/g/tips                 → Smart Tips list
/g/tips/new             → Create tip
/g/tips/[id]            → Tip builder (3-column)
/g/banners              → Banners list
/g/banners/new          → Create banner
/g/banners/[id]         → Banner builder (3-column)
/g/themes               → Themes list
/g/themes/new           → Create theme
/g/themes/[id]          → Theme builder
/g/analytics            → Analytics dashboard

Redirects (for backwards compatibility):
/tours                  → /g/tours (301 redirect)
/tours/[id]             → /g/tours/[id] (301 redirect)
/tours/checklists/[id]  → /g/checklists/[id] (301 redirect)
/tours/themes           → /g/themes (301 redirect)
```

---

## Implementation Order

### Phase 1: Sidebar Foundation
1. Create `GuidleySidebar` component (collapsible, hover, pin)
2. Create `/g` layout that wraps all Guidely routes
3. Update top nav "Pro" dropdown to include "Guidely" link
4. Create Guidely dashboard page (`/g/page.tsx`)

### Phase 2: Route Migration
1. Move Tours from `/tours` to `/g/tours`
2. Move Checklists from `/tours/checklists` to `/g/checklists`
3. Move Themes from `/tours/themes` to `/g/themes`
4. Add redirect routes for backwards compatibility

### Phase 3: Builder Header
1. Create `BuilderHeader` component (status badge, save indicator, settings, publish, more)
2. Apply to Tour builder
3. Apply to Checklist builder
4. Will be ready for Tips/Banners builders

### Phase 4: Column Rebalancing
1. Update Tour builder to 20/30/50 ratio
2. Update Checklist builder to 20/30/50 ratio
3. Ensure preview panel has device/zoom controls

### Phase 5: Polish
1. Add counts to sidebar items
2. Add "Coming Soon" states for Tips if not ready
3. Recent activity feed on dashboard
4. Keyboard shortcuts (Cmd+S to save, etc.)

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Sidebar width (collapsed) | 48px | Room for icons + padding, not cramped |
| Sidebar width (expanded) | 200px | Enough for labels + counts, not overwhelming |
| Column ratios | 20/30/50 | Preview is the star, settings need form space |
| Pin persistence | localStorage | Survives page refresh, per-browser |
| Route prefix | `/g` | Short, memorable, matches "Guidely" |
| Status in header | Badge | Clear visual indicator, always visible |

---

## Quick Wins (UX Improvements)

| Suggestion | Why It Helps | Effort |
|------------|--------------|--------|
| Keyboard shortcut hints | Power users can work faster (Cmd+S, Cmd+P) | Low |
| "Duplicate" in header menu | Common action, easy access | Low |
| Preview device toggle | See mobile vs desktop instantly | Medium |
| Drag sidebar to resize | Let users choose their ideal width | Medium |
| "Preview as customer" button | Open in new tab, see exactly what customer sees | Low |

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `app/(dashboard)/g/layout.tsx` | Guidely layout with sidebar |
| `app/(dashboard)/g/page.tsx` | Guidely dashboard |
| `app/(dashboard)/g/_components/guidely-sidebar.tsx` | Collapsible sidebar |
| `app/(dashboard)/g/_components/builder-header.tsx` | Shared builder header |
| `app/(dashboard)/g/tours/page.tsx` | Tours list (moved) |
| `app/(dashboard)/g/tours/[id]/page.tsx` | Tour builder (moved) |
| `app/(dashboard)/g/checklists/page.tsx` | Checklists list (moved) |
| `app/(dashboard)/g/checklists/[id]/page.tsx` | Checklist builder (moved) |
| `app/(dashboard)/g/themes/page.tsx` | Themes list (moved) |
| `app/(dashboard)/g/themes/[id]/page.tsx` | Theme builder (moved) |
| `app/(dashboard)/g/tips/page.tsx` | Smart Tips list (new) |
| `app/(dashboard)/g/tips/[id]/page.tsx` | Tip builder (new) |
| `app/(dashboard)/g/banners/page.tsx` | Banners list (new) |
| `app/(dashboard)/g/banners/[id]/page.tsx` | Banner builder (new) |
| `app/(dashboard)/g/analytics/page.tsx` | Analytics dashboard |

### Modified Files
| File | Changes |
|------|---------|
| `components/dashboard/main-nav.tsx` | Update Pro dropdown, add Guidely link |
| `app/(dashboard)/tours/*` | Add redirects to /g/tours/* |

---

## Scope Boundaries

| In Scope | Out of Scope |
|----------|--------------|
| Sidebar component | Smart Tips builder (separate feature) |
| Route restructure | Banners builder (being built elsewhere) |
| Builder header | Full analytics implementation |
| Column rebalancing | Mobile-specific sidebar (sheet) |
| Guidely dashboard | Custom sidebar width (drag to resize) |
| Redirects for old routes | |

---

## Questions for You

1. **"Customize" dropdown** - Should Menu, Login, Loading, Colors stay as a separate dropdown, or move under a new product name (like Images will be)?

2. **Dashboard link** - Top nav currently has "Dashboard" which goes to AT overview. Should clicking the logo also go there, or should it be smarter based on context?

3. **Tour builder conversion** - The current Tour builder has tabs (Steps, Settings, Targeting, Theme). Should we convert it to 3-column now, or keep tabs and just rebalance the preview?

4. **Feature counts in sidebar** - Show counts (Tours: 12) or just the label (Tours)?

---

## Approval

- [ ] Layout structure approved
- [ ] Route structure approved
- [ ] Column ratios approved (20/30/50)
- [ ] Ready to implement Phase 1 (Sidebar Foundation)

**Please review and let me know if you'd like any changes before I start building!**
