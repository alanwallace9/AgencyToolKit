# Social Proof Widget V2 - Session Handoff

**Date:** 2026-01-18
**Status:** Design Finalized, Ready for Implementation

---

## Summary of Decisions Made This Session

This session covered significant UX redesign decisions for the Social Proof Widget feature. The changes focus on:
1. Theme customization UX improvements
2. New Placements system (replacing Embed Code tab)
3. Shape and shadow presets
4. Limit restructuring

---

## 1. Theme Customization UX

### Built-in Themes Stay Read-Only
- Minimal, Glass, Dark, Rounded are starting points
- Users cannot modify them directly
- Clicking a theme populates color pickers with its defaults

### Saved Themes in Same Grid
User's custom themes appear IN the theme grid, not a separate section:
```
Row 1: [Minimal] [Glass] [Dark]
Row 2: [Rounded] [My Brand] [Blue Glow]  ← user's saved themes
Row 3: [Another Custom] [+ Create Custom]  ← create always last
```

### Create Custom Flow
1. Click "Create Custom" card
2. Dialog asks for theme name
3. Creates preset with default colors
4. User can then customize colors

### Theme Actions (on hover)
- Pencil icon → Rename theme
- Trash icon → Delete theme

### "Save as Preset" Button
- Always visible below color pickers
- Creates NEW preset (prompts for name)
- Never modifies original built-in themes

---

## 2. Shape & Shadow Presets (NEW)

### Shape Presets
Add to Settings → Appearance section:

| Preset | Border Radius | Description |
|--------|---------------|-------------|
| Square | 0px | No rounded corners |
| Rounded | 8px | Moderate rounding (current default) |
| Pill | 16px | Soft, pill-like edges |

UI: Three buttons/cards to select, similar to position selector.

### Shadow Dropdown
| Option | Description |
|--------|-------------|
| None | Flat, no shadow |
| Subtle | Light shadow, barely there |
| Medium | Standard shadow (default) |
| Strong | Dramatic, pops off page |

---

## 3. Custom CSS Field (IMPLEMENTED)

- Textarea in Appearance section
- Placeholder shows example glass blur CSS
- Uses `.sp-notification` selector (converted to `#sp-notification` for specificity)
- Injected at end of theme styles so it can override anything

---

## 4. Placements System (NEW - Replaces Embed Code Tab)

### Concept
One widget can have MULTIPLE placements. Each placement is an embed code for a different form/page with its own event type.

**Example:**
- Widget: "Marketing Site Social Proof"
- Placements:
  - Newsletter signup form → event type "Subscribe"
  - Free trial form → event type "Free Trial"
  - Contact form → event type "Signup"

All events flow into one widget, notifications rotate through all:
```
"Sally just subscribed"
"Bill just started a free trial"
"Steve just signed up"
```

### Placements Tab UI (Bitly-style)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Placements (3 of 5)                              [+ Add Placement]  │
├─────────────────────────────────────────────────────────────────────┤
│ Name               │ Event Type     │ Page URL          │ Actions   │
├────────────────────┼────────────────┼───────────────────┼───────────┤
│ Newsletter Signup  │ Subscribe ▼    │ /newsletter       │ 📋 ✏️ 🗑️   │
│ Free Trial Form    │ Free Trial ▼   │ /pricing          │ 📋 ✏️ 🗑️   │
│ Contact Page       │ Signup ▼       │ /contact          │ 📋 ✏️ 🗑️   │
└─────────────────────────────────────────────────────────────────────┘
```

**Actions:**
- 📋 Copy → Copies full embed code to clipboard
- ✏️ Edit → Change name, event type, URL
- 🗑️ Delete → Remove placement

### Add Placement Dialog
```
Name: [________________________]
Event Type: [Subscribe ▼]  or  [Custom: ____________]
Page URL: [________________________] (optional - for your reference)

[Cancel] [Create Placement]
```

### Event Type Options
- Signed up
- Subscribed
- Started a free trial
- Made a purchase
- Left a review
- Downloaded
- Custom: [text field]

### Generated Embed Code Format
```html
<script src="https://toolkit.getrapidreviews.com/sp.js?key=sp_xxx&event=subscribe"></script>
```

The `&event=` parameter determines what type the captured events are tagged with.

### Keep These Sections
Move to collapsible accordion at bottom of Placements tab:
- "Where to paste this code" (WordPress, Squarespace, Wix, etc. instructions)
- "What does this script do?"
- "Troubleshooting"

### Remove
- "Widget Details" card (redundant - info is in header/settings)
- Old single embed code display

---

## 5. Limits (FINAL)

| Plan | Widgets | Placements |
|------|---------|------------|
| Toolkit | 5 | 5 total |
| Pro | Unlimited | Unlimited |

**Placements are the real value** - each placement is a tracked event source. This is what users are paying for.

Display in UI:
- Toolkit: "3 of 5 placements"
- Pro: "3 of unlimited placements"

---

## 6. Database Changes Required

### New Table: `social_proof_placements`
```sql
CREATE TABLE social_proof_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID NOT NULL REFERENCES social_proof_widgets(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'signup',
  custom_event_text TEXT,  -- for custom event types
  page_url TEXT,  -- optional, for user reference
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Update `social_proof_widgets` table
Add columns:
- `shape` TEXT DEFAULT 'rounded' -- 'square', 'rounded', 'pill'
- `shadow` TEXT DEFAULT 'medium' -- 'none', 'subtle', 'medium', 'strong'

### Update `social_proof_events` table
- `placement_id` UUID REFERENCES social_proof_placements(id) -- which placement captured this

---

## 7. API Changes Required

### New Endpoints
- `GET/POST /api/social-proof/placements` - List/create placements
- `PATCH/DELETE /api/social-proof/placements/[id]` - Update/delete placement

### Update Embed Script (sp.js)
- Parse `&event=` query parameter
- Use event type from URL when capturing form submissions
- Parse `&event_text=` for custom event text

### Update Capture Endpoint
- Accept `event_type` and `placement_id` in payload

---

## 8. Files to Modify

### Settings Tab (`settings-tab.tsx`)
- Add Shape preset selector (Square/Rounded/Pill)
- Add Shadow dropdown (None/Subtle/Medium/Strong)
- Move saved themes into main theme grid
- Keep "Create Custom" card at end of grid

### Embed Code Tab → Placements Tab (`embed-code-tab.tsx`)
- Complete rewrite to Placements manager
- Add/Edit/Delete placement functionality
- Copy embed code with event type parameter
- Keep instruction accordions at bottom

### Embed Script (`sp.js/route.ts`)
- Parse event type from URL
- Apply shape/shadow styles

### Database Types (`types/database.ts`)
- Add SocialProofPlacement type
- Add shape/shadow fields to SocialProofWidget

### Server Actions (`social-proof-actions.ts`)
- Add placement CRUD actions
- Add placement limit checking

---

## 9. Implementation Order

1. **Database migration** - Add placements table, shape/shadow columns
2. **Types** - Update TypeScript types
3. **Server actions** - Placement CRUD with limit enforcement
4. **Settings Tab** - Shape/shadow UI
5. **Placements Tab** - New Bitly-style interface
6. **Embed script** - Event type parsing, shape/shadow styles
7. **Theme grid** - Merge saved themes into grid

---

## 10. What Was Already Implemented This Session

Before the design discussions, these were completed:

- ✅ Theme default colors constant
- ✅ Color pickers always visible for all themes
- ✅ Auto-switch to custom mode when colors modified
- ✅ Save as Preset button always visible
- ✅ Custom CSS field (widget type, settings UI, embed script)
- ✅ Create Custom Theme card and dialog
- ✅ Pro plan shows "of unlimited"
- ✅ Theme rename functionality
- ✅ Build passes

---

## 11. UI Style Notes

- Make Placements table "smooth and rounded"
- Use consistent styling with rest of app
- Clear visual hierarchy
- Hover states for action buttons
- Toast notifications for copy/save/delete

---

## Next Session Prompt

```
Continue work on Social Proof Widget V2.

Read the handoff document first:
docs/sessions/session-social-proof-v2-handoff.md

Implementation order:
1. Database migration - Add placements table, shape/shadow columns
2. Update TypeScript types
3. Server actions for placement CRUD with limit enforcement
4. Settings Tab - Add Shape preset selector and Shadow dropdown
5. Placements Tab - Replace Embed Code with Bitly-style placements manager
6. Update embed script to parse event type and apply shape/shadow
7. Merge saved themes into main theme grid

The design is finalized. Focus on clean implementation matching the specs in the handoff doc.
```
