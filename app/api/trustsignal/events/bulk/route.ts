import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/social-proof/events/bulk
 * Bulk update events (visibility toggle)
 */
export async function PATCH(request: Request) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.widget_id) {
      return NextResponse.json(
        { error: 'widget_id is required' },
        { status: 400 }
      );
    }

    if (!body.event_ids || !Array.isArray(body.event_ids) || body.event_ids.length === 0) {
      return NextResponse.json(
        { error: 'event_ids array is required' },
        { status: 400 }
      );
    }

    if (body.is_visible === undefined) {
      return NextResponse.json(
        { error: 'is_visible is required' },
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

    const { error, count } = await supabase
      .from('social_proof_events')
      .update({ is_visible: body.is_visible })
      .eq('widget_id', body.widget_id)
      .eq('agency_id', agency.id)
      .in('id', body.event_ids);

    if (error) {
      console.error('Error bulk updating events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      updated: count || body.event_ids.length,
    });
  } catch (error) {
    console.error('Error bulk updating events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social-proof/events/bulk
 * Bulk delete events
 */
export async function DELETE(request: Request) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.widget_id) {
      return NextResponse.json(
        { error: 'widget_id is required' },
        { status: 400 }
      );
    }

    if (!body.event_ids || !Array.isArray(body.event_ids) || body.event_ids.length === 0) {
      return NextResponse.json(
        { error: 'event_ids array is required' },
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

    const { error } = await supabase
      .from('social_proof_events')
      .delete()
      .eq('widget_id', body.widget_id)
      .eq('agency_id', agency.id)
      .in('id', body.event_ids);

    if (error) {
      console.error('Error bulk deleting events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deleted: body.event_ids.length,
    });
  } catch (error) {
    console.error('Error bulk deleting events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
