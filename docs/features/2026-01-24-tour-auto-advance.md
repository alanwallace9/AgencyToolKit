# Feature: Tour Auto-Advance on Element Click

**Date:** 2026-01-24
**Status:** Planned
**Priority:** P1

---

## Executive Plan: Tour Auto-Advance

### What We're Building

When a user clicks the highlighted element during a tour step, the tour automatically advances to the next step. No more clicking the element AND then clicking "Next" - one click does both. Makes tours feel modern and responsive.

### Why This Matters

**Current (Archaic):**
```
Step: "Click the Connect Google button"
   ↓
User clicks Connect Google
   ↓
Nothing happens in tour
   ↓
User has to find and click "Next"
   ↓
Tour advances
```

**With Auto-Advance (Modern):**
```
Step: "Click the Connect Google button"
   ↓
User clicks Connect Google
   ↓
Tour automatically advances ✨
```

### UI/UX Placement

- **Tour Builder:** New toggle per step: "Auto-advance when clicked"
- **Embed Script:** Click listener on highlighted element triggers `driver.moveNext()`

### Key Deliverables

| Component | Description |
|-----------|-------------|
| Step setting toggle | Checkbox in tour builder: "Auto-advance when clicked" |
| Click listener in embed | Detects click on highlighted element, calls moveNext() |
| Visual feedback | Brief flash/pulse on element when auto-advancing |
| Smart debounce | Prevents double-advance if user clicks rapidly |

### Order of Operations

1. **Database** - Add `auto_advance` boolean to step settings
2. **Tour Builder UI** - Add toggle in step editor
3. **Embed Script** - Add click listener when `auto_advance: true`
4. **Visual feedback** - CSS pulse animation on advance
5. **Testing** - Verify no double-click issues

### Database Changes

The `steps` JSONB array in `tours` table already has per-step settings. Add:

```typescript
interface TourStep {
  // ... existing fields
  auto_advance?: boolean;  // NEW - advance when element clicked
}
```

No migration needed - JSONB is flexible.

### Scope Boundaries

| In Scope | Out of Scope |
|----------|--------------|
| Auto-advance on element click | Auto-advance on any page click |
| Per-step toggle | Global tour setting |
| Visual feedback (pulse) | Sound effects |
| Debounce protection | Complex gesture detection |

### Quick Wins (UX Improvements)

| Suggestion | Why It Helps | Effort |
|------------|--------------|--------|
| **Default ON for action steps** | Most action steps should auto-advance | Low |
| **Pulse animation on advance** | User sees acknowledgment of their click | Low |
| **"Clicked!" micro-text** | Brief text flash confirms detection | Low |
| **Smart detection** | Only trigger on actual element, not tooltip | Low |
| **Works with allowInteraction** | Seamless with existing interaction setting | Low |

---

## Technical Details

### How It Works

```javascript
// In embed.js, when step has auto_advance: true

onHighlightStarted: function(element, step, options) {
  var stepConfig = steps[options.state.activeIndex];

  if (stepConfig.auto_advance && element) {
    // Remove any existing listener
    if (window.__atAutoAdvanceListener) {
      element.removeEventListener('click', window.__atAutoAdvanceListener);
    }

    // Add click listener
    window.__atAutoAdvanceListener = function(e) {
      // Debounce - prevent rapid double-clicks
      if (window.__atLastAdvance && Date.now() - window.__atLastAdvance < 500) {
        return;
      }
      window.__atLastAdvance = Date.now();

      // Visual feedback
      element.classList.add('at-clicked');
      setTimeout(function() {
        element.classList.remove('at-clicked');
      }, 300);

      // Advance to next step
      driverRef.moveNext();
    };

    element.addEventListener('click', window.__atAutoAdvanceListener);
  }
}
```

### CSS for Visual Feedback

```css
.at-clicked {
  animation: at-pulse 0.3s ease-out;
}

@keyframes at-pulse {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
  100% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
}
```

### Tour Builder UI

In the step editor, under "Interaction" section:

```
Interaction
───────────
☑ Allow element interaction
☑ Auto-advance when clicked
    └─ Tour moves to next step when user clicks this element
```

Logic:
- `auto_advance` only makes sense when `allow_interaction` is true
- If `allow_interaction` is false, disable/hide `auto_advance` toggle
- Default: ON when `allow_interaction` is enabled

### Edge Cases

| Scenario | Handling |
|----------|----------|
| User clicks element twice quickly | Debounce (500ms) prevents double-advance |
| Element triggers page navigation | Let navigation happen, tour handles on new page |
| Element opens modal/dropdown | Auto-advance still fires, modal opens underneath next tooltip |
| Last step of tour | Auto-advance calls destroy() instead of moveNext() |
| User clicks tooltip instead of element | No auto-advance (tooltip clicks are separate) |

### Integration with Existing Features

**Works with:**
- `allow_interaction: true` - Required for auto-advance to work
- Photo upload modal - Clicking upload button advances, modal opens
- External links - Click advances tour, link opens in new tab

**Button Actions:**
- If step has `button_action: "complete"` and it's auto-advanced on last step, tour completes
- `button_action: "url"` still works - auto-advance happens, then URL opens

### Files to Modify

| File | Changes |
|------|---------|
| `app/(dashboard)/tours/[id]/_components/step-editor.tsx` | Add auto_advance toggle |
| `app/embed.js/route.ts` | Add click listener logic |
| `types/database.ts` | Add auto_advance to TourStep type |

---

## Questions Resolved

| Question | Decision |
|----------|----------|
| Double-click issue? | 500ms debounce prevents rapid advances |
| Default state? | ON when allow_interaction is enabled |
| Visual feedback? | Pulse animation on element |
| Works on last step? | Yes, calls destroy() to complete tour |

---

## Implementation Notes

### Why No Double Listener Issue

The concern was: "clicking would advance, then the click would advance again"

This doesn't happen because:
1. We add ONE listener to the highlighted element
2. That listener calls `moveNext()` which changes the highlighted element
3. The old element no longer has the listener context
4. New step sets up fresh listener on new element

The debounce is just extra safety for edge cases.

### Relationship to Photo Upload

When tour step says "Upload your photo" and element is clicked:
1. Auto-advance fires → tour moves to next step (or completes)
2. Click event continues → modal opens
3. User uploads in modal
4. Modal closes → user sees tour completion or next step

This creates seamless flow.

---

## Related Documents

- `docs/features/2026-01-24-customer-photo-upload.md` - Photo upload (uses this feature)
- `docs/sessions/2026-01-24-tour-enhancements.md` - Original discussion
- `docs/sessions/2026-01-24-session-final.md` - Tour system context
