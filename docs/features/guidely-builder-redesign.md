# Guidely Builder Redesign Plan

**Date:** 2026-01-28
**Status:** Planning

---

## Overview

Standardize all Guidely builders to use a consistent 3-column layout with a slide-out center settings panel. There are TWO patterns based on what's being edited.

---

## Two Builder Patterns

### Pattern A: Single-Item Builder (Banners)

Editing ONE item. Left panel shows the **elements/components** of that item.

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header                                                              │
│ [← Back] [Name input] [Status]              [Settings] [Publish] ...│
├──────────┬──────────────────┬───────────────────────────────────────┤
│ Left     │ Center           │ Right                                 │
│ (w-64)   │ (w-96, slides)   │ (flex-1)                              │
│          │                  │                                       │
│ ELEMENTS │ Settings for     │ LARGE Preview                         │
│ of this  │ selected element │                                       │
│ item     │                  │ Shows the banner/item                 │
│          │ (only opens if   │ in realistic context                  │
│ - Text   │ element has      │                                       │
│ - Button │ settings to      │                                       │
│ - Style  │ configure)       │                                       │
│ - etc.   │                  │                                       │
└──────────┴──────────────────┴───────────────────────────────────────┘
```

**Used by:** Banners (editing one banner's components)

### Pattern B: Multi-Item Builder (Tours, Checklists, Smart Tips)

Editing a COLLECTION. Left panel shows the **list of items** in that collection.

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header                                                              │
│ [← Back] [Name input] [Status]              [Settings] [Publish] ...│
├──────────┬──────────────────┬───────────────────────────────────────┤
│ Left     │ Center           │ Right                                 │
│ (w-64)   │ (w-96, slides)   │ (flex-1)                              │
│          │                  │                                       │
│ LIST of  │ Settings for     │ LARGE Preview                         │
│ items    │ selected item    │                                       │
│          │                  │ Shows the selected                    │
│ - Step 1 │ All config for   │ item in context                       │
│ - Step 2 │ that item        │                                       │
│ - Step 3 │                  │                                       │
│          │                  │                                       │
│ [+ Add]  │                  │                                       │
└──────────┴──────────────────┴───────────────────────────────────────┘
```

**Used by:** Tours (steps), Checklists (items), Smart Tips (tips)

---

## Key Principles

1. **Left panel** = What you're selecting (elements OR items)
2. **Center panel** = Slides out ONLY when there are settings to configure
3. **Right panel** = Preview (expands when center is closed)
4. **Simple settings** (dropdowns) stay in left panel - no center slide needed
5. **Complex settings** (multiple fields) open the center panel
6. **Compact UI** = Dropdowns/toggles, not large cards

---

## Banner Builder Redesign (Pattern A: Single-Item)

### Current State (3-column, always visible)

| Left (w-80) | Center (flex-1) | Right (w-80) |
|-------------|-----------------|--------------|
| Content section | Position (big cards) | Small preview |
| - Banner Text | Display Mode (radio cards) | |
| - Action Button | Style Preset (color boxes) | |
| - URL settings | Dismissible toggle | |

**Problems:**
- Preview is too small for a full-width element
- Center has oversized UI elements (cards instead of dropdowns)
- No clear element selection pattern

### New Design (Pattern A: Elements)

| Left (w-64) | Center (w-96, slides) | Right (flex-1) |
|-------------|----------------------|----------------|
| **ELEMENTS** | **Settings for selected** | **LARGE preview** |
| | | |
| CONTENT | *Text settings:* | Mock page with |
| ├─ Text [→] | - Formatting options | banner at top |
| | - Emoji picker | or bottom |
| ACTION | *Button settings:* | |
| ├─ [✓] Button [→] | - Button text | Full width |
| | - On click action | Realistic scale |
| APPEARANCE | - URL / Tour / Checklist | |
| ├─ Position [▼ Top] | - Open in new tab | Interactive |
| ├─ Display [▼ Inline] | | dismiss test |
| ├─ Style [→] | *Style settings:* | |
| | - Preset or Custom | |
| BEHAVIOR | - BG color (picker) | |
| ├─ [✓] Dismissible [→] | - Text color (picker) | |
| ├─ [ ] Full click | - Border color | |
| | | |
| | *Dismiss settings:* | |
| | - Remember duration | |

**Key:**
- `[→]` = Click opens center panel for more settings
- `[▼]` = Dropdown in left panel (no center needed)
- `[✓]` = Toggle in left panel

### Left Panel Detail

```
┌─────────────────────────────┐
│ CONTENT                     │
│                             │
│ Banner Text                 │
│ ┌─────────────────────────┐ │
│ │ Complete your setup...  │ │  ← Click to edit in center
│ └─────────────────────────┘ │
│                             │
│ ACTION                      │
│ ┌─────────────────────────┐ │
│ │ [✓] Include button    ⚙️│ │  ← Toggle + gear for settings
│ │     "Get Started"       │ │
│ └─────────────────────────┘ │
│                             │
│ APPEARANCE                  │
│                             │
│ Position                    │
│ [Top                     ▼] │  ← Simple dropdown, no center
│                             │
│ Display Mode                │
│ [Inline                  ▼] │  ← Simple dropdown, no center
│                             │
│ Style                       │
│ ┌─────────────────────────┐ │
│ │ [■] Info             ⚙️ │ │  ← Shows current, gear for custom
│ └─────────────────────────┘ │
│                             │
│ BEHAVIOR                    │
│                             │
│ [✓] Allow dismiss        ⚙️ │  ← Toggle + gear for duration
│ [ ] Make entire banner      │  ← Simple toggle, no center
│     clickable               │
└─────────────────────────────┘
```

### Center Panel - Button Settings Example

```
┌─────────────────────────────┐
│ Button Settings         [X] │
├─────────────────────────────┤
│                             │
│ Button Text                 │
│ [Get Started              ] │
│                             │
│ On Click                    │
│ [Open URL                ▼] │
│                             │
│ URL                         │
│ [https://example.com/page ] │
│                             │
│ [ ] Open in new tab         │
│                             │
└─────────────────────────────┘
```

### Center Panel - Style Settings Example

```
┌─────────────────────────────┐
│ Style Settings          [X] │
├─────────────────────────────┤
│                             │
│ Preset                      │
│ [●][●][●][●][●]  [Info   ▼] │
│  ↑ compact color dots       │
│                             │
│ ─── or customize ───        │
│                             │
│ Background    [■ #2C64E0] ← │  ← Opens color picker
│ Text          [■ #FFFFFF] ← │
│ Border        [■ #1E4DB0] ← │
│                             │
│ [Reset to preset]           │
└─────────────────────────────┘
```

### Color Picker (Reuse from Theme Builder)

When clicking a color swatch:
- Color picker (square gradient + hue bar)
- Transparency slider
- Hex input
- Saved Colors (last 20 presets)
- Remove gradient/theme tabs (not needed here)

### Preview Panel

- Full width of remaining space (flex-1)
- Mock page container (gray background, skeleton content lines)
- Banner rendered at top or bottom based on Position setting
- Full-width banner to show realistic proportions
- Interactive: Can click X to test dismiss behavior

---

## Checklist Builder Redesign (Pattern B: Multi-Item)

### Current State
- Left: Checklist items list
- Center: Item settings (always visible)
- Right: Preview

### New Design

| Left (w-64) | Center (w-96, slides) | Right (flex-1) |
|-------------|----------------------|----------------|
| **ITEMS LIST** | **Selected item settings** | **Large preview** |
| | | |
| Checklist Items | Title | Checklist widget |
| ├─ Item 1 [⚙️] | Description | floating in |
| ├─ Item 2 | Action type | corner of |
| ├─ Item 3 | Action config | mock page |
| | Completion trigger | |
| [+ Add Item] | Icon selection | Progress bar |
| | | shows completion |

**Pattern:** Same as Smart Tips - list of items on left, settings slide out when selected.

---

## Tours Builder Redesign (Pattern B: Multi-Item)

### Current State
- Tab-based: Steps | Settings | Targeting | Theme
- Within Steps tab: Left list, Right editor

### New Design

| Left (w-64) | Center (w-96, slides) | Right (flex-1) |
|-------------|----------------------|----------------|
| **STEPS LIST** | **Selected step settings** | **Live preview** |
| | | |
| Tour Steps | Element selector | Step tooltip |
| ├─ Step 1 [⚙️] | Title | on mock |
| ├─ Step 2 | Content (rich text) | GHL page |
| ├─ Step 3 | Position | |
| | Overlay settings | Shows element |
| [+ Add Step] | Button config | highlight |
| | | |
| ─────────────── | | Progress |
| [⚙️ Settings] | *Opens Sheet for:* | indicator |
| | - Targeting | |
| | - Theme selection | |
| | - Tour-level options | |

**Note:** Tours have GLOBAL settings (Targeting, Theme) that apply to the whole tour, not individual steps. These open in a Sheet/Dialog via the Settings button in header (already exists).

---

## Smart Tips (Already Done - Pattern B)

For reference, Smart Tips already follows Pattern B:

| Left (w-64) | Center (w-96, slides) | Right (flex-1) |
|-------------|----------------------|----------------|
| **TIPS LIST** | **Selected tip settings** | **Large preview** |
| | | |
| Tips | Element selector | Tooltip on |
| ├─ Tip 1 [⚙️] | Content | target element |
| ├─ Tip 2 | Trigger type | |
| ├─ Tip 3 | Beacon settings | Beacon visible |
| | Position | if enabled |
| [+ Add Tip] | Size | |

---

## Migration Priority

| # | Builder | Pattern | Complexity | Notes |
|---|---------|---------|------------|-------|
| 1 | **Banners** | A (Single) | Medium | New pattern - elements as list |
| 2 | Checklists | B (Multi) | Low | Already has item list, add slide-out |
| 3 | Tours | B (Multi) | High | Complex, has rich text, targeting |

---

## Banners: Detailed Implementation Plan

### Phase 1: Create New Component Structure

**New files to create in `/g/banners/[id]/_components/`:**
- `banner-builder.tsx` - Main component with 3-column layout
- `banner-elements-panel.tsx` - Left column: content elements list
- `banner-element-settings.tsx` - Center column: settings for selected element
- `banner-preview-panel.tsx` - Right column: large mock page preview

**Reuse:**
- Actions from `/tours/_actions/banner-actions.ts` (copy to `/g/`)
- Color picker component from Theme Builder
- Types from `/types/database.ts`

### Phase 2: Left Panel - Elements List (All Inline)

Most settings stay in the left panel with inline expand/collapse:

```
CONTENT
├─ Banner Text [textarea]              (inline, as-is)
│
ACTION BUTTON
├─ [✓] Include action button           (toggle)
│   └─ EXPANDS IN PLACE when ON:
│      - Button Text [input]
│      - On Click [dropdown]
│      - URL [input]
│      - [ ] Open in new tab
│
APPEARANCE
├─ Position [Top ▼]                   (dropdown, inline)
├─ Display [Inline ▼]                 (dropdown, inline)
├─ Style [■ Info ⚙️]                  → CENTER COLUMN (only this one!)
│
BEHAVIOR
├─ [✓] Dismissible                    (toggle)
│   └─ EXPANDS IN PLACE when ON:
│      - Remember for [24 hours ▼]
├─ [ ] Make entire banner clickable   (toggle, inline)
```

### Phase 3: Center Panel - ONLY for Style

The center column **only opens for Style customization**:

```
┌─────────────────────────────┐
│ Style Settings          [X] │
├─────────────────────────────┤
│                             │
│ Preset                      │
│ [●][●][●][●][●]  [Info   ▼] │
│                             │
│ ─── or customize ───        │
│                             │
│ Background    [■ #2C64E0] → │  ← Opens color picker
│ Text          [■ #FFFFFF] → │
│ Button BG     [■ #1E4DB0] → │
│ Button Text   [■ #FFFFFF] → │
│                             │
│ [Reset to preset]           │
└─────────────────────────────┘
```

Everything else stays inline in the left panel with expand/collapse.

### Phase 4: Color Picker Integration

Adapt existing color picker from Theme Builder:
- Remove: Gradient tab, Theme tab
- Keep: Color picker, transparency, hex input, saved colors
- Location: `/components/shared/color-picker.tsx` (extract if needed)

### Phase 5: Preview Panel

- Full remaining width (flex-1)
- Mock page: gray background, skeleton content lines
- Banner: full-width at top or bottom
- Interactive: test dismiss button
- Updates live as settings change

---

## Existing Color Picker Location

Theme Builder color picker is in:
`/app/(dashboard)/g/themes/[id]/_components/color-control.tsx`

May need to extract to `/components/shared/` for reuse, or import directly.

---

## Files Reference

### Smart Tips (Pattern B Reference)
- `/g/tips/[id]/_components/smart-tips-builder.tsx` - Main component
- `/g/tips/[id]/_components/tip-settings-panel.tsx` - Settings panel
- `/g/tips/[id]/_components/tip-preview.tsx` - Preview panel

### Theme Builder (Color Picker Reference)
- `/g/themes/[id]/_components/color-control.tsx` - Color picker with saved colors
- `/g/themes/[id]/_components/guidely-theme-editor.tsx` - Theme editor layout

### Current Banners (To Be Replaced)
- `/tours/banners/[id]/_components/banner-builder.tsx` - Current implementation
- `/tours/banners/[id]/_components/banner-content-panel.tsx` - Content section
- `/tours/banners/[id]/_components/banner-settings-panel.tsx` - Settings section
- `/tours/banners/[id]/_components/banner-preview.tsx` - Current preview

### Current Checklists (To Be Updated)
- `/tours/checklists/[id]/_components/checklist-builder.tsx`
- `/tours/checklists/[id]/_components/checklist-items-panel.tsx`
- `/tours/checklists/[id]/_components/checklist-item-settings.tsx`
- `/tours/checklists/[id]/_components/checklist-preview.tsx`

### Current Tours (To Be Updated)
- `/tours/[id]/_components/tour-editor.tsx`
- `/tours/[id]/_components/step-list.tsx`
- `/tours/[id]/_components/step-editor.tsx`

---

## Summary: What Gets Built Where

### Files to CREATE in `/g/`

**Banners (`/g/banners/[id]/_components/`):**
- `banner-builder.tsx` - NEW (Pattern A layout)
- `banner-elements-panel.tsx` - NEW (left column)
- `banner-element-settings.tsx` - NEW (center, slides out)
- `banner-preview-panel.tsx` - NEW (right, large preview)

**Shared (`/components/shared/`):**
- `color-picker.tsx` - EXTRACT from theme builder (or import directly)
- `builder-shell.tsx` - OPTIONAL: shared layout wrapper

### Files to UPDATE (later)

**Checklists** - Add slide-out pattern to existing structure
**Tours** - Add slide-out pattern, keep sheet for global settings

### Files to DELETE (when migration complete)

Everything in `/tours/banners/`, `/tours/checklists/`, `/tours/[id]/`
(Keep `/tours/_actions/` - move to `/g/_actions/` or `/lib/actions/`)

---

## Next Steps

1. ✅ Document plan (this file)
2. ✅ Reuse color picker from Theme Builder (no extraction needed)
3. ✅ Build Banner builder (Pattern A) in `/g/banners/[id]/`
4. ⬜ Test and refine
5. ⬜ Update Checklists to Pattern B
6. ⬜ Update Tours to Pattern B
7. ⬜ Clean up old `/tours/` files

## Implementation Notes - Banner Builder

**Date:** 2026-01-28

### Files Created
- `/g/banners/[id]/_components/banner-builder-new.tsx` - Main component
- `/g/banners/[id]/_components/banner-elements-panel.tsx` - Left panel (inline settings)
- `/g/banners/[id]/_components/banner-style-settings.tsx` - Center panel (colors only)
- `/g/banners/[id]/_components/banner-preview-panel.tsx` - Right panel (large preview)

### Files Modified
- `/g/banners/[id]/page.tsx` - Updated to use BannerBuilderNew
- `/types/database.ts` - Added BannerCustomColors interface, added custom_colors to Banner
- `/tours/_actions/banner-actions.ts` - Added /g/ revalidation paths, custom_colors to duplicate

### Pattern Implemented
- **Left:** All settings inline with Collapsible for Action Button and Dismissible
- **Center:** Only opens for Style customization (color pickers)
- **Right:** Large preview with mock page

### Reused Components
- `CustomColorPicker` from `/components/shared/custom-color-picker.tsx`
- `BannerFullSettings` sheet from `/tours/banners/[id]/_components/banner-full-settings.tsx`

### Schedule Popover Added
- `/g/banners/[id]/_components/banner-schedule-popover.tsx`
- Native HTML `<input type="date">` and `<input type="time">` for clean OS pickers
- Quick presets (7/14/30 days, always on)
- Timezone support (ET, CT, MT, PT, UTC, user's local)
- Embed script updated to respect times AND timezone

---

## CRITICAL: Layout Scroll Fix

**Problem:** When center settings panel opens, the entire page becomes scrollable with white space at the bottom.

**Root Cause:** The Guidely layout used `h-[calc(100vh-4rem)]` with negative margins `-my-8 -mx-8`, which created fragile height calculations. When flex recalculated for the new center column, overflow escaped.

**Solution:** Use fixed positioning to break out of document flow entirely.

### Before (Broken)
```tsx
// app/(dashboard)/g/layout.tsx
<div className="h-[calc(100vh-4rem)] -my-8 -mx-8 flex">
  <GuidelySidebar />
  <main className="flex-1 overflow-hidden">
    {children}
  </main>
</div>
```

### After (Fixed)
```tsx
// app/(dashboard)/g/layout.tsx
<div className="fixed inset-0 top-16 flex">
  <GuidelySidebar />
  <main className="flex-1 overflow-hidden">
    {children}
  </main>
</div>
```

**Key Points:**
- `fixed inset-0 top-16` - Fixed position, full viewport, offset by header height (64px = 4rem = top-16)
- `overflow-hidden` on main - Only inner columns scroll, never the layout
- Each builder's columns use `overflow-y-auto` individually
- Never use calc-based heights for the outer container

---

## Builder Column Structure (REQUIRED)

Every builder under `/g/` must follow this structure:

```tsx
<div className="flex flex-col h-full overflow-hidden">
  {/* Header - shrink-0 so it doesn't collapse */}
  <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
    {/* Back button, name input, status, actions */}
  </div>

  {/* Main content - flex-1 min-h-0 so it fills remaining space */}
  <div className="flex-1 flex min-h-0 overflow-hidden">

    {/* Left panel - fixed width, scrollable */}
    <div className="w-80 border-r bg-muted/30 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto">
        {/* Left content */}
      </div>
    </div>

    {/* Center panel - conditional, fixed width, scrollable */}
    {showCenterPanel && (
      <div className="w-80 border-r flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b bg-muted/30 shrink-0">
          <h3>Panel Title</h3>
          <Button onClick={() => setShowCenterPanel(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Center content */}
        </div>
      </div>
    )}

    {/* Right panel - flexible width, scrollable */}
    <div className="flex-1 bg-muted/30 min-h-0 overflow-hidden">
      {/* Preview content */}
    </div>
  </div>
</div>
```

**Critical CSS Classes:**
- `h-full overflow-hidden` - Root container fills parent, hides overflow
- `shrink-0` - Header won't collapse
- `flex-1 min-h-0` - Content area fills remaining space and can shrink
- `overflow-y-auto` - Each column scrolls independently
- `overflow-hidden` on outer flex containers - Prevents double scrollbars

---

## Remaining Refactors

| Builder | Status | Pattern | Notes |
|---------|--------|---------|-------|
| **Banners** | ✅ Complete | A (Single) | 3-column + schedule popover |
| **Smart Tips** | ✅ Complete | B (Multi) | Already follows pattern |
| **Checklists** | ⬜ TODO | B (Multi) | Needs slide-out center panel |
| **Tours** | ⬜ TODO | B (Multi) | Most complex, has rich text |

### Checklists Migration Plan
1. Copy column structure from Banners
2. Left: Items list (already exists)
3. Center: Item settings (extract from current inline)
4. Right: Widget preview (enlarge current)
5. Keep widget appearance settings in Settings sheet

### Tours Migration Plan
1. Copy column structure from Banners
2. Left: Steps list (already exists)
3. Center: Step editor (extract from tabs)
4. Right: Tour preview (enlarge current)
5. Keep Targeting, Theme in Settings sheet (global settings)
