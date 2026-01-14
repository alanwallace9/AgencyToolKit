# Feature 18: Tours List Page + DAP Foundation

**Status:** Completed
**Date:** 2026-01-13

## Summary

This feature establishes the foundation for the Digital Adoption Platform (DAP), including a comprehensive database schema for tours and related features, security utilities for safe HTML/CSS handling, and a full-featured Tours list page.

## What Was Built

### Database Schema

Created `supabase/migrations/20260113_dap_system.sql` with:

#### Core Tables
| Table | Purpose |
|-------|---------|
| `tours` (enhanced) | Full tour management with status, priority, settings, targeting, theme_id |
| `tour_themes` | Reusable visual themes (colors, fonts, borders) |
| `tour_analytics` | Event tracking (views, completions, dismissals, step interactions) |
| `tour_templates` | System and custom templates for quick-start |
| `user_tour_state` | Per-user progress tracking |

#### Future DAP Tables (Schema Only)
| Table | Purpose | Target Feature |
|-------|---------|----------------|
| `checklists` | Multi-step task lists | Feature 23 |
| `smart_tips` | Context-aware tooltips | Feature 24 |
| `banners` | Announcement overlays | Feature 25 |
| `resource_centers` | Help widget content | Feature 26 |

#### Schema Additions
- Added `ghl_url` to `customers` table (for Builder Mode in Feature 20)
- 4 system templates seeded in `tour_templates`

### Security Utilities

Created `lib/security/` with:

| File | Purpose |
|------|---------|
| `sanitize.ts` | DOMPurify-based HTML sanitization, URL validation, CSS sanitization |
| `selector-validator.ts` | CSS selector validation, blocks dangerous selectors (script, iframe, etc.) |
| `url-validator.ts` | URL pattern matching (exact, contains, starts_with, wildcard, regex) |
| `validation-schemas.ts` | Comprehensive Zod schemas for all DAP input types |
| `index.ts` | Unified exports |

### API Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/tours` | GET, POST | List tours (with filters), create tour |
| `/api/tours/[id]` | GET, PATCH, DELETE | Single tour CRUD |
| `/api/tours/[id]/duplicate` | POST | Clone tour with all steps |
| `/api/tours/[id]/publish` | POST | Set status to "live" |
| `/api/tours/[id]/unpublish` | POST | Set status to "draft" |
| `/api/tours/[id]/archive` | POST | Set status to "archived" |

### UI Components

| Component | Purpose |
|-----------|---------|
| `tour-card.tsx` | Card display with status badge, stats, dropdown menu |
| `tours-client.tsx` | List page with search, filters, sorting |
| `add-tour-dialog.tsx` | Create dialog with template selection |

### Tour Status Lifecycle

```
draft → live → archived
  ↑       ↓
  └───────┘ (unpublish)
```

- **Draft**: Work in progress, not visible to end users
- **Live**: Active and displayed to matching users
- **Archived**: Historical record, not visible

### 4 Starter Templates

1. **Welcome Tour** - 3-step platform introduction
2. **Feature Highlight** - Single-step feature callout
3. **Getting Started Checklist** - Multi-step onboarding tasks
4. **Announcement Banner** - Temporary promotional message

## Files Created

```
supabase/migrations/
└── 20260113_dap_system.sql

lib/security/
├── sanitize.ts
├── selector-validator.ts
├── url-validator.ts
├── validation-schemas.ts
└── index.ts

app/api/tours/
├── route.ts
└── [id]/
    ├── route.ts
    ├── duplicate/route.ts
    ├── publish/route.ts
    ├── unpublish/route.ts
    └── archive/route.ts

app/(dashboard)/tours/
├── page.tsx
├── _actions/tour-actions.ts
└── _components/
    ├── tour-card.tsx
    ├── tours-client.tsx
    └── add-tour-dialog.tsx
```

## Files Modified

- `types/database.ts` - Added comprehensive DAP types

## Key Decisions

1. **Full DAP schema now** - Rather than just tours, we created the schema for all future DAP features to ensure consistency and enable relationships

2. **Security-first approach** - DOMPurify for HTML, custom validators for CSS selectors, Zod schemas for all inputs

3. **Status-based workflow** - draft/live/archived lifecycle with explicit publish/unpublish actions

4. **Template system** - 4 starter templates seeded in database for quick-start

5. **Builder Mode preparation** - Added `ghl_url` to customers for Feature 20's visual element selector

## Dependencies on This Feature

- **Feature 19** - Tour Builder Basic UI (uses tour CRUD APIs)
- **Feature 20** - Step Editor (uses security validators, ghl_url)
- **Feature 21** - Tour Preview (uses theme data)
- **Feature 22** - Embed Script (uses tour_analytics)

## Next Steps (Feature 19)

The Tour Builder Basic UI will include:
- Tour metadata editing (name, description, status)
- Step list with add/remove/reorder
- Basic step properties (title, content, position)
- Save/publish workflow

## Testing Notes

Build passes successfully. Database migration needs to be applied to Supabase manually or via MCP.
