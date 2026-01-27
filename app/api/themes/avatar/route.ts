import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { put, del } from '@vercel/blob';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get agency
    const supabase = createAdminClient();
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const themeId = formData.get('theme_id') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!themeId) {
      return NextResponse.json({ error: 'Theme ID is required' }, { status: 400 });
    }

    // Validate theme ownership
    const { data: theme, error: themeError } = await supabase
      .from('guidely_themes')
      .select('id, avatar')
      .eq('id', themeId)
      .eq('agency_id', agency.id)
      .eq('is_system', false)
      .single();

    if (themeError || !theme) {
      return NextResponse.json(
        { error: 'Theme not found or cannot be modified' },
        { status: 404 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPEG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be under 500KB' },
        { status: 400 }
      );
    }

    // Delete old avatar if exists
    const currentAvatar = theme.avatar as { default_image_url?: string | null } | null;
    if (currentAvatar?.default_image_url) {
      try {
        await del(currentAvatar.default_image_url);
      } catch {
        // Ignore deletion errors for old files
      }
    }

    // Upload new avatar
    const timestamp = Date.now();
    const ext = file.type.split('/')[1];
    const blobPath = `themes/${agency.id}/${themeId}/avatar-${timestamp}.${ext}`;

    const blob = await put(blobPath, file, {
      access: 'public',
      contentType: file.type,
    });

    // Update theme with new avatar URL
    const { error: updateError } = await supabase
      .from('guidely_themes')
      .update({
        avatar: {
          ...(currentAvatar || {}),
          default_image_url: blob.url,
        },
      })
      .eq('id', themeId)
      .eq('agency_id', agency.id);

    if (updateError) {
      // Try to clean up uploaded file
      try {
        await del(blob.url);
      } catch {
        // Ignore cleanup errors
      }
      return NextResponse.json(
        { error: 'Failed to update theme' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get agency
    const supabase = createAdminClient();
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    // Parse request body
    const { theme_id } = await request.json();

    if (!theme_id) {
      return NextResponse.json({ error: 'Theme ID is required' }, { status: 400 });
    }

    // Get theme with current avatar
    const { data: theme, error: themeError } = await supabase
      .from('guidely_themes')
      .select('id, avatar')
      .eq('id', theme_id)
      .eq('agency_id', agency.id)
      .eq('is_system', false)
      .single();

    if (themeError || !theme) {
      return NextResponse.json(
        { error: 'Theme not found or cannot be modified' },
        { status: 404 }
      );
    }

    // Delete from blob storage if exists
    const currentAvatar = theme.avatar as { default_image_url?: string | null } | null;
    if (currentAvatar?.default_image_url) {
      try {
        await del(currentAvatar.default_image_url);
      } catch {
        // Ignore deletion errors
      }
    }

    // Update theme to remove avatar URL
    const { error: updateError } = await supabase
      .from('guidely_themes')
      .update({
        avatar: {
          ...(currentAvatar || {}),
          default_image_url: null,
        },
      })
      .eq('id', theme_id)
      .eq('agency_id', agency.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update theme' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Avatar delete error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
