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

---

## Next Steps (Priority Order)

1. **Fix 3-Column Layouts** - Restructure Loading, Menu, Colors tabs to match approved wireframe
2. **Commit current progress** (don't push yet)
3. **Implement Top 5 Premium UX:**
   - Search filter for Menu tab
   - "Try it Live" button for Loading tab
   - Context-aware centering for Login tab
   - Undo/Redo stack for Login tab
   - One-click brand import (URL) for Colors tab
4. **GHL-Accurate Previews** - Menu sidebar and Colors dashboard
