'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { TabActivationState } from '../_context/theme-status-context';

interface ActionResult {
  success: boolean;
  error?: string;
}

export interface ThemeSettings {
  activeTabs: TabActivationState;
  lastSaved: string | null;
}

/**
 * Get theme activation settings for the current agency
 */
export async function getThemeSettings(): Promise<ThemeSettings> {
  const agency = await getCurrentAgency();
  if (!agency) {
    return {
      activeTabs: { login: false, loading: false, menu: false, colors: false },
      lastSaved: null,
    };
  }

  // Get activation state from agency settings
  // Default to false for all tabs (new agencies start with nothing active)
  const settings = agency.settings || {};

  return {
    activeTabs: {
      login: settings.login_active ?? false,
      loading: settings.loading_active ?? false,
      menu: settings.menu_active ?? false,
      colors: settings.colors_active ?? false,
    },
    lastSaved: agency.updated_at || null,
  };
}

/**
 * Save tab activation state
 */
export async function saveTabActivation(
  tabId: keyof TabActivationState,
  active: boolean
): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();
    const currentSettings = agency.settings || {};

    // Map tab ID to settings key
    const settingsKey = `${tabId}_active` as const;

    const { error } = await supabase
      .from('agencies')
      .update({
        settings: {
          ...currentSettings,
          [settingsKey]: active,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', agency.id);

    if (error) {
      console.error('Error saving tab activation:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/theme');
    return { success: true };
  } catch (error) {
    console.error('Error saving tab activation:', error);
    return { success: false, error: 'Failed to save activation state' };
  }
}

/**
 * Save all tab activations at once
 */
export async function saveAllTabActivations(
  activeTabs: TabActivationState
): Promise<ActionResult> {
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
          login_active: activeTabs.login,
          loading_active: activeTabs.loading,
          menu_active: activeTabs.menu,
          colors_active: activeTabs.colors,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', agency.id);

    if (error) {
      console.error('Error saving tab activations:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/theme');
    return { success: true };
  } catch (error) {
    console.error('Error saving tab activations:', error);
    return { success: false, error: 'Failed to save activation states' };
  }
}
