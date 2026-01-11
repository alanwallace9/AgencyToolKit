import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// CORS headers for public access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing key parameter' },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const supabase = createAdminClient();

    // Get agency by token with active tours
    const { data: agency, error } = await supabase
      .from('agencies')
      .select(
        `
        id,
        token,
        plan,
        settings,
        tours (
          id,
          name,
          page,
          trigger,
          steps,
          is_active
        )
      `
      )
      .eq('token', key)
      .single();

    if (error || !agency) {
      return NextResponse.json(
        { error: 'Invalid key' },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    // Filter to only active tours
    const activeTours = (agency.tours || []).filter(
      (tour: { is_active: boolean }) => tour.is_active
    );

    // Return configuration for embed script
    const config = {
      token: agency.token,
      plan: agency.plan,
      menu: agency.settings?.menu || null,
      login: agency.settings?.login || null,
      loading: agency.settings?.loading || null,
      colors: agency.settings?.colors || null,
      whitelisted_locations: agency.settings?.whitelisted_locations || [],
      tours: activeTours.map((tour: { id: string; name: string; page: string; trigger: string; steps: unknown[] }) => ({
        id: tour.id,
        name: tour.name,
        page: tour.page,
        trigger: tour.trigger,
        steps: tour.steps,
      })),
    };

    return NextResponse.json(config, {
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
