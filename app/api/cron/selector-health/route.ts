import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Vercel Cron — runs at 5am daily
// Sends a digest to each agency that still has unacknowledged selector issues
export async function GET(request: NextRequest) {
  // Verify this is called by Vercel cron (or locally with the secret)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find all agencies with unacknowledged unknown items
  const { data: unackedItems } = await supabase
    .from('selector_unknown_items')
    .select('agency_id')
    .eq('acknowledged', false);

  if (!unackedItems || unackedItems.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  // Get unique agency IDs
  const agencyIds = [...new Set(unackedItems.map(i => i.agency_id))];

  // Also check for agencies with broken selectors in last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: brokenEvents } = await supabase
    .from('selector_health_events')
    .select('agency_id')
    .eq('matched', false)
    .gte('created_at', since);

  const brokenAgencyIds = new Set((brokenEvents || []).map(e => e.agency_id));

  // Combine all affected agencies
  const allAffected = [...new Set([...agencyIds, ...Array.from(brokenAgencyIds)])];

  // Fetch webhook URLs for affected agencies
  const { data: agencies } = await supabase
    .from('agencies')
    .select('id, settings')
    .in('id', allAffected);

  let sent = 0;
  for (const agency of agencies || []) {
    const webhookUrl = agency.settings?.ghl_webhook_url as string | undefined;
    if (!webhookUrl) continue;

    const agencyUnacked = unackedItems.filter(i => i.agency_id === agency.id).length;
    const hasBroken = brokenAgencyIds.has(agency.id);

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'selector_health_digest',
          message: 'GHL selector issue detected. Check your Agency Toolkit admin panel.',
          unacknowledged_items: agencyUnacked,
          broken_selectors_24h: hasBroken,
          timestamp: new Date().toISOString(),
        }),
      });
      sent++;
    } catch (e) {
      console.error(`[cron/selector-health] Webhook failed for agency ${agency.id}:`, e);
    }
  }

  return NextResponse.json({ ok: true, sent, checked: allAffected.length });
}
