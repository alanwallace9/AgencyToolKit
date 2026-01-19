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

    // DEBUG: Log which menu source is being used
    console.log('[API Config] Menu source debug:', {
      hasDefaultPreset: !!defaultPreset,
      presetName: defaultPreset?.name || 'none',
      hasSettingsMenu: !!agency.settings?.menu,
      settingsMenuHidden: agency.settings?.menu?.hidden_items?.length || 0,
      settingsMenuRenamed: Object.keys(agency.settings?.menu?.renamed_items || {}).length,
    });

    // CHANGED: Prioritize agency.settings.menu (Theme Builder) over menu_presets
    // This fixes the bug where old presets override Theme Builder changes
    const menuConfig = agency.settings?.menu
      ? {
          hidden_items: agency.settings.menu.hidden_items || [],
          renamed_items: agency.settings.menu.renamed_items || {},
          item_order: agency.settings.menu.item_order || [],
          hidden_banners: agency.settings.menu.hidden_banners || [],
          dividers: agency.settings.menu.dividers || [],
        }
      : defaultPreset?.config
        ? {
            hidden_items: defaultPreset.config.hidden_items || [],
            renamed_items: defaultPreset.config.renamed_items || {},
            item_order: defaultPreset.config.item_order || [],
            hidden_banners: defaultPreset.config.hidden_banners || [],
            dividers: defaultPreset.config.dividers || [],
          }
        : null;

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
          size: loadingSettings.animation_size || 1,  // Base sizes are now larger (doubled)
        };
      }
    }

    // Resolve extended color variations to actual hex values
    // Extended colors can be "variation" type (derived from base colors) or "fixed" type (direct hex)
    const resolvedColors = agency.settings?.colors ? { ...agency.settings.colors } : null;
    if (resolvedColors?.extended) {
      const baseColors = {
        primary: resolvedColors.primary,
        accent: resolvedColors.accent,
        sidebar_bg: resolvedColors.sidebar_bg,
        sidebar_text: resolvedColors.sidebar_text,
      };

      // Resolve each extended color option to a hex value
      const resolvedExtended: Record<string, string> = {};
      for (const [key, option] of Object.entries(resolvedColors.extended)) {
        const opt = option as { enabled?: boolean; type?: string; color?: string; baseColor?: string; percentage?: number };
        if (!opt || !opt.enabled) continue;

        if (opt.type === 'fixed' && opt.color) {
          resolvedExtended[key] = opt.color;
        } else if (opt.type === 'variation' && opt.baseColor && opt.percentage !== undefined) {
          const baseColor = baseColors[opt.baseColor as keyof typeof baseColors];
          if (baseColor) {
            if (opt.percentage === 100) {
              resolvedExtended[key] = baseColor;
            } else {
              // Mix with white to create lighter tint
              const r = parseInt(baseColor.slice(1, 3), 16);
              const g = parseInt(baseColor.slice(3, 5), 16);
              const b = parseInt(baseColor.slice(5, 7), 16);
              const whiteFactor = (100 - opt.percentage) / 100;
              const newR = Math.round(r + (255 - r) * whiteFactor);
              const newG = Math.round(g + (255 - g) * whiteFactor);
              const newB = Math.round(b + (255 - b) * whiteFactor);
              resolvedExtended[key] = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
            }
          }
        }
      }

      // Replace extended with resolved hex values for embed.js
      resolvedColors.extended_elements = resolvedExtended;
      // Keep original extended for debugging but embed.js uses extended_elements
    }

    // Return configuration for embed script
    const config = {
      token: agency.token,
      plan: agency.plan,
      menu: menuConfig,
      login: agency.settings?.login || null,
      login_design: defaultLoginDesign || null,
      loading: loadingPayload,
      colors: resolvedColors,
      whitelisted_locations: agency.settings?.whitelisted_locations || [],
      tours: activeTours.map((tour: { id: string; name: string; page: string; trigger: string; steps: unknown[] }) => ({
        id: tour.id,
        name: tour.name,
        page: tour.page,
        trigger: tour.trigger,
        steps: tour.steps,
      })),
    };

    // DEBUG: Log full config summary
    console.log('[API Config] Returning config:', {
      token: agency.token.substring(0, 10) + '...',
      hasMenu: !!config.menu,
      menuHiddenCount: config.menu?.hidden_items?.length || 0,
      menuRenamedCount: Object.keys(config.menu?.renamed_items || {}).length,
      hasColors: !!config.colors,
      colorsSidebarBg: config.colors?.sidebar_bg || 'none',
      hasLoading: !!config.loading,
      toursCount: config.tours.length,
    });

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
