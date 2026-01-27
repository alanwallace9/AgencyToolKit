# Feature 23: Tour Themes Builder

**Status:** Ready for Implementation
**Priority:** 1 (First - no dependencies, required by all other DAP features)
**Estimated Sessions:** 1
**Dependencies:** None
**Blocks:** F26-27 (Checklists), F30-31 (Banners)

---

## Overview

Tour Themes allow agencies to customize the visual appearance of all DAP elements (tours, banners, checklists, smart tips) to match their brand. This is critical for white-label agencies who need their onboarding to look professional and consistent.

The `tour_themes` table already exists from Feature 18, but we need the builder UI.

---

## User Stories

1. **As an agency owner**, I want to create custom themes so my tours match my brand colors and typography.
2. **As an agency owner**, I want to preview how my theme looks before applying it to tours.
3. **As an agency owner**, I want to set a default theme that applies to all new tours automatically.
4. **As an agency owner**, I want to choose from pre-built theme templates to get started quickly.

---

## Acceptance Criteria

- [ ] Theme list page shows all custom themes + built-in templates
- [ ] Can create new theme from scratch or from template
- [ ] Can edit existing themes
- [ ] Can delete custom themes (not built-in)
- [ ] Can set one theme as default
- [ ] Live preview updates as colors/fonts change
- [ ] Theme applies to: tooltip background, text, buttons, progress indicators, backdrop
- [ ] Themes save to database and load in embed script

---

## UI Design

### Themes List Page (`/tours/themes` or `/themes`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Tour Themes                                                                  │
│ Customize the appearance of your tours, banners, and checklists              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Built-in Templates                                                          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                │
│  │ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌─────────────┐ │                │
│  │ │   Default   │ │ │ │    Dark     │ │ │ │   Minimal   │ │                │
│  │ │   ██████    │ │ │ │   ██████    │ │ │ │   ██████    │ │                │
│  │ │   [Next]    │ │ │ │   [Next]    │ │ │ │   [Next]    │ │                │
│  │ └─────────────┘ │ │ └─────────────┘ │ │ └─────────────┘ │                │
│  │ Default         │ │ Dark Mode       │ │ Minimal         │                │
│  │ Clean & simple  │ │ Easy on eyes    │ │ No distractions │                │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘                │
│                                                                              │
│  Your Themes                                                    [+ New Theme]│
│  ┌─────────────────┐ ┌─────────────────┐                                    │
│  │ ┌─────────────┐ │ │ ┌─────────────┐ │                                    │
│  │ │ Brand Blue  │ │ │ │   Sunset    │ │                                    │
│  │ │   ██████    │ │ │ │   ██████    │ │                                    │
│  │ │   [Next]    │ │ │ │   [Next]    │ │                                    │
│  │ └─────────────┘ │ │ └─────────────┘ │                                    │
│  │ Brand Blue  ⭐   │ │ Sunset Orange   │  ⭐ = Default                      │
│  │ [Edit] [Delete] │ │ [Edit] [Delete] │                                    │
│  └─────────────────┘ └─────────────────┘                                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Theme Editor Page (`/tours/themes/[id]` or `/tours/themes/new`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Themes                                    [Save] [Set as Default]  │
│                                                                              │
│ Edit Theme: Brand Blue                                                       │
├─────────────────────────────────┬────────────────────────────────────────────┤
│                                 │                                            │
│  THEME SETTINGS                 │  LIVE PREVIEW                              │
│  ─────────────────────────────  │  ────────────────────────────────────────  │
│                                 │                                            │
│  Theme Name                     │  ┌────────────────────────────────────┐   │
│  ┌───────────────────────────┐  │  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  │ Brand Blue                │  │  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  └───────────────────────────┘  │  │░░░ ┌──────────────────────┐ ░░░░░░│   │
│                                 │  │░░░ │                      │ ░░░░░░│   │
│  ─────────────────────────────  │  │░░░ │  Welcome! 👋         │ ░░░░░░│   │
│                                 │  │░░░ │                      │ ░░░░░░│   │
│  COLORS                         │  │░░░ │  Let's get you       │ ░░░░░░│   │
│                                 │  │░░░ │  started with a      │ ░░░░░░│   │
│  Background       Text          │  │░░░ │  quick tour.         │ ░░░░░░│   │
│  ┌─────┐         ┌─────┐       │  │░░░ │                      │ ░░░░░░│   │
│  │ ### │ #FFFFFF │ ### │ #1F29 │  │░░░ │  ● ○ ○ ○             │ ░░░░░░│   │
│  └─────┘         └─────┘       │  │░░░ │                      │ ░░░░░░│   │
│                                 │  │░░░ │  [Skip]    [Next →] │ ░░░░░░│   │
│  Primary Button   Secondary     │  │░░░ │                      │ ░░░░░░│   │
│  ┌─────┐         ┌─────┐       │  │░░░ └──────────────────────┘ ░░░░░░│   │
│  │ ### │ #3B82F6 │ ### │ Trans │  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  └─────┘         └─────┘       │  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│                                 │  └────────────────────────────────────┘   │
│  Backdrop/Overlay               │                                            │
│  ┌─────┐                       │  Preview as:                               │
│  │ ### │ rgba(0,0,0,0.5)       │  [Modal ▼] [Tooltip] [Banner] [Checklist] │
│  └─────┘                       │                                            │
│                                 │                                            │
│  ─────────────────────────────  │                                            │
│                                 │                                            │
│  TYPOGRAPHY                     │                                            │
│                                 │                                            │
│  Font Family                    │                                            │
│  [System UI (Default)      ▼]  │                                            │
│                                 │                                            │
│  Title Size      Body Size      │                                            │
│  [18px     ▼]   [14px     ▼]   │                                            │
│                                 │                                            │
│  ─────────────────────────────  │                                            │
│                                 │                                            │
│  BORDERS & SHADOWS              │                                            │
│                                 │                                            │
│  Border Radius                  │                                            │
│  [8px─────────●─────────16px]  │                                            │
│                                 │                                            │
│  Shadow                         │                                            │
│  ○ None  ● Subtle  ○ Medium    │                                            │
│                                 │                                            │
│  ─────────────────────────────  │                                            │
│                                 │                                            │
│  PROGRESS INDICATOR             │                                            │
│                                 │                                            │
│  Style                          │                                            │
│  ● Dots  ○ Numbers  ○ Bar      │                                            │
│                                 │                                            │
│  Active Color    Inactive       │                                            │
│  ┌─────┐         ┌─────┐       │                                            │
│  │ ### │ #3B82F6 │ ### │ #E5E7 │                                            │
│  └─────┘         └─────┘       │                                            │
│                                 │                                            │
└─────────────────────────────────┴────────────────────────────────────────────┘
```

---

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `themes-list.tsx` | `tours/_components/` | Grid of theme cards |
| `theme-card.tsx` | `tours/_components/` | Individual theme preview card |
| `theme-editor.tsx` | `tours/themes/[id]/_components/` | Main editor with controls |
| `theme-preview.tsx` | `tours/themes/[id]/_components/` | Live preview panel |
| `color-control.tsx` | `tours/themes/[id]/_components/` | Color picker with label |
| `typography-control.tsx` | `tours/themes/[id]/_components/` | Font family/size selectors |

---

## Database

### Existing Table: `tour_themes`

```sql
-- Already created in F18, verify structure:
CREATE TABLE tour_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,  -- Built-in templates

  colors JSONB DEFAULT '{
    "background": "#FFFFFF",
    "text": "#1F2937",
    "textSecondary": "#6B7280",
    "primary": "#3B82F6",
    "primaryText": "#FFFFFF",
    "secondary": "transparent",
    "secondaryText": "#3B82F6",
    "border": "#E5E7EB",
    "backdrop": "rgba(0,0,0,0.5)"
  }',

  typography JSONB DEFAULT '{
    "fontFamily": "system-ui, -apple-system, sans-serif",
    "titleSize": "18px",
    "bodySize": "14px",
    "lineHeight": "1.5"
  }',

  borders JSONB DEFAULT '{
    "radius": "8px",
    "width": "1px"
  }',

  shadows JSONB DEFAULT '{
    "tooltip": "0 4px 6px -1px rgba(0,0,0,0.1)",
    "modal": "0 20px 25px -5px rgba(0,0,0,0.1)"
  }',

  progress JSONB DEFAULT '{
    "style": "dots",
    "activeColor": "#3B82F6",
    "inactiveColor": "#E5E7EB"
  }',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one default per agency
CREATE UNIQUE INDEX idx_tour_themes_default
ON tour_themes (agency_id)
WHERE is_default = true;
```

### Built-in Templates (Seed Data)

```sql
INSERT INTO tour_themes (agency_id, name, is_system, colors, ...) VALUES
-- Default (clean blue)
(NULL, 'Default', true, '{"background":"#FFFFFF","primary":"#3B82F6",...}'),
-- Dark Mode
(NULL, 'Dark Mode', true, '{"background":"#1F2937","text":"#F9FAFB","primary":"#60A5FA",...}'),
-- Minimal
(NULL, 'Minimal', true, '{"background":"#FFFFFF","primary":"#111827","border":"transparent",...}');
```

---

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/tour-themes` | List all themes (system + custom) |
| POST | `/api/tour-themes` | Create new theme |
| GET | `/api/tour-themes/[id]` | Get single theme |
| PATCH | `/api/tour-themes/[id]` | Update theme |
| DELETE | `/api/tour-themes/[id]` | Delete theme (custom only) |
| POST | `/api/tour-themes/[id]/set-default` | Set as default theme |

---

## Server Actions

```typescript
// tours/_actions/theme-actions.ts
export async function getThemes(): Promise<TourTheme[]>
export async function getTheme(id: string): Promise<TourTheme>
export async function createTheme(data: CreateThemeInput): Promise<TourTheme>
export async function updateTheme(id: string, data: UpdateThemeInput): Promise<TourTheme>
export async function deleteTheme(id: string): Promise<void>
export async function setDefaultTheme(id: string): Promise<void>
export async function duplicateTheme(id: string): Promise<TourTheme>
```

---

## Embed Script Changes

The embed script already loads themes with tours. Verify:

1. Theme CSS variables are injected when tour starts
2. All Driver.js elements use CSS variables for colors
3. Theme applies to: popover, buttons, progress dots, backdrop

```javascript
// In embed.js, when initializing Driver.js:
function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty('--at-bg', theme.colors.background);
  root.style.setProperty('--at-text', theme.colors.text);
  root.style.setProperty('--at-primary', theme.colors.primary);
  // ... etc
}
```

---

## Out of Scope

- Custom CSS injection (advanced feature for V2)
- Per-step theme overrides
- Animated transitions customization
- Custom fonts upload (use Google Fonts or system fonts only)

---

## Testing Checklist

- [ ] Create theme from scratch
- [ ] Create theme from template
- [ ] Edit existing theme - changes reflect in preview
- [ ] Delete custom theme
- [ ] Cannot delete system theme
- [ ] Set default theme - only one default at a time
- [ ] Theme applies to tour in embed script
- [ ] Theme applies to banner in embed script
- [ ] Theme applies to checklist widget in embed script
