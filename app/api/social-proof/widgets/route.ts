import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { generateSocialProofWidgetToken } from '@/lib/tokens';
import { SOCIAL_PROOF_WIDGET_LIMITS } from '@/types/database';

// Default widget settings
const DEFAULT_CUSTOM_COLORS = {
  background: '#ffffff',
  text: '#1f2937',
  accent: '#3b82f6',
  border: '#e5e7eb',
};

/**
 * GET /api/social-proof/widgets
 * List all widgets for the current agency
 */
export async function GET() {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get widgets with event counts
    const { data: widgets, error } = await supabase
      .from('social_proof_widgets')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching widgets:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get event counts for each widget
    const widgetIds = widgets?.map((w) => w.id) || [];

    if (widgetIds.length > 0) {
      const { data: eventCounts } = await supabase
        .from('social_proof_events')
        .select('widget_id')
        .in('widget_id', widgetIds);

      // Count events per widget
      const countMap = new Map<string, number>();
      eventCounts?.forEach((event) => {
        if (event.widget_id) {
          countMap.set(event.widget_id, (countMap.get(event.widget_id) || 0) + 1);
        }
      });

      // Get today's counts
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayCounts } = await supabase
        .from('social_proof_events')
        .select('widget_id')
        .in('widget_id', widgetIds)
        .gte('created_at', today.toISOString());

      const todayCountMap = new Map<string, number>();
      todayCounts?.forEach((event) => {
        if (event.widget_id) {
          todayCountMap.set(
            event.widget_id,
            (todayCountMap.get(event.widget_id) || 0) + 1
          );
        }
      });

      // Attach counts to widgets
      const widgetsWithCounts = widgets?.map((widget) => ({
        ...widget,
        event_count: countMap.get(widget.id) || 0,
        today_count: todayCountMap.get(widget.id) || 0,
      }));

      return NextResponse.json(widgetsWithCounts);
    }

    return NextResponse.json(
      widgets?.map((widget) => ({
        ...widget,
        event_count: 0,
        today_count: 0,
      })) || []
    );
  } catch (error) {
    console.error('Error fetching widgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social-proof/widgets
 * Create a new widget
 */
export async function POST(request: Request) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check widget limit for plan
    const limit = SOCIAL_PROOF_WIDGET_LIMITS[agency.plan] || 0;

    const supabase = await createClient();

    // Count existing widgets
    const { count, error: countError } = await supabase
      .from('social_proof_widgets')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id);

    if (countError) {
      console.error('Error counting widgets:', countError);
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if (count !== null && count >= limit) {
      return NextResponse.json(
        {
          error: `Widget limit reached. Your ${agency.plan} plan allows ${limit} widgets. Upgrade to Pro for unlimited widgets.`,
          limit_reached: true
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Widget name is required' },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = generateSocialProofWidgetToken();

    const { data: widget, error } = await supabase
      .from('social_proof_widgets')
      .insert({
        agency_id: agency.id,
        name: body.name.trim(),
        token,
        is_active: body.is_active ?? true,
        theme: body.theme || 'minimal',
        position: body.position || 'bottom-left',
        custom_colors: body.custom_colors || DEFAULT_CUSTOM_COLORS,
        display_duration: body.display_duration ?? 5,
        gap_between: body.gap_between ?? 3,
        initial_delay: body.initial_delay ?? 3,
        show_first_name: body.show_first_name ?? true,
        show_city: body.show_city ?? true,
        show_business_name: body.show_business_name ?? false,
        show_time_ago: body.show_time_ago ?? true,
        time_ago_text: body.time_ago_text || 'ago',
        url_mode: body.url_mode || 'all',
        url_patterns: body.url_patterns || [],
        form_selector: body.form_selector || null,
        capture_email: body.capture_email ?? true,
        capture_phone: body.capture_phone ?? true,
        capture_business_name: body.capture_business_name ?? true,
        max_events_in_rotation: body.max_events_in_rotation ?? 20,
        randomize_order: body.randomize_order ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating widget:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(widget, { status: 201 });
  } catch (error) {
    console.error('Error creating widget:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
