# Theme Builder - Decision Log

This document captures all decisions made during the Theme Builder consolidation project. Reference this if context is lost.

---

## Project Overview

**Goal**: Consolidate 4 separate customization pages (Login, Loading, Menu, Colors) into a unified Theme Builder with manila folder tabs, consistent UX, and reliable save/apply patterns.

**Phase 1**: Tab navigation shell - COMPLETE (2026-01-16)
**Phase 2**: Content migration, unified UX, save/apply pattern - IN PROGRESS
**Phase 3**: Subaccount targeting, theme assignment, logo per theme - FUTURE

---

## Key Decisions

### 1. Tab Order & Navigation

| Decision | Details |
|----------|---------|
| Tab order | Login → Loading → Menu → Colors (user journey progression) |
| URL structure | `/theme-builder?tab=login` (query params) |
| Old URLs | Keep as redirects: `/colors` → `/theme-builder?tab=colors` |
| Customize dropdown | Keep until Phase 2 complete and tested, then remove |
| Tab reordering | Admin can change order later based on user behavior; not user-configurable |

### 2. Manila Folder Tab Styling

| Decision | Details |
|----------|---------|
| Active tab | TOP accent line (not bottom), background matches card below |
| Inactive tabs | Muted background, visually "behind" active tab |
| Transition | Smooth crossfade between tabs (not instant, not jarring) |
| Connection | Active tab visually connects to card - feels like one unit |

### 3. Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Theme Builder                                     ● Saved 2 min ago       │
│  Customize your GHL white-label experience         [Preview] [Save]        │
│                                                                            │
│  Active: Sunset Ember (Colors) + Minimal (Menu) + Spinning Ring + Default  │
├────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                          │
│  │  Login  │ │ Loading │ │  Menu   │ │ Colors  │                          │
│  └────┬────┘ └─────────┘ └─────────┘ └─────────┘                          │
├───────┴────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌──────────────────────────┐  ┌────────────────────┐     │
│  │ Left Panel │  │      Center Panel        │  │    Right Panel     │     │
│  │   ~25%     │  │        ~50%              │  │       ~25%         │     │
│  │ (fluid)    │  │      (fluid)             │  │     (fluid)        │     │
│  │            │  │                          │  │                    │     │
│  │ Presets/   │  │    Preview/Canvas        │  │  Properties/       │     │
│  │ Elements/  │  │                          │  │  Settings/         │     │
│  │ Gallery    │  │                          │  │  Editor            │     │
│  └────────────┘  └──────────────────────────┘  └────────────────────┘     │
├────────────────────────────────────────────────────────────────────────────┤
│  Your [tab] settings are included in your embed code.                      │
│  [View in Settings] or [Apply CSS Only in Settings]                        │
└────────────────────────────────────────────────────────────────────────────┘
```

### 4. Panel Specifications

| Decision | Details |
|----------|---------|
| Panel widths | Fluid by default (responsive to screen size) |
| User resizable | Yes - drag handles to resize panels |
| Collapsible | Left and right panels can collapse for more canvas space |
| Menu tab exception | Right panel wider (banner options need space), center narrower |

### 5. Save vs Apply Pattern

| Action | What Happens | Button Text |
|--------|--------------|-------------|
| **Save** | Stores to database only. Can preview, share, come back later. NOT live. | "Save" |
| **Apply Live** / **Activate** | Makes it LIVE on subaccounts. Explicit action required. | "Activate" toggle or "Apply Live" button |
| **Deactivate** | Removes from live embed, but settings preserved in database | "Deactivate" toggle |

**Critical**: User should NEVER feel nervous about experimenting. Saving ≠ going live.

### 6. Per-Tab Activation Model

Each tab can be independently activated/deactivated:

| Tab | Can Be | Example Use Case |
|-----|--------|------------------|
| Login | Active/Inactive | User wants custom colors but default login |
| Loading | Active/Inactive | User wants menu changes but no custom loader |
| Menu | Active/Inactive | User only wants to customize the menu |
| Colors | Active/Inactive | User only wants brand colors applied |

**Revert to Default**: Only affects that specific tab, not other tabs.

**Per-Tab Toggle Location** - Within each tab's content area:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Login] [Loading] [Menu] [Colors]                                         │
├────┬────────────────────────────────────────────────────────────────────────┤
│    │                                                                        │
│    │   Colors                                        ●── Activated         │
│    │   ───────────────────────────────────────────────────────────────────  │
│    │                                                                        │
│    │   [3-panel content area...]                                           │
│    │                                                                        │
└────┴────────────────────────────────────────────────────────────────────────┘
```

**Activation Behavior:**
- Toggle appears at top of each tab's content area (next to tab title)
- User can build/save/preview without activating (safe experimentation)
- Activating makes that tab's settings go live in the embed
- Deactivating removes from embed but preserves settings in database

**Default State for New Agencies:**
- All tabs start "Deactivated"
- User explicitly chooses what to activate

### 6b. Pro Features (Tours, Images)

Pro features (Onboarding Tours, Personalized Images) are NOT part of Theme Builder tabs.

| Feature | Location | Activation |
|---------|----------|------------|
| Onboarding Tours | Separate "Pro" nav dropdown | Managed on Tours page |
| Personalized Images | Separate "Pro" nav dropdown | Managed on Images page |

**Settings Page** - "What does the script do?" section shows ALL features:
- Menu Customization - with activation status
- Login Page - with activation status
- Loading Animation - with activation status
- Dashboard Colors - with activation status
- Onboarding Tours (Pro) - with activation status
- Personalized Images (Pro) - with activation status

This provides one place to see everything the embed code includes.

### 7. CSS vs JavaScript Embed Strategy

| Plan | Embed Option | What It Includes |
|------|--------------|------------------|
| **Toolkit** | CSS-only | Colors + Menu + Loading + Login styling |
| **Pro** | JavaScript embed | CSS features + Tours + Personalized Images |

**Important**:
- ONE combined CSS snippet for all Theme Builder settings (not separate per tab)
- Pro users CAN choose CSS-only if they prefer
- JavaScript embed automatically includes CSS styling + Pro features
- Settings page has BOTH options available

### 8. Settings Page Embed Section

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Embed Code                                                                  │
│                                                                             │
│ OPTION 1: JavaScript Embed (Recommended)                                    │
│ Includes: Theme Builder + Tours + Personalized Images                       │
│ ┌─────────────────────────────────────────────────────────────────────┐    │
│ │ <script src="https://toolkit.../embed.js?key=al_xxx"></script>      │    │
│ └─────────────────────────────────────────────────────────────────────┘    │
│ [Copy Code]                                                                 │
│                                                                             │
│ OPTION 2: CSS Only (Theme Builder Only)                                     │
│ Includes: Colors + Menu + Loading + Login styling                           │
│ ┌─────────────────────────────────────────────────────────────────────┐    │
│ │ <style>/* Your Theme Builder CSS */...</style>                      │    │
│ └─────────────────────────────────────────────────────────────────────┘    │
│ [Copy CSS]                                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9. Bottom Section Per Tab

Each tab has this at the bottom:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Your [colors/menu/loading/login] settings are included in your embed code. │
│ Go to Settings to copy your embed code or apply CSS only.                   │
│ [View in Settings]                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10. Header Layout & Status Display

**Header Structure:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Theme Builder                                                              │
│  Customize your GHL white-label experience                                  │
│                                                                             │
│                                        ● Saved 2 min ago  [Preview] [Save]  │
│                                        ◉ Theme Live                         │
│                                                                             │
│  Active: Colors (Sunset) + Loading (Spinner) + Login (Brand v1)            │
│  Inactive: Menu                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Login] [Loading] [Menu] [Colors]  ← manila folder tabs                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Element | Details |
|---------|---------|
| Save status | "● Saved 2 min ago" / "● Saving..." / "● Unsaved changes" |
| Theme Live indicator | Green pulsing dot when ANY tab is activated; Gray static dot when ALL deactivated |
| Active theme summary | Shows what's activated in tab order + what's inactive |
| Position | Right-aligned in header area |
| Actions | [Preview] opens modal preview, [Save] saves all tabs |

**Theme Live Indicator States:**
- `◉ Theme Live` - Green pulsing circle = at least one tab activated, embed is applying customizations
- `○ Theme Inactive` - Gray static circle = all tabs deactivated, embed applies nothing

### 11. Toast Notifications

| Setting | Value |
|---------|-------|
| Position | Below avatar, slide in from RIGHT |
| Color | Muted green (success): bg #ecfdf5, border #a7f3d0, text #065f46 |
| Content | Include "what changed" summary |
| Duration | Linger long enough to read multiple updates |

### 12. Preview Button

| Decision | Details |
|----------|---------|
| Behavior | Modal overlay (not new tab) |
| Size | Large, fills most of screen |
| Background | Grayed out behind modal |
| Per-tab | Each tab has its own preview showing that customization |

### 13. Menu Tab Specifics

| Decision | Details |
|----------|---------|
| Right panel | Wider than other tabs (banner options need space) |
| Center preview | Narrower (just menu sidebar) |
| Preview aesthetic | Mimic real GHL menu - logo area, dropdown, icons, colors |
| CSS Preview Panel | Keep but de-emphasize; link to Settings for CSS-only option |
| Search/filter | Add search for menu items (20+ items) |
| Custom icons | Future feature - users select their own icons |

### 14. Loading Tab Specifics

| Decision | Details |
|----------|---------|
| Category badges | Keep above 3-panel layout (All, Minimal, Professional, Creative) |
| Badge layout | Allow 2-3 rows if needed, not overlapping into preview |
| Left panel | Animation grid (scrollable) |
| Center | Large preview area |
| Right | Color/speed/size settings + "Currently Active" box |

### 15. Quick Wins Approved

| Feature | Status | Notes |
|---------|--------|-------|
| "Saved 2 min ago" timestamp | ✓ Approved | |
| Cmd+S / Ctrl+S keyboard shortcut | ✓ Approved | Mac + Windows |
| Smooth tab transitions | ✓ Approved | |
| Panel resize handles | ✓ Approved | User-draggable |
| Collapse left/right panels | ✓ Approved | Fluid, not jarring |
| Hover preview on presets | ✓ Approved | Already exists some places |
| Reset to default button | ✓ Approved | Per-tab only |
| Copy/duplicate presets | ✓ Approved | Part of theme creation |
| Search/filter menu items | ✓ Approved | Good for 20+ items |
| Drag handle visual | ✓ Approved | Already exists |
| Loading indicator in preview | ✓ Approved | Subtle spinner |
| Keyboard tab navigation (1-2-3-4) | ✓ Approved | Mac + Windows |
| "What changed" diff in toast | ✓ Approved | Lingers to read |
| Undo for accidental changes | Maybe | Careful with auto-save; revisit later |
| Tooltips/hints | ✓ Approved | Will use Tour feature for onboarding |

### 16. Future Features (Phase 3+)

| Feature | Phase |
|---------|-------|
| Subaccount targeting (whitelist/blacklist) | Phase 3 |
| Apply to specific subaccounts | Phase 3 |
| Default theme for new subaccounts | Phase 3 |
| Different themes for verticals (dentists vs roofers) | Phase 3 |
| Theme-specific logo uploads | Phase 3 |
| Share theme links | Phase 3 |
| Custom icons for menu items | Future |

---

## Implementation Order (Phase 2)

1. **Infrastructure**
   - `useAutoSave` hook with debounce
   - `useThemeStatus` context for save state
   - `ThemeHeader` component with status + actions
   - Activate/Deactivate toggle component

2. **Update theme-builder page**
   - Add ThemeHeader above tabs
   - Wire up status context
   - Add active theme summary

3. **Migrate Login tab**
   - Import existing components
   - Add activation toggle
   - Add bottom "embed code" section

4. **Migrate Loading tab**
   - Restructure to 3-panel
   - Keep category badges above
   - Add activation toggle

5. **Migrate Menu tab**
   - Restructure to 3-panel (wider right panel)
   - Menu preview mimics real GHL
   - Add activation toggle
   - Keep CSS preview but link to Settings

6. **Migrate Colors tab**
   - Minor layout adjustments
   - Add activation toggle

7. **Polish & consistency**
   - Unified panel styling
   - Transitions and micro-interactions
   - Keyboard shortcuts

8. **Settings page updates**
   - Combined CSS snippet option
   - JavaScript embed option
   - Clear distinction between the two

---

## Files Created/Modified (Phase 1)

| File | Status |
|------|--------|
| `app/(dashboard)/theme-builder/page.tsx` | Created |
| `app/(dashboard)/theme-builder/_components/theme-tabs.tsx` | Created |
| `app/(dashboard)/theme-builder/_components/theme-builder-content.tsx` | Created |
| `components/dashboard/main-nav.tsx` | Modified (added Theme Builder link) |
| `app/(dashboard)/login/page.tsx` | Modified (removed Pro gate) |

---

## Database Record Created

**Dev Agency for localhost testing:**
- Name: Alan Wallace (Dev)
- Plan: pro
- Clerk User ID: user_385QfLkAEEOoBw1d3J1pooMmWY3
- Token: al_dev_7123fd88cf74

---

## Open Questions - RESOLVED

1. **Apply logic detail**: When user has Colors active + Menu active, and they deactivate Colors, does the CSS automatically regenerate without color rules?
   - **RESOLVED**: Yes, embed code only includes activated tabs

2. **Default state for new agencies**: Are all tabs "Deactivated" by default, or some pre-activated?
   - **RESOLVED**: All tabs start "Deactivated" - user explicitly chooses what to activate

3. **Where do activation toggles live?**
   - **RESOLVED**: Per-tab toggle at top of each tab's content area (next to tab title)
   - Header shows overall "Theme Live" status (green pulsing = active, gray = inactive)

4. **How are Pro features handled?**
   - **RESOLVED**: Tours and Images stay in separate "Pro" nav dropdown, not in Theme Builder tabs
   - Settings page "What does the script do?" shows ALL features with activation status

---

## Session Reference

- Date: 2026-01-16
- Context: Moving from 4 separate Customize pages to unified Theme Builder
- Key files: This document, `/docs/SESSION_NOTES_2026-01-16_CRITICAL.md`

---

## Decisions Log (Chronological)

| Date | Decision |
|------|----------|
| 2026-01-16 | Phase 1 complete: Manila folder tabs navigation shell |
| 2026-01-16 | Removed Pro gate from Login page (all plans can access) |
| 2026-01-16 | Created dev agency for localhost (user_385QfLkAEEOoBw1d3J1pooMmWY3) |
| 2026-01-16 | Tab order: Login → Loading → Menu → Colors (user journey) |
| 2026-01-16 | Per-tab activation toggles (not auto-apply on save) |
| 2026-01-16 | "Theme Live" indicator: green pulsing when active, gray when inactive |
| 2026-01-16 | CSS-only option for Toolkit; JavaScript for Pro features |
| 2026-01-16 | ONE combined CSS snippet (not per-tab) |
| 2026-01-16 | Subaccount targeting deferred to Phase 3 |
| 2026-01-16 | Keep old URLs as redirects to /theme-builder?tab=X |
| 2026-01-16 | Menu preview should mimic real GHL aesthetics |
| 2026-01-16 | Phase 2 infrastructure complete: useAutoSave, useThemeStatus, ThemeHeader, ActivationToggle |
| 2026-01-16 | Toast styling: 75% transparent glass effect, slide from right, close button, mint green |
| 2026-01-16 | All 4 tabs migrated (content copied, original pages kept intact) |
| 2026-01-16 | Premium UX review completed with refined feedback |

---

## Phase 2 Review - Refined Feedback (2026-01-16 Session 2)

### Layout Corrections Needed

**CRITICAL**: Current tab layouts don't follow the approved 3-column wireframe:
- Menu tab is 2-column with presets across top (should be 3-column)
- Loading tab needs restructuring to 3-panel
- Must match the wireframe in Section 3 above

### Login Tab - Premium UX Enhancements

| Feature | Priority | Details |
|---------|----------|---------|
| **Undo/Redo Stack** | HIGH | Cmd+Z/Ctrl+Z with visual undo button. Safety net for experimentation. |
| **Element Snap Guides** | HIGH | Show alignment guides when dragging (like Figma/Canva). |
| **Context-Aware Centering** | HIGH | For split views: option to "Center on full page" OR "Center on left/right side only". When form is on one side of split, centering should respect that boundary. Applies to ALL elements (form, images, text, GIFs). |
| **Quick Action Toolbar** | MEDIUM | Floating mini-toolbar when element selected: Duplicate, Delete, Center, Bring Forward/Back. |
| **Design Version History** | LOW | Save snapshots users can revert to. "Version 1: Clean minimal" → "Version 2: Added testimonial". |

**Context-Aware Centering Detail:**
- Current: Center buttons in Properties panel center on FULL canvas
- Problem: In split view (form left, image right), centering slams form to middle of whole page
- Solution: Add "Center on side" button next to existing center buttons
- Detect if layout is split and offer both options
- Applies to: Login form, images, text blocks, GIFs, testimonials, shapes, buttons

### Loading Tab - Premium UX Enhancements

| Feature | Priority | Details |
|---------|----------|---------|
| **"Try it Live" Button** | HIGH | 3-second demo showing animation appearing/disappearing exactly like GHL page load. |
| **Favorite Animations** | MEDIUM | Star/favorite animations with a "Favorited" badge. Searchable. Persists across sessions. |
| **Animation Comparison Mode** | MEDIUM | Select 2-3 animations, see them side-by-side (like Best Buy product compare). |
| **Custom Animation Upload** | HIGH | Pro users upload their own GIF animations. HUGE differentiator. |
| **Logo Animation Presets** | MEDIUM | Upload logo → apply preset animations (bounce, pop, pulse, fade-in). |
| **Category Badge Polish** | LOW | Subtle hover animations, selected ring effect on badges. |

### Menu Tab - Premium UX Enhancements

| Feature | Priority | Details |
|---------|----------|---------|
| **Search/Filter** | HIGH | Search box to quickly find items in 20+ menu list. Already approved. |
| **Reset to GHL Defaults** | HIGH | One-click button to restore original GHL menu configuration. |
| **GHL-Accurate Preview** | MEDIUM | Preview should exactly mimic GHL sidebar styling (colors, hover states, icons). Reference screenshot provided. |
| **Inline Rename** | EXISTS | Already have "Rename to..." field next to each item - no change needed. |

**NOT implementing:**
- "Hide all / Show all" bulk actions (doesn't make UX sense)
- Interactive drag preview in sidebar (performance concern unless local-only)

### Colors Tab - Premium UX Enhancements

| Feature | Priority | Details |
|---------|----------|---------|
| **Real GHL Preview** | HIGH | Use actual GHL interface screenshots that dynamically recolor. Offer 3 views: Pipeline, Dashboard, Reviews. |
| **Live Agency Preview** | HIGH | Pull GHL white-label URL from Settings → show THEIR actual dashboard with colors applied. Click through live preview. Major wow factor. |
| **One-Click Brand Import (URL)** | HIGH | Paste website URL → extract brand colors automatically. Can paste multiple URLs to build palette. |
| **One-Click Brand Import (Logo)** | EXISTS | Already have logo color extraction - keep it. |
| **Accessibility Warning Position** | MEDIUM | Move contrast warnings higher/above the fold. Currently exists but too low. |
| **Export/Share Theme** | FUTURE | Copy theme link to share. Expires after 3 days. Ties into referral/signup strategy. Needs more thought on implementation. |

**NOT implementing:**
- Theme presets with thumbnails (hover preview already handles this)

### Toast Notifications - IMPLEMENTED

| Setting | Value |
|---------|-------|
| Position | Top-right, below avatar |
| Animation | Slide in from RIGHT (horizontal), not top-down |
| Background | 75% transparent with backdrop blur (glass effect) |
| Border | Darker green: rgba(22, 101, 52, 0.4) |
| Border radius | 8px (more square, card-like) |
| Close button | YES - user can dismiss manually |
| Colors (success) | Mint green: bg rgba(240,253,244,0.75), text #14532d |

### Keyboard Shortcuts - TO IMPLEMENT

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl + S | Save |
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z | Redo |
| 1, 2, 3, 4 | Switch to tab 1/2/3/4 |
| Delete/Backspace | Delete selected element (Login tab) |
| Escape | Deselect element |

### Files Created/Modified (Phase 2 Session 2)

| File | Status |
|------|--------|
| `theme-builder/_hooks/use-auto-save.ts` | Created |
| `theme-builder/_context/theme-status-context.tsx` | Created |
| `theme-builder/_components/theme-header.tsx` | Created |
| `theme-builder/_components/activation-toggle.tsx` | Created |
| `theme-builder/_actions/theme-actions.ts` | Created |
| `theme-builder/_components/tabs/login-tab-content.tsx` | Created |
| `theme-builder/_components/tabs/loading-tab-content.tsx` | Created |
| `theme-builder/_components/tabs/menu-tab-content.tsx` | Created |
| `theme-builder/_components/tabs/colors-tab-content.tsx` | Created |
| `theme-builder/_components/theme-builder-content.tsx` | Updated |
| `theme-builder/page.tsx` | Updated |
| `components/ui/sonner.tsx` | Updated (glass toast styling) |
| `app/layout.tsx` | Updated (use custom Toaster) |
| `types/database.ts` | Updated (added *_active fields to AgencySettings) |

### Files Created/Modified (Phase 2 Session 3)

| File | Status |
|------|--------|
| `loading/_components/loading-client.tsx` | Updated (3-column layout, Try it Live) |
| `loading/_components/animation-card.tsx` | Updated (added compact mode) |
| `menu/_components/menu-client.tsx` | Updated (3-column layout, search filter, reset button) |
| `login/_components/properties-panel.tsx` | Updated (context-aware centering dropdowns) |
| `login/_components/login-designer.tsx` | Updated (undo/redo integration) |
| `login/_hooks/use-history.ts` | Created (undo/redo hook) |
| `colors/_components/color-studio.tsx` | Updated (URL brand import) |
| `colors/_actions/color-actions.ts` | Updated (extractColorsFromUrl action) |
| `components/ui/scroll-area.tsx` | Created (installed from shadcn) |

---

## Phase 2 Testing Feedback (2026-01-16 Session 3)

### Loading Tab

| Issue | Status | Details |
|-------|--------|---------|
| Left column too narrow | TO FIX | Checkmark badge gets cut off on animation cards. Widen left panel. |
| Favorite/star animations | TO IMPLEMENT | User should be able to star/favorite animations. Persists across sessions. |
| Try it Live - skeleton | ENHANCE | Mock GHL dashboard should use skeleton layout instead of solid blocks |
| Try it Live - duration | ENHANCE | Show the mock dashboard for a few more seconds before auto-closing |
| Try it Live - brand colors | ENHANCE | Use user's active brand colors (if set) for the mock GHL dashboard |

### Menu Tab

| Issue | Status | Details |
|-------|--------|---------|
| Preview not GHL-accurate | TO FIX | Preview panel needs to look more like actual GHL sidebar (icons, hover states, colors, logo area) |
| Search filter - no DB hits | VERIFY | Ensure search is client-side only, not hitting database. If DB involved, add 2-3 char minimum threshold before filtering. |

### Colors Tab

| Issue | Status | Details |
|-------|--------|---------|
| URL extraction works | ✓ DONE | Successfully extracts colors from website URLs |
| Color assignment UX | TO FIX | User needs ability to assign ANY extracted color to ANY target (primary, accent, sidebar_bg, sidebar_text). Current auto-assignment looks backwards. Add click-to-assign or drag-to-assign. |

### Login Tab

| Issue | Status | Details |
|-------|--------|---------|
| Undo/Redo | ✓ DONE | Works great with keyboard shortcuts |
| Left/right centering | ✓ DONE | Works great for split layouts |
| Y "center on page" bug | TO FIX | Centers towards bottom instead of true center. Check calculation in `centeredY`. |
| Preview button | TO FIX | Preview opens but shows main layout preset instead of current design state. Should show actual canvas content. |

### Decisions Log Update

| Date | Decision |
|------|----------|
| 2026-01-16 | Phase 2 3-column layouts implemented |
| 2026-01-16 | Menu search filter added (client-side) |
| 2026-01-16 | Try it Live simulation added for Loading tab |
| 2026-01-16 | Context-aware centering added for Login tab |
| 2026-01-16 | Undo/Redo stack added for Login tab (useHistory hook) |
| 2026-01-16 | URL brand import added for Colors tab |
| 2026-01-16 | Testing revealed issues with Y centering, preview button, color assignment UX |

---

## Phase 2 Testing Fixes (2026-01-16 Session 4)

### Loading Tab - COMPLETED

| Fix | Details |
|-----|---------|
| Animation cards more square | Changed from fixed height to `aspect-square` class |
| Checkmark badge visible | Added outer `p-1` wrapper div to allow badge overflow |
| Favorite animations | Added star button with localStorage persistence, "Favorited" filter in categories |
| Try it Live enhanced | Extended to 4s duration, added skeleton layout, uses user's brand colors |

### Menu Tab - COMPLETED

| Fix | Details |
|-----|---------|
| Layout restructured | Banner Options & Custom Links moved to full-width section below 3-column grid |
| Generated CSS removed | Moved to Settings page (link provided instead) |
| "Set custom colors" link | Fixed to go to `/theme-builder?tab=colors` |
| Settings icon added | Bottom section of preview now shows Settings row (matches GHL) |
| GHL-accurate preview | Added logo area, company dropdown, hover states, proper icon styling |

### Colors Tab - COMPLETED

| Fix | Details |
|-----|---------|
| ExtractedColorPicker | New component: click color to select, then choose target (Primary/Accent/Sidebar BG/Sidebar Text) |
| GHL color options research | Confirmed: GHL only supports 4 colors. No top nav or main area background options. |

### Login Tab - COMPLETED

| Fix | Details |
|-----|---------|
| Y centering bug | Fixed by removing `height: 'auto'` override - now uses consistent heightPercent |
| Preview modal | Created `preview-modal.tsx` component for inline preview of current design state |

### Theme Builder UI - COMPLETED

| Fix | Details |
|-----|---------|
| Active tab indicator | Added primary-colored accent bar at top of active tab |
| Tab labels updated | "Login Page", "Loading Screen", "Sidebar Menu", "Brand Colors" |

### Files Modified (Session 4)

| File | Changes |
|------|---------|
| `loading/_components/animation-card.tsx` | Compact mode: aspect-square, outer padding wrapper |
| `loading/_components/loading-client.tsx` | Grid gap reduced, favorites feature, enhanced TryItLiveOverlay |
| `menu/_components/menu-client.tsx` | Restructured layout, removed CSS panel |
| `menu/[id]/_components/menu-preview.tsx` | GHL-accurate styling, Settings icon, fixed link |
| `colors/_components/color-studio.tsx` | Added ExtractedColorPicker component |
| `login/_components/canvas.tsx` | Fixed Y centering (consistent height) |
| `login/_components/preview-modal.tsx` | Created new component |
| `login/_components/login-designer.tsx` | Added PreviewModal integration |
| `theme-builder/_components/theme-tabs.tsx` | Active indicator, updated labels |

### Decisions Log Update

| Date | Decision |
|------|----------|
| 2026-01-16 | Animation cards use aspect-square for consistent sizing |
| 2026-01-16 | Outer padding wrapper technique for overflow badges |
| 2026-01-16 | Favorites stored in localStorage (persists across sessions) |
| 2026-01-16 | Banner Options and Custom Links below 3-column grid (not in columns) |
| 2026-01-16 | Generated CSS moved to Settings page |
| 2026-01-16 | GHL only supports 4 colors - no additional color options planned |
| 2026-01-16 | Active tab styling: primary accent bar at top |

---

## Phase 2 Testing Fixes (2026-01-17 Session 5)

### Login Tab - COMPLETED

| Fix | Details |
|-----|---------|
| WYSIWYG rendering | Canvas and preview now render identically via `containerScale` prop. Form content scales proportionally with container size. |
| Form selection handles | Fixed alignment - restored `h-full` class, reverted default height to 400 |
| Preview modal aspect ratio | Fixed using padding-bottom technique (same as main canvas) |
| Preset centering | All presets now have proper centering calculations, appropriate text widths, rule of four spacing |

### Theme Tabs - COMPLETED

| Fix | Details |
|-----|---------|
| Active tab indicator | Changed from straight line to curved line that follows tab shape (rounded-t-lg corners) |
| Indicator styling | 3px height, blue-300 color, inner element extends to create curved clip effect |

### WYSIWYG Implementation Details

The core issue was that form content used fixed pixel sizes based on canvas-unit width (400px), but the actual rendered container varies in size. Solution:

1. **Resize Observer**: Both canvas and preview modal track their actual container width
2. **Scale Factor**: `containerScale = actualContainerWidth / canvasWidth` (e.g., 600px / 1600px = 0.375)
3. **Proportional Scaling**: LoginFormElement receives `containerScale` prop and multiplies all sizing by it
4. **Result**: Form looks identical at any zoom level - true WYSIWYG

### Files Modified (Session 5)

| File | Changes |
|------|---------|
| `theme-tabs.tsx` | Curved tab indicator using nested span with overflow clip |
| `canvas.tsx` | Added ResizeObserver, containerScale calculation, pass to LoginFormElement |
| `preview-modal.tsx` | Added ResizeObserver, containerScale calculation, pass to PreviewElement |
| `login-form-element.tsx` | Added containerScale prop, applies to all sizing calculations |
| `preset-picker.tsx` | Fixed all presets: proper centering formulas, appropriate widths, rule of four |
| `defaults.ts` | Reverted height to 400, y to 25 |
| `database.ts` | Added ExtendedElementsConfig types for extended color targeting |
| `color-studio.tsx` | Added Extended Elements collapsible section with full UI |
| `color-picker-with-presets.tsx` | Fixed BaseColorField type to exclude 'extended' |
| `use-resizable-panels.ts` | Created - hook for panel resize with localStorage |
| `resize-handle.tsx` | Created - visual drag handle component |
| `login-designer.tsx` | Converted to flexbox layout, added resize handles and collapse buttons |

### Decisions Log Update

| Date | Decision |
|------|----------|
| 2026-01-17 | WYSIWYG achieved via containerScale prop - form scales proportionally |
| 2026-01-17 | Tab indicator: curved line at top (not borders wrapping around) |
| 2026-01-17 | Preset text widths sized for content, not oversized |
| 2026-01-17 | Rule of four: y positions and heights are multiples of 4 |
| 2026-01-17 | Extended Elements: collapsible section for additional GHL element targeting |
| 2026-01-17 | Panel Resize: flexbox layout with drag handles and collapse buttons |
| 2026-01-17 | localStorage persistence for panel widths (key: login-designer-panels) |

---

## Phase 2 - Upcoming Features

### Colors Extended Elements Feature - IMPLEMENTED

**Problem**: GHL only natively supports 4 colors (primary, accent, sidebar_bg, sidebar_text). Users want to customize more elements.

**Solution**: Add "Extended Elements" section to Colors tab that generates additional CSS targeting:
- Top navigation bar background
- Top navigation text/icons
- Main content area background
- Buttons (primary, secondary variants)
- Cards/containers
- Form inputs
- Links/hover states

**Implementation Details**:
1. Added types to `database.ts`:
   - `ExtendedElementsConfig` - Map of element keys to color options
   - `ExtendedColorOption` - enabled, type (fixed/variation), color or baseColor+percentage
   - `ExtendedElementKey` - Union of 9 element types

2. Added collapsible UI in `color-studio.tsx`:
   - Sparkles icon header with chevron toggle
   - Grid of 9 configurable elements
   - Each element has: Enable toggle, Type selector (Fixed Color / Variation of...)
   - Fixed: Direct color picker
   - Variation: Base color dropdown + percentage slider (10-100%)

3. Element definitions:
   - top_nav_bg, top_nav_text, main_area_bg, card_bg
   - button_primary_bg, button_primary_text
   - input_bg, input_border, link_color

### Panel Resize Feature - IMPLEMENTED

**Approved in Quick Wins**: User-draggable panel resize handles

**Implementation Details**:
1. Created `use-resizable-panels.ts` hook with:
   - localStorage persistence
   - Configurable min/max widths per panel
   - Collapse/expand state management
   - Drag event handling with smooth updates

2. Created `resize-handle.tsx` component:
   - Subtle grip icon appears on hover
   - col-resize cursor during drag
   - Primary/30 highlight on hover

3. Panel configuration:
   - Left panel: 250-450px range, 300px default
   - Right panel: 220-400px range, 280px default
   - Center panel: Flexbox auto-fill remaining space

4. Collapse buttons:
   - Left panel: PanelLeftClose/PanelLeftOpen icons
   - Right panel: PanelRightClose/PanelRightOpen icons
   - Tooltips explain the action
   - Smooth 200ms transition on collapse/expand

5. Files created:
   - `login/_hooks/use-resizable-panels.ts`
   - `login/_components/resize-handle.tsx`

6. Files modified:
   - `login/_components/login-designer.tsx` (flexbox layout instead of grid)

---

## Next Steps (Priority Order - Updated)

1. ~~**Implement Colors Extended Elements**~~ - COMPLETED (Session 5)

2. ~~**Implement Panel Resize Handles**~~ - COMPLETED (Session 5)

3. **Phase 2 Final Polish** - See `THEME_BUILDER_PRIORITY_POLISH.md`
   - Fix color saving issue (CRITICAL)
   - Keyboard shortcuts (Cmd/Ctrl+S, number keys, arrow keys)
   - Layer controls for Login tab (Bring to Front/Back/Forward/Backward)
   - Quick action toolbar for elements
   - Live agency preview using white-label URL
   - Smooth tab transitions

4. **Phase 3 Planning**
   - Subaccount targeting (whitelist/blacklist)
   - Theme-specific logo uploads
   - Different themes for verticals

---

## Session 5 Completion Notes (2026-01-17)

**Completed:**
- Panel resize on all 4 tabs (Login, Loading, Menu, Colors)
- Collapsible left/right panels with tooltips
- Extended Elements wired to preview (top nav, cards, buttons show color changes)
- Login page rule-of-four spacing improvements
- Colors left panel default width increased

**Issues Identified for Session 6:**
- Color saving not persisting (reverts to default)
- "Saved X ago" timestamp not updating
- User requested layer controls (bring to front/back) for Login tab
- User requested live agency preview using their white-label URL

**New Document Created:**
- `docs/THEME_BUILDER_PRIORITY_POLISH.md` - Detailed plan for Session 6+
