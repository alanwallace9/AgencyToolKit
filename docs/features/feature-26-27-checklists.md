# Features 26-27: Checklists Builder & Widget

**Status:** ✅ Implemented
**Priority:** High (Next after F25)
**Estimated Sessions:** 2 (Completed in 1)
**Dependencies:** F22 (Tours in Embed), F23 (Tour Themes)
**Blocks:** None
**Completed:** 2026-01-26

---

## Overview

Checklists provide structured onboarding for subaccount users. Unlike tours (which are guided step-by-step), checklists let users complete tasks in any order while tracking progress. They appear as a floating widget that users can expand/collapse.

**Key differentiator:** Outcome-based completion - items verify actions were actually taken (e.g., Google account shows "Connected" status), not just that a button was clicked.

**Reference:** [Usetiful Checklist](https://help.usetiful.com/support/solutions/articles/77000197929-checklist-as-a-part-of-your-user-onboarding)

---

## Design Reference

Based on Usetiful's checklist design:

### Expanded Widget
```
┌─────────────────────────────────────┐
│  Let's get started!              ✕  │  <- Colored header (from theme)
├─────────────────────────────────────┤
│  50%  ████████░░░░░░░░░░░░         │  <- Progress bar with percentage
├─────────────────────────────────────┤
│                                     │
│  ✓  Create your account             │  <- Completed (filled circle + check)
│                                     │
│  ✓  Connect your CRM                │
│      Plug in your CRM and import    │  <- Item description (optional)
│      contacts.                      │
│                                     │
│  ○  Build your campaign             │  <- Incomplete (empty circle)
│      Set a goal, choose your        │
│      audience, and craft the        │
│      perfect message.               │
│                                     │
│  ○  Launch your campaign            │
│      QA and go live to start        │
│      engaging users right away.     │
│                                     │
│         Dismiss onboarding          │  <- Dismiss link
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Get Started             ││  <- CTA button (theme color)
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Minimized State (Manila Folder Tab)
```
                                    ┌──────────────────┐
────────────────────────────────────│  Get started  ▲  │────────────────
                                    └──────────────────┘
                                    ↑
                                    Sticky at bottom, customizable text
                                    Clicking expands the full widget
```

---

## User Stories

1. **As an agency owner**, I want to create onboarding checklists so my customers know what steps to complete.
2. **As an agency owner**, I want checklist items to link to tours or pages so users know how to complete each task.
3. **As an agency owner**, I want to verify actions were taken (not just clicked) before marking items complete.
4. **As an agency owner**, I want to see which customers have completed which checklist items.
5. **As an agency owner**, I want to apply different themes to tours vs checklists from the same theme library.
6. **As a subaccount user**, I want to see my progress and what's left to do.
7. **As a subaccount user**, I want to minimize the checklist to a small tab so it doesn't block my work.

---

## Acceptance Criteria

### Builder
- [x] Checklists list page shows all checklists with status and stats
- [x] Can create checklists with title, description, and items
- [x] Each item has: title, description (optional), action, completion trigger
- [x] Actions: none, launch tour, open URL
- [x] Completion triggers: manual (click), tour-complete, element-exists, url-visited
- [x] Can select theme from existing tour_themes (independent from tours)
- [x] Live preview panel shows widget appearance as you edit

### Widget
- [x] Floating widget appears in embed script
- [x] Colored header with title and close button
- [x] Progress bar with percentage
- [x] Items show completed (checkmark) vs incomplete (circle)
- [x] Item descriptions display below titles
- [x] "Dismiss" link to hide checklist
- [x] CTA button at bottom (customizable text)
- [x] Minimized state: manila folder tab at bottom
- [x] Tab is sticky (stays visible on scroll)
- [x] Tab text is customizable ("Get started", etc.)
- [x] Widget position: bottom-right or bottom-left
- [x] Per-customer progress is tracked and persists

---

## UI Design

### Builder Layout (3-Panel)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Back    Untitled checklist  ⚙ Settings     All changes saved   [PREVIEW]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                          │                            │                      │
│  ITEMS                << │  ITEM SETTINGS          ✕ │   LIVE PREVIEW       │
│  ─────────────────────── │  ────────────────────────  │   ──────────────     │
│                          │                            │                      │
│  ☐ Checklist shows on    │  Title                     │   ┌──────────────┐   │
│    all pages          /  │  ┌────────────────────┐    │   │ Get started ✕│   │
│                          │  │ Welcome Tour       │    │   │ 50% ████░░░░ │   │
│  ○  Welcome Tour      /… │  └────────────────────┘    │   │              │   │
│                          │                            │   │ ✓ Welcome    │   │
│  ● Explore Dashboard  /… │  Description               │   │ ○ Explore    │   │
│     (selected)           │  ┌────────────────────┐    │   │              │   │
│                          │  │ Learn how to use   │    │   │ Dismiss      │   │
│  + ADD ITEM              │  │ the dashboard      │    │   │              │   │
│                          │  └────────────────────┘    │   │ [Get Started]│   │
│                          │                            │   └──────────────┘   │
│                          │  ACTIONS                   │                      │
│                          │  On Click                  │                      │
│                          │  ┌────────────────────┐    │                      │
│                          │  │ Launch Tour      ▼ │    │                      │
│                          │  └────────────────────┘    │                      │
│                          │                            │                      │
│                          │  Select Tour               │                      │
│                          │  ┌────────────────────┐    │                      │
│                          │  │ Dashboard Tour   ▼ │    │                      │
│                          │  └────────────────────┘    │                      │
│                          │                            │                      │
│                          │  STEP COMPLETION           │                      │
│                          │  Mark as done              │                      │
│                          │  ┌────────────────────┐    │                      │
│                          │  │ When tour ends   ▼ │    │                      │
│                          │  └────────────────────┘    │                      │
│                          │                            │                      │
│                          │                [Delete]    │                      │
│                          │                            │                      │
└──────────────────────────┴────────────────────────────┴──────────────────────┘
```

### Settings Panel (Gear Icon)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  CHECKLIST SETTINGS                                                       ✕  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  GENERAL                                                                     │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Internal Name (for your reference)                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Getting Started                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Title (shown in widget header)                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Let's get started!                                                     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  WIDGET                                                                      │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Position                                                                    │
│  ┌─────────────────┐  ┌─────────────────┐                                   │
│  │            [W]  │  │  [W]            │                                   │
│  │   BOTTOM-RIGHT  │  │   BOTTOM-LEFT   │                                   │
│  └────────▲────────┘  └─────────────────┘                                   │
│                                                                              │
│  Minimized Tab Text                                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Get started                                                            │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Default State                                                               │
│  ○ Expanded - Show checklist open                                            │
│  ● Minimized - Show just the tab                                             │
│                                                                              │
│  CTA Button Text                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Get Started                                                            │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  [ ] Hide widget after all items complete                                    │
│  [✓] Show confetti animation on completion                                   │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  THEME                                                                       │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Theme (from Tour Themes)                                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Brand Blue                                                           ▼ │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  TARGETING                                                                   │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Show on pages                                                               │
│  ○ All pages                                                                 │
│  ● Specific pages only                                                       │
│                                                                              │
│  URL Patterns                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ */dashboard*                                                         - │  │
│  │ */settings*                                                          - │  │
│  │ + Add pattern                                                          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Show to customers                                                           │
│  ○ All customers                                                             │
│  ○ Specific customers only                                                   │
│                                                                              │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  ON COMPLETION                                                               │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  When all items are completed:                                               │
│  ○ Nothing - just show as complete                                           │
│  ● Show celebration modal                                                    │
│  ○ Redirect to URL: [________________________]                               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Item Actions & Completion Triggers

**Actions (On Click):**
| Action | Behavior |
|--------|----------|
| Nothing | Informational only, no click action |
| Launch Tour | Starts the selected tour |
| Open URL | Navigates to URL (option: new tab) |

**Completion Triggers (Mark as done):**
| Trigger | When Item Marks Complete |
|---------|--------------------------|
| On click | User clicks the item checkbox |
| When tour ends | Linked tour reaches final step |
| When element exists | CSS selector matches an element on page |

---

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `checklists-client.tsx` | `checklists/_components/` | List page with filters |
| `checklist-card.tsx` | `checklists/_components/` | Individual checklist in list |
| `checklist-builder.tsx` | `checklists/[id]/_components/` | 3-panel builder layout |
| `checklist-items-panel.tsx` | `checklists/[id]/_components/` | Left panel - sortable items |
| `checklist-item-settings.tsx` | `checklists/[id]/_components/` | Center panel - item config |
| `checklist-settings-panel.tsx` | `checklists/[id]/_components/` | Settings modal/sidebar |
| `checklist-preview.tsx` | `checklists/[id]/_components/` | Right panel - live widget preview |

---

## Database

### Table: `checklists`

```sql
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,              -- Internal name
  title TEXT NOT NULL,             -- Shown in widget header
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived')),

  -- Items stored as JSONB array
  items JSONB NOT NULL DEFAULT '[]',
  -- Each item: {
  --   id: string,
  --   order: number,
  --   title: string,
  --   description?: string,
  --   action: { type: 'none' | 'tour' | 'url', tour_id?: string, url?: string, new_tab?: boolean },
  --   completion: { type: 'manual' | 'tour_complete' | 'element_exists', tour_id?: string, selector?: string, url_pattern?: string }
  -- }

  -- Widget settings
  widget JSONB DEFAULT '{
    "position": "bottom-right",
    "default_state": "minimized",
    "minimized_text": "Get started",
    "cta_text": "Get Started",
    "hide_when_complete": false,
    "show_confetti": true
  }',

  -- On completion
  on_complete JSONB DEFAULT '{"type": "celebration"}',
  -- Types: none, celebration, redirect (with url)

  -- Targeting (same structure as tours)
  targeting JSONB DEFAULT '{
    "url_mode": "all",
    "url_patterns": [],
    "customer_mode": "all",
    "customer_ids": []
  }',

  -- Theme (uses same tour_themes table)
  theme_id UUID REFERENCES tour_themes(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checklists_agency_status ON checklists(agency_id, status);
```

### Table: `customer_checklist_progress`

```sql
CREATE TABLE customer_checklist_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,

  -- Progress tracking
  completed_items TEXT[] DEFAULT '{}',  -- Array of item IDs
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'dismissed')),

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(customer_id, checklist_id)
);

CREATE INDEX idx_checklist_progress_customer ON customer_checklist_progress(customer_id);
CREATE INDEX idx_checklist_progress_checklist ON customer_checklist_progress(checklist_id);
```

---

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/checklists` | List checklists |
| POST | `/api/checklists` | Create checklist |
| GET | `/api/checklists/[id]` | Get checklist |
| PATCH | `/api/checklists/[id]` | Update checklist |
| DELETE | `/api/checklists/[id]` | Delete checklist |
| POST | `/api/checklists/[id]/publish` | Set status to live |
| POST | `/api/checklists/[id]/archive` | Archive checklist |
| POST | `/api/checklists/[id]/duplicate` | Duplicate checklist |

### Progress API (for embed script)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/track/checklist-progress` | Update checklist progress (public) |

---

## Embed Script Changes

### Widget Rendering

```javascript
function renderChecklistWidget(checklist, progress, theme) {
  const completedCount = progress.completed_items.length;
  const totalCount = checklist.items.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  const widget = document.createElement('div');
  widget.id = `at-checklist-${checklist.id}`;
  widget.className = `at-checklist-widget at-checklist-${checklist.widget.position}`;

  // Apply theme colors
  widget.style.setProperty('--at-primary', theme.primary_color);
  widget.style.setProperty('--at-text', theme.text_color);

  widget.innerHTML = `
    <!-- Minimized Tab (manila folder style) -->
    <div class="at-checklist-tab" onclick="expandChecklist('${checklist.id}')">
      <span>${checklist.widget.minimized_text}</span>
      <span class="at-tab-arrow">▲</span>
    </div>

    <!-- Expanded Widget -->
    <div class="at-checklist-expanded">
      <div class="at-checklist-header">
        <span class="at-checklist-title">${checklist.title}</span>
        <button class="at-checklist-close" onclick="minimizeChecklist('${checklist.id}')">✕</button>
      </div>

      <div class="at-checklist-progress">
        <span class="at-progress-percent">${percent}%</span>
        <div class="at-progress-bar">
          <div class="at-progress-fill" style="width: ${percent}%"></div>
        </div>
      </div>

      <div class="at-checklist-items">
        ${checklist.items.map(item => {
          const isComplete = progress.completed_items.includes(item.id);
          return `
            <div class="at-checklist-item ${isComplete ? 'completed' : ''}"
                 data-item-id="${item.id}"
                 onclick="handleChecklistItemClick('${checklist.id}', '${item.id}')">
              <span class="at-item-checkbox">
                ${isComplete ? '✓' : '○'}
              </span>
              <div class="at-item-content">
                <span class="at-item-title">${item.title}</span>
                ${item.description ? `<span class="at-item-desc">${item.description}</span>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="at-checklist-footer">
        <a class="at-dismiss-link" onclick="dismissChecklist('${checklist.id}')">
          Dismiss onboarding
        </a>
        <button class="at-checklist-cta" onclick="handleChecklistCTA('${checklist.id}')">
          ${checklist.widget.cta_text}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(widget);

  // Set initial state
  if (checklist.widget.default_state === 'minimized') {
    minimizeChecklist(checklist.id);
  }
}
```

### CSS for Manila Folder Tab

```css
.at-checklist-tab {
  position: fixed;
  bottom: 0;
  right: 20px;
  background: var(--at-primary);
  color: white;
  padding: 8px 16px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  z-index: 9999;
}

.at-checklist-tab:hover {
  transform: translateY(-2px);
}

.at-checklist-widget.minimized .at-checklist-expanded {
  display: none;
}

.at-checklist-widget.minimized .at-checklist-tab {
  display: flex;
}

.at-checklist-widget:not(.minimized) .at-checklist-tab {
  display: none;
}
```

---

## Implementation Order

1. **Database migration** - Create `checklists` and `customer_checklist_progress` tables
2. **API routes** - CRUD for checklists, progress tracking endpoint
3. **List page** - `/checklists` with cards, status filter, create dialog
4. **Builder layout** - 3-panel design with items list, settings, preview
5. **Items panel** - Sortable items list with add/delete
6. **Item settings** - Action and completion trigger configuration
7. **Settings panel** - Title, widget config, targeting, theme selection
8. **Preview panel** - Live widget preview with theme applied
9. **Embed script - Widget** - Full widget with expand/minimize
10. **Embed script - Completion triggers** - Manual, tour-complete, element-exists
11. **Progress API** - Track per-customer progress
12. **Customer detail page** - Show checklist progress alongside tour progress

---

## Themes Integration

Checklists use the same `tour_themes` table as tours, but can independently select which theme to apply:

- Tours page has "Theme" dropdown selecting from `tour_themes`
- Checklists page has "Theme" dropdown selecting from same `tour_themes`
- A tour can use "Brand Blue" theme while a checklist uses "Sunset Orange"
- Theme defines: primary color, text color, background, button styles, shadows

---

## Out of Scope (Future)

- Checklist item dependencies (item B requires item A)
- Multiple checklists shown simultaneously
- Checklist item deadlines/due dates
- Gamification (points, badges)
- Conditional items (show item B only if condition met)
- Horizontal progress steps (like a wizard)

---

## Testing Checklist

### Builder
- [ ] Create checklist with items
- [ ] Drag to reorder items
- [ ] Add item description
- [ ] Set action to launch tour - verify it launches
- [ ] Set action to open URL - verify navigation
- [ ] Set completion to "on click" - verify checkbox works
- [ ] Set completion to "tour ends" - verify tour completion marks item done
- [ ] Set completion to "element exists" - verify detection
- [ ] Select theme - preview updates
- [ ] Save and reload - all settings persist

### Widget
- [ ] Widget renders at correct position
- [ ] Colored header matches theme
- [ ] Progress bar shows correct percentage
- [ ] Completed items show checkmark
- [ ] Incomplete items show empty circle
- [ ] Item descriptions display correctly
- [ ] Clicking item triggers action
- [ ] Minimize collapses to manila tab
- [ ] Tab stays visible on scroll
- [ ] Expand from tab works
- [ ] Dismiss hides widget
- [ ] Confetti on 100% completion
- [ ] Progress persists across page loads

### Progress Tracking
- [ ] Progress shows in customer detail page
- [ ] Filter customers by checklist status
- [ ] Stats show on checklist cards (started, completed)

---

## Implementation Notes (2026-01-26)

### What Was Built

Full checklist system with builder UI and embed widget, completed in a single session.

### Database Tables Created

1. **`checklists`** - Main checklist table
   - JSONB fields: items, widget, on_complete, targeting
   - References tour_themes for styling
   - RLS policies for agency isolation

2. **`customer_checklist_progress`** - Per-customer progress tracking
   - Tracks completed_items array, status, timestamps
   - Unique constraint on (customer_id, checklist_id)

### Files Created

| File | Purpose |
|------|---------|
| `tours/_actions/checklist-actions.ts` | Server actions for CRUD + stats |
| `tours/_components/checklists-card.tsx` | Card on tours page with create dialog |
| `tours/checklists/[id]/page.tsx` | Builder page |
| `tours/checklists/[id]/_components/checklist-builder.tsx` | Main 3-panel builder |
| `tours/checklists/[id]/_components/checklist-items-panel.tsx` | Sortable items list |
| `tours/checklists/[id]/_components/checklist-item-settings.tsx` | Item configuration |
| `tours/checklists/[id]/_components/checklist-settings-panel.tsx` | Settings sheet |
| `tours/checklists/[id]/_components/checklist-preview.tsx` | Live widget preview |
| `api/track/checklist-progress/route.ts` | Public progress tracking API |

### Files Modified

| File | Changes |
|------|---------|
| `types/database.ts` | Added checklist interfaces |
| `tours/_components/tours-client.tsx` | Added ChecklistsCard integration |
| `tours/page.tsx` | Added checklists data fetching |
| `api/config/route.ts` | Added checklists to config response |
| `embed.js/route.ts` | Added full checklist widget rendering |

### Key Implementation Details

1. **Builder Pattern**: Same 3-panel layout as tour builder (items, settings, preview)
2. **Drag-Drop**: Uses @dnd-kit/sortable for item reordering
3. **Auto-Save**: Debounced save with "All changes saved" indicator
4. **Widget Rendering**: Full HTML/CSS generated in embed script (~500 lines)
5. **Progress Tracking**: localStorage for client-side, database for server-side
6. **Confetti**: Loads canvas-confetti dynamically on completion
7. **Templates**: "Getting Started" system template included

### Completion Triggers Implemented

- `manual` - User clicks the checkbox
- `tour_complete` - Linked tour finishes
- `element_exists` - CSS selector matches element on page
- `url_visited` - User visits a specific URL pattern

### Deviations from Spec

- Added `url_visited` completion trigger (user requested)
- Checklist builder placed under `/tours/checklists/[id]` instead of separate `/checklists` route
- ChecklistsCard integrated into existing ToursClient component

### Quick Wins Implemented

- Estimated time display in settings panel
- "Getting Started" default template
- Interactive preview with click-to-complete
- Status badges (Live/Draft/Archived)
- Duplicate checklist action
