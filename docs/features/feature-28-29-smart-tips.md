# Features 28-29: Smart Tips Builder + Embed

**Status:** Waiting on Left Nav Implementation (Guidely product structure)
**Product Name:** Guidely (DAP product suite)
**Dependencies:** Feature 18 (DAP Schema), Feature 20 (Element Selector), Left Nav restructure
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

### UI Structure (3-Column Layout)

Following the established pattern from Checklists and Banners builders:

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ← Back   [Smart Tip Name]   Draft ●   Saving...   [Settings] [Publish]   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────┬──────────────────────────────────┬─────────────────┐  │
│  │                 │                                  │                 │  │
│  │  TIPS LIST      │  TIP SETTINGS                    │  PREVIEW        │  │
│  │                 │                                  │                 │  │
│  │  ───────────    │  Target Element                  │  ┌───────────┐  │  │
│  │                 │  ┌─────────────────────────┐     │  │           │  │  │
│  │  ● Welcome Tip  │  │ .btn-submit         🎯 │     │  │  [Button] │  │  │
│  │    Hover        │  └─────────────────────────┘     │  │     ↓     │  │  │
│  │                 │                                  │  │ ┌───────┐ │  │  │
│  │  ○ Pro Tip      │  Content                         │  │ │Tooltip│ │  │  │
│  │    Click        │  ┌─────────────────────────┐     │  │ │ text  │ │  │  │
│  │                 │  │ Click here to save      │     │  │ └───────┘ │  │  │
│  │  ○ Form Help    │  │ your changes            │     │  │           │  │  │
│  │    Focus        │  └─────────────────────────┘     │  └───────────┘  │  │
│  │                 │                                  │                 │  │
│  │  [+ Add Tip]    │  Trigger                         │  Position: Auto │  │
│  │                 │  ○ Hover ● Click ○ Focus        │                 │  │
│  │                 │                                  │                 │  │
│  │                 │  Position                        │                 │  │
│  │                 │  [Auto ▼]                        │                 │  │
│  │                 │                                  │                 │  │
│  └─────────────────┴──────────────────────────────────┴─────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Components to Build

| Component | File | Description |
|-----------|------|-------------|
| `smart-tips-builder.tsx` | `tours/tips/[id]/_components/` | Main 3-column layout orchestrator |
| `tips-list-panel.tsx` | `tours/tips/[id]/_components/` | Left panel: list of tips with drag-reorder |
| `tip-settings-panel.tsx` | `tours/tips/[id]/_components/` | Center panel: element target, content, trigger, position |
| `tip-preview.tsx` | `tours/tips/[id]/_components/` | Right panel: interactive preview of tooltip |
| `tip-full-settings.tsx` | `tours/tips/[id]/_components/` | Sheet: targeting, theme, advanced options |

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
  trigger: 'hover' | 'click' | 'focus';
  position: 'top' | 'right' | 'bottom' | 'left' | 'auto';

  // Targeting (same as tours)
  targeting: {
    url_targeting: { mode: 'all' | 'specific'; patterns: UrlPattern[] };
    user_targeting: { type: 'all' | 'new' | 'returning' };
    devices: ('desktop' | 'tablet' | 'mobile')[];
  };

  theme_id: string | null;
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
- Rich text input (supports bold, italic, links)
- Character limit indicator (recommended max 200 chars)
- Preview updates in real-time

**Trigger Section:**
- Radio buttons: Hover | Click | Focus
- Hover: Tooltip appears on mouseover, disappears on mouseout
- Click: Tooltip appears on click, stays until clicked elsewhere
- Focus: Tooltip appears when element receives focus (for form fields)

**Position Section:**
- Dropdown: Auto | Top | Right | Bottom | Left
- Auto is recommended (adapts to viewport)
- Preview shows position in real-time

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

Track the following events:

| Event | When | Data |
|-------|------|------|
| `smart_tip_shown` | Tooltip displayed | tip_id, trigger_type |
| `smart_tip_dismissed` | Tooltip hidden | tip_id, duration_ms |
| `smart_tip_link_clicked` | User clicks link in tooltip | tip_id, link_url |

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

**Note:** Route structure will be finalized after Left Nav implementation. Expected pattern:

```
app/(dashboard)/guidely/          # New Guidely product area (TBD)
├── tips/
│   ├── page.tsx                  # Tips list page
│   └── [id]/
│       ├── page.tsx              # Smart tip builder page
│       └── _components/
│           ├── smart-tips-builder.tsx
│           ├── tips-list-panel.tsx
│           ├── tip-settings-panel.tsx
│           ├── tip-preview.tsx
│           └── tip-full-settings.tsx
├── _actions/
│   └── smart-tip-actions.ts      # Or shared in parent _actions/
└── _lib/
    └── smart-tip-defaults.ts
```

Routes will be provided before implementation begins.

---

## Database

**Table: `smart_tips`** (already exists from Feature 18 migration)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| agency_id | UUID | FK to agencies |
| subaccount_id | UUID | FK to customers (nullable) |
| name | TEXT | Display name |
| status | TEXT | draft/live/archived |
| element | JSONB | { selector, metadata } |
| content | TEXT | Tooltip content |
| trigger | TEXT | hover/click/focus |
| position | TEXT | top/right/bottom/left/auto |
| targeting | JSONB | URL, user, device targeting |
| theme_id | UUID | FK to tour_themes (nullable) |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Updated timestamp |

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
