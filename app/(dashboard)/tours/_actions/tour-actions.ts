'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAgency } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeHTML } from '@/lib/security/sanitize';
import type { Tour, TourStatus, TourStep, TourSettings, TourTargeting } from '@/types/database';

// Note: We use admin client for mutations (INSERT/UPDATE/DELETE) because:
// - Clerk handles authentication (not Supabase Auth)
// - RLS policies expect auth.jwt() which isn't available with Clerk
// - We manually verify permissions via getCurrentAgency() before any mutation
// - This is safe because all mutations check agency ownership first

// Default tour settings
const DEFAULT_SETTINGS: TourSettings = {
  autoplay: true,
  remember_progress: true,
  show_progress: true,
  progress_style: 'dots',
  allow_skip: false,
  show_close: true,
  close_on_outside_click: false,
  frequency: { type: 'once' },
};

// Default tour targeting
const DEFAULT_TARGETING: TourTargeting = {
  url_targeting: { mode: 'all', patterns: [] },
  element_condition: null,
  user_targeting: { type: 'all' },
  devices: ['desktop', 'tablet', 'mobile'],
};

export interface TourWithStats extends Tour {
  stats: {
    views: number;
    completions: number;
  };
  customer?: {
    id: string;
    name: string;
  } | null;
}

/**
 * Get all tours for the current agency
 */
export async function getTours(options?: {
  status?: TourStatus;
  subaccountId?: string;
  search?: string;
}): Promise<TourWithStats[]> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  // Use admin client (RLS bypassed - we verify agency ownership in WHERE clause)
  const supabase = createAdminClient();

  let query = supabase
    .from('tours')
    .select(`
      *,
      customer:customers(id, name)
    `)
    .eq('agency_id', agency.id);

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.subaccountId) {
    query = query.eq('subaccount_id', options.subaccountId);
  }

  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`);
  }

  query = query.order('created_at', { ascending: false });

  const { data: tours, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // Get analytics for all tours
  const tourIds = tours?.map((t) => t.id) || [];

  if (tourIds.length > 0) {
    const { data: analytics } = await supabase
      .from('tour_analytics')
      .select('tour_id, event_type')
      .in('tour_id', tourIds);

    const statsMap = new Map<string, { views: number; completions: number }>();

    analytics?.forEach((event) => {
      if (!event.tour_id) return;
      const current = statsMap.get(event.tour_id) || { views: 0, completions: 0 };
      if (event.event_type === 'view') current.views++;
      if (event.event_type === 'complete') current.completions++;
      statsMap.set(event.tour_id, current);
    });

    return (tours || []).map((tour) => ({
      ...tour,
      stats: statsMap.get(tour.id) || { views: 0, completions: 0 },
    })) as TourWithStats[];
  }

  return (tours || []).map((tour) => ({
    ...tour,
    stats: { views: 0, completions: 0 },
  })) as TourWithStats[];
}

/**
 * Get a single tour by ID
 */
export async function getTour(id: string): Promise<TourWithStats | null> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  // Use admin client (RLS bypassed - we verify agency ownership in WHERE clause)
  const supabase = createAdminClient();

  const { data: tour, error } = await supabase
    .from('tours')
    .select(`
      *,
      customer:customers(id, name, ghl_location_id, ghl_url)
    `)
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  // Get analytics
  const { data: analytics } = await supabase
    .from('tour_analytics')
    .select('event_type')
    .eq('tour_id', id);

  const stats = {
    views: analytics?.filter((e) => e.event_type === 'view').length || 0,
    completions: analytics?.filter((e) => e.event_type === 'complete').length || 0,
  };

  return { ...tour, stats } as TourWithStats;
}

/**
 * Create a new tour
 */
export async function createTour(data: {
  name: string;
  description?: string;
  subaccount_id?: string;
  template_id?: string;
}): Promise<Tour> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  if (agency.plan !== 'pro') {
    throw new Error('Tours feature requires Pro plan');
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  // If using a template, fetch template data
  let templateSteps: TourStep[] = [];
  let templateSettings = DEFAULT_SETTINGS;

  if (data.template_id) {
    const { data: template } = await supabase
      .from('tour_templates')
      .select('steps, settings')
      .eq('id', data.template_id)
      .single();

    if (template) {
      templateSteps = template.steps as TourStep[];
      templateSettings = { ...DEFAULT_SETTINGS, ...(template.settings as Partial<TourSettings>) };
    }
  }

  // Use admin client for INSERT (bypasses RLS - we verify permissions via getCurrentAgency above)
  const { data: tour, error } = await adminClient
    .from('tours')
    .insert({
      agency_id: agency.id,
      subaccount_id: data.subaccount_id || null,
      name: data.name,
      description: data.description || null,
      status: 'draft',
      priority: 10,
      steps: templateSteps,
      settings: templateSettings,
      targeting: DEFAULT_TARGETING,
      created_by: agency.clerk_user_id,
      // Legacy fields (required for backwards compatibility)
      page: '/',
      trigger: 'first_visit',
      is_active: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/tours');
  return tour as Tour;
}

/**
 * Update a tour
 */
export async function updateTour(
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    status: TourStatus;
    priority: number;
    steps: TourStep[];
    settings: TourSettings;
    targeting: TourTargeting;
    subaccount_id: string | null;
    theme_id: string | null;
  }>
): Promise<Tour> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const adminClient = createAdminClient();

  // Sanitize steps content if provided
  const updateData = { ...data };
  if (updateData.steps) {
    updateData.steps = updateData.steps.map((step) => ({
      ...step,
      content: sanitizeHTML(step.content),
      title: step.title ? sanitizeHTML(step.title) : step.title,
    }));
  }

  // Set published_at when going live
  if (updateData.status === 'live') {
    (updateData as Record<string, unknown>).published_at = new Date().toISOString();
  }

  // Use admin client for UPDATE (bypasses RLS - we verify agency ownership in the WHERE clause)
  const { data: tour, error } = await adminClient
    .from('tours')
    .update(updateData)
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/tours');
  revalidatePath(`/tours/${id}`);
  return tour as Tour;
}

/**
 * Delete a tour
 */
export async function deleteTour(id: string): Promise<void> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const adminClient = createAdminClient();

  // Use admin client for DELETE (bypasses RLS - we verify agency ownership in the WHERE clause)
  const { error } = await adminClient
    .from('tours')
    .delete()
    .eq('id', id)
    .eq('agency_id', agency.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/tours');
}

/**
 * Duplicate a tour
 */
export async function duplicateTour(id: string): Promise<Tour> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Fetch original tour (read is fine with regular client)
  const { data: original, error: fetchError } = await supabase
    .from('tours')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (fetchError || !original) {
    throw new Error('Tour not found');
  }

  // Use admin client for INSERT (bypasses RLS)
  const { data: duplicate, error: createError } = await adminClient
    .from('tours')
    .insert({
      agency_id: original.agency_id,
      subaccount_id: original.subaccount_id,
      name: `${original.name} (Copy)`,
      description: original.description,
      status: 'draft',
      priority: original.priority,
      steps: original.steps,
      settings: original.settings,
      targeting: original.targeting,
      theme_id: original.theme_id,
      created_by: agency.clerk_user_id,
      // Legacy fields
      page: original.page || '/',
      trigger: original.trigger || 'first_visit',
      is_active: false,
    })
    .select()
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  revalidatePath('/tours');
  return duplicate as Tour;
}

/**
 * Publish a tour
 */
export async function publishTour(id: string): Promise<Tour> {
  return updateTour(id, { status: 'live' });
}

/**
 * Unpublish a tour
 */
export async function unpublishTour(id: string): Promise<Tour> {
  return updateTour(id, { status: 'draft' });
}

/**
 * Archive a tour
 */
export async function archiveTour(id: string): Promise<Tour> {
  return updateTour(id, { status: 'archived' });
}

/**
 * Get tour templates
 */
export async function getTourTemplates(): Promise<Array<{
  id: string;
  name: string;
  description: string | null;
  category: 'system' | 'custom';
  steps_count?: number;
}>> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  // Use admin client for consistency
  const supabase = createAdminClient();

  const { data: templates, error } = await supabase
    .from('tour_templates')
    .select('id, name, description, category, steps')
    .or(`category.eq.system,agency_id.eq.${agency.id}`)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (templates || []).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category as 'system' | 'custom',
    steps_count: Array.isArray(t.steps) ? t.steps.length : 0,
  }));
}

/**
 * Save a tour as a template
 */
export async function saveAsTemplate(tourId: string, data: {
  name: string;
  description?: string;
}): Promise<{ id: string; name: string }> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Fetch the tour
  const { data: tour, error: fetchError } = await supabase
    .from('tours')
    .select('steps, settings')
    .eq('id', tourId)
    .eq('agency_id', agency.id)
    .single();

  if (fetchError || !tour) {
    throw new Error('Tour not found');
  }

  // Create the template
  const { data: template, error } = await supabase
    .from('tour_templates')
    .insert({
      agency_id: agency.id,
      name: data.name,
      description: data.description || null,
      category: 'custom',
      steps: tour.steps,
      settings: tour.settings,
    })
    .select('id, name')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/tours');
  return template;
}

/**
 * Update a template (custom only)
 */
export async function updateTemplate(
  id: string,
  data: Partial<{ name: string; description: string | null }>
): Promise<{ id: string; name: string }> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Verify it's a custom template owned by this agency
  const { data: existing, error: fetchError } = await supabase
    .from('tour_templates')
    .select('id, category')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (fetchError || !existing) {
    throw new Error('Template not found');
  }

  if (existing.category === 'system') {
    throw new Error('Cannot edit system templates');
  }

  const { data: template, error } = await supabase
    .from('tour_templates')
    .update(data)
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select('id, name')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/tours');
  return template;
}

/**
 * Delete a template (custom only)
 */
export async function deleteTemplate(id: string): Promise<void> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Verify it's a custom template owned by this agency
  const { data: existing, error: fetchError } = await supabase
    .from('tour_templates')
    .select('id, category')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (fetchError || !existing) {
    throw new Error('Template not found');
  }

  if (existing.category === 'system') {
    throw new Error('Cannot delete system templates');
  }

  const { error } = await supabase
    .from('tour_templates')
    .delete()
    .eq('id', id)
    .eq('agency_id', agency.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/tours');
}

/**
 * Duplicate a template
 */
export async function duplicateTemplate(id: string): Promise<{ id: string; name: string }> {
  const agency = await getCurrentAgency();
  if (!agency) {
    throw new Error('Unauthorized');
  }

  const supabase = createAdminClient();

  // Fetch original template (can be system or custom)
  const { data: original, error: fetchError } = await supabase
    .from('tour_templates')
    .select('*')
    .eq('id', id)
    .or(`category.eq.system,agency_id.eq.${agency.id}`)
    .single();

  if (fetchError || !original) {
    throw new Error('Template not found');
  }

  // Create copy as custom template
  const { data: duplicate, error } = await supabase
    .from('tour_templates')
    .insert({
      agency_id: agency.id,
      name: `${original.name} (Copy)`,
      description: original.description,
      category: 'custom',
      steps: original.steps,
      settings: original.settings,
    })
    .select('id, name')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/tours');
  return duplicate;
}
