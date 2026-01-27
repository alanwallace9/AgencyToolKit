'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Banner } from '@/types/database';
import {
  DEFAULT_ACTION,
  DEFAULT_TARGETING,
  DEFAULT_SCHEDULE,
  DEFAULT_TRIAL_TRIGGERS,
  BANNER_TEMPLATES,
} from '../_lib/banner-defaults';

// ============================================
// CRUD Operations
// ============================================

export async function getBanners(): Promise<Banner[]> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Banner[]) || [];
}

export async function getBanner(id: string): Promise<Banner | null> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as Banner;
}

export async function createBanner(data: {
  name: string;
  banner_type?: 'standard' | 'trial_expiration';
  content?: string;
}): Promise<Banner> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: banner, error } = await supabase
    .from('banners')
    .insert({
      agency_id: agency.id,
      name: data.name,
      banner_type: data.banner_type || 'standard',
      content: data.content || '',
      action: DEFAULT_ACTION,
      targeting: DEFAULT_TARGETING,
      schedule: DEFAULT_SCHEDULE,
      trial_triggers: DEFAULT_TRIAL_TRIGGERS,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
  return banner as Banner;
}

export async function updateBanner(
  id: string,
  data: Partial<Omit<Banner, 'id' | 'agency_id' | 'created_at' | 'updated_at'>>
): Promise<Banner> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: banner, error } = await supabase
    .from('banners')
    .update(data)
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
  revalidatePath(`/tours/banners/${id}`);
  return banner as Banner;
}

export async function deleteBanner(id: string): Promise<void> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id)
    .eq('agency_id', agency.id);

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
}

export async function duplicateBanner(id: string): Promise<Banner> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();

  // Get the original banner
  const { data: original, error: fetchError } = await supabase
    .from('banners')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (!original) throw new Error('Banner not found');

  const { data: banner, error } = await supabase
    .from('banners')
    .insert({
      agency_id: agency.id,
      name: `${original.name} (Copy)`,
      banner_type: original.banner_type,
      content: original.content,
      action: original.action,
      position: original.position,
      display_mode: original.display_mode,
      style_preset: original.style_preset,
      theme_id: original.theme_id,
      dismissible: original.dismissible,
      dismiss_duration: original.dismiss_duration,
      priority: original.priority,
      exclusive: original.exclusive,
      targeting: original.targeting,
      schedule: original.schedule,
      trial_triggers: original.trial_triggers,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
  return banner as Banner;
}

// ============================================
// Status Management
// ============================================

export async function publishBanner(id: string): Promise<Banner> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();

  // Get the banner to check schedule
  const { data: existing } = await supabase
    .from('banners')
    .select('schedule')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  // Determine status based on schedule
  let newStatus = 'live';
  if (existing?.schedule?.mode === 'range' && existing.schedule.start_date) {
    const startDate = new Date(existing.schedule.start_date);
    if (startDate > new Date()) {
      newStatus = 'scheduled';
    }
  }

  const { data: banner, error } = await supabase
    .from('banners')
    .update({
      status: newStatus,
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
  revalidatePath(`/tours/banners/${id}`);
  return banner as Banner;
}

export async function unpublishBanner(id: string): Promise<Banner> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: banner, error } = await supabase
    .from('banners')
    .update({ status: 'draft' })
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
  revalidatePath(`/tours/banners/${id}`);
  return banner as Banner;
}

export async function archiveBanner(id: string): Promise<Banner> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: banner, error } = await supabase
    .from('banners')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
  revalidatePath(`/tours/banners/${id}`);
  return banner as Banner;
}

// ============================================
// Stats & Analytics
// ============================================

export interface BannerWithStats extends Banner {
  stats: {
    ctr: number; // Click-through rate (clicks / views * 100)
    dismiss_rate: number; // Dismiss rate (dismisses / views * 100)
  };
}

export async function getBannersWithStats(): Promise<BannerWithStats[]> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: banners, error } = await supabase
    .from('banners')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  if (!banners || banners.length === 0) return [];

  return banners.map(banner => ({
    ...banner,
    stats: {
      ctr: banner.view_count > 0
        ? Math.round((banner.click_count / banner.view_count) * 100)
        : 0,
      dismiss_rate: banner.view_count > 0
        ? Math.round((banner.dismiss_count / banner.view_count) * 100)
        : 0,
    },
  })) as BannerWithStats[];
}

// ============================================
// Analytics Tracking (called from API route)
// ============================================

export async function trackBannerEvent(
  bannerId: string,
  eventType: 'view' | 'click' | 'dismiss'
): Promise<void> {
  const supabase = createAdminClient();

  const updateField =
    eventType === 'view' ? 'view_count' :
    eventType === 'click' ? 'click_count' :
    'dismiss_count';

  const { error } = await supabase.rpc('increment_banner_count', {
    p_banner_id: bannerId,
    p_field: updateField,
  });

  // If RPC doesn't exist, fall back to direct update
  if (error) {
    await supabase
      .from('banners')
      .update({ [updateField]: supabase.rpc('increment', { x: 1 }) })
      .eq('id', bannerId);
  }
}

// ============================================
// Templates
// ============================================

export async function createBannerFromTemplate(templateId: string): Promise<Banner> {
  const template = BANNER_TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error('Template not found');

  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: banner, error } = await supabase
    .from('banners')
    .insert({
      agency_id: agency.id,
      name: template.name,
      banner_type: template.banner_type,
      content: template.content,
      style_preset: template.style_preset,
      action: template.action,
      targeting: DEFAULT_TARGETING,
      schedule: DEFAULT_SCHEDULE,
      trial_triggers: template.banner_type === 'trial_expiration'
        ? DEFAULT_TRIAL_TRIGGERS
        : DEFAULT_TRIAL_TRIGGERS,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
  return banner as Banner;
}

// ============================================
// Get Templates (for UI display)
// ============================================

export async function getBannerTemplates() {
  return BANNER_TEMPLATES;
}
