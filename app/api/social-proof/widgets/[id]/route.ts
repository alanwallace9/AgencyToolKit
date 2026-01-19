import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/social-proof/widgets/[id]
 * Get a specific widget
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data: widget, error } = await supabase
      .from('social_proof_widgets')
      .select('*')
      .eq('id', id)
      .eq('agency_id', agency.id)
      .single();

    if (error || !widget) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    // Get event count
    const { count } = await supabase
      .from('social_proof_events')
      .select('*', { count: 'exact', head: true })
      .eq('widget_id', id);

    return NextResponse.json({
      ...widget,
      event_count: count || 0,
    });
  } catch (error) {
    console.error('Error fetching widget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/social-proof/widgets/[id]
 * Update a widget
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    // Verify ownership
    const { data: existing, error: checkError } = await supabase
      .from('social_proof_widgets')
      .select('id')
      .eq('id', id)
      .eq('agency_id', agency.id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    // Build update object with only allowed fields
    const updateFields: Record<string, unknown> = {};

    const allowedFields = [
      'name',
      'is_active',
      'theme',
      'position',
      'custom_colors',
      'display_duration',
      'gap_between',
      'initial_delay',
      'show_first_name',
      'show_city',
      'show_business_name',
      'show_time_ago',
      'time_ago_text',
      'url_mode',
      'url_patterns',
      'form_selector',
      'capture_email',
      'capture_phone',
      'capture_business_name',
      'max_events_in_rotation',
      'randomize_order',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields[field] = body[field];
      }
    }

    // Validate name if provided
    if (updateFields.name !== undefined && String(updateFields.name).trim() === '') {
      return NextResponse.json(
        { error: 'Widget name cannot be empty' },
        { status: 400 }
      );
    }

    // Validate theme
    if (updateFields.theme && !['minimal', 'glass', 'custom'].includes(String(updateFields.theme))) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be minimal, glass, or custom.' },
        { status: 400 }
      );
    }

    // Validate position
    if (
      updateFields.position &&
      !['bottom-left', 'bottom-right', 'top-left', 'top-right'].includes(String(updateFields.position))
    ) {
      return NextResponse.json(
        { error: 'Invalid position.' },
        { status: 400 }
      );
    }

    // Validate timing values
    if (updateFields.display_duration !== undefined) {
      const duration = Number(updateFields.display_duration);
      if (duration < 3 || duration > 10) {
        return NextResponse.json(
          { error: 'Display duration must be between 3 and 10 seconds.' },
          { status: 400 }
        );
      }
    }

    if (updateFields.gap_between !== undefined) {
      const gap = Number(updateFields.gap_between);
      if (gap < 2 || gap > 10) {
        return NextResponse.json(
          { error: 'Gap between must be between 2 and 10 seconds.' },
          { status: 400 }
        );
      }
    }

    if (updateFields.initial_delay !== undefined) {
      const delay = Number(updateFields.initial_delay);
      if (delay < 0 || delay > 30) {
        return NextResponse.json(
          { error: 'Initial delay must be between 0 and 30 seconds.' },
          { status: 400 }
        );
      }
    }

    updateFields.updated_at = new Date().toISOString();

    const { data: widget, error } = await supabase
      .from('social_proof_widgets')
      .update(updateFields)
      .eq('id', id)
      .eq('agency_id', agency.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating widget:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(widget);
  } catch (error) {
    console.error('Error updating widget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social-proof/widgets/[id]
 * Delete a widget (cascades to events)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    // Verify ownership and delete
    const { error } = await supabase
      .from('social_proof_widgets')
      .delete()
      .eq('id', id)
      .eq('agency_id', agency.id);

    if (error) {
      console.error('Error deleting widget:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting widget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
