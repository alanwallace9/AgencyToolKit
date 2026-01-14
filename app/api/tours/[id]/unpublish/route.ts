import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/tours/[id]/unpublish
 * Unpublish a tour (set status back to 'draft')
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
      .select('id, status')
      .eq('id', id)
      .eq('agency_id', agency.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    if (existing.status !== 'live') {
      return NextResponse.json(
        { error: 'Tour is not currently live' },
        { status: 400 }
      );
    }

    // Update status to draft
    const { data: tour, error } = await supabase
      .from('tours')
      .update({ status: 'draft' })
      .eq('id', id)
      .eq('agency_id', agency.id)
      .select()
      .single();

    if (error) {
      console.error('Error unpublishing tour:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tour);
  } catch (error) {
    console.error('Error unpublishing tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
