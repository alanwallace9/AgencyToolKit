'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SmartTip } from '@/types/database';

// ============================================
// Default Values (internal only - "use server" can only export async functions)
// ============================================

const DEFAULT_TARGETING = {
  url_targeting: {
    mode: 'all' as const,
    patterns: [] as { type: 'wildcard'; value: string }[],
  },
  user_targeting: {
    type: 'all' as const,
  },
  devices: ['desktop', 'tablet', 'mobile'] as const,
};

const DEFAULT_ELEMENT = {
  selector: '',
  metadata: undefined,
};

// ============================================
// CRUD Operations
// ============================================

export async function getSmartTips(): Promise<SmartTip[]> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('smart_tips')
    .select('*')
    .eq('agency_id', agency.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as SmartTip[]) || [];
}

export async function getSmartTip(id: string): Promise<SmartTip | null> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('smart_tips')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as SmartTip;
}

export async function createSmartTip(data: {
  name: string;
  content?: string;
  trigger?: 'hover' | 'click' | 'focus';
  position?: 'top' | 'right' | 'bottom' | 'left' | 'auto';
}): Promise<SmartTip> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: tip, error } = await supabase
    .from('smart_tips')
    .insert({
      agency_id: agency.id,
      name: data.name,
      content: data.content || '',
      trigger: data.trigger || 'hover',
      position: data.position || 'auto',
      element: DEFAULT_ELEMENT,
      targeting: DEFAULT_TARGETING,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/g/tips');
  return tip as SmartTip;
}

export async function updateSmartTip(
  id: string,
  data: Partial<Omit<SmartTip, 'id' | 'agency_id' | 'created_at' | 'updated_at'>>
): Promise<SmartTip> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: tip, error } = await supabase
    .from('smart_tips')
    .update(data)
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/g/tips');
  revalidatePath(`/g/tips/${id}`);
  return tip as SmartTip;
}

export async function deleteSmartTip(id: string): Promise<void> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('smart_tips')
    .delete()
    .eq('id', id)
    .eq('agency_id', agency.id);

  if (error) throw new Error(error.message);

  revalidatePath('/g/tips');
}

export async function duplicateSmartTip(id: string): Promise<SmartTip> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();

  // Get the original tip
  const { data: original, error: fetchError } = await supabase
    .from('smart_tips')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (!original) throw new Error('Smart tip not found');

  const { data: tip, error } = await supabase
    .from('smart_tips')
    .insert({
      agency_id: agency.id,
      name: `${original.name} (Copy)`,
      content: original.content,
      trigger: original.trigger,
      position: original.position,
      element: original.element,
      targeting: original.targeting,
      theme_id: original.theme_id,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/g/tips');
  return tip as SmartTip;
}

// ============================================
// Status Management
// ============================================

export async function publishSmartTip(id: string): Promise<SmartTip> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: tip, error } = await supabase
    .from('smart_tips')
    .update({
      status: 'live',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/g/tips');
  revalidatePath(`/g/tips/${id}`);
  return tip as SmartTip;
}

export async function unpublishSmartTip(id: string): Promise<SmartTip> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: tip, error } = await supabase
    .from('smart_tips')
    .update({ status: 'draft' })
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/g/tips');
  revalidatePath(`/g/tips/${id}`);
  return tip as SmartTip;
}

export async function archiveSmartTip(id: string): Promise<SmartTip> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: tip, error } = await supabase
    .from('smart_tips')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/g/tips');
  revalidatePath(`/g/tips/${id}`);
  return tip as SmartTip;
}

// ============================================
// Stats (for list display)
// ============================================

// SmartTipWithStats type - same as SmartTip for now, analytics deferred to backlog
// Note: "use server" files can only export async functions, so we use SmartTip directly

export async function getSmartTipsWithStats(): Promise<SmartTip[]> {
  const tips = await getSmartTips();
  return tips;
}

// ============================================
// Reordering
// ============================================

export async function reorderSmartTips(orderedIds: string[]): Promise<void> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();

  // Update each tip's sort_order based on its position in the array
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('smart_tips')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('agency_id', agency.id)
  );

  await Promise.all(updates);

  revalidatePath('/g/tips');
}
