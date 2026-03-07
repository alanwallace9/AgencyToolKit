import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface SelectorResult {
  selector: string;
  matched: boolean;
  match_count: number;
}

interface HealthReportPayload {
  agency_token: string;
  page_url: string;
  location_id: string;
  selectors: SelectorResult[];
  unknown_menu_items: string[];
  unknown_banners: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: HealthReportPayload = await request.json();
    const { agency_token, page_url, location_id, selectors, unknown_menu_items, unknown_banners } = body;

    if (!agency_token) {
      return NextResponse.json({ error: 'Missing agency_token' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Resolve agency_id from token
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id, settings')
      .eq('token', agency_token)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    const agencyId = agency.id;
    const ghlWebhookUrl = agency.settings?.ghl_webhook_url as string | undefined;

    // Store all selector health events so "last checked" always updates
    // This keeps the admin panel informed even when everything is healthy
    const brokenSelectors = (selectors || []).filter(s => !s.matched);
    if ((selectors || []).length > 0) {
      const events = (selectors || []).map(s => ({
        agency_id: agencyId,
        selector: s.selector,
        matched: s.matched,
        match_count: s.match_count,
        page_url: page_url || null,
        location_id: location_id || null,
      }));
      await supabase.from('selector_health_events').insert(events);
    }

    // Process unknown items — upsert and track which are truly new
    const newItems: { item_type: 'menu_item' | 'banner'; identifier: string }[] = [];

    const allUnknown = [
      ...(unknown_menu_items || []).map(id => ({ item_type: 'menu_item' as const, identifier: id })),
      ...(unknown_banners || []).map(cls => ({ item_type: 'banner' as const, identifier: cls })),
    ];

    for (const item of allUnknown) {
      // Try to find existing record
      const { data: existing } = await supabase
        .from('selector_unknown_items')
        .select('id, seen_count, acknowledged')
        .eq('agency_id', agencyId)
        .eq('item_type', item.item_type)
        .eq('identifier', item.identifier)
        .single();

      if (!existing) {
        // Brand new — insert and queue alert
        await supabase.from('selector_unknown_items').insert({
          agency_id: agencyId,
          item_type: item.item_type,
          identifier: item.identifier,
        });
        newItems.push(item);
      } else {
        // Seen before — bump counts
        await supabase
          .from('selector_unknown_items')
          .update({
            last_seen: new Date().toISOString(),
            seen_count: existing.seen_count + 1,
          })
          .eq('id', existing.id);
      }
    }

    // Fire GHL webhook if there are new items (immediate alert)
    if (newItems.length > 0 && ghlWebhookUrl) {
      await fireGhlWebhook(ghlWebhookUrl, newItems, brokenSelectors, page_url);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[selector-health] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function fireGhlWebhook(
  webhookUrl: string,
  newItems: { item_type: string; identifier: string }[],
  brokenSelectors: SelectorResult[],
  pageUrl: string
) {
  try {
    const payload = {
      event: 'selector_health_alert',
      message: 'GHL selector issue detected. Check your Agency Toolkit admin panel.',
      new_unknown_items: newItems.length,
      broken_selectors: brokenSelectors.length,
      page_url: pageUrl,
      timestamp: new Date().toISOString(),
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('[selector-health] Webhook fire failed:', e);
  }
}
