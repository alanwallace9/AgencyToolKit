# Phase 4: Image Personalization

> Dynamic personalized image generation for review request campaigns
>
> **Reference Product:** [NiftyImages](https://niftyimages.com/PersonalizedImages)
> **Primary Use Case:** Local business review requests with personalized team photos

---

## Overview

### What We're Building

A personalized image generation system for **review request campaigns**. Local businesses upload a photo of their team/technician, the agency positions a name overlay box, and generates a URL that renders unique images for each contact. When "Sarah" gets a review request, she sees the team photo with "Hi Sarah!" on it.

**Example URL:**
```
https://toolkit.example.com/api/og/abc123?name=Sarah
https://toolkit.example.com/api/og/abc123?name={{contact.first_name}}  // GHL resolves this
```

### Primary Use Case

```
Local plumber completes job for Sarah
  → Contact added to GHL
  → Workflow triggers after 15 min
  → Email/SMS sent with personalized image: "Hi Sarah! Thanks for choosing ABC Plumbing"
  → Sarah sees image of the actual technician who serviced her
  → Higher response rate on review request
```

### Why It Matters

- **Higher response rates:** Personalized images with the actual tech's face increase trust
- **Professional appearance:** Makes small local businesses look polished
- **Seasonal flexibility:** Christmas photos, 4th of July themes, A/B testing
- **Per-technician images:** Plumber with 5 techs can have 5 different images
- **Works everywhere:** URL-based, compatible with any GHL workflow

---

## The Complete Workflow

### How It Actually Works

```
┌─────────────────────────────────────────────────────────────────────┐
│ SETUP PHASE (Agency + Sub-Account)                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Sub-account user (Bill's Plumbing) uploads team photo           │
│     → Via our onboarding tour: "Upload your team photo"             │
│     → Photo goes to Agency Toolkit (R2 storage)                     │
│                                                                     │
│  2. 🔔 NOTIFICATION sent to agency owner                            │
│     → "Bill's Plumbing just uploaded their team photo!"             │
│     → Via email (Resend) or Slack                                   │
│     → Link to position the text box                                 │
│                                                                     │
│  3. Agency (or VA) hops into Agency Toolkit                         │
│     → Opens Bill's Plumbing image                                   │
│     → Drags/resizes the name box to good position                   │
│     → Copies the magic URL                                          │
│                                                                     │
│  4. Agency pastes URL into Bill's GHL workflow                      │
│     → Review request workflow now has personalized image            │
│     → Bill's Plumbing can be sending review requests in <30 min     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ RUNTIME (Every Review Request)                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Bill's Plumbing completes job for "Sarah"                       │
│  2. Sarah added as contact in GHL                                   │
│  3. Workflow triggers (15 min delay)                                │
│  4. GHL resolves: {{contact.first_name}} → "Sarah"                  │
│  5. Email/SMS sent with URL: .../api/og/abc123?name=Sarah           │
│  6. Sarah opens email → image loads with "Hi Sarah!"                │
│  7. Sarah sees Bill's actual team → clicks to leave review          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Insight: The URL Contains the Merge Tag

The agency copies this URL (with the literal merge tag text):
```
https://toolkit.../api/og/abc123?name={{contact.first_name}}
```

GHL resolves the merge tag **at send time**. We just receive `?name=Sarah` and render it. No API integration needed - it's completely decoupled.

---

## Multiple Images Per Sub-Account

Agencies will have **multiple images** per sub-account:

| Scenario | Example |
|----------|---------|
| **Per-technician** | Plumber with 5 techs, each has their own photo |
| **Seasonal** | Christmas photo, 4th of July, Thanksgiving |
| **A/B testing** | Van photo vs family-with-dog photo |
| **Service-specific** | HVAC team vs Plumbing team |

**Database implication:** `image_templates` has `customer_id` (optional) to associate images with specific sub-accounts.

---

## NiftyImages Feature Comparison

| Feature | NiftyImages | Agency Toolkit (MVP) | Agency Toolkit (Future) |
|---------|-------------|---------------------|------------------------|
| Upload base image | Yes | Yes | Yes |
| Paste URL to fetch | ? | Yes | Yes |
| Image cropping | ? | Yes | Yes |
| Position text via drag | Yes | Yes | Yes |
| Resize text box (Canva-style) | Yes | Yes | Yes |
| Font customization | Yes | Yes | Yes |
| Default/fallback text | Yes | Yes | Yes |
| Multiple text layers | Yes (via PSD) | Single layer | Multiple layers |
| Agency notification on upload | No | Yes | Yes |
| Render count analytics | Yes | Yes | Yes |
| Countdown timers | Yes | No | Maybe |

**MVP Focus:** Core personalization for review requests (single text layer, drag-to-position, resize, crop, font styling)

---

## Database Schema

The `image_templates` table already exists. Here's the current schema:

```sql
CREATE TABLE image_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,

  -- Image source
  base_image_url TEXT NOT NULL,
  base_image_width INTEGER NOT NULL,
  base_image_height INTEGER NOT NULL,

  -- Text configuration
  text_config JSONB NOT NULL DEFAULT '{
    "x": 50,
    "y": 50,
    "font": "Poppins",
    "size": 32,
    "color": "#FFFFFF",
    "background_color": null,
    "fallback": "Friend"
  }'::jsonb,

  -- Usage stats
  render_count INTEGER NOT NULL DEFAULT 0,
  last_rendered_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Schema Enhancement (Recommended)

```sql
-- Add more text styling options to text_config:
{
  "x": 50,                    // X position (pixels from left)
  "y": 50,                    // Y position (pixels from top)
  "font": "Poppins",          // Google Font name
  "size": 32,                 // Font size in pixels
  "color": "#FFFFFF",         // Text color (hex)
  "background_color": null,   // Optional background behind text
  "fallback": "Friend",       // Default if no name provided

  -- NEW: Additional styling options
  "font_weight": "bold",      // normal, bold, 100-900
  "text_align": "left",       // left, center, right
  "text_transform": "none",   // none, uppercase, lowercase, capitalize
  "letter_spacing": 0,        // Letter spacing in pixels
  "line_height": 1.2,         // Line height multiplier
  "max_width": null,          // Max width before text wraps (pixels)
  "padding": 8                // Padding if background_color set
}
```

---

## Feature Breakdown

### Feature 35: Image Templates List

**Priority:** High | **Estimate:** 2-3 hours

Display and manage personalized image templates.

#### UI Location
- **Route:** `/images`
- **Navigation:** Pro dropdown → Images

#### Components

```
app/(dashboard)/images/
├── page.tsx                    # Server component, fetches templates
├── _components/
│   ├── images-client.tsx       # Client wrapper with state
│   ├── template-card.tsx       # Card showing thumbnail, name, stats
│   ├── add-template-dialog.tsx # Create new template dialog
│   ├── delete-template-dialog.tsx
│   └── empty-state.tsx
└── _actions/
    └── image-actions.ts        # Server actions
```

#### Template Card Shows
- Thumbnail preview (actual image with sample text)
- Template name
- Render count (e.g., "1,234 renders")
- Last rendered date
- Actions: Edit, Duplicate, Delete

#### Customer Selection (Dropdown with Search)

When creating or viewing images, select which customer/sub-account:

```
┌─────────────────────────────────────────────────────────────┐
│  Customer: [🔍 Search customers...              ▼]          │
│            ┌─────────────────────────────────────┐          │
│            │ Bill's Plumbing                     │          │
│            │ Joe's HVAC                          │          │
│            │ ABC Electric                        │          │
│            │ Denver Dental                       │          │
│            │ ...                                 │          │
│            └─────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

- Dropdown with search/filter
- Start typing "plumb" → shows all plumbers
- Images are associated with specific customers
- Can also access from Customer page → Images tab

#### Acceptance Criteria
- [ ] Templates load and display in grid
- [ ] Pro plan check (show upgrade prompt if not Pro)
- [ ] Customer dropdown with search functionality
- [ ] Can create new template (opens dialog with customer selection)
- [ ] Can delete template (with confirmation)
- [ ] Can duplicate template ("Create for another tech")
- [ ] Empty state with CTA and "Welcome [Name]" demo
- [ ] Search/filter by name (if >10 templates)
- [ ] A/B testing selection UI (Best Buy style checkboxes)

---

### Feature 36: Image Upload & Processing

**Priority:** High | **Estimate:** 3-4 hours

Upload base images via file upload OR URL fetch, with cropping support.

#### Two Upload Methods

**Method A: Direct Upload**
- Drag & drop or file picker
- User has image on their computer (emailed to them, taken themselves)

**Method B: Paste URL**
- User pastes URL from GHL Media Storage or any public URL
- We fetch, validate, and store it on R2
- Saves the user from downloading then re-uploading

#### Technical Requirements
- **Storage:** Cloudflare R2 (S3-compatible)
- **File types:** PNG, JPG, JPEG, WebP
- **Max upload size:** 10MB (we'll resize down)
- **Output size:** Optimized for email (max 600px wide recommended)
- **Folder structure:** `{agency_id}/{customer_id}/{timestamp}-{filename}`

#### Image Processing Pipeline

```
User uploads/pastes URL
  → Validate file type
  → Fetch if URL
  → Store original in R2 (for re-cropping later)
  → Generate optimized version (resized for email)
  → Return both URLs + dimensions
```

#### API Routes

```typescript
// Direct upload
POST /api/images/upload
Content-Type: multipart/form-data
Body: { file: File, customer_id?: string }
Response: { original_url, optimized_url, width, height }

// Fetch from URL
POST /api/images/fetch
Body: { url: string, customer_id?: string }
Response: { original_url, optimized_url, width, height }
```

#### Image Cropping (In Editor - Feature 37)
- User can crop in the editor before positioning text
- Cropping happens client-side (canvas API) for preview
- On save, crop coordinates sent to server
- Server generates cropped version using Sharp

#### Environment Variables
```env
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=agency-toolkit-images
R2_PUBLIC_URL=https://images.agencytoolkit.com
```

#### Acceptance Criteria
- [ ] Can upload PNG, JPG, WebP files via drag & drop
- [ ] Can paste URL and fetch image
- [ ] Invalid file types rejected with helpful error
- [ ] Large images automatically resized for email
- [ ] Original stored for future re-cropping
- [ ] Public URL works and displays image
- [ ] Organized by agency/customer folder structure

---

### Feature 37: Image Editor - Canvas

**Priority:** High | **Estimate:** 5-6 hours

Visual editor for cropping images and positioning/resizing text overlays (Canva-style).

#### UI Location
- **Route:** `/images/[id]`
- Opens when clicking a template card or "Edit" from list

#### Layout (3-Panel)

```
┌──────────────────────────────────────────────────────────────────┐
│ ← Back to Images    "Bill's Team Photo"          [Save] [Preview]│
├────────────────┬─────────────────────────────────┬───────────────┤
│                │                                 │               │
│   LEFT PANEL   │         CANVAS AREA             │   RIGHT PANEL │
│                │                                 │               │
│   [Crop Image] │    ┌─────────────────────┐      │   TEXT BOX    │
│                │    │                     │      │   PROPERTIES  │
│   Upload New   │    │   [Team Photo]      │      │               │
│   or Paste URL │    │                     │      │   Box Color   │
│                │    │    ┌───────────┐    │      │   Font        │
│   ─────────────│    │    │Hi Sarah! ◢│    │      │   Size (auto) │
│                │    │    └───────────┘    │      │   Text Color  │
│   Sample Names │    │     ↑ drag + resize │      │   Padding     │
│   ○ Sarah      │    │                     │      │               │
│   ○ John       │    └─────────────────────┘      │   ─────────── │
│   ○ Michael    │                                 │               │
│   ○ Alexandra  │   [◢ = resize handle]           │   Fallback:   │
│   ○ Custom...  │                                 │   [Friend   ] │
│                │                                 │               │
└────────────────┴─────────────────────────────────┴───────────────┘
```

#### Contextual Toolbars (Canva-Style)

**No mode buttons.** The toolbar changes based on what's selected:

**Click on IMAGE (background):**
```
┌─────────────────────────────────────────────────────────┐
│  ✂️ Crop  │  ↔️ Flip H  │  ↕️ Flip V  │  🔄 Replace    │
└─────────────────────────────────────────────────────────┘
```

**Click on TEXT BOX:**
```
┌───────────────────────────────────────────────────────────────────────┐
│  [Poppins ▼]  │  - 32 +  │  B  │  [█ Box Color]  │  [A Text Color]  │
└───────────────────────────────────────────────────────────────────────┘
```

Just like Canva - select something, get the relevant tools.

#### Text Box Behavior

**Default Box Size:** ~200px wide × 50px tall
- Pre-sized to comfortably fit long names like "Bartholomew"
- User can resize by dragging corners

**Auto-Center (CRITICAL):**
- Text is ALWAYS centered horizontally AND vertically within the box
- This happens AFTER the name is merged
- "Bill" = centered, "Sarah" = centered, "Bartholomew" = centered
- No left-align weirdness, no whitespace hanging off one side

**Auto-Shrink (CRITICAL):**
- If name is too long for the box, font size shrinks automatically
- Text NEVER wraps to multiple lines
- Text NEVER overflows outside the box
- "Bill" might render at 32px, "Bartholomew" might render at 24px

```
┌─────────────────────────┐      ┌─────────────────────────┐
│         Bill            │      │      Bartholomew        │
│        (32px)           │      │         (24px)          │
└─────────────────────────┘      └─────────────────────────┘
       Same box size, different font sizes, both centered
```

#### Edit vs Preview Toggle

**Toggle above canvas (not a button, a toggle switch):**
```
[Edit ○───● Preview]    Name: [Sarah________] [🎲]
```

- **Edit mode:** Shows `{{first_name}}` in the box (for positioning)
- **Preview mode:** Shows actual name from the field (e.g., "Sarah")

**Slide Animation:**
- Click Preview → Edit canvas slides LEFT
- Preview canvas slides in from RIGHT
- Smooth 300ms transition

#### Crop Mode

Activated by clicking ✂️ Crop in image toolbar:
- Drag corners to select crop area
- Rule of thirds overlay (optional visual guide)
- "Apply Crop" / "Cancel" buttons
- Can re-crop anytime (we keep the original)
- "Revert to original" option if they mess up

#### Components

```
app/(dashboard)/images/[id]/
├── page.tsx                      # Server component
└── _components/
    ├── image-editor.tsx          # Main editor with DndContext
    ├── editor-canvas.tsx         # Canvas with image + draggable text
    ├── text-overlay.tsx          # The draggable text element
    ├── left-panel.tsx            # Upload area + sample names
    ├── properties-panel.tsx      # Text styling controls
    └── preview-modal.tsx         # Test with different names
```

#### Left Panel
- **Upload Section**
  - Drag & drop zone
  - "Choose file" button
  - OR paste URL field (from GHL Media Storage)
  - Current image thumbnail
  - "Replace image" option (keeps text position)

- **Sample Names**
  - List of test names to preview
  - Click name to preview on canvas
  - "Custom name" input field
  - **[🎲 Long name]** button - randomizes from long names list

#### Sample Names List (Diverse + International)

```typescript
const SAMPLE_NAMES = [
  // Short (Quick tests)
  "Bill", "Sarah", "John", "Alex", "Mike",

  // Medium
  "Michael", "Jessica", "Brandon", "Jennifer",

  // Long (Western)
  "Alexandra", "Christopher", "Bartholomew", "Stephanie", "Elizabeth",

  // Long (International)
  "Muhammad", "Krishnamurthy", "Aleksandr", "Ekaterina", "Oluwaseun",

  // Edge cases
  "Jean-Pierre", "Mary-Jane", "O'Connor", "José", "François",

  // 🥚 Easter Egg (hidden, appears rarely on 🎲 click)
  "Shaun",  // "Shaun Coming Atcha!" - GHL CEO reference
];

// Long name button picks from names with 10+ characters
const LONG_NAMES = SAMPLE_NAMES.filter(n => n.length >= 10);
```

**Easter Egg:** When clicking 🎲 randomizer, there's a 1-in-50 chance of showing "Shaun" with the text "Shaun Coming Atcha!" - a nod to GHL's CEO Shaun Clark and his famous catchphrase.

#### Properties Panel

| Setting | Control | Default |
|---------|---------|---------|
| Font Family | Dropdown (Google Fonts subset) | Poppins |
| Font Size | Slider (12-120px) | 32 |
| Font Weight | Dropdown (Normal, Bold, etc.) | Bold |
| Color | Color picker | #FFFFFF |
| Text Transform | Buttons (Aa, AA, aa) | None |
| Background | Toggle + Color picker | Off |
| Background Padding | Slider (0-32px) | 8 |
| Position X | Number input | - |
| Position Y | Number input | - |
| Fallback Text | Text input | "Friend" |

#### Font Options (Google Fonts - @vercel/og compatible)
```typescript
const SUPPORTED_FONTS = [
  { name: 'Inter', weights: [400, 500, 600, 700] },
  { name: 'Poppins', weights: [400, 500, 600, 700] },
  { name: 'Roboto', weights: [400, 500, 700] },
  { name: 'Open Sans', weights: [400, 600, 700] },
  { name: 'Lato', weights: [400, 700] },
  { name: 'Montserrat', weights: [400, 500, 600, 700] },
  { name: 'Playfair Display', weights: [400, 700] },
  { name: 'Oswald', weights: [400, 500, 700] },
];
```

#### Drag-and-Drop
- Use `@dnd-kit/core` for dragging text overlay
- Convert screen position to canvas position (handle scaling)
- Snap to grid option (optional enhancement)
- Bounds checking (keep text within image)

#### Acceptance Criteria
- [ ] Base image displays at correct aspect ratio
- [ ] Text overlay is draggable
- [ ] Position persists when dropped
- [ ] All text styling options work
- [ ] Sample names preview correctly
- [ ] Changes auto-save (debounced) or manual save button
- [ ] Preview modal shows image with different names

---

### Feature 38: Image Generation API

**Priority:** High | **Estimate:** 3-4 hours

Generate personalized images on-the-fly using @vercel/og.

#### API Endpoint

```
GET /api/og/[templateId]?name={name}&...other_params
```

#### Technical Stack
- **Runtime:** Vercel Edge Runtime
- **Library:** `@vercel/og` (ImageResponse)
- **Fonts:** Google Fonts loaded dynamically

#### Implementation

```typescript
// app/api/og/[templateId]/route.ts
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || '';

  // 1. Fetch template from database
  const template = await getTemplate(params.templateId);
  if (!template) {
    return new Response('Not found', { status: 404 });
  }

  // 2. Determine display name
  const displayName = name.trim() || template.text_config.fallback;

  // 3. Load font
  const font = await loadGoogleFont(template.text_config.font);

  // 4. Increment render count (fire and forget)
  incrementRenderCount(template.id);

  // 5. Generate image
  return new ImageResponse(
    <div
      style={{
        width: template.base_image_width,
        height: template.base_image_height,
        display: 'flex',
        position: 'relative',
        backgroundImage: `url(${template.base_image_url})`,
        backgroundSize: 'cover',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: template.text_config.x,
          top: template.text_config.y,
          fontSize: template.text_config.size,
          fontFamily: template.text_config.font,
          fontWeight: template.text_config.font_weight || 'bold',
          color: template.text_config.color,
          backgroundColor: template.text_config.background_color,
          padding: template.text_config.background_color
            ? template.text_config.padding || 8
            : 0,
          textTransform: template.text_config.text_transform || 'none',
        }}
      >
        {displayName}
      </span>
    </div>,
    {
      width: template.base_image_width,
      height: template.base_image_height,
      fonts: [{ name: template.text_config.font, data: font }],
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    }
  );
}
```

#### Caching Strategy
- **Edge caching:** 24 hours (images are deterministic based on URL)
- **Cache key:** Full URL including all params
- Different names = different cache entries

#### Error Handling
- Missing template → 404
- Invalid template ID → 404
- Missing name → Use fallback text
- Font load failure → Fallback to system font

#### Acceptance Criteria
- [ ] Returns valid PNG image
- [ ] Name parameter renders correctly
- [ ] Fallback text used when name missing
- [ ] Font styling matches editor preview
- [ ] Background color/padding applied correctly
- [ ] Cache headers set (24h)
- [ ] Render count increments in database
- [ ] Handles special characters in names
- [ ] Works with URL-encoded names

---

### Feature 39: Image URL Generator

**Priority:** High | **Estimate:** 2 hours

Display ready-to-use URLs with GHL merge tags.

#### UI Location
- Bottom section of the Image Editor page
- Also accessible from template card "Copy URL" action

#### URL Display Section

```
┌──────────────────────────────────────────────────────────────────┐
│ 📋 Ready-to-Use URLs                                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 🧪 Test Link (preview with sample name):                         │
│ ┌──────────────────────────────────────────────────────────┬──┐  │
│ │ https://toolkit.../api/og/abc123?name=Sarah              │📋│  │
│ └──────────────────────────────────────────────────────────┴──┘  │
│ [Open in new tab ↗]                                              │
│                                                                  │
│ 📧 For GHL Workflows (with merge tag):                           │
│ ┌──────────────────────────────────────────────────────────┬──┐  │
│ │ https://toolkit.../api/og/abc123?name={{contact.first_...│📋│  │
│ └──────────────────────────────────────────────────────────┴──┘  │
│                                                                  │
│ 🖼️ HTML Image Tag:                                               │
│ ┌──────────────────────────────────────────────────────────┬──┐  │
│ │ <img src="https://toolkit.../api/og/abc123?name={{cont...│📋│  │
│ └──────────────────────────────────────────────────────────┴──┘  │
│                                                                  │
│ ─────────────────────────────────────────────────────────────────│
│                                                                  │
│ 💡 PRO TIP: Use Trigger Links to Track Opens                     │
│                                                                  │
│ Wrap this URL in a GHL Trigger Link to track which contacts      │
│ opened the image, and whether it was via email or SMS.           │
│                                                                  │
│ 1. Go to Marketing → Trigger Links → Create                      │
│ 2. Paste the GHL workflow URL as the destination                 │
│ 3. Use the trigger link in your workflow instead                 │
│                                                                  │
│ ─────────────────────────────────────────────────────────────────│
│                                                                  │
│ 📖 Setup Instructions                                   [Expand] │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### GHL Merge Tags Reference
```
{{contact.first_name}}      - First name (most common)
{{contact.last_name}}       - Last name
{{contact.full_name}}       - Full name
{{contact.company_name}}    - Company
{{contact.city}}            - City
{{custom_values.xxx}}       - Custom fields
```

#### Usage Instructions (Accordion)

**For GHL Emails:**
1. In your email builder, add an Image block
2. Click "Source" and paste the GHL workflow URL
3. The image will personalize for each recipient

**For GHL SMS:**
1. In your SMS message, paste the URL directly
2. Most carriers will display it as a preview image

**For Review Request Workflows:**
1. Add the image URL to your review request email template
2. Set workflow trigger: "Contact Created" or "Appointment Completed"
3. Add delay (10-15 min recommended)
4. Test with a sample contact first

#### Acceptance Criteria
- [ ] Direct URL displayed and copyable
- [ ] GHL merge tag URL displayed and copyable
- [ ] HTML img tag displayed and copyable
- [ ] Copy buttons work with toast confirmation
- [ ] Instructions accordion with GHL-specific guidance
- [ ] Sample preview section (optional)

---

## User Stories

### Story 1: Agency Creates First Personalized Image
**As an** agency owner
**I want to** create a personalized image template
**So that** I can send personalized emails to my clients' contacts

**Acceptance:**
1. Navigate to Images page from Pro menu
2. Click "Create Template"
3. Enter template name
4. Upload base image
5. Drag text to desired position
6. Style text (font, size, color)
7. Set fallback text
8. Save template
9. Copy URL with merge tag
10. Paste in GHL email workflow

---

### Story 2: Testing Image Personalization
**As an** agency owner
**I want to** preview how my personalized image looks with different names
**So that** I can ensure it looks good before sending

**Acceptance:**
1. In image editor, see sample names in left panel
2. Click different names to preview on canvas
3. Enter custom name to test edge cases
4. Open Preview modal for full-size view
5. Test URL directly in browser

---

### Story 3: Tracking Image Performance
**As an** agency owner
**I want to** see how many times my images have been rendered
**So that** I can understand which templates are most used

**Acceptance:**
1. Template cards show render count
2. Template list can be sorted by renders
3. Last rendered date visible
4. (Future) Analytics dashboard with trends

---

## Technical Considerations

### @vercel/og Limitations
- Max image size: 1200x630 recommended (social preview size)
- Limited CSS support (flexbox works, grid doesn't)
- Custom fonts must be loaded as ArrayBuffer
- No animations or interactivity

### Font Loading
```typescript
async function loadGoogleFont(fontName: string, weight = 700) {
  const API = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@${weight}`;
  const css = await fetch(API).then(res => res.text());
  const fontUrl = css.match(/url\((.+?)\)/)?.[1];
  if (!fontUrl) throw new Error('Font not found');
  return fetch(fontUrl).then(res => res.arrayBuffer());
}
```

### Image Dimension Handling
- Store original dimensions in database
- Editor shows scaled preview (fit to viewport)
- API generates at original dimensions
- Consider supporting common sizes:
  - Email header: 600x200
  - Social card: 1200x630
  - Square: 1080x1080

---

## Out of Scope (MVP)

| Feature | Reason |
|---------|--------|
| Multiple text layers | Complexity - defer to v2 |
| PSD file support | Requires backend processing |
| Countdown timers | Different feature entirely |
| Live data sources | Requires integrations |
| Video personalization | Different tech stack |
| Image templates marketplace | Post-launch feature |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `@vercel/og` | Edge image generation |
| `@aws-sdk/client-s3` | R2 uploads |
| `sharp` | Image dimension extraction |
| `@dnd-kit/core` | Drag-and-drop in editor |

---

## Environment Variables

```env
# Vercel Blob (MVP - simpler setup)
BLOB_READ_WRITE_TOKEN=

# Cloudflare R2 (Future - if bandwidth costs grow)
# R2_ACCOUNT_ID=
# R2_ACCESS_KEY_ID=
# R2_SECRET_ACCESS_KEY=
# R2_BUCKET_NAME=agency-toolkit-images
# R2_PUBLIC_URL=https://images.agencytoolkit.com
```

### Storage Decision: Vercel Blob for MVP

| Factor | Vercel Blob | Cloudflare R2 |
|--------|-------------|---------------|
| Setup | 1 env var | 5 env vars + SDK |
| Cost at 50 agencies | ~$20/mo | ~$5/mo |
| Cost at 500 agencies | ~$940/mo | ~$10/mo |
| Migration effort | N/A | 2-4 hours |

**Decision:** Start with Vercel Blob. At 50 agencies, costs are negligible. If we hit 200+ agencies and bandwidth costs hurt, migrate to R2. The code abstraction layer makes this a config change.

---

## Implementation Order

| # | Feature | Dependencies | Notes |
|---|---------|--------------|-------|
| 1 | Feature 36: Image Upload | R2 setup | Foundation for everything |
| 2 | Feature 35: Templates List | Feature 36 | Need upload before list makes sense |
| 3 | Feature 37: Image Editor | Features 35, 36 | Core editing experience |
| 4 | Feature 38: Image API | Feature 37 | Generates the actual images |
| 5 | Feature 39: URL Generator | Feature 38 | Final UX for copying URLs |

---

## Success Metrics

- Template creation rate (templates per agency)
- Render volume (images generated per month)
- Feature adoption (% of Pro users who create templates)
- Time to first render (onboarding metric)
- Time from upload to live workflow (<30 min target)

---

## Agency Notification System

When a sub-account user uploads their team photo (via onboarding tour), notify the agency so they can quickly position the text box.

### Notification Options

| Channel | Package | Notes |
|---------|---------|-------|
| Email | Resend | Simple, reliable, free tier available |
| Slack | Slack Webhook | If agency prefers Slack |
| In-app | Our dashboard | Badge/notification bell |

### Notification Content

```
Subject: 📸 Bill's Plumbing uploaded their team photo!

Hey [Agency Name],

Bill's Plumbing just uploaded their team photo and is ready for
personalized review requests.

👉 Set up their image now: [Link to editor]

The faster you set this up, the sooner they can start getting reviews!

- Agency Toolkit
```

### Implementation

- Add `notification_preferences` to agency settings (email, Slack webhook URL)
- Trigger on image upload via tour completion or direct upload
- Rate limit: max 1 notification per customer per hour

---

## Quick Wins (UX Improvements) ⭐

These are the "wow, this guy gets it" features that make the product feel polished.

| Quick Win | Why It Delights | Effort | Priority |
|-----------|-----------------|--------|----------|
| **One-click test** | "Open in new tab" button to instantly see the image with a sample name - no copy/paste needed | Low | P0 |
| **Smart name preview** | Cycle through sample names on hover/auto-play so they see it working | Low | P0 |
| **Long name handling** | Show preview with "Alexandra" to demonstrate text scales properly | Low | P0 |
| **Copy confirmation toast** | "URL copied! Paste this in your GHL workflow." with checkmark animation | Low | P0 |
| **Visual crop guides** | Rule of thirds overlay when cropping to help non-designers | Low | P1 |
| **"Review request ready!"** | Success state after saving with confetti or celebration | Low | P1 |
| **Undo crop** | "Revert to original" button if they mess up the crop | Medium | P1 |
| **Image swap** | Quickly swap base image without recreating template (keep text position) | Medium | P1 |
| **Keyboard shortcuts** | Arrow keys to nudge text box, Cmd+S to save | Low | P2 |
| **Dark image detection** | If image is dark, suggest white text; if light, suggest dark text | Medium | P2 |
| **Name length warning** | "Heads up: 'Christopher' might be tight" if box is small | Medium | P2 |
| **Mobile preview toggle** | Show how it'll look on phone vs desktop email client | Medium | P2 |
| **Quick duplicate** | "Duplicate for another tech" button - copies settings, just change photo | Low | P1 |
| **Seasonal badge** | Tag templates as "Christmas 2026" etc for easy organization | Low | P2 |
| **Render count sparkline** | Tiny chart showing usage trend, not just number | Medium | P3 |

### P0 Quick Wins (Must Have for MVP)

1. **One-click test button** - Opens the image in a new tab with sample name. No friction.

2. **Live name preview** - As they drag the box, show it with "Sarah" (not `{{first_name}}`). Toggle to see merge tag syntax.

3. **Copy with context** - Toast says what to do next: "Copied! Now paste in your GHL email template."

4. **Long name stress test** - Sample names include "Alexandra" and "Christopher" so they see edge cases.

### P1 Quick Wins (Strong UX Polish)

5. **Quick duplicate** - "Create for another tech" copies everything except the image. Huge time saver for agencies with multiple technicians.

6. **Undo crop / Revert** - They messed up? One click to start over. Reduces anxiety.

7. **Image swap without losing work** - "Replace image" keeps text position, just swaps the photo.

8. **Celebration moment** - When they save, a brief "Ready to get reviews! 🎉" moment. Makes it feel like an accomplishment.

---

## Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| Storage: R2 vs Vercel Blob? | **R2** - more control, S3-compatible |
| Fonts: How many? | **8 Google Fonts** - mostly sans-serif, can add more later |
| Starter templates? | **No** - use position presets instead (9-point grid) |
| Image size constraints? | **Any size upload**, we resize for email (600px wide max) |
| Multiple images per agency? | **Yes** - per-tech, seasonal, A/B testing |
| Text box color? | **User choice** - default white, but can pick any |
| How to get URL into GHL? | **Manual copy/paste** - simple, no integration needed |
| Automation? | **Notification system** - alert agency when photo uploaded |
| Customer association UX? | **Both** - dropdown with search AND from customer page |
| Inactivity alert threshold? | **Per-customer** - set in customer settings |
| Mobile preview devices? | **iPhone, Pixel, Samsung Galaxy** |
| "Welcome Steve" demo? | **Real personalized image** - pull name from Clerk |

---

## A/B Testing System

### How It Works

Agencies can A/B test two images with a **single URL**. No need for two trigger links.

**Individual URLs still exist:** Each image ALSO has its own unique URL for non-A/B campaigns.

```
Image A (Van):    /api/og/abc111?name={{contact.first_name}}  ← standalone
Image B (Family): /api/og/abc222?name={{contact.first_name}}  ← standalone
A/B Test URL:     /api/og/ab/bills-plumbing?name={{...}}      ← serves both 50/50
```

### A/B Selection UI (Best Buy Style)

Like Best Buy's "Compare" feature - select items to compare:

```
Bill's Plumbing Images (3 images)

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ ☐ Select    │  │ ☑ Select    │  │ ☑ Select    │
│             │  │             │  │             │
│  [Van]      │  │  [Family]   │  │  [Xmas]     │
│             │  │             │  │             │
│  234 👁️     │  │  156 👁️     │  │  12 👁️      │
└─────────────┘  └─────────────┘  └─────────────┘

            ┌────────────────────────────┐
            │  2 images selected         │
            │  [Start A/B Test]          │
            └────────────────────────────┘
```

**Flow:**
1. Check boxes on 2 images to compare
2. Click "Start A/B Test"
3. System pairs them together
4. Shows the A/B comparison view with single URL

### A/B Setup Flow

```
SETUP:
1. Agency creates Image A (van photo) for Bill's Plumbing
2. Agency creates Image B (family photo) for Bill's Plumbing
3. Selects both (checkbox like Best Buy compare)
4. Clicks "Start A/B Test"
5. System generates shared A/B URL
6. Agency copies ONE URL that serves both 50/50

THE MAGIC URL:
/api/og/ab/{customer_slug}?name={{contact.first_name}}

OUR API (50/50 random serving):
1. Request comes in: /api/og/ab/bills-plumbing?name=Sarah
2. Randomly pick Image A or Image B (50/50)
3. Increment render count for whichever was served
4. Return that image

RESULT:
- Our side: ~equal renders (234 vs 230) - we're doing our job
- GHL side: Different click rates reveal the winner
- If van photo gets 70% of clicks, van photo wins
```

### A/B UI in Image List

```
Bill's Plumbing Images
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [A/B Testing: ON 🔘]                                       │
│                                                             │
│  ┌─────────┐     ┌─────────┐                               │
│  │   A     │ vs  │    B    │     A/B URL:                  │
│  │  Van    │     │ Family  │     [.../ab/bills] [📋 Copy]  │
│  │ 234 👁️  │     │ 230 👁️  │                               │
│  └─────────┘     └─────────┘                               │
│                                                             │
│  Serving: 50/50 • Total renders: 464                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema Addition

```sql
-- A/B test pairing
ALTER TABLE image_templates ADD COLUMN ab_pair_id UUID;
ALTER TABLE image_templates ADD COLUMN ab_variant CHAR(1); -- 'A' or 'B'

-- When A/B is enabled, both images share the same ab_pair_id
-- API uses ab_pair_id to find both variants and randomly serve one
```

---

## Position Presets (9-Point Grid)

Quick-start positioning instead of cloning from another customer:

```
┌─────────────────────────────────────────┐
│  Where should the name appear?          │
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐             │
│  │ TL  │  │ TC  │  │ TR  │             │
│  └─────┘  └─────┘  └─────┘             │
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐             │
│  │ ML  │  │ MC  │  │ MR  │             │
│  └─────┘  └─────┘  └─────┘             │
│                                         │
│  ┌─────┐  ┌─────┐  ┌─────┐             │
│  │ BL  │  │ BC  │  │ BR  │             │
│  └─────┘  └─────┘  └─────┘             │
│                                         │
│  Click to apply, then fine-tune         │
└─────────────────────────────────────────┘
```

Agency looks at photo → sees faces in center → clicks "BL" → name box appears bottom-left → fine-tune if needed.

---

## Copy URL Micro-Feedback

One-click copy with instant visual feedback:

```
BEFORE CLICK:
┌────────────────────────────────────────────────────┬────┐
│ https://toolkit.../api/og/abc123?name={{contact... │ 📋 │
└────────────────────────────────────────────────────┴────┘

AFTER CLICK (0.5s feedback):
┌────────────────────────────────────────────────────┬────┐
│ https://toolkit.../api/og/abc123?name={{contact... │ ✓  │ ← green
└────────────────────────────────────────────────────┴────┘
                                              Copied ✓
```

No selecting text, no Cmd+C. Just click the icon → green check → done.

---

## Preview Mode with Email Mockup

Toggle between Edit and Preview with slide animation:

```
[Edit ○───● Preview]    Name: [Sarah________] [🎲 Long name]

*Canvas slides left, preview slides in from right*

┌─────────────────────────────────────────────────────────────┐
│  [Desktop ●───○ Mobile]     Device: [iPhone 15 ▼]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     ┌─────────────────────────────────────────────┐        │
│     │ 📧 From: Bill's Plumbing                    │        │
│     │ Subject: Thanks for choosing us, Sarah!    │        │
│     │───────────────────────────────────────────│        │
│     │                                             │        │
│     │ Hi Sarah,                                   │        │
│     │                                             │        │
│     │ Thanks for letting us help you today!      │        │
│     │                                             │        │
│     │ ┌─────────────────────────────────────┐    │        │
│     │ │     [TEAM PHOTO]                    │    │        │
│     │ │        ┌──────────────┐             │    │        │
│     │ │        │  Hi Sarah!   │             │    │        │
│     │ │        └──────────────┘             │    │        │
│     │ └─────────────────────────────────────┘    │        │
│     │                                             │        │
│     │ Would you mind leaving us a quick review?  │        │
│     │                                             │        │
│     │ [⭐ Leave a Review]                         │        │
│     │                                             │        │
│     └─────────────────────────────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Device dropdown: iPhone 15, iPhone SE, Pixel 8, Samsung Galaxy
```

---

## Shareable Preview Link + Approval

Agency can share a preview with the sub-account owner:

```
┌─────────────────────────────────────────────────────────────┐
│  Share with Bill's Plumbing                                 │
│                                                             │
│  Preview link (no login required):                          │
│  ┌────────────────────────────────────────────────────┬──┐  │
│  │ https://toolkit.../preview/abc123?token=xyz...     │📋│  │
│  └────────────────────────────────────────────────────┴──┘  │
│                                                             │
│  [📧 Email to Bill]  [💬 Copy link]                         │
│                                                             │
│  When Bill views this, you'll see "Viewed ✓" here.         │
│  Bill can click "Looks great!" to approve.                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Approval Tracking Dashboard (Future)

Agencies need to see which sub-accounts have viewed/approved:

```
┌─────────────────────────────────────────────────────────────┐
│  Image Approvals                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Bill's Plumbing    Approved Jan 19    [View Image]      │
│  👁️ Joe's HVAC         Viewed Jan 18      [Resend]          │
│  ⏳ ABC Electric       Sent Jan 17        [Resend]          │
│  📸 New Customer       Not sent           [Send Preview]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

*This dashboard is a future enhancement - MVP tracks status per-image.*

---

## Send Test to Myself

One-click to send a test email to yourself:

```
┌─────────────────────────────────────────────────────────────┐
│  Test Your Image                                            │
│                                                             │
│  [📧 Send test to myself]                                   │
│                                                             │
│  Sends to: steve@agency.com (your login email)              │
│  Shows image with your name: "Hi Steve!"                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Uses Resend to send email
- Pulls agency owner's email from Clerk
- Pulls first name from Clerk for personalization
- Styled like a real review request email
- Instant verification that everything works

---

## "Welcome Steve" First-Load Experience

When agency first opens Images page, show a real personalized demo:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     📸 Personalized Review Images                           │
│                                                             │
│     ┌─────────────────────────────────────────────┐        │
│     │                                             │        │
│     │     [Demo team photo]                       │        │
│     │                                             │        │
│     │        ┌──────────────────┐                 │        │
│     │        │  Welcome Steve!  │  ← their name   │        │
│     │        └──────────────────┘                 │        │
│     │                                             │        │
│     └─────────────────────────────────────────────┘        │
│                                                             │
│     This is what your customers will see.                   │
│     Their name, right on your team photo.                   │
│                                                             │
│     [+ Create Your First Image]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Pull first name from Clerk → render real demo image → "Welcome Steve!"

---

## Inactivity Alerts

Notify agencies when a customer's image hasn't been rendered recently:

### Settings (Per-Customer)

```
┌─────────────────────────────────────────────────────────────┐
│  Bill's Plumbing - Image Settings                           │
│                                                             │
│  Inactivity alert after: [7 days ▼]                        │
│                                                             │
│  Options: 3 days, 7 days, 14 days, 30 days, Never          │
│                                                             │
│  Alert sent to: steve@agency.com                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Alert Content

```
Subject: ⚠️ Bill's Plumbing hasn't had any image renders in 7 days

Hey [Agency Name],

Bill's Plumbing's review request image hasn't been rendered
in 7 days. This might mean:

- Their workflow is paused
- They haven't had new customers
- Something is broken in GHL

👉 Check their workflow: [Link to GHL]
👉 View their image: [Link to editor]

- Agency Toolkit
```

---

## Critical Backlog Items

These are NOT in MVP but are critical next steps:

### CSV Upload for Customers

Agencies need a fast way to import sub-accounts:

```
┌─────────────────────────────────────────────────────────────┐
│  Import Customers                                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │        Drag & drop CSV file here                   │   │
│  │                                                     │   │
│  │        or [Browse files]                           │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Expected columns: name, email (optional), ghl_location_id  │
│                                                             │
│  💡 Export from GHL: Contacts → Export → Select fields      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Priority:** Critical for agencies with 20-50+ sub-accounts
**When:** Immediately after Phase 4 MVP

---

## Help Documentation Notes

Everything documented in this spec should be captured for the in-app help section:

- How A/B testing works (one URL, 50/50 serving)
- How to select images for A/B testing (Best Buy style)
- How to use trigger links for click tracking
- How to set up the GHL workflow
- What render counts mean vs click rates
- How to interpret A/B results
- Position presets explained
- Mobile vs desktop preview
- How to share preview link with sub-account owners
- How the approval flow works

---

## Final MVP Feature Summary

| Feature | Key Capabilities |
|---------|------------------|
| **35: Image List** | Customer dropdown with search, A/B toggle, render counts, grid view |
| **36: Upload** | Drag/drop OR paste URL, auto-resize, store original for re-crop |
| **37: Editor** | Contextual toolbars, 9-point position presets, crop mode, drag/resize text box, preview with email mockup |
| **38: API** | Auto-center, auto-shrink text, A/B serving (50/50), edge runtime |
| **39: URLs** | One-click copy with green check, shareable preview link, approval tracking, send test to self |

---

*Document created: 2026-01-19*
*Last updated: 2026-01-19*
*Based on: [NiftyImages](https://niftyimages.com/PersonalizedImages)*
*Planning session: Complete*
