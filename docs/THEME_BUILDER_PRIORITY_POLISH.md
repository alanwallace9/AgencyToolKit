# Theme Builder - Priority Polish (Session 6+)

> **Reference**: See `THEME_BUILDER_DECISIONS.md` for full project context and history.
> **Last Updated**: 2026-01-17 (Session 7 feedback)
> **Purpose**: Track remaining polish items and investigation tasks

---

## Executive Summary - Session 7

### Completed Work (Verified Working)
- [x] **Color Saving**: Colors now persist correctly
- [x] **Save Timestamp**: Shows "Saved less than a minute ago" - responsive
- [x] **Duplicate Status Removed**: No more duplicate "all changes saved" on Colors tab
- [x] **Layer Controls**: Bring to Front/Back/Forward/Backward with tooltips
- [x] **Keyboard Shortcuts**: Tab navigation with Cmd/Ctrl modifier
- [x] **Delete/Backspace**: Working for element deletion
- [x] **Escape to Deselect**: Working
- [x] **Arrow Key Micro-move**: 1px normal, 10px with Shift (Login tab)
- [x] **Grid Overlay**: Toggle with 8/16px options (Login tab)
- [x] **Loading Screen Brand Colors**: Apply colors to preview works great

### Remaining Issues (Next Session Priority)

---

## PRIORITY A: Critical Fixes

### A1. Duplicate Embed Code Section (Brand Colors Tab)
**Issue**: Two identical "Your theme is included in your embed code" sections
- Bottom one (outside card) needs to be **removed**
- Keep the one inside the card
- Add arrow icon to the "Go to Settings" button
- Center the button vertically inside the card

**File**: `app/(dashboard)/theme-builder/_components/tabs/colors-tab-content.tsx` and/or `colors-client.tsx`

### A2. ~~Apply Colors Button Not Working (Sidebar Menu Tab)~~ ✅ FIXED (Session 8)
**RESOLVED**: Preview now defaults to brand colors if user has them set.

**What was fixed:**
1. Preview theme defaults to 'brand' if user has brand colors (sidebar_bg, sidebar_text, or primary)
2. Falls back to 'ghl-light' (not dark) if no brand colors
3. `hasCustomColors` check now includes `primary` color
4. Removed corrupted `preview_theme: null` from database

**Files modified:**
- `menu-client.tsx` - Fixed `getDefaultPreviewTheme()` logic
- `menu-preview.tsx` - Updated `hasCustomColors` to check `primary`

### A3. ~~Menu Preset Not Persisting~~ ✅ FIXED (Session 8)
**RESOLVED**: Menu tab now autosaves like Loading tab.

**What was fixed:**
1. Implemented autosave with 500ms debounce to `agency.settings.menu`
2. Templates (presets) only affect menu items, NOT preview theme
3. Restored "Save as Template" functionality for user-created templates
4. Template UI: Quick Start Templates at top, Your Templates below with divider
5. User templates show "X items visible" (not "X items hidden")

**Files modified:**
- `menu-client.tsx` - Full autosave implementation, template UI restructure
- `menu-actions.ts` - Added `getMenuSettings()` and `saveMenuSettings()`
- `menu-tab-content.tsx` - Loads from settings instead of presets
- `add-preset-dialog.tsx` - Updated terminology to "Template"
- `delete-preset-dialog.tsx` - Updated terminology to "Template"

---

## PRIORITY B: UX Improvements

### B1. Login Page Embed Code Position
**Issue**: Embed code section at bottom feels like "afterthought"

**Required**: Move embed code section **inside** the main card, part of the page flow

**File**: `app/(dashboard)/theme-builder/_components/tabs/login-tab-content.tsx` or `login-designer.tsx`

### B2. Grid Size Options (Login Tab)
**Current**: 4px / 8px / 16px
**Change to**: 8px / 16px / 32px (4px too fine for element layout)

**File**: `app/(dashboard)/login/_components/login-designer.tsx`

### B3. Grid State Persistence
**Issue**: Grid toggle resets when leaving and returning

**Required**: Save grid state (on/off + size) to localStorage so it persists across sessions

**File**: `app/(dashboard)/login/_components/login-designer.tsx`

### B4. Keyboard Shortcuts Hint Location
**Current**: Bottom of Properties Panel (right column)
**Move to**: Below the preview canvas, centered between "16:9 aspect ratio" and "Click to select • Drag to reposition"

**File**: `app/(dashboard)/login/_components/canvas.tsx`

---

## PRIORITY C: Future Enhancements

### C1. Animation Comparison (Loading Screen)
**Request**: Allow selecting 2-3 animations to compare side-by-side in preview
- User mentioned this was discussed but not implemented

### C2. Unified UX for Color Application
**Observation**: Loading Screen brand colors apply smoothly via toggle
**Suggestion**: Consider similar toggle approach for Menu sidebar instead of "Apply Colors" button

### C3. Tab Black Outline Bug (Intermittent)
**Intermittent issue**: Black outline appears on active tab sometimes

**Reported Occurrences:**
1. (Session 7) Happens when clicking tab that's already active on Brand Colors
2. (Session 8 - Jan 17, 2026) User clicked off browser window, returned, then clicked the GHL Dark dropdown in Sidebar Menu tab - black outline appeared around "Sidebar Menu" tab

**Pattern Notes:**
- NOT consistent/reproducible every time
- May be related to focus state when window loses/regains focus
- May be triggered by dropdown interactions while tab has focus
- Affects multiple tabs (Brand Colors, Sidebar Menu confirmed)

**Investigation**: Check `theme-tabs.tsx` focus/active states, particularly:
- `:focus-visible` vs `:focus` styling
- Window blur/focus event handling
- Dropdown open state affecting parent tab focus

---

## Files Reference

| File | Purpose |
|------|---------|
| `theme-builder/_components/tabs/colors-tab-content.tsx` | Colors tab wrapper |
| `colors/_components/colors-client.tsx` | Colors main component |
| `theme-builder/_components/tabs/menu-tab-content.tsx` | Menu tab wrapper |
| `menu/_components/menu-client.tsx` | Menu main component |
| `menu/[id]/_components/menu-preview.tsx` | Menu preview with Apply Colors |
| `login/_components/login-designer.tsx` | Login designer (grid, keyboard) |
| `login/_components/canvas.tsx` | Canvas component (grid overlay) |
| `login/_components/properties-panel.tsx` | Properties panel (shortcuts hint) |
| `theme-builder/_components/theme-tabs.tsx` | Tab navigation styling |

---

## Next Session Checklist

### Must Fix
- [x] ~~Remove duplicate embed code section (Brand Colors)~~ - Already done
- [x] ~~Fix Apply Colors button (Menu tab)~~ - FIXED Session 8
- [x] ~~Fix menu preset persistence~~ - FIXED Session 8 (autosave implemented)

### Should Fix
- [x] ~~Move embed code inside card (Login page)~~ - Staying at bottom (by design)
- [x] ~~Change grid sizes~~ - Using 16/32 only
- [x] ~~Persist grid state to localStorage~~ - Done
- [x] ~~Move keyboard shortcuts hint below canvas~~ - Done

### Nice to Have
- [x] ~~Animation comparison feature (Loading Screen)~~ - Done
- [x] ~~Tab black outline bug~~ - Not reproducing, closed

### Session 8 Additional Fix
- [x] Reset button now defaults to GHL Light (not Dark)

---

## Technical Notes

### Color Flow (Verified Working)
```
colors-client.tsx
  → debouncedSave()
  → saveAgencyColors() or updateColorPreset()
  → color-actions.ts (server action)
  → Supabase
```

### Menu Color Flow (Needs Investigation)
```
menu-tab-content.tsx
  → loads presets and colors(?)
  → MenuClient
  → MenuPreview
  → hasCustomColors check
  → Apply Colors button
```

Colors should come from:
1. Default color preset (`color_presets` where `is_default = true`)
2. Fallback: `agency.settings.colors`

---

## Session History

### Session 8 (2026-01-17) - Menu Tab Complete Overhaul
- **Fixed preview theme default**: Now defaults to brand colors if user has them, falls back to GHL Light
- **Fixed autosave**: Menu tab now autosaves to `agency.settings.menu` like Loading tab
- **Fixed template separation**: Templates only affect menu items, NOT preview theme
- **Restored "Save as Template"**: Users can save their own templates again
- **UI improvements**: Quick Start Templates at top, Your Templates below with divider, "X items visible" display
- **Removed debug code**: Cleaned up all `[MENU DEBUG]` console statements
- **Database fix**: Removed corrupted `preview_theme: null` via Supabase MCP

### Session 7
- User tested and provided detailed feedback
- Confirmed: color saving, timestamps, layer controls all working
- Identified: Apply Colors still broken, preset not saving, embed code duplication

### Session 6
- Implemented keyboard shortcuts with Cmd/Ctrl modifier
- Added arrow key micro-move
- Added grid overlay toggle
- Layer controls with tooltips
- Removed duplicate save status

### Earlier Sessions
- See `THEME_BUILDER_DECISIONS.md` for full history
