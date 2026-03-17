// app/api/images/upload/route.ts
// Handle direct file uploads for image templates

import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import {
  storage,
  generateImagePath,
  validateImageFile,
  MAX_UPLOAD_SIZE,
} from '@/lib/storage';
import sharp from 'sharp';

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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customerId = formData.get('customer_id') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateImageFile(
      { type: file.type, size: file.size },
      MAX_UPLOAD_SIZE
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Resize to max 800px on longest dimension before storing
    // This keeps files phone-friendly (~75-80KB) and avoids storing oversized originals
    const resizedBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    // Get final dimensions after resize
    const metadata = await sharp(resizedBuffer).metadata();
    if (!metadata.width || !metadata.height) {
      return NextResponse.json(
        { error: 'Could not read image dimensions' },
        { status: 400 }
      );
    }

    // Generate storage path (always .jpg after resize)
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const pathname = generateImagePath(
      agency.id,
      customerId ?? null,
      `${baseName}.jpg`
    );

    // Upload resized image to storage
    const result = await storage.upload(resizedBuffer, pathname, 'image/jpeg');

    return NextResponse.json({
      url: result.url,
      width: metadata.width,
      height: metadata.height,
      size: result.size,
      contentType: result.contentType,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
