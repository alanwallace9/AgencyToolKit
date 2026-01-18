# Menu Tab Requirements

## Architecture Summary

The Menu tab uses a **hybrid approach**:

1. **Autosave Working State** - Current menu configuration autosaves to `agency.settings.menu`
   - No manual "Save" button needed
   - Uses 500ms debounce like Loading tab
   - Persists: hidden items, renamed items, item order, dividers, preview theme, last template

2. **Save Custom Templates** - Users can save their configuration as named templates
   - Stored in `menu_presets` table (existing infrastructure)
   - UI shows "Your Templates" section below built-in templates
   - User can create, delete, and load their custom templates

## Key Behaviors

### Preview Theme Default
- Should default to user's **brand colors** if they have them set
- Only fall back to "GHL Dark" if no brand colors exist
- Loading a built-in template should NOT reset the preview theme

### Template Loading
- Built-in templates apply: hidden_items, renamed_items, item_order, dividers
- Built-in templates do NOT affect preview_theme
- Custom templates can include preview_theme if user saved it that way

### Naming
- Use "Templates" (not "Presets") in UI
- "Built-in Templates" for the starter templates
- "Your Templates" for user-saved configurations
- "Save as Template" button for saving current config

## Files Involved

- `/app/(dashboard)/menu/_components/menu-client.tsx` - Main component
- `/app/(dashboard)/menu/_actions/menu-actions.ts` - Server actions (autosave + preset CRUD)
- `/app/(dashboard)/menu/page.tsx` - Page that loads initial config
- `/app/(dashboard)/theme-builder/_components/tabs/menu-tab-content.tsx` - Theme Builder integration
- `/types/database.ts` - MenuConfig type

## Status

- [x] Autosave working state
- [x] Preview theme doesn't reset on template load
- [x] Restore "Save as Template" functionality
- [x] Default to brand colors instead of GHL Dark

## Implementation Notes (2026-01-17)

### Changes Made

1. **menu-client.tsx** - Restored template saving functionality:
   - Added `userTemplates` state for fetched presets
   - Added `addDialogOpen` and `templateToDelete` dialog states
   - Added `useEffect` to fetch user templates on mount
   - Added `handleSaveAsTemplate` to save current config
   - Added `loadUserTemplate` to load a user's saved template
   - Added "Save as Template" button in left panel
   - Added "Your Templates" section showing user's saved templates with delete buttons
   - Fixed preview theme default: now uses `'brand'` if user has brand colors set

2. **add-preset-dialog.tsx** - Updated terminology:
   - Changed "Save as New Preset" → "Save as Template"
   - Changed "Preset Name" → "Template Name"
   - Changed button text to "Save Template"

3. **delete-preset-dialog.tsx** - Updated terminology:
   - Changed "Delete Preset" → "Delete Template"

### How It Works

- **Autosave**: Every change triggers a debounced save (500ms) to `agency.settings.menu`
- **User Templates**: Stored in `menu_presets` table, can be created, loaded, and deleted
- **Built-in Templates**: Read-only, only affect menu items (not preview theme)
- **Preview Theme**: Defaults to `'brand'` if user has colors set, otherwise null (which shows GHL Dark)
