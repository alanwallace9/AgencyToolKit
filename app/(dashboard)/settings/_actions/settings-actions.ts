'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function updateGhlSettings(data: {
  ghl_domain: string | null;
  builder_auto_close: boolean;
}) {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Validate GHL domain format if provided
  if (data.ghl_domain) {
    try {
      const url = new URL(data.ghl_domain);
      // Ensure it's a valid URL with https
      if (!url.protocol.startsWith('http')) {
        throw new Error('Invalid URL protocol');
      }
      // Normalize: remove trailing slash
      data.ghl_domain = url.origin;
    } catch {
      throw new Error('Invalid GHL domain URL. Please enter a valid URL (e.g., https://app.youragency.com)');
    }
  }

  const { error } = await supabase
    .from('agencies')
    .update({
      ghl_domain: data.ghl_domain,
      builder_auto_close: data.builder_auto_close,
    })
    .eq('id', agency.id);

  if (error) {
    throw new Error('Failed to update settings: ' + error.message);
  }

  revalidatePath('/settings');
  return { success: true };
}
