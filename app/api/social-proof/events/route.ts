import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/social-proof/events
 * List events for a widget
 *
 * Query params:
 * - widget_id: Required - Filter by widget
 * - source: Optional - Filter by source (auto, manual, csv)
 * - limit: Optional - Limit results (default 100)
 * - offset: Optional - Offset for pagination
 */
export async function GET(request: Request) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const widgetId = searchParams.get('widget_id');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!widgetId) {
      return NextResponse.json(
        { error: 'widget_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify widget ownership
    const { data: widget, error: widgetError } = await supabase
      .from('social_proof_widgets')
      .select('id')
      .eq('id', widgetId)
      .eq('agency_id', agency.id)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    let query = supabase
      .from('social_proof_events')
      .select('*', { count: 'exact' })
      .eq('widget_id', widgetId)
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (source) {
      query = query.eq('source', source);
    }

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      events: events || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social-proof/events
 * Create a manual event
 */
export async function POST(request: Request) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.widget_id) {
      return NextResponse.json(
        { error: 'widget_id is required' },
        { status: 400 }
      );
    }

    if (!body.event_type) {
      return NextResponse.json(
        { error: 'event_type is required' },
        { status: 400 }
      );
    }

    // Need either first_name or business_name
    if (!body.first_name && !body.business_name) {
      return NextResponse.json(
        { error: 'Either first_name or business_name is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify widget ownership
    const { data: widget, error: widgetError } = await supabase
      .from('social_proof_widgets')
      .select('id')
      .eq('id', body.widget_id)
      .eq('agency_id', agency.id)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    const { data: event, error } = await supabase
      .from('social_proof_events')
      .insert({
        agency_id: agency.id,
        widget_id: body.widget_id,
        event_type: body.event_type,
        source: 'manual',
        first_name: body.first_name || null,
        business_name: body.business_name || '',
        city: body.city || null,
        custom_text: body.custom_text || null,
        display_time_override: body.display_time_override || null,
        details: body.details || {},
        is_visible: body.is_visible ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
