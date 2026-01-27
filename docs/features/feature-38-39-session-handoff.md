# Feature 38/39 Session Handoff - Image Generation API

## Session Summary
Date: 2025-01-25 (Updated: Session 2)

### Status: ✅ WORKING

The image generation API is now functional using Sharp instead of @vercel/og.

### What Was Built
Features 38 (Image Generation API) and 39 (URL Generator) implementation using Sharp with Node.js runtime.

### Files Created/Modified
1. `app/api/images/[templateId]/route.tsx` - **WORKING** Sharp-based image generation
2. `app/(dashboard)/images/[id]/_components/url-generator.tsx` - URL display section
3. `app/(dashboard)/images/[id]/_components/copy-url-button.tsx` - Copy button component
4. `proxy.ts` - Updated public route from `/api/og` to `/api/images`
5. Various component updates to use `/api/images/` instead of `/api/og/`

---

## Issues RESOLVED (Session 2)

### Issue 1: Text Positioning ✅ FIXED
**Solution**: Replaced Satori/next-og with Sharp + SVG overlay
- Text now renders at exact x/y coordinates from template config
- SVG with embedded Google Font (base64) composited onto image

### Issue 2: File Size ✅ FIXED
**Before**: 2.8MB PNG
**After**: ~83KB JPEG
- Resized to max 800px width for email/mobile
- JPEG with mozjpeg compression at quality 80

### Issue 3: Format ✅ FIXED
**Before**: PNG only (ImageResponse limitation)
**After**: JPEG output with quality control

---

## Previous Issues (Session 1 - For Reference)

---

## Bugs Fixed During Session

### Bug 1: "Template not found" Error
**Cause**: Environment variable name mismatch
- Code looked for `SUPABASE_ANON_KEY`
- Actual env var was `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Fix**: Updated line 76 in route.tsx

### Bug 2: Font Loading Crash with woff2
**Cause**: Google Fonts returns woff2 for modern browsers, but Satori has issues with woff2 + large background images
**Fix**: Changed User-Agent to IE11 to get woff format instead:
```javascript
'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko'
```

### Bug 3: Font Regex Only Matched woff2
**Cause**: Regex only extracted woff2 URLs, but some fonts (Inter) return woff
**Fix**: Updated regex to try woff first, then woff2:
```javascript
let fontUrl = css.match(/src: url\((.+?)\) format\('woff'\)/)?.[1];
if (!fontUrl) {
  fontUrl = css.match(/src: url\((.+?)\) format\('woff2'\)/)?.[1];
}
```

---

## User Requirements (Restated)

1. **Text must be positioned** at user-configured x/y coordinates from the image editor
2. **Output should be JPEG** (~75-80KB) not PNG (2.8MB)
3. **Don't use Satori/next-og** if it has positioning limitations
4. **Reference District Tracker** - had image optimization in Supabase before storage

---

## Alternative Approaches to Explore

### Option A: Sharp Library (Server-Side)
Use Sharp for image compositing instead of Satori:
- Full control over positioning
- JPEG output with quality control
- Works in Node.js runtime (not Edge)
- Can composite text onto images with precise positioning

```javascript
import sharp from 'sharp';

// Pseudo-code approach
const image = sharp(baseImageBuffer)
  .composite([{
    input: textOverlayBuffer,
    left: pixelX,
    top: pixelY
  }])
  .jpeg({ quality: 80 })
  .toBuffer();
```

### Option B: Canvas API (Node.js)
Use node-canvas for drawing:
- Full canvas API for text positioning
- Custom font support
- JPEG/PNG output options

### Option C: Cloudinary/Imgix Transformation
Use a service that handles image transformations:
- URL-based text overlay
- Automatic optimization
- CDN delivery

### Option D: Pre-render at Upload Time
Generate all variants when image is uploaded:
- Store optimized versions in Supabase/R2
- Dynamic name insertion via URL params
- Fastest delivery (no runtime generation)

---

## District Tracker Reference
User mentioned image optimization in District Tracker project. Need to investigate:
- What library/approach was used?
- Was it Sharp, Supabase image transforms, or something else?
- How was optimization done before storage?

---

## Current State of Code

The `route.tsx` file has extensive debug code (debug=1 through debug=11). The working version:
- Generates images with custom fonts
- Uses `backgroundImage` CSS for base image
- Centers text (positioning broken)
- Outputs PNG (2.8MB)

**DO NOT COMMIT** - The current implementation doesn't meet requirements.

---

## Next Session Prompt

```
## Continue Feature 38/39 - Image Generation API

### Context
Read: docs/features/feature-38-39-session-handoff.md

### Current State
- Image generation partially working but with critical issues
- Using next/og which has Satori limitations
- Text positioning broken (centered instead of configurable)
- Output is PNG 2.8MB instead of JPEG 75-80KB

### Requirements
1. Text MUST be positioned at x/y coordinates from template config
2. Output MUST be JPEG with ~75-80KB file size
3. Need to support custom Google Fonts

### Action Items
1. Investigate District Tracker project for image optimization approach
2. Replace next/og with Sharp or alternative that supports:
   - Precise text positioning
   - JPEG output with quality control
   - Custom font rendering
3. Keep the URL structure: /api/images/[templateId]?name=Sarah
4. Test with template ID: 6acefd9c-ad1d-4ae3-add3-395d749cd571

### Template Data Reference
- Base image: 1536x1024 PNG (2.28MB source)
- Text config: x=50%, y=39%, font=Poppins, prefix="Hi ", suffix="!"
- Has white background box with padding

### Files to Reference
- docs/features/feature-38-image-generation-api.md
- docs/features/feature-39-image-url-generator.md
- app/api/images/[templateId]/route.tsx (current broken implementation)
```
