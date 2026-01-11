'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { GHL_MENU_ITEMS } from '@/lib/constants';

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
  };
}

interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
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

    const supabase = await createClient();

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

    const supabase = await createClient();

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

    const supabase = await createClient();

    const { error } = await supabase
      .from('menu_presets')
      .delete()
      .eq('id', presetId)
      .eq('agency_id', agency.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/menu');
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

    const supabase = await createClient();

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
  }
): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

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
    return { success: true, data: preset };
  } catch (error) {
    console.error('Error updating preset config:', error);
    return { success: false, error: 'Failed to update preset' };
  }
}
