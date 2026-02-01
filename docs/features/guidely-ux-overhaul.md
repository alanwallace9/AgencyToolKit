# Guidely UX Overhaul

## Overview

Comprehensive UI/UX improvements to the Guidely section to make it feel more polished, professional, and functional. Addresses flat card design, missing management features, and generic styling.

---

## Design Decisions

### Button Color System

| Action Type | Style | Default | Hover |
|-------------|-------|---------|-------|
| Primary/Create | Solid | `bg-blue-600 text-white` | `bg-blue-700` |
| Secondary | Outline | `border-gray-300 text-gray-700` | `bg-gray-50` |
| Destructive | Solid Red | `bg-red-600 text-white` | `bg-red-700` |
| Ghost | Text only | `text-gray-600` | `bg-gray-100` |

**Usage:**
- `+ New Tour`, `Save`, `Publish` → Primary (blue)
- `Cancel`, `Back` → Secondary (outline) or Ghost
- `Delete`, `Archive` → Destructive (red)

### Card Color System

- Tags provide the color identity
- Cards display a **top border/stripe** in the tag color
- Similar to Theme Builder cards
- Default (no tag): subtle gray or no stripe

### Tag Color Palette

8 preset colors:
```
red, orange, yellow, green, blue, purple, pink, gray
```

Stored as string values, rendered with Tailwind classes.

---

## Phase 1: Visual Polish & Quick Wins

### 1.1 Button Styling Overhaul

**Files to update:**
- `app/(dashboard)/g/page.tsx` - Quick Actions buttons
- `app/(dashboard)/g/tours/page.tsx` - New Tour button
- `app/(dashboard)/g/checklists/_components/checklists-list-client.tsx`
- `app/(dashboard)/g/tips/_components/tips-list-client.tsx`
- `app/(dashboard)/g/banners/_components/banners-list-client.tsx`
- `app/(dashboard)/g/themes/_components/themes-list-client.tsx`

**Changes:**
- Replace default black buttons with blue primary style
- Add proper hover transitions
- Consistent sizing and padding

### 1.2 Card Improvements

**Add to all list cards:**
- Top color stripe (based on tag, default gray if none)
- Subtle shadow on hover (`hover:shadow-md`)
- Slight lift effect (`hover:-translate-y-0.5`)
- Transition smoothing (`transition-all duration-200`)

### 1.3 Status Badge Refresh

| Status | Current | New |
|--------|---------|-----|
| Draft | Gray badge | Muted gray, dashed border |
| Live | Green badge | Solid green with subtle pulse animation |
| Archived | Gray badge | Strikethrough or faded style |

---

## Phase 2: Card Management (3-Dot Menu)

### 2.1 Menu Actions

Add dropdown menu to each card (top-right, visible on hover):

```
┌─────────────────┐
│ ✏️  Rename       │
│ 🎨  Change Tag   │
│ ─────────────── │
│ 📋  Duplicate    │
│ 📦  Archive      │
│ ─────────────── │
│ 🗑️  Delete       │  ← Red text
└─────────────────┘
```

**Behaviors:**
- Rename: Inline edit or small dialog
- Change Tag: Dropdown with color swatches
- Duplicate: Creates copy with "(Copy)" suffix
- Archive: Moves to archived status
- Delete: Confirmation dialog required

### 2.2 Components Needed

Create shared component:
```
components/guidely/item-actions-menu.tsx
```

Props:
- `item`: The tour/checklist/tip/banner object
- `type`: 'tour' | 'checklist' | 'tip' | 'banner'
- `onRename`: callback
- `onChangeTag`: callback
- `onDuplicate`: callback
- `onArchive`: callback
- `onDelete`: callback

---

## Phase 3: Table View

### 3.1 View Toggle

Add toggle in toolbar:
```
[Grid icon] [List icon]    Search...    [Status ▾]    [+ New]
```

- Icons: `LayoutGrid` and `List` from lucide-react
- Active state: filled/highlighted icon
- Preference saved to localStorage: `guidely-{feature}-view`

### 3.2 Table Columns

**Tours:**
| Column | Sortable | Width |
|--------|----------|-------|
| Tag (color dot) | Yes | 40px |
| Name | Yes | flex |
| Status | Yes | 100px |
| Views | Yes | 80px |
| Completion % | Yes | 100px |
| Steps | No | 60px |
| Updated | Yes | 120px |
| Actions | No | 60px |

**Checklists:**
| Column | Sortable |
|--------|----------|
| Tag | Yes |
| Name | Yes |
| Status | Yes |
| Items | Yes |
| In Progress | Yes |
| Completed | Yes |
| Updated | Yes |
| Actions | No |

**Smart Tips:**
| Column | Sortable |
|--------|----------|
| Tag | Yes |
| Name | Yes |
| Status | Yes |
| Trigger | Yes |
| Element | No |
| Updated | Yes |
| Actions | No |

**Banners:**
| Column | Sortable |
|--------|----------|
| Tag | Yes |
| Name | Yes |
| Status | Yes |
| Views | Yes |
| Clicks | Yes |
| CTR | Yes |
| Updated | Yes |
| Actions | No |

### 3.3 Mobile Behavior

- User can still choose table view on mobile
- Table uses horizontal scroll
- Does NOT auto-collapse to cards

### 3.4 localStorage Keys

```
guidely-tours-view: 'grid' | 'table'
guidely-checklists-view: 'grid' | 'table'
guidely-tips-view: 'grid' | 'table'
guidely-banners-view: 'grid' | 'table'
```

---

## Phase 4: Tags System

### 4.1 Database Schema

```sql
-- New table for tags
CREATE TABLE guidely_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agency_id, name)
);

-- Add tag reference to existing tables
ALTER TABLE tours ADD COLUMN tag_id UUID REFERENCES guidely_tags(id) ON DELETE SET NULL;
ALTER TABLE checklists ADD COLUMN tag_id UUID REFERENCES guidely_tags(id) ON DELETE SET NULL;
ALTER TABLE smart_tips ADD COLUMN tag_id UUID REFERENCES guidely_tags(id) ON DELETE SET NULL;
ALTER TABLE banners ADD COLUMN tag_id UUID REFERENCES guidely_tags(id) ON DELETE SET NULL;

-- RLS policies
ALTER TABLE guidely_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their agency tags"
ON guidely_tags FOR ALL
USING (agency_id IN (SELECT id FROM agencies WHERE clerk_user_id = auth.jwt()->>'sub'));
```

### 4.2 Tag Scope

- **Global**: One tag library shared across all Guidely features
- **Per-feature filtering**: Can filter by tag within each feature
- **Override**: Future option to hide certain tags per feature (not MVP)

### 4.3 Tag Management UI

**Location 1: Filter dropdown**
- Tags section in existing filter dropdown
- Multi-select checkboxes
- "Manage Tags" link at bottom

**Location 2: Settings page**
- Full tag management (CRUD)
- See all tags, edit names, change colors, delete
- Show usage count per tag

### 4.4 Tag Assignment UI

- In 3-dot menu: "Change Tag" option
- Dropdown with color swatches and tag names
- Option to create new tag inline
- Option to clear tag (remove)

---

## Phase 5: Command Center Dashboard

### 5.1 New Layout for `/g` page

```
┌─────────────────────────────────────────────────────────────────┐
│ Guidely                                      [💬 Feedback]      │
│ Help your customers succeed with guided experiences             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ⚡ Quick Actions                                                │
│ [+ New Tour] [+ New Checklist] [+ New Tip] [+ New Banner]      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ⚠️ Needs Attention                                    [View All] │
│ ┌─────────────────────────┐ ┌─────────────────────────┐        │
│ │ 3 drafts older than     │ │ "Welcome Tour"          │        │
│ │ 7 days                  │ │ 0 views this week       │        │
│ │ [Review Drafts →]       │ │ [Edit Tour →]           │        │
│ └─────────────────────────┘ └─────────────────────────┘        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 📊 This Week                                                    │
│                                                                 │
│ 2,341          156           67%           ↑ 12%               │
│ Total Views    Completions   Avg Rate      vs last week        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🕐 Recent Activity                                              │
│                                                                 │
│ • "Sales Demo Tour" published — 2 hours ago                    │
│ • "Getting Started" checklist viewed 47 times — today          │
│ • New theme "Dark Mode" created — yesterday                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Features                                                        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│ │ Tours    │ │Checklists│ │Smart Tips│ │ Banners  │           │
│ │ 5 live   │ │ 3 live   │ │ 12 live  │ │ 2 live   │           │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                 │
│ ┌────────────────────────┐ ┌────────────────────────┐          │
│ │ Themes                →│ │ Analytics             →│          │
│ └────────────────────────┘ └────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 "Needs Attention" Triggers

- Drafts older than 7 days
- Live items with 0 views in past 7 days
- Items with >20% engagement drop week-over-week
- Archived items older than 30 days (prompt to delete)

### 5.3 Recent Activity Feed

Show last 10 events:
- Item published/unpublished
- Item created
- Milestones ("Tour X hit 100 views!")
- Theme changes

### 5.4 Feedback Link

- Top-right area of header
- Links to external feedback tool (Canny-style)
- Icon + "Feedback" text or just icon with tooltip

---

## Implementation Order

| Phase | Scope | Database Changes |
|-------|-------|------------------|
| 1 | Button styling, card hover effects, status badges | None |
| 2 | 3-dot menu on cards | None (uses existing fields) |
| 3 | Table view + toggle | None (localStorage only) |
| 4 | Tags system | New table + columns |
| 5 | Command center redesign | May need activity log table |

**Recommended approach:** Complete Phases 1-3 first (no migrations), then tackle Phase 4-5.

---

## Files to Create/Modify

### New Components
- `components/guidely/item-actions-menu.tsx` - Shared 3-dot menu
- `components/guidely/view-toggle.tsx` - Grid/Table toggle
- `components/guidely/tag-picker.tsx` - Tag selection dropdown
- `components/guidely/data-table.tsx` - Reusable table component
- `components/guidely/needs-attention-card.tsx` - Alert cards
- `components/guidely/activity-feed.tsx` - Recent activity list

### Modified Files
- `app/(dashboard)/g/page.tsx` - Command center redesign
- `app/(dashboard)/g/tours/_components/tours-list-client.tsx`
- `app/(dashboard)/g/checklists/_components/checklists-list-client.tsx`
- `app/(dashboard)/g/tips/_components/tips-list-client.tsx`
- `app/(dashboard)/g/banners/_components/banners-list-client.tsx`
- All list page server components (to fetch tags)

---

## Success Criteria

- [ ] All primary action buttons are blue with proper hover states
- [ ] Cards have color stripe based on tag
- [ ] 3-dot menu works on all cards (rename, tag, duplicate, archive, delete)
- [ ] Table view available with sortable columns
- [ ] View preference persists in localStorage
- [ ] Tags can be created, assigned, and filtered
- [ ] Command center shows "Needs Attention" items
- [ ] Weekly stats visible on dashboard
- [ ] Feedback link present
