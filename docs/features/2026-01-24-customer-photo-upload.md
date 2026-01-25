# Feature: Customer Photo Upload

**Date:** 2026-01-24
**Status:** Planned
**Priority:** P2

---

## Executive Plan: Customer Photo Upload

### What We're Building

A frictionless photo upload experience embedded directly in onboarding tours. End customers drag-drop photos, name them, and they're done - all without leaving GHL. Agency owners get notified automatically via email and in-app. Zero manual setup required for agencies.

### UI/UX Placement

- **In Tour:** Upload button appears in tour tooltip, triggers modal overlay
- **Modal:** Injected iframe overlay on top of GHL page (we control via embed script)
- **Agency Dashboard:** New notification badge + notification center for upload alerts
- **Customer Detail Page:** Photo gallery showing all uploaded photos

### Key Deliverables

| Component | Description |
|-----------|-------------|
| Upload Modal (iframe) | Drag-drop interface with business name + photo naming |
| `/upload` page | Public route that handles the upload form |
| Photo storage | Vercel Blob storage for customer photos |
| Customer auto-create | Create customer record if location ID not found |
| In-app notification | Badge + notification list in Agency Toolkit |
| Agency settings | Photo upload toggles and notification preferences |
| Genie animation | Modal "whooshes" back to upload button on close |

### Order of Operations

1. **Database schema** - Add `customer_photos` table, `notifications` table
2. **Upload page** - `/app/(embed)/upload/page.tsx` with form
3. **Photo storage API** - `/api/photos/upload` endpoint using Vercel Blob
4. **Customer auto-create logic** - Lookup by location ID, create if missing
5. **Notification system** - Resend integration + notifications table
6. **Embed script modal injection** - Iframe overlay with genie animation
7. **Agency dashboard notifications** - Badge + notification list UI
8. **Customer detail photo gallery** - Display uploaded photos

### Database Changes

```sql
-- Customer photos table
CREATE TABLE customer_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  blob_url TEXT NOT NULL,
  name TEXT NOT NULL,  -- "Crew with Vans", "Technician Bill"
  original_filename TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 'photo_upload', 'tour_complete', etc.
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,  -- Deep link to relevant page
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add photo_count to customers for quick reference
ALTER TABLE customers ADD COLUMN photo_count INTEGER DEFAULT 0;
```

### Scope Boundaries

| In Scope | Out of Scope |
|----------|--------------|
| Drag-drop upload in modal | Image cropping (agency owner does this) |
| Multiple photos (up to 5) | Text box positioning (agency owner) |
| Business name + photo naming | A/B testing UI |
| Auto-create customer | GHL workflow integration |
| In-app notification + GHL webhook | Email notification (backlog), SMS |
| Genie close animation | Sound effects (browser limitations) |
| Rate limiting (1/min per location) | Virus scanning (future) |

### Quick Wins (UX Improvements)

| Suggestion | Why It Helps | Effort |
|------------|--------------|--------|
| **Genie animation on close** | Memorable, delightful, shows where it "went" | Medium |
| **Photo name suggestions** | Reduces friction: "Crew with Vans", "Team Photo" | Low |
| **Business name auto-focus** | Cursor ready, one less click | Low |
| **Instant image preview** | See photo immediately after drop | Low |
| **"Add Another Photo" flow** | Encourages multiple uploads naturally | Low |
| **Default naming: "Business - Photo 1"** | Clean organization without extra thought | Low |
| **Success message: "You're all set!"** | Clear closure, user knows they're done | Low |
| **Notification badge in nav** | Agency owner sees pending items at glance | Low |
| **One-click to Image Editor** | From notification straight to editing | Low |

### Agency Settings (Photo Uploads)

The settings page will have a "Photo Uploads" section:

```
Photo Uploads
─────────────
☑ Allow customers to upload photos during onboarding
☐ Let customers position the text box (advanced)
☑ Notify me when a photo is uploaded
  └─ Notification method: [In-App ▼]
     Options: In-App, Webhook to GHL
```

**Settings fields in `agency.settings.photo_uploads`:**

```typescript
interface PhotoUploadSettings {
  enabled: boolean;                    // Allow customers to upload photos
  allow_text_positioning: boolean;     // Let customers position text box (backlog)
  notify_on_upload: boolean;           // Show notification when photo uploaded
  notification_method: 'in_app' | 'webhook';  // How to notify
  webhook_url?: string;                // GHL webhook URL if method is 'webhook'
}
```

**Behavior:**
- `enabled: false` → Upload button hidden in tours, /upload page shows "disabled" message
- `allow_text_positioning: true` → After upload, customer sees canvas to drag text box (backlog - not MVP)
- `notify_on_upload: false` → No notification created
- `notification_method: 'webhook'` → POST to webhook_url instead of creating in-app notification

**Note:** Email notification via Resend is in Phase 4 backlog.

---

## Technical Details

### Upload Modal Flow

```
┌────────────────────────────────────────────────────────┐
│  📸 Upload Your Photos                            [X]  │
│                                                        │
│  Business Name                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Big Mike's Plumbing                         [✓]  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  │        ┌───────┐                                │ │
│  │        │   +   │   Drop photo here              │ │
│  │        └───────┘   or tap to browse             │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  After first photo added:                              │
│  ┌──────────────────────────────────────────────────┐ │
│  │ [img] Name: [Crew with Vans          ] [x]      │ │
│  │ [img] Name: [Technician Bill         ] [x]      │ │
│  │                                                  │ │
│  │      [+ Add Another Photo] (up to 5)            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  💡 Suggestions: Team photo, Individual headshot,      │
│     Crew in front of building, With happy customer     │
│                                                        │
│                      [Upload & Finish]                 │
└────────────────────────────────────────────────────────┘
```

### Genie Animation

On completion:
1. Modal content fades to success state: "You're all set!"
2. After 1.5 seconds, modal shrinks and curves toward the tour tooltip/upload button
3. CSS animation: scale down + bezier curve translation + opacity fade
4. Duration: ~500ms
5. No sound (browser autoplay restrictions make this unreliable)

### Identification & Routing

```
URL: /upload?key={agency_token}&loc={location_id}

Embed script injects these automatically:
- key = from embed script's CONFIG_KEY
- loc = extracted from /v2/location/XXXXX/ in current URL

Lookup logic:
1. Validate agency token → get agency_id
2. Look for customer WHERE agency_id AND ghl_location_id = loc
3. If not found → create customer with business name from form
4. Attach photos to customer record
```

### Default Photo Naming

When user doesn't enter a custom name:
- First photo: `{Business Name} - Photo 1`
- Second photo: `{Business Name} - Photo 2`
- etc.

Example: `Big Mike's Plumbing - Photo 1`

### Notification Email (via Resend)

```
Subject: 📸 New photo upload from Big Mike's Plumbing

Hi {Agency Owner Name},

Big Mike's Plumbing just uploaded 2 photos:
- Crew with Vans
- Technician Bill

→ Open Image Editor [link]

---
Agency Toolkit
```

### In-App Notification

```json
{
  "type": "photo_upload",
  "title": "New photos uploaded",
  "message": "Big Mike's Plumbing uploaded 2 photos",
  "link": "/images?customer={customer_id}",
  "read": false
}
```

### Security & Reliability

| Concern | Solution |
|---------|----------|
| Wrong customer gets photo | Location ID + Agency ID = unique lookup |
| Malicious file upload | Validate: JPEG/PNG/WebP only, max 5MB per file |
| Spam uploads | Rate limit: 1 upload session per location per minute |
| Missing business name | Required field, can't submit empty |
| Upload fails mid-way | Retry button, preserve entered data |
| Customer not in system | Auto-create with business name + location ID |
| Large files | Client-side resize before upload (max 2000px) |
| Duplicate uploads | Show existing photos, let them add more |

### Files to Create/Modify

**New Files:**
- `app/(embed)/upload/page.tsx` - Upload form page
- `app/(embed)/upload/_components/upload-form.tsx` - Form component
- `app/(embed)/upload/_components/photo-dropzone.tsx` - Drag-drop zone
- `app/(embed)/upload/_components/photo-list.tsx` - List of added photos
- `app/api/photos/upload/route.ts` - Upload endpoint
- `app/api/notifications/route.ts` - Notifications API
- `lib/notifications/send-email.ts` - Resend integration
- `components/dashboard/notification-bell.tsx` - Nav badge + dropdown

**Modify:**
- `app/embed.js/route.ts` - Add modal injection + genie animation
- `app/(dashboard)/layout.tsx` - Add notification bell to header
- `app/(dashboard)/customers/[id]/page.tsx` - Add photo gallery section
- `proxy.ts` - Add `/upload` and `/api/photos` to public routes

### Migration Path

```sql
-- Migration: 2026-01-XX_customer_photos_and_notifications.sql

-- Customer photos
CREATE TABLE customer_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  blob_url TEXT NOT NULL,
  name TEXT NOT NULL,
  original_filename TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_photos_customer ON customer_photos(customer_id);
CREATE INDEX idx_customer_photos_agency ON customer_photos(agency_id);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_agency ON notifications(agency_id);
CREATE INDEX idx_notifications_unread ON notifications(agency_id, read) WHERE read = FALSE;

-- Photo count on customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0;

-- RLS Policies
ALTER TABLE customer_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Photos: agencies can manage their own
CREATE POLICY "Agencies manage own photos" ON customer_photos
  FOR ALL USING (agency_id IN (
    SELECT id FROM agencies WHERE clerk_user_id = auth.jwt()->>'sub'
  ));

-- Photos: public insert for upload page (validated by API)
CREATE POLICY "Public can insert photos" ON customer_photos
  FOR INSERT WITH CHECK (true);

-- Notifications: agencies see their own
CREATE POLICY "Agencies see own notifications" ON notifications
  FOR ALL USING (agency_id IN (
    SELECT id FROM agencies WHERE clerk_user_id = auth.jwt()->>'sub'
  ));
```

---

## Questions Resolved

| Question | Decision |
|----------|----------|
| Modal or new page? | Modal (iframe injected by embed script) |
| How identify customer? | Agency token + Location ID from URL |
| Customer doesn't exist? | Auto-create with business name |
| How notify agency? | In-app badge + optional GHL webhook (email via Resend in backlog) |
| Multiple photos? | Yes, up to 5 per session |
| Default photo name? | "{Business Name} - Photo N" |
| Close animation? | Genie effect toward upload button |
| Sound on close? | No (browser restrictions) |

---

## Related Documents

- `docs/sessions/2026-01-24-tour-enhancements.md` - Original discussion
- `docs/sessions/2026-01-24-session-final.md` - Tour fixes context
- `docs/features/feature-37-image-editor.md` - Image editor (where photos get used)

---

## Implementation Status

### Completed (2026-01-24)

| Item | Status | Notes |
|------|--------|-------|
| Database migration | Done | `customer_photos`, `notifications` tables, `photo_count` column |
| TypeScript types | Done | `CustomerPhoto`, `Notification`, `PhotoUploadSettings` |
| Photo upload API | Done | `/api/photos/upload` with Vercel Blob |
| Photo delete API | Done | `/api/photos/[id]` |
| Notifications API | Done | CRUD + mark-all-read |
| Notification bell | Done | In header next to Pro badge |
| Settings page | Done | Photo upload toggles + webhook URL |
| Customer photo gallery | Done | On customer detail page |
| Embed modal injection | Done | Inline modal with genie animation |
| Rate limiting | Done | 1 session/min per location |
| Client-side resize | Done | Canvas resize to 2000px max |
| Proxy routes | Done | `/api/photos(.*)` public |

### Still TODO

| Item | Priority | Notes |
|------|----------|-------|
| Tour builder UI | HIGH | Add "Upload Photo" button action option in step editor |
| Tour auto-advance | HIGH | Auto-advance when element clicked (separate feature) |
| Testing end-to-end | HIGH | Test full flow from tour → modal → upload → notification |
| Email via Resend | Backlog | In `phase-4-backlog.md` |

### Files Created

- `lib/rate-limit.ts`
- `app/api/photos/upload/route.ts`
- `app/api/photos/[id]/route.ts`
- `app/api/notifications/route.ts`
- `app/api/notifications/[id]/route.ts`
- `app/api/notifications/mark-all-read/route.ts`
- `app/api/settings/photo-uploads/route.ts`
- `components/dashboard/notification-bell.tsx`
- `app/(dashboard)/settings/_components/photo-upload-settings.tsx`
- `app/(dashboard)/customers/[id]/_components/customer-photo-gallery.tsx`

### Files Modified

- `proxy.ts` - Added public route
- `types/database.ts` - Added types
- `app/(dashboard)/layout.tsx` - Added notification bell
- `app/(dashboard)/settings/page.tsx` - Added settings card
- `app/(dashboard)/customers/[id]/page.tsx` - Added photo gallery
- `app/embed.js/route.ts` - Added upload modal (~400 lines)

---

## Next Session Prompt

```
Continue Customer Photo Upload Feature

## What's Been Done
- Database: customer_photos, notifications tables, photo_count column
- APIs: /api/photos/upload, /api/photos/[id], /api/notifications/*
- Notification bell in header with unread count
- Settings page with photo upload toggles
- Customer detail page with photo gallery
- Embed script has upload modal with genie animation
- Handler for button action "upload" in embed.js

## What's Missing

### 1. Tour Builder UI (PRIORITY)
The step editor needs "Upload Photo" as a button action option.

File: app/(dashboard)/tours/[id]/_components/step-editor.tsx

Look for the button action dropdown/select. Add "upload" as an option:
- Label: "Upload Photo"
- Value: "upload"
- Description: "Opens photo upload modal"

When user selects this, the step config should have:
{
  buttons: {
    primary: {
      text: "Upload Photo",
      action: "upload"
    }
  }
}

### 2. Tour Auto-Advance (separate feature)
See: docs/features/2026-01-24-tour-auto-advance.md

Add toggle in step editor: "Auto-advance when clicked"
When enabled + user clicks highlighted element, tour advances automatically.

### 3. End-to-End Testing
Test the full flow:
1. Create tour with "Upload Photo" button action
2. Run tour in GHL
3. Click upload button → modal opens
4. Drag photos, enter business name
5. Submit → success → genie animation
6. Check notification bell
7. Check customer detail page for photos

### Files to Check
- app/(dashboard)/tours/[id]/_components/step-editor.tsx (add upload action)
- app/embed.js/route.ts (verify upload handler works)
- docs/features/2026-01-24-tour-auto-advance.md (for auto-advance feature)

### Build Check
Run `pnpm build` before committing - must pass.

### Git
Don't commit until both features work. Commit message:
feat: Customer photo upload with notifications
```
