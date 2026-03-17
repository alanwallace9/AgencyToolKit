import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import type { ImageTemplate } from '@/types/database';

// Use Node.js runtime for Sharp (not Edge)
export const runtime = 'nodejs';

// Cache fonts in memory
const fontCache = new Map<string, { data: Buffer; format: string }>();

/**
 * Load a Google Font and return as base64 for SVG embedding
 */
async function loadGoogleFont(
  fontName: string,
  weight: number = 700
): Promise<{ data: Buffer; format: string }> {
  const cacheKey = `${fontName}-${weight}`;

  if (fontCache.has(cacheKey)) {
    return fontCache.get(cacheKey)!;
  }

  // Use old Android user agent to get TTF format from Google Fonts.
  // Satori requires TTF/OTF — woff2/woff are not supported.
  const API = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@${weight}`;

  const css = await fetch(API, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 2.2; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
    },
  }).then((res) => res.text());

  // Extract TTF URL — old Android UA returns format('truetype') with .ttf URL
  const match = css.match(/src: url\((.+?)\) format\('truetype'\)/);

  if (!match?.[1]) {
    throw new Error(`Font ${fontName} TTF not found`);
  }

  const fontUrl = match[1];

  // Fetch font file
  const fontBuffer = await fetch(fontUrl).then((res) => res.arrayBuffer());
  const result = { data: Buffer.from(fontBuffer), format: 'truetype' };

  fontCache.set(cacheKey, result);
  return result;
}

/**
 * Fetch template from database using Supabase REST API
 */
async function fetchTemplate(templateId: string): Promise<ImageTemplate | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return null;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/image_templates?id=eq.${templateId}&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch template:', response.status);
      return null;
    }

    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

/**
 * Fetch the plan for the agency that owns a template
 */
async function fetchAgencyPlan(agencyId: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/agencies?id=eq.${agencyId}&select=plan`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data[0]?.plan ?? null;
  } catch {
    return null;
  }
}

/**
 * Increment render count (fire and forget)
 */
async function incrementRenderCount(templateId: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) return;

  try {
    await fetch(`${supabaseUrl}/rest/v1/rpc/increment_render_count`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ p_template_id: templateId }),
    });
  } catch {
    // Fire and forget
  }
}

/**
 * Calculate auto-shrink font size for long names
 * Matches the editor's calculation in fabric-canvas.tsx
 */
function calculateFontSize(
  baseSize: number,
  boxWidthPx: number,
  text: string,
  padding: number = 12
): number {
  // Available width after padding (matches editor)
  const availableWidth = boxWidthPx - padding * 2;

  // Estimate text width (0.55 chars per fontSize for bold text)
  const charWidthRatio = 0.55;
  const estimatedTextWidth = text.length * (baseSize * charWidthRatio);

  // If text is too wide, shrink proportionally (leave 10% margin)
  if (estimatedTextWidth > availableWidth * 0.9) {
    const shrinkRatio = (availableWidth * 0.9) / estimatedTextWidth;
    return Math.max(14, Math.floor(baseSize * shrinkRatio));
  }

  return baseSize;
}


export async function GET(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || '';

    // Debug mode - return JSON with config info
    if (searchParams.get('debug') === '1') {
      return Response.json({
        status: 'ok',
        templateId,
        name,
        runtime: 'nodejs',
        envCheck: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
      });
    }

    // Fetch template
    const template = await fetchTemplate(templateId);
    if (!template) {
      return new Response('Template not found', { status: 404 });
    }

    // Plan gate — image personalization is a Pro feature
    const agencyPlan = await fetchAgencyPlan(template.agency_id);
    if (agencyPlan !== 'pro') {
      return new Response('Image personalization requires a Pro plan', { status: 403 });
    }

    // Debug mode - return template info
    if (searchParams.get('debug') === '2') {
      return Response.json({
        status: 'ok',
        template: {
          id: template.id,
          name: template.name,
          base_image_url: template.base_image_url,
          width: template.base_image_width,
          height: template.base_image_height,
          text_config: template.text_config,
        },
      });
    }

    const cfg = template.text_config;
    const rawName = name.trim() || cfg.fallback || 'Friend';

    // Apply text transform (matches editor preview)
    let transformedName = rawName;
    if (cfg.text_transform === 'uppercase') {
      transformedName = rawName.toUpperCase();
    } else if (cfg.text_transform === 'lowercase') {
      transformedName = rawName.toLowerCase();
    } else if (cfg.text_transform === 'capitalize') {
      transformedName = rawName.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const displayText = `${cfg.prefix || ''}${transformedName}${cfg.suffix || ''}`;

    // Load custom font
    const fontName = cfg.font || 'Inter';
    let fontData: { data: Buffer; format: string };
    try {
      fontData = await loadGoogleFont(fontName, 700);
    } catch {
      // Fallback to Inter if custom font fails
      fontData = await loadGoogleFont('Inter', 700);
    }

    // Fetch base image
    const imageResponse = await fetch(template.base_image_url);
    if (!imageResponse.ok) {
      return new Response('Failed to fetch base image', { status: 500 });
    }
    let imageBuffer: Buffer = Buffer.from(await imageResponse.arrayBuffer());

    // Apply image transforms (crop + flip) if saved
    const imgConfig = template.image_config;
    if (imgConfig && (
      imgConfig.crop_x > 0 || imgConfig.crop_y > 0 ||
      imgConfig.crop_width < 1 || imgConfig.crop_height < 1 ||
      imgConfig.flip_x || imgConfig.flip_y
    )) {
      const meta = await sharp(imageBuffer).metadata();
      const origW = meta.width || 1;
      const origH = meta.height || 1;

      let pipeline = sharp(imageBuffer);

      // Extract crop region (percentages → pixels)
      const extractLeft = Math.max(0, Math.round(imgConfig.crop_x * origW));
      const extractTop = Math.max(0, Math.round(imgConfig.crop_y * origH));
      const extractWidth = Math.min(origW - extractLeft, Math.max(1, Math.round(imgConfig.crop_width * origW)));
      const extractHeight = Math.min(origH - extractTop, Math.max(1, Math.round(imgConfig.crop_height * origH)));

      if (extractWidth > 0 && extractHeight > 0 && extractLeft + extractWidth <= origW && extractTop + extractHeight <= origH) {
        pipeline = pipeline.extract({
          left: extractLeft,
          top: extractTop,
          width: extractWidth,
          height: extractHeight,
        });
      }

      // Apply flips
      if (imgConfig.flip_x) pipeline = pipeline.flop();
      if (imgConfig.flip_y) pipeline = pipeline.flip();

      imageBuffer = await pipeline.toBuffer();
    }

    // Resize image first, then get final dimensions
    // Cap longest dimension at 800px (portrait and landscape both handled)
    const resizedImage = sharp(imageBuffer).resize(800, 800, {
      withoutEnlargement: true,
      fit: 'inside',
    });

    // Get resized dimensions for SVG creation
    const resizedBuffer = await resizedImage.clone().toBuffer();
    const metadata = await sharp(resizedBuffer).metadata();
    const width = metadata.width!;
    const height = metadata.height!;

    // Scale font size based on EDITOR canvas dimensions, not original image
    // The editor uses a fixed 640×360 canvas, so font sizes are calibrated for 640px width
    const EDITOR_CANVAS_WIDTH = 640;
    const scaleFactor = width / EDITOR_CANVAS_WIDTH;
    const scaledFontSize = Math.round((cfg.size || 32) * scaleFactor);

    // Convert percentages to pixels for text box positioning
    const cfgX = cfg.x || 50;
    const cfgY = cfg.y || 50;
    const boxW = cfg.width || 40;
    const boxH = cfg.height || 10;
    const scaledPadding = Math.round((cfg.padding ?? 12) * scaleFactor);
    const hasBg = cfg.background_color && cfg.background_color !== 'transparent';
    const boxWidthPx = Math.round((boxW / 100) * width);
    const boxHeightPx = Math.round((boxH / 100) * height);
    const boxLeft = Math.round(((cfgX - boxW / 2) / 100) * width);
    const boxTop = Math.round(((cfgY - boxH / 2) / 100) * height);
    const finalFontSize = calculateFontSize(scaledFontSize, boxWidthPx, displayText, scaledPadding);

    // Convert Buffer to ArrayBuffer for Satori
    const fontArrayBuffer = fontData.data.buffer.slice(
      fontData.data.byteOffset,
      fontData.data.byteOffset + fontData.data.byteLength
    ) as ArrayBuffer;

    // Generate text overlay SVG using Satori — handles custom fonts natively
    // via ArrayBuffer, no fontconfig dependency
    const textSvg = await satori(
      <div style={{ display: 'flex', width, height }}>
        <div style={{
          position: 'absolute',
          left: boxLeft,
          top: boxTop,
          width: boxWidthPx,
          height: boxHeightPx,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: hasBg ? (cfg.background_color as string) : 'transparent',
          borderRadius: hasBg ? Math.min(scaledPadding, 16) : 0,
          padding: hasBg ? scaledPadding : 0,
        }}>
          <span style={{
            fontFamily: fontName,
            fontSize: finalFontSize,
            fontWeight: 700,
            color: cfg.color || '#FFFFFF',
            textAlign: 'center',
            fontStyle: (cfg.font_style as 'normal' | 'italic') || 'normal',
            textDecoration: cfg.text_decoration === 'underline' ? 'underline' : 'none',
          }}>
            {displayText}
          </span>
        </div>
      </div>,
      {
        width,
        height,
        fonts: [{ name: fontName, data: fontArrayBuffer, weight: 700, style: 'normal' }],
      }
    );

    // Rasterize Satori SVG to PNG using resvg-js (text is already paths, no font loading needed)
    const resvg = new Resvg(textSvg, { fitTo: { mode: 'width', value: width } });
    const textPng = resvg.render().asPng();

    // Composite text PNG onto resized image and output as optimized JPEG
    // Target: ~75-80KB for email/mobile use
    const outputBuffer = await sharp(resizedBuffer)
      .composite([
        {
          input: textPng,
          top: 0,
          left: 0,
        },
      ])
      .jpeg({
        quality: 80,
        mozjpeg: true, // Better compression
      })
      .toBuffer();

    // Only increment render count for production requests (no cache-bust params)
    // Preview/thumbnail requests from the dashboard use _t or v params
    const isPreviewRequest = searchParams.has('_t') || searchParams.has('v');
    if (!isPreviewRequest) {
      incrementRenderCount(template.id).catch(() => {});
    }

    return new Response(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': outputBuffer.length.toString(),
        'Cache-Control': searchParams.has('_t') || searchParams.has('v')
          ? 'no-store'
          : 'public, max-age=86400, s-maxage=86400',
        ...(!(searchParams.has('_t') || searchParams.has('v')) && {
          'CDN-Cache-Control': 'public, max-age=86400',
        }),
      },
    });
  } catch (error) {
    console.error('[Image API] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Image generation failed: ${message}`, { status: 500 });
  }
}
