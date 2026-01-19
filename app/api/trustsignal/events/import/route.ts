import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { SocialProofEventType } from '@/types/database';

interface CSVRow {
  first_name?: string;
  business_name?: string;
  city?: string;
  event_type?: string;
}

interface ImportRequest {
  widget_id: string;
  rows: CSVRow[];
  column_mapping: {
    first_name?: string;
    business_name?: string;
    city?: string;
    event_type?: string;
  };
  default_event_type: SocialProofEventType;
  use_time_override: boolean;
  time_override_text: string;
}

/**
 * POST /api/social-proof/events/import
 * Import events from CSV data
 */
export async function POST(request: Request) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as ImportRequest;

    // Validate required fields
    if (!body.widget_id) {
      return NextResponse.json(
        { error: 'widget_id is required' },
        { status: 400 }
      );
    }

    if (!body.rows || !Array.isArray(body.rows) || body.rows.length === 0) {
      return NextResponse.json(
        { error: 'No rows to import' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify widget ownership
    const { data: widget, error: widgetError } = await supabase
      .from('social_proof_widgets')
      .select('id')
      .eq('id', body.widget_id)
      .eq('agency_id', agency.id)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    // Process rows with column mapping
    const mapping = body.column_mapping || {};
    const validEventTypes = [
      'signup',
      'trial',
      'demo',
      'purchase',
      'subscription',
      'milestone',
      'connected',
      'review_milestone',
      'lead_milestone',
      'custom',
    ];

    const eventsToInsert = body.rows
      .map((row) => {
        // Extract values using column mapping
        const firstName = mapping.first_name
          ? row[mapping.first_name as keyof CSVRow]
          : row.first_name;
        const businessName = mapping.business_name
          ? row[mapping.business_name as keyof CSVRow]
          : row.business_name;
        const city = mapping.city
          ? row[mapping.city as keyof CSVRow]
          : row.city;
        const eventTypeFromRow = mapping.event_type
          ? row[mapping.event_type as keyof CSVRow]
          : row.event_type;

        // Determine event type
        let eventType = body.default_event_type || 'signup';
        if (
          eventTypeFromRow &&
          validEventTypes.includes(String(eventTypeFromRow).toLowerCase())
        ) {
          eventType = String(eventTypeFromRow).toLowerCase() as SocialProofEventType;
        }

        // Skip rows without name
        if (!firstName && !businessName) {
          return null;
        }

        return {
          agency_id: agency.id,
          widget_id: body.widget_id,
          event_type: eventType,
          source: 'csv',
          first_name: firstName ? String(firstName).trim() : null,
          business_name: businessName ? String(businessName).trim() : '',
          city: city ? String(city).trim() : null,
          display_time_override: body.use_time_override
            ? body.time_override_text || 'recently'
            : null,
          details: {},
          is_visible: true,
        };
      })
      .filter((event) => event !== null);

    if (eventsToInsert.length === 0) {
      return NextResponse.json(
        { error: 'No valid rows to import. Each row needs a name or business name.' },
        { status: 400 }
      );
    }

    // Insert in batches of 100
    const batchSize = 100;
    let insertedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < eventsToInsert.length; i += batchSize) {
      const batch = eventsToInsert.slice(i, i + batchSize);

      const { error } = await supabase
        .from('social_proof_events')
        .insert(batch);

      if (error) {
        console.error('Error inserting batch:', error);
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        insertedCount += batch.length;
      }
    }

    if (errors.length > 0 && insertedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to import events', details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imported: insertedCount,
      skipped: body.rows.length - eventsToInsert.length,
      total: body.rows.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error importing events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
