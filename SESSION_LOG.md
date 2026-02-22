# Session Log — Agency Toolkit

> Claude Code updates this file at the end of every coding session.
> The command-center repo reads this file to track cross-project progress.
> Most recent entries go at the top.

---

<!-- New entries go below this line. Most recent first. -->

## 2026-02-22 — Add Owner Name to Upload Flow + Customer Details

### What I did
- **DB migration**: Added `owner_name text` column to `customers` table via Supabase MCP
- **Types**: Added `owner_name: string | null` to `Customer` interface in `types/database.ts`
- **Upload API** (`app/api/photos/upload/route.ts`): Accepts optional `owner_name` from form data, stores on new customers, backfills on existing customers if currently null. Made `business_name` optional (defaults to "Unknown Business")
- **Embed modal** (`app/embed.js/route.ts`): Added Owner Name input field below Business Name, removed `*` required indicator from Business Name, wired up event listeners, sends `owner_name` in form data. Submit only requires photos
- **Standalone upload page** (`app/(embed)/upload/_components/upload-form.tsx`): Added Owner Name input, made Business Name optional, sends `owner_name` in form data
- **Customer edit form** (`app/(dashboard)/customers/[id]/_components/customer-edit-form.tsx`): Added Owner Name field below Customer Name, included in save
- **Customer actions** (`app/(dashboard)/customers/_actions/customer-actions.ts`): Added `owner_name` to `UpdateCustomerData` interface and update query

### What's next
- Test end-to-end: embed modal upload with owner name, standalone page upload, customer detail edit
- Continue with post-ship improvements from `docs/features/images-post-ship-improvements.md`

### Blockers
- None

### Cross-project notes
- None

---

## 2026-02-21 — Personalized Images: Save Image Transforms + Testing

### What I did
- **Documented post-ship improvements** (`docs/features/images-post-ship-improvements.md`) — P1-P6 covering: add customer to existing template, rename template, phone mockup previews, undo stack depth, redo button, table view with stats. Also deferred Phase 5 GHL integration testing.
- **Built detailed testing plan** for the Personalized Images module (Phases 1-6)
- **Fixed B1: Image transforms now save** — zoom, pan, flip, fit/fill were never persisted (canvas-only state). Added:
  - `ImageTemplateImageConfig` type (crop region as percentages + flip flags) in `types/database.ts`
  - Crop calculation in `fabric-canvas.tsx` — fires `onImageConfigChange` after every image transform, restores saved config on page load
  - Debounced save in `image-editor.tsx` via `updateImageTemplate(id, { image_config })`
  - API route applies Sharp `extract()` + `flop()`/`flip()` before resize — backward compatible
- **Fixed B2: Card thumbnail stale cache** — added `&v=${template.updated_at}` cache-buster to preview URL in `template-card.tsx`
- **Defaulted Guidely list pages to table view** + made entire table rows clickable (from earlier in session)

### What's next
1. **Run DB migration** — `ALTER TABLE image_templates ADD COLUMN IF NOT EXISTS image_config JSONB DEFAULT NULL;` (Supabase MCP wasn't connected)
2. **Test image save end-to-end** — zoom/pan/flip should persist on refresh and match API output
3. **Phase 5 GHL integration testing** — deferred until GHL is set up
4. Post-ship improvements (P1-P6) from `docs/features/images-post-ship-improvements.md`

### Blockers
- DB migration not yet applied (Supabase MCP not connected this session)

### Cross-project notes
- None

---

## 2026-02-18 — Guidely List View Default + Clickable Rows

### What I did
- **Resolved all previous "What's Next" items** — undo/redo (already fixed in `b333834`), Menu/Colors save indicator, first-scan-empty timing, and Guidely builder rename display all confirmed working.
- **Defaulted Guidely list pages to table view** — changed `ViewToggle` default from `'grid'` to `'table'`, and updated initial state in all 4 list clients (Tours, Checklists, Tips, Banners). Users with existing localStorage preference keep their choice.
- **Made entire table row clickable** — `GuidelyDataTable` rows now navigate to the item editor on click (`cursor-pointer` + `hover:bg-muted/50`). Actions menu (`...`) has `stopPropagation` to prevent accidental navigation. Removed the `<Link>` wrapper from the name column (whole row handles it now).

### What's next
1. Review `docs/SPRINT.md` for upcoming features or polish items
2. Address pre-existing lint errors across codebase (many files have React hooks warnings, unescaped entities, etc.)

### Blockers
- None

---

## 2026-02-18 — Verified Undo/Redo Already Fixed

### What I did
- **Investigated undo/redo on login designer page** — reported broken since Feb 15 panel architecture refactor (`54c11b0`). Traced the full state flow: `useHistory<DesignState>` → wrapper setters (`setElements`, `setFormStyle`, `setBackground`) → child component callbacks.
- **Found it was already fixed** in commit `b333834` — that commit consolidated `elements`, `formStyle`, and `background` into a single `useHistory<DesignState>`, replacing the old setup where only `elements` was history-tracked while `formStyle` and `canvas` were separate `useState` calls.
- **Tested in browser** — confirmed all scenarios work: background layout changes, form style quick styles (Dark Mode etc.), position input changes, Cmd+Z / Cmd+Shift+Z keyboard shortcuts, toolbar undo/redo buttons, multi-step undo/redo chains, visual canvas updates on undo/redo.

### What's next
1. **Menu/Colors pages save indicator** — persistent "Saved X ago" near the title
2. **First-scan-empty timing issue** — occasionally the first custom link scan returns nothing
3. **Guidely builder mode rename display**

### Blockers
- None

---

## 2026-02-17 — Custom Menu Links via Sidebar Scan + Rename Bug Fix

### What I did
- **Custom Menu Links feature (full implementation)**:
  - Added `CustomMenuLink` type and extended `MenuConfig` in `types/database.ts`
  - Created `use-sidebar-scanner.ts` hook — opens GHL sub-account tab, detects custom links via embed script, communicates results via postMessage/BroadcastChannel/localStorage
  - Extended embed script (`app/embed.js/route.ts`) with `initSidebarScan()` — scans `#sidebar-v2` DOM, sends results back, auto-closes tab
  - Replaced placeholder `custom-links-section.tsx` with full UI: scan button, toggle visibility, rename, error states
  - Wired custom link state into `menu-client.tsx` (state, handlers, buildConfig, autosave)
  - Added custom links to `MenuPreview` with divider and ExternalLink icons
  - Threaded `ghlDomain` and `sampleLocationId` through `getMenuSettings()` → `MenuTabContent` → `MenuClient`
  - Added embed script CSS injection for hiding/renaming custom links

- **Fixed critical rename bug**: GHL added `-webkit-text-fill-color: transparent` to sidebar spans, making `::after` rename text invisible. Added explicit `color` and `-webkit-text-fill-color` overrides on all `::after` pseudo-elements. Debugged via Playwright on live GHL page.

- **Fixed custom link text color**: Added `#sidebar-v2 nav a` selectors to color CSS so custom links match the theme sidebar text color.

- **Fixed scan URL**: Changed from opening agency dashboard (where embed script doesn't run) to opening a sub-account URL (`/v2/location/{locationId}/dashboard`).

- **Fixed duplicate scan results**: GHL renders expanded + collapsed sidebar variants. Added deduplication by label+href in both `performSidebarScan()` and `processScanResults()`.

- **Fixed custom links not persisting on refresh**: `handleScanComplete` had a stale closure bug — `triggerAutosave()` captured an old `buildConfig` that missed the new custom_links. Now saves directly with new links.

- **Added GHL help collapsible**: "Managing custom links in GHL" section with step-by-step instructions for adding/deleting links in GHL Settings. Shows in both empty and populated states.

- **Added GHL-native divider in preview**: Auto-renders divider between core group (Launchpad–Payments) and tools group (Marketing, Reputation, etc.), matching real GHL sidebar.

- **Preview layout improvements**: Fixed 280px center column (was flex-1), 220px sidebar preview width, left-aligned. Wider template panel (280px default) and menu items panel (500px default). Auto-height instead of fixed 600px.

### What's next
1. **First-scan-empty timing issue** — occasionally the first scan returns nothing (GHL sidebar hasn't loaded yet). Could add a longer wait or retry logic in `initSidebarScan()`.
2. **Custom links are per-sub-account** — scan uses one sample location ID. If different sub-accounts have different custom links, only one set is captured. Could add location picker or multi-scan support later.
3. **Menu/Colors pages save indicator** — persistent "Saved X ago" near the title
4. ~~**Fix undo/redo on login page**~~ — verified working (fixed in `b333834`)

### Blockers
- None

### Cross-project notes
- The `-webkit-text-fill-color: transparent` issue is a GHL platform CSS change. Any CSS rename trick using `visibility: hidden` + `::after` on GHL sidebar elements must include `-webkit-text-fill-color` override or the text will be invisible. Documented in memory.

## 2026-02-16 — Theme Builder: Sidebar Navigation Redesign

### What I did
- **Renamed `/theme-builder` → `/theme`** — moved folder, updated all source code references (main nav, server actions, revalidatePath calls, help mappings, cross-module links)
- **Created sidebar layout** matching Guidely's architecture: `ThemeSidebar` (collapsible with icons, localStorage persistence), `ThemeMobileNav` (sheet drawer), `ThemeLayoutClient` (responsive desktop/mobile)
- **Created landing page** at `/theme` with Quick Actions card, compact status summary row (shows configured/not configured per section), and Deploy cards (reused `EmbedCodeDisplay` + `CssExportCard` from settings)
- **Split tabs into sub-routes**: `/theme/login`, `/theme/menu`, `/theme/colors` — each renders existing tab content components
- **Removed old components**: `ThemeBuilderContent`, `ThemeHeader`, `ActivationToggle`, `ThemeTabs` (component), `use-auto-save` hook
- **Added basic `SectionHeader` component** — NEEDS WORK: currently just title + save status text, needs to match login page's toolbar style with action buttons (Preview, Save, etc.) on the right side
- **Kept `TabId` type** in `theme-tabs.tsx` (still needed by context), kept `ThemeStatusProvider` wrapping menu/colors pages
- Build passes clean

### INCOMPLETE — Menu/Colors Header Toolbar
The login page has a full toolbar: "My Login Design" + undo/redo + Grid/Preview/Save buttons. The `SectionHeader` component added to menu and colors pages only renders a title + "Saved X ago" text — it does NOT have the action buttons. This needs to be reworked to match the login page's toolbar pattern. The `SectionHeader` is at `theme/_components/section-header.tsx`. The menu page already has its own `isSaving` state and autosave logic — the header just needs to surface that properly with visible controls.

### What's next (priority order)
1. **Menu/Colors pages need persistent "Saved X ago"** — NOT undo/redo (that's login-only). Just a persistent save indicator near the title so users know their autosaved changes are committed. Toast alone isn't enough.
2. **Fix undo/redo on login page only** — was working before 2026-02-15 panel refactor. Hook at `login/_hooks/use-history.ts`, wired in `login-designer.tsx`
3. **Custom Menu Links MVP** — manual text entry. User types in their custom link names. NO embed script detection needed yet. Just let them add/remove custom link entries that show in preview. Embed script detection can come later.
4. **Guidely builder mode rename display** — do when working on Guidely, not now
5. Add "last copied" timestamp to deploy cards (stored in DB)
6. Add status chips (green dots) to sidebar items showing configured state
7. Add keyboard shortcuts (Cmd+1/2/3) for section navigation

### Architecture Notes
- Theme Builder now mirrors Guidely's pattern: layout.tsx → sidebar + content area
- All three sections (Login, Menu, Colors) are CSS-based — no Active toggles needed anywhere
- `ThemeStatusContext` still exists for menu/colors save coordination but could be simplified later
- Help articles still live under `/help/theme-builder/` (unchanged routes)
- GHL Custom Menu Links API exists (OAuth + `/custom-menus/` endpoints) but requires Marketplace App setup — using embed script approach instead

### Key Files (New/Modified)
| File | Purpose |
|------|---------|
| `theme/layout.tsx` | Sidebar layout wrapper (new) |
| `theme/_components/theme-sidebar.tsx` | Collapsible sidebar nav (new) |
| `theme/_components/theme-mobile-nav.tsx` | Mobile sheet nav (new) |
| `theme/_components/theme-layout-client.tsx` | Responsive layout (new) |
| `theme/_components/section-header.tsx` | Section header — NEEDS REWORK (new) |
| `theme/page.tsx` | Landing page with Quick Actions + Deploy cards (rewritten) |
| `theme/login/page.tsx` | Login sub-route (new) |
| `theme/menu/page.tsx` | Menu sub-route (new) |
| `theme/colors/page.tsx` | Colors sub-route (new) |
| `components/dashboard/main-nav.tsx` | Updated href to `/theme` |
| `menu/_actions/menu-actions.ts` | revalidatePath → `/theme` |
| `colors/_actions/color-actions.ts` | revalidatePath → `/theme` |

### Blockers
- None

### Cross-project notes
- None

---

## 2026-02-15 — Login Designer: Panel Architecture Overhaul

Full details: `docs/features/login-designer-refactor.md`

### What I did
- Moved background image controls from left panel to right Properties panel (URL, layout presets, position/size, blur, overlay)
- Removed Form tab — left panel is now single Elements view with clickable Login Form card
- Moved form style controls to right Properties panel (context-dependent: form props when form selected, bg props when deselected)
- Added form logo feature: `form_logo_url` + `form_logo_height` with CSS `::before` export on `.login-card-heading`
- Rewrote form-style-panel with collapsible sections: Form Logo, Container, Heading, Colors, Quick Styles
- Built shared color picker: 6 main + 3 advanced swatches in 2-col grid, click to open single picker
- Fixed blur bleeding onto form — isolated to separate absolutely-positioned div
- Removed layer controls (not useful for CSS-only, one element type)
- Filtered old image elements from canvas rendering
- Removed chevron carets from position centering buttons for more input space
- Created `docs/features/login-designer-refactor.md` tracking all 3 sessions of work

### What's next
1. Browser test collapsible sections, shared color picker, blur isolation
2. GHL CSS test — paste generated CSS, verify form logo renders via `::before`
3. Commit all uncommitted files (~15 modified)
4. Preview mode badge — ensure visible on all presets
5. Vertical position fine-tuning (0.55 scale factor)

### Blockers
- Lint command misconfigured (`pnpm lint` interprets "lint" as directory) — needs package.json fix
- GHL 2FA login cycle makes CSS testing slow

### Cross-project notes
- None

---

## 2026-02-15 — Login Editor Tab Restructure + Project Tooling

### What I did
- **Committed previous session's work** in 2 commits: login CSS-only overhaul (e0ca362) + project tooling (7b859f2)
- **Fixed build error**: `activation-toggle.tsx` referenced removed `loading` tab — removed stale entries
- **Restructured login editor tabs** from 3 (Elements/Background/Form) → 2 (Elements/Form)
  - Merged Background panel into Elements tab as collapsible section
  - Moved Login Header toggle + agency logo override from Form tab to Elements tab
  - Added image position presets: Full Cover, Left Half, Right Half, Above Form
  - Custom position/size text inputs for advanced CSS values
- **Removed draggable image element** — background images now use CSS `background-position`/`background-size` via presets + inputs instead of drag-and-drop
- **Updated CSS export** to use new `image_position`/`image_size` background fields; fixed gradient CSS export
- **Removed loading animation from embed.js** — call disabled, function preserved for potential future use
- **Researched form logo CSS injection** — YES it works via `::before` + `background-image` on `.login-card-heading`
- **Added project tooling**: CLAUDE.md Session Workflow + Key Files sections, beginsession/endsession skills, .claude-rules.md, SESSION_LOG.md
- **Added `image_position` and `image_size` fields** to `LoginDesignBackground` type

### What's next
1. **Test the new Elements tab** in browser — verify background presets, header toggle, and collapsible sections work
2. **Implement form logo CSS export** — use `::before` + `background-image` on `.login-card-heading`
3. **Preview Mode badge** — ensure visible on all presets
4. **Vertical position fine-tuning** — 0.55 scale factor may need adjustment
5. **GHL testing** — paste generated CSS, verify background position presets map correctly
6. **Commit this session's work** (not yet committed — 9 modified files)

### Blockers
- GHL 2FA login cycle makes CSS testing slow
- Form logo needs live GHL DOM testing to confirm `::before` approach

### Cross-project notes
- Created reusable beginsession/endsession skill pattern at `.claude/skills/` — could be templated for other projects

## 2026-02-14 / 2026-02-15 — Login Editor Redesign: CSS-Only Reality Check

### Summary
Major overhaul of the Login Page editor to strip it down to what CSS can actually do on GHL login pages. Previously the editor offered text blocks, shapes, testimonials, and buttons as draggable elements — none of which appear on the real GHL login page because GHL only loads Custom CSS (not Custom JS) on login. The editor was making promises it couldn't keep.

### What Was Built

**CSS Export Fixes (css-export-card.tsx)**
- Fixed input selectors: `.form-control` → `.hl-text-input` (GHL's actual class)
- Fixed label selectors: `label, .form-label` → `.hl-text-input-label`
- Fixed button selectors: `.btn.btn-blue` → `button.hl-btn, button[type="submit"]`
- Fixed ghost layer bug: was applying form background to 3 nested selectors (`.hl_login--body`, `.card`, `.card-body`), creating stacked transparent rectangles. Now correctly splits: `.card` = reset + positioning, `.card-body` = all visual styling
- Added heading text replacement: blank = `display: none`, custom text = CSS `::after` technique, default = color only
- Added Google Sign-In hide CSS: targets `#wl_google_login_button`, `#g_id_signin`, and "Or Continue with" divider
- Added Login Header hide CSS: targets `div.hl_login--header`
- Added secondary text color: targets "Or Continue with" and footer text
- Proportional form positioning: canvas X → `margin-left`/`margin-right` on `.card`, canvas Y → `padding-top` on `.hl_login--body` (scaled by 0.55 factor for 16:9→viewport conversion, clamped to 40vh max)
- Proportional image mapping: element width% → `background-size`, element X → `background-position`

**Editor Cleanup**
- Removed non-exportable element types from palette: text, testimonial, shape, button
- Merged image + gif into single "Image / GIF" element
- Removed text elements from all 4 presets (centered, split-left, split-right, gradient-overlay)
- Removed dead rendering branches in canvas.tsx, preview-modal.tsx
- Removed dead properties panel sections (TextProperties, GifProperties, TestimonialProperties, ShapeProperties, ButtonProperties)
- Removed dead createNewElement branches in login-designer.tsx
- Added CSS-only info box explaining editor limitations

**New Form Controls (form-style-panel.tsx)**
- Google Sign-In toggle (show/hide)
- Login Header toggle (show/hide `hl_login--header`)
- Heading helper text (contextual hints: blank=hidden, custom=replaced, default=color only)
- Secondary text color picker
- Border rendering fix: checks `border_width > 0` instead of color truthy

**Removed Duplicate Controls**
- Form Width slider from Form tab (canvas element width is the source of truth)
- Corner Radius from Properties panel (now only in Form tab)

**Type Changes (types/database.ts)**
- Added `hide_google_signin?: boolean` to LoginDesignFormStyle
- Added `hide_login_header?: boolean` to LoginDesignFormStyle
- Added `secondary_text_color?: string` to LoginDesignFormStyle

### GHL Verification Status
- [x] Outer `.card` border gone (transparent bg, no border, no shadow)
- [x] Form positioned horizontally (left/right margins on `.card` working)
- [x] Form visual styling on `.card-body` correct (bg, border, radius)
- [x] Heading text replacement working (custom text via `::after`)
- [x] Google sign-in hidden when toggled off
- [x] Vertical positioning working (proportional from canvas Y position)
- [ ] Login header hide toggle — needs GHL test
- [ ] Image position mapping — needs more testing
- [ ] Multi-viewport testing

### Architecture Decisions Made (for next session)

**1. Two tabs: Elements + Form** — Drop Background as its own tab. Merge background controls into the Elements tab.

**2. Elements tab restructure:**
- **Background card (expandable)**: Dropdown with two options:
  - **Color** — Uses the existing CustomColorPicker which already has Color/Gradient/Theme tabs built in. No separate "Gradient" dropdown option needed.
  - **Image/GIF** — URL input (upload or paste) + positioning controls:
    - X position slider (0-100%) → CSS `background-position` horizontal
    - Y position slider (0-100%) → CSS `background-position` vertical
    - Width/size slider → CSS `background-size`
    - Canvas preview updates live as sliders are adjusted
    - `background-repeat: no-repeat` always set
  - **Key insight**: Image/GIF is NOT a draggable canvas element. It's a CSS background property. Sliders provide the positioning control instead of drag-and-drop. This is more honest about what CSS can do.
  - **Verified**: Solid color + small positioned GIF works in CSS (e.g., white bg with small animated GIF above centered form). `background-color` and `background-image` are separate CSS properties that layer correctly.
  - **Limitation**: Gradient + GIF requires CSS multiple backgrounds syntax — edge case for later.
- **Header section**: Toggle show/hide for `div.hl_login--header`. When shown, expandable section with agency logo URL override (CSS `content: url(...)` on header img).
- **Login Form info card** + **CSS-only customization info card**

**3. Image/GIF positioning uses slider-based approach** — NOT drag-and-drop. The image is a background, not a layer. Sliders map to CSS `background-position` and `background-size` percentages.

**4. Login Form stays as the ONLY draggable element** on the canvas. Its X/Y position maps proportionally to CSS margins (horizontal) and padding-top (vertical).

**5. Logo clarification — TWO separate logos:**
- **Header logo** (`div.hl_login--header img`): Agency owner's company logo in the GHL header bar. Override via CSS `content: url(...)`. This lives under the Header toggle in Elements tab.
- **Form logo** (`logo_url` in LoginDesignFormStyle): A logo displayed inside the form card itself. Currently exists as a field in the Form tab with FileUpload component. **HOWEVER**: This form logo is rendered in the editor preview but may NOT be achievable via CSS on the real GHL page — the form card's HTML structure doesn't have a logo element we can target. **Needs investigation**: Can we inject a logo into `.card-body` via CSS `::before` with `content: url(...)`? If not, this option should be removed to avoid false promises.

**6. Loading animation**: Needs to be removed from JS embed since it was removed from Theme Builder UI but still fires on the login page.

### Files Modified (10 files)
All paths relative to `app/(dashboard)/`:
1. `settings/_components/css-export-card.tsx` — CSS export (selectors, containers, heading, Google hide, header hide, position mapping)
2. `login/_components/element-panel.tsx` — stripped to image/gif only, overflow fix
3. `login/_components/preset-picker.tsx` — removed text elements from presets
4. `login/_components/properties-panel.tsx` — removed dead sections + duplicate controls
5. `login/_components/canvas.tsx` — removed non-exportable type rendering
6. `login/_components/preview-modal.tsx` — same cleanup
7. `login/_components/form-style-panel.tsx` — heading hints, Google toggle, header toggle, secondary text color
8. `login/_components/login-designer.tsx` — removed createNewElement branches
9. `login/_components/elements/login-form-element.tsx` — heading hide, Google hide, border fix, secondary text
10. `types/database.ts` — added hide_google_signin, hide_login_header, secondary_text_color

### What's Next (Priority Order)
1. **Restructure tabs** — Merge Background into Elements tab, remove Background tab. Two tabs: Elements + Form.
2. **Image/GIF as background controls** — Replace draggable image element with slider-based positioning in Background card. X/Y/width sliders → live canvas preview → CSS `background-position`/`background-size`.
3. **Header toggle + agency logo override** — Move from Form tab to Elements tab under Header section.
4. **Form logo investigation** — Can we inject a logo into `.card-body` via CSS `::before`? If not, remove the form logo option entirely.
5. **Remove loading animation from JS embed** — User confirmed: if it's not in the Theme Builder UI, it shouldn't be in the embed.
6. **Preview Mode badge** — Ensure visible on all presets (reported missing on "image on left").
7. **Vertical position fine-tuning** — 0.55 scale factor is an approximation, may need adjustment.
8. **More GHL testing** — Different viewport sizes, gradient + image edge case.

### Blockers
- GHL 2FA login cycle makes testing slow and frustrating — each CSS paste requires full re-auth
- No way to preview CSS changes on GHL without pasting into production settings
- Form logo feasibility via CSS unknown — needs GHL DOM investigation

### GHL DOM Reference (Verified via DevTools)
```
section.hl_login                           ← Page background
  div.hl_login--header                     ← Logo + language (1247×106px) — CAN HIDE
  div.hl_login--body                       ← Wide wrapper — VERTICAL POSITIONING
    div.container-fluid
      div.card                             ← Outer card (~550px) — RESET + HORIZONTAL POSITIONING
        div.card-body                      ← THE form (376px) — ALL VISUAL STYLING
          div.login-card-heading
            h2.heading2
          form
            span.hl-text-input-label
            input.hl-text-input
            button.hl-btn
          button#wl_google_login_button
          p.foot-note
```
