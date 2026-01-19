# Session 5 Handoff Document

**Created:** 2026-01-18
**Status:** Partial progress - continue in Session 6

---

## What Was Done in Session 5

### 1. Database Investigation
- Queried Supabase directly via MCP to see actual agency settings
- Found **two separate agencies** in the database:
  - **Production** (`al_f63631494c1ade12`) - "Alan Wallace" - used on toolkit.getrapidreviews.com
  - **Dev** (`al_dev_7123fd88cf74`) - "Alan Wallace (Dev)" - used on localhost

### 2. Root Cause of Previous Issues Identified
- User was testing on **localhost** (Dev Clerk) which writes to Dev agency record
- But GHL embed had the **Dev token**, so GHL was showing Dev agency settings
- This caused confusion because changes made in Production AgencyToolkit didn't affect GHL (which was reading from Dev)

### 3. Token Swap
- User updated GHL embed code to use **Production token** (`al_f63631494c1ade12`)
- This is the correct configuration going forward

### 4. Dev Agency Cleanup
- Cleared `settings.colors` from Dev agency (was showing old deleted brown brand color)
- SQL executed: `UPDATE agencies SET settings = jsonb_set(settings, '{colors}', 'null') WHERE token = 'al_dev_7123fd88cf74'`

### 5. Verified API Config Logs
- Confirmed `/api/config` IS receiving requests for Production token
- Supabase logs show: `token=eq.al_f63631494c1ade12` being queried

---

## CRITICAL OUTSTANDING ISSUES

### Issue 1: Brand Colors NOT Saving to Database
**Priority: HIGH**

**Symptom:**
- User selects "Fresh Mint" theme on Brand Colors tab
- Clicks Save
- Toast shows "Saved less than a minute ago"
- Active toggle is ON, shows "Theme Live"
- BUT: Database shows `settings.colors = null`

**Evidence:**
```sql
SELECT settings->'colors' FROM agencies WHERE token = 'al_f63631494c1ade12';
-- Returns: null
```

**Root Cause:** Unknown - the save action is either:
1. Not being called when clicking Save
2. Being called but failing silently
3. Saving to wrong location
4. Being overwritten immediately

**Files to Investigate:**
- `app/(dashboard)/theme-builder/_components/tabs/brand-colors-tab-content.tsx`
- `app/(dashboard)/colors/_actions/color-actions.ts`
- Look for how "Save" button triggers the save
- Check if there's a separate save for Brand Colors vs other Theme Builder tabs

### Issue 2: Menu Items Not Matching GHL IDs
**Priority: HIGH**

**Symptom:**
- Reputation Management template says "6 items visible"
- Expected visible: Connect Google, Dashboard, Inbox, Contacts, Social Planner, Reviews
- Actual GHL shows: Dashboard, Contacts, AI Agents, (icon), Automation, Media Storage, Audit Dashboard, Signal House

**Evidence:**
Production agency hidden_items:
```json
["sb_calendars", "sb_opportunities", "sb_payments", "sb_ai-employee-promo",
 "sb_automation", "sb_sites", "sb_memberships", "sb_media-storage",
 "sb_reporting", "sb_app-marketplace"]
```

But GHL is showing items that should be hidden:
- Media Storage (`sb_media-storage`) - in hidden list but still visible
- Automation (`sb_automation`) - in hidden list but still visible
- AI Agents - might be different ID than `sb_ai-employee-promo`

**Root Cause Possibilities:**
1. CSS selectors not matching actual GHL DOM structure
2. GHL changed their menu item IDs
3. Some items are custom/different in user's GHL account

**Reference File:**
- `docs/GHL_SELECTORS.md` - Contains scraped GHL selectors from earlier session
- The user ran a discovery script that captured actual GHL menu structure

### Issue 3: Renamed Items Not Showing
**Priority: MEDIUM**

**Symptom:**
- Renamed items in database: `sb_launchpad → "Connect Google"`, `sb_conversations → "Inbox"`, etc.
- But GHL sidebar shows original names (or items are just missing entirely)

**Root Cause:** Same as Issue 2 - CSS selectors may not match

---

## Database State (as of end of session)

### Production Agency (`al_f63631494c1ade12`)
```json
{
  "settings": {
    "menu": {
      "hidden_items": ["sb_calendars", "sb_opportunities", "sb_payments", "sb_ai-employee-promo", "sb_automation", "sb_sites", "sb_memberships", "sb_media-storage", "sb_reporting", "sb_app-marketplace"],
      "renamed_items": {"sb_launchpad": "Connect Google", "sb_reputation": "Reviews", "sb_conversations": "Inbox", "sb_email-marketing": "Social Planner"},
      "last_template": "reputation_management",
      "preview_theme": "ghl-light"
    },
    "colors": null,  // <-- THIS SHOULD HAVE FRESH MINT DATA
    "loading": {...},
    "menu_active": true,
    "colors_active": true,
    "loading_active": true
  }
}
```

### Dev Agency (`al_dev_7123fd88cf74`)
```json
{
  "settings": {
    "colors": null,  // Cleared this session
    "menu": {...}
  }
}
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/(dashboard)/theme-builder/_components/tabs/brand-colors-tab-content.tsx` | Brand Colors UI - where user selects themes |
| `app/(dashboard)/colors/_actions/color-actions.ts` | Server actions for saving colors |
| `app/api/config/route.ts` | Returns config to embed script (has debug logging) |
| `app/embed.js/route.ts` | The embed script that applies CSS to GHL |
| `docs/GHL_SELECTORS.md` | Scraped GHL DOM selectors from discovery |
| `lib/color-themes.ts` | Built-in theme definitions (Fresh Mint, etc.) |

---

## Debug Logging Already in Place

In `/api/config/route.ts`:
```javascript
console.log('[API Config] Menu source debug:', {
  hasDefaultPreset, presetName, hasSettingsMenu,
  settingsMenuHidden, settingsMenuRenamed
});

console.log('[API Config] Returning config:', {
  token, hasMenu, menuHiddenCount, menuRenamedCount,
  hasColors, colorsSidebarBg, hasLoading, toursCount
});
```

Check Vercel logs for these `[API Config]` entries to see what's being returned.

---

## Session 6 Priority Tasks

1. **Fix Brand Colors Save** - Debug why colors aren't persisting to database
2. **Verify GHL Selectors** - Cross-reference `docs/GHL_SELECTORS.md` with embed script CSS
3. **Test Menu Hide/Rename** - Once selectors are verified, test that CSS actually hides items

---

## Testing Checklist for Session 6

After any fix, test this flow:
1. Go to toolkit.getrapidreviews.com (Production)
2. Theme Builder → Brand Colors tab
3. Select "Fresh Mint"
4. Click Save
5. Query Supabase: `SELECT settings->'colors' FROM agencies WHERE token = 'al_f63631494c1ade12'`
6. Should return Fresh Mint color values, NOT null
7. Hard refresh GHL sub-account
8. Sidebar should be mint green (`#ecfdf5`)

---

## Next Session Prompt

```
Continue Agency Toolkit Session 6 - Fix Brand Colors Save

Read these files first:
1. docs/SESSION_5_HANDOFF.md
2. CLAUDE.md (follow the rules!)

CRITICAL ISSUE #1: Brand Colors NOT Saving
- User selects "Fresh Mint" on Brand Colors tab
- Clicks Save, sees "Saved" toast
- But database shows settings.colors = null
- The save is failing silently

CRITICAL ISSUE #2: Menu CSS Not Working
- Menu items that should be hidden are still visible in GHL
- Reference docs/GHL_SELECTORS.md for actual GHL DOM structure
- Cross-check with embed.js CSS selectors

Start by:
1. Reading brand-colors-tab-content.tsx to understand how Save works
2. Reading color-actions.ts to see the save logic
3. DO NOT make changes without asking first
4. Propose a debug plan and wait for approval
```

---

## Environment Notes

- **Production URL:** toolkit.getrapidreviews.com
- **Production Token:** `al_f63631494c1ade12`
- **GHL Sub-account:** app.getrapidreviews.com
- **Supabase Project:** `hldtxlzxneifdzvoobte`
- **Vercel Project:** `agencytoolkit` (team: `alanwallace9-5200s-projects`)

---

## Process Notes

- Always test on Production (toolkit.getrapidreviews.com) for GHL integration
- Localhost uses Dev Clerk which writes to Dev agency - don't use for GHL testing
- When users start signing up, create a staging branch workflow
