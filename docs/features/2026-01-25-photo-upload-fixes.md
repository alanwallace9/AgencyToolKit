# Session: Photo Upload Fixes - January 25, 2026

**Status:** In Progress - Multiple Issues Remain
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

## What's NOT Working

### 1. DRAG-AND-DROP (BROKEN)
**Symptom:** Dragging a file onto the dropzone opens it in a new browser tab instead of adding to upload list.

**What we tried:**
- Added `preventDefault()` and `stopPropagation()` on dropzone drag events
- Added document-level drag event prevention with capture phase
- Hid Driver.js overlay when modal opens
- Set z-index to max (`2147483647`)
- Added `pointer-events: auto !important` to modal and all children

**Current code location:** `app/embed.js/route.ts` lines ~3700-3720

**Hypothesis:** GHL's page has aggressive event handlers that intercept drag events at the window/document level before our listeners fire, even with capture phase.

### 2. PHOTO NOT SAVING TO DATABASE (BROKEN)
**Symptom:** After clicking "Upload & Finish" and seeing success message, no photo appears in:
- Notifications (bell shows "No notifications yet")
- Customer detail page (no photo gallery)
- customer_photos table (not verified)

**What we tried:** Nothing yet - just discovered this issue.

**Likely causes:**
1. API endpoint `/api/photos/upload` may be failing silently
2. Customer lookup by GHL location ID may not find matching customer
3. Notification creation may be failing
4. Customer record may not exist for that location ID

**Debug needed:**
- Check browser Network tab when submitting upload
- Check API response for errors
- Verify customer exists with matching `ghl_location_id`
- Check Supabase logs for errors

### 3. CONSOLE LOGS NOT APPEARING
**Symptom:** No `[AgencyToolkit]` logs in browser console during upload.

**Possible causes:**
- GHL clearing/filtering console
- Embed script not loading properly
- Log function not being called

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
