# Feature 38/39 Session 2 Handoff - Image Generation API

## Session Summary
Date: 2025-01-25 (Session 2)

### Status: PARTIALLY WORKING - POSITIONING BUG REMAINS

The Sharp-based image generation produces JPEG output at correct file size (~83KB), but **text positioning does not match between the editor canvas and the API output**.

---

## What Was Accomplished This Session

### 1. Replaced @vercel/og with Sharp ✅
- Changed from Edge runtime to Node.js runtime
- File: `app/api/images/[templateId]/route.tsx`
- Now outputs JPEG (~83KB) instead of PNG (2.8MB)
- Uses SVG overlay with embedded Google Font for text rendering

### 2. Added Tab Navigation to Image Editor ✅
- File: `app/(dashboard)/images/[id]/_components/image-editor.tsx`
- Added "Editor" and "URLs" tabs (like Tour Builder)
- URLs tab has full-page layout with preview on right

### 3. Updated Previews to Use API Image ✅
- `preview-modal.tsx` - Now fetches actual API image instead of CSS simulation
- `template-card.tsx` - Now fetches actual API image for thumbnail
- `url-generator.tsx` - Added `fullPage` prop for better layout

---

## THE CORE BUG: Position Mismatch

### What User Sees:
1. **Editor Canvas** - User positions text box at specific x/y coordinates
2. **API Output** - Text appears in DIFFERENT position than editor showed

### Root Cause Analysis:
The editor canvas uses CSS positioning:
```javascript
style={{
  left: `${textConfig.x}%`,
  top: `${textConfig.y}%`,
  transform: 'translate(-50%, -50%)',
  width: `${textConfig.width}%`,
  height: `${textConfig.height}%`,
}}
```

The API uses SVG positioning:
```javascript
const centerX = (config.x / 100) * width;  // pixel position
const centerY = (config.y / 100) * height;
// SVG: text-anchor="middle", dominant-baseline="central"
```

### Potential Issues:
1. **Image Resize Factor** - API resizes image to 800px width, but SVG is created at resized dimensions. The font size is scaled, but maybe other things need scaling too.

2. **SVG vs CSS Positioning** - CSS `left/top` with `translate(-50%, -50%)` should match SVG `text-anchor="middle"` + `dominant-baseline="central"`, but there may be subtle differences.

3. **Box Width/Height** - Editor shows a box with width/height, but API only uses x/y as CENTER point. The box dimensions might affect perceived position.

4. **Font Metrics** - SVG text rendering may have different metrics than CSS text, causing the text to appear offset.

---

## Files Modified This Session

### API Route (Sharp Implementation)
- `app/api/images/[templateId]/route.tsx` - Complete rewrite using Sharp + SVG

### Image Editor (Tab Navigation)
- `app/(dashboard)/images/[id]/_components/image-editor.tsx` - Added tabs, restructured layout

### Preview Components
- `app/(dashboard)/images/[id]/_components/preview-modal.tsx` - Now uses API image
- `app/(dashboard)/images/[id]/_components/url-generator.tsx` - Added fullPage prop
- `app/(dashboard)/images/_components/template-card.tsx` - Now uses API image

### Documentation
- `docs/features/feature-38-39-session-handoff.md` - Previous session notes

---

## Template Data Reference

Test template: `6acefd9c-ad1d-4ae3-add3-395d749cd571`
```json
{
  "x": 50.026973083941606,
  "y": 39.02010338553547,
  "font": "Poppins",
  "size": 32,
  "color": "#000000",
  "width": 40,
  "height": 10,
  "prefix": "Hi ",
  "suffix": "!",
  "padding": 12,
  "fallback": "Friend",
  "background_color": "#FFFFFF"
}
```

Another test template: `82624b35-1ef6-4c49-a1e0-9b94a2c3d8cd`
```json
{
  "x": 30,
  "y": 80,
  "font": "Poppins",
  "size": 32,
  "color": "#000000",
  "width": 40,
  "height": 10,
  "prefix": "",
  "suffix": "",
  "padding": 12,
  "fallback": "Friend",
  "background_color": "#FFFFFF"
}
```

---

## Key Code Sections

### SVG Text Creation (route.tsx lines 135-223)
```javascript
function createTextSvg(text, width, height, config) {
  const centerX = (config.x / 100) * width;
  const centerY = (config.y / 100) * height;
  // ... creates SVG with text at centerX, centerY
  // Uses text-anchor="middle" and dominant-baseline="central"
}
```

### Image Processing (route.tsx lines ~295-345)
```javascript
// Resize image first
const resizedImage = sharp(imageBuffer).resize(800, null, {...});

// Get resized dimensions
const metadata = await sharp(resizedBuffer).metadata();
const width = metadata.width!;
const height = metadata.height!;

// Scale font size proportionally
const scaleFactor = width / originalWidth;
const scaledFontSize = Math.round((cfg.size || 32) * scaleFactor);

// Create SVG at resized dimensions
const textSvg = createTextSvg(displayText, width, height, {...});

// Composite
const outputBuffer = await sharp(resizedBuffer)
  .composite([{ input: textSvg, top: 0, left: 0 }])
  .jpeg({ quality: 80, mozjpeg: true })
  .toBuffer();
```

---

## What Needs To Be Fixed

### Priority 1: Position Match
The text position in the API output MUST match where the user positioned it in the editor canvas. This is critical - users will be upset if their carefully positioned text appears somewhere else.

### Debugging Steps for Next Session:
1. Add debug output showing exact pixel positions calculated
2. Compare CSS positioning math vs SVG positioning math
3. Test with a simple case: x=50%, y=50% (dead center) - does it appear centered?
4. Test with edge cases: x=0%, y=0% and x=100%, y=100%
5. Check if the box width/height affects perceived position

### Possible Solutions:
1. **Match the math exactly** - Ensure SVG positioning uses identical formula to CSS
2. **Use pixel positions** - Store x/y as pixels instead of percentages, scale on resize
3. **Add position calibration** - Apply offset correction based on testing
4. **Don't resize the image** - Keep original dimensions, compress only

---

## Phase 4 Remaining Work

After fixing positioning:
- [ ] Feature 39: URL Generator polish (copy buttons, instructions)
- [ ] Test with various templates and names
- [ ] Handle crop/flip transforms in API
- [ ] Add render count tracking
- [ ] Documentation for users

---

## Next Session Prompt

```
## Continue Feature 38/39 - Fix Image Position Mismatch

### Context
Read: docs/features/feature-38-39-session-2-handoff.md

### The Bug
Text position in API-generated images does NOT match where user positioned it in the editor canvas. User places text in bottom-left, API renders it somewhere else.

### Current Implementation
- Sharp-based image generation (Node.js runtime)
- SVG text overlay with embedded Google Font
- JPEG output ~83KB (file size is good)
- Image resized to 800px width

### The Core Problem
Editor canvas CSS positioning doesn't match API SVG positioning:
- CSS: `left: X%, top: Y%, transform: translate(-50%, -50%)`
- SVG: `x={centerX}, y={centerY}, text-anchor="middle", dominant-baseline="central"`

### Debug Steps
1. Test x=50%, y=50% - should be dead center in both
2. Compare pixel calculations between CSS and SVG
3. Check if resize scaling affects position differently
4. Look at how box width/height is used (or not used) in API

### Files to Examine
- `app/api/images/[templateId]/route.tsx` - SVG creation and positioning
- `app/(dashboard)/images/[id]/_components/editor-canvas.tsx` - CSS positioning

### Test Templates
- `6acefd9c-ad1d-4ae3-add3-395d749cd571` (x=50%, y=39%)
- `82624b35-1ef6-4c49-a1e0-9b94a2c3d8cd` (x=30%, y=80%)

### Goal
Make the API output position EXACTLY match the editor canvas position. What you see in the editor is what you get in the email.
```

---

## Build Status
✅ Build passes as of end of session
