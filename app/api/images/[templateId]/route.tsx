import sharp from 'sharp';
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

  // Fetch CSS from Google Fonts API
  const API = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@${weight}`;

  const css = await fetch(API, {
    headers: {
      // Use modern Chrome user agent to get woff2 (smaller file size)
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  }).then((res) => res.text());

  // Extract font URL - prefer woff2 for smaller size
  let fontUrl = css.match(/src: url\((.+?)\) format\('woff2'\)/)?.[1];
  let format = 'woff2';

  if (!fontUrl) {
    fontUrl = css.match(/src: url\((.+?)\) format\('woff'\)/)?.[1];
    format = 'woff';
  }

  if (!fontUrl) {
    throw new Error(`Font ${fontName} not found`);
  }

  // Fetch font file
  const fontBuffer = await fetch(fontUrl).then((res) => res.arrayBuffer());
  const result = { data: Buffer.from(fontBuffer), format };

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

/**
 * Create SVG text overlay with embedded font
 */
function createTextSvg(
  text: string,
  width: number,
  height: number,
  config: {
    x: number; // percentage
    y: number; // percentage
    boxWidth: number; // percentage
    boxHeight: number; // percentage
    fontSize: number;
    fontFamily: string;
    fontData: Buffer;
    fontFormat: string;
    color: string;
    backgroundColor?: string | null;
    padding?: number;
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
  }
): Buffer {
  // Convert percentages to pixels
  const centerX = (config.x / 100) * width;
  const centerY = (config.y / 100) * height;
  const boxWidthPx = (config.boxWidth / 100) * width;
  const boxHeightPx = (config.boxHeight / 100) * height;
  const padding = config.padding || 12;

  // Calculate font size with auto-shrink (matches editor calculation)
  const fontSize = calculateFontSize(config.fontSize, boxWidthPx, text, padding);

  // Build font-face with embedded font
  const fontBase64 = config.fontData.toString('base64');
  const fontMime = config.fontFormat === 'woff2' ? 'font/woff2' : 'font/woff';

  // Build background rect if needed
  const hasBg = config.backgroundColor && config.backgroundColor !== 'transparent';

  // Use configured box dimensions (matches editor behavior)
  const bgWidth = boxWidthPx;
  const bgHeight = boxHeightPx;
  const bgX = centerX - bgWidth / 2;
  const bgY = centerY - bgHeight / 2;
  const borderRadius = Math.min(padding, 16);

  const backgroundRect = hasBg
    ? `<rect x="${bgX}" y="${bgY}" width="${bgWidth}" height="${bgHeight}" rx="${borderRadius}" fill="${config.backgroundColor}" />`
    : '';

  // Text shadow for readability (when no background)
  const textShadow = !hasBg
    ? `<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.5)" />
      </filter>`
    : '';
  const filterAttr = !hasBg ? 'filter="url(#shadow)"' : '';

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face {
            font-family: '${config.fontFamily}';
            src: url('data:${fontMime};base64,${fontBase64}') format('${config.fontFormat}');
            font-weight: 700;
            font-style: normal;
          }
        </style>
        ${textShadow}
      </defs>
      ${backgroundRect}
      <text
        x="${centerX}"
        y="${centerY}"
        text-anchor="middle"
        dominant-baseline="central"
        font-family="${config.fontFamily}"
        font-size="${fontSize}"
        font-weight="700"
        font-style="${config.fontStyle || 'normal'}"
        text-decoration="${config.textDecoration || 'none'}"
        fill="${config.color}"
        ${filterAttr}
      >${escapeXml(text)}</text>
    </svg>
  `;

  return Buffer.from(svg);
}

/**
 * Escape special XML characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
    const displayName = name.trim() || cfg.fallback || 'Friend';
    const displayText = `${cfg.prefix || ''}${displayName}${cfg.suffix || ''}`;

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
    const maxWidth = 800; // Target width for email/mobile
    const resizedImage = sharp(imageBuffer).resize(maxWidth, null, {
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

    // Create text overlay SVG at resized dimensions
    const textSvg = createTextSvg(displayText, width, height, {
      x: cfg.x || 50,
      y: cfg.y || 50,
      boxWidth: cfg.width || 40,
      boxHeight: cfg.height || 10,
      fontSize: scaledFontSize,
      fontFamily: fontName,
      fontData: fontData.data,
      fontFormat: fontData.format,
      color: cfg.color || '#FFFFFF',
      backgroundColor: cfg.background_color,
      padding: Math.round((cfg.padding ?? 12) * scaleFactor),
      fontStyle: cfg.font_style || 'normal',
      textDecoration: cfg.text_decoration || 'none',
    });

    // Composite text onto resized image and output as optimized JPEG
    // Target: ~75-80KB for email/mobile use
    const outputBuffer = await sharp(resizedBuffer)
      .composite([
        {
          input: textSvg,
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
