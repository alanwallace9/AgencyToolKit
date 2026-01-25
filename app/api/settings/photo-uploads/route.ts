import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { PhotoUploadSettings } from '@/types/database';

// PATCH /api/settings/photo-uploads - Update photo upload settings
export async function PATCH(request: NextRequest) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as Partial<PhotoUploadSettings>;

    // Validate the settings
    const validSettings: PhotoUploadSettings = {
      enabled: typeof body.enabled === 'boolean' ? body.enabled : true,
      allow_text_positioning: typeof body.allow_text_positioning === 'boolean' ? body.allow_text_positioning : false,
      notify_on_upload: typeof body.notify_on_upload === 'boolean' ? body.notify_on_upload : true,
      notification_method: body.notification_method === 'webhook' ? 'webhook' : 'in_app',
      webhook_url: body.webhook_url || undefined,
    };

    // Update agency settings
    const supabase = await createClient();

    const currentSettings = agency.settings || {};
    const updatedSettings = {
      ...currentSettings,
      photo_uploads: validSettings,
    };

    const { error } = await supabase
      .from('agencies')
      .update({ settings: updatedSettings })
      .eq('id', agency.id);

    if (error) {
      console.error('Error updating photo upload settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: validSettings });
  } catch (error) {
    console.error('Photo upload settings PATCH error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
