# Social Proof Widget - Refactor Task List

**Date:** 2026-01-19
**Status:** Ready for Implementation
**Brand:** TrustSignal

---

## Overview

This document outlines the refactor tasks for the Social Proof Widget, incorporating:
1. Branding decisions (TrustSignal)
2. FTC compliance (remove ALL manual data entry - CSV AND manual)
3. V2 features from session-social-proof-v2-handoff.md
4. UX improvements identified in research

---

## Core Principle: Real Data Only

**No manual data entry of any kind.** This is the key differentiator.

| Data Source | Status | Verifiable? |
|-------------|--------|-------------|
| Auto-capture (form submissions) | ✅ Current | Yes - script captures real submissions |
| Google Reviews | 🎯 Phase 1 | Yes - pulled from Google API |
| Stripe purchases | 📋 Future | Yes - verified transactions |
| GHL webhook triggers | 📋 Future | Yes - CRM-verified actions |
| System milestones | 📋 Future | Yes - auto-generated from real counts |
| ~~CSV import~~ | ❌ Remove | No - unverifiable |
| ~~Manual entry~~ | ❌ Remove | No - unverifiable |

**Brand promise:** "TrustSignal shows only verified activity. No imports. No manual entry. Just real data from real sources."

---

## Phase 1: Branding & Compliance (Do First)

### 1.1 Remove ALL Manual Data Entry

**Why:** FTC compliance - prevents fake data, establishes "real data only" positioning. Manual entry is same loophole as CSV, just slower.

#### Remove CSV Import

| Task | File | Notes |
|------|------|-------|
| Delete CSV import dialog | `[id]/_components/csv-import-dialog.tsx` | Delete entire file |
| Remove CSV import button | `[id]/_components/events-tab.tsx` | Remove Import CSV button, dialog import, showImportDialog state |
| Remove importEvents action | `_actions/social-proof-actions.ts` | Delete lines 430-519 |

#### Remove Manual Event Entry

| Task | File | Notes |
|------|------|-------|
| Delete Add Event dialog | `[id]/_components/add-event-dialog.tsx` | Delete entire file |
| Remove Add Event button | `[id]/_components/events-tab.tsx` | Remove Add Event button, dialog import, showAddDialog state |
| Remove createEvent action | `_actions/social-proof-actions.ts` | Delete manual event creation (keep auto-capture endpoint) |

#### Clean Up Events Tab

| Task | File | Notes |
|------|------|-------|
| Remove 'csv' from source filter | `[id]/_components/events-tab.tsx` | Only show 'auto' (and future: 'google', 'webhook', 'stripe') |
| Remove 'manual' from source filter | `[id]/_components/events-tab.tsx` | Remove manual source |
| Update SOURCE_LABELS/COLORS | `[id]/_components/events-tab.tsx` | Remove csv, manual entries |
| Update empty state | `[id]/_components/events-tab.tsx` | New copy: "Events appear here automatically when captured from your website." No add buttons. |

### 1.2 Add Google Reviews Integration (New User Onboarding)

**Why:** Gives new users a way to populate real, verifiable data immediately.

| Task | Notes |
|------|-------|
| Research Google Places API | Reviews endpoint, rate limits, pricing |
| Create `connect-google-dialog.tsx` | Search business, connect, import reviews |
| Add Google Reviews source type | `source: 'google'` |
| Create review-style notification format | Star rating, review text snippet, reviewer name |
| Add "Connect Google Reviews" button | In Events tab or Settings |
| Store Google Place ID | On widget for refresh/sync |

**Notification format for reviews:**
```
⭐⭐⭐⭐⭐
"Amazing service, highly recommend!"
— John D. via Google
```

**Note:** This is the "quick start" path for new users. Real reviews from real customers.

### 1.3 Add TrustSignal Attribution

**Files to modify:**

| Task | File | Notes |
|------|------|-------|
| Add attribution to notification | `app/sp.js/route.ts` | Add "✓ TrustSignal" footer to notification HTML |
| Add attribution styles | `app/sp.js/route.ts` | Style the attribution (small, subtle, links to trustsignal.com) |

**Attribution HTML:**
```html
<div class="sp-attribution">
  <span>✓</span> TrustSignal
</div>
```

**Attribution CSS:**
```css
#sp-notification .sp-attribution {
  font-size: 9px;
  opacity: 0.6;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 2px;
}
#sp-notification .sp-attribution span {
  color: #22c55e; /* green checkmark */
}
```

### 1.4 Update Default Timing

**Why:** Research shows 10+ second delay reduces bounce rates

| Task | File | Notes |
|------|------|-------|
| Change default initial_delay | `_actions/social-proof-actions.ts` | In createWidget(), set initial_delay to 10 (was 3) |
| Update sp.js fallback | `app/sp.js/route.ts` | Change `(config.initial_delay || 3)` to `(config.initial_delay || 10)` |
| Update settings slider description | `[id]/_components/settings-tab.tsx` | Recommend 10s as default in description |

### 1.5 Make Dismiss Button More Prominent

| Task | File | Notes |
|------|------|-------|
| Improve close button visibility | `app/sp.js/route.ts` | Increase size, better contrast, always visible (not just hover) |

---

## Phase 2: V2 Features (Placements System)

Reference: `docs/sessions/session-social-proof-v2-handoff.md`

### 2.1 Database Changes

| Task | Notes |
|------|-------|
| Create `social_proof_placements` table | See V2 handoff for schema |
| Add `shape` column to widgets | `TEXT DEFAULT 'rounded'` - 'square', 'rounded', 'pill' |
| Add `shadow` column to widgets | `TEXT DEFAULT 'medium'` - 'none', 'subtle', 'medium', 'strong' |
| Add `placement_id` to events | Link events to specific placements |
| Update RLS policies | For new table |
| Run migration | Apply all changes |

### 2.2 TypeScript Types

| Task | File |
|------|------|
| Add SocialProofPlacement type | `types/database.ts` |
| Add shape/shadow fields to SocialProofWidget | `types/database.ts` |
| Update WIDGET_LIMITS type if needed | `types/database.ts` |

### 2.3 Server Actions

| Task | File |
|------|------|
| Add `getPlacementLimitInfo()` | `_actions/social-proof-actions.ts` |
| Add `createPlacement()` | `_actions/social-proof-actions.ts` |
| Add `updatePlacement()` | `_actions/social-proof-actions.ts` |
| Add `deletePlacement()` | `_actions/social-proof-actions.ts` |
| Add `getPlacements()` | `_actions/social-proof-actions.ts` |

### 2.4 Settings Tab Updates

| Task | File | Notes |
|------|------|-------|
| Add Shape selector | `settings-tab.tsx` | Square, Rounded, Pill buttons |
| Add Shadow dropdown | `settings-tab.tsx` | None, Subtle, Medium, Strong |
| Merge saved themes into grid | `settings-tab.tsx` | Show in same grid as built-ins, "Create Custom" always last |

### 2.5 Placements Tab (Replace Embed Code Tab)

| Task | Notes |
|------|-------|
| Create `placements-tab.tsx` | New component |
| Bitly-style table UI | Name, Event Type, Page URL, Actions (Copy, Edit, Delete) |
| Add Placement dialog | Name, Event Type (dropdown + custom), Page URL |
| Copy embed code functionality | Include `&event=` parameter |
| Keep instruction accordions | Move to bottom as collapsible |
| Delete old embed-code-tab.tsx | After migration |

### 2.6 Update Embed Script

| Task | File | Notes |
|------|------|-------|
| Parse `&event=` parameter | `app/sp.js/route.ts` | Read event type from URL |
| Apply shape styles | `app/sp.js/route.ts` | border-radius based on shape |
| Apply shadow styles | `app/sp.js/route.ts` | box-shadow based on shadow setting |
| Include placement_id in capture | `app/sp.js/route.ts` | Track which placement captured event |

---

## Phase 3: Polish & UX

### 3.1 Notification Preview Updates

| Task | File | Notes |
|------|------|-------|
| Add shape preview | `notification-preview.tsx` | Reflect shape setting |
| Add shadow preview | `notification-preview.tsx` | Reflect shadow setting |
| Add attribution preview | `notification-preview.tsx` | Show "✓ TrustSignal" |

### 3.2 Widget List Updates

| Task | File | Notes |
|------|------|-------|
| Show placement count | `_components/widget-card.tsx` | "3 placements" instead of/alongside events |
| Update limit display | `_components/social-proof-client.tsx` | "3 of 5 placements" |

### 3.3 Messaging Updates

| Task | File | Notes |
|------|------|-------|
| Update empty state copy | Various | Emphasize "real captured events" |
| Add "Real data only" badge | UI | Consider adding to header/footer |
| Update docs/help text | Various | Reference FTC compliance benefits |

---

## Implementation Order

```
Phase 1: Branding & Compliance (Session 1-2)
├── 1.1 Remove ALL manual data entry (CSV + manual)
├── 1.2 Add Google Reviews integration
├── 1.3 Add TrustSignal attribution
├── 1.4 Update default timing
└── 1.5 Improve dismiss button

Phase 2: V2 Features (Sessions 2-3)
├── 2.1 Database migration
├── 2.2 TypeScript types
├── 2.3 Server actions
├── 2.4 Settings tab (shape/shadow)
├── 2.5 Placements tab
└── 2.6 Embed script updates

Phase 3: Polish (Session 4)
├── 3.1 Preview updates
├── 3.2 List view updates
└── 3.3 Messaging updates
```

---

## Files Summary

### Files to DELETE
- `app/(dashboard)/social-proof/[id]/_components/csv-import-dialog.tsx`
- `app/(dashboard)/social-proof/[id]/_components/add-event-dialog.tsx`
- `app/(dashboard)/social-proof/[id]/_components/embed-code-tab.tsx` (after placements tab done)

### Files to CREATE
- `app/(dashboard)/social-proof/[id]/_components/placements-tab.tsx`
- `app/(dashboard)/social-proof/[id]/_components/connect-google-dialog.tsx`

### Files to MODIFY
- `app/(dashboard)/social-proof/[id]/_components/events-tab.tsx` - Remove CSV, manual entry, add Google connect button
- `app/(dashboard)/social-proof/[id]/_components/settings-tab.tsx` - Add shape/shadow
- `app/(dashboard)/social-proof/[id]/_components/notification-preview.tsx` - Add attribution preview
- `app/(dashboard)/social-proof/[id]/_components/widget-editor.tsx` - Update tabs
- `app/(dashboard)/social-proof/_actions/social-proof-actions.ts` - Remove importEvents, createEvent; add placement actions, Google Reviews actions
- `app/sp.js/route.ts` - Attribution, shape/shadow, event param
- `types/database.ts` - Add types

### Database Migration Required
- New table: `social_proof_placements`
- New columns on `social_proof_widgets`: `shape`, `shadow`
- New column on `social_proof_events`: `placement_id`

---

## Acceptance Criteria

### Phase 1
- [ ] CSV import completely removed from UI and backend
- [ ] Manual event entry completely removed from UI and backend
- [ ] Events tab is read-only (view, hide, delete only - no create)
- [ ] Google Reviews integration working (search, connect, import)
- [ ] All notifications show "✓ TrustSignal" attribution
- [ ] Default initial delay is 10 seconds
- [ ] Close button is clearly visible on all themes
- [ ] Build passes

### Phase 2
- [ ] Placements table shows all placements for widget
- [ ] Can create/edit/delete placements
- [ ] Each placement has unique embed code with event type
- [ ] Shape selector works (square/rounded/pill)
- [ ] Shadow dropdown works (none/subtle/medium/strong)
- [ ] Embed script respects shape and shadow settings
- [ ] Build passes

### Phase 3
- [ ] Preview shows correct shape, shadow, and attribution
- [ ] Widget list shows placement counts
- [ ] Messaging emphasizes "real data"
- [ ] Build passes

---

## Notes

- Domain name pending - currently using `toolkit.getrapidreviews.com`
- Update `NEXT_PUBLIC_APP_URL` when TrustSignal domain is secured
- Consider adding analytics tracking in Phase 3 or later

---

## Future Data Sources (Backlog)

These are verified data sources to add after Phase 1-3:

| Source | Priority | Notes |
|--------|----------|-------|
| **Stripe** | High | Verified purchases - "John just bought X" |
| **GHL Webhooks** | High | CRM-verified actions (tags, pipeline moves, form submissions) |
| **System Milestones** | Medium | Auto-generated from counts ("100th signup!") |
| **Facebook Reviews** | Medium | Similar to Google Reviews integration |
| **Zapier Webhooks** | Low | Generic webhook receiver for any integration |

All of these are verifiable, API-backed data sources that maintain the "real data only" brand promise.
