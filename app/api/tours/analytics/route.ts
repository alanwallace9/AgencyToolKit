import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// CORS headers for embed script access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Tour analytics event types
type EventType =
  | 'tour_started'
  | 'tour_completed'
  | 'tour_dismissed'
  | 'step_viewed';

interface AnalyticsEvent {
  event: EventType;
  tour_id: string;
  agency_token: string;
  step_index?: number;
  total_steps?: number;
  url?: string;
  user_agent?: string;
  timestamp?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AnalyticsEvent;

    const { event, tour_id, agency_token, step_index, total_steps, url } = body;

    // Validate required fields
    if (!event || !tour_id || !agency_token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate event type
    const validEvents: EventType[] = ['tour_started', 'tour_completed', 'tour_dismissed', 'step_viewed'];
    if (!validEvents.includes(event)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createAdminClient();

    // Verify agency token exists
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('token', agency_token)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json(
        { error: 'Invalid agency token' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify tour belongs to agency
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('id, name')
      .eq('id', tour_id)
      .eq('agency_id', agency.id)
      .single();

    if (tourError || !tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Map event types to database values
    const eventTypeMap: Record<EventType, string> = {
      'tour_started': 'view',
      'step_viewed': 'step_view',
      'tour_completed': 'complete',
      'tour_dismissed': 'dismiss',
    };

    // Generate session ID if not provided (from timestamp + random)
    const session_id = body.timestamp
      ? `session_${body.timestamp}_${Math.random().toString(36).substring(2, 9)}`
      : `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Insert into tour_analytics table
    // Note: agency_id is not stored in this table - we join via tour_id when needed
    const { error: insertError } = await supabase
      .from('tour_analytics')
      .insert({
        tour_id: tour_id,
        event_type: eventTypeMap[event],
        step_order: step_index,
        session_id: session_id,
        url: url?.substring(0, 500),
        metadata: {
          total_steps,
          user_agent: body.user_agent,
        },
      });

    if (insertError) {
      console.error('[Tour Analytics] Insert error:', insertError);
      // Don't fail the request, just log - analytics shouldn't break the tour
    } else {
      console.log('[Tour Analytics] Recorded:', event, 'for tour', tour.name);
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Tour analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
