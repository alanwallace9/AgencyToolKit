import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/tours/[id]/publish
 * Publish a tour (set status to 'live')
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const supabase = await createClient();

    // Verify ownership and current status
    const { data: existing } = await supabase
      .from('tours')
      .select('id, status, steps')
      .eq('id', id)
      .eq('agency_id', agency.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    if (existing.status === 'live') {
      return NextResponse.json(
        { error: 'Tour is already live' },
        { status: 400 }
      );
    }

    // Validate tour has at least one step
    const steps = existing.steps as unknown[];
    if (!steps || steps.length === 0) {
      return NextResponse.json(
        { error: 'Cannot publish a tour with no steps' },
        { status: 400 }
      );
    }

    // Update status to live
    const { data: tour, error } = await supabase
      .from('tours')
      .update({
        status: 'live',
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('agency_id', agency.id)
      .select()
      .single();

    if (error) {
      console.error('Error publishing tour:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tour);
  } catch (error) {
    console.error('Error publishing tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
