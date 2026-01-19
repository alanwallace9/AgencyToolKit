import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SOCIAL_PROOF_EVENT_TYPE_TEXT } from '@/types/database';

/**
 * GET /api/social-proof/config
 * Public endpoint for embed script to fetch widget config and events
 *
 * Query params:
 * - key: Widget token (sp_xxx)
 */
export async function GET(request: Request) {
  // CORS headers for cross-origin embed script
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=60', // Cache for 1 minute
  };

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing widget key' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Use admin client for public access
    const supabase = createAdminClient();

    // Get widget by token
    const { data: widget, error: widgetError } = await supabase
      .from('social_proof_widgets')
      .select('*')
      .eq('token', key)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if widget is active
    if (!widget.is_active) {
      return NextResponse.json(
        { error: 'Widget is paused', active: false },
        { status: 200, headers: corsHeaders }
      );
    }

    // Get recent visible events for this widget
    const { data: events, error: eventsError } = await supabase
      .from('social_proof_events')
      .select('id, event_type, first_name, business_name, city, custom_text, display_time_override, created_at')
      .eq('widget_id', widget.id)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(widget.max_events_in_rotation || 20);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
    }

    // Format events for display
    const formattedEvents = (events || []).map((event) => ({
      id: event.id,
      first_name: event.first_name,
      business_name: event.business_name,
      city: event.city,
      event_type: event.event_type,
      action_text: event.custom_text || SOCIAL_PROOF_EVENT_TYPE_TEXT[event.event_type as keyof typeof SOCIAL_PROOF_EVENT_TYPE_TEXT] || '',
      time_ago: event.display_time_override || formatTimeAgo(event.created_at),
      created_at: event.created_at,
    }));

    return NextResponse.json(
      {
        widget: {
          token: widget.token,
          theme: widget.theme,
          position: widget.position,
          custom_colors: widget.custom_colors,
          custom_css: widget.custom_css,
          display_duration: widget.display_duration,
          gap_between: widget.gap_between,
          initial_delay: widget.initial_delay,
          show_first_name: widget.show_first_name,
          show_city: widget.show_city,
          show_business_name: widget.show_business_name,
          show_time_ago: widget.show_time_ago,
          time_ago_text: widget.time_ago_text,
          url_mode: widget.url_mode,
          url_patterns: widget.url_patterns,
          form_selector: widget.form_selector,
          capture_email: widget.capture_email,
          capture_phone: widget.capture_phone,
          capture_business_name: widget.capture_business_name,
          randomize_order: widget.randomize_order,
        },
        events: formattedEvents,
        active: true,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching social proof config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

/**
 * Format a date string to relative time
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'}`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  } else {
    return 'recently';
  }
}
