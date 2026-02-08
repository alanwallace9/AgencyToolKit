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

export async function updateAgencyName(name: string) {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  if (!name || name.trim().length === 0) {
    throw new Error('Agency name cannot be empty');
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('agencies')
    .update({ name: name.trim() })
    .eq('id', agency.id);

  if (error) {
    throw new Error('Failed to update agency name: ' + error.message);
  }

  revalidatePath('/settings');
  return { success: true };
}

// Extract a GHL Location ID from a URL or return the raw string
function extractLocationId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/location\/([a-zA-Z0-9]+)/);
  return match ? match[1] : trimmed;
}

export async function addExcludedLocation(rawInput: string) {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const locationId = extractLocationId(rawInput);
  if (!locationId) {
    throw new Error('Location ID cannot be empty');
  }

  const supabase = createAdminClient();

  // Get current locations and normalize any that were stored as URLs
  const currentLocations: string[] = agency.settings?.whitelisted_locations || [];
  const normalizedCurrent = currentLocations.map(extractLocationId);

  // Check if already exists (comparing extracted IDs)
  if (normalizedCurrent.includes(locationId)) {
    throw new Error('This location is already excluded');
  }

  // Save with normalized IDs (cleans up any old URL entries)
  const updatedLocations = [...normalizedCurrent, locationId];

  const { error } = await supabase
    .from('agencies')
    .update({
      settings: {
        ...agency.settings,
        whitelisted_locations: updatedLocations,
      },
    })
    .eq('id', agency.id);

  if (error) {
    throw new Error('Failed to add excluded location: ' + error.message);
  }

  revalidatePath('/settings');
  return { success: true };
}

export async function removeExcludedLocation(rawInput: string) {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const locationId = extractLocationId(rawInput);

  const supabase = createAdminClient();

  // Get current locations, normalize, then filter
  const currentLocations: string[] = agency.settings?.whitelisted_locations || [];
  const updatedLocations = currentLocations
    .map(extractLocationId)
    .filter((id) => id !== locationId);

  const { error } = await supabase
    .from('agencies')
    .update({
      settings: {
        ...agency.settings,
        whitelisted_locations: updatedLocations,
      },
    })
    .eq('id', agency.id);

  if (error) {
    throw new Error('Failed to remove excluded location: ' + error.message);
  }

  revalidatePath('/settings');
  return { success: true };
}

export async function deleteAccount() {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // TODO: When Stripe is integrated, cancel subscription here
  // if (agency.stripe_subscription_id) {
  //   await stripe.subscriptions.cancel(agency.stripe_subscription_id);
  // }

  // Soft delete - set deleted_at timestamp
  const { error } = await supabase
    .from('agencies')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', agency.id);

  if (error) {
    throw new Error('Failed to delete account: ' + error.message);
  }

  // Note: Clerk signOut is handled client-side after this action returns
  revalidatePath('/');
  return { success: true };
}
