'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  DEFAULT_COLORS,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_SHAPE,
  DEFAULT_SHADOWS,
  DEFAULT_AVATAR,
  DEFAULT_BUTTONS,
  DEFAULT_TOUR_OVERRIDES,
  DEFAULT_SMART_TIP_OVERRIDES,
  DEFAULT_BANNER_OVERRIDES,
  DEFAULT_CHECKLIST_OVERRIDES,
} from '@/lib/guidely-theme-defaults';
import type {
  GuidelyTheme,
  GuidelyThemeColors,
  GuidelyThemeTypography,
  GuidelyThemeShape,
  GuidelyThemeShadows,
  GuidelyThemeAvatar,
  GuidelyThemeButtonConfig,
  GuidelyTourOverrides,
  GuidelySmartTipOverrides,
  GuidelyBannerOverrides,
  GuidelyChecklistOverrides,
  GuidelyDefaults,
} from '@/types/database';

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get all themes for the current agency (including system templates)
 */
export async function getGuidelyThemes(): Promise<GuidelyTheme[]> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  const { data: themes, error } = await supabase
    .from('guidely_themes')
    .select('*')
    .or(`agency_id.eq.${agency.id},is_system.eq.true`)
    .order('is_system', { ascending: false })
    .order('is_default', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (themes || []) as GuidelyTheme[];
}

/**
 * Get system templates only
 */
export async function getSystemTemplates(): Promise<GuidelyTheme[]> {
  const supabase = createAdminClient();

  const { data: themes, error } = await supabase
    .from('guidely_themes')
    .select('*')
    .eq('is_system', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (themes || []) as GuidelyTheme[];
}

/**
 * Get agency themes only (excluding system templates)
 */
export async function getAgencyThemes(): Promise<GuidelyTheme[]> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  const { data: themes, error } = await supabase
    .from('guidely_themes')
    .select('*')
    .eq('agency_id', agency.id)
    .eq('is_system', false)
    .order('is_default', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (themes || []) as GuidelyTheme[];
}

/**
 * Get a single theme by ID
 */
export async function getGuidelyTheme(id: string): Promise<GuidelyTheme | null> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  const { data: theme, error } = await supabase
    .from('guidely_themes')
    .select('*')
    .eq('id', id)
    .or(`agency_id.eq.${agency.id},is_system.eq.true`)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return theme as GuidelyTheme;
}

/**
 * Get theme usage counts (how many tours, tips, banners, checklists use each theme)
 */
export async function getThemeUsage(themeId: string): Promise<{
  tours: { id: string; name: string }[];
  smart_tips: { id: string; name: string }[];
  banners: { id: string; name: string }[];
  checklists: { id: string; name: string }[];
  total: number;
}> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Fetch all items using this theme in parallel
  const [toursRes, tipsRes, bannersRes, checklistsRes] = await Promise.all([
    supabase
      .from('tours')
      .select('id, name')
      .eq('agency_id', agency.id)
      .eq('theme_id', themeId),
    supabase
      .from('smart_tips')
      .select('id, name')
      .eq('agency_id', agency.id)
      .eq('theme_id', themeId),
    supabase
      .from('banners')
      .select('id, name')
      .eq('agency_id', agency.id)
      .eq('theme_id', themeId),
    supabase
      .from('checklists')
      .select('id, name')
      .eq('agency_id', agency.id)
      .eq('theme_id', themeId),
  ]);

  const tours = (toursRes.data || []) as { id: string; name: string }[];
  const smart_tips = (tipsRes.data || []) as { id: string; name: string }[];
  const banners = (bannersRes.data || []) as { id: string; name: string }[];
  const checklists = (checklistsRes.data || []) as { id: string; name: string }[];

  return {
    tours,
    smart_tips,
    banners,
    checklists,
    total: tours.length + smart_tips.length + banners.length + checklists.length,
  };
}

// ============================================
// CREATE OPERATIONS
// ============================================

export interface CreateGuidelyThemeInput {
  name: string;
  description?: string;
  colors?: Partial<GuidelyThemeColors>;
  typography?: Partial<GuidelyThemeTypography>;
  borders?: Partial<GuidelyThemeShape>;
  shadows?: Partial<GuidelyThemeShadows>;
  avatar?: Partial<GuidelyThemeAvatar>;
  buttons?: Partial<GuidelyThemeButtonConfig>;
  tour_overrides?: Partial<GuidelyTourOverrides>;
  smart_tip_overrides?: Partial<GuidelySmartTipOverrides>;
  banner_overrides?: Partial<GuidelyBannerOverrides>;
  checklist_overrides?: Partial<GuidelyChecklistOverrides>;
  is_default?: boolean;
}

/**
 * Create a new theme
 */
export async function createGuidelyTheme(data: CreateGuidelyThemeInput): Promise<GuidelyTheme> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  if (agency.plan !== 'pro') {
    throw new Error('Themes feature requires Pro plan');
  }

  const supabase = createAdminClient();

  // Merge with defaults
  const themeData = {
    agency_id: agency.id,
    name: data.name,
    description: data.description || null,
    is_system: false,
    is_default: data.is_default || false,
    colors: { ...DEFAULT_COLORS, ...data.colors },
    typography: { ...DEFAULT_TYPOGRAPHY, ...data.typography },
    borders: { ...DEFAULT_SHAPE, ...data.borders },
    shadows: { ...DEFAULT_SHADOWS, ...data.shadows },
    avatar: { ...DEFAULT_AVATAR, ...data.avatar },
    buttons: { ...DEFAULT_BUTTONS, ...data.buttons },
    tour_overrides: { ...DEFAULT_TOUR_OVERRIDES, ...data.tour_overrides },
    smart_tip_overrides: { ...DEFAULT_SMART_TIP_OVERRIDES, ...data.smart_tip_overrides },
    banner_overrides: { ...DEFAULT_BANNER_OVERRIDES, ...data.banner_overrides },
    checklist_overrides: { ...DEFAULT_CHECKLIST_OVERRIDES, ...data.checklist_overrides },
  };

  const { data: theme, error } = await supabase
    .from('guidely_themes')
    .insert(themeData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/g/themes');
  return theme as GuidelyTheme;
}

/**
 * Create a theme from a system template
 */
export async function createThemeFromTemplate(
  templateId: string,
  name?: string
): Promise<GuidelyTheme> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Fetch the template
  const { data: template, error: fetchError } = await supabase
    .from('guidely_themes')
    .select('*')
    .eq('id', templateId)
    .eq('is_system', true)
    .single();

  if (fetchError || !template) {
    throw new Error('Template not found');
  }

  // Create a copy for the agency
  const themeData = {
    agency_id: agency.id,
    name: name || `${template.name} (Custom)`,
    description: template.description,
    is_system: false,
    is_default: false,
    colors: template.colors,
    typography: template.typography,
    borders: template.borders,
    shadows: template.shadows,
    avatar: template.avatar,
    buttons: template.buttons,
    tour_overrides: template.tour_overrides,
    smart_tip_overrides: template.smart_tip_overrides,
    banner_overrides: template.banner_overrides,
    checklist_overrides: template.checklist_overrides,
  };

  const { data: theme, error } = await supabase
    .from('guidely_themes')
    .insert(themeData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/g/themes');
  return theme as GuidelyTheme;
}

// ============================================
// UPDATE OPERATIONS
// ============================================

export interface UpdateGuidelyThemeInput {
  name?: string;
  description?: string | null;
  colors?: Partial<GuidelyThemeColors>;
  typography?: Partial<GuidelyThemeTypography>;
  borders?: Partial<GuidelyThemeShape>;
  shadows?: Partial<GuidelyThemeShadows>;
  avatar?: Partial<GuidelyThemeAvatar>;
  buttons?: Partial<GuidelyThemeButtonConfig>;
  tour_overrides?: Partial<GuidelyTourOverrides>;
  smart_tip_overrides?: Partial<GuidelySmartTipOverrides>;
  banner_overrides?: Partial<GuidelyBannerOverrides>;
  checklist_overrides?: Partial<GuidelyChecklistOverrides>;
  is_default?: boolean;
}

/**
 * Update a theme
 */
export async function updateGuidelyTheme(
  id: string,
  data: UpdateGuidelyThemeInput
): Promise<GuidelyTheme> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Verify ownership and get existing theme
  const { data: existing, error: fetchError } = await supabase
    .from('guidely_themes')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .eq('is_system', false)
    .single();

  if (fetchError || !existing) {
    throw new Error('Theme not found or cannot be modified');
  }

  // Build update object, merging nested objects
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.is_default !== undefined) updateData.is_default = data.is_default;

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
  if (data.avatar) {
    updateData.avatar = { ...existing.avatar, ...data.avatar };
  }
  if (data.buttons) {
    updateData.buttons = { ...existing.buttons, ...data.buttons };
  }
  if (data.tour_overrides) {
    updateData.tour_overrides = { ...existing.tour_overrides, ...data.tour_overrides };
  }
  if (data.smart_tip_overrides) {
    updateData.smart_tip_overrides = { ...existing.smart_tip_overrides, ...data.smart_tip_overrides };
  }
  if (data.banner_overrides) {
    updateData.banner_overrides = { ...existing.banner_overrides, ...data.banner_overrides };
  }
  if (data.checklist_overrides) {
    updateData.checklist_overrides = { ...existing.checklist_overrides, ...data.checklist_overrides };
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

  revalidatePath('/g/themes');
  revalidatePath(`/g/themes/${id}`);
  return theme as GuidelyTheme;
}

/**
 * Set a theme as the default for the agency
 */
export async function setDefaultGuidelyTheme(id: string): Promise<GuidelyTheme> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Verify it's the agency's theme or a system template
  const { data: theme, error: fetchError } = await supabase
    .from('guidely_themes')
    .select('*')
    .eq('id', id)
    .or(`agency_id.eq.${agency.id},is_system.eq.true`)
    .single();

  if (fetchError || !theme) {
    throw new Error('Theme not found');
  }

  // If it's a system template, create a copy first
  if (theme.is_system) {
    const copied = await createThemeFromTemplate(id);
    return setDefaultGuidelyTheme(copied.id);
  }

  // The database trigger handles unsetting other defaults
  const { data: updated, error } = await supabase
    .from('guidely_themes')
    .update({ is_default: true })
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/g/themes');
  return updated as GuidelyTheme;
}

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Delete a theme
 */
export async function deleteGuidelyTheme(id: string): Promise<void> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Verify ownership and not a system template
  const { data: theme, error: fetchError } = await supabase
    .from('guidely_themes')
    .select('is_system')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (fetchError || !theme) {
    throw new Error('Theme not found');
  }

  if (theme.is_system) {
    throw new Error('Cannot delete system templates');
  }

  // Check if any items are using this theme
  const usage = await getThemeUsage(id);
  if (usage.total > 0) {
    throw new Error(
      `Cannot delete theme that is being used by ${usage.total} item(s). Remove the theme from those items first.`
    );
  }

  const { error } = await supabase
    .from('guidely_themes')
    .delete()
    .eq('id', id)
    .eq('agency_id', agency.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/g/themes');
}

/**
 * Duplicate a theme
 */
export async function duplicateGuidelyTheme(id: string): Promise<GuidelyTheme> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Fetch original theme (can be agency's or system template)
  const { data: original, error: fetchError } = await supabase
    .from('guidely_themes')
    .select('*')
    .eq('id', id)
    .or(`agency_id.eq.${agency.id},is_system.eq.true`)
    .single();

  if (fetchError || !original) {
    throw new Error('Theme not found');
  }

  // Create copy
  const themeData = {
    agency_id: agency.id,
    name: `${original.name} (Copy)`,
    description: original.description,
    is_system: false,
    is_default: false,
    colors: original.colors,
    typography: original.typography,
    borders: original.borders,
    shadows: original.shadows,
    avatar: original.avatar,
    buttons: original.buttons,
    tour_overrides: original.tour_overrides,
    smart_tip_overrides: original.smart_tip_overrides,
    banner_overrides: original.banner_overrides,
    checklist_overrides: original.checklist_overrides,
  };

  const { data: duplicate, error } = await supabase
    .from('guidely_themes')
    .insert(themeData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/g/themes');
  return duplicate as GuidelyTheme;
}

// ============================================
// GUIDELY DEFAULTS
// ============================================

/**
 * Get Guidely default theme settings for the agency
 */
export async function getGuidelyDefaults(): Promise<GuidelyDefaults> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const settings = agency.settings as Record<string, unknown> || {};
  const defaults = (settings.guidely_defaults as GuidelyDefaults) || {
    tour_theme_id: null,
    smart_tip_theme_id: null,
    banner_theme_id: null,
    checklist_theme_id: null,
  };

  return defaults;
}

/**
 * Update Guidely default theme settings
 */
export async function updateGuidelyDefaults(
  defaults: Partial<GuidelyDefaults>
): Promise<GuidelyDefaults> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Get current settings
  const currentSettings = (agency.settings as Record<string, unknown>) || {};
  const currentDefaults = (currentSettings.guidely_defaults as GuidelyDefaults) || {
    tour_theme_id: null,
    smart_tip_theme_id: null,
    banner_theme_id: null,
    checklist_theme_id: null,
  };

  // Merge new defaults
  const newDefaults: GuidelyDefaults = {
    ...currentDefaults,
    ...defaults,
  };

  // Update settings
  const newSettings = {
    ...currentSettings,
    guidely_defaults: newDefaults,
  };

  const { error } = await supabase
    .from('agencies')
    .update({ settings: newSettings })
    .eq('id', agency.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/g/themes');
  revalidatePath('/g');
  return newDefaults;
}
