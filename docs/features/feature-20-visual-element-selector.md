# Feature 20: Visual Element Selector (Element Picker)

**Status:** Ready for Implementation
**Dependencies:** Feature 19 (Tour Builder Basic UI)
**Estimated Complexity:** Medium-High

---

## Overview

A point-and-click element selector that lets agencies visually select DOM elements from GHL pages for tour steps (tooltips, hotspots). Uses a two-stage flow: Navigate first, then activate selection mode.

### Key Differentiator
Unlike competitors requiring Chrome extensions, we leverage the already-injected Agency Toolkit embed script to enable builder mode directly in the browser.

---

## User Flow

### Step-by-Step Flow

1. **User editing tour** → Working on a tooltip/hotspot step in tour editor
2. **Clicks 🎯 button** → Next to "Target Element" field
3. **New tab opens** → Loads their saved GHL white-label domain
4. **Floating toolbar appears** → Draggable toolbar with "Builder Mode: OFF" toggle
5. **User navigates** → Browses GHL normally to find the page with the element
6. **Toggles Builder Mode ON** → Toolbar changes to "Select an element"
7. **Hovers elements** → Blue outline appears on hover
8. **Clicks element** → Click intercepted, element data captured
9. **Data sent back** → Via BroadcastChannel to dashboard
10. **Tab closes** → (If auto-close enabled in settings)
11. **Dashboard updated** → Shows friendly name "Contacts" with selector stored

### Two-Stage Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 1: NAVIGATE (Builder Mode OFF)                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│       ┌───────────────────────────────────────────────────────────┐     │
│ 15px→ │ ⋮⋮ 🔧 Agency Toolkit    [Builder Mode: OFF 🔘── ]    [✕] │     │
│       └───────────────────────────────────────────────────────────┘     │
│         ↑                            20px padding from edges            │
│      drag handle                                                        │
│                                                                         │
│  • User navigates GHL normally                                          │
│  • Clicks work, links work, everything normal                           │
│  • Toolbar is draggable if blocking something                           │
│  • Browse to the page where the target element lives                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

                              │ User toggles ON
                              ▼

┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 2: SELECT (Builder Mode ON)                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│       ┌───────────────────────────────────────────────────────────┐     │
│       │ ⋮⋮ 🎯 Select an element  [Builder Mode: ─────🔘 ON ] [✕] │     │
│       └───────────────────────────────────────────────────────────┘     │
│                                                                         │
│  • Toolbar changes color (light blue/green)                             │
│  • Text changes to "Select an element"                                  │
│  • Clicks are intercepted (preventDefault + stopPropagation)            │
│  • Hover shows blue outline on elements                                 │
│  • User clicks element → captured → sent back                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Click Prevention (How It Works)

When Builder Mode is ON:
1. Click event listener added in **capture phase**: `addEventListener('click', handler, true)`
2. Handler calls `e.preventDefault()` and `e.stopPropagation()` immediately
3. Click is intercepted BEFORE it reaches the button/link
4. Element's selector and metadata captured instead of activating the element

---

## Draggable Floating Toolbar

### Design Specifications

```
     20px margin                                              20px margin
      ↓                                                           ↓
      ┌───────────────────────────────────────────────────────────┐
15px→ │ ⋮⋮ 🔧 Agency Toolkit    [Builder Mode: OFF 🔘── ]    [✕] │
      └───────────────────────────────────────────────────────────┘
         ↑
      drag handle (6 dots grid)
```

### Toolbar Behavior
- **Initial position:** Top center, 20px from sides, 15px from top
- **Draggable:** Via drag handle (dots) - user can reposition anywhere
- **Position memory:** Saves position in localStorage during session
- **Compact design:** Minimal height, doesn't obstruct much
- **Always on top:** High z-index to stay above GHL UI

### Toolbar States

| State | Background | Icon | Text | Toggle |
|-------|------------|------|------|--------|
| Navigate (OFF) | White/light gray | 🔧 | "Agency Toolkit" | OFF position |
| Select (ON) | Light blue gradient | 🎯 | "Select an element" | ON position |

### Toolbar Elements
- **Drag handle:** 6-dot grid on left for repositioning
- **Icon:** Changes based on mode (🔧 vs 🎯)
- **Label:** "Agency Toolkit" or "Select an element"
- **Toggle switch:** Styled ON/OFF toggle for Builder Mode
- **Close button:** [✕] to exit builder mode entirely and close tab

---

## Data Captured on Element Selection

When user clicks an element in Select mode:

```typescript
interface SelectedElementData {
  // Selector (for targeting)
  selector: string;              // e.g., '[data-sidebar-item="sb_contacts"]'

  // Friendly display
  displayName: string;           // e.g., "Contacts" (from element text)
  tagName: string;               // e.g., "a", "button", "div"

  // Context
  pageUrl: string;               // URL where element was selected
  pageTitle: string;             // Page title for reference

  // Metadata for fallback/debugging
  attributes: Record<string, string>;  // All element attributes
  rect: DOMRect;                       // Position/size info

  // Session tracking
  sessionId: string;             // Links back to dashboard request
  timestamp: number;
}
```

### Selector Generation Priority

1. **ID:** `#contact-button` (most stable)
2. **Data attributes:** `[data-sidebar-item="sb_contacts"]` (very stable for GHL)
3. **Unique class:** `.nav-link-contacts` (stable if unique)
4. **Path-based:** `nav > ul > li:nth-child(3) > a` (fragile - show warning)

---

## Database Changes

### Agencies Table Update

Add `ghl_domain` field to store the agency's white-label GHL URL:

```sql
ALTER TABLE agencies
ADD COLUMN ghl_domain TEXT;

COMMENT ON COLUMN agencies.ghl_domain IS 'Agency white-label GHL domain (e.g., https://app.youragency.com)';
```

### Settings Fields to Add

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `ghl_domain` | TEXT | White-label GHL domain | `https://app.youragency.com` |
| `builder_auto_close` | BOOLEAN | Auto-close tab after selection | `true` |

---

## Key Deliverables

### Dashboard Components

| Component | Location | Description |
|-----------|----------|-------------|
| `element-selector-field.tsx` | `tours/[id]/_components/` | Input + 🎯 button that triggers selection flow |
| `use-element-selector.ts` | `tours/[id]/_hooks/` | Hook managing session, BroadcastChannel, state |
| GHL Domain field | `settings/page.tsx` | Input for white-label domain |
| Auto-close toggle | `settings/page.tsx` | Toggle for builder auto-close behavior |

### Embed Script Updates

| Function | Description |
|----------|-------------|
| `detectBuilderMode()` | Check URL for `at_builder_mode` param |
| `createBuilderToolbar()` | Render the draggable floating toolbar |
| `initDragBehavior()` | Make toolbar draggable, save position |
| `activateSelectionMode()` | Enable click interception and hover highlighting |
| `generateSelector()` | Create reliable CSS selector from element |
| `captureElementData()` | Gather all element metadata |
| `sendToParent()` | BroadcastChannel + localStorage communication |

### Utilities

| Utility | Description |
|---------|-------------|
| `generateSelector(element)` | Creates selector prioritizing ID → data-attr → class → path |
| `getDisplayName(element)` | Extracts friendly name from element text/aria-label |
| `isFragileSelector(selector)` | Returns true if path-based (for warning badge) |

---

## Settings Page Updates

### New Section: "GHL Integration"

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GHL Integration                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  White-Label Domain                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ https://app.youragency.com                                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  Your GHL white-label domain. Used when selecting elements for tours.  │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  Builder Settings                                                       │
│                                                                         │
│  [✓] Auto-close tab after element selection                            │
│      Automatically close the GHL tab after selecting an element.       │
│      Disable if building multi-step tours to select multiple elements. │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Scope Boundaries

| In Scope | Out of Scope |
|----------|--------------|
| Draggable floating toolbar in embed.js | Live Builder mode (V2 - see backlog) |
| Two-stage flow (Navigate → Select) | Shadow DOM element selection |
| Selector generation (ID, data-attr, class, path) | Saved element library (V2 - see backlog) |
| BroadcastChannel + localStorage communication | Multi-element selection in one click |
| Friendly name extraction from element text | Selector syntax highlighting/editor |
| GHL Domain field in Settings | Cross-browser compatibility testing |
| Auto-close toggle in Settings | Element validation/testing in GHL |
| Keyboard shortcut (Ctrl+Shift+B) | Iframe-nested element selection |

---

## Quick Wins (UX Improvements)

| Suggestion | Why It Helps | Effort |
|------------|--------------|--------|
| "Test selector" button | Verify element still exists before publishing | Low |
| Selector quality indicator | Yellow badge warns if path-based (fragile) | Low |
| Friendly name display | Show "Contacts" not raw CSS selector | Low |
| Recent URLs dropdown | Quick access to previously used pages | Low |
| Copy selector button | Easy debugging and sharing | Low |
| Keyboard shortcut (Ctrl+Shift+B) | Power users can toggle quickly | Low |

---

## Technical Implementation Notes

### Cross-Tab Communication

```typescript
// Dashboard side - listening for selection
const channel = new BroadcastChannel('at_element_selection');
channel.onmessage = (event) => {
  if (event.data.sessionId === currentSessionId) {
    setSelectedElement(event.data);
    setIsSelecting(false);
  }
};

// Also poll localStorage as fallback
const checkLocalStorage = () => {
  const data = localStorage.getItem('at_selected_element');
  if (data) {
    const parsed = JSON.parse(data);
    if (parsed.sessionId === currentSessionId) {
      localStorage.removeItem('at_selected_element');
      setSelectedElement(parsed);
    }
  }
};
```

### Opening GHL Tab

```typescript
const openBuilderMode = (ghlDomain: string, sessionId: string) => {
  const url = new URL(ghlDomain);
  url.searchParams.set('at_builder_mode', 'true');
  url.searchParams.set('at_session', sessionId);
  window.open(url.toString(), '_blank');
};
```

### Toolbar Drag Implementation

```typescript
// Make toolbar draggable
let isDragging = false;
let offsetX, offsetY;

dragHandle.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - toolbar.offsetLeft;
  offsetY = e.clientY - toolbar.offsetTop;
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    toolbar.style.left = (e.clientX - offsetX) + 'px';
    toolbar.style.top = (e.clientY - offsetY) + 'px';
  }
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    // Save position to localStorage
    localStorage.setItem('at_toolbar_position', JSON.stringify({
      left: toolbar.offsetLeft,
      top: toolbar.offsetTop
    }));
  }
});
```

---

## Future Enhancements (V2 - See phase-3-backlog.md)

- **Live Builder Mode:** Stay in GHL, add steps as you navigate without returning to dashboard
- **Saved Element Library:** Save frequently-used selectors with friendly names for quick reuse

---

## Acceptance Criteria

- [ ] Settings page has GHL Domain input field
- [ ] Settings page has Auto-close toggle
- [ ] Step editor shows 🎯 button for tooltip/hotspot step types
- [ ] Clicking 🎯 opens new tab with GHL domain + builder params
- [ ] Floating toolbar appears at top with correct styling
- [ ] Toolbar is draggable and remembers position
- [ ] Toggle switches between Navigate (OFF) and Select (ON) modes
- [ ] In Select mode, hover shows blue outline on elements
- [ ] Clicking element captures selector + friendly name
- [ ] Data successfully sent back to dashboard via BroadcastChannel
- [ ] Dashboard receives data and populates element field
- [ ] Tab auto-closes if setting enabled
- [ ] Keyboard shortcut (Ctrl+Shift+B) toggles builder mode
- [ ] Fragile selectors show warning indicator

---

## Design Notes

- **Use frontend-design skill** for creating the draggable toolbar UI
- **Use Supabase MCP** for adding ghl_domain column to agencies table
- **Toolbar colors:** Light blue gradient when in Select mode
- **Keep toolbar compact** - should not obstruct GHL UI significantly
