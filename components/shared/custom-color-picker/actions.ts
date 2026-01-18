'use server';

/**
 * Server Actions for Color Picker
 *
 * Handles database persistence for saved colors
 */

import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_SAVED_COLORS = 20;

/**
 * Get saved colors from agency settings
 */
export async function getSavedColorsFromDb(): Promise<string[]> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) return [];

    return agency.settings?.saved_colors || [];
  } catch (error) {
    console.error('Error fetching saved colors:', error);
    return [];
  }
}

/**
 * Save colors to agency settings
 */
export async function saveSavedColorsToDb(colors: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = createAdminClient();

    // Limit to max colors
    const limitedColors = colors.slice(0, MAX_SAVED_COLORS);

    const { error } = await supabase
      .from('agencies')
      .update({
        settings: {
          ...agency.settings,
          saved_colors: limitedColors,
        },
      })
      .eq('id', agency.id);

    if (error) {
      console.error('Error saving colors:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving colors:', error);
    return { success: false, error: 'Failed to save colors' };
  }
}

/**
 * Add a single color to saved colors
 */
export async function addSavedColor(color: string): Promise<{ success: boolean; error?: string }> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Not authenticated' };
    }

    const currentColors = agency.settings?.saved_colors || [];

    // Check for duplicates
    if (currentColors.includes(color)) {
      return { success: true }; // Already exists, no-op
    }

    // Check max limit
    if (currentColors.length >= MAX_SAVED_COLORS) {
      return { success: false, error: 'Maximum colors reached' };
    }

    const newColors = [...currentColors, color];
    return saveSavedColorsToDb(newColors);
  } catch (error) {
    console.error('Error adding color:', error);
    return { success: false, error: 'Failed to add color' };
  }
}

/**
 * Remove a color from saved colors
 */
export async function removeSavedColor(color: string): Promise<{ success: boolean; error?: string }> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Not authenticated' };
    }

    const currentColors: string[] = agency.settings?.saved_colors || [];
    const newColors = currentColors.filter((c: string) => c !== color);

    return saveSavedColorsToDb(newColors);
  } catch (error) {
    console.error('Error removing color:', error);
    return { success: false, error: 'Failed to remove color' };
  }
}
