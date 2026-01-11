import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: presets, error } = await supabase
      .from('menu_presets')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(presets);
  } catch (error) {
    console.error('Error fetching menu presets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // If this is being set as default, unset other defaults first
    if (body.is_default) {
      await supabase
        .from('menu_presets')
        .update({ is_default: false })
        .eq('agency_id', agency.id);
    }

    const { data: preset, error } = await supabase
      .from('menu_presets')
      .insert({
        agency_id: agency.id,
        name: body.name.trim(),
        is_default: body.is_default || false,
        config: body.config || {
          hidden_items: [],
          renamed_items: {},
          item_order: [],
          hidden_banners: [],
        },
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(preset, { status: 201 });
  } catch (error) {
    console.error('Error creating menu preset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
