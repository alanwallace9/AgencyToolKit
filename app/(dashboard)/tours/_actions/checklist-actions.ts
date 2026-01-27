'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Checklist, ChecklistItem, CustomerChecklistProgress } from '@/types/database';
import {
  DEFAULT_WIDGET,
  DEFAULT_ON_COMPLETE,
  DEFAULT_TARGETING,
  createDefaultItem,
  CHECKLIST_TEMPLATES,
} from '../_lib/checklist-defaults';

// ============================================
// CRUD Operations
// ============================================

export async function getChecklists(): Promise<Checklist[]> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('checklists')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Checklist[]) || [];
}

export async function getChecklist(id: string): Promise<Checklist | null> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('checklists')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as Checklist;
}

export async function createChecklist(data: {
  name: string;
  title?: string;
  description?: string;
  items?: ChecklistItem[];
}): Promise<Checklist> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: checklist, error } = await supabase
    .from('checklists')
    .insert({
      agency_id: agency.id,
      name: data.name,
      title: data.title || 'Get started',
      description: data.description || null,
      items: data.items || [createDefaultItem(0)],
      widget: DEFAULT_WIDGET,
      on_complete: DEFAULT_ON_COMPLETE,
      targeting: DEFAULT_TARGETING,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
  return checklist as Checklist;
}

export async function updateChecklist(
  id: string,
  data: Partial<Omit<Checklist, 'id' | 'agency_id' | 'created_at' | 'updated_at'>>
): Promise<Checklist> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: checklist, error } = await supabase
    .from('checklists')
    .update(data)
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
  revalidatePath(`/tours/checklists/${id}`);
  return checklist as Checklist;
}

export async function deleteChecklist(id: string): Promise<void> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('checklists')
    .delete()
    .eq('id', id)
    .eq('agency_id', agency.id);

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
}

export async function duplicateChecklist(id: string): Promise<Checklist> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();

  // Get the original checklist
  const { data: original, error: fetchError } = await supabase
    .from('checklists')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (!original) throw new Error('Checklist not found');

  // Create a copy with new IDs for items
  const newItems = (original.items as ChecklistItem[]).map(item => ({
    ...item,
    id: crypto.randomUUID(),
  }));

  const { data: checklist, error } = await supabase
    .from('checklists')
    .insert({
      agency_id: agency.id,
      name: `${original.name} (Copy)`,
      title: original.title,
      description: original.description,
      items: newItems,
      widget: original.widget,
      on_complete: original.on_complete,
      targeting: original.targeting,
      theme_id: original.theme_id,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
  return checklist as Checklist;
}

// ============================================
// Status Management
// ============================================

export async function publishChecklist(id: string): Promise<Checklist> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: checklist, error } = await supabase
    .from('checklists')
    .update({
      status: 'live',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
  revalidatePath(`/tours/checklists/${id}`);
  return checklist as Checklist;
}

export async function unpublishChecklist(id: string): Promise<Checklist> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: checklist, error } = await supabase
    .from('checklists')
    .update({ status: 'draft' })
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
  revalidatePath(`/tours/checklists/${id}`);
  return checklist as Checklist;
}

export async function archiveChecklist(id: string): Promise<Checklist> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data: checklist, error } = await supabase
    .from('checklists')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/tours');
  revalidatePath(`/tours/checklists/${id}`);
  return checklist as Checklist;
}

// ============================================
// Progress Tracking (for dashboard display)
// ============================================

export interface ChecklistWithStats extends Checklist {
  stats: {
    total_customers: number;
    not_started: number;
    in_progress: number;
    completed: number;
    dismissed: number;
  };
}

export async function getChecklistsWithStats(): Promise<ChecklistWithStats[]> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();

  // Get checklists
  const { data: checklists, error: checklistError } = await supabase
    .from('checklists')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false });

  if (checklistError) throw new Error(checklistError.message);
  if (!checklists || checklists.length === 0) return [];

  // Get progress for all checklists
  const checklistIds = checklists.map(c => c.id);
  const { data: progress, error: progressError } = await supabase
    .from('customer_checklist_progress')
    .select('checklist_id, status')
    .in('checklist_id', checklistIds);

  if (progressError) throw new Error(progressError.message);

  // Calculate stats for each checklist
  return checklists.map(checklist => {
    const checklistProgress = (progress || []).filter(p => p.checklist_id === checklist.id);
    return {
      ...checklist,
      stats: {
        total_customers: checklistProgress.length,
        not_started: checklistProgress.filter(p => p.status === 'not_started').length,
        in_progress: checklistProgress.filter(p => p.status === 'in_progress').length,
        completed: checklistProgress.filter(p => p.status === 'completed').length,
        dismissed: checklistProgress.filter(p => p.status === 'dismissed').length,
      },
    };
  }) as ChecklistWithStats[];
}

export async function getChecklistProgress(checklistId: string): Promise<CustomerChecklistProgress[]> {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('customer_checklist_progress')
    .select(`
      *,
      customer:customers(id, name, ghl_location_id)
    `)
    .eq('checklist_id', checklistId);

  if (error) throw new Error(error.message);
  return (data as CustomerChecklistProgress[]) || [];
}

// ============================================
// System Templates
// ============================================

export async function createChecklistFromTemplate(templateId: string): Promise<Checklist> {
  const template = CHECKLIST_TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error('Template not found');

  // Generate new UUIDs for items
  const items = template.items.map(item => ({
    ...item,
    id: crypto.randomUUID(),
  }));

  return createChecklist({
    name: template.name,
    title: template.title,
    description: template.description,
    items,
  });
}
