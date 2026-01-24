'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAgency } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { ImageTemplate, ImageTemplateTextConfig } from '@/types/database';
import { storage } from '@/lib/storage';
import { DEFAULT_TEXT_CONFIG } from '../_lib/defaults';

export async function getImageTemplates(): Promise<ImageTemplate[]> {
  const agency = await getCurrentAgency();
  if (!agency) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('image_templates')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching image templates:', error);
    return [];
  }

  return data || [];
}

export async function getImageTemplate(id: string): Promise<ImageTemplate | null> {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('image_templates')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (error) {
    console.error('Error fetching image template:', error);
    return null;
  }

  return data;
}

export async function createImageTemplate(input: {
  name: string;
  base_image_url: string;
  base_image_width: number;
  base_image_height: number;
  customer_id?: string | null;
}): Promise<{ success: true; template: ImageTemplate } | { success: false; error: string }> {
  const agency = await getCurrentAgency();
  if (!agency) {
    return { success: false, error: 'Unauthorized' };
  }

  if (agency.plan !== 'pro') {
    return { success: false, error: 'Image personalization requires Pro plan' };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('image_templates')
    .insert({
      agency_id: agency.id,
      name: input.name,
      base_image_url: input.base_image_url,
      base_image_width: input.base_image_width,
      base_image_height: input.base_image_height,
      customer_id: input.customer_id || null,
      text_config: DEFAULT_TEXT_CONFIG,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating image template:', error);
    return { success: false, error: `Failed to create template: ${error.message}` };
  }

  revalidatePath('/images');
  return { success: true, template: data };
}

export async function updateImageTemplate(
  id: string,
  updates: Partial<{
    name: string;
    base_image_url: string;
    base_image_width: number;
    base_image_height: number;
    text_config: ImageTemplateTextConfig;
    customer_id: string | null;
  }>
): Promise<{ success: true; template: ImageTemplate } | { success: false; error: string }> {
  const agency = await getCurrentAgency();
  if (!agency) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('image_templates')
    .update(updates)
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating image template:', error);
    return { success: false, error: 'Failed to update template' };
  }

  revalidatePath('/images');
  revalidatePath(`/images/${id}`);
  return { success: true, template: data };
}

export async function deleteImageTemplate(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  const agency = await getCurrentAgency();
  if (!agency) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = createAdminClient();

  // First get the template to find the image URL
  const { data: template } = await supabase
    .from('image_templates')
    .select('base_image_url')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  // Delete from database
  const { error } = await supabase
    .from('image_templates')
    .delete()
    .eq('id', id)
    .eq('agency_id', agency.id);

  if (error) {
    console.error('Error deleting image template:', error);
    return { success: false, error: 'Failed to delete template' };
  }

  // Try to delete the image from storage (non-blocking)
  if (template?.base_image_url) {
    try {
      await storage.delete(template.base_image_url);
    } catch (e) {
      // Log but don't fail the operation
      console.error('Failed to delete image from storage:', e);
    }
  }

  revalidatePath('/images');
  return { success: true };
}

export async function duplicateImageTemplate(
  id: string
): Promise<{ success: true; template: ImageTemplate } | { success: false; error: string }> {
  const agency = await getCurrentAgency();
  if (!agency) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = createAdminClient();

  // Get the original template
  const { data: original, error: fetchError } = await supabase
    .from('image_templates')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (fetchError || !original) {
    return { success: false, error: 'Template not found' };
  }

  // Create duplicate (without A/B pairing)
  const { data, error } = await supabase
    .from('image_templates')
    .insert({
      agency_id: agency.id,
      name: `${original.name} (Copy)`,
      base_image_url: original.base_image_url,
      base_image_width: original.base_image_width,
      base_image_height: original.base_image_height,
      text_config: original.text_config,
      customer_id: original.customer_id,
      // Don't copy A/B pairing
      ab_pair_id: null,
      ab_variant: null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error duplicating image template:', error);
    return { success: false, error: 'Failed to duplicate template' };
  }

  revalidatePath('/images');
  return { success: true, template: data };
}

// Get templates for a specific customer (for filtering)
export async function getTemplatesByCustomer(
  customerId: string
): Promise<ImageTemplate[]> {
  const agency = await getCurrentAgency();
  if (!agency) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('image_templates')
    .select('*')
    .eq('agency_id', agency.id)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer templates:', error);
    return [];
  }

  return data || [];
}
