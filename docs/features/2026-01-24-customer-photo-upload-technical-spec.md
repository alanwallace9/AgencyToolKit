# Technical Spec: Customer Photo Upload

**Parent Feature:** `2026-01-24-customer-photo-upload.md`
**Date:** 2026-01-24
**Approach:** Inline Modal (no iframe)
**Status:** 90% Complete

## INCOMPLETE ITEMS

1. **Tour Builder UI** - Need to add "Upload Photo" as button action option in step editor
2. **Tour Auto-Advance** - Separate feature, see `2026-01-24-tour-auto-advance.md`
3. **End-to-End Testing** - Not yet tested

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  GHL Page (Third-Party)                                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Our Embed Script (embed.js)                              │  │
│  │                                                           │  │
│  │  - Injects modal HTML/CSS into GHL DOM                   │  │
│  │  - Handles drag-drop events                               │  │
│  │  - Uploads files to /api/photos/upload                   │  │
│  │  - Shows success + genie animation                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ POST (multipart/form-data)        │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Our API (/api/photos/upload)                                   │
│                                                                  │
│  1. Validate agency token                                       │
│  2. Find or create customer by location ID                      │
│  3. Resize image if > 2000px (server-side backup)              │
│  4. Upload to Vercel Blob                                       │
│  5. Save to customer_photos table                               │
│  6. Create notification (in-app or webhook)                     │
│  7. Return success                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Embed Script: Modal Injection

### 2.1 Trigger

The upload modal is triggered by:
1. **Tour step button** - A tour step with `button_action: 'upload'`
2. **Direct URL** - Opening `/upload?key=xxx&loc=yyy` (for testing)

When triggered from a tour:
```javascript
// In tour step config
{
  buttons: {
    primary: {
      text: "Upload Photo",
      action: "upload"  // Special action type
    }
  }
}
```

The embed script detects `action: "upload"` and calls `openUploadModal()` instead of advancing the tour.

### 2.2 Modal HTML Structure

```html
<div id="at-upload-overlay" class="at-upload-overlay">
  <div id="at-upload-modal" class="at-upload-modal">
    <!-- Header -->
    <div class="at-upload-header">
      <h2>Upload Your Photos</h2>
      <button id="at-upload-close" class="at-upload-close">&times;</button>
    </div>

    <!-- Form -->
    <div class="at-upload-body">
      <!-- Business Name -->
      <div class="at-upload-field">
        <label for="at-business-name">Business Name *</label>
        <input type="text" id="at-business-name" placeholder="e.g., Big Mike's Plumbing" autofocus />
      </div>

      <!-- Dropzone (when no photos yet) -->
      <div id="at-dropzone" class="at-dropzone">
        <div class="at-dropzone-content">
          <svg><!-- upload icon --></svg>
          <p>Drop photos here or <span class="at-dropzone-link">browse</span></p>
          <p class="at-dropzone-hint">JPEG, PNG, or WebP up to 5MB each</p>
        </div>
        <input type="file" id="at-file-input" accept="image/jpeg,image/png,image/webp" multiple hidden />
      </div>

      <!-- Photo List (when photos added) -->
      <div id="at-photo-list" class="at-photo-list" style="display: none;">
        <!-- Dynamically populated -->
      </div>

      <!-- Add More Button -->
      <button id="at-add-more" class="at-add-more" style="display: none;">
        + Add Another Photo
      </button>

      <!-- Suggestions -->
      <div class="at-suggestions">
        <span class="at-suggestions-label">Suggestions:</span>
        <button class="at-suggestion" data-name="Team Photo">Team Photo</button>
        <button class="at-suggestion" data-name="Crew with Vans">Crew with Vans</button>
        <button class="at-suggestion" data-name="Office Front">Office Front</button>
      </div>
    </div>

    <!-- Footer -->
    <div class="at-upload-footer">
      <button id="at-upload-submit" class="at-upload-submit" disabled>
        Upload & Finish
      </button>
    </div>

    <!-- Success State (hidden initially) -->
    <div id="at-upload-success" class="at-upload-success" style="display: none;">
      <svg><!-- checkmark icon --></svg>
      <h3>You're all set!</h3>
      <p>Your photos have been uploaded.</p>
    </div>
  </div>
</div>
```

### 2.3 Photo List Item Template

```html
<div class="at-photo-item" data-index="0">
  <img src="data:image/..." class="at-photo-thumb" />
  <input type="text" class="at-photo-name" placeholder="Photo name" value="Big Mike's Plumbing - Photo 1" />
  <button class="at-photo-remove">&times;</button>
</div>
```

### 2.4 CSS (Scoped with `at-` prefix)

```css
/* Overlay */
.at-upload-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.at-upload-overlay.at-visible {
  opacity: 1;
}

/* Modal */
.at-upload-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: scale(0.9);
  transition: transform 0.2s ease;
}

.at-upload-overlay.at-visible .at-upload-modal {
  transform: scale(1);
}

/* Dropzone */
.at-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.at-dropzone.at-dragover {
  border-color: #3b82f6;
  background: #eff6ff;
}

/* Photo list */
.at-photo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.at-photo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 8px;
}

.at-photo-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
}

.at-photo-name {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

/* Genie animation */
.at-upload-modal.at-genie {
  animation: at-genie-out 0.5s ease-in forwards;
}

@keyframes at-genie-out {
  0% {
    transform: scale(1) translate(0, 0);
    opacity: 1;
  }
  100% {
    transform: scale(0.1) translate(var(--at-genie-x), var(--at-genie-y));
    opacity: 0;
  }
}
```

---

## 3. Drag-Drop Implementation

### 3.1 Event Handlers

```javascript
function initDropzone() {
  var dropzone = document.getElementById('at-dropzone');
  var fileInput = document.getElementById('at-file-input');

  // Prevent default drag behaviors on document
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(event) {
    document.body.addEventListener(event, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Highlight on drag
  ['dragenter', 'dragover'].forEach(function(event) {
    dropzone.addEventListener(event, function() {
      dropzone.classList.add('at-dragover');
    });
  });

  ['dragleave', 'drop'].forEach(function(event) {
    dropzone.addEventListener(event, function() {
      dropzone.classList.remove('at-dragover');
    });
  });

  // Handle drop
  dropzone.addEventListener('drop', function(e) {
    var files = e.dataTransfer.files;
    handleFiles(files);
  });

  // Handle click to browse
  dropzone.addEventListener('click', function() {
    fileInput.click();
  });

  fileInput.addEventListener('change', function() {
    handleFiles(this.files);
  });
}
```

### 3.2 File Handling

```javascript
var uploadState = {
  photos: [],  // { file: File, preview: string, name: string }
  maxPhotos: 5,
  businessName: ''
};

function handleFiles(files) {
  var remaining = uploadState.maxPhotos - uploadState.photos.length;
  var filesToAdd = Array.from(files).slice(0, remaining);

  filesToAdd.forEach(function(file) {
    // Validate
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showError('Only JPEG, PNG, and WebP files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('File must be under 5MB');
      return;
    }

    // Create preview
    var reader = new FileReader();
    reader.onload = function(e) {
      var photoIndex = uploadState.photos.length + 1;
      var defaultName = uploadState.businessName
        ? uploadState.businessName + ' - Photo ' + photoIndex
        : 'Photo ' + photoIndex;

      uploadState.photos.push({
        file: file,
        preview: e.target.result,
        name: defaultName
      });

      renderPhotoList();
      updateSubmitButton();
    };
    reader.readAsDataURL(file);
  });
}
```

### 3.3 Client-Side Image Resize

```javascript
function resizeImage(file, maxDimension) {
  return new Promise(function(resolve) {
    var img = new Image();
    img.onload = function() {
      // Check if resize needed
      if (img.width <= maxDimension && img.height <= maxDimension) {
        resolve(file);
        return;
      }

      // Calculate new dimensions
      var ratio = Math.min(maxDimension / img.width, maxDimension / img.height);
      var newWidth = Math.round(img.width * ratio);
      var newHeight = Math.round(img.height * ratio);

      // Draw to canvas
      var canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to blob
      canvas.toBlob(function(blob) {
        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.9);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

---

## 4. Upload API Contract

### 4.1 Request

```
POST /api/photos/upload
Content-Type: multipart/form-data
```

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | string | Yes | Agency token (rp_xxx) |
| `location_id` | string | Yes | GHL location ID |
| `business_name` | string | Yes | Customer's business name |
| `photos` | File[] | Yes | Image files (1-5) |
| `photo_names` | string | Yes | JSON array of names: `["Crew Photo", "Team"]` |

### 4.2 Response - Success

```json
{
  "success": true,
  "customer": {
    "id": "uuid",
    "name": "Big Mike's Plumbing",
    "is_new": true
  },
  "photos": [
    {
      "id": "uuid",
      "name": "Crew with Vans",
      "blob_url": "https://..."
    }
  ],
  "notification_sent": true
}
```

### 4.3 Response - Errors

```json
// 400 - Validation error
{
  "error": "Business name is required",
  "code": "VALIDATION_ERROR"
}

// 401 - Invalid token
{
  "error": "Invalid agency token",
  "code": "INVALID_TOKEN"
}

// 429 - Rate limited
{
  "error": "Please wait before uploading again",
  "code": "RATE_LIMITED",
  "retry_after": 60
}

// 500 - Server error
{
  "error": "Upload failed, please try again",
  "code": "SERVER_ERROR"
}
```

### 4.4 Server-Side Flow

```typescript
export async function POST(request: Request) {
  // 1. Parse multipart form data
  const formData = await request.formData();
  const key = formData.get('key') as string;
  const locationId = formData.get('location_id') as string;
  const businessName = formData.get('business_name') as string;
  const photoNames = JSON.parse(formData.get('photo_names') as string);
  const photos = formData.getAll('photos') as File[];

  // 2. Validate agency token
  const agency = await getAgencyByToken(key);
  if (!agency) {
    return Response.json({ error: 'Invalid agency token' }, { status: 401 });
  }

  // 3. Check agency settings
  const settings = agency.settings?.photo_uploads;
  if (settings?.enabled === false) {
    return Response.json({ error: 'Photo uploads disabled' }, { status: 403 });
  }

  // 4. Rate limit check (1 per minute per location)
  const rateLimitKey = `upload:${agency.id}:${locationId}`;
  if (await isRateLimited(rateLimitKey, 60)) {
    return Response.json({ error: 'Please wait', retry_after: 60 }, { status: 429 });
  }

  // 5. Find or create customer
  let customer = await findCustomerByLocation(agency.id, locationId);
  const isNewCustomer = !customer;
  if (!customer) {
    customer = await createCustomer({
      agency_id: agency.id,
      name: businessName,
      ghl_location_id: locationId
    });
  }

  // 6. Upload each photo to Vercel Blob
  const uploadedPhotos = [];
  for (let i = 0; i < photos.length; i++) {
    const file = photos[i];
    const name = photoNames[i] || `${businessName} - Photo ${i + 1}`;

    // Upload to Vercel Blob
    const blob = await put(`photos/${customer.id}/${Date.now()}-${file.name}`, file, {
      access: 'public'
    });

    // Save to database
    const photo = await saveCustomerPhoto({
      customer_id: customer.id,
      agency_id: agency.id,
      blob_url: blob.url,
      name: name,
      original_filename: file.name,
      file_size: file.size
    });

    uploadedPhotos.push(photo);
  }

  // 7. Update customer photo count
  await updateCustomerPhotoCount(customer.id, uploadedPhotos.length);

  // 8. Create notification
  let notificationSent = false;
  if (settings?.notify_on_upload !== false) {
    if (settings?.notification_method === 'webhook' && settings?.webhook_url) {
      // Send webhook to GHL
      await sendWebhook(settings.webhook_url, {
        event: 'photo_upload',
        customer_name: businessName,
        photo_count: uploadedPhotos.length,
        customer_id: customer.id
      });
    } else {
      // Create in-app notification
      await createNotification({
        agency_id: agency.id,
        type: 'photo_upload',
        title: 'New photos uploaded',
        message: `${businessName} uploaded ${uploadedPhotos.length} photo${uploadedPhotos.length > 1 ? 's' : ''}`,
        link: `/customers/${customer.id}`
      });
    }
    notificationSent = true;
  }

  // 9. Set rate limit
  await setRateLimit(rateLimitKey, 60);

  // 10. Return success
  return Response.json({
    success: true,
    customer: { id: customer.id, name: customer.name, is_new: isNewCustomer },
    photos: uploadedPhotos,
    notification_sent: notificationSent
  });
}
```

---

## 5. Notifications API Contract

### 5.1 GET /api/notifications

Returns notifications for the authenticated agency.

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `unread_only` | boolean | false | Only return unread |
| `limit` | number | 20 | Max results |

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "photo_upload",
      "title": "New photos uploaded",
      "message": "Big Mike's Plumbing uploaded 2 photos",
      "link": "/customers/uuid",
      "read": false,
      "created_at": "2026-01-24T10:30:00Z"
    }
  ],
  "unread_count": 3
}
```

### 5.2 PATCH /api/notifications/[id]

Mark notification as read.

**Body:**
```json
{ "read": true }
```

### 5.3 POST /api/notifications/mark-all-read

Mark all notifications as read for the agency.

---

## 6. Genie Animation

### 6.1 How It Works

1. User clicks "Upload & Finish"
2. Photos upload successfully
3. Modal shows success state (checkmark + "You're all set!")
4. After 1.5 seconds, calculate genie target position
5. Apply CSS custom properties for animation destination
6. Add `.at-genie` class to trigger animation
7. After animation (500ms), remove modal from DOM

### 6.2 Implementation

```javascript
function startGenieAnimation() {
  var modal = document.getElementById('at-upload-modal');
  var overlay = document.getElementById('at-upload-overlay');

  // Find the trigger element (tour step button or fallback to center-bottom)
  var triggerEl = document.querySelector('[data-at-upload-trigger]');
  var targetX = 0;
  var targetY = 0;

  if (triggerEl) {
    var rect = triggerEl.getBoundingClientRect();
    var modalRect = modal.getBoundingClientRect();

    // Calculate offset from modal center to trigger center
    targetX = (rect.left + rect.width / 2) - (modalRect.left + modalRect.width / 2);
    targetY = (rect.top + rect.height / 2) - (modalRect.top + modalRect.height / 2);
  } else {
    // Fallback: animate to bottom center of screen
    targetY = window.innerHeight / 2;
  }

  // Set CSS custom properties
  modal.style.setProperty('--at-genie-x', targetX + 'px');
  modal.style.setProperty('--at-genie-y', targetY + 'px');

  // Start animation
  modal.classList.add('at-genie');

  // Fade overlay
  overlay.style.opacity = '0';

  // Cleanup after animation
  setTimeout(function() {
    overlay.remove();
  }, 500);
}
```

---

## 7. Database Schema

### 7.1 New Tables

```sql
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
CREATE INDEX idx_notifications_unread ON notifications(agency_id) WHERE read = FALSE;
```

### 7.2 Alter Existing Tables

```sql
-- Add photo_count to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0;
```

### 7.3 Agency Settings Schema Update

The `agencies.settings` JSONB column gains a new `photo_uploads` key:

```typescript
interface AgencySettings {
  // ... existing fields
  photo_uploads?: PhotoUploadSettings;
}

interface PhotoUploadSettings {
  enabled: boolean;                      // Default: true
  allow_text_positioning: boolean;       // Default: false (backlog)
  notify_on_upload: boolean;             // Default: true
  notification_method: 'in_app' | 'webhook';  // Default: 'in_app'
  webhook_url?: string;
}
```

### 7.4 RLS Policies

```sql
-- customer_photos
ALTER TABLE customer_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies manage own photos" ON customer_photos
  FOR ALL USING (agency_id IN (
    SELECT id FROM agencies WHERE clerk_user_id = auth.jwt()->>'sub'
  ));

-- Public insert (validated by API, not direct insert)
CREATE POLICY "Service role can insert photos" ON customer_photos
  FOR INSERT WITH CHECK (true);

-- notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies see own notifications" ON notifications
  FOR ALL USING (agency_id IN (
    SELECT id FROM agencies WHERE clerk_user_id = auth.jwt()->>'sub'
  ));
```

---

## 8. Rate Limiting

### 8.1 Strategy

Use a simple in-memory store (or Redis if available) with key pattern:
```
upload:{agency_id}:{location_id}
```

TTL: 60 seconds

### 8.2 Simple Implementation (No Redis)

```typescript
// lib/rate-limit.ts
const rateLimitStore = new Map<string, number>();

export function isRateLimited(key: string, windowSeconds: number): boolean {
  const now = Date.now();
  const lastRequest = rateLimitStore.get(key);

  if (lastRequest && now - lastRequest < windowSeconds * 1000) {
    return true;
  }

  return false;
}

export function setRateLimit(key: string): void {
  rateLimitStore.set(key, Date.now());

  // Cleanup old entries periodically
  if (rateLimitStore.size > 10000) {
    const cutoff = Date.now() - 60000;
    for (const [k, v] of rateLimitStore) {
      if (v < cutoff) rateLimitStore.delete(k);
    }
  }
}
```

---

## 9. Integration Points

### 9.1 Tour Step → Upload Modal

When a tour step has `button_action: 'upload'`:

```javascript
// In embed.js tour handling
function handleStepButtonClick(step, action) {
  if (action === 'upload') {
    // Mark the button as trigger for genie animation
    var btn = document.querySelector('.driver-popover-next-btn');
    if (btn) btn.setAttribute('data-at-upload-trigger', 'true');

    // Open upload modal
    openUploadModal();

    // Don't advance tour - modal handles completion
    return false;
  }

  // Normal actions...
}
```

### 9.2 Upload Success → Tour Advance

After successful upload and genie animation:

```javascript
function onUploadComplete() {
  // If tour is active, advance to next step
  if (window.__atDriverInstance) {
    window.__atDriverInstance.moveNext();
  }
}
```

---

## 10. Error Handling

### 10.1 Client-Side Errors

| Error | User Message | Recovery |
|-------|--------------|----------|
| File too large | "File must be under 5MB" | Remove file, try smaller |
| Wrong file type | "Only JPEG, PNG, WebP allowed" | Remove file, try different |
| Network error | "Upload failed. Please try again." | Show retry button |
| Rate limited | "Please wait a moment..." | Disable submit, countdown |

### 10.2 Server-Side Errors

| Error | Response | Log Level |
|-------|----------|-----------|
| Invalid token | 401 | warn |
| Uploads disabled | 403 | info |
| Rate limited | 429 | info |
| Blob upload failed | 500 | error |
| DB insert failed | 500 | error |

---

## 11. Testing Checklist

### 11.1 Upload Flow
- [ ] Modal opens from tour step button
- [ ] Business name field auto-focuses
- [ ] Drag-drop adds photos to list
- [ ] Click-to-browse works
- [ ] Photo previews display correctly
- [ ] Default naming uses business name
- [ ] Suggestion buttons populate name field
- [ ] Can add up to 5 photos
- [ ] "Add Another" hidden when at 5 photos
- [ ] Submit disabled until business name + 1 photo
- [ ] Photos upload successfully
- [ ] Success state shows checkmark
- [ ] Genie animation plays
- [ ] Modal closes after animation

### 11.2 Customer Handling
- [ ] Existing customer found by location ID
- [ ] New customer created with business name
- [ ] Photo count incremented

### 11.3 Notifications
- [ ] In-app notification created
- [ ] Webhook sent if configured
- [ ] No notification if disabled in settings

### 11.4 Error Handling
- [ ] Rejects files over 5MB
- [ ] Rejects non-image files
- [ ] Shows rate limit message
- [ ] Retry button on network error

### 11.5 Settings
- [ ] "Allow uploads" toggle hides upload button in tours
- [ ] "Notify on upload" toggle controls notifications
- [ ] Webhook URL field appears when method is webhook

---

## 12. Files Summary

### New Files
| File | Purpose |
|------|---------|
| `app/api/photos/upload/route.ts` | Photo upload API |
| `app/api/notifications/route.ts` | Notifications CRUD |
| `app/api/notifications/[id]/route.ts` | Single notification update |
| `app/api/notifications/mark-all-read/route.ts` | Bulk mark read |
| `lib/rate-limit.ts` | Rate limiting utility |
| `components/dashboard/notification-bell.tsx` | Bell icon + dropdown |
| `app/(dashboard)/settings/_components/photo-upload-settings.tsx` | Settings card |

### Modified Files
| File | Changes |
|------|---------|
| `proxy.ts` | Add `/api/photos(.*)` and `/api/notifications(.*)` |
| `types/database.ts` | Add `CustomerPhoto`, `Notification`, `PhotoUploadSettings` |
| `app/embed.js/route.ts` | Add modal HTML/CSS/JS, genie animation |
| `app/(dashboard)/layout.tsx` | Add NotificationBell to header |
| `app/(dashboard)/settings/page.tsx` | Add PhotoUploadSettings card |
| `app/(dashboard)/customers/[id]/page.tsx` | Add photo gallery section |

---

*Technical spec complete. Ready for implementation.*
