import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { generateCustomerToken } from '@/lib/tokens';

export async function GET() {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Check plan limits
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id);

    if (agency.plan === 'toolkit' && (count ?? 0) >= 25) {
      return NextResponse.json(
        { error: 'Customer limit reached. Upgrade to Pro for unlimited customers.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const token = generateCustomerToken(body.name);

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        agency_id: agency.id,
        name: body.name.trim(),
        token,
        ghl_location_id: body.ghl_location_id || null,
        gbp_place_id: body.gbp_place_id || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
