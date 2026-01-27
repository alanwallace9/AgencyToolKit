# Phase 4: Image Personalization - Backlog

Ideas and features to add after the core image personalization features are complete.

---

## Known Issues (Feature 37)

### Zoom Controls Canvas Instead of Image

**Problem:** The Cmd/Ctrl + scroll wheel zoom affects the entire canvas container, not just the image inside it. When zooming in, the entire editor area scales (including the text box, handles, and canvas frame) instead of zooming into the base image content.

**Expected Behavior:** Zoom should scale the base image to allow finer detail work when positioning the text box, similar to how Canva's zoom works on the canvas content.

**Current Behavior:**
- `zoom` state stored in `image-editor.tsx` (lines 86-87)
- Applied via CSS `transform: scale(${zoom})` on the canvas container
- This scales everything proportionally, not just the image

**Suggested Fix:**
1. **Option A (Simple):** Remove zoom feature for now - it's not critical for MVP
2. **Option B (Proper):** Implement viewport-based zoom where the image is larger than the visible area and can be panned
3. **Option C (Alternative):** Keep current behavior but communicate it's "canvas zoom" not "image zoom"

**Priority:** Low (not blocking workflow)
**Complexity:** Medium - requires rethinking zoom architecture

---

## Future Feature Ideas

### Email Notifications via Resend
- **Problem**: Agency owners want email alerts when customers upload photos
- **Solution**: Integrate Resend to send notification emails
- **Details**:
  - Send email when customer uploads photos
  - Include photo count, customer name, business name
  - One-click link to Image Editor
  - Respect agency notification preferences (on/off toggle in settings)
- **Environment**: `RESEND_API_KEY` needed in `.env`
- **Dependencies**: Settings toggle for "Notify me when a photo is uploaded"

### Photo Cropping by Customer
- **Problem**: Customers upload photos that need cropping
- **Solution**: Allow customers to crop photos before upload
- **Details**:
  - Simple crop UI in upload modal
  - Aspect ratio presets (square, 16:9, 4:3)
  - Preview cropped result
- **Complexity**: Medium - need client-side crop library

### Text Box Positioning by Customer
- **Problem**: Agency wants customer to position their own text box
- **Solution**: "Let customers position the text box" toggle
- **Details**:
  - After photo upload, show canvas with draggable text box
  - Customer drags text to desired position
  - Saves position to image template
  - Agency can still edit later
- **Complexity**: High - need canvas editor in embed page
- **Note**: Already in Settings as a toggle, implementation is backlog

### SMS Notifications
- **Problem**: Some agency owners prefer SMS alerts
- **Solution**: Twilio integration for SMS notifications
- **Details**:
  - Add phone number field to agency settings
  - SMS template: "New photo upload from {Business Name}"
  - Rate limit SMS (max 1/minute)
- **Complexity**: Low-Medium - need Twilio integration

### Bulk Photo Import
- **Problem**: Agency wants to upload photos for multiple customers at once
- **Solution**: CSV import with photo URLs
- **Details**:
  - Upload CSV with customer_name, business_name, photo_url columns
  - Validate and import all photos
  - Show import progress and results
- **Complexity**: Medium

### Photo Virus Scanning
- **Problem**: Malicious files could be uploaded
- **Solution**: ClamAV or cloud-based scanning before storage
- **Details**:
  - Scan uploaded files before saving to Vercel Blob
  - Reject infected files with clear error message
  - Log incidents for security review
- **Complexity**: High - need scanning service integration

### A/B Testing for Images
- **Problem**: Agency wants to test which image performs better
- **Solution**: Automatic A/B split and tracking
- **Details**:
  - Pair two image templates as A/B variants
  - Serve 50/50 split
  - Track impressions and conversions
  - Declare winner after statistical significance
- **Complexity**: High

---

*Add new ideas here as they come up during development.*
