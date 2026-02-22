import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/admin';
import { isRateLimited, setRateLimit, getRateLimitRemaining } from '@/lib/rate-limit';
import { DEFAULT_PHOTO_UPLOAD_SETTINGS } from '@/types/database';
import type { Agency, Customer, PhotoUploadSettings } from '@/types/database';

// CORS headers for embed script access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Parse multipart form data
    const formData = await request.formData();
    const key = formData.get('key') as string;
    const locationId = formData.get('location_id') as string;
    const businessName = formData.get('business_name') as string;
    const ownerName = formData.get('owner_name') as string | null;
    const photoNamesJson = formData.get('photo_names') as string;
    const photos = formData.getAll('photos') as File[];

    // Validate required fields
    if (!key) {
      return NextResponse.json(
        { error: 'Agency token is required', code: 'MISSING_TOKEN' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required', code: 'MISSING_LOCATION' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'At least one photo is required', code: 'MISSING_PHOTOS' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (photos.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 photos allowed per upload', code: 'TOO_MANY_PHOTOS' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse photo names
    let photoNames: string[] = [];
    try {
      photoNames = photoNamesJson ? JSON.parse(photoNamesJson) : [];
    } catch {
      photoNames = [];
    }

    // Validate agency token
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('token', key)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json(
        { error: 'Invalid agency token', code: 'INVALID_TOKEN' },
        { status: 401, headers: corsHeaders }
      );
    }

    const typedAgency = agency as Agency;

    // Check if photo uploads are enabled
    const photoSettings: PhotoUploadSettings = {
      ...DEFAULT_PHOTO_UPLOAD_SETTINGS,
      ...(typedAgency.settings?.photo_uploads || {}),
    };

    if (!photoSettings.enabled) {
      return NextResponse.json(
        { error: 'Photo uploads are disabled for this agency', code: 'UPLOADS_DISABLED' },
        { status: 403, headers: corsHeaders }
      );
    }

    // Rate limit check (1 upload session per minute per location)
    const rateLimitKey = `upload:${typedAgency.id}:${locationId}`;
    if (isRateLimited(rateLimitKey, 60)) {
      const remaining = getRateLimitRemaining(rateLimitKey, 60);
      return NextResponse.json(
        { error: 'Please wait before uploading again', code: 'RATE_LIMITED', retry_after: remaining },
        { status: 429, headers: corsHeaders }
      );
    }

    // Find or create customer by location ID
    let customer: Customer | null = null;
    let isNewCustomer = false;

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('agency_id', typedAgency.id)
      .eq('ghl_location_id', locationId)
      .single();

    if (existingCustomer) {
      customer = existingCustomer as Customer;
      // Update owner_name if provided and currently empty
      if (ownerName?.trim() && !customer.owner_name) {
        await supabase
          .from('customers')
          .update({ owner_name: ownerName.trim() })
          .eq('id', customer.id);
        customer = { ...customer, owner_name: ownerName.trim() };
      }
      // Update name if provided and customer was created with default name
      if (businessName?.trim() && customer.name === 'Unknown Business') {
        await supabase
          .from('customers')
          .update({ name: businessName.trim() })
          .eq('id', customer.id);
        customer = { ...customer, name: businessName.trim() };
      }
    } else {
      // Create new customer
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          agency_id: typedAgency.id,
          name: businessName?.trim() || 'Unknown Business',
          owner_name: ownerName?.trim() || null,
          ghl_location_id: locationId,
          token: `bp_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
          is_active: true,
          photo_count: 0,
        })
        .select()
        .single();

      if (createError || !newCustomer) {
        console.error('Error creating customer:', createError);
        return NextResponse.json(
          { error: 'Failed to create customer record', code: 'CUSTOMER_CREATE_ERROR' },
          { status: 500, headers: corsHeaders }
        );
      }

      customer = newCustomer as Customer;
      isNewCustomer = true;
    }

    // Upload each photo to Vercel Blob
    const uploadedPhotos: Array<{
      id: string;
      name: string;
      blob_url: string;
    }> = [];

    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.`, code: 'INVALID_FILE_TYPE' },
          { status: 400, headers: corsHeaders }
        );
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must be under 5MB', code: 'FILE_TOO_LARGE' },
          { status: 400, headers: corsHeaders }
        );
      }

      // Generate photo name (use existing photo count so names don't repeat)
      const photoName = photoNames[i] || `${businessName.trim()} - Photo ${(customer.photo_count || 0) + i + 1}`;

      // Read file buffer for Sharp dimensions extraction
      const buffer = Buffer.from(await file.arrayBuffer());

      // Extract image dimensions
      let width: number | null = null;
      let height: number | null = null;
      try {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width ?? null;
        height = metadata.height ?? null;
      } catch (e) {
        console.error('Failed to extract image dimensions:', e);
      }

      // Upload to Vercel Blob
      const timestamp = Date.now();
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const blobPath = `photos/${customer.id}/${timestamp}-${safeFilename}`;

      const blob = await put(blobPath, buffer, {
        access: 'public',
        contentType: file.type,
      });

      // Save to database
      const { data: photo, error: photoError } = await supabase
        .from('customer_photos')
        .insert({
          customer_id: customer.id,
          agency_id: typedAgency.id,
          blob_url: blob.url,
          name: photoName,
          original_filename: file.name,
          file_size: file.size,
          width,
          height,
        })
        .select()
        .single();

      if (photoError) {
        console.error('Error saving photo record:', photoError);
        // Continue with other photos even if one fails
        continue;
      }

      uploadedPhotos.push({
        id: photo.id,
        name: photoName,
        blob_url: blob.url,
      });
    }

    if (uploadedPhotos.length === 0) {
      return NextResponse.json(
        { error: 'Failed to upload any photos', code: 'UPLOAD_FAILED' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Update customer photo count
    const newPhotoCount = (customer.photo_count || 0) + uploadedPhotos.length;
    await supabase
      .from('customers')
      .update({ photo_count: newPhotoCount })
      .eq('id', customer.id);

    // Create notification if enabled
    let notificationSent = false;

    if (photoSettings.notify_on_upload) {
      if (photoSettings.notification_method === 'webhook' && photoSettings.webhook_url) {
        // Send webhook to GHL
        try {
          await fetch(photoSettings.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'photo_upload',
              customer_id: customer.id,
              customer_name: customer.name,
              business_name: businessName.trim(),
              location_id: locationId,
              photo_count: uploadedPhotos.length,
              photos: uploadedPhotos.map(p => ({ name: p.name, url: p.blob_url })),
              is_new_customer: isNewCustomer,
              timestamp: new Date().toISOString(),
            }),
          });
          notificationSent = true;
        } catch (webhookError) {
          console.error('Webhook delivery failed:', webhookError);
          // Don't fail the upload if webhook fails
        }
      } else {
        // Create in-app notification
        const photoCountText = uploadedPhotos.length === 1 ? '1 photo' : `${uploadedPhotos.length} photos`;
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            agency_id: typedAgency.id,
            type: 'photo_upload',
            title: 'New photos uploaded',
            message: `${businessName.trim()} uploaded ${photoCountText}`,
            link: `/customers/${customer.id}#photos`,
          });

        if (!notifError) {
          notificationSent = true;
        }
      }
    }

    // Set rate limit after successful upload
    setRateLimit(rateLimitKey);

    // Return success
    return NextResponse.json(
      {
        success: true,
        customer: {
          id: customer.id,
          name: customer.name,
          is_new: isNewCustomer,
        },
        photos: uploadedPhotos,
        notification_sent: notificationSent,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'SERVER_ERROR' },
      { status: 500, headers: corsHeaders }
    );
  }
}
