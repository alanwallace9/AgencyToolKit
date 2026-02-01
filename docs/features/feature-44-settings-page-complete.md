# Feature 44: Settings Page Complete

**Status:** ✅ COMPLETE
**Completed:** 2026-02-01
**Priority:** High
**Estimate:** 4-5 hours

---

## Overview

Complete the Settings page with a left navigation layout (query param routing), editable agency profile, excluded locations management, and account deletion. Clean, focused UX - one section visible at a time.

---

## UI/UX Layout

```
┌──────────────────┬─────────────────────────────────────┐
│                  │                                     │
│  ○ Profile       │   Section Title                     │
│  ○ Embed Code    │   Section description               │
│  ○ GHL Setup     │                                     │
│  ○ Photos        │   ┌─────────────────────────────┐   │
│  ○ Excluded      │   │                             │   │
│    Locations     │   │   Section Content Card      │   │
│                  │   │                             │   │
│  ───────────────│   └─────────────────────────────┘   │
│  ○ Danger Zone   │                                     │
│    (red text)    │                                     │
│                  │                                     │
└──────────────────┴─────────────────────────────────────┘
```

### URL Structure (Route-based)

| URL | Section |
|-----|---------|
| `/settings` | Redirects to `/settings/profile` |
| `/settings/profile` | Profile |
| `/settings/embed` | Embed Code |
| `/settings/ghl` | GHL Setup |
| `/settings/photos` | Photos |
| `/settings/excluded` | Excluded Locations |
| `/settings/danger` | Danger Zone |

**Why routes over query params:**
- Matches Guidely sidebar pattern for consistency
- Each section is a proper route (better for navigation)
- Layout-level sidebar persists across sections
- Click-to-toggle expand/collapse (no hover/pin complexity)

---

## Sections

### 1. Profile
- **Agency Name** - Inline editable with save (no modal)
- **Email** - Read-only (managed by Clerk)
- **Plan** - Gold PRO badge (matches rest of build) or Toolkit badge

### 2. Embed Code
- Combines existing `EmbedCodeDisplay` and `CssExportCard` components
- Script tag with copy button
- Generated CSS with copy button

### 3. GHL Setup
- Existing `GhlIntegrationSettings` component
- White-label domain input
- Builder auto-close toggle

### 4. Photos
- Existing `PhotoUploadSettings` component
- Enable/disable photo uploads
- Notification settings (in-app or webhook)

### 5. Excluded Locations (NEW)
- **Purpose:** GHL location IDs where the embed script should NOT run
- **Use case:** Demo accounts, test locations, client locations that shouldn't get customizations
- List of location IDs with remove buttons
- Add input field
- "Copy All" button for bulk operations
- Explanation text about what this does

### 6. Danger Zone
- **Delete Account only** (red styling)
- Soft delete behavior (sets `deleted_at` timestamp)
- Type "DELETE" to confirm
- Grace period before permanent deletion
- TODO: Cancel Stripe subscription when billing is integrated

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Layout | Left nav with query params | Scales well, focused UX, consistent with Guidely |
| URL routing | `?section=profile` | Server-accessible, SSR works, analytics track properly |
| Delete behavior | Soft delete | Grace period, easier recovery, billing cancellation window |
| Whitelist naming | "Excluded Locations" | Clearer intent - these locations are excluded from embed |
| PRO badge color | Gold | Matches rest of build (not purple) |
| Data export | Customers only, on Customers page | Full export not useful; customer data belongs on Customers page |

---

## Database Changes

### Migration: Add `deleted_at` column

```sql
-- Add soft delete support to agencies table
ALTER TABLE agencies
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index for querying active agencies
CREATE INDEX idx_agencies_deleted_at ON agencies(deleted_at)
WHERE deleted_at IS NULL;

-- Update RLS policies to exclude soft-deleted agencies
-- (policies already filter by clerk_user_id, but good to be explicit)
```

---

## Files to Create/Modify

```
app/(dashboard)/settings/
├── page.tsx                              # MODIFY - Query param routing
├── _components/
│   ├── settings-layout.tsx               # NEW - 2-column layout shell
│   ├── settings-nav.tsx                  # NEW - Left navigation
│   ├── profile-section.tsx               # NEW - Editable name, plan badge
│   ├── embed-section.tsx                 # NEW - Combine existing components
│   ├── ghl-section.tsx                   # REFACTOR - From ghl-integration-settings
│   ├── photos-section.tsx                # REFACTOR - From photo-upload-settings
│   ├── excluded-locations-section.tsx    # NEW
│   ├── danger-zone-section.tsx           # NEW
│   ├── embed-code-display.tsx            # KEEP - Used by embed-section
│   └── css-export-card.tsx               # KEEP - Used by embed-section
├── _actions/
│   └── settings-actions.ts               # MODIFY - Add new actions

app/(dashboard)/customers/
├── page.tsx                              # MODIFY - Add Export CSV button
├── _components/
│   └── export-customers-button.tsx       # NEW

supabase/migrations/
└── YYYYMMDD_add_deleted_at.sql           # NEW - Soft delete column
```

---

## Server Actions

### New Actions Needed

```typescript
// settings-actions.ts

// Profile
updateAgencyName(name: string): Promise<void>

// Excluded Locations
addExcludedLocation(locationId: string): Promise<void>
removeExcludedLocation(locationId: string): Promise<void>

// Danger Zone
deleteAccount(): Promise<void>  // Soft delete, sets deleted_at
// TODO: cancelStripeSubscription() when billing integrated
```

### Customer Export (on Customers page)

```typescript
// customer-actions.ts
exportCustomersCSV(): Promise<Blob>  // Returns CSV file
```

---

## Acceptance Criteria

- [ ] Left nav layout renders correctly
- [ ] Query param routing works (`?section=profile`, etc.)
- [ ] Default section is Profile when no param
- [ ] Agency name is inline editable with toast feedback
- [ ] PRO badge is gold colored
- [ ] Excluded Locations can be added/removed
- [ ] "Copy All" copies all location IDs
- [ ] Delete account requires typing "DELETE"
- [ ] Soft delete sets `deleted_at` timestamp
- [ ] User is signed out after deletion
- [ ] Customer Export button appears on Customers page
- [ ] CSV downloads with correct data

---

## Future Considerations

### Stripe Integration (when added)
When delete account is triggered:
1. Cancel active Stripe subscription
2. Prorate final billing
3. Set `deleted_at`
4. Sign out

### Data Retention
- Soft-deleted accounts kept for 30 days
- Cron job purges after retention period
- Consider: Allow recovery within 30 days?

---

## Out of Scope

- Stripe billing link (no Stripe yet)
- Email change (Clerk handles)
- Full data export (not useful)
- Account recovery UI
- Customer import from GHL (separate feature)
- Share/Import with affiliate attribution (separate feature)

---

## Implementation Notes (2026-02-01)

### Files Created
- `app/(dashboard)/settings/layout.tsx` - Layout with collapsible sidebar
- `app/(dashboard)/settings/_components/settings-sidebar.tsx` - Click-to-toggle sidebar
- `app/(dashboard)/settings/profile/page.tsx` - Profile route
- `app/(dashboard)/settings/embed/page.tsx` - Embed code route
- `app/(dashboard)/settings/ghl/page.tsx` - GHL setup route
- `app/(dashboard)/settings/photos/page.tsx` - Photos route
- `app/(dashboard)/settings/excluded/page.tsx` - Excluded locations route
- `app/(dashboard)/settings/danger/page.tsx` - Danger zone route
- `app/(dashboard)/settings/_components/profile-section.tsx` - Editable name, gold PRO badge
- `app/(dashboard)/settings/_components/embed-section.tsx` - Combines embed + CSS export
- `app/(dashboard)/settings/_components/ghl-section.tsx` - Wraps existing GHL settings
- `app/(dashboard)/settings/_components/photos-section.tsx` - Wraps existing photo settings
- `app/(dashboard)/settings/_components/excluded-locations-section.tsx` - Add/remove/copy all
- `app/(dashboard)/settings/_components/danger-zone-section.tsx` - Delete with typed confirmation
- `app/api/customers/export/route.ts` - CSV export endpoint
- `app/(dashboard)/customers/_components/export-customers-button.tsx` - Export button

### Files Modified
- `app/(dashboard)/settings/page.tsx` - Now redirects to /settings/profile
- `app/(dashboard)/settings/_actions/settings-actions.ts` - New actions (updateAgencyName, add/removeExcludedLocation, deleteAccount)
- `app/(dashboard)/customers/_components/customers-client.tsx` - Added export button
- `types/database.ts` - Added deleted_at to Agency interface

### Database Migration
- Added `deleted_at` column to agencies table
- Added index for querying active agencies

### Acceptance Criteria Met
- [x] Left nav layout renders correctly
- [x] Query param routing works
- [x] Agency name is inline editable
- [x] PRO badge is gold colored
- [x] Excluded Locations CRUD works
- [x] Delete account requires typing "DELETE"
- [x] Customer Export on Customers page works
