'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { TourTheme, TourThemeColors, TourThemeTypography, TourThemeBorders, TourThemeShadows } from '@/types/database';
import {
  DEFAULT_THEME_COLORS,
  DEFAULT_THEME_TYPOGRAPHY,
  DEFAULT_THEME_BORDERS,
  DEFAULT_THEME_SHADOWS,
  POPOVER_SIZE_PRESETS,
  BUILT_IN_THEMES,
  type PopoverSize,
  type ProgressStyle,
} from '../_lib/theme-constants';

// NOTE: Constants are exported from '../_lib/theme-constants' directly
// Client components should import from there, not from this server actions file

/**
 * Get all themes for the current agency
 */
export async function getThemes(): Promise<TourTheme[]> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  const { data: themes, error } = await supabase
    .from('guidely_themes')
    .select('*')
    .eq('agency_id', agency.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (themes || []) as TourTheme[];
}

/**
 * Get a single theme by ID
 */
export async function getTheme(id: string): Promise<TourTheme | null> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  const { data: theme, error } = await supabase
    .from('guidely_themes')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return theme as TourTheme;
}

/**
 * Create a new theme
 */
export async function createTheme(data: {
  name: string;
  colors?: Partial<TourThemeColors>;
  typography?: Partial<TourThemeTypography>;
  borders?: Partial<TourThemeBorders>;
  shadows?: Partial<TourThemeShadows>;
  popover_size?: PopoverSize;
  progress_style?: ProgressStyle;
  is_default?: boolean;
}): Promise<TourTheme> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  if (agency.plan !== 'pro') {
    throw new Error('Tours feature requires Pro plan');
  }

  const supabase = createAdminClient();

  // Merge with defaults
  const colors = { ...DEFAULT_THEME_COLORS, ...data.colors };
  const typography = { ...DEFAULT_THEME_TYPOGRAPHY, ...data.typography };
  const borders = { ...DEFAULT_THEME_BORDERS, ...data.borders };
  const shadows = { ...DEFAULT_THEME_SHADOWS, ...data.shadows };

  // Apply size preset to typography if specified
  if (data.popover_size) {
    const sizePreset = POPOVER_SIZE_PRESETS[data.popover_size];
    typography.title_size = sizePreset.title_size;
    typography.body_size = sizePreset.body_size;
  }

  const { data: theme, error } = await supabase
    .from('guidely_themes')
    .insert({
      agency_id: agency.id,
      name: data.name,
      is_default: data.is_default || false,
      colors,
      typography,
      borders,
      shadows,
      // Store extra settings in buttons JSONB for now (progress_style, popover_size)
      buttons: {
        primary: {
          background: colors.primary,
          text: '#ffffff',
          border: 'transparent',
          hover_background: colors.primary,
          hover_text: '#ffffff',
          padding: '10px 20px',
          border_radius: borders.radius,
        },
        secondary: {
          background: 'transparent',
          text: colors.secondary,
          border: colors.border,
          hover_background: '#f3f4f6',
          hover_text: colors.text,
          padding: '10px 20px',
          border_radius: borders.radius,
        },
        // Extra settings
        _settings: {
          popover_size: data.popover_size || 'medium',
          progress_style: data.progress_style || 'dots',
        },
      },
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/tours');
  revalidatePath('/g/themes');
  return theme as TourTheme;
}

/**
 * Update a theme
 */
export async function updateTheme(
  id: string,
  data: Partial<{
    name: string;
    colors: Partial<TourThemeColors>;
    typography: Partial<TourThemeTypography>;
    borders: Partial<TourThemeBorders>;
    shadows: Partial<TourThemeShadows>;
    popover_size: PopoverSize;
    progress_style: ProgressStyle;
    is_default: boolean;
  }>
): Promise<TourTheme> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Get existing theme to merge values
  const { data: existing, error: fetchError } = await supabase
    .from('guidely_themes')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (fetchError || !existing) {
    throw new Error('Theme not found');
  }

  // Build update object
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.is_default !== undefined) {
    updateData.is_default = data.is_default;
  }

  if (data.colors) {
    updateData.colors = { ...existing.colors, ...data.colors };
  }

  if (data.typography) {
    updateData.typography = { ...existing.typography, ...data.typography };
  }

  if (data.borders) {
    updateData.borders = { ...existing.borders, ...data.borders };
  }

  if (data.shadows) {
    updateData.shadows = { ...existing.shadows, ...data.shadows };
  }

  // Handle popover_size and progress_style (stored in buttons._settings)
  if (data.popover_size || data.progress_style) {
    const existingButtons = existing.buttons as Record<string, unknown> || {};
    const existingSettings = (existingButtons._settings as Record<string, unknown>) || {};

    updateData.buttons = {
      ...existingButtons,
      _settings: {
        ...existingSettings,
        ...(data.popover_size && { popover_size: data.popover_size }),
        ...(data.progress_style && { progress_style: data.progress_style }),
      },
    };

    // Also update typography sizes if popover_size changed
    if (data.popover_size) {
      const sizePreset = POPOVER_SIZE_PRESETS[data.popover_size];
      const currentTypography = updateData.typography || existing.typography;
      updateData.typography = {
        ...currentTypography,
        title_size: sizePreset.title_size,
        body_size: sizePreset.body_size,
      };
    }
  }

  const { data: theme, error } = await supabase
    .from('guidely_themes')
    .update(updateData)
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/tours');
  revalidatePath('/g/themes');
  revalidatePath(`/tours/themes/${id}`);
  return theme as TourTheme;
}

/**
 * Delete a theme
 */
export async function deleteTheme(id: string): Promise<void> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Check if any tours are using this theme
  const { data: toursUsingTheme } = await supabase
    .from('tours')
    .select('id')
    .eq('theme_id', id)
    .eq('agency_id', agency.id)
    .limit(1);

  if (toursUsingTheme && toursUsingTheme.length > 0) {
    throw new Error('Cannot delete theme that is being used by tours. Remove the theme from those tours first.');
  }

  const { error } = await supabase
    .from('guidely_themes')
    .delete()
    .eq('id', id)
    .eq('agency_id', agency.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/tours');
  revalidatePath('/g/themes');
}

/**
 * Set a theme as the default
 */
export async function setDefaultTheme(id: string): Promise<TourTheme> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // The database trigger will handle unsetting other defaults
  const { data: theme, error } = await supabase
    .from('guidely_themes')
    .update({ is_default: true })
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/tours');
  revalidatePath('/g/themes');
  return theme as TourTheme;
}

/**
 * Duplicate a theme
 */
export async function duplicateTheme(id: string): Promise<TourTheme> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Fetch original theme
  const { data: original, error: fetchError } = await supabase
    .from('guidely_themes')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (fetchError || !original) {
    throw new Error('Theme not found');
  }

  // Create copy
  const { data: duplicate, error: createError } = await supabase
    .from('guidely_themes')
    .insert({
      agency_id: original.agency_id,
      name: `${original.name} (Copy)`,
      is_default: false, // Never copy default status
      colors: original.colors,
      typography: original.typography,
      borders: original.borders,
      shadows: original.shadows,
      buttons: original.buttons,
      custom_css: original.custom_css,
    })
    .select()
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  revalidatePath('/tours');
  revalidatePath('/g/themes');
  return duplicate as TourTheme;
}

/**
 * Create a theme from a built-in template
 */
export async function createThemeFromTemplate(templateName: string): Promise<TourTheme> {
  const template = BUILT_IN_THEMES.find(t => t.name === templateName);
  if (!template) {
    throw new Error('Template not found');
  }

  return createTheme({
    name: template.name,
    colors: template.colors,
    typography: template.typography,
    borders: template.borders,
    shadows: template.shadows,
  });
}

