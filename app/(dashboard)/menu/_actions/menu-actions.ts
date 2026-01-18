'use server';

import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { GHL_MENU_ITEMS } from '@/lib/constants';
import type { MenuConfig, ColorConfig, MenuPresetDivider } from '@/types/database';

interface CreatePresetData {
  name: string;
  is_default?: boolean;
}

interface CreatePresetFromTemplateData {
  name: string;
  is_default?: boolean;
  config: {
    hidden_items: string[];
    renamed_items: Record<string, string>;
    item_order: string[];
    hidden_banners: string[];
    dividers?: Array<{ id: string; type: string; text: string; visible: boolean }>;
    preview_theme?: string | null;
  };
}

interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

// ============================================
// AUTOSAVE FUNCTIONS (Settings-based, like Loading tab)
// ============================================

export interface MenuSettings {
  menu: MenuConfig | null;
  colors: ColorConfig | null;
}

/**
 * Get current menu settings from agency.settings
 * Used for autosave functionality (not presets)
 */
export async function getMenuSettings(): Promise<MenuSettings> {
  noStore();
  const agency = await getCurrentAgency();
  if (!agency) {
    return { menu: null, colors: null };
  }

  return {
    menu: agency.settings?.menu || null,
    colors: agency.settings?.colors || null,
  };
}

/**
 * Save menu configuration to agency.settings
 * Used for autosave functionality (not presets)
 */
export async function saveMenuSettings(config: MenuConfig): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();
    const currentSettings = agency.settings || {};

    const { error } = await supabase
      .from('agencies')
      .update({
        settings: {
          ...currentSettings,
          menu: config,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', agency.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/menu');
    revalidatePath('/theme-builder');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save menu settings' };
  }
}

// ============================================
// PRESET FUNCTIONS (Legacy - for named presets)
// ============================================

// Get all menu presets for the current agency
export async function getMenuPresets() {
  noStore();
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return [];
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('menu_presets')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

export async function createMenuPreset(data: CreatePresetData): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!data.name || data.name.trim() === '') {
      return { success: false, error: 'Name is required' };
    }

    const supabase = createAdminClient();

    // If setting as default, unset other defaults first
    if (data.is_default) {
      await supabase
        .from('menu_presets')
        .update({ is_default: false })
        .eq('agency_id', agency.id);
    }

    const { data: preset, error } = await supabase
      .from('menu_presets')
      .insert({
        agency_id: agency.id,
        name: data.name.trim(),
        is_default: data.is_default || false,
        config: {
          hidden_items: [],
          renamed_items: {},
          item_order: GHL_MENU_ITEMS.map((item) => item.id),
          hidden_banners: [],
        },
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/menu');
    revalidatePath('/theme-builder');
    return { success: true, data: preset };
  } catch (error) {
    console.error('Error creating menu preset:', error);
    return { success: false, error: 'Failed to create preset' };
  }
}

export async function createMenuPresetFromTemplate(
  data: CreatePresetFromTemplateData
): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!data.name || data.name.trim() === '') {
      return { success: false, error: 'Name is required' };
    }

    const supabase = createAdminClient();

    // If setting as default, unset other defaults first
    if (data.is_default) {
      await supabase
        .from('menu_presets')
        .update({ is_default: false })
        .eq('agency_id', agency.id);
    }

    const { data: preset, error } = await supabase
      .from('menu_presets')
      .insert({
        agency_id: agency.id,
        name: data.name.trim(),
        is_default: data.is_default || false,
        config: data.config,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/menu');
    revalidatePath('/theme-builder');
    return { success: true, data: preset };
  } catch (error) {
    console.error('Error creating menu preset:', error);
    return { success: false, error: 'Failed to create preset' };
  }
}

export async function deleteMenuPreset(presetId: string): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('menu_presets')
      .delete()
      .eq('id', presetId)
      .eq('agency_id', agency.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/menu');
    revalidatePath('/theme-builder');
    return { success: true };
  } catch (error) {
    console.error('Error deleting menu preset:', error);
    return { success: false, error: 'Failed to delete preset' };
  }
}

export async function setDefaultPreset(presetId: string): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();

    // Unset all defaults first
    await supabase
      .from('menu_presets')
      .update({ is_default: false })
      .eq('agency_id', agency.id);

    // Set the new default
    const { error } = await supabase
      .from('menu_presets')
      .update({ is_default: true })
      .eq('id', presetId)
      .eq('agency_id', agency.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/menu');
    revalidatePath('/theme-builder');
    return { success: true };
  } catch (error) {
    console.error('Error setting default preset:', error);
    return { success: false, error: 'Failed to set default preset' };
  }
}

export async function updatePresetConfig(
  presetId: string,
  config: {
    hidden_items: string[];
    renamed_items: Record<string, string>;
    item_order: string[];
    hidden_banners: string[];
    dividers?: Array<{ id: string; type: string; text: string; visible: boolean }>;
    preview_theme?: string | null;
  }
): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();

    const { data: preset, error } = await supabase
      .from('menu_presets')
      .update({ config })
      .eq('id', presetId)
      .eq('agency_id', agency.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/menu');
    revalidatePath(`/menu/${presetId}`);
    revalidatePath('/theme-builder');
    return { success: true, data: preset };
  } catch {
    return { success: false, error: 'Failed to update preset' };
  }
}
