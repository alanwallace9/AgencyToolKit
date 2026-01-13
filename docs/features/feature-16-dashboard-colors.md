# Feature 16: Dashboard Colors Page

## Executive Summary

A premium color customization page that lets agencies define their brand colors (primary, accent, sidebar background, sidebar text) to apply a consistent theme across their GHL sub-accounts. Users can pick from built-in presets, create/save custom theme presets, drag-drop their logo to extract brand colors, and see live preview of changes.

**Why this matters:**
- Professional white-labeling requires consistent brand colors
- Competitors charge $97-297/month for similar features
- Cross-feature integration (brand colors used in Loading Animations)
- One of the key "Theme Builder" features alongside Menu, Login, and Loading

---

## User Decisions (Confirmed Jan 12, 2026)

1. **Auto-save with debounce** - Yes, 500ms debounce, consistent with Loading Animations.

2. **Preview scope** - Full GHL mockup showing:
   - Sidebar background + text
   - Header/top navigation
   - Primary buttons (CTAs, form submits)
   - Accent colors (links, active states)
   - Cards and content areas
   - Pipeline/contacts preview
   - Tab active indicators
   - Chart/graph accents (simplified)

3. **Custom Presets** - Full preset management:
   - Name presets ("Funnel Launch", "Client A Brand", etc.)
   - CRUD operations (create, edit, delete)
   - Set default preset
   - Light/Dark toggle for each theme

4. **Eyedropper** - Use native HTML color picker (has built-in eyedropper)

5. **Logo extraction** - Drag-drop logo to extract brand colors using Color Thief library

6. **Harmony suggestions** - HSL math for complementary/triadic accent suggestions

7. **URL extraction** - BACKLOG (see feature-16-backlog.md)

8. **Reset to defaults** - Yes, include option

9. **Contrast checker** - Yes, WCAG AA validation with warning badge

10. **Copy CSS** - Expandable panel like Menu Customizer with instructions

11. **Glass morphism** - Apply to Color Studio and Theme Gallery panels

---

## Layout (3-Panel Design)

```
+------------------------------------------------------------------+
| Dashboard Colors                                    [Auto-saved] |
+------------------------------------------------------------------+
|                                                                  |
| +-------------+ +---------------------------+ +----------------+ |
| | THEME       | |                           | | COLOR STUDIO   | |
| | GALLERY     | |      LIVE PREVIEW         | |                | |
| |             | |                           | | Primary        | |
| | Built-in:   | | +--------+------------+   | | [████] #2563eb | |
| | [Blue Dark] | | |SIDEBAR |  HEADER    |   | |                | |
| | [Blue Light]| | |        |------------|   | | Accent         | |
| | [Green Dark]| | | Menu   | Pipeline   |   | | [████] #10b981 | |
| | [Green Lt] | | | Items  |            |   | | [Harmony chips]| |
| | [Orange Dk] | | |        | +-------+  |   | |                | |
| | [Orange Lt] | | |        | | Card  |  |   | | Sidebar BG     | |
| | [Gold/Black]| | |        | +-------+  |   | | [████] #1f2937 | |
| | [Neutral Lt]| | |        |            |   | |                | |
| |             | | |        | [Button]   |   | | Sidebar Text   | |
| | My Presets: | | +--------+------------+   | | [████] #f9fafb | |
| | [Client A]  | |                           | |                | |
| | [+ New]     | |                           | | +------------+ | |
| +-------------+ +---------------------------+ | | DROP LOGO  | | |
|                                               | | HERE       | | |
| +--------------------------------------------+ | +------------+ | |
| | CSS OUTPUT                          [Copy] | |                | |
| | :root { --primary: #2563eb; ... }          | | [Reset Default]| |
| +--------------------------------------------+ +----------------+ |
+------------------------------------------------------------------+
```

---

## Built-in Presets (8 Themes)

Based on research: GHL agencies commonly use blue (trust/professional), green (growth/eco), orange (energy/creative), and luxury gold/black schemes.

```typescript
const COLOR_PRESETS = [
  // Blue variants
  { id: 'blue-dark', label: 'Midnight Blue', colors: {
    primary: '#2563eb', accent: '#06b6d4', sidebar_bg: '#0f172a', sidebar_text: '#e2e8f0'
  }},
  { id: 'blue-light', label: 'Ocean Breeze', colors: {
    primary: '#1d4ed8', accent: '#0891b2', sidebar_bg: '#f0f9ff', sidebar_text: '#0c4a6e'
  }},

  // Green variants
  { id: 'green-dark', label: 'Forest Night', colors: {
    primary: '#16a34a', accent: '#84cc16', sidebar_bg: '#14532d', sidebar_text: '#dcfce7'
  }},
  { id: 'green-light', label: 'Fresh Mint', colors: {
    primary: '#059669', accent: '#10b981', sidebar_bg: '#ecfdf5', sidebar_text: '#064e3b'
  }},

  // Orange variants
  { id: 'orange-dark', label: 'Sunset Ember', colors: {
    primary: '#ea580c', accent: '#f59e0b', sidebar_bg: '#431407', sidebar_text: '#fed7aa'
  }},
  { id: 'orange-light', label: 'Coral Sunrise', colors: {
    primary: '#f97316', accent: '#fbbf24', sidebar_bg: '#fff7ed', sidebar_text: '#7c2d12'
  }},

  // Luxury/Finance
  { id: 'gold-black', label: 'Executive Gold', colors: {
    primary: '#d4a500', accent: '#f5c842', sidebar_bg: '#0a0a0a', sidebar_text: '#fef3c7'
  }},

  // Neutral/Elegant
  { id: 'neutral-light', label: 'Clean Slate', colors: {
    primary: '#6366f1', accent: '#8b5cf6', sidebar_bg: '#f8fafc', sidebar_text: '#334155'
  }},
];
```

**Design philosophy:** Like a Jeep - start with a neutral base (black, white, slate) and add your accent color. Blue/green/orange bases are versatile for most brand colors.

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

### ColorPreset (new database table)
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

### Database Migration
```sql
CREATE TABLE color_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  colors JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_color_presets_agency ON color_presets(agency_id);

ALTER TABLE color_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own color presets"
  ON color_presets FOR ALL
  USING (agency_id IN (
    SELECT id FROM agencies WHERE clerk_user_id = auth.jwt()->>'sub'
  ));
```

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `colors/page.tsx` | Server component, fetches agency + presets |
| `colors/_components/colors-client.tsx` | Main client with state, layout, auto-save |
| `colors/_components/theme-gallery.tsx` | Built-in + custom presets with hover-to-preview |
| `colors/_components/color-studio.tsx` | 4 pickers + logo drop zone + harmony chips |
| `colors/_components/preview-panel.tsx` | Full GHL mockup (sidebar, header, cards, pipeline) |
| `colors/_components/css-output-panel.tsx` | Collapsible CSS with copy button |
| `colors/_components/contrast-badge.tsx` | WCAG pass/fail indicator |
| `colors/_lib/color-utils.ts` | HSL conversion, harmony calculations, contrast ratio |
| `colors/_actions/color-actions.ts` | Server actions for preset CRUD |

### Modify
| File | Change |
|------|--------|
| `lib/constants.ts` | Replace COLOR_PRESETS with 8 themes |
| `types/database.ts` | Ensure ColorPreset interface exists |

---

## Technical Implementation Notes

### Color Thief Integration (Logo Extraction)
```typescript
// Install: pnpm add colorthief
import ColorThief from 'colorthief';

function extractFromLogo(imgElement: HTMLImageElement): string[] {
  const colorThief = new ColorThief();
  const palette = colorThief.getPalette(imgElement, 4); // 4 colors
  return palette.map(([r, g, b]) => rgbToHex(r, g, b));
}
```

### HSL Harmony Calculations
```typescript
function getHarmony(hex: string, type: 'complementary' | 'triadic' | 'analogous'): string[] {
  const hsl = hexToHsl(hex);

  switch (type) {
    case 'complementary':
      return [hslToHex({ ...hsl, h: (hsl.h + 180) % 360 })];
    case 'triadic':
      return [
        hslToHex({ ...hsl, h: (hsl.h + 120) % 360 }),
        hslToHex({ ...hsl, h: (hsl.h + 240) % 360 }),
      ];
    case 'analogous':
      return [
        hslToHex({ ...hsl, h: (hsl.h + 30) % 360 }),
        hslToHex({ ...hsl, h: (hsl.h - 30 + 360) % 360 }),
      ];
  }
}
```

### WCAG Contrast Ratio
```typescript
function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG AA requires 4.5:1 for normal text, 3:1 for large text
function passesWCAG(ratio: number): boolean {
  return ratio >= 4.5;
}
```

### Glass Morphism CSS
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-panel-dark {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Learning from Feature 14 (Iframe Sizing)
- Use `ref.getBoundingClientRect()` for any percentage calculations
- Test positioning in iframe context
- Apply bounds checking for any draggable elements
- Don't assume fixed dimensions

---

## Implementation Order

1. Database migration - Create `color_presets` table
2. Expand constants - 8 built-in presets
3. Server actions - CRUD for presets
4. Color utilities - HSL, harmony, contrast functions
5. Theme Gallery - Presets with hover-to-preview
6. Color Studio - 4 pickers + logo drop zone
7. Harmony suggestions - Chips based on primary color
8. Preview Panel - Full GHL mockup
9. Contrast checker - Badge on sidebar text
10. CSS output panel - Collapsible with copy
11. Auto-save - 500ms debounce
12. Glass morphism - Premium styling
13. Integration testing - Iframe context

---

## Competitor Comparison (Updated)

| Feature | HL Pro Tools | Marketer's Toolkit | GHL Style | **Agency Toolkit** |
|---------|-------------|-------------------|-----------|-------------------|
| Sidebar colors | Yes | Yes | Yes | **Yes** |
| Header colors | Yes | Yes | Yes | **Yes** |
| Button/accent colors | Yes | Yes | No | **Yes** |
| Full GHL preview | Limited | Limited | Limited | **Full mockup** |
| Live preview | Partial | Yes | Yes | **Yes + hover** |
| Preset themes | Yes | Yes | 3 paid | **8 built-in** |
| Custom preset saving | No | No | No | **Yes** |
| Logo color extraction | No | No | No | **Yes** |
| Harmony suggestions | No | No | No | **Yes** |
| Contrast checking | No | No | No | **Yes (WCAG)** |
| No code required | No | Partial | Yes | **Yes** |
| Glass morphism UI | No | No | No | **Yes** |
| Installation | Complex | 3 code sections | 1 code | **1 embed** |
| Price | Subscription | $97+/mo | Free | **Included** |

---

## Success Metrics

- User can select preset and see preview in under 5 seconds
- Custom preset creation < 30 seconds
- Logo extraction to theme < 10 seconds
- Live preview updates instantly (< 100ms)
- Contrast warnings appear for WCAG AA violations
- CSS output is valid and copy-paste ready
- UI feels premium (glass morphism, smooth transitions)

---

## Backlog (Future Phases)

See `docs/features/feature-16-backlog.md` for:
- 50+ CSS variables
- Typography customization
- Border radius, shadows, padding
- URL-based color extraction
- Per sub-account theme assignment
- Real-time sync to GHL

---

## Sources

- [HL Pro Tools Theme Builder](https://builder.hlprotools.com/)
- [Marketer's Toolkit Theme Builder](https://themarketerstoolkit.com/theme-builder/)
- [GHL Style](https://www.ghlstyle.com/)
- [Color Thief Library](https://lokeshdhakar.com/projects/color-thief/)
- [Color Harmonies in JavaScript](https://dev.to/benjaminadk/make-color-math-great-again--45of)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [SaaS Dashboard Design Trends 2025](https://uitop.design/blog/design/top-dashboard-design-trends/)

---

*Last updated: 2026-01-12*
