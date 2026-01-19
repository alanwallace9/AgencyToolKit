# Feature 21: Tour Preview (Live Preview in Iframe)

**Status:** Ready for Implementation
**Dependencies:** Feature 19 (Tour Builder Basic UI), Feature 20 (Visual Element Selector)
**Estimated Complexity:** Medium

---

## Documented Preferences (User Approved 2026-01-19)

### Technical Decisions
| Decision | Preference |
|----------|------------|
| Data transfer | BroadcastChannel + localStorage (same as builder mode) |
| Element validation | "Test All Elements" button with report |
| Preview toolbar | Floating, draggable (same pattern as builder mode) |

### Design Preferences
| Element | Preference |
|---------|------------|
| Background | Light (consistent with dashboard) |
| Illustrations | Line art (no emojis) |
| Overall feel | Clean, whitespace, not cluttered |
| Publish celebration | Green toast via Sonner |
| First tour publish | Slightly more prominent success message |

### V2 Backlog (Out of Scope)
- Automatic periodic element testing with notification bell
- Cross-device preview sharing

---

## Overview

A live preview system that allows agencies to test their tours in an iframe showing actual GHL pages. This replaces the current mockup-based preview with a real-world preview where tours render exactly as end-users will see them.

### Why This Matters

The current `StepPreviewModal` shows tours against a simulated background with mock elements. This works for basic validation but doesn't show:
- How tooltips position against real GHL elements
- Whether CSS selectors actually work
- The true visual experience with real GHL styling

---

## User Flow

### Current State (Feature 19)
1. User clicks "Preview" button in tour editor
2. `StepPreviewModal` opens showing a mock preview
3. Preview uses placeholder backgrounds and simulated target elements

### New State (Feature 21)
1. User clicks "Preview" button in tour editor
2. Preview modal opens with **two options**:
   - **Quick Preview** (existing) - Fast mockup preview
   - **Live Preview** - Opens in new tab with real GHL page
3. Live Preview loads their GHL domain in an iframe/new tab with `at_preview_mode=true`
4. Tour renders on actual page using Driver.js
5. User can step through tour and see exact rendering

---

## Preview Modes

### Mode 1: Quick Preview (Enhanced Existing)
- Keep current `StepPreviewModal` functionality
- Fast, no external dependencies
- Shows step content, buttons, progress indicators
- Uses mock GHL-styled target elements

### Mode 2: Live Preview (New)
- Opens new browser tab with GHL page
- Embed script detects `at_preview_mode=true` parameter
- Loads Driver.js and renders the tour
- Tour data passed via sessionStorage or hash params
- Shows real element targeting, actual positioning
- Allows full tour walkthrough on real page

---

## Technical Architecture

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TOUR BUILDER (Dashboard)                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Preview ▼]                                                            │
│   ├── Quick Preview (current modal)                                     │
│   └── Live Preview → Opens new tab                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ User clicks "Live Preview"
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  NEW TAB: GHL Subaccount                                                 │
│  URL: https://app.agency.com/#at_preview_mode=true&at_tour_data=...     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🔍 PREVIEW MODE                    [Step 1/3] [Exit Preview]     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────┐                                                          │
│  │ GHL      │   ┌────────────────────────────────────────────────┐    │
│  │ Sidebar  │   │                                                 │    │
│  │          │   │  ┌─────────────────────────────────────────┐   │    │
│  │ Dashboard│◄──┼──│ Welcome to the Dashboard!               │   │    │
│  │ Contacts │   │  │                                         │   │    │
│  │ ...      │   │  │ This is where you'll see your key      │   │    │
│  │          │   │  │ metrics and recent activity.            │   │    │
│  │          │   │  │                                         │   │    │
│  │          │   │  │            [Got it] [Skip Tour]        │   │    │
│  │          │   │  └─────────────────────────────────────────┘   │    │
│  │          │   │                                                 │    │
│  └──────────┘   └────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Transfer Strategy

Since we can't directly pass large amounts of data in URLs, we'll use a combination approach:

1. **Session Storage (Primary)**: Store tour data in sessionStorage before opening new tab
2. **Hash Fragment (Trigger)**: Pass only the preview mode flag and session key
3. **API Fallback**: If sessionStorage fails, fetch tour data from API

```typescript
// Dashboard side - launching preview
const launchLivePreview = (tourData: Tour, ghlDomain: string) => {
  // Generate unique session key
  const sessionKey = crypto.randomUUID();

  // Store full tour data in sessionStorage
  sessionStorage.setItem(`at_preview_${sessionKey}`, JSON.stringify({
    tour: tourData,
    timestamp: Date.now(),
    origin: window.location.origin,
  }));

  // Open GHL with preview params in hash (survives redirects)
  const url = new URL(ghlDomain);
  url.hash = `at_preview_mode=true&at_preview_session=${sessionKey}`;

  window.open(url.toString(), '_blank');
};
```

```javascript
// Embed script side - detecting preview mode
(function checkPreviewMode() {
  var hashParams = new URLSearchParams(window.location.hash.substring(1));
  var previewMode = hashParams.get('at_preview_mode');
  var sessionKey = hashParams.get('at_preview_session');

  if (previewMode === 'true' && sessionKey) {
    // Try to get tour data from sessionStorage
    var tourDataStr = sessionStorage.getItem('at_preview_' + sessionKey);
    if (tourDataStr) {
      var tourData = JSON.parse(tourDataStr);
      initPreviewMode(tourData.tour);
    }
  }
})();
```

---

## Key Deliverables

### Dashboard Components

| Component | Location | Description |
|-----------|----------|-------------|
| `preview-dropdown.tsx` | `tours/[id]/_components/` | Dropdown with Quick Preview / Live Preview options |
| `live-preview-launcher.ts` | `tours/[id]/_lib/` | Utility to launch live preview with data transfer |

### Embed Script Updates

| Function | Description |
|----------|-------------|
| `checkPreviewMode()` | Detect preview mode from URL hash |
| `initPreviewMode(tourData)` | Initialize preview with passed tour data |
| `createPreviewToolbar()` | Floating toolbar showing preview controls |
| `renderPreviewTour(tourData)` | Render tour using Driver.js (shares with Feature 22) |

### Preview Toolbar (in GHL)

When preview mode is active, show a floating toolbar:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔍 PREVIEW MODE    Tour: "Welcome Tour"   [Step 1/3]   [Exit Preview] │
└─────────────────────────────────────────────────────────────────────────┘
```

Features:
- Shows current tour name
- Shows current step / total steps
- Exit button to close preview and return to normal GHL
- Optional: Navigate forward/back through steps

---

## UI Changes

### Preview Button Dropdown

Replace the single "Preview" button with a dropdown:

```
┌────────────────────┐
│ ▶ Preview        ▼ │
└────────────────────┘
        │
        ▼
┌────────────────────────────────────────┐
│ 🎭 Quick Preview                        │
│    Fast preview in modal               │
│                                        │
│ 🌐 Live Preview                        │
│    Test on real GHL page               │
│    Opens in new tab                    │
└────────────────────────────────────────┘
```

### Quick Preview Enhancements

Keep the current `StepPreviewModal` but improve it:
- Better mock GHL sidebar styling
- Show actual element display names from step.element
- Add "fragile selector" warnings if applicable
- Show theme colors properly applied

---

## Preview Toolbar Behavior

### Toolbar Styling
```css
.at-preview-toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 999999;
  font-family: system-ui, sans-serif;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
}
```

### Toolbar Controls
- **Tour Name**: Shows which tour is being previewed
- **Step Counter**: "Step 1 of 3" with previous/next buttons
- **Reset Button**: Restart tour from beginning
- **Exit Button**: Close preview mode, remove toolbar, return to normal GHL

---

## Scope Boundaries

| In Scope | Out of Scope |
|----------|--------------|
| Live preview in new browser tab | Embedded iframe preview (CORS issues) |
| Preview toolbar with step navigation | Editing tour from within preview |
| SessionStorage data transfer | Real-time sync between builder and preview |
| Driver.js tour rendering (shared with F22) | Analytics tracking in preview mode |
| Preview mode detection in embed script | Preview for unpublished/draft tours via API |
| Exit preview functionality | Multi-user preview sharing |

---

## Dependencies

### Shared with Feature 22

Feature 21 and Feature 22 share significant code:
- `renderTourWithDriverJS()` - Core rendering function
- Driver.js integration and initialization
- Theme application to Driver.js popover
- Step navigation logic

**Recommendation**: Implement Features 21 and 22 together since they share ~60% of the code.

### Required Packages

```bash
# Driver.js for tour rendering
pnpm add driver.js
```

---

## Quick Wins (UX Improvements)

| Suggestion | Why It Helps | Effort |
|------------|--------------|--------|
| "Open on this page" option | Let user specify which GHL page to preview on | Low |
| Preview step selector | Jump to specific step in preview | Low |
| Keyboard shortcuts | Arrow keys to navigate preview steps | Low |
| Auto-position toolbar | Move toolbar if it overlaps tour element | Medium |
| Preview history | Remember last previewed page URL | Low |

---

## Acceptance Criteria

- [ ] Preview button becomes a dropdown with Quick/Live options
- [ ] Quick Preview still works as before (modal)
- [ ] Live Preview opens new tab with GHL domain
- [ ] Preview toolbar appears at top of GHL page
- [ ] Tour renders using Driver.js on real page
- [ ] Steps can be navigated with Next/Previous
- [ ] Exit button closes preview mode
- [ ] Preview data transferred securely via sessionStorage
- [ ] Works with draft tours (not yet published)
- [ ] Theme colors applied to Driver.js popover

---

## Error Handling

### Scenarios to Handle

1. **No GHL domain configured**: Show error, prompt to set in Settings
2. **SessionStorage unavailable**: Fall back to API-based tour fetch
3. **Element not found**: Show warning in preview toolbar, allow skipping step
4. **Preview data expired**: Session data older than 1 hour, show refresh prompt
5. **GHL page redirects**: Hash params survive, session data available

---

## Testing Notes

1. Test with different step types (modal, tooltip, hotspot, etc.)
2. Test element targeting on various GHL pages
3. Test theme color application
4. Test with tours that have many steps (10+)
5. Test navigation (next/prev/restart)
6. Verify preview mode doesn't affect normal GHL functionality
7. Test exit preview cleans up all preview artifacts

---

## Design Notes

- **Preview Toolbar**: Use amber/orange gradient to distinguish from Builder Mode (blue)
- **Contrast with GHL**: Ensure preview UI doesn't blend with GHL's UI
- **Non-blocking**: Toolbar should not block critical GHL navigation
- **Mobile consideration**: Preview primarily for desktop; mobile preview is lower priority

---

## Known Issues (To Investigate)

### 1. Re-select Button Race Condition (2026-01-19)
**Symptoms:**
- Clicking "Re-select" from the tour editor sometimes doesn't show the builder toolbar
- Instead, it just redirects to the agency dashboard with no toolbar
- Occurs intermittently - works on 4th attempt after 3 failures

**Suspected cause:** Race condition between:
- GHL SPA router stripping URL params before script runs
- sessionStorage capture timing
- Possible redirect chain losing hash params

**Investigation steps:**
1. Add console logging to trace param capture timing
2. Check if hash params are present when page loads
3. Verify sessionStorage is written before any redirect
4. Test with network throttling to expose timing issues

### 2. Builder Mode Was Skipping Customizations (FIXED 2026-01-19)
**Issue:** When builder mode was detected, the embed script returned early and skipped applying theme/menu/color customizations.

**Problem:** If user renamed "Launch Pad" to "Connect Google", the builder mode showed the original GHL names, but production shows customized names. Tour selectors would capture wrong element names.

**Fix:** Removed early return in `init()` function. Builder mode bar now shows while customizations still apply normally.
