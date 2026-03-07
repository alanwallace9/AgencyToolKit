'use server';

import { requireSuperAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SelectorHealthEvent, SelectorUnknownItem } from '@/types/database';
import { GHL_KNOWN_CSS_SELECTORS } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export interface SelectorStatus {
  selector: string;
  description: string;
  files: readonly string[];
  last_checked: string | null;
  last_matched: boolean | null;
  fail_count_24h: number;
}

export interface HealthSummary {
  unknown_items: SelectorUnknownItem[];
  selector_statuses: SelectorStatus[];
  last_report_at: string | null;
  unacked_count: number;
  webhook_url: string | null;
}

export async function getHealthSummary(): Promise<HealthSummary> {
  const agency = await requireSuperAdmin();
  const supabase = createAdminClient();

  // Get unacknowledged unknown items
  const { data: unknownItems } = await supabase
    .from('selector_unknown_items')
    .select('*')
    .eq('agency_id', agency.id)
    .order('first_seen', { ascending: false });

  // Get recent health events (last 24h) for status summary
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentEvents } = await supabase
    .from('selector_health_events')
    .select('selector, matched, match_count, created_at')
    .eq('agency_id', agency.id)
    .gte('created_at', since)
    .order('created_at', { ascending: false });

  // Get the most recent event overall for "last checked" timestamp
  const { data: lastEvent } = await supabase
    .from('selector_health_events')
    .select('created_at')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Build per-selector status from known selectors + recent events
  const eventsBySelector = new Map<string, SelectorHealthEvent[]>();
  for (const event of recentEvents || []) {
    const key = event.selector;
    if (!eventsBySelector.has(key)) eventsBySelector.set(key, []);
    eventsBySelector.get(key)!.push(event as SelectorHealthEvent);
  }

  const selectorStatuses: SelectorStatus[] = GHL_KNOWN_CSS_SELECTORS.map(known => {
    const events = eventsBySelector.get(known.selector) || [];
    const failCount = events.filter(e => !e.matched).length;
    const lastEvent = events[0] || null;
    return {
      selector: known.selector,
      description: known.description,
      files: known.files,
      last_checked: lastEvent?.created_at ?? null,
      last_matched: lastEvent ? lastEvent.matched : null,
      fail_count_24h: failCount,
    };
  });

  const items = (unknownItems || []) as SelectorUnknownItem[];
  const unackedCount = items.filter(i => !i.acknowledged).length;

  return {
    unknown_items: items,
    selector_statuses: selectorStatuses,
    last_report_at: lastEvent?.created_at ?? null,
    unacked_count: unackedCount,
    webhook_url: (agency.settings?.ghl_webhook_url as string) ?? null,
  };
}

export async function acknowledgeUnknownItem(itemId: string): Promise<void> {
  await requireSuperAdmin();
  const supabase = createAdminClient();
  await supabase
    .from('selector_unknown_items')
    .update({ acknowledged: true })
    .eq('id', itemId);
  revalidatePath('/settings/admin');
}

export async function saveWebhookUrl(webhookUrl: string): Promise<void> {
  const agency = await requireSuperAdmin();
  const supabase = createAdminClient();

  const currentSettings = agency.settings || {};
  await supabase
    .from('agencies')
    .update({
      settings: { ...currentSettings, ghl_webhook_url: webhookUrl.trim() || null },
    })
    .eq('id', agency.id);

  revalidatePath('/settings/admin');
}
