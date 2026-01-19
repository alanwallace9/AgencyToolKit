'use server';

import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSocialProofWidgetToken } from '@/lib/tokens';
import { revalidatePath } from 'next/cache';
import type { SocialProofWidget, SocialProofEvent, SocialProofTheme, SocialProofPosition, SocialProofUrlMode, SocialProofEventType } from '@/types/database';

// Note: We use admin client for mutations (INSERT/UPDATE/DELETE) because:
// - Clerk handles authentication (not Supabase Auth)
// - RLS policies expect auth.jwt() which isn't available with Clerk
// - We manually verify permissions via getCurrentAgency() before any mutation
// - This is safe because all mutations check agency ownership first

// ============================================
// WIDGET ACTIONS
// ============================================

export async function getWidgets() {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { data: widgets, error } = await supabase
    .from('social_proof_widgets')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Get event counts
  const widgetIds = widgets?.map((w) => w.id) || [];

  if (widgetIds.length === 0) {
    return widgets || [];
  }

  const { data: eventCounts } = await supabase
    .from('social_proof_events')
    .select('widget_id')
    .in('widget_id', widgetIds);

  const countMap = new Map<string, number>();
  eventCounts?.forEach((event) => {
    if (event.widget_id) {
      countMap.set(event.widget_id, (countMap.get(event.widget_id) || 0) + 1);
    }
  });

  // Get today's counts
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayCounts } = await supabase
    .from('social_proof_events')
    .select('widget_id')
    .in('widget_id', widgetIds)
    .gte('created_at', today.toISOString());

  const todayCountMap = new Map<string, number>();
  todayCounts?.forEach((event) => {
    if (event.widget_id) {
      todayCountMap.set(
        event.widget_id,
        (todayCountMap.get(event.widget_id) || 0) + 1
      );
    }
  });

  return widgets?.map((widget) => ({
    ...widget,
    event_count: countMap.get(widget.id) || 0,
    today_count: todayCountMap.get(widget.id) || 0,
  })) || [];
}

export async function getWidget(id: string) {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { data: widget, error } = await supabase
    .from('social_proof_widgets')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (error) throw error;

  return widget as SocialProofWidget;
}

export async function createWidget(name: string) {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();
  const token = generateSocialProofWidgetToken();

  const { data: widget, error } = await supabase
    .from('social_proof_widgets')
    .insert({
      agency_id: agency.id,
      name,
      token,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/social-proof');
  return widget as SocialProofWidget;
}

export async function updateWidget(
  id: string,
  updates: Partial<{
    name: string;
    is_active: boolean;
    theme: SocialProofTheme;
    position: SocialProofPosition;
    custom_colors: {
      background: string;
      text: string;
      accent: string;
      border: string;
    };
    display_duration: number;
    gap_between: number;
    initial_delay: number;
    show_first_name: boolean;
    show_city: boolean;
    show_business_name: boolean;
    show_time_ago: boolean;
    time_ago_text: string;
    url_mode: SocialProofUrlMode;
    url_patterns: string[];
    form_selector: string | null;
    capture_email: boolean;
    capture_phone: boolean;
    capture_business_name: boolean;
    max_events_in_rotation: number;
    randomize_order: boolean;
  }>
) {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { data: widget, error } = await supabase
    .from('social_proof_widgets')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('agency_id', agency.id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/social-proof/${id}`);
  revalidatePath('/social-proof');
  return widget as SocialProofWidget;
}

export async function deleteWidget(id: string) {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('social_proof_widgets')
    .delete()
    .eq('id', id)
    .eq('agency_id', agency.id);

  if (error) throw error;

  revalidatePath('/social-proof');
}

export async function duplicateWidget(id: string) {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  // Get original widget
  const { data: original, error: fetchError } = await supabase
    .from('social_proof_widgets')
    .select('*')
    .eq('id', id)
    .eq('agency_id', agency.id)
    .single();

  if (fetchError || !original) throw new Error('Widget not found');

  // Create copy
  const token = generateSocialProofWidgetToken();
  const { data: widget, error } = await supabase
    .from('social_proof_widgets')
    .insert({
      agency_id: agency.id,
      name: `${original.name} (Copy)`,
      token,
      is_active: false, // Start paused
      theme: original.theme,
      position: original.position,
      custom_colors: original.custom_colors,
      display_duration: original.display_duration,
      gap_between: original.gap_between,
      initial_delay: original.initial_delay,
      show_first_name: original.show_first_name,
      show_city: original.show_city,
      show_business_name: original.show_business_name,
      show_time_ago: original.show_time_ago,
      time_ago_text: original.time_ago_text,
      url_mode: original.url_mode,
      url_patterns: original.url_patterns,
      form_selector: original.form_selector,
      capture_email: original.capture_email,
      capture_phone: original.capture_phone,
      capture_business_name: original.capture_business_name,
      max_events_in_rotation: original.max_events_in_rotation,
      randomize_order: original.randomize_order,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/social-proof');
  return widget as SocialProofWidget;
}

// ============================================
// EVENT ACTIONS
// ============================================

export async function getEvents(widgetId: string, options?: { source?: string; limit?: number; offset?: number }) {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();
  const limit = options?.limit || 100;
  const offset = options?.offset || 0;

  let query = supabase
    .from('social_proof_events')
    .select('*', { count: 'exact' })
    .eq('widget_id', widgetId)
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.source) {
    query = query.eq('source', options.source);
  }

  const { data: events, error, count } = await query;

  if (error) throw error;

  return {
    events: events as SocialProofEvent[],
    total: count || 0,
  };
}

export async function createEvent(
  widgetId: string,
  eventData: {
    event_type: SocialProofEventType;
    first_name?: string;
    business_name?: string;
    city?: string;
    custom_text?: string;
    display_time_override?: string;
  }
) {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { data: event, error } = await supabase
    .from('social_proof_events')
    .insert({
      agency_id: agency.id,
      widget_id: widgetId,
      event_type: eventData.event_type,
      source: 'manual',
      first_name: eventData.first_name || null,
      business_name: eventData.business_name || '',
      city: eventData.city || null,
      custom_text: eventData.custom_text || null,
      display_time_override: eventData.display_time_override || null,
      details: {},
      is_visible: true,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/social-proof/${widgetId}`);
  return event as SocialProofEvent;
}

export async function updateEventVisibility(eventId: string, isVisible: boolean) {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('social_proof_events')
    .update({ is_visible: isVisible })
    .eq('id', eventId)
    .eq('agency_id', agency.id);

  if (error) throw error;
}

export async function deleteEvent(eventId: string) {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('social_proof_events')
    .delete()
    .eq('id', eventId)
    .eq('agency_id', agency.id);

  if (error) throw error;
}

export async function bulkUpdateEventVisibility(widgetId: string, eventIds: string[], isVisible: boolean) {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('social_proof_events')
    .update({ is_visible: isVisible })
    .eq('widget_id', widgetId)
    .eq('agency_id', agency.id)
    .in('id', eventIds);

  if (error) throw error;

  revalidatePath(`/social-proof/${widgetId}`);
}

export async function bulkDeleteEvents(widgetId: string, eventIds: string[]) {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('social_proof_events')
    .delete()
    .eq('widget_id', widgetId)
    .eq('agency_id', agency.id)
    .in('id', eventIds);

  if (error) throw error;

  revalidatePath(`/social-proof/${widgetId}`);
}

export async function importEvents(
  widgetId: string,
  rows: Array<{
    first_name?: string;
    business_name?: string;
    city?: string;
    event_type?: string;
  }>,
  options: {
    column_mapping?: Record<string, string>;
    default_event_type: SocialProofEventType;
    use_time_override: boolean;
    time_override_text?: string;
  }
) {
  const agency = await getCurrentAgency();
  if (!agency) throw new Error('Unauthorized');

  const supabase = createAdminClient();

  const validEventTypes = [
    'signup', 'trial', 'demo', 'purchase', 'subscription',
    'milestone', 'connected', 'review_milestone', 'lead_milestone', 'custom',
  ];

  const mapping = options.column_mapping || {};

  const eventsToInsert = rows
    .map((row) => {
      const firstName = mapping.first_name
        ? row[mapping.first_name as keyof typeof row]
        : row.first_name;
      const businessName = mapping.business_name
        ? row[mapping.business_name as keyof typeof row]
        : row.business_name;
      const city = mapping.city
        ? row[mapping.city as keyof typeof row]
        : row.city;
      const eventTypeFromRow = mapping.event_type
        ? row[mapping.event_type as keyof typeof row]
        : row.event_type;

      let eventType = options.default_event_type;
      if (eventTypeFromRow && validEventTypes.includes(String(eventTypeFromRow).toLowerCase())) {
        eventType = String(eventTypeFromRow).toLowerCase() as SocialProofEventType;
      }

      if (!firstName && !businessName) return null;

      return {
        agency_id: agency.id,
        widget_id: widgetId,
        event_type: eventType,
        source: 'csv',
        first_name: firstName ? String(firstName).trim() : null,
        business_name: businessName ? String(businessName).trim() : '',
        city: city ? String(city).trim() : null,
        display_time_override: options.use_time_override
          ? options.time_override_text || 'recently'
          : null,
        details: {},
        is_visible: true,
      };
    })
    .filter((event) => event !== null);

  if (eventsToInsert.length === 0) {
    throw new Error('No valid rows to import');
  }

  // Insert in batches
  const batchSize = 100;
  let insertedCount = 0;

  for (let i = 0; i < eventsToInsert.length; i += batchSize) {
    const batch = eventsToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('social_proof_events').insert(batch);
    if (!error) {
      insertedCount += batch.length;
    }
  }

  revalidatePath(`/social-proof/${widgetId}`);

  return {
    imported: insertedCount,
    skipped: rows.length - eventsToInsert.length,
    total: rows.length,
  };
}
