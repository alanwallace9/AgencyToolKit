# Feature: Guidely Themes System

**Status:** Specification Complete (Ready for Implementation)
**Priority:** High (Foundation for visual consistency across all Guidely features)
**Estimated Sessions:** 2-3
**Dependencies:** Feature 23 (Tour Themes - basic structure exists)
**Blocks:** None (enhances existing features)

---

## Overview

The Guidely Themes System provides a centralized way for agencies to create, manage, and apply consistent visual styling across all Guidely components: Tours, Smart Tips, Banners, and Checklists. Agencies can start from 5 built-in templates and customize them to match their brand, then set per-feature defaults while retaining the ability to override themes on individual items.

**Why This Matters:**
- White-label agencies need their onboarding to look professional and on-brand
- Consistency across tours, tips, and banners builds trust with subaccount users
- Reduces repetitive styling work - set it once, apply everywhere
- Quick-start templates let agencies get professional results immediately

---

## User Stories

1. **As an agency owner**, I want to choose from pre-built theme templates so I can get started quickly without design skills.
2. **As an agency owner**, I want to customize themes to match my brand colors and typography.
3. **As an agency owner**, I want to set a default theme for each feature type (e.g., all tours use "Corporate", all banners use "Bold").
4. **As an agency owner**, I want to override the theme on specific items when needed (e.g., a special holiday banner).
5. **As an agency owner**, I want to preview how themes look across different component types before applying them.
6. **As an agency owner**, I want to save my custom themes so I can reuse them across all my Guidely content.

---

## 5 Default Theme Templates

| Template | Avatar | Corners | Colors | Vibe | Use Case |
|----------|--------|---------|--------|------|----------|
| **Friendly** | Yes (circle) + placeholder | Rounded (16px) | Blue primary, soft shadows | Warm, approachable | SaaS, consumer apps |
| **Corporate** | No | Subtle (8px) | Navy/gray, minimal shadow | Professional, clean | B2B, enterprise |
| **Bold** | Optional (rounded square) | Large (24px) | Bright accent (purple/teal), high contrast | Modern, energetic | Startups, creative |
| **Minimal** | No | Sharp (4px) | Monochrome + single accent | Clean, understated | Productivity, dev tools |
| **Colorful** | Yes (circle) + placeholder | Very rounded (20px) | Coral/lime/yellow accents | Fun, engaging | Marketing, education |

> **Note:** Templates with avatars enabled include a default placeholder image. Agencies can replace with their own.

### Template Variants

Each template includes pre-configured settings for:
- **Tours**: Modal and tooltip styles, progress indicators
- **Smart Tips**: Tooltip appearance, beacon styling
- **Banners**: Bar appearance, button styling
- **Checklists**: Widget appearance, progress indicators

---

## Theme Properties

### Global Properties (Apply to All Components)

| Category | Property | Description | Default |
|----------|----------|-------------|---------|
| **Colors** | Primary color | Main accent color | #3B82F6 |
| | Primary hover | Hover state | darken 10% |
| | Primary text | Text on primary bg | #FFFFFF |
| | Secondary color | Secondary accent | #6B7280 |
| | Secondary hover | Hover state | darken 10% |
| | Secondary text | Text on secondary bg | #FFFFFF |
| | Background | Container background | #FFFFFF |
| | Text | Default text color | #1F2937 |
| | Text secondary | Muted text | #6B7280 |
| | Border | Border color | #E5E7EB |
| **Typography** | Font family | System or Google font | system-ui |
| | Title size | Heading size | 18px |
| | Body size | Content size | 14px |
| | Line height | Text line height | 1.5 |
| **Shape** | Border radius | Corner rounding (0-24px) | 8px |
| | Shadow | none / subtle / medium / strong | subtle |
| **Avatar** | Enabled | Show avatar area | false |
| | Shape | circle / rounded / square | circle |
| | Size | Avatar dimensions | 48px |
| | Default image | Placeholder image URL | null |
| **Buttons** | Style | filled / outline / ghost | filled |
| | Border radius | Button corner rounding | 6px |

### Component-Specific Overrides

Each theme can have per-component color overrides:

**Tours:**
- Progress bar color
- Progress inactive color
- Close icon color
- Backdrop color
- Progress style (dots / numbers / bar)

**Smart Tips:**
- Tooltip background (can differ from main bg)
- Beacon color
- Arrow color

**Banners:**
- Banner background (separate from container)
- Banner text color
- Dismiss icon color

**Checklists:**
- Header background
- Header text
- Completion checkmark color
- Item text color
- Link color

---

## UI Design

### Themes List Page (`/g/themes`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Themes                                                          [+ New Theme]│
│  Customize the visual appearance of your Guidely content                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STARTER TEMPLATES                                           [Collapse ↑]    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│  │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │┌───────┐││
│  │ │  (◠‿◠) │ │ │ │ ▄▄▄▄▄▄▄ │ │ │ │ ████████│ │ │ │ ───────── │ │││ 🎉    │││
│  │ │ Hello! │ │ │ │  Text   │ │ │ │  Bold   │ │ │ │  Clean   │ │ ││ Fun!  │││
│  │ │ [Next] │ │ │ │ [Next]  │ │ │ │ [Next]  │ │ │ │  [Next]  │ │ ││[Next] │││
│  │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │└───────┘││
│  │  Friendly   │ │  Corporate  │ │    Bold     │ │   Minimal   │ │ Colorful ││
│  │  + Use      │ │   + Use     │ │   + Use     │ │    + Use    │ │  + Use  ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│  MY THEMES                                                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ 🎨 Brand Theme                                              ⭐ Default  │  │
│  │    Blue primary · Rounded corners · With avatar                        │  │
│  │    Tours: Default | Tips: Default | Banners: Default              ...  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ 🎨 Holiday Special                                                      │  │
│  │    Red/green · Extra rounded · Festive feel                            │  │
│  │    Tours: — | Tips: — | Banners: Default                          ...  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ 🎨 Minimal Client Theme                                                 │  │
│  │    Gray accent · Sharp corners · No avatar                             │  │
│  │    Tours: — | Tips: — | Banners: —                                ...  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Theme Editor Page (`/g/themes/[id]`)

**Layout:** 2-column layout matching other Guidely builders (Settings | Preview).
Preview type selector at top of preview panel to switch between Tour/Tip/Banner/Checklist views.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Back    Brand Theme                              [All changes saved]  [···]│
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────┬────────────────────────────────────┐│
│  │                                     │                                    ││
│  │  THEME SETTINGS                     │  PREVIEW AS:                       ││
│  │  ─────────────────────────────────  │  ┌──────┐┌──────┐┌──────┐┌──────┐ ││
│  │                                     │  │ Tour ││ Tip  ││Banner││Check │ ││
│  │  Theme Name                         │  │  ●   ││      ││      ││      │ ││
│  │  ┌───────────────────────────────┐  │  └──────┘└──────┘└──────┘└──────┘ ││
│  │  │ Brand Theme                   │  │                                    ││
│  │  └───────────────────────────────┘  │   ┌────────────────────────────┐   ││
│  │                                     │   │░░░░░░░░░░░░░░░░░░░░░░░░░░░│   ││
│  │  Used by: 3 tours, 2 tips, 1 banner │   │░░░ ┌──────────────────┐ ░░░│   ││
│  │           [hover to see which]      │   │░░░ │      (◠‿◠)       │ ░░░│   ││
│  │                                     │   │░░░ │                  │ ░░░│   ││
│  │  ─────────────────────────────────  │   │░░░ │  Welcome, John!  │ ░░░│   ││
│  │                                     │   │░░░ │                  │ ░░░│   ││
│  │  MAIN COLORS                        │   │░░░ │  Let's get you   │ ░░░│   ││
│  │                                     │   │░░░ │  started.        │ ░░░│   ││
│  │  Primary        Primary hover       │   │░░░ │                  │ ░░░│   ││
│  │  ┌──────┐      ┌──────┐            │   │░░░ │  ● ○ ○ ○        │ ░░░│   ││
│  │  │ ████ │      │ ████ │            │   │░░░ │                  │ ░░░│   ││
│  │  │#3B82F6│ 📋   │#2563EB│ 📋        │   │░░░ │ [Skip]  [Next →] │ ░░░│   ││
│  │  └──────┘      └──────┘            │   │░░░ └──────────────────┘ ░░░│   ││
│  │  ⚠️ Low contrast with background    │   │░░░░░░░░░░░░░░░░░░░░░░░░░░░│   ││
│  │                                     │   └────────────────────────────┘   ││
│  │  Primary text   Background          │                                    ││
│  │  ┌──────┐      ┌──────┐            │                                    ││
│  │  │ ████ │ 📋   │ ████ │ 📋        │                                    ││
│  │  │#FFFFFF│      │#FFFFFF│            │                                    ││
│  │  └──────┘      └──────┘            │                                    ││
│  │                                     │                                    ││
│  │  [▼ Show all colors]               │                                    ││
│  │                                     │                                    ││
│  │  ─────────────────────────────────  │                                    ││
│  │                                     │                                    ││
│  │  TYPOGRAPHY                         │                                    ││
│  │                                     │                                    ││
│  │  Font Family                        │                                    ││
│  │  [System Default (Recommended) ▼]  │                                    ││
│  │                                     │                                    ││
│  │  Title Size        Body Size        │                                    ││
│  │  [18px      ▼]    [14px      ▼]    │                                    ││
│  │                                     │                                    ││
│  │  ─────────────────────────────────  │                                    ││
│  │                                     │                                    ││
│  │  SHAPE                              │                                    ││
│  │                                     │                                    ││
│  │  Border Radius        ┌─────────┐   │                                    ││
│  │  [0px────●────24px]   │ Preview │   │                                    ││
│  │   Current: 12px       └─────────┘   │                                    ││
│  │                                     │                                    ││
│  │  Shadow                             │                                    ││
│  │  ○ None ● Subtle ○ Medium ○ Strong │                                    ││
│  │                                     │                                    ││
│  │  ─────────────────────────────────  │                                    ││
│  │                                     │                                    ││
│  │  AVATAR                             │                                    ││
│  │                                     │                                    ││
│  │  [✓] Show avatar in modals         │                                    ││
│  │                                     │                                    ││
│  │  Shape                              │                                    ││
│  │  ● Circle  ○ Rounded  ○ Square     │                                    ││
│  │                                     │                                    ││
│  │  Size                               │                                    ││
│  │  [48px──────●──────80px]  56px     │                                    ││
│  │                                     │                                    ││
│  │  ℹ️ Recommended: 112x112px image    │                                    ││
│  │     (2x display size for retina)   │                                    ││
│  │                                     │                                    ││
│  │  Default Avatar                     │                                    ││
│  │  ┌───────────────────────────────┐  │                                    ││
│  │  │  [Upload Image]  or drag here │  │                                    ││
│  │  │                               │  │                                    ││
│  │  │  PNG, JPG up to 500KB         │  │                                    ││
│  │  │  Ideal: 112x112px (square)    │  │                                    ││
│  │  └───────────────────────────────┘  │                                    ││
│  │                                     │                                    ││
│  │  ─────────────────────────────────  │                                    ││
│  │                                     │                                    ││
│  │  BUTTONS                            │                                    ││
│  │                                     │                                    ││
│  │  Style                              │                                    ││
│  │  ● Filled  ○ Outline  ○ Ghost      │                                    ││
│  │                                     │                                    ││
│  │  Button Radius                      │                                    ││
│  │  [0px────────●────────16px]  6px   │                                    ││
│  │                                     │                                    ││
│  │  ─────────────────────────────────  │                                    ││
│  │                                     │                                    ││
│  │  [▼ COMPONENT-SPECIFIC COLORS]     │                                    ││
│  │                                     │                                    ││
│  │  (Expandable sections for Tours,    │                                    ││
│  │   Smart Tips, Banners, Checklists) │                                    ││
│  │                                     │                                    ││
│  └─────────────────────────────────────┴────────────────────────────────────┘│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

Legend:
📋 = Click to copy hex to clipboard
⚠️ = Contrast warning (auto-detected when text/bg fails WCAG AA)
```

### Component-Specific Colors (Expanded)

```
│  [▼ TOURS COLORS]                     │
│                                        │
│  Progress bar       Progress inactive  │
│  ┌──────┐          ┌──────┐           │
│  │ ████ │ #10B981  │ ████ │ #E5E7EB   │
│  └──────┘          └──────┘           │
│                                        │
│  Close icon         Backdrop           │
│  ┌──────┐          ┌──────┐           │
│  │ ████ │ #6B7280  │ ████ │ rgba(0,0,0,0.5)
│  └──────┘          └──────┘           │
│                                        │
│  Progress Style                        │
│  ● Dots  ○ Numbers  ○ Bar             │
│                                        │
│  ─────────────────────────────────     │
│                                        │
│  [▶ SMART TIPS COLORS]                │
│  [▶ BANNERS COLORS]                   │
│  [▶ CHECKLISTS COLORS]                │
```

### Theme Selection in Feature Builders

When editing a Tour, Smart Tip, or Banner, the theme dropdown appears in settings:

```
┌────────────────────────────────────────┐
│  APPEARANCE                            │
│  ──────────────────────────────────    │
│                                        │
│  Theme                                 │
│  ┌──────────────────────────────────┐  │
│  │ Brand Theme (Default)          ▼ │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Options:                              │
│  • Brand Theme (Default for Tours)     │
│  • Holiday Special                     │
│  • Minimal Client Theme                │
│  ─────────────────────                 │
│  • Friendly (Template)                 │
│  • Corporate (Template)                │
│  • Bold (Template)                     │
│  • Minimal (Template)                  │
│  • Colorful (Template)                  │
│                                        │
└────────────────────────────────────────┘
```

### Feature Defaults in Guidely Settings (`/g/settings` or `/g/themes`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  DEFAULT THEMES                                                              │
│  Set the default theme for each content type. Individual items can override. │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Tours                                Smart Tips                             │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐       │
│  │ Brand Theme                ▼ │    │ Brand Theme                ▼ │       │
│  └──────────────────────────────┘    └──────────────────────────────┘       │
│                                                                              │
│  Banners                              Checklists                             │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐       │
│  │ Holiday Special            ▼ │    │ Brand Theme                ▼ │       │
│  └──────────────────────────────┘    └──────────────────────────────┘       │
│                                                                              │
│  ℹ️ New content will use these themes automatically. You can override the   │
│     theme on any individual tour, tip, banner, or checklist.                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Updated Table: `guidely_themes` (renamed from `tour_themes`)

```sql
CREATE TABLE guidely_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,  -- NULL for system templates

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,  -- Optional description
  is_system BOOLEAN DEFAULT false,  -- Built-in template (cannot delete)

  -- Global colors
  colors JSONB NOT NULL DEFAULT '{
    "primary": "#3B82F6",
    "primary_hover": "#2563EB",
    "primary_text": "#FFFFFF",
    "secondary": "#6B7280",
    "secondary_hover": "#4B5563",
    "secondary_text": "#FFFFFF",
    "background": "#FFFFFF",
    "text": "#1F2937",
    "text_secondary": "#6B7280",
    "border": "#E5E7EB"
  }',

  -- Typography
  typography JSONB NOT NULL DEFAULT '{
    "font_family": "system-ui, -apple-system, sans-serif",
    "title_size": "18px",
    "body_size": "14px",
    "line_height": "1.5"
  }',

  -- Shape
  shape JSONB NOT NULL DEFAULT '{
    "border_radius": "8px",
    "shadow": "subtle"
  }',

  -- Avatar settings
  avatar JSONB NOT NULL DEFAULT '{
    "enabled": false,
    "shape": "circle",
    "size": "48px",
    "default_image_url": null
  }',

  -- Button settings
  buttons JSONB NOT NULL DEFAULT '{
    "style": "filled",
    "border_radius": "6px"
  }',

  -- Component-specific overrides (null = use global)
  tour_overrides JSONB DEFAULT '{
    "progress_color": null,
    "progress_inactive": null,
    "close_icon_color": null,
    "backdrop_color": "rgba(0,0,0,0.5)",
    "progress_style": "dots"
  }',

  smart_tip_overrides JSONB DEFAULT '{
    "tooltip_background": null,
    "beacon_color": null,
    "arrow_color": null
  }',

  banner_overrides JSONB DEFAULT '{
    "banner_background": null,
    "banner_text": null,
    "dismiss_icon_color": null
  }',

  checklist_overrides JSONB DEFAULT '{
    "header_background": null,
    "header_text": null,
    "completion_color": null,
    "item_text_color": null,
    "link_color": null
  }',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_guidely_themes_agency ON guidely_themes(agency_id);
CREATE INDEX idx_guidely_themes_system ON guidely_themes(is_system) WHERE is_system = true;
```

### Agency Settings Update

```sql
-- Add to agencies.settings JSONB:
{
  "guidely_defaults": {
    "tour_theme_id": "uuid-or-null",
    "smart_tip_theme_id": "uuid-or-null",
    "banner_theme_id": "uuid-or-null",
    "checklist_theme_id": "uuid-or-null"
  }
}
```

### Migration from `tour_themes`

```sql
-- 1. Create new table
CREATE TABLE guidely_themes AS SELECT * FROM tour_themes;

-- 2. Add new columns
ALTER TABLE guidely_themes
  ADD COLUMN description TEXT,
  ADD COLUMN avatar JSONB DEFAULT '{"enabled": false, "shape": "circle", "size": "48px", "default_image_url": null}',
  ADD COLUMN buttons JSONB DEFAULT '{"style": "filled", "border_radius": "6px"}',
  ADD COLUMN smart_tip_overrides JSONB DEFAULT '{}',
  ADD COLUMN banner_overrides JSONB DEFAULT '{}',
  ADD COLUMN checklist_overrides JSONB DEFAULT '{}';

-- 3. Rename existing columns if needed
ALTER TABLE guidely_themes RENAME COLUMN borders TO shape;

-- 4. Update foreign keys in tours, smart_tips, banners, checklists
-- (they already have theme_id columns)

-- 5. Drop old table after verification
DROP TABLE tour_themes;
```

---

## TypeScript Types

```typescript
// types/database.ts

export interface GuidelyTheme {
  id: string;
  agency_id: string | null;  // null = system template
  name: string;
  description: string | null;
  is_system: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  shape: ThemeShape;
  avatar: ThemeAvatar;
  buttons: ThemeButtons;
  tour_overrides: TourThemeOverrides;
  smart_tip_overrides: SmartTipThemeOverrides;
  banner_overrides: BannerThemeOverrides;
  checklist_overrides: ChecklistThemeOverrides;
  created_at: string;
  updated_at: string;
}

export interface ThemeColors {
  primary: string;
  primary_hover: string;
  primary_text: string;
  secondary: string;
  secondary_hover: string;
  secondary_text: string;
  background: string;
  text: string;
  text_secondary: string;
  border: string;
}

export interface ThemeTypography {
  font_family: string;
  title_size: string;
  body_size: string;
  line_height: string;
}

export interface ThemeShape {
  border_radius: string;  // e.g., "8px"
  shadow: 'none' | 'subtle' | 'medium' | 'strong';
}

export interface ThemeAvatar {
  enabled: boolean;
  shape: 'circle' | 'rounded' | 'square';
  size: string;  // e.g., "48px"
  default_image_url: string | null;
}

export interface ThemeButtons {
  style: 'filled' | 'outline' | 'ghost';
  border_radius: string;
}

export interface TourThemeOverrides {
  progress_color: string | null;
  progress_inactive: string | null;
  close_icon_color: string | null;
  backdrop_color: string;
  progress_style: 'dots' | 'numbers' | 'bar';
}

export interface SmartTipThemeOverrides {
  tooltip_background: string | null;
  beacon_color: string | null;
  arrow_color: string | null;
}

export interface BannerThemeOverrides {
  banner_background: string | null;
  banner_text: string | null;
  dismiss_icon_color: string | null;
}

export interface ChecklistThemeOverrides {
  header_background: string | null;
  header_text: string | null;
  completion_color: string | null;
  item_text_color: string | null;
  link_color: string | null;
}

export interface GuidelyDefaults {
  tour_theme_id: string | null;
  smart_tip_theme_id: string | null;
  banner_theme_id: string | null;
  checklist_theme_id: string | null;
}
```

---

## API Routes / Server Actions

```typescript
// app/(dashboard)/g/themes/_actions/theme-actions.ts

// CRUD
export async function getThemes(): Promise<GuidelyTheme[]>
export async function getTheme(id: string): Promise<GuidelyTheme>
export async function createTheme(data: CreateThemeInput): Promise<GuidelyTheme>
export async function updateTheme(id: string, data: UpdateThemeInput): Promise<GuidelyTheme>
export async function deleteTheme(id: string): Promise<void>

// Templates
export async function getSystemTemplates(): Promise<GuidelyTheme[]>
export async function createFromTemplate(templateId: string, name: string): Promise<GuidelyTheme>

// Duplicating
export async function duplicateTheme(id: string): Promise<GuidelyTheme>

// Defaults
export async function getGuidelyDefaults(): Promise<GuidelyDefaults>
export async function updateGuidelyDefaults(defaults: Partial<GuidelyDefaults>): Promise<void>

// Avatar upload
export async function uploadThemeAvatar(themeId: string, file: File): Promise<string>
```

---

## File Structure

```
app/(dashboard)/g/themes/
├── page.tsx                        # Themes list (server component)
├── _components/
│   ├── themes-list-client.tsx      # Client list with template cards
│   ├── theme-card.tsx              # Individual theme card
│   └── template-card.tsx           # Starter template card (+ Use button)
└── [id]/
    ├── page.tsx                    # Theme editor (server wrapper)
    └── _components/
        ├── theme-editor.tsx        # Main 2-panel layout
        ├── theme-settings-panel.tsx # Left: all theme controls
        ├── theme-preview-panel.tsx  # Right: live preview with tabs
        ├── color-picker.tsx        # Color input with picker
        ├── avatar-uploader.tsx     # Avatar image upload
        └── component-overrides.tsx # Collapsible per-component colors

app/(dashboard)/g/themes/_actions/
└── theme-actions.ts               # All server actions

lib/
└── theme-defaults.ts              # 5 system template definitions
```

---

## Implementation Plan (Phased)

### Phase 1: Data Layer
| Step | Task | Status |
|------|------|--------|
| 1.1 | Create `guidely_themes` table migration | ✅ Complete |
| 1.2 | Add TypeScript types to `types/database.ts` | ✅ Complete |
| 1.3 | Create `guidely-theme-actions.ts` server actions (CRUD) | ✅ Complete |
| 1.4 | Create `lib/guidely-theme-defaults.ts` with 5 system templates | ✅ Complete |

### Phase 2: List Page
| Step | Task | Status |
|------|------|--------|
| 2.1 | Create `/g/themes/page.tsx` (server component) | ✅ Complete |
| 2.2 | Create `themes-list-client.tsx` | ✅ Complete |
| 2.3 | Create `template-card.tsx` (starter templates) | ✅ Complete (combined in themes-list-client.tsx) |
| 2.4 | Create `theme-card.tsx` (user themes with usage badge) | ✅ Complete (combined in themes-list-client.tsx) |

### Phase 3: Theme Editor
| Step | Task | Status |
|------|------|--------|
| 3.1 | Create `/g/themes/[id]/page.tsx` (server wrapper) | ✅ Complete |
| 3.2 | Create `theme-editor.tsx` (main 2-panel layout) | ✅ Complete (guidely-theme-editor.tsx) |
| 3.3 | Create `theme-settings-panel.tsx` (all controls) | ✅ Complete (combined into guidely-theme-editor.tsx) |
| 3.4 | Create `theme-preview-panel.tsx` (live preview) | ✅ Complete |
| 3.5 | Add color contrast checker utility | ✅ Complete (in lib/guidely-theme-defaults.ts) |
| 3.6 | Add copy-to-clipboard for hex values | ✅ Complete (in color-control.tsx) |

### Phase 4: Component Overrides & Avatar
| Step | Task | Status |
|------|------|--------|
| 4.1 | Create `component-overrides.tsx` (collapsible sections) | ✅ Complete (integrated into guidely-theme-editor.tsx) |
| 4.2 | Create `avatar-uploader.tsx` with size guidance | ✅ Complete |
| 4.3 | Add Vercel Blob upload API route | ✅ Complete (/api/themes/avatar) |

### Phase 5: Feature Integration
| Step | Task | Status |
|------|------|--------|
| 5.1 | Add feature defaults section to themes page | ✅ Complete |
| 5.2 | Add theme dropdown to Tour builder | ✅ Complete (ThemeTab already exists) |
| 5.3 | Add theme dropdown to Smart Tip builder | ✅ Complete (tip-global-settings.tsx) |
| 5.4 | Add theme dropdown to Banner builder | ✅ Complete (banner-settings-panel.tsx) |
| 5.5 | Add theme dropdown to Checklist builder | ✅ Complete (checklist-settings-panel.tsx) |
| 5.6 | Update all `tour_themes` refs to `guidely_themes` | ✅ Complete |

### Phase 6: Embed Script
| Step | Task | Status |
|------|------|--------|
| 6.1 | Update `/api/config` to include theme data | ✅ Complete (returns guidely_themes with all fields) |
| 6.2 | Update `embed.js` to apply theme colors to Tours | ✅ Complete (existing code) |
| 6.3 | Update `embed.js` to apply theme colors to Smart Tips | ✅ Complete (existing code) |
| 6.4 | Update `embed.js` to apply theme colors to Banners | ✅ Complete (existing code) |
| 6.5 | Update `embed.js` to apply theme colors to Checklists | ✅ Complete (existing code) |
| 6.6 | Update `embed.js` to use `guidely_themes` config key | ✅ Complete |

---

## Implementation Progress

---

## Acceptance Criteria

- [ ] 5 system templates available (Friendly, Corporate, Bold, Minimal, Colorful)
- [ ] Can create custom theme from scratch
- [ ] Can create custom theme starting from any template ("+ Use" opens editor immediately)
- [ ] Can edit all theme properties (colors, typography, shape, avatar, buttons)
- [ ] Live preview updates in real-time as properties change
- [ ] Preview selector to switch between Tour/Tip/Banner/Checklist views
- [ ] Can upload custom avatar image with size guidance (112x112px recommended)
- [ ] Can set per-component color overrides
- [ ] Can set default theme for each feature type
- [ ] Theme dropdown in Tour, Smart Tip, Banner, Checklist builders
- [ ] Embed script applies theme styling to all components
- [ ] Cannot delete system templates
- [ ] Can delete custom themes (with confirmation)
- [ ] Can duplicate themes
- [ ] "Used by X items" badge on theme cards (with hover tooltip listing items)
- [ ] Color contrast warnings for accessibility (WCAG AA)
- [ ] Click hex value to copy to clipboard

---

## Out of Scope (V1)

| Out of Scope | Notes |
|--------------|-------|
| Dark mode variants | Future version |
| Custom CSS injection | Advanced feature |
| Custom font upload | Use system or Google Fonts only |
| Theme versioning/history | Future version |
| Theme sharing between agencies | Future version |
| Per-step theme overrides in tours | Too granular for V1 |
| Animated transitions customization | Future version |
| A/B testing of themes | Future version |

---

## Quick Wins (UX Improvements)

| Improvement | Why It Helps | Effort |
|-------------|--------------|--------|
| **Avatar size guidance** ("112x112px for retina") | Prevents blurry avatars - agencies know exactly what to upload | Low |
| **Color contrast checker** | Auto-warn if text/background combo fails WCAG AA accessibility | Low |
| **"Used by X items" badge** | Shows how many tours/tips/banners use this theme; hover shows which specific items | Low |
| **One-click template use** | "+ Use" creates copy and opens editor immediately - no extra steps | Low |
| **Reuse existing color picker** | Use the color picker with transparency, eyedropper, and 20 saved colors from Theme Builder | Low |
| **Border radius live swatch** | Small visual preview next to slider updates as value changes | Low |
| **Copy hex to clipboard** | Click any color hex value to copy - useful for matching in other tools | Low |
| **Placeholder avatar images** | System templates with avatars include friendly placeholder - ready to use immediately | Low |

---

## Testing Checklist

### Theme Editor
- [ ] Create theme from scratch
- [ ] Create theme from each of the 5 templates (Friendly, Corporate, Bold, Minimal, Colorful)
- [ ] "+ Use" on template creates copy and opens editor immediately
- [ ] Edit all color properties
- [ ] Color contrast warning appears for poor text/background combos
- [ ] Click hex value copies to clipboard
- [ ] Edit typography (font family, sizes)
- [ ] Edit shape (border radius slider with live swatch, shadow)
- [ ] Toggle avatar enabled/disabled
- [ ] Change avatar shape and size
- [ ] Upload avatar image (verify size guidance: "112x112px for retina")
- [ ] Change button style and radius
- [ ] Edit component-specific overrides (Tours, Tips, Banners, Checklists)
- [ ] Preview updates live for all changes
- [ ] Switch preview type (Tour/Tip/Banner/Checklist selector)
- [ ] "Used by X items" badge displays correctly
- [ ] Hover on badge shows list of items using this theme
- [ ] Save theme - reload - all settings persist
- [ ] Delete custom theme (confirm dialog)
- [ ] Cannot delete system template (UI disabled)
- [ ] Duplicate theme creates copy with "(Copy)" suffix

### Feature Integration
- [ ] Theme dropdown appears in Tour builder
- [ ] Theme dropdown appears in Smart Tip builder
- [ ] Theme dropdown appears in Banner builder
- [ ] Theme dropdown appears in Checklist builder
- [ ] Default theme pre-selected for new items
- [ ] Can override default with different theme
- [ ] Theme styles apply in embed script

### Defaults
- [ ] Can set default theme for Tours
- [ ] Can set default theme for Smart Tips
- [ ] Can set default theme for Banners
- [ ] Can set default theme for Checklists
- [ ] New items use correct default

---

## Sources / Inspiration

- [Usetiful Themes](https://www.usetiful.com/) - Theme editor with live preview
- [ProductFruits Themes](https://productfruits.com/) - Component-specific styling
- [Appcues Design](https://www.appcues.com/) - Avatar in modals, friendly feel
- [Pendo Styling](https://www.pendo.io/) - Professional/corporate themes
