import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// CORS headers for public access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agency_token, ghl_location_id, checklist_id, completed_items, status } = body;

    // Validate required fields
    if (!agency_token || !ghl_location_id || !checklist_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createAdminClient();

    // Look up customer by GHL location ID and agency token
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, agency_id')
      .eq('ghl_location_id', ghl_location_id)
      .single();

    if (customerError || !customer) {
      // Customer not found - this is OK, just log and return success
      // (Customer might not be tracked yet)
      console.log('[Checklist Progress] Customer not found for location:', ghl_location_id);
      return NextResponse.json(
        { success: true, message: 'Customer not tracked' },
        { headers: corsHeaders }
      );
    }

    // Verify the checklist belongs to the same agency
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .select('id, agency_id')
      .eq('id', checklist_id)
      .single();

    if (checklistError || !checklist || checklist.agency_id !== customer.agency_id) {
      console.log('[Checklist Progress] Checklist not found or agency mismatch');
      return NextResponse.json(
        { error: 'Invalid checklist' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Calculate timestamps based on status
    const now = new Date().toISOString();
    const timestamps: Record<string, string> = {
      last_activity_at: now,
    };

    if (status === 'in_progress' || status === 'not_started') {
      // Set started_at only if transitioning to in_progress
    }
    if (status === 'completed') {
      timestamps.completed_at = now;
    }
    if (status === 'dismissed') {
      timestamps.dismissed_at = now;
    }

    // Upsert progress record
    const { error: upsertError } = await supabase
      .from('customer_checklist_progress')
      .upsert(
        {
          customer_id: customer.id,
          checklist_id: checklist_id,
          completed_items: completed_items || [],
          status: status || 'in_progress',
          started_at: status === 'in_progress' ? now : undefined,
          ...timestamps,
        },
        {
          onConflict: 'customer_id,checklist_id',
        }
      );

    if (upsertError) {
      console.error('[Checklist Progress] Upsert error:', upsertError);
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('[Checklist Progress] Saved:', {
      customer_id: customer.id,
      checklist_id,
      completed_count: (completed_items || []).length,
      status,
    });

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Checklist Progress] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
