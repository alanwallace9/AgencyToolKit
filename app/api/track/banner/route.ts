import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Track banner events: view, click, dismiss
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { banner_id, event_type } = body;

    if (!banner_id || !event_type) {
      return NextResponse.json(
        { error: 'Missing banner_id or event_type' },
        { status: 400 }
      );
    }

    if (!['view', 'click', 'dismiss'].includes(event_type)) {
      return NextResponse.json(
        { error: 'Invalid event_type. Must be view, click, or dismiss' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Determine which counter to increment
    const updateField =
      event_type === 'view' ? 'view_count' :
      event_type === 'click' ? 'click_count' :
      'dismiss_count';

    // Get current count and increment
    const { data: banner, error: fetchError } = await supabase
      .from('banners')
      .select(updateField)
      .eq('id', banner_id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    const currentCount = (banner as Record<string, number>)[updateField] || 0;

    const { error: updateError } = await supabase
      .from('banners')
      .update({ [updateField]: currentCount + 1 })
      .eq('id', banner_id);

    if (updateError) {
      console.error('Error updating banner count:', updateError);
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking banner event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
