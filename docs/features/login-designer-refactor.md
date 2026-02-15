# Login Designer Refactor — Panel Architecture & CSS-Only Cleanup

**Started:** 2026-02-15 (continued across sessions)
**Status:** In Progress

---

## Goal

Restructure the Login Page Designer from a multi-element canvas editor to a focused CSS-only tool. GHL login pages only load Custom CSS, so the editor should only promise what CSS can deliver.

## Architecture

Three-panel layout: Left (element selection) | Center (canvas preview) | Right (properties)

### Left Panel — Element Selection
- **Background**: Type selector (Color/Gradient vs Image/GIF), color picker, gradient presets. When image type is selected, a hint points to the right panel for controls.
- **Login Header**: Toggle show/hide + agency logo override (FileUpload)
- **Login Form**: Clickable card that selects the form and shows its properties on the right
- **CSS-only info card**

### Right Panel — Properties (context-dependent)
- **Nothing selected + image bg**: Background Image properties (URL, layout presets, custom position/size, blur, overlay)
- **Login form selected**: Position/Size, then collapsible Form Style sections

### Center — Canvas
- 16:9 aspect ratio, drag-to-reposition login form
- Background rendered via CSS properties (not canvas elements)
- Blur isolated to separate div so it doesn't affect form

---

## Completed Work

### Session 1 (2026-02-15, first session)
- Stripped non-exportable element types (text, testimonial, shape, button)
- Fixed CSS export selectors for GHL DOM
- Added form controls: Google toggle, header toggle, heading text, secondary text color
- Proportional position mapping (canvas → CSS margins/padding)
- Removed loading animation from embed.js

### Session 2 (2026-02-15, second session)
- Merged 3 tabs (Elements/Background/Form) → 2 tabs (Elements/Form)
- Replaced draggable image elements with CSS background controls
- Image position presets: Full Cover, Left Half, Right Half, Above Form
- Custom position/size text inputs for advanced CSS values
- Updated CSS export for new background fields
- Added `image_position` and `image_size` to LoginDesignBackground type
- Converted split presets to use background fields

### Session 3 (current)
- **Moved background image controls** from left panel to right Properties panel
- **Removed Form tab** — left panel is now single Elements view (no tabs)
- **Moved form style** to right Properties panel (shown when login-form selected)
- **Form logo feature** — `form_logo_url` + `form_logo_height` (40-100px, constrained)
  - Preview renders logo above heading in form card
  - CSS export: `::before` + `background-image` on `.login-card-heading`
- **Background image UX improvements**:
  - Layout presets always visible, Custom Position/Size collapsed
  - Overlay opacity defaults to 0 (slide up to enable), color picker appears when > 0
  - Blur slider: 0 = off, no toggle
- **Blur isolation** — separate div prevents blur from affecting form elements
- **Removed layer controls** — not useful for CSS-only (one element type)
- **Login Form card clickable** on left panel to select form and show properties
- **Collapsible form style sections**: Form Logo, Container, Heading, Colors, Quick Styles
- **Shared color picker** — 6 main swatches + 3 advanced in grid, click to open single picker
- **Filtered old image elements** — canvas only renders login-form type now

---

## Files Modified (Session 3)

| File | Changes |
|------|---------|
| `properties-panel.tsx` | Background image controls, form style rendering, removed layers, wider inputs |
| `element-panel.tsx` | Moved image controls out, added onSelectForm callback |
| `form-style-panel.tsx` | Full rewrite: collapsible sections, shared color picker |
| `login-designer.tsx` | Removed tabs/Form tab, removed layer handlers, pass new props |
| `canvas.tsx` | Blur isolation (separate div), filter to login-form only |
| `preview-modal.tsx` | Same blur isolation + filter |
| `login-form-element.tsx` | Form logo rendering, removed old logo placeholder |
| `css-export-card.tsx` | Form logo CSS (::before on .login-card-heading) |
| `preset-picker.tsx` | Split presets use background fields |
| `types/database.ts` | Added form_logo_url, form_logo_height |

---

## What's Next

1. **Browser test** collapsible sections, shared color picker, blur isolation
2. **GHL CSS test** — paste generated CSS, verify form logo renders
3. **Preview mode** — ensure badge visible on all presets
4. **Vertical position fine-tuning** — 0.55 scale factor may need adjustment
5. **Commit this session's work** (many uncommitted files)

---

## Type Changes

```typescript
// LoginDesignBackground (added)
image_position?: string;  // CSS background-position
image_size?: string;      // CSS background-size

// LoginDesignFormStyle (added)
form_logo_url?: string;       // Logo inside form card (CSS ::before)
form_logo_height?: number;    // 40-100px, default 60
```
