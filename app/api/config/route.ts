import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAnimationById } from '@/lib/loading-animations';

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

    // Get agency by token with active tours, default menu preset, and login designs
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
        ),
        menu_presets (
          id,
          name,
          is_default,
          config
        ),
        login_designs (
          id,
          name,
          is_default,
          layout,
          canvas,
          elements,
          form_style
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

    // Get the default menu preset config
    const defaultPreset = (agency.menu_presets || []).find(
      (preset: { is_default: boolean }) => preset.is_default
    );

    // Build menu config from default preset
    const menuConfig = defaultPreset?.config
      ? {
          hidden_items: defaultPreset.config.hidden_items || [],
          renamed_items: defaultPreset.config.renamed_items || {},
          item_order: defaultPreset.config.item_order || [],
          hidden_banners: defaultPreset.config.hidden_banners || [],
          dividers: defaultPreset.config.dividers || [],
        }
      : agency.settings?.menu || null;

    // Get the default login design
    const defaultLoginDesign = (agency.login_designs || []).find(
      (design: { is_default: boolean }) => design.is_default
    );

    // Build loading config with generated CSS/HTML
    let loadingPayload = null;
    const loadingSettings = agency.settings?.loading;

    if (loadingSettings?.animation_id) {
      const animation = getAnimationById(loadingSettings.animation_id);
      if (animation) {
        // Resolve effective color (use brand color if specified)
        const effectiveColor = loadingSettings.use_brand_color && agency.settings?.colors?.primary
          ? agency.settings.colors.primary
          : loadingSettings.custom_color || '#3b82f6';

        const backgroundColor = loadingSettings.background_color || 'transparent';

        // Generate CSS with colors applied
        let css = animation.css;
        css = css.replace(/var\(--loading-color,[^)]+\)/g, effectiveColor);
        css = css.replace(/var\(--loading-bg,[^)]+\)/g, backgroundColor);

        loadingPayload = {
          animation_id: loadingSettings.animation_id,
          css: css,
          html: animation.html,
          speed: loadingSettings.animation_speed || 1,
          size: loadingSettings.animation_size || 1,
        };
      }
    }

    // Return configuration for embed script
    const config = {
      token: agency.token,
      plan: agency.plan,
      menu: menuConfig,
      login: agency.settings?.login || null,
      login_design: defaultLoginDesign || null,
      loading: loadingPayload,
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
