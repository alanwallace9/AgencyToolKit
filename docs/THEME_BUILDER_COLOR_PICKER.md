# Theme Builder - Custom Color Picker Design

> **Related Documents:**
> - `THEME_BUILDER_DECISIONS.md` - Full project context and history
> - `THEME_BUILDER_FEEDBACK_SESSION.md` - User feedback sessions
> - `THEME_BUILDER_PRIORITY_POLISH.md` - Polish items and bugs
>
> **Created**: January 17, 2026
> **Last Updated**: January 17, 2026 - Session 9 (Executive Plan Approved)
> **Purpose**: Research and design a premium custom color picker for Agency Toolkit
> **Status**: ✅ APPROVED - Ready for Implementation

---

## Executive Plan - APPROVED

### What We're Building
A premium, Apple-like color picker component that consolidates color selection, opacity, gradients, and theme colors into one elegant popover. This replaces the current scattered UI (color swatch + hex input + separate opacity slider + gradient presets) with a unified, polished experience.

**First deployment**: Background tab's "Color" field when "Solid Color" is selected.

### UI Transformation

**Current State (Background Panel):**
```
Color
[■ swatch] [#14532d        ]   ← Native picker + hex input
Opacity (100%)
[━━━━━━━━━━━━━━━━━━━━━●]      ← Separate slider below
Quick Presets - Gradient
[■][■][■][■][■][■][■][■]      ← Separate gradient buttons
```

**New State:**
```
Color
[■ #14532d ▼]                  ← Single trigger, shows current color + hex

   ┌─────────────────────────────────────┐
   │  [Color] [Gradient] [Theme]    [?]  │  ← Tabs + help icon
   ├─────────────────────────────────────┤
   │  ┌─────────────────────────────┐    │
   │  │                             │    │  ← Saturation/Brightness area
   │  │      Color Area             │    │
   │  │         ○ (cursor)          │    │
   │  └─────────────────────────────┘    │
   │  [━━━━━━━━━●━━━━━━━━━━━━━━━━━]      │  ← Hue slider (rainbow)
   │  [━━━━━━━━━━━━━━━━━━━━━━━●] 100%    │  ← Opacity slider (BUILT-IN!)
   │  [■ Preview] [#14532d    ] [◉]     │  ← Preview + Hex + Eyedropper
   │  ─────────────────────────────────  │
   │  Saved Colors:              [+ Add] │
   │  [○][○][○][○][○][○][○][○]          │  ← 4x5 grid (20 max)
   │  [○][○][○][○][○][○][○][○]          │
   │  [○][○][○][○]                       │
   └─────────────────────────────────────┘
```

### Approved Decisions

| Decision | Approved Choice |
|----------|-----------------|
| **Library** | react-colorful (2.8KB, zero deps) |
| **Eyedropper** | Browser native `EyeDropper` API (picks from anywhere on screen) |
| **Gradient angle** | 5 preset buttons (→ ↘ ↓ ↙ ←) + number input for MVP. Visual dial as future enhancement |
| **Saved color removal** | Hover reveals X button + Delete/Backspace keys work |
| **Popover trigger** | Both swatch AND hex are clickable |
| **Saved colors storage** | localStorage for quick recall + database for persistence |
| **Saved colors limit** | 20 colors max (4x5 grid) |
| **Gradient stops** | Min 2, Max 5. Click bar to add, Delete/Backspace to remove, drag off to remove |
| **Theme tab colors** | 4 main brand colors only (Primary, Accent, Sidebar BG, Sidebar Text) |
| **Empty saved colors** | Show empty rounded squares with hint text |
| **Coach marks** | First visit only + ? icon in top-right to replay |

### Coach Marks Content (4 items)
1. Tab navigation (Color/Gradient/Theme)
2. Saved Colors section (how to add/remove)
3. Opacity slider (built-in!)
4. Eyedropper tool (pick from anywhere)

### Database Schema Addition

Add to `agencies.settings` JSONB:
```typescript
saved_colors: {
  colors: string[];     // Up to 20 hex values with alpha (e.g., "#14532dcc")
  gradients: {          // Up to 10 saved gradients
    id: string;
    type: 'linear' | 'radial';
    angle: number;
    stops: { color: string; position: number }[];
  }[];
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `components/shared/custom-color-picker/index.tsx` | Main export |
| `components/shared/custom-color-picker/color-tab.tsx` | Solid color picker |
| `components/shared/custom-color-picker/gradient-tab.tsx` | Gradient editor |
| `components/shared/custom-color-picker/theme-tab.tsx` | Brand color swatches |
| `components/shared/custom-color-picker/saved-colors.tsx` | 4x5 grid |
| `components/shared/custom-color-picker/coach-marks.tsx` | Onboarding overlay |

### Files to Modify

| File | Change |
|------|--------|
| `app/(dashboard)/login/_components/background-panel.tsx` | Replace color input with new picker |
| `types/database.ts` | Add SavedColors interface |

### Microinteractions (Approved)

- 200ms smooth transitions on all interactions
- Hex input auto-selects on focus for easy paste
- Gradient preview shows direction arrow
- Saved color hover shows hex tooltip
- "Copied!" toast when clicking hex (uses existing Sonner)
- Tab indicator slides smoothly between tabs
- Color area cursor (hollow circle) shows current position

### Scope

**In Scope (Phase 1):**
- Custom color picker with 3 tabs (Color, Gradient, Theme)
- Opacity slider built into picker
- Eyedropper tool (browser native)
- Saved colors grid (20 max)
- Coach marks with ? replay
- Integration with Background panel only

**Out of Scope (Future):**
- Replace all color inputs (Phase 2 - after approval)
- Animated gradients
- Pattern tab
- Full app onboarding (will use Tours feature)
- Logo eyedropper (enhance existing upload)
- Color palette sharing/export
- Visual dial for gradient angle (future enhancement)

---

## Goal

Create a custom color picker that:
1. Has built-in opacity/transparency slider
2. Includes "From Theme" integration (pick colors from saved themes)
3. Maintains hex input capability
4. Looks premium and refined ("this app has its shit together")
5. Consistent UX across the entire Theme Builder
6. Is intuitive for non-designers

---

## User Requirements (from Session 8)

- **Opacity slider**: Must be part of the picker, not separate
- **Hex input**: Required for precise color entry
- **No RGB/HSL toggle dropdown**: Keep it simple
- **From Theme button**: Opens theme color swatches within the picker
- **Every color field gets the same picker**: Consistent experience

---

## Implementation Plan

**Phase 1**: Build custom color picker for Background tab only (test/evaluate)
**Phase 2**: If approved, roll out to all color fields across Theme Builder
**Phase 3**: Add "From Theme" integration

---

## Research: Color Pickers in Major Apps

### Figma
**Source**: [Figma Help - Color Picker](https://help.figma.com/hc/en-us/articles/360041003774-Apply-paints-with-the-color-picker)

- Supports solid fills, gradients, patterns, images, videos
- Controls for hue, saturation, opacity, and blend modes
- Color variables support (dark mode, theming)
- Built-in accessibility: color contrast checker
- "Better Color Picker" plugin adds: locked values editing, WCAG 2.1 contrast checks
- Color styles and variables from libraries

**Key Insight**: Figma's picker is powerful but complex. For our use case (simpler, not a design tool), we want the essentials without overwhelming options.

### Canva
**Source**: [Canva Help - Element Color](https://www.canva.com/help/element-color/)

- Eyedropper tool for picking colors from images
- Document colors (auto-detected from design)
- Brand Kit colors (saved brand palettes)
- Default color swatches
- Simple hex input

**Key Insight**: Canva shows "prominent colors from images" and "document colors" - smart contextual suggestions. Their "Brand Kit" integration is similar to our "From Theme" concept.

### Apple (macOS System Picker)
**Source**: [Apple HIG - Color Wells](https://developer.apple.com/design/human-interface-guidelines/color-wells)

- Color well displays current color, opens picker on click
- System-provided picker for "familiar experience"
- Supports P3 wide color gamut
- Users can save custom color palettes accessible from any app

**Key Insight**: Apple emphasizes consistency and familiarity. Users expect certain behaviors.

### Common Patterns Across Apps

| Feature | Figma | Canva | Apple | Prevalence |
|---------|-------|-------|-------|------------|
| Color area (saturation/brightness) | ✅ | ✅ | ✅ | Universal |
| Hue slider/wheel | ✅ | ✅ | ✅ | Universal |
| Opacity slider | ✅ | ✅ | ✅ | Universal |
| Hex input | ✅ | ✅ | ✅ | Universal |
| Eyedropper | ✅ | ✅ | ✅ | Universal |
| Saved colors/swatches | ✅ | ✅ | ✅ | Universal |
| RGB/HSL toggle | ✅ | ❌ | ✅ | Mixed |
| Gradient editor | ✅ | ✅ | ✅ | For advanced |

---

## Research: Designer Community Feedback

### What designers wish color pickers had
**Sources**:
- [Designing a good color picker (UXDesign/Medium)](https://bootcamp.uxdesign.cc/designing-a-good-color-picker-4c08573dcb7b)
- [React color picker frustrations (Dev.to)](https://dev.to/ddoemonn/why-existing-react-color-pickers-frustrated-me-and-what-i-built-instead-5ghg)

1. **Flexibility in layout** - Designers hate rigid "one big box" that can't be customized
2. **Easy color format export** - Don't force one format; let users choose
3. **No CSS fights** - Pickers should match design systems without overrides
4. **Accessibility testing** - Built-in contrast checking
5. **Saved colors/swatches** - Quick access to frequently used colors
6. **Role-based access** - Some users get full picker, others get approved swatches only

### Common pain points

1. **Library bloat** - react-color imports 11 dependencies (14+ KB just for tinycolor2)
2. **Rigid styling** - Hard to customize appearance
3. **Format confusion** - RGB vs HSL vs Hex switching is confusing for non-designers
4. **Missing opacity** - Many pickers don't support alpha channel
5. **Mobile unfriendly** - Desktop-first designs don't work on touch

### Best practices
**Source**: [Mobbin - Color Picker UI Design](https://mobbin.com/glossary/color-picker)

1. **Circular swatches are most common** (from 1000+ real-world examples)
2. **Selection indicators**: Ring or checkmark to show selected color
3. **Text labels with colors** - Helps color-blind users (4.5% of population)
4. **Color wheel for precise selection**, swatches for quick selection
5. **Always include hex input** for precise color entry

---

## User-Provided Examples

### Reference: Graphic.com Color Picker
**Source**: https://www.graphic.com/docs/colors/color-picker

**Features User Likes**:
1. **Tab system across top**: Color | Gradient | Pattern
2. **Color wheel** (circular) for hue selection
3. **Hue slider** (vertical rainbow bar)
4. **Alpha/Opacity slider** with percentage
5. **Hex input field**
6. **Saved swatches** at bottom for reuse
7. **All-in-one compact design**

**User Dislikes**:
- Dark theme background (wants Apple-like light theme)
- Too many sliders (RGB separate sliders = complexity)

### User's Vision - Tab System

```
┌──────────────────────────────────────────┐
│  [Color] [Gradient] [Pattern] [Theme]    │  ← Tab bar
├──────────────────────────────────────────┤
│                                          │
│     (Tab content changes based on        │
│      selected tab)                       │
│                                          │
├──────────────────────────────────────────┤
│  [Hex: #3b82f6]  [Alpha: 100%]           │
├──────────────────────────────────────────┤
│  Saved Colors:                           │
│  ○ ○ ○ ○ ○ ○ ○ ○                         │  ← Persists across Theme Builder!
└──────────────────────────────────────────┘
```

### Style Reference
- **Apple-like**: Rounded corners, clean lines, light background
- **Premium feel**: "This app has its shit together"
- **Consistent**: Same picker everywhere in Theme Builder

---

## EXPANDED VISION (Session 8 Feedback)

### Gradient Support - User Excitement!
User is VERY excited about gradient support:
- Multi-stop gradients (3+ color zones)
- Example: "Black to gold, looks shiny and shimmering"
- **Gradient TEXT** - No other GHL customizer does this!
- Would be a major differentiator

### Saved Colors Across Theme Builder
**Key Feature**: Colors picked anywhere persist everywhere
- Pick a color on Login page → it appears in Loading animations picker
- Pick complementary colors → they're saved for reuse
- Consistent "Saved Colors" section in every color picker instance
- Like a mini-palette that follows user across tabs

### Tab Structure (Revised)

| Tab | Purpose |
|-----|---------|
| **Color** | Solid color picker (wheel/area, hue, opacity) |
| **Gradient** | Linear/radial gradients with multi-stop support |
| **Pattern** | Future: repeating patterns (stretch goal) |
| **Theme** | Quick access to saved theme colors (Primary, Accent, etc.) |

### Gradient Editor Concept

```
┌──────────────────────────────────────────┐
│  [Color] [Gradient] [Pattern] [Theme]    │
├──────────────────────────────────────────┤
│  Gradient Bar:                           │
│  [●────────●────────●]                   │
│   ↑        ↑        ↑                    │
│  Stop 1  Stop 2  Stop 3  (draggable)     │
│                                          │
│  [Add Stop] [Remove Stop]                │
│                                          │
│  Angle: [135°] ↻                         │
│  Type: [Linear ▼] / Radial               │
├──────────────────────────────────────────┤
│  Preview: [gradient preview swatch]      │
└──────────────────────────────────────────┘
```

Click a stop → opens color picker for that stop's color

---

## Data Persistence Model

### Saved Colors Storage
```typescript
// Stored in agency settings or localStorage
interface SavedColors {
  recent: string[];        // Last 8 colors used (auto-saved)
  favorites: string[];     // User explicitly saved
  gradients: Gradient[];   // Saved gradients
}

interface Gradient {
  id: string;
  name?: string;
  type: 'linear' | 'radial';
  angle: number;
  stops: { color: string; position: number }[];
}
```

### Cross-Tab Persistence
- When user picks color on Login → saved to agency session
- Color picker on Loading → reads from same storage
- Real-time sync across tabs (React context or Zustand store)

---

## Design Decisions

### Proposed Layout (Popover)

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │   Color Area                │    │
│  │   (Saturation/Brightness)   │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Hue Slider                  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Opacity Slider         100% │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────┐  ┌─────────────────┐       │
│  │ ▓▓▓ │  │ #3b82f6         │       │
│  └─────┘  └─────────────────┘       │
│  Preview    Hex Input               │
│                                     │
│  ── From Theme ──────────────────   │
│  ○ Primary  ○ Accent                │
│  ○ Bg       ○ Text                  │
│                                     │
└─────────────────────────────────────┘
```

### Features to Include

1. **Color area** - Square for saturation (X) and brightness (Y)
2. **Hue slider** - Horizontal rainbow bar
3. **Opacity slider** - Horizontal with percentage label
4. **Color preview** - Small swatch showing current color
5. **Hex input** - Text field for precise entry
6. **From Theme section** - Collapsible/toggleable
   - Shows 4 swatches from active theme
   - Clicking a swatch applies that color

### Features to Exclude

1. **RGB/HSL toggle** - Confusing for non-designers
2. **Numeric RGB/HSL inputs** - Hex is enough
3. **Eyedropper** - Nice to have but not essential for MVP
4. **Color history** - Adds complexity
5. **Gradient editor** - Separate feature

### Visual Style

- Clean, minimal, white background
- Rounded corners (matches our design system)
- Subtle shadows
- Smooth transitions
- Dark mode support (future)

### Interaction

- Click color swatch → popover opens
- Click outside → popover closes
- Changes apply in real-time (no "Apply" button needed)
- Hex input validates on blur
- Opacity slider shows percentage

### Accessibility

- Keyboard navigation support
- Focus indicators
- ARIA labels
- Color contrast for text

---

## Proposed "From Theme" Integration

When user opens color picker:
1. Bottom section shows "From Theme" with horizontal divider
2. Four circular swatches representing theme colors
3. Labels under each: Primary, Accent, Background, Text
4. Clicking swatch fills the picker with that color
5. User can still adjust with sliders/hex after

---

## Technical Notes

### Current Implementation
- Using native `<input type="color">` which doesn't support opacity
- Browser's native picker varies by OS/browser
- No control over styling or features
- Opacity sliders added separately (clutters UI)

### Custom Picker Approach
- Build React component with canvas-based color selection
- Or use a headless color picker library and style it
- Must handle: hue, saturation, brightness, opacity, hex input

### Library Comparison
**Source**: [react-colorful GitHub](https://github.com/omgovich/react-colorful)

| Library | Size | Dependencies | Tree-shakeable | Notes |
|---------|------|--------------|----------------|-------|
| **react-colorful** | 2.8 KB | 0 | ✅ Yes | Most popular since 2021, lightweight, modular |
| react-color | ~140 KB | 11 | ❌ No | Feature-rich but bloated |
| @rc-component/color-picker | Medium | Several | Partial | Ant Design style |

**react-colorful advantages**:
- 18x lighter than react-color
- Zero dependencies
- TypeScript support
- WAI-ARIA accessible
- Modular - can compose custom layouts
- 12 color models (Hex, RGB, HSL, HSV)
- Does NOT include input field by default (we add our own)

**Recommendation**: Use **react-colorful** as base, add our own:
- Hex input field
- Opacity slider
- "From Theme" button/panel
- Custom styling to match our design system

---

## Implementation Checklist

### Research & Planning (Complete)
- [x] Complete research on major app color pickers
- [x] Document designer community feedback
- [x] Review user-provided examples (Graphic.com reference)
- [x] Document expanded vision (tabs, gradients, saved colors)
- [x] Create ASCII mockup/wireframe
- [x] Get user approval on executive plan (Session 9)

### Phase 1: Core Implementation (In Progress)
- [ ] Install react-colorful library
- [ ] Create base component structure (`components/shared/custom-color-picker/`)
- [ ] Build Color tab (saturation area + hue slider + opacity slider)
- [ ] Add hex input with auto-select on focus
- [ ] Add eyedropper (browser native API)
- [ ] Add color preview swatch
- [ ] Build Saved Colors section (4x5 grid)
- [ ] Add localStorage persistence for saved colors
- [ ] Integrate with Background panel (replace current color input)
- [ ] Add microinteractions (200ms transitions, smooth tab slides)

### Phase 2: Advanced Features
- [ ] Build Gradient tab with draggable stops (2-5 stops)
- [ ] Add gradient angle presets (→ ↘ ↓ ↙ ←) + number input
- [ ] Add gradient type toggle (linear/radial)
- [ ] Build Theme tab (4 brand color swatches)
- [ ] Add coach marks (first visit + ? icon replay)

### Phase 3: Persistence & Polish
- [ ] Add database persistence for saved colors
- [ ] Add "Copied!" toast on hex click
- [ ] User testing and approval
- [ ] Roll out to all color fields across Theme Builder

---

## REMAINING TASKS (After Color Picker)

### Still Open from Session 8

**Question 5: From Theme UX Flow**
- NOW INTEGRATED: The "Theme" tab in the color picker replaces the old "From Theme" button
- Each form element's color picker will have Theme tab showing Primary, Accent, Bg, Text swatches
- User picks any theme color for any field - no auto-assignment

**Question 7: Menu Theme Persistence (CRITICAL BUG)**
- Sidebar Menu preview theme (GHL Dark, Forest Night, etc.) NOT persisting after save
- Need to investigate:
  1. How Loading Screen and Colors tab persist successfully
  2. Compare data flow and identify where Menu tab differs
  3. Add console logging to trace save/load cycle
  4. Fix the persistence issue
- User requested investigation + logging BEFORE coding fix

---

## NEXT SESSION PROMPT

Copy this to start the next session:

```
Continue Custom Color Picker polish. Reference:
- docs/THEME_BUILDER_COLOR_PICKER.md (APPROVED executive plan at top)

STATUS:
- react-colorful installed ✅
- Base component structure created ✅
- Integrated into Background panel (Login Page → Background tab → Solid Color) ✅

TEST IT:
1. Run `pnpm dev`
2. Go to Theme Builder → Login Page tab
3. Click "Background" sub-tab
4. Select "Solid Color" from Type dropdown
5. Click the color trigger (swatch + hex) to open the new picker

POLISH ITEMS:
1. Test the color picker - verify all interactions work
2. Fix any bugs found during testing
3. Add coach marks (? icon in top-right to replay)
4. Wire up brandColors prop in login-designer.tsx for Theme tab
5. Test gradient tab - verify stops work correctly
6. Add 200ms transitions for smoother animations

KNOWN LIMITATIONS (OK for now):
- Theme tab won't show until brandColors prop is passed
- Database persistence not wired up yet (localStorage only)

AFTER COLOR PICKER APPROVED:
- Roll out to all color inputs across Theme Builder
- Menu Theme Persistence bug (GHL Dark not persisting)
```

---

*Document created: January 17, 2026*
*Last updated: January 17, 2026 - Session 9 (Executive Plan Approved)*
