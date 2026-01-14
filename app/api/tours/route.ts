import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createTourSchema } from '@/lib/security/validation-schemas';
import { sanitizeHTML } from '@/lib/security/sanitize';
import type { Tour, TourStatus } from '@/types/database';

// Default tour settings
const DEFAULT_SETTINGS = {
  autoplay: true,
  remember_progress: true,
  show_progress: true,
  progress_style: 'dots' as const,
  allow_skip: false,
  show_close: true,
  close_on_outside_click: false,
  frequency: { type: 'once' as const },
};

// Default tour targeting
const DEFAULT_TARGETING = {
  url_targeting: { mode: 'all' as const, patterns: [] },
  element_condition: null,
  user_targeting: { type: 'all' as const },
  devices: ['desktop', 'tablet', 'mobile'] as const,
};

/**
 * GET /api/tours
 * List all tours for the current agency
 *
 * Query params:
 * - status: Filter by status (draft, live, archived)
 * - subaccount_id: Filter by subaccount
 * - search: Search by name
 * - sort: Sort field (created_at, updated_at, name, priority)
 * - order: Sort order (asc, desc)
 */
export async function GET(request: Request) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check plan - Tours require Pro plan
    if (agency.plan !== 'pro') {
      return NextResponse.json(
        { error: 'Tours feature requires Pro plan' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as TourStatus | null;
    const subaccountId = searchParams.get('subaccount_id');
    const search = searchParams.get('search');
    const sortField = searchParams.get('sort') || 'created_at';
    const sortOrder = searchParams.get('order') || 'desc';

    const supabase = await createClient();

    let query = supabase
      .from('tours')
      .select(
        `
        *,
        customer:customers(id, name),
        theme:tour_themes(id, name)
      `
      )
      .eq('agency_id', agency.id);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (subaccountId) {
      query = query.eq('subaccount_id', subaccountId);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'name', 'priority'];
    const field = validSortFields.includes(sortField) ? sortField : 'created_at';
    query = query.order(field, { ascending: sortOrder === 'asc' });

    const { data: tours, error } = await query;

    if (error) {
      console.error('Error fetching tours:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get analytics summary for each tour
    const tourIds = tours?.map((t) => t.id) || [];

    if (tourIds.length > 0) {
      const { data: analytics } = await supabase
        .from('tour_analytics')
        .select('tour_id, event_type')
        .in('tour_id', tourIds);

      // Calculate stats per tour
      const statsMap = new Map<
        string,
        { views: number; completions: number }
      >();

      analytics?.forEach((event) => {
        if (!event.tour_id) return;
        const current = statsMap.get(event.tour_id) || {
          views: 0,
          completions: 0,
        };
        if (event.event_type === 'view') current.views++;
        if (event.event_type === 'complete') current.completions++;
        statsMap.set(event.tour_id, current);
      });

      // Attach stats to tours
      const toursWithStats = tours?.map((tour) => ({
        ...tour,
        stats: statsMap.get(tour.id) || { views: 0, completions: 0 },
      }));

      return NextResponse.json(toursWithStats);
    }

    return NextResponse.json(
      tours?.map((tour) => ({
        ...tour,
        stats: { views: 0, completions: 0 },
      })) || []
    );
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tours
 * Create a new tour
 */
export async function POST(request: Request) {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check plan - Tours require Pro plan
    if (agency.plan !== 'pro') {
      return NextResponse.json(
        { error: 'Tours feature requires Pro plan' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Set agency_id from authenticated user
    body.agency_id = agency.id;

    // Apply defaults if not provided
    body.settings = { ...DEFAULT_SETTINGS, ...body.settings };
    body.targeting = { ...DEFAULT_TARGETING, ...body.targeting };
    body.status = body.status || 'draft';
    body.priority = body.priority ?? 10;
    body.steps = body.steps || [];

    // Validate input
    const validation = createTourSchema.safeParse(body);

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

    // Sanitize HTML content in steps
    const sanitizedSteps = data.steps.map((step) => ({
      ...step,
      content: sanitizeHTML(step.content),
      title: step.title ? sanitizeHTML(step.title) : step.title,
    }));

    const supabase = await createClient();

    const { data: tour, error } = await supabase
      .from('tours')
      .insert({
        agency_id: data.agency_id,
        subaccount_id: data.subaccount_id || null,
        name: data.name,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        steps: sanitizedSteps,
        settings: data.settings,
        targeting: data.targeting,
        theme_id: data.theme_id || null,
        created_by: agency.clerk_user_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tour:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tour, { status: 201 });
  } catch (error) {
    console.error('Error creating tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
