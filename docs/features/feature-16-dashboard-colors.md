# Feature 16: Dashboard Colors Page

## Executive Summary

A color customization page that lets agencies define their brand colors to apply a consistent theme across their GHL sub-accounts. Users can pick from preset themes, create custom color presets (with naming), and see live preview of changes.

**Why this matters:**
- Professional white-labeling requires consistent brand colors
- Competitors charge $97-297/month for similar features
- Cross-feature integration (brand colors used in Loading Animations)

---

## Competitor Analysis (Jan 12, 2026)

### HL Pro Tools Theme Builder
- **Price:** Part of HL Pro Tools subscription
- **Features:**
  - 50+ CSS color variables
  - Primary/Secondary color system
  - Typography customization (fonts, weights)
  - Button colors, backgrounds, borders
  - Form backgrounds
  - Border radius, shadows, padding
  - Progress bar colors
  - Complete CSS override capability
- **UI:** Advanced, requires CSS knowledge for full customization
- **Source:** [HL Pro Tools Theme Builder](https://builder.hlprotools.com/)

### Marketer's Toolkit Theme Builder
- **Price:** $97/month or $997 lifetime
- **Features:**
  - GHL Starter Theme with easy color customization
  - Sidebar customization
  - Dashboard graph colors
  - Top navigation option
  - Multiple built-in themes (dark, light, vibrant)
  - Flyout & accordion menu replacements
- **Installation:** Requires 3 code sections in GHL Company Settings > White Label
- **Source:** [Marketer's Toolkit](https://themarketerstoolkit.com/theme-builder/)

### GHL Style (Free)
- **Price:** Free forever
- **Features:**
  - Sidebar colors
  - Header colors
  - Card section colors
  - Live preview
  - No coding required
- **Limitation:** Basic color options only
- **Source:** [GHL Style](https://www.ghlstyle.com/)

### Competitive Positioning
| Feature | HL Pro Tools | Marketer's Toolkit | GHL Style | **Agency Toolkit** |
|---------|-------------|-------------------|-----------|-------------------|
| Sidebar colors | Yes | Yes | Yes | **Yes** |
| Header colors | Yes | Yes | Yes | **Yes** |
| Button/accent colors | Yes | Yes | No | **Yes** |
| Live preview | Limited | Yes | Yes | **Yes** |
| Preset themes | Yes | Yes | No | **Yes** |
| Custom preset saving | No | No | No | **Yes** |
| No code required | No | Partial | Yes | **Yes** |
| Price | Subscription | $97+/mo | Free | **Included** |

---

## User Decisions (Confirmed)

1. **Auto-save with debounce** - Yes, consistent with Loading Animations. Minimize DB hits.

2. **Preview scope** - Show sidebar AND other GHL elements:
   - Sidebar background + text
   - Primary buttons (CTAs, form submits)
   - Accent colors (links, active states)
   - Top navigation/header
   - Tab active indicators
   - Potentially chart/graph accents

3. **Custom Presets** - Full preset management (like Menu Presets):
   - Name presets ("Funnel Launch", "Product A Brand", etc.)
   - CRUD operations (create, edit, delete)
   - Set default preset
   - Future: assign presets to specific sub-accounts

4. **Eyedropper** - Use native HTML color picker (has built-in eyedropper)

5. **URL extraction** - Skip for now (high effort, potentially fragile)

6. **Reset to defaults** - Yes, include option

7. **Contrast checker** - Yes, warn on poor text/background contrast

8. **Copy CSS** - Expandable panel like Menu Customizer with instructions

---

## Data Model

### ColorConfig (existing in types/database.ts)
```typescript
export interface ColorConfig {
  primary: string;      // Primary brand color (buttons, links)
  accent: string;       // Accent/highlight color
  sidebar_bg: string;   // Sidebar background
  sidebar_text: string; // Sidebar text color
}
```

### New: ColorPreset (needs database table)
```typescript
export interface ColorPreset {
  id: string;
  agency_id: string;
  name: string;
  is_default: boolean;
  colors: ColorConfig;
  created_at: string;
  updated_at: string;
}
```

### Built-in Presets (from spec/CONSTANTS.md)
```typescript
const COLOR_PRESETS = [
  { id: 'default', label: 'Default', colors: { primary: '#2563eb', accent: '#10b981', sidebar_bg: '#1f2937', sidebar_text: '#f9fafb' }},
  { id: 'dark', label: 'Dark Mode', colors: { primary: '#3b82f6', accent: '#22c55e', sidebar_bg: '#0f172a', sidebar_text: '#e2e8f0' }},
  { id: 'light', label: 'Light Mode', colors: { primary: '#1d4ed8', accent: '#059669', sidebar_bg: '#f8fafc', sidebar_text: '#1e293b' }},
  { id: 'purple', label: 'Purple Theme', colors: { primary: '#7c3aed', accent: '#f59e0b', sidebar_bg: '#1e1b4b', sidebar_text: '#e9d5ff' }},
];
```

---

## UI Layout

```
+------------------------------------------------------------------+
| Dashboard Colors                                                  |
| Customize your GHL dashboard color theme                         |
+------------------------------------------------------------------+
|                                                                  |
| +------------------+  +--------------------------------------+   |
| | YOUR PRESETS     |  |           LIVE PREVIEW               |   |
| |                  |  |                                      |   |
| | [Default]        |  |  +--------+  +------------------+    |   |
| | [Dark Mode]      |  |  |SIDEBAR |  |    HEADER BAR    |    |   |
| | [Light Mode]     |  |  |        |  +------------------+    |   |
| | [Purple]         |  |  | Menu   |  |                  |    |   |
| | [+ New Preset]   |  |  | Items  |  |  Card Content    |    |   |
| |                  |  |  |        |  |                  |    |   |
| | MY PRESETS       |  |  |        |  |  [Primary Btn]   |    |   |
| | [Funnel Launch]  |  |  |        |  |  [Accent Link]   |    |   |
| | [Product A]      |  |  +--------+  +------------------+    |   |
| +------------------+  +--------------------------------------+   |
|                                                                  |
| +------------------------------------------------------------+   |
| | COLOR SETTINGS                                              |   |
| |                                                             |   |
| | Primary Color     [#2563eb] [████] [eyedropper]            |   |
| | Accent Color      [#10b981] [████] [eyedropper]            |   |
| | Sidebar BG        [#1f2937] [████] [eyedropper]            |   |
| | Sidebar Text      [#f9fafb] [████] [eyedropper]            |   |
| |                                                             |   |
| | ⚠️ Low contrast: Sidebar text may be hard to read          |   |
| |                                                             |   |
| | [Reset to GHL Default]                                      |   |
| +------------------------------------------------------------+   |
|                                                                  |
| +------------------------------------------------------------+   |
| | CSS OUTPUT                                        [Expand ▼]|   |
| +------------------------------------------------------------+   |
+------------------------------------------------------------------+
```

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `colors/page.tsx` | Server component, fetches presets |
| `colors/_components/colors-client.tsx` | Main client component with state |
| `colors/_components/preset-card.tsx` | Individual preset display/selection |
| `colors/_components/color-picker-panel.tsx` | 4 color inputs with contrast warning |
| `colors/_components/preview-panel.tsx` | Live GHL-style preview |
| `colors/_components/css-output-panel.tsx` | Expandable CSS with copy button |
| `colors/_actions/color-actions.ts` | Server actions for presets |

### Modify
| File | Change |
|------|--------|
| `lib/constants.ts` | Add COLOR_PRESETS array |
| `types/database.ts` | Add ColorPreset interface (if needed) |

### Database
| Change | Description |
|--------|-------------|
| New table: `color_presets` | Store custom presets per agency |
| Migration | Create table with RLS policies |

---

## Implementation Order

1. **Database migration** - Create `color_presets` table
2. **Add constants** - COLOR_PRESETS to lib/constants.ts
3. **Server actions** - CRUD for color presets
4. **Preset cards** - Display built-in + custom presets
5. **Color picker panel** - 4 inputs with native eyedropper
6. **Contrast checker** - Warn on poor text/bg contrast
7. **Preview panel** - Live GHL mockup
8. **CSS output panel** - Collapsible with copy + instructions
9. **Auto-save with debounce** - Wire up to server action
10. **Integration** - Ensure embed script applies colors correctly

---

## GHL CSS Selectors (Research Needed)

Based on competitor analysis, likely targets:
```css
/* Sidebar */
[data-sidebar], .sidebar, .navigation-sidebar {
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
}

/* Primary buttons */
.btn-primary, [data-button="primary"], button[type="submit"] {
  background-color: var(--primary);
}

/* Accent/links */
a, .text-primary, .active-tab {
  color: var(--accent);
}

/* Header */
.header, .top-nav, [data-header] {
  /* varies by GHL version */
}
```

**Note:** Exact selectors will need testing in live GHL environment.

---

## Success Metrics

- User can select preset in under 10 seconds
- Custom preset creation < 30 seconds
- Live preview updates instantly (< 100ms)
- Contrast warnings appear for WCAG AA violations
- CSS output is valid and copy-paste ready

---

## Sources

- [HL Pro Tools Theme Builder](https://builder.hlprotools.com/)
- [Marketer's Toolkit Theme Builder](https://themarketerstoolkit.com/theme-builder/)
- [GHL Style](https://www.ghlstyle.com/)
- [HL Pro Tools 2025 Guide](https://guzzoat.com/hl-pro-tools-theme-builder/)
- [GHL Custom CSS Guide](https://howtohighlevel.com/gohighlevel-custom-css-elevate-your-design/)
