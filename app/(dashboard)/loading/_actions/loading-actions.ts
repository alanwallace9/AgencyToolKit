'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { LoadingConfig, ColorConfig } from '@/types/database';

interface ActionResult {
  success: boolean;
  error?: string;
}

export interface LoadingSettings {
  loading: LoadingConfig | null;
  colors: ColorConfig | null;
}

export async function getLoadingSettings(): Promise<LoadingSettings> {
  const agency = await getCurrentAgency();
  if (!agency) {
    return { loading: null, colors: null };
  }

  return {
    loading: agency.settings?.loading || null,
    colors: agency.settings?.colors || null,
  };
}

export async function saveLoadingAnimation(config: LoadingConfig): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    // Use admin client for mutations (RLS bypassed - we verify auth via getCurrentAgency above)
    const supabase = createAdminClient();

    // Get current settings to merge
    const currentSettings = agency.settings || {};

    const { error } = await supabase
      .from('agencies')
      .update({
        settings: {
          ...currentSettings,
          loading: config,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', agency.id);

    if (error) {
      console.error('Error saving loading animation:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/loading');
    return { success: true };
  } catch (error) {
    console.error('Error saving loading animation:', error);
    return { success: false, error: 'Failed to save animation' };
  }
}
