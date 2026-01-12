# Feature 14: Login Designer

## Status: ✅ Complete

## Overview
Canvas-based drag-drop designer for customizing GHL login pages.

---

## Completed Items

### 1. Form Element Auto-Switch Tab ✅
- When clicking on the login-form element in canvas, auto-switches to "Form" tab
- Implemented in `login-designer.tsx` via `handleSelectElement` callback

### 2. Delete Key Support ✅
- Pressing Delete/Backspace removes selected element (except login-form)
- Implemented via `useEffect` keyboard listener in `login-designer.tsx`

### 3. Upload File Button ✅
**Root Cause:** @dnd-kit's PointerSensor was intercepting pointer events, breaking the browser's "user activation" chain required for file dialogs.

**Solution:**
- Added `onPointerDown`, `onMouseDown`, `onClick` with `stopPropagation()` to the wrapper div
- Created Supabase Storage bucket "assets" with public access policies
- Policies: authenticated upload, public read, authenticated update/delete
- URL display shows "Image uploaded" instead of full Supabase URL

**Files Modified:**
- `components/shared/file-upload.tsx` - Added event propagation stops, clean URL display
- `app/api/upload/route.ts` - Upload endpoint
- Supabase: Created "assets" bucket via SQL

### 4. Resize Font Scaling ✅ (Partial)
- Font sizes, input heights, padding now scale proportionally with element width
- Scale factor: `width / 400` (clamped between 0.5 and 1.5)
- Implemented in `login-form-element.tsx`

### 5. Resize Handle Anchoring (Partial - Needs More Work)
- Initial implementation added x/y position updates during resize
- SE handle works correctly (top-left anchored)
- Other handles (NW, NE, SW) still have issues - anchors not staying fixed
- **Remaining Issue:** Logic needs debugging - other corners still move slightly

### 6. Preset Form Positioning (Partial - Needs More Work)
- Form now positions on correct side (x position):
  - `split-left`: Form on right (x: 62%)
  - `split-right`: Form on left (x: 12%)
- **Remaining Issue:** Form is too low on page (y position needs adjustment, currently y: 25)
- **Remaining Issue:** Preset preview thumbnails are backwards - "Split - Image Left" shows form on left in the picker dialog

---

## Completed Polish Items (All Done!)

### 7. Resize Handle Anchoring ✅
- Fixed NW, NE, SW handles to properly anchor the opposite corner
- Root cause: position calculation used mouse delta instead of width/height change
- Solution: Calculate fixed corner position, then derive new position from new dimensions
- File: `canvas.tsx` handleMouseMove

### 8. Preset Form Y Position ✅
- Form now positions correctly when applying presets
- Split layouts: y: 18 (slightly higher for better balance)
- Centered/gradient layouts: y: 25 (below header text)
- File: `login-designer.tsx` handlePresetSelect

### 9. Preset Preview Thumbnails ✅
- Split layout previews now show form on correct side
- Added image placeholder for split layouts
- "Split - Image Left" shows image left, form right
- "Split - Image Right" shows form left, image right
- File: `preset-picker.tsx` PresetCard component

---

## Session Summary (Jan 11, 2026)

### What We Fixed This Session:
1. **File upload button not working** - Root cause was @dnd-kit blocking pointer events
2. **Supabase storage bucket** - Created "assets" bucket with proper policies
3. **URL display cleanup** - Shows "Image uploaded" instead of exposing Supabase project ID
4. **Form auto-switch tab** - Clicking form element switches to Form tab
5. **Delete key support** - Delete/Backspace removes selected elements
6. **Font scaling** - Form elements now scale with width
7. **Preset form X positioning** - Form moves to correct side for split layouts
8. **Resize handle anchoring** - All corner handles now anchor opposite corner properly
9. **Preset form Y position** - Form positioned appropriately per layout type
10. **Preset preview thumbnails** - Split previews show correct form/image arrangement

### Feature 14 Status: ✅ COMPLETE

---

## Files Reference
- `components/shared/file-upload.tsx` - Upload component
- `app/api/upload/route.ts` - Upload API
- `app/(dashboard)/login/_components/canvas.tsx` - Canvas & resize handles
- `app/(dashboard)/login/_components/login-designer.tsx` - Main component
- `app/(dashboard)/login/_components/preset-picker.tsx` - Presets
- `app/(dashboard)/login/_components/properties-panel.tsx` - Element properties
- `app/(dashboard)/login/_components/form-style-panel.tsx` - Form styling

---

## Backlog / Future Enhancements

### High Priority

#### 1. Preview Page (404 Error)
- **Issue:** Preview button opens `/preview/login` which doesn't exist
- **Solution:** Create preview page that renders the saved design full-screen
- **Location:** `app/(preview)/login/page.tsx` or similar

#### 2. UI Layout Reorganization
- **Issue:** Form styling split between left panel (Form tab) and right panel (Properties)
- **Suggestion:** Move ALL form editing (colors, styling, heading) to the Properties Panel when form element is selected
- **Left panel:** Only for adding elements (Elements, Background)
- **Right panel:** All editing for selected element (including all form styling when form selected)
- **Benefit:** Clearer separation - left = add components, right = edit selected component

#### 3. Save/Recall Design Presets
- **Issue:** Save button saves but no way to name/recall different designs
- **Features needed:**
  - Name the design when saving
  - List of saved designs to choose from
  - Set as default design
  - Duplicate design functionality

#### 4. Export/Copy CSS Code
- **Issue:** No way to copy the generated CSS/code to use elsewhere
- **Features needed:**
  - "Copy Code" button showing CSS/JS that will be injected
  - Show what the embed script will apply
  - Useful for debugging and custom implementations

### Research / Investigation

#### 5. Dynamic Text Variables (Custom Fields)
- **Question:** Since users aren't logged in yet on the GHL login page, is there a way to use custom values?
- **Ideas to research:**
  - `{{time_greeting}}` - "Good morning", "Good afternoon", etc.
  - `{{day_of_week}}` - "Happy Monday!"
  - URL parameters: `?name=Steve` → "Welcome back, Steve"
  - Browser language/locale detection
  - GHL sub-account branding variables (if available pre-login)
- **Implementation:** Would need JavaScript in embed script to replace placeholders

#### 6. GHL Integration Documentation
- **Question:** How does the login customization actually get applied to GoHighLevel?
- **Document needed:**
  - Where to paste the embed script in GHL Agency Settings
  - How the embed script targets the login page
  - Any GHL-specific limitations or requirements
  - Screenshots of GHL settings location

### Nice to Have

#### 7. Design Templates Library
- More preset templates (modern, corporate, playful, etc.)
- Industry-specific templates (real estate, fitness, coaching)
- Seasonal templates (holiday themes)

#### 8. Animation Effects
- Entrance animations for elements
- Hover effects on buttons
- Subtle background animations (gradient shift, particles)

#### 9. Mobile Preview
- Toggle to preview mobile layout
- Responsive element positioning
- Touch-friendly form sizing
