'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateCustomerToken } from '@/lib/tokens';

interface CreateCustomerData {
  name: string;
  ghl_location_id?: string;
  gbp_place_id?: string;
}

interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export async function createCustomer(data: CreateCustomerData): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();

    // Check plan limits
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id);

    if (agency.plan === 'toolkit' && (count ?? 0) >= 25) {
      return {
        success: false,
        error: 'Customer limit reached. Upgrade to Pro for unlimited customers.',
      };
    }

    if (!data.name || data.name.trim() === '') {
      return { success: false, error: 'Name is required' };
    }

    const token = generateCustomerToken(data.name);

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        agency_id: agency.id,
        name: data.name.trim(),
        token,
        ghl_location_id: data.ghl_location_id || null,
        gbp_place_id: data.gbp_place_id || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/customers');
    return { success: true, data: customer };
  } catch (error) {
    console.error('Error creating customer:', error);
    return { success: false, error: 'Failed to create customer' };
  }
}

interface UpdateCustomerData {
  name: string;
  owner_name?: string;
  ghl_location_id?: string;
  gbp_place_id?: string;
  is_active: boolean;
}

export async function updateCustomer(
  customerId: string,
  data: UpdateCustomerData
): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!data.name || data.name.trim() === '') {
      return { success: false, error: 'Name is required' };
    }

    const supabase = createAdminClient();

    const { data: customer, error } = await supabase
      .from('customers')
      .update({
        name: data.name.trim(),
        owner_name: data.owner_name?.trim() || null,
        ghl_location_id: data.ghl_location_id || null,
        gbp_place_id: data.gbp_place_id || null,
        is_active: data.is_active,
      })
      .eq('id', customerId)
      .eq('agency_id', agency.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/customers');
    revalidatePath(`/customers/${customerId}`);
    return { success: true, data: customer };
  } catch (error) {
    console.error('Error updating customer:', error);
    return { success: false, error: 'Failed to update customer' };
  }
}

export async function deleteCustomer(customerId: string): Promise<ActionResult> {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId)
      .eq('agency_id', agency.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/customers');
    return { success: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    return { success: false, error: 'Failed to delete customer' };
  }
}
