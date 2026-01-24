// app/api/images/fetch/route.ts
// Fetch image from URL and store in our storage

import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import {
  storage,
  generateImagePath,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_SIZE,
  type AllowedImageType,
} from '@/lib/storage';
import sharp from 'sharp';

// Map content types to file extensions
const EXTENSION_MAP: Record<AllowedImageType, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export async function POST(request: Request) {
  try {
    // Auth check
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Pro plan check
    if (agency.plan !== 'pro') {
      return NextResponse.json(
        { error: 'Image personalization requires Pro plan' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { url, customer_id: customerId } = body as {
      url?: string;
      customer_id?: string;
    };

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the image
    const response = await fetch(url, {
      headers: {
        // Some servers require a user agent
        'User-Agent': 'AgencyToolkit/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    // Check content type
    const contentType = response.headers.get('content-type')?.split(';')[0] || '';
    if (!ALLOWED_IMAGE_TYPES.includes(contentType as AllowedImageType)) {
      return NextResponse.json(
        { error: `Invalid image type: ${contentType}. Allowed: JPG, PNG, WebP` },
        { status: 400 }
      );
    }

    // Read the image data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check size
    if (buffer.length > MAX_UPLOAD_SIZE) {
      const maxMB = Math.round(MAX_UPLOAD_SIZE / 1024 / 1024);
      return NextResponse.json(
        { error: `Image too large. Maximum size: ${maxMB}MB` },
        { status: 400 }
      );
    }

    // Get image dimensions using sharp
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      return NextResponse.json(
        { error: 'Could not read image dimensions' },
        { status: 400 }
      );
    }

    // Generate filename from URL or use generic name
    const urlFilename = parsedUrl.pathname.split('/').pop() || 'image';
    const extension = EXTENSION_MAP[contentType as AllowedImageType] || '.jpg';
    const filename = urlFilename.includes('.')
      ? urlFilename
      : `${urlFilename}${extension}`;

    // Generate storage path
    const pathname = generateImagePath(agency.id, customerId ?? null, filename);

    // Upload to storage
    const result = await storage.upload(buffer, pathname, contentType);

    return NextResponse.json({
      url: result.url,
      width: metadata.width,
      height: metadata.height,
      size: result.size,
      contentType: result.contentType,
      originalUrl: url,
    });
  } catch (error) {
    console.error('Image fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch and store image' },
      { status: 500 }
    );
  }
}
