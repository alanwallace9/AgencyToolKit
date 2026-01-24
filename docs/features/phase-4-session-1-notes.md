# Phase 4: Image Personalization - Session 1 Notes

**Date:** 2026-01-21
**Features:** 36 (Upload) & 35 (Templates List)
**Status:** Mostly complete, one bug remaining

---

## What Was Built

### Feature 36: Image Upload & Processing ✅

**Files Created:**
- `lib/storage/types.ts` - Storage provider interface (for R2 migration later)
- `lib/storage/vercel-blob.ts` - Vercel Blob implementation
- `lib/storage/index.ts` - Storage abstraction + helpers (validateImageFile, generateImagePath)
- `app/api/images/upload/route.ts` - File upload endpoint (multipart/form-data)
- `app/api/images/fetch/route.ts` - URL fetch endpoint (paste URL from GHL)
- `app/(dashboard)/images/_components/image-upload-zone.tsx` - Drag/drop + URL input component

**Features:**
- Drag & drop with visual states (idle → hover → uploading → success/error)
- Separate URL input field for pasting GHL media URLs
- File validation: JPG, PNG, WebP only; max 3MB
- Sharp for dimension extraction
- Storage abstraction ready for R2 migration

### Feature 35: Image Templates List ✅

**Files Created:**
- `app/(dashboard)/images/_actions/image-actions.ts` - Server actions (CRUD, duplicate)
- `app/(dashboard)/images/_lib/defaults.ts` - DEFAULT_TEXT_CONFIG constant
- `app/(dashboard)/images/_components/template-card.tsx` - Card with preview, stats, actions
- `app/(dashboard)/images/_components/add-template-dialog.tsx` - Create dialog with upload
- `app/(dashboard)/images/_components/delete-template-dialog.tsx` - Delete confirmation
- `app/(dashboard)/images/_components/empty-state.tsx` - Personalized "Welcome {name}!" demo
- `app/(dashboard)/images/_components/images-client.tsx` - Grid view with search/sort/filter
- `app/(dashboard)/images/page.tsx` - Updated with data fetching

**Features:**
- Pro plan gate with upgrade prompt
- Personalized empty state using Clerk user name
- Template grid with image preview and text overlay preview
- Search & filter by name and sub-account
- Sort by newest, oldest, name, most renders
- Card actions: Edit, Preview, Duplicate, Delete

### Database Migration Applied

```sql
ALTER TABLE image_templates ADD COLUMN customer_id UUID REFERENCES customers(id);
ALTER TABLE image_templates ADD COLUMN ab_pair_id UUID;
ALTER TABLE image_templates ADD COLUMN ab_variant CHAR(1) CHECK (ab_variant IN ('A', 'B'));
CREATE INDEX idx_image_templates_customer_id ON image_templates(customer_id);
CREATE INDEX idx_image_templates_ab_pair_id ON image_templates(ab_pair_id);
```

### TypeScript Types Updated

- Added `ImageTemplateTextConfig` interface with full styling options
- Updated `ImageTemplate` with customer_id, ab_pair_id, ab_variant fields

### Environment Variable Added

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
```

---

## Bug Fixes Applied

### 1. Server Action Export Error
**Problem:** `'use server'` files can only export async functions, but we exported `DEFAULT_TEXT_CONFIG` constant.
**Fix:** Moved constant to `_lib/defaults.ts` and imported it.

### 2. Supabase RLS Policy Mismatch
**Problem:** RLS policies use `auth.jwt()` which requires Supabase Auth, but we use Clerk.
**Fix:** Changed all database calls in image-actions.ts to use `createAdminClient()` instead of `createClient()`.

### 3. Missing Type Import
**Problem:** `ImageTemplateTextConfig` type was not imported after refactoring.
**Fix:** Added import back to image-actions.ts.

### 4. Vercel Blob Size Property
**Problem:** `PutBlobResult` doesn't have a `size` property.
**Fix:** Calculate size from buffer before upload: `Buffer.isBuffer(file) ? file.length : file.size`

### 5. Type Mismatch for Customer Select
**Problem:** Selecting only `id, name` from customers but typing as full `Customer[]`.
**Fix:** Created `CustomerOption` type: `{ id: string; name: string }`

---

## Current Bug (To Fix Next Session)

**Issue:** "Failed to create template" with 404 error when clicking "Create & Edit"

**What Works:**
- Image upload to Vercel Blob ✅
- Image displays in dialog ✅
- Template name auto-fills ✅

**What Fails:**
- `createImageTemplate` server action returns 404

**Likely Cause:**
The 404 suggests the server action endpoint isn't being found. May need to:
1. Check if there's a routing issue with the `_actions` folder
2. Verify the server action is being called correctly from the client
3. Check browser network tab for the actual failing request

**Debug Steps for Next Session:**
1. Check browser Network tab for the actual request URL
2. Add console.log at start of `createImageTemplate` to see if it's even called
3. Check if `getCurrentAgency()` is returning null (would cause early return but not 404)

---

## Files Modified Summary

| File | Change |
|------|--------|
| `types/database.ts` | Added ImageTemplateTextConfig, updated ImageTemplate |
| `.env.example` | Added BLOB_READ_WRITE_TOKEN, removed R2 vars |
| `.env.local` | Added BLOB_READ_WRITE_TOKEN (user added) |

---

## Next Steps (Feature 37+)

1. **Fix the 404 bug** - createImageTemplate not working
2. **Feature 37: Image Editor** - Canvas with drag/drop text positioning
3. **Feature 38: OG API** - Generate optimized images with @vercel/og
4. **Feature 39: URL Generator** - Copy URLs with merge tags

---

## Architecture Decisions Made

1. **Vercel Blob over R2** - Simpler setup, can migrate to R2 later via storage abstraction
2. **Upload full quality, optimize on render** - Keep editing flexibility, optimize at Feature 38
3. **Folder structure:** `images/{agency_id}/{customer_id?}/{timestamp}-{filename}`
4. **Admin client for all DB ops** - Bypass RLS since we use Clerk not Supabase Auth
