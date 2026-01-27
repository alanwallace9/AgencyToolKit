# Feature 37: Image Editor - Canvas (Fabric.js Rewrite)

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
## Continue Feature 37 - Image Editor Canvas

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
- [x] Text position matches API output - IMPROVED
- [ ] Text styling (font, color, background) renders correctly
- [ ] Preview modal shows correct image
- [x] Save/load text config works
- [x] Zoom/pan image behavior

---

## Implementation Notes (Session 2) - 2026-01-26

### Bug Fixes

1. **Architecture Fix - Two Fabric Instances**
   - Problem: `useFabricEditor` hook was called in both image-editor.tsx AND FabricCanvas, creating two separate Fabric instances
   - Fix: Rewrote FabricCanvas to use `forwardRef` and `useImperativeHandle` to expose methods via ref
   - Deleted: `use-fabric-editor.ts` (no longer needed)

2. **Fit/Fill Not Centering**
   - Problem: Image wasn't centering when Fit/Fill buttons clicked
   - Fix: Added explicit `originX: 'left'`, `originY: 'top'` to image, called `setCoords()` after position changes

3. **API Font Size Mismatch**
   - Problem: Text appeared larger in API output than editor
   - Fix: Updated API route (`app/api/images/[templateId]/route.tsx`) to:
     - Use configured box dimensions instead of calculating from text width
     - Match editor's font size calculation (subtract padding before shrink calc)
     - Default padding changed from 8 to 12

### UI Changes

1. **Default Text Box Size**: Changed from 192×43px to **130×44px** (20.3% × 12.2%)

2. **Position Presets Moved to Dropdown**
   - Visual thumbnails now in Box dropdown (toolbar)
   - Removed from left sidebar to free up space for sample names

3. **Grid Color**: Changed from indigo to **orange** (`rgba(249, 115, 22, 0.6)`) for better visibility

4. **Removed Duplicate Magnet Icon**: Was duplicating Grid toggle functionality

5. **Reset Button**: Now resets EVERYTHING to defaults:
   - Image: position, flip
   - Text box: size (130×44), position (center), colors (black text, white box), font (Poppins 32), padding (12)
   - Preserves: prefix, suffix, fallback (user content)

### Files Modified This Session
- `fabric-canvas.tsx` - Fit/Fill fixes, grid color, default dimensions
- `image-editor.tsx` - Reset functionality, removed position preset props
- `text-toolbar.tsx` - Visual thumbnails in dropdown, removed magnet icon
- `left-panel.tsx` - Removed position presets section
- `defaults.ts` - Updated default values
- `app/api/images/[templateId]/route.tsx` - Font size calculation fixes

### Known Issue - Font Size Still Differs ✅ FIXED (Session 3)
- **Problem:** Editor shows font size 30, but API preview renders much smaller (~12)
- **Root Cause:** Scale factor was based on `template.base_image_width` (original upload, e.g., 1920px) instead of editor canvas width (640px)
- **Fix:** Changed API to scale based on `EDITOR_CANVAS_WIDTH = 640`

---

*Session 2: Bug fixes and UI improvements*

---

## Implementation Notes (Session 3) - 2026-01-26

### Font Size Mismatch Fix

**Problem:** Font in editor (e.g., 32px) rendered much smaller in API output (~12px).

**Root Cause Analysis:**
```javascript
// BEFORE (buggy)
const originalWidth = template.base_image_width;  // Could be 1920, 3840, etc.
const scaleFactor = width / originalWidth;         // 800/1920 = 0.417
const scaledFontSize = Math.round((cfg.size || 32) * scaleFactor);  // 32 * 0.417 = 13px!
```

The API was scaling font size based on the **original uploaded image dimensions**, but the editor uses a **fixed 640×360 canvas** regardless of image size. When someone uploads a 1920px image:
- Scale factor = 800/1920 = 0.417
- 32px font → 13px font (way too small!)

**Fix:**
```javascript
// AFTER (correct)
const EDITOR_CANVAS_WIDTH = 640;  // Match editor canvas
const scaleFactor = width / EDITOR_CANVAS_WIDTH;  // 800/640 = 1.25
const scaledFontSize = Math.round((cfg.size || 32) * scaleFactor);  // 32 * 1.25 = 40px
```

Now font sizes scale properly:
- Output at 800px → 32 * 1.25 = 40px
- Output at 640px → 32 * 1.0 = 32px (exact match)
- Output at 400px → 32 * 0.625 = 20px

### Files Modified
- `app/api/images/[templateId]/route.tsx` - Fixed scale factor calculation (lines 320-322), updated default padding to 12

### Font Not Rendering in Editor Fix

**Problem:** When user selects a different font (e.g., Montserrat), it doesn't display in the editor canvas but works in preview.

**Root Cause:** Google Fonts weren't loaded in the browser. Fabric.js was trying to render with font names that didn't exist, falling back to system fonts.

**Fix:**
1. Added Google Fonts preload in `image-editor.tsx`:
   - Loads all 8 supported fonts (Inter, Poppins, Roboto, Open Sans, Lato, Montserrat, Playfair Display, Oswald)
   - Both 400 and 700 weights for normal/bold support

2. Added `document.fonts.ready` wait in `fabric-canvas.tsx`:
   - Ensures fonts are loaded before rendering initial text box

### Text Centering Fix

**Problem:** Text wasn't centered with even padding - "Sarah" shifted right, "Thomas" shifted left, especially with Poppins font.

**Root Causes:**
1. Fabric.js Group repositions objects based on bounding boxes, which vary by font
2. Font size shrink calculation used a fixed character-width ratio (0.55) that didn't account for wider fonts like Poppins

**Fixes Applied:**
1. Force re-center objects after Group creation:
   ```javascript
   const groupObjects = group.getObjects();
   groupObjects.forEach(obj => {
     obj.set({ left: 0, top: 0 });
     obj.setCoords();
   });
   ```

2. New `calculateFontSizeToFit` function that measures **actual rendered text width**:
   - Creates temporary Fabric text object with the actual font
   - Measures real width (not estimated)
   - Shrinks iteratively until text fits with 5% margin for padding

3. Made `createTextBox` async with `await document.fonts.ready`:
   - Ensures fonts are loaded before measuring
   - Fixes issue where font changes didn't apply

### Files Modified (Session 3)
- `app/api/images/[templateId]/route.tsx` - Fixed scale factor (editor canvas width, not original image)
- `app/(dashboard)/images/[id]/_components/image-editor.tsx` - Added Google Fonts preload
- `app/(dashboard)/images/[id]/_components/fabric-canvas.tsx`:
  - `await document.fonts.ready` in createTextBox
  - New `calculateFontSizeToFit` with actual text measurement
  - Force re-center objects after Group creation
  - Explicit `left: 0, top: 0` on rect and text before grouping

### Testing Checklist
- [x] Font size in editor matches font size in preview
- [ ] Test with different original image sizes (small: 800px, large: 1920px+)
- [x] Test auto-shrink with long names (Thomas, Christopher)
- [ ] Verify Reset button works correctly
- [x] Changing font in dropdown updates canvas immediately
- [x] All 8 fonts render correctly
- [x] Text centered with even padding regardless of name length

---

### Additional Fixes (Session 3 continued)

#### Italic & Underline Support
- Added `font_style` and `text_decoration` fields to `ImageTemplateTextConfig` type
- Implemented working Italic (I) and Underline (U) toggle buttons in toolbar
- Buttons highlight when active
- Canvas updates immediately when toggled
- API generates images with italic/underline applied via SVG attributes

#### Corner Radius Slider Fixes
1. **Slider now goes to 0** - Changed `padding || 12` to `padding ?? 12` to handle falsy 0
2. **Step changed to 1** - More granular control (was 2)
3. **Max changed to 24** - Reasonable max for corner radius
4. **Removed 16px cap** - Was `Math.min(padding, 16)`, now uses full padding value
5. **Fixed icon** - Replaced broken SVG with clean rounded corner icon

#### Files Modified (Additional)
- `types/database.ts` - Added `font_style` and `text_decoration` to ImageTemplateTextConfig
- `app/(dashboard)/images/[id]/_components/text-toolbar.tsx`:
  - Implemented Italic/Underline toggle buttons
  - Fixed corner radius icon SVG
  - Slider: min=0, max=24, step=1
  - Changed `|| 12` to `?? 12` for padding
- `app/(dashboard)/images/[id]/_components/fabric-canvas.tsx`:
  - Added fontStyle and underline support to FabricText
  - Removed 16px corner radius cap
  - Added font_style and text_decoration to useEffect dependencies
- `app/api/images/[templateId]/route.tsx`:
  - Added fontStyle and textDecoration to createTextSvg config
  - Applied font-style and text-decoration SVG attributes

### Final Testing Checklist
- [x] Font size matches between editor and preview
- [x] Auto-shrink works for all fonts (measures actual width)
- [x] Text always centered with even padding
- [x] Font changes apply immediately
- [x] Italic button works (toggles, highlights when active)
- [x] Underline button works (toggles, highlights when active)
- [x] Corner radius slider goes from 0 (square) to 24 (rounded)
- [x] Corner radius visual updates past 16
- [ ] Test with different original image sizes
- [ ] Verify Reset button works correctly

---

*Session 3 Complete: Font size, font loading, text centering, italic/underline, corner radius fixes*
