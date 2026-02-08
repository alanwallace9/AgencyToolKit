# Feature 49: Login Page CSS Export

## Status: Planned

## Overview

Add login page CSS generation to the existing Generated CSS section in Settings → Embed Code. Converts the canvas-based login design into pure CSS using GHL's `.hl_login` selectors, which load on the login page (unlike Custom JS which only loads after authentication).

---

## Background / Why This Is Needed

### The Problem
GHL has two custom code injection points:
- **Custom JS** (Agency → Settings → Company): Only loads AFTER authentication — dashboard/app pages only
- **Custom CSS** (Agency → Settings → Company → Whitelabel): Loads on ALL pages INCLUDING the login page

The embed script (`embed.js`) uses the Custom JS field. It handles menu customization, colors, loading animations, and login design — but the login design can never actually apply on the login page because GHL doesn't execute Custom JS there.

### The Solution
Generate login page CSS from the existing login_design data and include it in the Generated CSS output that users already copy into GHL's Custom CSS field. No workflow change for the user.

### Validated On
- **Date**: 2026-02-07
- **GHL Instance**: `app.getrapidreviews.com`
- **Test**: Hand-crafted CSS using `.hl_login` selectors pasted into GHL Custom CSS field
- **Result**: Background color, background image split, form positioning, button colors all applied correctly on the login page
- **Tweaks needed**: Heading color and label color selectors need fine-tuning

---

## GHL Login Page Selectors (Confirmed Working)

| Selector | Element | Verified |
|----------|---------|----------|
| `.hl_login` | Main login container / full page background | Yes |
| `div.hl_login--body` | Login form card/wrapper | Yes |
| `.hl_login--header` | Header area (logo/branding) | Yes |
| `.hl_login .form-control` | Input fields (email, password) | Yes |
| `.hl_login .btn.btn-blue` | Sign-in button | Yes |
| `.hl_login--body .heading2` | "Sign into your account" heading | Partial |
| `.hl_login label` | Form labels (Email, Password) | Partial |
| `.hl_login a` | Links (Forgot password, Terms) | Yes |

**Note**: "Partial" means the selector works but the styling didn't fully override — may need more specific selectors or `!important` chains. Should inspect DOM in next session to confirm exact selectors.

---

## Login Design Data Model (Existing)

The login design is stored in the `login_designs` table with this structure:

### Canvas
```typescript
canvas: {
  width: 1600,       // Virtual canvas width
  height: 900,       // Virtual canvas height
  background: {
    type: 'solid' | 'gradient' | 'image',
    color?: string,
    gradient?: { from: string, to: string, angle: number },
    image_url?: string,
    image_blur?: number,
    image_overlay?: string,
  }
}
```

### Layout Types (6 presets)
| Layout | Description | Form Position |
|--------|-------------|---------------|
| `centered` | Centered form on solid background | Center |
| `split-left` | Image left, form right | Right side (~62% x) |
| `split-right` | Image right, form left | Left side (~12% x) |
| `gradient-overlay` | Background image with gradient overlay | Center |
| `minimal-dark` | Dark background, minimal form | Center |
| `blank` | Blank canvas | User-defined |

### Form Style
```typescript
form_style: {
  button_bg: string,       // Sign-in button background
  button_text: string,     // Sign-in button text color
  input_bg: string,        // Input field background
  input_border: string,    // Input field border color
  input_text: string,      // Input field text color
  link_color: string,      // Forgot password, Terms link color
  form_bg?: string,        // Form card background
  form_border?: string,    // Form card border color
  form_border_width?: number,
  form_border_radius?: number,
  label_color?: string,    // "Email", "Password" label color
  logo_url?: string,       // Custom logo URL
  form_heading?: string,   // Custom heading text
  form_heading_color?: string,
}
```

### Canvas Elements
Elements positioned on the canvas: `image`, `text`, `gif`, `login-form`, `testimonial`, `shape`, `button`

Each element has `x`, `y` (percentage), `width`, `height`, `zIndex`, and type-specific `props`.

---

## CSS Generation Strategy

### Section 1: LOGIN PAGE - Background & Layout
- Map `canvas.background` to `.hl_login` styles
- `solid` → `background-color`
- `gradient` → `background: linear-gradient()`
- `image` → `background-image` with `background-size: cover`
- For split layouts: `background-size: 50% 100%` with `background-position: right/left`

### Section 2: LOGIN PAGE - Form Container
- Map `form_style.form_bg`, `form_border`, `form_border_radius` to `div.hl_login--body`
- For split layouts: position form via `margin-left`/`margin-right: auto` and `max-width`
- `backdrop-filter: blur()` for glass effect when form_bg uses rgba

### Section 3: LOGIN PAGE - Heading
- Map `form_style.form_heading_color` or `label_color` to heading selectors
- `.hl_login--body .heading2`, `.hl_login--body h2`

### Section 4: LOGIN PAGE - Input Fields
- Map `input_bg`, `input_text`, `input_border` to `.hl_login .form-control`
- Include placeholder color if input_text is specified

### Section 5: LOGIN PAGE - Labels
- Map `label_color` to `.hl_login label`, `.hl_login .form-label`

### Section 6: LOGIN PAGE - Sign In Button
- Map `button_bg`, `button_text` to `.hl_login .btn.btn-blue`, `.hl_login button[type="submit"]`
- Include hover state (slightly darker)

### Section 7: LOGIN PAGE - Links
- Map `link_color` to `.hl_login a`, `.hl_login .text-link`

### Section 8: LOGIN PAGE - Logo (if custom)
- If `logo_url` is set, use CSS to replace/resize logo via `.hl_login--header img`

### Canvas Elements (images, text, etc.)
- For `image` elements: Generate CSS `::before`/`::after` pseudo-elements on `.hl_login` with absolute positioning, using percentages from the canvas element x/y/width/height
- For `text` elements: Generate positioned pseudo-elements with content, font-size, color, etc.
- **Limitation**: Complex canvas elements (GIFs, testimonials, shapes, buttons) may not be fully reproducible in pure CSS. Document which elements can and cannot be CSS-exported.

---

## Files to Modify

### 1. `app/(dashboard)/settings/embed/page.tsx`
- Query `login_designs` table for the default design (where `is_default = true`)
- Pass `loginDesign` prop to `EmbedSection`

### 2. `app/(dashboard)/settings/_components/embed-section.tsx`
- Accept `loginDesign` prop
- Pass it through to `CssExportCard`

### 3. `app/(dashboard)/settings/_components/css-export-card.tsx`
- Accept `loginDesign` prop (optional — null if no design exists)
- Add `generateLoginCss(loginDesign)` function
- Append login CSS after existing colors/menu sections
- Update stats description to include "login page"
- **Update line 266**: Remove "CSS alone cannot do login page customization" — replace with accurate info
- Update "What this CSS does" accordion to include login page description

### 4. New: `app/(dashboard)/settings/_lib/login-css-generator.ts` (optional)
- If the login CSS generation logic is complex, extract to a separate utility file
- Otherwise keep it in `css-export-card.tsx`

---

## CSS Output Format (with commented headers)

```css
/* ==========================================
   Agency Toolkit - Generated CSS
   Generated: 2026-02-08
   ========================================== */

/* -----------------------------------------
   COLORS - Sidebar & Buttons
   ----------------------------------------- */
/* ... existing color CSS ... */

/* -----------------------------------------
   MENU - Hidden Items
   ----------------------------------------- */
/* ... existing menu CSS ... */

/* -----------------------------------------
   MENU - Renamed Items
   ----------------------------------------- */
/* ... existing rename CSS ... */

/* -----------------------------------------
   LOGIN PAGE - Background & Layout
   Background: Dark green (#14532d)
   Image: Right side (50% split)
   ----------------------------------------- */
.hl_login {
  background-color: #14532d !important;
  background-image: url(...) !important;
  background-size: 50% 100% !important;
  background-position: right center !important;
  background-repeat: no-repeat !important;
  min-height: 100vh !important;
}

/* -----------------------------------------
   LOGIN PAGE - Form Container
   Position: Left side
   Background: rgba(255, 255, 255, 0.05)
   ----------------------------------------- */
div.hl_login--body {
  background: rgba(255, 255, 255, 0.05) !important;
  /* ... */
}

/* -----------------------------------------
   LOGIN PAGE - Heading
   ----------------------------------------- */

/* -----------------------------------------
   LOGIN PAGE - Input Fields
   Background: #ffffff
   Text: #111827
   Border: #d1d5db
   ----------------------------------------- */

/* -----------------------------------------
   LOGIN PAGE - Labels
   Color: rgba(255, 255, 255, 0.6)
   ----------------------------------------- */

/* -----------------------------------------
   LOGIN PAGE - Sign In Button
   Background: #2563eb
   Text: #ffffff
   ----------------------------------------- */

/* -----------------------------------------
   LOGIN PAGE - Links
   Color: #2563eb
   ----------------------------------------- */
```

---

## Scope

### In Scope
- Generate login page CSS from existing login_design data
- All 6 layout presets translate to CSS (centered, split-left, split-right, gradient-overlay, minimal-dark, blank)
- Form styling: button, input, label, link colors, form background/border
- Background: solid color, gradient, image (with split positioning)
- Text elements as CSS pseudo-elements (where feasible)
- Image elements as CSS background images (split layouts)
- Commented section headers for power user editability
- Update the "What this CSS does" and "Limitations" text

### Out of Scope (for now)
- Complex canvas elements (GIFs, testimonials, shapes, custom buttons) — these would need JS
- Logo replacement via CSS (limited browser support for `content: url()` on `<img>`)
- Mobile responsive login layout (would need `@media` queries — future enhancement)
- Real-time preview of login CSS on GHL (would need a different approach)

---

## Testing Plan

1. Generate CSS from the existing "My Login Design" (split-right layout, dark green, office photo)
2. Paste into GHL Custom CSS on `app.getrapidreviews.com`
3. Verify on login page: background, image, form position, button color, input fields, labels, heading
4. Test with other presets: centered, gradient-overlay, minimal-dark
5. Test with no login design (should output nothing for login section)
6. Verify the full Generated CSS still works for existing features (colors, menu)

---

## Dependencies
- Existing `login_designs` table and data model (Feature 14) — already built
- Existing `CssExportCard` component — already built
- GHL `.hl_login` selectors — validated 2026-02-07
