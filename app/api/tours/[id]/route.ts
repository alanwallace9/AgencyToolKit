import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { updateTourSchema } from '@/lib/security/validation-schemas';
import { sanitizeHTML } from '@/lib/security/sanitize';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tours/[id]
 * Get a single tour by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const supabase = await createClient();

    const { data: tour, error } = await supabase
      .from('tours')
      .select(
        `
        *,
        customer:customers(id, name, ghl_location_id, ghl_url),
        theme:tour_themes(*)
      `
      )
      .eq('id', id)
      .eq('agency_id', agency.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get analytics for this tour
    const { data: analytics } = await supabase
      .from('tour_analytics')
      .select('event_type, step_id, created_at')
      .eq('tour_id', id)
      .order('created_at', { ascending: false })
      .limit(1000);

    // Calculate stats
    const stats = {
      views: analytics?.filter((e) => e.event_type === 'view').length || 0,
      completions:
        analytics?.filter((e) => e.event_type === 'complete').length || 0,
      dismissals:
        analytics?.filter((e) => e.event_type === 'dismiss').length || 0,
      completion_rate: 0,
    };

    if (stats.views > 0) {
      stats.completion_rate = Math.round(
        (stats.completions / stats.views) * 100
      );
    }

    return NextResponse.json({ ...tour, stats });
  } catch (error) {
    console.error('Error fetching tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tours/[id]
 * Update a tour
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Set ID from route params
    body.id = id;

    // Validate input
    const validation = updateTourSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.status !== undefined) {
      updateData.status = data.status;
      // Set published_at when going live
      if (data.status === 'live') {
        updateData.published_at = new Date().toISOString();
      }
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.settings !== undefined) updateData.settings = data.settings;
    if (data.targeting !== undefined) updateData.targeting = data.targeting;
    if (data.theme_id !== undefined) updateData.theme_id = data.theme_id;
    if (data.subaccount_id !== undefined)
      updateData.subaccount_id = data.subaccount_id;

    // Sanitize steps if provided
    if (data.steps !== undefined) {
      updateData.steps = data.steps.map((step) => ({
        ...step,
        content: sanitizeHTML(step.content),
        title: step.title ? sanitizeHTML(step.title) : step.title,
      }));
    }

    const supabase = await createClient();

    // Verify ownership first
    const { data: existing } = await supabase
      .from('tours')
      .select('id')
      .eq('id', id)
      .eq('agency_id', agency.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    const { data: tour, error } = await supabase
      .from('tours')
      .update(updateData)
      .eq('id', id)
      .eq('agency_id', agency.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tour:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tour);
  } catch (error) {
    console.error('Error updating tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tours/[id]
 * Delete a tour
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const supabase = await createClient();

    // Verify ownership first
    const { data: existing } = await supabase
      .from('tours')
      .select('id')
      .eq('id', id)
      .eq('agency_id', agency.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('tours')
      .delete()
      .eq('id', id)
      .eq('agency_id', agency.id);

    if (error) {
      console.error('Error deleting tour:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
