'use client';

import * as React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Webhook,
  Eye,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  type HealthSummary,
  acknowledgeUnknownItem,
  saveWebhookUrl,
} from '../_actions/health-actions';

interface GhlHealthClientProps {
  summary: HealthSummary;
}

export function GhlHealthClient({ summary }: GhlHealthClientProps) {
  const [webhookUrl, setWebhookUrl] = React.useState(summary.webhook_url ?? '');
  const [savingWebhook, setSavingWebhook] = React.useState(false);
  const [ackingIds, setAckingIds] = React.useState<Set<string>>(new Set());
  const [promptCopied, setPromptCopied] = React.useState(false);

  const unackedItems = summary.unknown_items.filter(i => !i.acknowledged);
  const ackedItems = summary.unknown_items.filter(i => i.acknowledged);
  const brokenSelectors = summary.selector_statuses.filter(
    s => s.last_matched === false && s.fail_count_24h > 0
  );

  const hasIssues = unackedItems.length > 0 || brokenSelectors.length > 0;

  async function handleSaveWebhook() {
    setSavingWebhook(true);
    try {
      await saveWebhookUrl(webhookUrl);
      toast.success('Webhook URL saved');
    } catch {
      toast.error('Failed to save webhook URL');
    } finally {
      setSavingWebhook(false);
    }
  }

  async function handleAcknowledge(itemId: string) {
    setAckingIds(prev => new Set(prev).add(itemId));
    try {
      await acknowledgeUnknownItem(itemId);
      toast.success('Acknowledged — this item will no longer trigger alerts');
    } catch {
      toast.error('Failed to acknowledge item');
    } finally {
      setAckingIds(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }

  function buildFixPrompt() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const lines: string[] = [
      `GHL Health Alert — ${dateStr} ${timeStr}`,
      '',
    ];

    if (brokenSelectors.length > 0) {
      lines.push('BROKEN SELECTORS (matched 0 elements):');
      for (const s of brokenSelectors) {
        lines.push(`- \`${s.selector}\` — fix in: ${s.files.join(', ')}`);
      }
      lines.push('');
    }

    const unknownMenuItems = unackedItems.filter(i => i.item_type === 'menu_item');
    if (unknownMenuItems.length > 0) {
      lines.push('NEW UNKNOWN SIDEBAR ITEMS:');
      for (const item of unknownMenuItems) {
        lines.push(`- \`${item.identifier}\` — add to: lib/constants.ts → GHL_MENU_ITEMS`);
      }
      lines.push('');
    }

    const unknownBanners = unackedItems.filter(i => i.item_type === 'banner');
    if (unknownBanners.length > 0) {
      lines.push('NEW UNKNOWN BANNERS:');
      for (const item of unknownBanners) {
        lines.push(`- \`${item.identifier}\` — add to: app/embed.js/route.ts → applyMenuConfig()`);
      }
      lines.push('');
    }

    lines.push('FILES TO UPDATE:');
    const filesToUpdate = new Set<string>();
    for (const s of brokenSelectors) s.files.forEach(f => filesToUpdate.add(f));
    if (unknownMenuItems.length > 0) filesToUpdate.add('lib/constants.ts');
    if (unknownBanners.length > 0) filesToUpdate.add('app/embed.js/route.ts');
    filesToUpdate.add('docs/GHL_SELECTORS.md');
    for (const f of filesToUpdate) lines.push(`- ${f}`);

    return lines.join('\n');
  }

  async function handleCopyPrompt() {
    const prompt = buildFixPrompt();
    await navigator.clipboard.writeText(prompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
    toast.success('Fix prompt copied to clipboard');
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-base font-semibold">GHL Selector Health</h2>
        {summary.last_report_at && (
          <span className="text-xs text-muted-foreground ml-auto">
            Last report {formatDistanceToNow(new Date(summary.last_report_at), { addSuffix: true })}
          </span>
        )}
        {!summary.last_report_at && (
          <span className="text-xs text-muted-foreground ml-auto">No reports yet</span>
        )}
      </div>

      {/* GHL Webhook URL field */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Webhook className="h-3.5 w-3.5 text-muted-foreground" />
          <label className="text-sm font-medium">GHL Inbound Webhook URL</label>
        </div>
        <p className="text-xs text-muted-foreground">
          Paste your GHL inbound webhook URL to receive immediate SMS/email alerts when new issues are detected.
        </p>
        <div className="flex gap-2">
          <Input
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            placeholder="https://services.leadconnectorhq.com/hooks/..."
            className="font-mono text-xs"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveWebhook}
            disabled={savingWebhook}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Copy Fix Prompt — shown only when issues exist */}
      {hasIssues && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                Issues detected — Copy Fix Prompt
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 hover:bg-amber-100 text-amber-800 dark:text-amber-400"
              onClick={handleCopyPrompt}
            >
              {promptCopied ? (
                <><Check className="h-3.5 w-3.5 mr-1.5" />Copied</>
              ) : (
                <><Copy className="h-3.5 w-3.5 mr-1.5" />Copy Prompt</>
              )}
            </Button>
          </div>
          <pre className="text-xs font-mono text-amber-900 dark:text-amber-300 whitespace-pre-wrap bg-amber-100/60 dark:bg-amber-900/30 rounded p-3 max-h-48 overflow-y-auto">
            {buildFixPrompt()}
          </pre>
        </div>
      )}

      {/* Selector status table */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Known Selector Status (last 24h)
        </p>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs">Selector</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs">Description</th>
                <th className="text-center px-3 py-2 font-medium text-muted-foreground text-xs w-24">Status</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs w-24">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {summary.selector_statuses.map(s => (
                <tr key={s.selector} className="border-b last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs">{s.selector}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.description}</td>
                  <td className="px-3 py-2.5 text-center">
                    {s.last_matched === null ? (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground/40 mx-auto" />
                    ) : s.last_matched ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mx-auto" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">
                    {s.last_checked
                      ? formatDistanceToNow(new Date(s.last_checked), { addSuffix: true })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unknown items */}
      {summary.unknown_items.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Unknown Items Detected
          </p>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs">Identifier</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs w-24">Type</th>
                  <th className="text-center px-3 py-2 font-medium text-muted-foreground text-xs w-16">Seen</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs w-28">First seen</th>
                  <th className="px-3 py-2 w-28" />
                </tr>
              </thead>
              <tbody>
                {[...unackedItems, ...ackedItems].map(item => (
                  <tr
                    key={item.id}
                    className={cn('border-b last:border-0', item.acknowledged && 'opacity-50')}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs">{item.identifier}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        {item.item_type === 'menu_item' ? 'Menu Item' : 'Banner'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-center tabular-nums text-xs text-muted-foreground">
                      {item.seen_count}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.first_seen), { addSuffix: true })}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {item.acknowledged ? (
                        <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                          <Eye className="h-3 w-3" /> Acknowledged
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs px-2"
                          disabled={ackingIds.has(item.id)}
                          onClick={() => handleAcknowledge(item.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!hasIssues && summary.last_report_at && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
          <CheckCircle2 className="h-4 w-4" />
          All selectors healthy — no issues detected
        </div>
      )}
    </div>
  );
}
