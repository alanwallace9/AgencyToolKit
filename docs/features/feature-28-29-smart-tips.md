# Features 28-29: Smart Tips Builder + Embed

**Status:** Complete (Ready for Testing)
**Product Name:** Guidely (DAP product suite)
**Dependencies:** Feature 18 (DAP Schema), Feature 20 (Element Selector)
**Left Nav:** Complete - routes at `/g/tips/`

---

## Implementation Progress

### Phase 1: Data Layer ✅ COMPLETE
- [x] 1.1 Create `smart-tip-actions.ts` server actions
- [x] 1.2 Created `smart_tips` table (migration applied)
- [x] 1.3 SmartTip types already exist in database.ts

### Phase 2: List Page ✅ COMPLETE
- [x] 2.1 Create `/g/tips/page.tsx` (server component)
- [x] 2.2 Create `/g/tips/_components/tips-list-client.tsx`
- [x] 2.3 Update Guidely sidebar (remove "Coming Soon")
- [x] 2.4 Update Guidely dashboard card (stats + quick action)

### Phase 3: Builder Page ✅ COMPLETE
- [x] 3.1 Create `/g/tips/[id]/page.tsx` (wrapper)
- [x] 3.2 Create `smart-tips-builder.tsx` (main layout with drag-and-drop)
- [x] 3.3 ~~Create `tips-list-panel.tsx`~~ (deferred - single tip per page)
- [x] 3.4 Create `tip-settings-panel.tsx` (settings form with beacon config)
- [x] 3.5 Create `tip-preview.tsx` (live preview with interactions & beacon)
- [x] 3.6 Create `tip-global-settings.tsx` (sheet for targeting/theme)

### Phase 4: Embed Script ✅ COMPLETE
- [x] 4.1 Update `/api/config` to include smart_tips
- [x] 4.2 Add tooltip rendering to embed.js
- [x] 4.3 Add hover/click/focus/delay trigger handlers
- [x] 4.4 Add positioning logic (auto/top/right/bottom/left)
- [x] 4.5 Add beacon rendering with pulse animation

### Phase 5: Polish & Test ✅ COMPLETE
- [x] 5.1 ~~Add redirect in next.config.ts~~ (not needed - new feature, no legacy URLs)
- [x] 5.2 Navigation: `/g/tips` list, `/g/tips/[id]` builder
- [x] 5.3 `pnpm build` passes
- [ ] 5.4 Manual testing in GHL (user to verify)

### Phase 6: Enhancements ✅ COMPLETE (Session 2)
- [x] 6.1 Drag-and-drop reordering for tips list
- [x] 6.2 Adjustable tooltip size (small/medium/large)
- [x] 6.3 Time delay trigger (show after X seconds)
- [x] 6.4 Smart beacons (pulsing dot, question mark, info icon)
- [x] 6.5 Beacon position and offset configuration
- [x] 6.6 Preview shows beacon when enabled

**Related:** Features 26-27 (Checklists), Features 30-31 (Banners)

---

## Overview

Smart Tips are contextual tooltips that appear when users hover, click, or focus on specific elements in GHL. Unlike tours (which guide users through a sequence), Smart Tips provide in-context help exactly where it's needed.

**Use Cases:**
- Explain what a button does before clicking
- Provide tips on form fields
- Highlight new or underused features
- Offer keyboard shortcuts or pro tips
- Show warning messages on destructive actions

---

## Feature 28: Smart Tips Builder

### UI Structure (Expandable Settings Panel)

**Inspired by Usetiful's tour builder.** Settings panel slides in when you click the ⚙ gear on a specific tip. When closed, preview expands to fill the space.

```
DEFAULT STATE (no tip selected for editing, preview expanded):
┌────────────────────────────────────────────────────────────────────────────┐
│  ← Back   Smart Tips     ⚙ Settings                    [Saved] [Publish]   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────┬────────────────────────────────────────────────────┐  │
│  │ TIPS            │                                                    │  │
│  │ ─────           │                                                    │  │
│  │                 │           ┌─────────────────────────┐              │  │
│  │ ⋮⋮ Welcome Tip ⚙│           │                         │              │  │
│  │    Hover        │           │      [  Button  ]       │              │  │
│  │                 │           │           ↓             │              │  │
│  │ ⋮⋮ Pro Tip    ⚙│           │     ┌───────────┐       │              │  │
│  │    Click        │           │     │ Click to  │       │              │  │
│  │                 │           │     │ save...   │       │              │  │
│  │ ⋮⋮ Form Help  ⚙│           │     └───────────┘       │              │  │
│  │    Focus        │           │                         │              │  │
│  │                 │           └─────────────────────────┘              │  │
│  │                 │                                                    │  │
│  │ + Add Tip ▼     │                    PREVIEW                         │  │
│  │                 │                                                    │  │
│  └─────────────────┴────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘

CLICK ⚙ ON "WELCOME TIP" → SETTINGS PANEL FOR THAT TIP SLIDES IN:
┌────────────────────────────────────────────────────────────────────────────┐
│  ← Back   Smart Tips     ⚙ Settings                    [Saved] [Publish]   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────┬──────────────────────────┬─────────────────────────┐  │
│  │ TIPS            │ TIP SETTINGS          ✕  │       PREVIEW           │  │
│  │ ─────           │ ──────────────           │                         │  │
│  │                 │                          │                         │  │
│  │ ⋮⋮ Welcome Tip ⚙│ Name                     │  ┌─────────────────┐    │  │
│  │    Hover    [●] │ ┌──────────────────┐     │  │                 │    │  │
│  │                 │ │ Welcome Tip      │     │  │   [Button]      │    │  │
│  │ ⋮⋮ Pro Tip    ⚙│ └──────────────────┘     │  │       ↓         │    │  │
│  │    Click        │                          │  │  ┌─────────┐    │    │  │
│  │                 │ Target Element           │  │  │ Click   │    │    │  │
│  │ ⋮⋮ Form Help  ⚙│ ┌──────────────────┐     │  │  │ to save │    │    │  │
│  │    Focus        │ │ .btn-submit   🎯 │     │  │  └─────────┘    │    │  │
│  │                 │ └──────────────────┘     │  │                 │    │  │
│  │ + Add Tip ▼     │                          │  └─────────────────┘    │  │
│  │                 │ Content (142/200)        │                         │  │
│  │                 │ ┌──────────────────┐     │                         │  │
│  │                 │ │ Click here to    │     │                         │  │
│  │                 │ │ save your work   │     │                         │  │
│  │                 │ └──────────────────┘     │                         │  │
│  │                 │ [+ Add Link]             │                         │  │
│  │                 │                          │                         │  │
│  │                 │ Trigger                  │                         │  │
│  │                 │ ○ Hover ● Click ○ Focus │                         │  │
│  │                 │                          │                         │  │
│  │                 │ Position                 │                         │  │
│  │                 │ [Auto ▼]                 │                         │  │
│  └─────────────────┴──────────────────────────┴─────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘

SIMPLE "+ Add Tip" BUTTON (v1 - no dropdown, just creates blank tip)

Interaction Flow:
1. User sees tips list on left, large preview on right
2. Click ⚙ gear on any tip → that tip's settings slide in from left
3. Settings auto-save as user makes changes
4. Click ✕ or ⚙ again → settings slide out, preview expands back
5. Header "⚙ Settings" opens global settings sheet (targeting, theme)
6. ⋮⋮ = drag handle for reordering tips
```

### Components to Build

| Component | File | Description |
|-----------|------|-------------|
| `smart-tips-builder.tsx` | `tours/tips/[id]/_components/` | Main layout with collapsible settings panel |
| `tips-list-panel.tsx` | `tours/tips/[id]/_components/` | Left panel: tips list with ⚙ gear icons |
| `tip-settings-panel.tsx` | `tours/tips/[id]/_components/` | Collapsible center: element, content, trigger, position |
| `tip-preview.tsx` | `tours/tips/[id]/_components/` | Right panel: expands when settings closed |
| `tip-global-settings.tsx` | `tours/tips/[id]/_components/` | Sheet: targeting rules, theme selection |

### Smart Tip Data Model

```typescript
interface SmartTip {
  id: string;
  agency_id: string;
  subaccount_id: string | null;
  name: string;
  status: 'draft' | 'live' | 'archived';

  // Target element (from visual selector)
  element: {
    selector: string;
    metadata?: {
      tagName: string;
      text: string;
      attributes: Record<string, string>;
      parentSelector?: string;
    };
  };

  // Content
  content: string;  // Plain text or simple markdown

  // Behavior
  trigger: 'hover' | 'click' | 'focus' | 'delay';
  delay_seconds?: number;  // Used when trigger is 'delay'
  position: 'top' | 'right' | 'bottom' | 'left' | 'auto';
  size?: 'small' | 'medium' | 'large';  // Tooltip width (200/280/360px)

  // Beacon indicator (visual attention grabber)
  beacon?: {
    enabled: boolean;
    style: 'pulse' | 'question' | 'info';  // Pulsing dot, ?, or !
    position: 'top' | 'right' | 'bottom' | 'left';
    offset_x: number;
    offset_y: number;
    size: number;  // Beacon size in pixels (12-40px range)
    target: 'element' | 'beacon';  // What triggers the tooltip
  };

  // Targeting (same as tours)
  targeting: {
    url_targeting: { mode: 'all' | 'specific'; patterns: UrlPattern[] };
    user_targeting: { type: 'all' | 'new' | 'returning' };
    devices: ('desktop' | 'tablet' | 'mobile')[];
  };

  theme_id: string | null;
  sort_order?: number;  // For drag-and-drop ordering
  created_at: string;
  updated_at: string;
}
```

### Left Panel: Tips List

- Sortable list of all tips in this group (drag-and-drop reorder)
- Each tip shows: name, trigger icon, status indicator
- Click to select and edit in center panel
- "Add Tip" button at bottom
- Visual feedback for selected tip

### Center Panel: Tip Settings

**Target Element Section:**
- Element selector input with "🎯 Select" button
- Shows selector path and element name from metadata
- "Fragile selector" warning badge if path-based
- Link to open GHL in builder mode

**Content Section:**
- Plain text input with link support (no bold/italic for v1)
- "Add Link" button to insert `[text](url)` format links
- Character counter showing current/max (e.g., "142/200")
- Use case: Link to Loom videos, help docs, courses for detailed explanations
- Preview updates in real-time

**Trigger Section:**
- Radio buttons: Hover | Click | Focus | Time Delay
- Hover: Tooltip appears on mouseover, disappears on mouseout
- Click: Tooltip appears on click, stays until clicked elsewhere
- Focus: Tooltip appears when element receives focus (for form fields)
- Time Delay: Tooltip appears after X seconds on page (configurable 1-60s)

**Size Section:**
- Dropdown: Small | Medium | Large
- Small: 200px wide
- Medium: 280px wide (default)
- Large: 360px wide

**Position Section:**
- Dropdown: Auto | Top | Right | Bottom | Left
- Auto is recommended (adapts to viewport)
- Preview shows position in real-time

**Beacon Section:**
- Toggle to enable/disable beacon indicator
- Style options: Pulsing Dot, Question Mark (?), Info Icon (!)
- Size slider: Adjustable 12-40px to fit different elements
- Position: Top | Right | Bottom | Left of target element
- Fine-tune offsets: Horizontal and Vertical pixel adjustments
- **Tooltip Target**: Choose whether tooltip appears on Element or Beacon interaction
- Beacon draws attention to the element before user interacts

### Right Panel: Preview

- Interactive mockup showing tooltip in context
- Simulates hover/click/focus behavior
- Shows position relative to mock element
- Applies theme styling
- Toggle to show different positions

### Settings Sheet (Advanced)

Accessed via "Settings" button in header:

**Targeting Tab:**
- URL patterns (same as tours/checklists)
- Device targeting (desktop/tablet/mobile)
- User targeting (all/new/returning)

**Appearance Tab:**
- Theme selector dropdown
- Custom styling overrides (if no theme)

**Advanced Tab:**
- Delay before showing (ms)
- Auto-dismiss after (seconds, 0 = never)
- Show once or always

---

## Feature 29: Smart Tips Embed

### Embed Script Additions

Add to `embed.js`:

1. **Fetch smart tips** from `/api/config` response
2. **Initialize tip handlers** for each live tip
3. **Apply trigger listeners** (hover/click/focus)
4. **Render tooltip component** with theme styling
5. **Track impressions** (tip shown) and interactions (link clicked)

### Tooltip Rendering

```javascript
function showSmartTip(tip, element) {
  // 1. Create tooltip container
  const tooltip = document.createElement('div');
  tooltip.className = 'at-smart-tip';
  tooltip.innerHTML = tip.content;

  // 2. Apply theme styling
  applyTipTheme(tooltip, tip.theme);

  // 3. Calculate position
  const position = calculatePosition(element, tip.position);
  positionTooltip(tooltip, position);

  // 4. Add arrow pointing to element
  addArrow(tooltip, position.placement);

  // 5. Append to body
  document.body.appendChild(tooltip);

  // 6. Track impression
  trackAnalytics('smart_tip_shown', tip.id);

  return tooltip;
}
```

### Trigger Handlers

**Hover:**
```javascript
element.addEventListener('mouseenter', () => showTip(tip));
element.addEventListener('mouseleave', () => hideTip(tip));
```

**Click:**
```javascript
element.addEventListener('click', (e) => {
  if (!tip.visible) {
    showTip(tip);
  } else {
    hideTip(tip);
  }
});
// Click outside to dismiss
document.addEventListener('click', outsideClickHandler);
```

**Focus:**
```javascript
element.addEventListener('focus', () => showTip(tip));
element.addEventListener('blur', () => hideTip(tip));
```

### Positioning Algorithm

```javascript
function calculatePosition(element, preferred) {
  const rect = element.getBoundingClientRect();
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  // If auto, find best position
  if (preferred === 'auto') {
    // Prefer bottom, then top, then right, then left
    const spaceBelow = viewport.height - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = viewport.width - rect.right;
    const spaceLeft = rect.left;

    if (spaceBelow >= 100) return 'bottom';
    if (spaceAbove >= 100) return 'top';
    if (spaceRight >= 200) return 'right';
    if (spaceLeft >= 200) return 'left';
    return 'bottom'; // fallback
  }

  return preferred;
}
```

### Tooltip Styling

```css
.at-smart-tip {
  position: fixed;
  z-index: 999999;
  max-width: 280px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  background: var(--tip-bg, #1a1a1a);
  color: var(--tip-text, #ffffff);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  animation: at-tip-fade-in 0.15s ease-out;
}

.at-smart-tip-arrow {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--tip-bg, #1a1a1a);
  transform: rotate(45deg);
}

@keyframes at-tip-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Analytics Tracking

**Deferred to Phase 3 Backlog** - Will implement in a later analytics sprint.

Planned events to track:

| Event | When | Data |
|-------|------|------|
| `smart_tip_shown` | Tooltip displayed | tip_id, trigger_type |
| `smart_tip_dismissed` | Tooltip hidden | tip_id, duration_ms |
| `smart_tip_link_clicked` | User clicks link in tooltip | tip_id, link_url |

See `docs/features/phase-3-backlog.md` for tracking.

---

## API Routes

### GET /api/smart-tips
List all smart tips for agency (with filters)

### POST /api/smart-tips
Create new smart tip

### GET /api/smart-tips/[id]
Get single smart tip

### PATCH /api/smart-tips/[id]
Update smart tip

### DELETE /api/smart-tips/[id]
Delete smart tip

### POST /api/smart-tips/[id]/publish
Set status to 'live'

### POST /api/smart-tips/[id]/unpublish
Set status to 'draft'

### POST /api/smart-tips/[id]/archive
Set status to 'archived'

### POST /api/smart-tips/[id]/duplicate
Clone smart tip

---

## Server Actions

```typescript
// tours/_actions/smart-tip-actions.ts

export async function getSmartTips(filters?: SmartTipFilters): Promise<SmartTip[]>
export async function getSmartTip(id: string): Promise<SmartTip>
export async function createSmartTip(data: CreateSmartTipInput): Promise<SmartTip>
export async function updateSmartTip(id: string, data: UpdateSmartTipInput): Promise<SmartTip>
export async function deleteSmartTip(id: string): Promise<void>
export async function publishSmartTip(id: string): Promise<SmartTip>
export async function unpublishSmartTip(id: string): Promise<SmartTip>
export async function archiveSmartTip(id: string): Promise<SmartTip>
export async function duplicateSmartTip(id: string): Promise<SmartTip>
```

---

## Testing Checklist

### Feature 28: Builder
- [ ] Create new smart tip
- [ ] Edit tip name (inline, auto-save)
- [ ] Select element via builder mode
- [ ] Set content with rich text
- [ ] Toggle trigger type (hover/click/focus)
- [ ] Change position (auto/top/right/bottom/left)
- [ ] Preview updates in real-time
- [ ] Set URL targeting patterns
- [ ] Set device targeting
- [ ] Apply theme
- [ ] Publish/unpublish tip
- [ ] Duplicate tip
- [ ] Delete tip
- [ ] Archive tip

### Feature 29: Embed
- [ ] Tips load from /api/config
- [ ] Hover trigger shows/hides tooltip
- [ ] Click trigger toggles tooltip
- [ ] Focus trigger shows on focus, hides on blur
- [ ] Auto position adapts to viewport
- [ ] Specified position respected
- [ ] Theme styling applied
- [ ] Arrow points to element
- [ ] Analytics events fire
- [ ] Multiple tips can coexist
- [ ] Tips respect URL targeting
- [ ] Tips respect device targeting

---

## File Structure

**Actual implementation (routes at `/g/tips/`):**

```
app/(dashboard)/g/tips/
├── page.tsx                       # Tips list page (server component)
├── _components/
│   └── tips-list-client.tsx       # Client list with filters, create dialog
└── [id]/
    ├── page.tsx                   # Smart tip builder page (server wrapper)
    └── _components/
        ├── smart-tips-builder.tsx # Main 3-column layout with drag-and-drop
        ├── tip-settings-panel.tsx # Settings form with beacon config
        ├── tip-preview.tsx        # Live preview with beacon rendering
        └── tip-global-settings.tsx # Sheet for targeting/theme

app/(dashboard)/tours/_actions/
└── smart-tip-actions.ts           # All server actions (CRUD, status, reorder)
```

---

## Database

**Table: `smart_tips`** (Feature 18 migration + Phase 6 enhancements)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| agency_id | UUID | FK to agencies |
| subaccount_id | UUID | FK to customers (nullable) |
| name | TEXT | Display name |
| status | TEXT | draft/live/archived |
| element | JSONB | { selector, metadata } |
| content | TEXT | Tooltip content |
| trigger | TEXT | hover/click/focus/delay |
| delay_seconds | INTEGER | Seconds to wait for delay trigger (default 3) |
| size | TEXT | small/medium/large (default medium) |
| beacon | JSONB | { enabled, style, position, offset_x, offset_y, size, target } |
| position | TEXT | top/right/bottom/left/auto |
| targeting | JSONB | URL, user, device targeting |
| theme_id | UUID | FK to tour_themes (nullable) |
| sort_order | INTEGER | For drag-and-drop ordering |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Updated timestamp |

### Database Migrations Applied

1. **Feature 18** - Initial `smart_tips` table creation
2. **add_smart_tips_sort_order** - Added `sort_order` column for drag-and-drop
3. **add_smart_tips_delay_and_size** - Added `delay_seconds` and `size` columns
4. **add_delay_trigger_and_beacon** - Updated trigger CHECK constraint, added `beacon` column

---

## Code Reuse from Tours Module

**The element selector (Feature 20) is fully reusable - no rebuilding needed.**

| Component | Location | Reusability |
|-----------|----------|-------------|
| `ElementSelectorField` | `tours/[id]/_components/element-selector-field.tsx` | ✅ Import directly |
| `useElementSelector` | `tours/[id]/_hooks/use-element-selector.ts` | ✅ Import directly |
| Builder Mode | `embed.js` | ✅ Already works |
| Targeting UI patterns | `banner-full-settings.tsx`, `checklist-settings-panel.tsx` | ✅ Copy pattern |
| Theme selector | `banner-settings-panel.tsx` | ✅ Copy pattern |
| 3-column layout | `banner-builder.tsx`, `checklist-builder.tsx` | ✅ Copy structure |
| Server actions | `banner-actions.ts` | ✅ Follow pattern |
| Status badges | `banner-builder.tsx` | ✅ Reuse component |
| Auto-save pattern | `banner-builder.tsx` | ✅ Copy pattern |

### Import Strategy

```typescript
// Reuse element selector from tours module
import { ElementSelectorField } from '@/app/(dashboard)/tours/[id]/_components/element-selector-field';
import { useElementSelector } from '@/app/(dashboard)/tours/[id]/_hooks/use-element-selector';
```

---

## Notes

### Why Smart Tips vs Tour Steps?

| Feature | Tour Steps | Smart Tips |
|---------|------------|------------|
| Sequential | Yes (step 1, 2, 3...) | No (independent) |
| User initiates | Sometimes | Always (hover/click/focus) |
| Completion tracking | Per step | Just impressions |
| Best for | Guided workflows | Contextual help |

### Accessibility Considerations

- Tooltips should be keyboard-accessible (focus trigger)
- ARIA attributes: `role="tooltip"`, `aria-describedby`
- Escape key should dismiss click-triggered tooltips
- Sufficient color contrast (meets WCAG AA)

---

## Quick Wins

| Suggestion | Why It Helps | Effort |
|------------|--------------|--------|
| **"Try me" button** in preview | Users can trigger the actual tooltip animation | Low |
| **Character counter** | Shows "142/200" to keep tips concise | Low |
| **Position preview toggle** | Cycle through all 5 positions to see how it looks | Low |
| **Keyboard shortcut hint template** | "Press ⌘S to save" style power-user tips | Low |
| **Copy tip** | Duplicate a tip and change just the targeting | Low |

### v1 Templates (Review Management Focus)

Simple starter templates for review management agencies:
- **Blank Tip** - Empty, user fills everything
- **Button Explainer** - "Click here to..." for any button
- **Form Field Help** - For input fields, focus trigger

*Note: More templates (calendar, funnels, workflows) deferred to future versions.*

---

## Implementation Notes (Session 2)

### What Was Added

**1. Drag-and-Drop Reordering**
- Uses `@dnd-kit/core` and `@dnd-kit/sortable` for smooth drag interactions
- Added `sort_order` column to database
- `reorderSmartTips` server action persists order
- Grip handle icon on each tip in the list

**2. Time Delay Trigger**
- New trigger option: "Time Delay"
- Configurable delay: 1-60 seconds
- Embed script uses `setTimeout` to show tooltip after page load
- Updated database CHECK constraint to allow 'delay' trigger

**3. Adjustable Tooltip Size**
- Three size options: Small (200px), Medium (280px), Large (360px)
- Applied to both preview and embed script
- Size persisted in database

**4. Smart Beacons** (Inspired by Usetiful)
- Visual indicators to draw attention to elements
- Three styles:
  - **Pulse**: Animated pulsing dot (default)
  - **Question**: Question mark icon (?)
  - **Info**: Exclamation/info icon (!)
- **Adjustable size**: Slider from 12-40px to fit different elements
- Position options: Top, Right, Bottom, Left of target element
- Fine-tune with X/Y offset values
- Beacon uses theme primary color
- Pulse animation via CSS `@keyframes`
- Beacon section moved above Target Element selector in settings panel

**5. Beacon Target Mode**
- Choose what triggers the tooltip: Element or Beacon
- **Element mode** (default): Interacting with the target element shows the tooltip
- **Beacon mode**: Only interacting with the beacon shows the tooltip
- When beacon mode is enabled, tooltip positions itself relative to the beacon
- Useful when you want the beacon to be the sole interaction point

### Key Files Modified

| File | Changes |
|------|---------|
| `types/database.ts` | Added `SmartTipSize`, `SmartTipBeaconStyle`, `SmartTipBeaconPosition`, `SmartTipBeaconTarget`, `SmartTipBeacon`, updated `SmartTip` interface |
| `tip-settings-panel.tsx` | Added beacon config UI (style, size slider, position, offsets, target mode), tooltip size selector, delay seconds input |
| `tip-preview.tsx` | Added beacon rendering with configurable size, target mode support, updates hint text based on target |
| `smart-tips-builder.tsx` | Added `@dnd-kit` drag-and-drop for tips list |
| `tips-list-client.tsx` | Added delay trigger icon |
| `smart-tip-actions.ts` | Added `reorderSmartTips` action |
| `embed.js/route.ts` | Added beacon rendering with configurable size, delay trigger, beacon target mode, tooltip positioning relative to beacon or element |

### Embed Script Beacon Styles

```css
.at-smart-tip-beacon {
  position: absolute;
  border-radius: 50%;
  cursor: pointer;
  z-index: 999998;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes at-beacon-pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 currentColor; }
  50% { transform: scale(1.1); box-shadow: 0 0 0 8px transparent; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 transparent; }
}
```

### User Feedback Incorporated
- "Select Element" vs "Re-select Element" based on whether selector exists
- Tooltip width fixed (was too skinny)
- Drag-and-drop for organizing tips (user use case: sequential form field hints)
- Size control for different content lengths
- Time delay for passive onboarding without user interaction
- Beacons for visual attention-grabbing (Usetiful-inspired)
- **Beacon size slider** (12-40px) to fit nicely on different elements
- **Beacon target mode**: Choose whether tooltip triggers on element or beacon interaction
- **Removed position dropdown from preview** - Preview now uses settings directly

---

## Session 3 Fixes (Completed)

### ✅ Bug Fix: Tooltip Position in Beacon Target Mode
**Issue**: Tooltip anchored to wrong position when switching target modes.

**Solution**: Moved tooltip rendering INSIDE the beacon container when beacon is the target. This makes the tooltip position relative to the beacon naturally, using the same `getTooltipStyles()` logic. Removed the buggy `getBeaconAbsolutePosition()` function.

**Files Changed**: `tip-preview.tsx`

### ✅ UX: Replaced Cards with Dropdown
**Before**: Two large card buttons for Element/Beacon selection.

**After**: Compact Select dropdown with three options:
- **Automatic** - Uses beacon if enabled, else element (default when beacon enabled)
- **Element** - Target element triggers tip
- **Beacon** - Beacon triggers tip

**Files Changed**: `tip-settings-panel.tsx`, `types/database.ts` (added 'automatic' to SmartTipBeaconTarget)

### ✅ Default Behavior: Auto-switch to Automatic
When beacon is toggled ON, target automatically switches from 'element' to 'automatic'.

**Files Changed**: `tip-settings-panel.tsx` (handleBeaconChange function)

### ✅ Embed Script Updated
Updated embed.js to handle 'automatic' target - uses beacon if enabled, else element.

**Files Changed**: `embed.js/route.ts` (two locations handling isBeaconTarget)
