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
