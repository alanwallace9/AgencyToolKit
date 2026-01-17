'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ColorConfig } from '@/types/database';

interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface ColorPreset {
  id: string;
  agency_id: string;
  name: string;
  is_default: boolean;
  colors: ColorConfig;
  created_at: string;
  updated_at: string;
}

interface CreatePresetData {
  name: string;
  colors: ColorConfig;
  is_default?: boolean;
}

interface UpdatePresetData {
  name?: string;
  colors?: ColorConfig;
  is_default?: boolean;
}

/**
 * Get all color presets for the current agency
 */
export async function getColorPresets(): Promise<ColorPreset[]> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return [];
    }

    const supabase = createAdminClient();

    const { data: presets, error } = await supabase
      .from('color_presets')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching color presets:', error);
      return [];
    }

    return presets || [];
  } catch (error) {
    console.error('Error fetching color presets:', error);
    return [];
  }
}

/**
 * Get the default color preset (or agency colors from settings)
 */
export async function getDefaultColors(): Promise<ColorConfig | null> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return null;
    }

    const supabase = createAdminClient();

    // First check for a default preset
    const { data: defaultPreset } = await supabase
      .from('color_presets')
      .select('colors')
      .eq('agency_id', agency.id)
      .eq('is_default', true)
      .single();

    if (defaultPreset) {
      return defaultPreset.colors as ColorConfig;
    }

    // Fall back to agency settings
    return agency.settings?.colors || null;
  } catch (error) {
    console.error('Error fetching default colors:', error);
    return null;
  }
}

/**
 * Create a new color preset
 */
export async function createColorPreset(data: CreatePresetData): Promise<ActionResult> {
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
        .from('color_presets')
        .update({ is_default: false })
        .eq('agency_id', agency.id);
    }

    const { data: preset, error } = await supabase
      .from('color_presets')
      .insert({
        agency_id: agency.id,
        name: data.name.trim(),
        colors: data.colors,
        is_default: data.is_default || false,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/colors');
    return { success: true, data: preset };
  } catch (error) {
    console.error('Error creating color preset:', error);
    return { success: false, error: 'Failed to create preset' };
  }
}

/**
 * Update an existing color preset
 */
export async function updateColorPreset(
  presetId: string,
  data: UpdatePresetData
): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();

    // If setting as default, unset other defaults first
    if (data.is_default) {
      await supabase
        .from('color_presets')
        .update({ is_default: false })
        .eq('agency_id', agency.id);
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.colors !== undefined) updateData.colors = data.colors;
    if (data.is_default !== undefined) updateData.is_default = data.is_default;

    const { data: preset, error } = await supabase
      .from('color_presets')
      .update(updateData)
      .eq('id', presetId)
      .eq('agency_id', agency.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/colors');
    return { success: true, data: preset };
  } catch (error) {
    console.error('Error updating color preset:', error);
    return { success: false, error: 'Failed to update preset' };
  }
}

/**
 * Delete a color preset
 */
export async function deleteColorPreset(presetId: string): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('color_presets')
      .delete()
      .eq('id', presetId)
      .eq('agency_id', agency.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/colors');
    return { success: true };
  } catch (error) {
    console.error('Error deleting color preset:', error);
    return { success: false, error: 'Failed to delete preset' };
  }
}

/**
 * Set a preset as the default
 */
export async function setDefaultColorPreset(presetId: string): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();

    // Unset all defaults first
    await supabase
      .from('color_presets')
      .update({ is_default: false })
      .eq('agency_id', agency.id);

    // Set the new default
    const { error } = await supabase
      .from('color_presets')
      .update({ is_default: true })
      .eq('id', presetId)
      .eq('agency_id', agency.id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Also update the agency settings for backwards compatibility
    const { data: preset } = await supabase
      .from('color_presets')
      .select('colors')
      .eq('id', presetId)
      .single();

    if (preset) {
      const currentSettings = agency.settings || {};
      await supabase
        .from('agencies')
        .update({
          settings: {
            ...currentSettings,
            colors: preset.colors,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', agency.id);
    }

    revalidatePath('/colors');
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Error setting default color preset:', error);
    return { success: false, error: 'Failed to set default preset' };
  }
}

/**
 * Extract brand colors from a website URL
 */
export async function extractColorsFromUrl(url: string): Promise<ActionResult> {
  try {
    // Validate URL
    let parsedUrl: URL;
    try {
      // Add https if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      parsedUrl = new URL(url);
    } catch {
      return { success: false, error: 'Invalid URL format' };
    }

    // Fetch the page
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ColorExtractor/1.0)',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return { success: false, error: `Failed to fetch URL: ${response.status}` };
    }

    const html = await response.text();

    // Extract colors from the HTML/CSS
    const colors: string[] = [];

    // Match hex colors (6 and 3 digit)
    const hexMatches = html.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})(?![0-9A-Fa-f])/g) || [];

    // Match rgb/rgba colors
    const rgbMatches = html.match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi) || [];
    const rgbaMatches = html.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/gi) || [];

    // Convert rgb to hex
    const rgbToHex = (rgb: string): string | null => {
      const match = rgb.match(/\d+/g);
      if (!match || match.length < 3) return null;
      const [r, g, b] = match.map(Number);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    // Normalize 3-digit hex to 6-digit
    const normalizeHex = (hex: string): string => {
      if (hex.length === 4) {
        return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
      }
      return hex.toLowerCase();
    };

    // Collect all hex colors
    hexMatches.forEach(hex => {
      const normalized = normalizeHex(hex);
      if (!colors.includes(normalized)) {
        colors.push(normalized);
      }
    });

    // Convert and add RGB colors
    [...rgbMatches, ...rgbaMatches].forEach(rgb => {
      const hex = rgbToHex(rgb);
      if (hex && !colors.includes(hex.toLowerCase())) {
        colors.push(hex.toLowerCase());
      }
    });

    // Filter out common non-brand colors (black, white, transparent, grays)
    const isInterestingColor = (hex: string): boolean => {
      const c = hex.toLowerCase();
      // Skip pure black, white, and common transparent values
      if (c === '#000000' || c === '#ffffff' || c === '#000' || c === '#fff') return false;
      // Skip common grays
      if (/^#([0-9a-f])\1\1\1\1\1$/.test(c)) return false;
      return true;
    };

    const filteredColors = colors.filter(isInterestingColor);

    // Sort by frequency (we already have unique colors, so just take first 6)
    const topColors = filteredColors.slice(0, 6);

    if (topColors.length === 0) {
      return { success: false, error: 'No brand colors found on this page' };
    }

    return { success: true, data: topColors };
  } catch (error) {
    console.error('Error extracting colors from URL:', error);
    return { success: false, error: 'Failed to extract colors from URL' };
  }
}

/**
 * Save colors directly to agency settings (for quick edits without presets)
 */
export async function saveAgencyColors(colors: ColorConfig): Promise<ActionResult> {
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
          colors,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', agency.id);

    if (error) {
      console.error('Error saving agency colors:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/colors');
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Error saving agency colors:', error);
    return { success: false, error: 'Failed to save colors' };
  }
}
