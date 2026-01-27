import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// CORS headers for embed script access
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

// Event types for progress tracking
type ProgressEventType =
  | 'tour_start'
  | 'step_view'
  | 'step_complete'
  | 'verify'
  | 'tour_complete'
  | 'tour_dismiss';

interface ProgressEvent {
  // Customer identification - either token OR agency_token + ghl_location_id
  customer_token?: string;
  agency_token?: string;
  ghl_location_id?: string;
  // Event data
  tour_id: string;
  event_type: ProgressEventType;
  step_id?: string;
  step_order?: number;
  step_title?: string;
  url?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ProgressEvent;

    const {
      customer_token,
      agency_token,
      ghl_location_id,
      tour_id,
      event_type,
      step_id,
      step_order,
      step_title,
      url,
      metadata,
    } = body;

    // Validate required fields - need either customer_token OR (agency_token + ghl_location_id)
    const hasCustomerToken = !!customer_token;
    const hasAgencyLookup = !!(agency_token && ghl_location_id);

    if (!hasCustomerToken && !hasAgencyLookup) {
      return NextResponse.json(
        { error: 'Missing required fields: need customer_token OR (agency_token + ghl_location_id)' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!tour_id || !event_type) {
      return NextResponse.json(
        { error: 'Missing required fields: tour_id, event_type' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate event type
    const validEvents: ProgressEventType[] = [
      'tour_start',
      'step_view',
      'step_complete',
      'verify',
      'tour_complete',
      'tour_dismiss',
    ];
    if (!validEvents.includes(event_type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Look up customer - either by token or by agency_token + ghl_location_id
    let customer: { id: string; agency_id: string } | null = null;

    if (customer_token) {
      // Direct lookup by customer token
      const { data, error } = await supabase
        .from('customers')
        .select('id, agency_id')
        .eq('token', customer_token)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Invalid customer token' },
          { status: 401, headers: corsHeaders }
        );
      }
      customer = data;
    } else if (agency_token && ghl_location_id) {
      // Lookup by agency token + GHL location ID
      // First get the agency
      const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .select('id')
        .eq('token', agency_token)
        .single();

      if (agencyError || !agency) {
        return NextResponse.json(
          { error: 'Invalid agency token' },
          { status: 401, headers: corsHeaders }
        );
      }

      // Then find the customer by GHL location ID within this agency
      const { data, error } = await supabase
        .from('customers')
        .select('id, agency_id')
        .eq('agency_id', agency.id)
        .eq('ghl_location_id', ghl_location_id)
        .single();

      if (error || !data) {
        // Customer not found for this location - this is OK, just skip tracking
        // (The agency may not have set up this customer yet)
        console.log(`[Progress Tracking] No customer found for location ${ghl_location_id} - skipping`);
        return NextResponse.json({ success: true, skipped: true }, { status: 200, headers: corsHeaders });
      }
      customer = data;
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Could not identify customer' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify tour exists and belongs to the same agency
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('id, name, steps')
      .eq('id', tour_id)
      .eq('agency_id', customer.agency_id)
      .single();

    if (tourError || !tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Get or create progress record
    const { data: existingProgress } = await supabase
      .from('customer_tour_progress')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('tour_id', tour_id)
      .single();

    // Handle different event types
    switch (event_type) {
      case 'tour_start': {
        if (existingProgress) {
          // Update existing - tour restarted
          await supabase
            .from('customer_tour_progress')
            .update({
              status: 'in_progress',
              current_step: 0,
              started_at: now,
              last_activity_at: now,
              completed_at: null,
              dismissed_at: null,
            })
            .eq('id', existingProgress.id);
        } else {
          // Create new progress record
          await supabase.from('customer_tour_progress').insert({
            customer_id: customer.id,
            tour_id: tour_id,
            status: 'in_progress',
            current_step: 0,
            step_progress: [],
            started_at: now,
            last_activity_at: now,
          });
        }
        break;
      }

      case 'step_view': {
        if (!existingProgress) {
          // Auto-create progress if tour_start was missed
          await supabase.from('customer_tour_progress').insert({
            customer_id: customer.id,
            tour_id: tour_id,
            status: 'in_progress',
            current_step: step_order ?? 0,
            step_progress: [
              {
                step_id,
                step_order,
                title: step_title,
                viewed_at: now,
                completed_at: null,
                verified: false,
              },
            ],
            started_at: now,
            last_activity_at: now,
          });
        } else {
          // Update step progress
          const stepProgress = (existingProgress.step_progress as Array<Record<string, unknown>>) || [];
          const existingStepIndex = stepProgress.findIndex(
            (s) => s.step_id === step_id || s.step_order === step_order
          );

          if (existingStepIndex === -1) {
            // Add new step
            stepProgress.push({
              step_id,
              step_order,
              title: step_title,
              viewed_at: now,
              completed_at: null,
              verified: false,
            });
          } else {
            // Update existing step's viewed_at if not already set
            if (!stepProgress[existingStepIndex].viewed_at) {
              stepProgress[existingStepIndex].viewed_at = now;
            }
          }

          await supabase
            .from('customer_tour_progress')
            .update({
              current_step: step_order ?? existingProgress.current_step,
              step_progress: stepProgress,
              last_activity_at: now,
              status: 'in_progress',
            })
            .eq('id', existingProgress.id);
        }
        break;
      }

      case 'step_complete': {
        if (existingProgress) {
          const stepProgress = (existingProgress.step_progress as Array<Record<string, unknown>>) || [];
          const existingStepIndex = stepProgress.findIndex(
            (s) => s.step_id === step_id || s.step_order === step_order
          );

          if (existingStepIndex !== -1) {
            stepProgress[existingStepIndex].completed_at = now;
          } else {
            // Step wasn't viewed first (edge case) - add it
            stepProgress.push({
              step_id,
              step_order,
              title: step_title,
              viewed_at: now,
              completed_at: now,
              verified: false,
            });
          }

          await supabase
            .from('customer_tour_progress')
            .update({
              step_progress: stepProgress,
              last_activity_at: now,
            })
            .eq('id', existingProgress.id);
        }
        break;
      }

      case 'verify': {
        if (existingProgress) {
          const stepProgress = (existingProgress.step_progress as Array<Record<string, unknown>>) || [];
          const existingStepIndex = stepProgress.findIndex(
            (s) => s.step_id === step_id || s.step_order === step_order
          );

          if (existingStepIndex !== -1) {
            stepProgress[existingStepIndex].verified = true;
            stepProgress[existingStepIndex].verified_at = now;
            if (metadata?.selector) {
              stepProgress[existingStepIndex].verification_selector = metadata.selector;
            }
          }

          await supabase
            .from('customer_tour_progress')
            .update({
              step_progress: stepProgress,
              last_activity_at: now,
            })
            .eq('id', existingProgress.id);
        }
        break;
      }

      case 'tour_complete': {
        if (existingProgress) {
          await supabase
            .from('customer_tour_progress')
            .update({
              status: 'completed',
              completed_at: now,
              last_activity_at: now,
            })
            .eq('id', existingProgress.id);
        } else {
          // Edge case: tour_complete without prior events
          await supabase.from('customer_tour_progress').insert({
            customer_id: customer.id,
            tour_id: tour_id,
            status: 'completed',
            current_step: step_order ?? 0,
            step_progress: [],
            started_at: now,
            completed_at: now,
            last_activity_at: now,
          });
        }
        break;
      }

      case 'tour_dismiss': {
        if (existingProgress) {
          await supabase
            .from('customer_tour_progress')
            .update({
              status: 'dismissed',
              dismissed_at: now,
              last_activity_at: now,
            })
            .eq('id', existingProgress.id);
        } else {
          await supabase.from('customer_tour_progress').insert({
            customer_id: customer.id,
            tour_id: tour_id,
            status: 'dismissed',
            current_step: step_order ?? 0,
            step_progress: [],
            started_at: now,
            dismissed_at: now,
            last_activity_at: now,
          });
        }
        break;
      }
    }

    // Also record in tour_analytics for aggregate stats (existing system)
    await supabase.from('tour_analytics').insert({
      tour_id: tour_id,
      event_type: mapEventType(event_type),
      step_id: step_id,
      step_order: step_order,
      session_id: `customer_${customer.id}`,
      user_identifier: customer_token,
      url: url?.substring(0, 500),
      metadata: metadata || {},
    });

    console.log(
      `[Progress Tracking] ${event_type} for customer ${customer_token} on tour ${tour.name}`
    );

    return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Progress tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Map our event types to tour_analytics event types
function mapEventType(eventType: ProgressEventType): string {
  const mapping: Record<ProgressEventType, string> = {
    tour_start: 'view',
    step_view: 'step_view',
    step_complete: 'step_complete',
    verify: 'step_complete', // Verification is a type of completion
    tour_complete: 'complete',
    tour_dismiss: 'dismiss',
  };
  return mapping[eventType] || eventType;
}
