# Feature 38: Image Generation API

**Priority:** High | **Estimate:** 3-4 hours
**Status:** Not Started
**Dependencies:** Feature 37 (Image Editor - Canvas) - COMPLETE

---

## Overview

Generate personalized images on-the-fly using `@vercel/og`. This API endpoint takes a template ID and name parameter, fetches the template configuration, and renders a PNG image with the personalized text overlay.

### What We're Building

An Edge Function that generates personalized images at runtime:

```
GET /api/og/[templateId]?name=Sarah
→ Returns PNG image with "Hi Sarah!" overlaid on the team photo
```

### Why It Matters

- **Zero pre-generation:** Images are created on demand, not stored
- **Infinitely scalable:** Works for any contact name without storage costs
- **URL-based:** Compatible with any system that can load an image URL
- **GHL-native:** Works with `{{contact.first_name}}` merge tags

---

## Technical Specification

### API Endpoint

```
GET /api/og/[templateId]?name={name}
```

**Route File:** `app/api/og/[templateId]/route.ts`

### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `name` | No | The name to display. Falls back to template's `fallback` value if empty |

### Response

- **Content-Type:** `image/png`
- **Cache-Control:** `public, max-age=86400, s-maxage=86400` (24 hours)
- **Status Codes:**
  - `200` - Success, returns PNG image
  - `404` - Template not found
  - `500` - Rendering error

---

## Implementation Details

### Runtime Configuration

```typescript
// app/api/og/[templateId]/route.ts
export const runtime = 'edge';
```

Using Edge Runtime for:
- Faster cold starts
- Global distribution (CDN)
- Lower latency for image generation

### Template Fetching

```typescript
// Fetch template from database
const template = await fetchTemplate(templateId);

if (!template) {
  return new Response('Not found', { status: 404 });
}
```

**Note:** Must use edge-compatible Supabase client. The admin client may not work on Edge - need to verify or use REST API directly.

### Text Configuration from Database

The `text_config` JSONB column contains all styling information:

```typescript
interface TextConfig {
  // Position (percentage of image)
  x: number;       // e.g., 30 = 30% from left
  y: number;       // e.g., 80 = 80% from top
  width?: number;  // Box width in percentage
  height?: number; // Box height in percentage

  // Typography
  font: string;              // e.g., "Poppins"
  size: number;              // Base font size in pixels
  font_weight?: string;      // "normal", "bold", "700"
  text_align?: string;       // "left", "center", "right"
  text_transform?: string;   // "none", "uppercase"
  letter_spacing?: number;   // Pixels

  // Colors
  color: string;              // Text color hex, e.g., "#FFFFFF"
  background_color: string | null; // Box background, null = transparent
  padding?: number;           // Box padding in pixels

  // Content
  fallback: string;  // Default if no name provided
  prefix?: string;   // e.g., "Hi "
  suffix?: string;   // e.g., "!"
}
```

### Display Text Construction

```typescript
const rawName = searchParams.get('name')?.trim();
const displayName = rawName || template.text_config.fallback;
const displayText = `${template.text_config.prefix || ''}${displayName}${template.text_config.suffix || ''}`;
```

### Font Loading (Google Fonts)

```typescript
async function loadGoogleFont(
  fontName: string,
  weight: number = 700
): Promise<ArrayBuffer> {
  // Fetch CSS from Google Fonts API
  const API = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@${weight}`;

  const css = await fetch(API, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  }).then((res) => res.text());

  // Extract font URL from CSS
  const fontUrl = css.match(/src: url\((.+?)\) format\('(woff2|woff)'\)/)?.[1];

  if (!fontUrl) {
    throw new Error(`Font ${fontName} not found`);
  }

  // Fetch font file
  return fetch(fontUrl).then((res) => res.arrayBuffer());
}
```

### Auto-Shrink Text Logic

The editor already calculates this, but we need to replicate for @vercel/og:

```typescript
function calculateFontSize(
  baseSize: number,
  boxWidth: number,        // percentage
  imageWidth: number,      // pixels
  textLength: number
): number {
  // Convert box width to pixels
  const boxWidthPx = (boxWidth / 100) * imageWidth;

  // Estimate text width (rough: 0.6 × fontSize per character)
  const estimatedTextWidth = textLength * (baseSize * 0.6);

  // If text is too wide, shrink proportionally
  if (estimatedTextWidth > boxWidthPx) {
    const shrinkRatio = boxWidthPx / estimatedTextWidth;
    return Math.max(16, Math.floor(baseSize * shrinkRatio)); // Min 16px
  }

  return baseSize;
}
```

### Image Generation with @vercel/og

```typescript
import { ImageResponse } from '@vercel/og';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || '';

  // 1. Fetch template
  const template = await fetchTemplate(templateId);
  if (!template) {
    return new Response('Not found', { status: 404 });
  }

  const config = template.text_config;

  // 2. Build display text
  const displayName = name.trim() || config.fallback;
  const displayText = `${config.prefix || ''}${displayName}${config.suffix || ''}`;

  // 3. Load font
  let fontData: ArrayBuffer;
  try {
    const weight = config.font_weight === 'bold' ? 700 :
                   parseInt(config.font_weight || '700') || 700;
    fontData = await loadGoogleFont(config.font, weight);
  } catch {
    // Fallback to Inter if font load fails
    fontData = await loadGoogleFont('Inter', 700);
  }

  // 4. Calculate responsive values
  const fontSize = calculateFontSize(
    config.size,
    config.width || 40,
    template.base_image_width,
    displayText.length
  );

  // Convert percentages to pixels
  const boxLeft = (config.x / 100) * template.base_image_width;
  const boxTop = (config.y / 100) * template.base_image_height;
  const boxWidth = ((config.width || 40) / 100) * template.base_image_width;
  const boxHeight = ((config.height || 10) / 100) * template.base_image_height;

  // 5. Increment render count (fire and forget)
  incrementRenderCount(template.id).catch(() => {});

  // 6. Generate image
  return new ImageResponse(
    (
      <div
        style={{
          width: template.base_image_width,
          height: template.base_image_height,
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* Base Image */}
        <img
          src={template.base_image_url}
          width={template.base_image_width}
          height={template.base_image_height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            objectFit: 'cover',
          }}
        />

        {/* Text Box */}
        <div
          style={{
            position: 'absolute',
            left: boxLeft,
            top: boxTop,
            width: boxWidth,
            height: boxHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: config.text_align === 'left' ? 'flex-start' :
                           config.text_align === 'right' ? 'flex-end' : 'center',
            backgroundColor: config.background_color || 'transparent',
            borderRadius: config.background_color ? (config.padding || 8) / 2 : 0,
            padding: config.background_color ? config.padding || 8 : 0,
            boxShadow: config.background_color ? '0 2px 8px rgba(0,0,0,0.15)' : undefined,
          }}
        >
          <span
            style={{
              fontFamily: config.font,
              fontSize: fontSize,
              fontWeight: config.font_weight || 'bold',
              color: config.color,
              textTransform: config.text_transform as any || 'none',
              letterSpacing: config.letter_spacing || 0,
              textShadow: !config.background_color ? '0 2px 4px rgba(0,0,0,0.5)' : undefined,
              whiteSpace: 'nowrap',
            }}
          >
            {displayText}
          </span>
        </div>
      </div>
    ),
    {
      width: template.base_image_width,
      height: template.base_image_height,
      fonts: [
        {
          name: config.font,
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    }
  );
}
```

---

## Database Operations

### Fetch Template

```typescript
async function fetchTemplate(templateId: string): Promise<ImageTemplate | null> {
  // Use Supabase REST API for Edge compatibility
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/image_templates?id=eq.${templateId}&select=*`,
    {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY!}`,
      },
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  return data[0] || null;
}
```

### Increment Render Count

```typescript
async function incrementRenderCount(templateId: string): Promise<void> {
  // Fire and forget - don't block image response
  await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/increment_render_count`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      body: JSON.stringify({ template_id: templateId }),
    }
  );
}
```

**Database Function (if not exists):**

```sql
CREATE OR REPLACE FUNCTION increment_render_count(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE image_templates
  SET
    render_count = render_count + 1,
    last_rendered_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Supported Fonts

Based on @vercel/og compatibility and what's configured in the editor:

```typescript
const SUPPORTED_FONTS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Playfair Display',
  'Oswald',
];
```

---

## Error Handling

| Scenario | Response |
|----------|----------|
| Template not found | 404 with "Not found" message |
| Invalid template ID format | 404 |
| Font load failure | Use Inter as fallback |
| Image URL unreachable | 500 with error message |
| Database error | 500 with generic error |

### Error Response Format

```typescript
// For debugging (development only)
if (process.env.NODE_ENV === 'development') {
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Production - generic error
return new Response('Image generation failed', { status: 500 });
```

---

## Caching Strategy

### Edge Caching (Vercel)

```typescript
headers: {
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  'CDN-Cache-Control': 'public, max-age=86400',
}
```

- **24-hour cache** at CDN edge
- **Cache key:** Full URL including all query params
- Same name + same template = same cached image

### Cache Invalidation

Cache busting options:
1. Template update → Add `?v={timestamp}` parameter
2. Manual purge via Vercel dashboard
3. Wait 24 hours for natural expiration

---

## Testing Checklist

### Functional Tests

- [ ] Returns PNG for valid template ID
- [ ] Uses fallback text when no name provided
- [ ] Applies font family correctly
- [ ] Applies font size and auto-shrinks for long names
- [ ] Applies font weight (bold vs normal)
- [ ] Applies text color
- [ ] Applies background color when set
- [ ] Applies padding when background set
- [ ] Applies text shadow when no background
- [ ] Prefix/suffix render correctly ("Hi Sarah!")
- [ ] Text is centered in box (horizontally and vertically)
- [ ] Returns 404 for non-existent template
- [ ] Handles special characters in names (José, O'Connor)
- [ ] Handles URL-encoded names (%20 for space)

### Performance Tests

- [ ] Cold start < 500ms
- [ ] Warm response < 200ms
- [ ] Large images (1200x630) render < 1s
- [ ] Cache headers present and correct

### Edge Cases

- [ ] Very long names (Krishnamurthy, Bartholomew)
- [ ] Single character names (A, X)
- [ ] Names with emojis (if supported)
- [ ] Empty name → uses fallback
- [ ] Whitespace-only name → uses fallback

---

## Files to Create

| File | Purpose |
|------|---------|
| `app/api/og/[templateId]/route.ts` | Main Edge Function |
| `lib/og/fonts.ts` | Font loading utilities |
| `lib/og/template.ts` | Template fetching for Edge |

---

## Environment Variables Required

```env
# Already configured
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # For increment_render_count
```

---

## Migration Required

Add database function if not exists:

```sql
-- Migration: add_increment_render_count_function
CREATE OR REPLACE FUNCTION increment_render_count(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE image_templates
  SET
    render_count = render_count + 1,
    last_rendered_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Known Limitations

### @vercel/og Constraints

1. **CSS Subset:** Only flexbox layout, no grid
2. **No animations:** Static images only
3. **Font loading:** Must fetch from Google Fonts or embed
4. **Max size:** Recommended 1200x630, can go larger but slower
5. **No opacity on parent:** Use rgba() colors instead

### Image Constraints

1. **External images:** Must be publicly accessible (no auth)
2. **CORS:** Image URLs must allow cross-origin
3. **Size:** Large source images increase render time

---

## Future Enhancements

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| Multiple text layers | Support for 2+ text overlays | Medium |
| A/B serving | Single URL serves random variant | Medium |
| Dynamic placeholders | Support `{{city}}`, `{{company}}` | Low |
| Image transforms | Apply crop/flip from text_config | Medium |

---

## Related Documentation

- [Phase 4 Image Personalization Spec](/docs/features/phase-4-image-personalization.md)
- [Feature 37: Image Editor](/docs/sessions/2026-01-21-phase4-image-editor-fixes.md)
- [@vercel/og Documentation](https://vercel.com/docs/functions/edge-functions/og-image-generation)

---

## Implementation Notes (2026-01-25)

### What Was Built

**File:** `app/api/og/[templateId]/route.tsx`

- Edge runtime (`export const runtime = 'edge'`)
- Fetches template via Supabase REST API (Edge-compatible)
- Google Fonts loading with in-memory cache
- Auto-shrink font calculation for long names
- Full text_config support (position, font, colors, prefix/suffix, background)
- Render count increment via RPC function
- 24-hour CDN caching headers

### Database Function Added

```sql
CREATE OR REPLACE FUNCTION increment_render_count(p_template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE image_templates
  SET render_count = render_count + 1, last_rendered_at = NOW()
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Known Issue (To Debug)

"Template not found" error when testing. Possible causes:
1. Template ID format issue
2. Supabase REST API authentication
3. Environment variable not available in Edge runtime

### Dependencies Added

```json
"@vercel/og": "^0.8.6"
```

---

*Created: 2026-01-25*
*Implementation: 2026-01-25 (needs debugging)*
