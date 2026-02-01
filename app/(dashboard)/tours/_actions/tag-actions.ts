'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAgency } from '@/lib/auth';
import type { TagColor, GuidelyTag, TagWithUsage } from '@/app/(dashboard)/tours/_lib/tag-constants';

export async function getTags(): Promise<GuidelyTag[]> {
  const supabase = await createClient();
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('guidely_tags')
    .select('*')
    .eq('agency_id', agency.id)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getTagsWithUsage(): Promise<TagWithUsage[]> {
  const supabase = await createClient();
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  // Get all tags
  const { data: tags, error: tagsError } = await supabase
    .from('guidely_tags')
    .select('*')
    .eq('agency_id', agency.id)
    .order('name');

  if (tagsError) throw tagsError;

  // Count usage for each tag across all tables
  const tagsWithUsage: TagWithUsage[] = [];

  for (const tag of tags || []) {
    const [tours, checklists, smartTips, banners] = await Promise.all([
      supabase.from('tours').select('id', { count: 'exact', head: true }).eq('tag_id', tag.id),
      supabase.from('checklists').select('id', { count: 'exact', head: true }).eq('tag_id', tag.id),
      supabase.from('smart_tips').select('id', { count: 'exact', head: true }).eq('tag_id', tag.id),
      supabase.from('banners').select('id', { count: 'exact', head: true }).eq('tag_id', tag.id),
    ]);

    const usageCount =
      (tours.count || 0) +
      (checklists.count || 0) +
      (smartTips.count || 0) +
      (banners.count || 0);

    tagsWithUsage.push({
      ...tag,
      usage_count: usageCount,
    });
  }

  return tagsWithUsage;
}

export async function createTag(data: { name: string; color: TagColor }): Promise<GuidelyTag> {
  const supabase = await createClient();
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const { data: tag, error } = await supabase
    .from('guidely_tags')
    .insert({
      agency_id: agency.id,
      name: data.name.trim(),
      color: data.color,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A tag with this name already exists');
    }
    throw error;
  }

  revalidatePath('/g');
  return tag;
}

export async function updateTag(id: string, data: { name?: string; color?: TagColor }): Promise<GuidelyTag> {
  const supabase = await createClient();
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const updateData: Record<string, string> = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.color !== undefined) updateData.color = data.color;

  const { data: tag, error } = await supabase
    .from('guidely_tags')
    .update(updateData)
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A tag with this name already exists');
    }
    throw error;
  }

  revalidatePath('/g');
  return tag;
}

export async function deleteTag(id: string): Promise<void> {
  const supabase = await createClient();
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('guidely_tags')
    .delete()
    .eq('id', id)
    .eq('agency_id', agency.id);

  if (error) throw error;

  revalidatePath('/g');
}

// Helper functions to assign/remove tags from items
export async function assignTagToTour(tourId: string, tagId: string | null): Promise<void> {
  const supabase = await createClient();
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('tours')
    .update({ tag_id: tagId })
    .eq('id', tourId)
    .eq('agency_id', agency.id);

  if (error) throw error;
  revalidatePath('/g/tours');
}

export async function assignTagToChecklist(checklistId: string, tagId: string | null): Promise<void> {
  const supabase = await createClient();
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('checklists')
    .update({ tag_id: tagId })
    .eq('id', checklistId)
    .eq('agency_id', agency.id);

  if (error) throw error;
  revalidatePath('/g/checklists');
}

export async function assignTagToSmartTip(tipId: string, tagId: string | null): Promise<void> {
  const supabase = await createClient();
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('smart_tips')
    .update({ tag_id: tagId })
    .eq('id', tipId)
    .eq('agency_id', agency.id);

  if (error) throw error;
  revalidatePath('/g/tips');
}

export async function assignTagToBanner(bannerId: string, tagId: string | null): Promise<void> {
  const supabase = await createClient();
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('banners')
    .update({ tag_id: tagId })
    .eq('id', bannerId)
    .eq('agency_id', agency.id);

  if (error) throw error;
  revalidatePath('/g/banners');
}
