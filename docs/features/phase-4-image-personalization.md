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

### NiftyImages Feature Comparison

| Feature | NiftyImages | Agency Toolkit (MVP) | Agency Toolkit (Future) |
|---------|-------------|---------------------|------------------------|
| Upload base image | Yes | Yes | Yes |
| Position text via drag | Yes | Yes | Yes |
| Font customization | Yes | Yes | Yes |
| Default/fallback text | Yes | Yes | Yes |
| Multiple text layers | Yes (via PSD) | Single layer | Multiple layers |
| Templates gallery | Yes (100+) | 3-5 starter | User-created library |
| Render count analytics | Yes | Yes | Yes |
| Countdown timers | Yes | No | Maybe |
| Live social feeds | Yes | No | No |
| Data source images | Yes | No | Maybe |

**MVP Focus:** Core personalization (single text layer, drag-to-position, font styling, merge tag support)

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

#### Acceptance Criteria
- [ ] Templates load and display in grid
- [ ] Pro plan check (show upgrade prompt if not Pro)
- [ ] Can create new template (opens dialog)
- [ ] Can delete template (with confirmation)
- [ ] Can duplicate template
- [ ] Empty state with CTA
- [ ] Search/filter by name (if >10 templates)

---

### Feature 36: Image Upload to R2

**Priority:** High | **Estimate:** 2-3 hours

Upload base images to Cloudflare R2 storage.

#### Technical Requirements
- **Storage:** Cloudflare R2 (S3-compatible)
- **File types:** PNG, JPG, JPEG, WebP
- **Max size:** 5MB
- **Folder structure:** `{agency_id}/{timestamp}-{filename}`

#### API Route

```typescript
// app/api/images/upload/route.ts
POST /api/images/upload
Content-Type: multipart/form-data
Body: { file: File }

Response: { url: string, width: number, height: number }
```

#### Implementation Notes
- Use `@aws-sdk/client-s3` for R2 (S3-compatible)
- Extract image dimensions using `sharp` or image-size package
- Generate unique filename to prevent collisions
- Return public URL for CDN access

#### Environment Variables
```env
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=agency-toolkit-images
R2_PUBLIC_URL=https://images.agencytoolkit.com
```

#### Acceptance Criteria
- [ ] Can upload PNG, JPG, WebP files
- [ ] Invalid file types rejected with error
- [ ] Files over 5MB rejected
- [ ] Image dimensions extracted and returned
- [ ] Public URL works and displays image
- [ ] Agency isolation (files in agency-specific folder)

---

### Feature 37: Image Editor - Canvas

**Priority:** High | **Estimate:** 4-5 hours

Visual editor for positioning and styling text on images.

#### UI Location
- **Route:** `/images/[id]`
- Opens when clicking a template card

#### Layout (3-Panel)

```
┌──────────────────────────────────────────────────────────────────┐
│ ← Back to Templates    Template Name             [Save] [Preview]│
├────────────────┬─────────────────────────────────┬───────────────┤
│                │                                 │               │
│   CANVAS       │         BASE IMAGE              │   PROPERTIES  │
│   CONTROLS     │         + TEXT OVERLAY          │   PANEL       │
│                │         (Draggable)             │               │
│   - Upload     │                                 │   Font        │
│   - Sample     │         ┌─────────────┐         │   Size        │
│     Names      │         │ Hello Sarah │         │   Color       │
│                │         └─────────────┘         │   Style       │
│                │                                 │   Position    │
│                │                                 │   Fallback    │
│                │                                 │               │
└────────────────┴─────────────────────────────────┴───────────────┘
```

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
  - Current image thumbnail
  - "Replace image" option

- **Sample Names**
  - List of test names to preview
  - Default: "Sarah", "John", "Alex", "Your Name"
  - "Custom name" input field
  - Click name to preview on canvas

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
│ Direct Link (for testing):                                       │
│ ┌──────────────────────────────────────────────────────────┬──┐  │
│ │ https://toolkit.../api/og/abc123?name=Sarah              │📋│  │
│ └──────────────────────────────────────────────────────────┴──┘  │
│                                                                  │
│ GHL Email/SMS (with merge tag):                                  │
│ ┌──────────────────────────────────────────────────────────┬──┐  │
│ │ https://toolkit.../api/og/abc123?name={{contact.first_...│📋│  │
│ └──────────────────────────────────────────────────────────┴──┘  │
│                                                                  │
│ HTML Image Tag:                                                  │
│ ┌──────────────────────────────────────────────────────────┬──┐  │
│ │ <img src="https://toolkit.../api/og/abc123?name={{cont...│📋│  │
│ └──────────────────────────────────────────────────────────┴──┘  │
│                                                                  │
│ 📖 How to Use in GHL Workflows                          [Expand] │
│ └─ Step-by-step instructions for email/SMS workflows             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### GHL Merge Tags Reference
```
{{contact.first_name}}      - First name
{{contact.last_name}}       - Last name
{{contact.full_name}}       - Full name
{{contact.email}}           - Email
{{contact.company_name}}    - Company
{{contact.city}}            - City
{{custom_values.xxx}}       - Custom fields
```

#### Usage Instructions (Accordion)

**For GHL Emails:**
1. In your email builder, add an Image block
2. Click "Source" and paste the GHL URL
3. The image will personalize for each recipient

**For GHL SMS:**
1. In your SMS message, paste the URL directly
2. Carriers will display it as a preview image

**For Landing Pages:**
1. Use the HTML tag in a custom code block
2. Pass the name via URL parameter if available

**For Workflows:**
1. Use in any action that supports images
2. The merge tag resolves at send time

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
# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=agency-toolkit-images
R2_PUBLIC_URL=https://images.agencytoolkit.com

# Or use Vercel Blob (simpler alternative)
BLOB_READ_WRITE_TOKEN=
```

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

---

*Document created: 2026-01-19*
*Based on: [NiftyImages](https://niftyimages.com/PersonalizedImages)*
