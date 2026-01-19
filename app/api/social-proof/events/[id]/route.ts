import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/social-proof/events/[id]
 * Update an event (toggle visibility, etc.)
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

    // Build update object with only allowed fields
    const updateFields: Record<string, unknown> = {};

    if (body.is_visible !== undefined) {
      updateFields.is_visible = body.is_visible;
    }

    if (body.first_name !== undefined) {
      updateFields.first_name = body.first_name;
    }

    if (body.business_name !== undefined) {
      updateFields.business_name = body.business_name;
    }

    if (body.city !== undefined) {
      updateFields.city = body.city;
    }

    if (body.custom_text !== undefined) {
      updateFields.custom_text = body.custom_text;
    }

    if (body.event_type !== undefined) {
      updateFields.event_type = body.event_type;
    }

    const { data: event, error } = await supabase
      .from('social_proof_events')
      .update(updateFields)
      .eq('id', id)
      .eq('agency_id', agency.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social-proof/events/[id]
 * Delete an event
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

    const { error } = await supabase
      .from('social_proof_events')
      .delete()
      .eq('id', id)
      .eq('agency_id', agency.id);

    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
