# Feature 40: Fabric.js Image Editor Rewrite

> Complete rewrite of the image editor canvas using Fabric.js to fix position mismatch and implement proper canvas/image/text layering.

**Created:** 2026-01-25
**Status:** In Progress - Build Passes, Testing Needed

---

## Problem Statement

The current CSS-based editor has a fundamental architecture problem:
- CSS positioning (`left/top` + `transform: translate(-50%, -50%)`) uses different coordinate math than SVG positioning (`x/y` + `text-anchor: middle`)
- Text position in the editor does NOT match text position in API-generated images
- Zoom zooms the entire editor instead of zooming the image within a canvas
- No proper canvas/image separation - the image IS the canvas

**This cannot be fixed with math adjustments.** The architecture is wrong.

---

## Solution: Fabric.js

Fabric.js is purpose-built for this exact use case:
- Proper canvas → image → text layer separation
- Same coordinate system everywhere
- Built-in drag, resize, zoom, pan
- Customizable control handles
- SVG export (matches our API approach)

---

## Scope

### What Gets Replaced
- `editor-canvas.tsx` → `fabric-canvas.tsx`
- DndContext drag handling → Fabric.js native drag

### What Stays the Same
- `image-editor.tsx` (page structure)
- Top bar (back, title, save status, undo, preview)
- Tab navigation (Editor / URLs)
- Left panel (sample names, position presets)
- Right panel (properties panel)
- Toolbar structure
- Preview modal
- URL generator tab
- All state management and save logic

---

## Technical Specifications

### Canvas Dimensions

| Setting | Value | Rationale |
|---------|-------|-----------|
| Default width | 640px | Sweet spot for email + MMS |
| Default aspect ratio | 16:9 | Industry standard for phones |
| Default height | 360px | 640 × 9/16 |
| Allow custom ratios | Yes | User can have vertical or any ratio |

### Default Text Box

| Setting | Value | Rationale |
|---------|-------|-----------|
| Width | 30% of canvas (~192px) | Fits 95% of names without shrinking |
| Height | 10% of canvas (~36px) | Comfortable single line |
| Position | Center (50%, 50%) | Safe default |
| Background | White (#FFFFFF) | User preference |
| Padding | 12px | Current default |
| Font | Poppins | Current default |
| Font size | 32px | Current default |

### Name Length Statistics (US Data)

| Length | % of Names | Examples |
|--------|------------|----------|
| 4-5 chars | 16.4% | John, Mary, Sarah |
| 6-7 chars | 49.7% | Robert, Michael, Jessica |
| 8-9 chars | 26.1% | Patricia, Jennifer, Katherine |
| 10+ chars | 7.8% | Christopher, Elizabeth |

**30% box width fits 9-character names at full size. 10+ character names shrink proportionally.**

---

## Control Handle Style (Canva-style)

Based on user-provided Canva screenshot:

```
        ┌────────[═══]────────┐
        │                     │
        ○                     ○
        │                     │
       [║]                   [║]
        │                     │
        ○                     ○
        │                     │
        └────────[═══]────────┘

○ = Circle handles at corners (proportional resize)
[═══] = Bar handles at edge midpoints (single-dimension resize)
```

### Fabric.js Control Configuration

```javascript
{
  cornerStyle: 'circle',
  cornerSize: 10,
  cornerColor: '#FFFFFF',
  cornerStrokeColor: '#6366F1', // Indigo/purple like Canva
  borderColor: '#6366F1',
  transparentCorners: false,
  // Custom edge handles rendered separately
}
```

---

## Position Presets (9-Point Grid)

**Visual design:** Mini canvas thumbnails showing text box position graphically.

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│[▄▄]     │  │  [▄▄]   │  │     [▄▄]│
│         │  │         │  │         │
│         │  │         │  │         │
└─────────┘  └─────────┘  └─────────┘
  Top Left    Top Center   Top Right

┌─────────┐  ┌─────────┐  ┌─────────┐
│         │  │         │  │         │
│[▄▄]     │  │  [▄▄]   │  │     [▄▄]│
│         │  │         │  │         │
└─────────┘  └─────────┘  └─────────┘
Middle Left    Center    Middle Right

┌─────────┐  ┌─────────┐  ┌─────────┐
│         │  │         │  │         │
│         │  │         │  │         │
│[▄▄]     │  │  [▄▄]   │  │     [▄▄]│
└─────────┘  └─────────┘  └─────────┘
Bottom Left  Bottom Center Bottom Right
```

- Rounded rectangle mini-canvas outline
- Small rounded rectangle showing text box position
- Click to apply that position
- No text labels needed - visual is self-explanatory

---

## Image Behavior

### On Upload/Load
- Image loads at original size within canvas
- If image doesn't fill canvas, show gaps (transparent/checkerboard)
- Provide Fit/Fill buttons for quick adjustment

### Fit vs Fill Buttons

| Button | Behavior |
|--------|----------|
| **Fit** | Scale image to fit entirely within canvas (may show gaps on sides) |
| **Fill** | Scale image to cover entire canvas (may crop edges) |

### Zoom Interaction
- **Cmd/Ctrl + Scroll Wheel** = Zoom in/out at cursor position
- After zooming, **drag image** to reposition
- Image can extend past canvas edges (gets cropped in final output)
- Canvas acts as the "photo paper" - only what's inside gets exported

### Flip
- Flip Horizontal / Flip Vertical buttons (keep existing)
- Applies to image layer only

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Arrow keys | Nudge selected object 1px |
| Shift + Arrow | Nudge selected object 10px |
| Cmd/Ctrl + Scroll | Zoom at cursor |
| Delete/Backspace | Delete selected object (with confirmation for text box) |
| Cmd/Ctrl + Z | Undo (existing) |

---

## Grid Overlay

**Replaces the "magnet" snap lines** (user said they're janky).

- Toggle on/off via toolbar button
- Shows rule-of-thirds grid (2 vertical + 2 horizontal lines)
- Optional: center crosshairs
- Semi-transparent lines (don't obscure image)
- Grid is visual guide only (no magnetic snapping)

---

## Text Box Behavior

### Selection
- Click text box to select (shows handles)
- Click canvas background to deselect

### Editing
- Double-click text box to edit content
- Or use Properties panel for prefix/suffix/fallback

### Auto-Shrink (Keep Existing)
- If name exceeds box width, font size shrinks automatically
- Text never wraps to multiple lines
- Text never overflows box

### Auto-Center (Keep Existing)
- Text is always centered within box (horizontal + vertical)

---

## Sample Names List (Updated)

```javascript
// Common real names
const SAMPLE_NAMES = [
  // Short (4-5 chars)
  'John', 'Mary', 'Bill', 'Sarah', 'Mike',
  // Medium (6-7 chars)
  'Robert', 'Thomas', 'Michael', 'Jessica', 'Jennifer',
  // Longer (8-9 chars) - may shrink slightly
  'Patricia', 'Margaret', 'Stephanie', 'Katherine',
];

// Long names for dice button (10+ chars) - will shrink
const LONG_NAMES = [
  'Christopher', 'Elizabeth', 'Jacqueline', 'Alexandria', 'Johnathan',
];

// Easter egg (1-in-50 chance on dice roll)
const EASTER_EGG_NAME = 'Shaun Coming Atcha!';
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `fabric-canvas.tsx` | **Create** | Main Fabric.js canvas component |
| `use-fabric-editor.ts` | **Create** | Hook for Fabric state management |
| `position-presets.tsx` | **Create** | Visual 9-point grid component |
| `image-editor.tsx` | **Modify** | Replace EditorCanvas, remove DndContext |
| `image-toolbar.tsx` | **Modify** | Add Fit/Fill/Zoom slider/Grid toggle |
| `editor-canvas.tsx` | **Delete** | No longer needed |
| `route.tsx` (API) | **Modify** | Ensure coordinate system matches |

---

## Implementation Order

1. **Install Fabric.js** - `pnpm add fabric`
2. **Create fabric-canvas.tsx** - Basic Fabric.js setup with React
3. **Implement canvas background** - Fixed 640x360 with border
4. **Implement image layer** - Load, zoom, pan, fit/fill
5. **Implement text layer** - Draggable, resizable with Canva-style handles
6. **Create position-presets.tsx** - Visual 9-point grid
7. **Add grid overlay** - Rule-of-thirds toggle
8. **Wire keyboard shortcuts** - Arrow nudge, zoom
9. **Connect to existing state** - textConfig save/load
10. **Update toolbar** - Fit/Fill/Zoom slider/Grid toggle
11. **Update API route** - Match Fabric.js coordinate system
12. **Remove old code** - Delete editor-canvas.tsx, DndContext
13. **Test end-to-end** - Verify position match between editor and API output

---

## Coordinate System

### Editor (Fabric.js)
- All positions in pixels from top-left of canvas
- Text box position = center point of box

### Database (text_config)
- Store as percentages (0-100) for responsive scaling
- Convert pixels → percentages on save
- Convert percentages → pixels on load

### API (SVG generation)
- Use same percentage-based coordinates
- Convert to pixels based on output image dimensions
- **Key:** API must use same center-point calculation as Fabric.js

---

## Testing Checklist

- [ ] Position a text box in editor
- [ ] Generate image via API
- [ ] Text appears in EXACT same position
- [ ] Test all 9 preset positions
- [ ] Test with various image aspect ratios
- [ ] Test zoom/pan + position
- [ ] Test with short names (Bill)
- [ ] Test with long names (Christopher)
- [ ] Test on different screen sizes

---

## Why Not Other Options?

| Option | Verdict | Reason |
|--------|---------|--------|
| Canvas Plus | No | Server-side only, no UI components |
| Konva.js | Maybe | Good, but no SVG export |
| Polotno | No | $199-399/month licensing |
| Fix CSS math | No | Fundamental architecture mismatch |
| **Fabric.js** | **Yes** | Purpose-built, SVG support, free, active |

---

## References

- [Fabric.js Docs](http://fabricjs.com/docs/)
- [Fabric.js Custom Controls](https://fabricjs.com/demos/custom-controls/)
- [Fabric.js with React patterns](https://github.com/fabricjs/fabric.js/discussions)
- User's Canva screenshot for control handle style
- User's position preset mockup for visual grid design

---

## Next Session Prompt

```
## Continue Feature 40 - Fabric.js Image Editor

### Context
Read: docs/features/feature-40-fabric-editor-rewrite.md

### What We're Building
Replace the CSS-based image editor with Fabric.js to fix position mismatch between editor and API output.

### Key Specs
- Canvas: 640x360px (16:9), customizable
- Canva-style handles (circles at corners, bars at edges)
- Visual position presets (mini thumbnails showing text box location)
- Zoom: Cmd+scroll, then drag to pan
- Fit/Fill buttons for image sizing
- Grid overlay instead of snap lines
- Arrow keys nudge 1px, Shift+arrow 10px

### Implementation Status
[Update this as work progresses]

### Files
- `app/(dashboard)/images/[id]/_components/fabric-canvas.tsx`
- `app/(dashboard)/images/[id]/_components/use-fabric-editor.ts`
- `app/(dashboard)/images/[id]/_components/position-presets.tsx`
```

---

## Implementation Notes (Session 1)

### Files Created
- `app/(dashboard)/images/[id]/_components/fabric-canvas.tsx` - Main Fabric.js canvas wrapper
- `app/(dashboard)/images/[id]/_components/use-fabric-editor.ts` - Hook managing Fabric.js state
- `app/(dashboard)/images/[id]/_components/position-presets.tsx` - Visual 9-point grid

### Files Modified
- `app/(dashboard)/images/[id]/_components/image-editor.tsx` - Removed DndContext, uses Fabric
- `app/(dashboard)/images/[id]/_components/image-toolbar.tsx` - New props: Fit/Fill/Zoom/Grid
- `app/(dashboard)/images/[id]/_components/left-panel.tsx` - Added position presets

### Build Status
- ✅ `pnpm build` passes
- ✅ No TypeScript errors
- ⏳ Needs browser testing

### What's Working (Code Complete)
1. Fabric.js canvas with 640x360 dimensions
2. Image loading with Fit/Fill options
3. Text box with Canva-style controls (circles at corners)
4. Grid overlay (rule of thirds)
5. Zoom with Cmd+scroll
6. Arrow key nudge (1px / 10px with Shift)
7. Position presets (visual thumbnails)
8. Flip H/V for image

### Testing Needed
- [ ] Text position matches API output
- [ ] Text styling (font, color, background) renders correctly
- [ ] Preview modal shows correct image
- [ ] Save/load text config works
- [ ] Zoom/pan image behavior

---

*Document created: 2026-01-25*
*Session 1: Initial implementation*
