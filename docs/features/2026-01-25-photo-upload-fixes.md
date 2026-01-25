# Session: Photo Upload Fixes - January 25, 2026

**Status:** ✅ Complete
**Priority:** P1

---

## What's Been Built (Files Exist)

### Database Tables (Applied via Supabase)
- `customer_photos` - stores uploaded photos
- `notifications` - stores agency notifications
- `customers.photo_count` - counter column added

### API Routes (Created)
- `/api/photos/upload/route.ts` - Photo upload endpoint (Vercel Blob)
- `/api/photos/[id]/route.ts` - Delete photo endpoint
- `/api/notifications/route.ts` - Get/create notifications
- `/api/notifications/[id]/route.ts` - Mark notification as read
- `/api/notifications/mark-all-read/route.ts` - Bulk mark read
- `/api/settings/photo-uploads/route.ts` - Agency settings for uploads

### UI Components (Created)
- `components/dashboard/notification-bell.tsx` - Bell in header
- `app/(dashboard)/settings/_components/photo-upload-settings.tsx` - Settings toggles
- `app/(dashboard)/customers/[id]/_components/customer-photo-gallery.tsx` - Photo gallery

### Embed Script Additions (in embed.js/route.ts)
- Upload modal HTML/CSS injection (~400 lines)
- Genie close animation
- `window.__AT_OPEN_UPLOAD_MODAL__` function exposed
- "Upload Photo" button action handler for tours

### Tour Builder Updates
- "Upload Photo" added to button action dropdown in step-editor.tsx
- "Auto-advance when clicked" toggle added (for tooltip/hotspot steps)

---

## What's Working

| Feature | Status | Notes |
|---------|--------|-------|
| Notification bell UI | ✅ Shows | Bell icon visible in header |
| Settings page toggles | ✅ Shows | Photo upload settings card renders |
| Tour builder dropdown | ✅ Shows | "Upload Photo" option in actions |
| Upload modal appears | ✅ Works | Modal opens when tour button clicked |
| Business name input | ✅ Works | Can type in the field |
| Browse button | ✅ Works | File picker opens |
| Photo naming | ✅ Works | Can edit photo name after selecting |
| Suggestions buttons | ✅ Works | Fill in name on click |
| Upload & Finish button | ✅ Works | Shows success message |
| Genie animation | ✅ Works | Modal animates closed |

---

## What Was Fixed (2026-01-25)

### 1. DRAG-AND-DROP ✅ FIXED
**Root cause:** Document-level drop handler was calling `stopPropagation()` in capture phase, killing the event before dropzone handler could receive it.

**Fix:** Removed `stopPropagation()` from document-level handler, kept only `preventDefault()`.

### 2. PHOTO NOT SAVING TO DATABASE ✅ FIXED
**Root cause:** RLS policies check `auth.jwt() ->> 'sub'` but we use Clerk (not Supabase Auth), so the server client had no JWT claim.

**Fix:** Switched from `createClient()` to `createAdminClient()` for authenticated API routes (bypasses RLS). Proper fix would be Clerk→Supabase JWT integration.

### 3. PAGE UNCLICKABLE AFTER MODAL ✅ FIXED
**Root cause:** `startGenieAnimation()` didn't restore Driver.js elements or remove document listeners after upload success.

**Fix:** Added cleanup code to restore Driver.js display and remove drag listeners.

### 4. TOUR NOT ADVANCING AFTER UPLOAD ✅ FIXED
**Root cause:** `window.__atDriverInstance` was never set for production tours - only local `driverRef` was used.

**Fix:** Added `window.__atDriverInstance = driverInstance;` when production tour starts.

### 5. IMAGES NOT DISPLAYING ON CUSTOMER PAGE ✅ FIXED
**Root cause:** Next.js Image component requires external domains whitelisted. Vercel Blob domain wasn't in `next.config.ts`.

**Fix:** Added `images.remotePatterns` for `*.public.blob.vercel-storage.com`.

### 6. NOTIFICATION LINK NOT SCROLLING TO PHOTOS ✅ FIXED
**Fix:** Changed link from `/customers/{id}` to `/customers/{id}#photos` and added `id="photos"` to gallery card.

### 7. DUPLICATE PHOTO NAMES ✅ FIXED
**Root cause:** Auto-naming used batch index (Photo 1, Photo 2) instead of existing photo count.

**Fix:** Changed to `customer.photo_count + batch_index + 1` for sequential naming.

---

## Code Changes Made This Session

### Commit 1: `998662c`
```
feat: Customer photo upload with notifications + tour auto-advance
```
- All photo upload infrastructure
- Tour auto-advance feature
- Notification system

### Commit 2: `5a7cbaf`
```
fix: Upload modal Driver.js overlay conflict + drag-drop
```
- Hide Driver.js overlay/popover when modal opens
- Document-level drag prevention
- Z-index increased to max

### Commit 3: `8b94c03`
```
fix: Upload modal pointer-events and interactivity
```
- `pointer-events: auto !important` on modal and children
- `user-select: text` on inputs
- Debug click logging added

---

## Files Modified (Key Locations)

### embed.js/route.ts - Upload Modal Code
```
Line ~3282: openUploadModal() function
Line ~3295: Modal HTML injection
Line ~3350: Modal CSS styles
Line ~3670: closeModal() function
Line ~3678: Drag event handlers
Line ~3699: Drop handler
Line ~3704: Click to browse handler
Line ~3746: Submit handler (calls submitPhotos)
Line ~3996: window.__AT_OPEN_UPLOAD_MODAL__ assignment
```

### embed.js/route.ts - Tour Upload Action
```
Line ~2819: Button action "upload" handler in onNextClick
```

### step-editor.tsx - Tour Builder
```
Line ~358: "Upload Photo" SelectItem added
Line ~288: Auto-advance toggle added
```

---

## Intended User Flow (Not Yet Working)

1. **In GHL:** Customer sees tour with "Upload Photo" step
2. **Click button:** Upload modal appears
3. **Drag/browse photo:** Photo appears in list with editable name
4. **Click Upload & Finish:**
   - Photo uploaded to Vercel Blob
   - Photo record created in `customer_photos` table
   - Customer `photo_count` incremented
   - Notification created in `notifications` table
   - Success message shown, modal closes
5. **Agency owner dashboard:**
   - Bell shows unread notification
   - Click notification → goes to customer page
   - Customer page shows photo gallery
   - Click photo → opens in Image Personalization editor
   - Agency owner adds text overlay, saves template

---

## Environment Notes

- GHL Location ID extracted from URL: `/v2/location/{LOCATION_ID}/...`
- Customer lookup: `WHERE ghl_location_id = ?`
- If customer not found, should auto-create (code exists but may not work)

---

## Next Session Priorities

### Priority 1: Fix Photo Save Pipeline
1. Test `/api/photos/upload` endpoint directly with curl/Postman
2. Check if customer exists with correct `ghl_location_id`
3. Add visible error handling in modal
4. Verify Vercel Blob is configured and working

### Priority 2: Fix Drag-and-Drop
1. Research GHL's event handling (Vue.js based)
2. Consider iframe approach for modal instead of injected HTML
3. Test dropping directly on file input element
4. Consider using native `<input type="file">` with better styling

### Priority 3: Post-Upload Flow
1. Photo → Image Editor integration
2. Click photo on customer page → opens in editor
3. Pre-populate text overlay position

---

## Test Commands

```bash
# Test photo upload API directly
curl -X POST https://your-app.vercel.app/api/photos/upload \
  -F "file=@test.jpg" \
  -F "agencyToken=your_agency_token" \
  -F "locationId=dhYAj0u9t0di7ZWO2N3v" \
  -F "businessName=Test Business" \
  -F "photoName=Test Photo"

# Check customer by location ID (in Supabase SQL editor)
SELECT * FROM customers WHERE ghl_location_id = 'dhYAj0u9t0di7ZWO2N3v';

# Check recent photos
SELECT * FROM customer_photos ORDER BY created_at DESC LIMIT 10;

# Check recent notifications
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
```

---

## Related Files to Read First

1. `docs/features/2026-01-24-customer-photo-upload.md` - Original spec
2. `docs/features/2026-01-24-customer-photo-upload-technical-spec.md` - Technical details
3. `app/api/photos/upload/route.ts` - Upload endpoint (check for bugs)
4. `app/embed.js/route.ts` lines 3282-3900 - Modal code
5. This file for context
