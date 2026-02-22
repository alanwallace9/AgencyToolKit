# Feature: Customer Photo Upload → Image Template Pipeline

**Date:** 2026-02-22
**Status:** Planned
**Priority:** P1
**Depends on:** Customer Photo Upload (completed), Image Personalization (completed)

---

## Problem

The customer photo upload system works end-to-end (embed modal → storage → notification), but there's no pathway from uploaded photos into the Image Personalization module. Agency owners have to manually download/re-upload photos when creating templates.

## Solution

Add a "Create Template" action on the customer photo gallery, and improve the Guidely tour integration with a dedicated Upload Photo toggle.

## UX Flow

```
Customer in GHL                         Agency Owner in Toolkit
─────────────────                       ───────────────────────
1. Starts onboarding tour
2. Step: "Upload team photos"
3. Clicks "Upload Photo" button
   (separate from Next/Previous)
4. Modal opens → drags photos
5. Names them → clicks Upload
6. Success! Modal closes
                                        7. Bell shows (1) new notification
                                        8. "Precision Plumbing uploaded 3 photos"
                                        9. Clicks → goes to /customers/{id}#photos
                                        10. Sees photos in gallery
                                        11. Clicks "Create Template" on a photo
                                        12. Navigates to image editor with template
                                            pre-created from that photo
                                        13. Adds text overlay, saves, done!
```

## What Already Exists (No Changes Needed)

- Embed script upload modal (business name, drag-drop, naming, genie animation)
- `/api/photos/upload` — upload, auto-create customer, store to Vercel Blob, notify
- `customer_photos` table
- Notification bell + dropdown in dashboard header
- Customer detail page with photo gallery
- Tour step `action: 'upload'` in embed script

## Changes Required

### Part 1: Photo → Template Pipeline

1. **DB Migration:** Add `width`/`height` columns to `customer_photos`
2. **Upload Route:** Use Sharp to extract dimensions during upload
3. **Server Action:** `createTemplateFromPhoto(photoId)` — creates image_template from a customer_photo
4. **Photo Gallery:** Add "Create Template" button on each photo in the hover overlay
5. **Types:** Add `width`/`height` to CustomerPhoto interface

### Part 2: Tour Builder — Upload Photo Toggle

1. **Step Editor:** Remove "Upload Photo" from primary button action dropdown. Add separate toggle in Step Options ("Upload Photo: ON/OFF"). Available on modal/tooltip types.
2. **Embed Script:** When `step.settings.show_upload_button` is true, inject a separate Upload Photo button into the Driver.js popover alongside navigation buttons.
3. **Types:** Add `show_upload_button` to step settings type.

### Future (Out of Scope)

- **Standalone upload page** (`app/(embed)/upload/page.tsx`) — a URL the agency can share with customers for photo uploads outside of tours. Agency gets this URL from the customer tab.

## Files to Modify

| File | Change |
|------|--------|
| `app/api/photos/upload/route.ts` | Sharp dimensions during upload |
| `app/(dashboard)/customers/[id]/_components/customer-photo-gallery.tsx` | "Create Template" button |
| `app/(dashboard)/images/_actions/image-actions.ts` | `createTemplateFromPhoto()` |
| `app/(dashboard)/g/tours/[id]/_components/tour-step-editor.tsx` | Upload Photo toggle |
| `app/embed.js/route.ts` | Handle `show_upload_button`, inject button |
| `types/database.ts` | CustomerPhoto dimensions, step settings |

## Database Migration

```sql
ALTER TABLE customer_photos ADD COLUMN width INTEGER;
ALTER TABLE customer_photos ADD COLUMN height INTEGER;
```
