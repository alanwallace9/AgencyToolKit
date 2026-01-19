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

    // Log the event (in future, we could store in a tour_analytics table)
    console.log('[Tour Analytics]', {
      event,
      tour_id,
      tour_name: tour.name,
      agency_id: agency.id,
      step_index,
      total_steps,
      url: url?.substring(0, 100),
      timestamp: new Date().toISOString(),
    });

    // For now, update tour stats directly on the tour record
    // In a full implementation, you'd use a separate analytics table
    if (event === 'tour_started') {
      await supabase.rpc('increment_tour_stat', {
        tour_id_param: tour_id,
        stat_name: 'starts',
      });
    } else if (event === 'tour_completed') {
      await supabase.rpc('increment_tour_stat', {
        tour_id_param: tour_id,
        stat_name: 'completions',
      });
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
