import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/tours/[id]/duplicate
 * Duplicate a tour
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const supabase = await createClient();

    // Fetch the original tour
    const { data: original, error: fetchError } = await supabase
      .from('tours')
      .select('*')
      .eq('id', id)
      .eq('agency_id', agency.id)
      .single();

    if (fetchError || !original) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    // Create the duplicate
    const { data: duplicate, error: createError } = await supabase
      .from('tours')
      .insert({
        agency_id: original.agency_id,
        subaccount_id: original.subaccount_id,
        name: `${original.name} (Copy)`,
        description: original.description,
        status: 'draft', // Always start as draft
        priority: original.priority,
        steps: original.steps,
        settings: original.settings,
        targeting: original.targeting,
        theme_id: original.theme_id,
        created_by: agency.clerk_user_id,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error duplicating tour:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    console.error('Error duplicating tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
