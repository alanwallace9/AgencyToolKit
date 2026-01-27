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

    // Get agency by token with live tours (DAP), checklists, banners, smart_tips, default menu preset, and login designs
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
          status,
          priority,
          steps,
          settings,
          targeting,
          theme_id
        ),
        checklists (
          id,
          name,
          title,
          status,
          items,
          widget,
          on_complete,
          targeting,
          theme_id
        ),
        banners (
          id,
          name,
          banner_type,
          status,
          content,
          action,
          position,
          display_mode,
          style_preset,
          theme_id,
          dismissible,
          dismiss_duration,
          priority,
          exclusive,
          targeting,
          schedule,
          trial_triggers
        ),
        smart_tips (
          id,
          name,
          status,
          element,
          content,
          trigger,
          position,
          targeting,
          theme_id
        ),
        guidely_themes (
          id,
          name,
          colors,
          typography,
          borders,
          shadows,
          avatar,
          buttons,
          tour_overrides,
          smart_tip_overrides,
          banner_overrides,
          checklist_overrides
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

    // Filter to only live tours (DAP status)
    const liveTours = (agency.tours || []).filter(
      (tour: { status: string }) => tour.status === 'live'
    );

    // Filter to only live checklists
    const liveChecklists = (agency.checklists || []).filter(
      (checklist: { status: string }) => checklist.status === 'live'
    );

    // Filter to only live or scheduled banners
    const activeBanners = (agency.banners || []).filter(
      (banner: { status: string }) => banner.status === 'live' || banner.status === 'scheduled'
    );

    // Filter to only live smart tips
    const liveSmartTips = (agency.smart_tips || []).filter(
      (tip: { status: string }) => tip.status === 'live'
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
      // DAP Tours - only live tours with full targeting/settings
      tours: liveTours.map((tour: {
        id: string;
        name: string;
        priority: number;
        steps: unknown[];
        settings: unknown;
        targeting: unknown;
        theme_id: string | null;
      }) => ({
        id: tour.id,
        name: tour.name,
        priority: tour.priority || 0,
        steps: tour.steps || [],
        settings: tour.settings || {},
        targeting: tour.targeting || {},
        theme_id: tour.theme_id,
      })),
      // Guidely themes for styling
      guidely_themes: (agency.guidely_themes || []).map((theme: {
        id: string;
        name: string;
        colors: unknown;
        typography: unknown;
        borders: unknown;
        shadows: unknown;
        avatar: unknown;
        buttons: unknown;
        tour_overrides: unknown;
        smart_tip_overrides: unknown;
        banner_overrides: unknown;
        checklist_overrides: unknown;
      }) => ({
        id: theme.id,
        name: theme.name,
        colors: theme.colors || {},
        typography: theme.typography || {},
        borders: theme.borders || {},
        shadows: theme.shadows || {},
        avatar: theme.avatar || {},
        buttons: theme.buttons || {},
        tour_overrides: theme.tour_overrides || {},
        smart_tip_overrides: theme.smart_tip_overrides || {},
        banner_overrides: theme.banner_overrides || {},
        checklist_overrides: theme.checklist_overrides || {},
      })),
      // Checklists for onboarding
      checklists: liveChecklists.map((checklist: {
        id: string;
        name: string;
        title: string;
        items: unknown[];
        widget: unknown;
        on_complete: unknown;
        targeting: unknown;
        theme_id: string | null;
      }) => ({
        id: checklist.id,
        name: checklist.name,
        title: checklist.title,
        items: checklist.items || [],
        widget: checklist.widget || {},
        on_complete: checklist.on_complete || { type: 'celebration' },
        targeting: checklist.targeting || {},
        theme_id: checklist.theme_id,
      })),
      // Banners for announcements
      banners: activeBanners.map((banner: {
        id: string;
        name: string;
        banner_type: string;
        status: string;
        content: string;
        action: unknown;
        position: string;
        display_mode: string;
        style_preset: string;
        theme_id: string | null;
        dismissible: boolean;
        dismiss_duration: string;
        priority: string;
        exclusive: boolean;
        targeting: unknown;
        schedule: unknown;
        trial_triggers: unknown;
      }) => ({
        id: banner.id,
        name: banner.name,
        banner_type: banner.banner_type,
        status: banner.status,
        content: banner.content,
        action: banner.action || { enabled: false, label: '', type: 'dismiss' },
        position: banner.position,
        display_mode: banner.display_mode,
        style_preset: banner.style_preset,
        theme_id: banner.theme_id,
        dismissible: banner.dismissible,
        dismiss_duration: banner.dismiss_duration,
        priority: banner.priority,
        exclusive: banner.exclusive,
        targeting: banner.targeting || { url_mode: 'all', url_patterns: [], customer_mode: 'all', customer_ids: [] },
        schedule: banner.schedule || { mode: 'always' },
        trial_triggers: banner.trial_triggers || { days_remaining: 7 },
      })),
      // Smart Tips for contextual tooltips
      smart_tips: liveSmartTips.map((tip: {
        id: string;
        name: string;
        element: unknown;
        content: string;
        trigger: string;
        position: string;
        targeting: unknown;
        theme_id: string | null;
      }) => ({
        id: tip.id,
        name: tip.name,
        element: tip.element || { selector: '' },
        content: tip.content,
        trigger: tip.trigger,
        position: tip.position,
        targeting: tip.targeting || {},
        theme_id: tip.theme_id,
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
      liveToursCount: config.tours.length,
      liveChecklistsCount: config.checklists.length,
      activeBannersCount: config.banners.length,
      liveSmartTipsCount: config.smart_tips.length,
      guidelyThemesCount: config.guidely_themes.length,
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
