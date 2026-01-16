'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  LoginDesign,
  LoginLayoutType,
  LoginDesignBackground,
  LoginDesignFormStyle,
  CanvasElement,
} from '@/types/database';

interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

interface CreateLoginDesignData {
  name: string;
  layout: LoginLayoutType;
  canvas: {
    width: number;
    height: number;
    background: LoginDesignBackground;
  };
  elements: CanvasElement[];
  form_style: LoginDesignFormStyle;
  is_default?: boolean;
}

export async function getLoginDesigns(): Promise<LoginDesign[]> {
  const agency = await getCurrentAgency();
  if (!agency) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('login_designs')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching login designs:', error);
    return [];
  }

  return data as LoginDesign[];
}

export async function getDefaultLoginDesign(): Promise<LoginDesign | null> {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('login_designs')
    .select('*')
    .eq('agency_id', agency.id)
    .eq('is_default', true)
    .single();

  if (error) {
    return null;
  }

  return data as LoginDesign;
}

export async function createLoginDesign(
  data: CreateLoginDesignData
): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();

    // If setting as default, unset other defaults first
    if (data.is_default) {
      await supabase
        .from('login_designs')
        .update({ is_default: false })
        .eq('agency_id', agency.id);
    }

    const { data: design, error } = await supabase
      .from('login_designs')
      .insert({
        agency_id: agency.id,
        name: data.name,
        layout: data.layout,
        canvas: data.canvas,
        elements: data.elements,
        form_style: data.form_style,
        is_default: data.is_default || false,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/login');
    return { success: true, data: design };
  } catch (error) {
    console.error('Error creating login design:', error);
    return { success: false, error: 'Failed to create design' };
  }
}

export async function updateLoginDesign(
  designId: string,
  data: Partial<CreateLoginDesignData>
): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();

    const { data: design, error } = await supabase
      .from('login_designs')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', designId)
      .eq('agency_id', agency.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/login');
    return { success: true, data: design };
  } catch (error) {
    console.error('Error updating login design:', error);
    return { success: false, error: 'Failed to update design' };
  }
}

export async function deleteLoginDesign(designId: string): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('login_designs')
      .delete()
      .eq('id', designId)
      .eq('agency_id', agency.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/login');
    return { success: true };
  } catch (error) {
    console.error('Error deleting login design:', error);
    return { success: false, error: 'Failed to delete design' };
  }
}

export async function setDefaultLoginDesign(designId: string): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();

    // Unset all defaults first
    await supabase
      .from('login_designs')
      .update({ is_default: false })
      .eq('agency_id', agency.id);

    // Set the new default
    const { error } = await supabase
      .from('login_designs')
      .update({ is_default: true })
      .eq('id', designId)
      .eq('agency_id', agency.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/login');
    return { success: true };
  } catch (error) {
    console.error('Error setting default login design:', error);
    return { success: false, error: 'Failed to set default' };
  }
}
