'use client';

import { useState, useMemo } from 'react';
import { Copy, Check, FileCode, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import type { AgencySettings } from '@/types/database';

interface CssExportCardProps {
  settings: AgencySettings | null;
}

/**
 * Generates CSS code from agency settings
 * Mirrors the CSS generation logic in embed.js
 */
function generateCss(settings: AgencySettings | null): string {
  if (!settings) return '/* No customizations configured yet */';

  const lines: string[] = [];
  const timestamp = new Date().toISOString().split('T')[0];

  // Header
  lines.push('/* ==========================================');
  lines.push('   Agency Toolkit - Generated CSS');
  lines.push(`   Generated: ${timestamp}`);
  lines.push('   ========================================== */');
  lines.push('');

  const hasColors = settings.colors && Object.keys(settings.colors).length > 0;
  const hasHiddenItems = settings.menu?.hidden_items && settings.menu.hidden_items.length > 0;
  const hasRenamedItems = settings.menu?.renamed_items && Object.keys(settings.menu.renamed_items).length > 0;

  if (!hasColors && !hasHiddenItems && !hasRenamedItems) {
    lines.push('/* No customizations configured yet */');
    return lines.join('\n');
  }

  // Colors Section
  if (hasColors && settings.colors) {
    const colors = settings.colors;
    lines.push('/* -----------------------------------------');
    lines.push('   COLORS - Sidebar & Buttons');
    lines.push('   ----------------------------------------- */');
    lines.push('');

    if (colors.sidebar_bg) {
      lines.push('.lead-connector,');
      lines.push('#sidebar-v2,');
      lines.push('.sidebar-v2-location,');
      lines.push(`.hl_nav-location { background-color: ${colors.sidebar_bg} !important; }`);
      lines.push('');
    }

    if (colors.sidebar_text) {
      lines.push('.lead-connector a,');
      lines.push('#sidebar-v2 a,');
      lines.push('[id^="sb_"],');
      lines.push('[id^="sb_"] span.nav-title,');
      lines.push('[id^="sb_"] span.hl_text-overflow,');
      lines.push(`.hl_nav-settings a { color: ${colors.sidebar_text} !important; }`);
      lines.push('');
    }

    if (colors.primary) {
      lines.push('/* Primary Buttons */');
      lines.push('.btn-primary,');
      lines.push('.hr-button--primary-type,');
      lines.push('.n-button--primary-type {');
      lines.push(`  background-color: ${colors.primary} !important;`);
      lines.push(`  border-color: ${colors.primary} !important;`);
      lines.push('}');
      lines.push('');
    }

    if (colors.accent) {
      lines.push('/* Accent/Links */');
      lines.push('a:not(.btn):not([class*="button"]),');
      lines.push('.text-link,');
      lines.push(`.hl-text-link { color: ${colors.accent} !important; }`);
      lines.push('');
    }
  }

  // Hidden Menu Items Section
  if (hasHiddenItems && settings.menu?.hidden_items) {
    lines.push('/* -----------------------------------------');
    lines.push('   MENU - Hidden Items');
    lines.push('   ----------------------------------------- */');
    lines.push('');

    const hiddenSelectors = settings.menu.hidden_items.map(id => `#${id}`).join(',\n');
    lines.push(hiddenSelectors + ' { display: none !important; }');
    lines.push('');
  }

  // Renamed Menu Items Section
  if (hasRenamedItems && settings.menu?.renamed_items) {
    lines.push('/* -----------------------------------------');
    lines.push('   MENU - Renamed Items');
    lines.push('   ----------------------------------------- */');
    lines.push('');

    Object.entries(settings.menu.renamed_items).forEach(([itemId, newName]) => {
      lines.push(`/* ${itemId} -> "${newName}" */`);
      lines.push(`#${itemId} span.nav-title,`);
      lines.push(`#${itemId} span.hl_text-overflow,`);
      lines.push(`#${itemId} > span:not(.sr-only) {`);
      lines.push('  font-size: 0 !important;');
      lines.push('  color: transparent !important;');
      lines.push('  letter-spacing: -9999px !important;');
      lines.push('}');
      lines.push(`#${itemId} span.nav-title::after,`);
      lines.push(`#${itemId} span.hl_text-overflow::after,`);
      lines.push(`#${itemId} > span:not(.sr-only)::after {`);
      lines.push(`  content: "${newName}";`);
      lines.push('  font-size: 14px !important;');
      lines.push('  color: inherit !important;');
      lines.push('  letter-spacing: normal !important;');
      lines.push('  visibility: visible !important;');
      lines.push('}');
      lines.push('');
    });
  }

  return lines.join('\n');
}

export function CssExportCard({ settings }: CssExportCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const css = useMemo(() => generateCss(settings), [settings]);
  const cssLines = css.split('\n');
  const previewLines = cssLines.slice(0, 8).join('\n');
  const hasMoreContent = cssLines.length > 8;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    toast.success('CSS copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate stats for description
  const colorCount = settings?.colors ? Object.keys(settings.colors).filter(k => settings.colors?.[k as keyof typeof settings.colors]).length : 0;
  const hiddenCount = settings?.menu?.hidden_items?.length || 0;
  const renamedCount = settings?.menu?.renamed_items ? Object.keys(settings.menu.renamed_items).length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          Generated CSS
        </CardTitle>
        <CardDescription>
          {colorCount + hiddenCount + renamedCount > 0 ? (
            <>
              {colorCount > 0 && `${colorCount} color${colorCount > 1 ? 's' : ''}`}
              {colorCount > 0 && (hiddenCount > 0 || renamedCount > 0) && ', '}
              {hiddenCount > 0 && `${hiddenCount} hidden item${hiddenCount > 1 ? 's' : ''}`}
              {hiddenCount > 0 && renamedCount > 0 && ', '}
              {renamedCount > 0 && `${renamedCount} renamed item${renamedCount > 1 ? 's' : ''}`}
            </>
          ) : (
            'Configure customizations in Theme Builder to generate CSS'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code Block */}
        <div className="relative">
          <pre className={`bg-muted p-4 rounded-lg text-xs overflow-x-auto font-mono ${expanded ? 'max-h-96 overflow-y-auto' : 'max-h-40 overflow-hidden'}`}>
            <code>{expanded ? css : previewLines}</code>
            {!expanded && hasMoreContent && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-muted to-transparent pointer-events-none" />
            )}
          </pre>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        {hasMoreContent && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show full CSS ({cssLines.length} lines)
              </>
            )}
          </Button>
        )}

        {/* Instructions Accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="where-to-paste">
            <AccordionTrigger>Where to paste in GHL</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <ol className="list-decimal list-inside space-y-2">
                <li>Log into your GoHighLevel agency account</li>
                <li>Go to <strong>Settings</strong> → <strong>Company</strong></li>
                <li>Click the <strong>White Label</strong> tab</li>
                <li>Scroll down to the <strong>Custom CSS</strong> section</li>
                <li>Paste the CSS code above</li>
                <li>Click <strong>Save Changes</strong></li>
              </ol>
              <p className="mt-2 text-xs">
                <strong>Note:</strong> Using CSS directly is an alternative to the JavaScript embed.
                You only need to use one method, not both.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="what-it-does">
            <AccordionTrigger>What this CSS does</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>This CSS applies your Agency Toolkit customizations:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {colorCount > 0 && (
                  <li><strong>Colors</strong> — Sidebar background, text, buttons</li>
                )}
                {hiddenCount > 0 && (
                  <li><strong>Hidden Items</strong> — Menu items you&apos;ve hidden</li>
                )}
                {renamedCount > 0 && (
                  <li><strong>Renamed Items</strong> — Custom menu labels</li>
                )}
              </ul>
              <p className="mt-2 text-xs">
                <strong>Limitations:</strong> CSS alone cannot do login page customization,
                loading animations, or onboarding tours. For those features, use the JavaScript embed.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="troubleshooting">
            <AccordionTrigger>Troubleshooting</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Styles not applying?</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Clear your browser cache (Ctrl+Shift+R / Cmd+Shift+R)</li>
                <li>Make sure the CSS is in Custom CSS, not Custom JS</li>
                <li>Check that you saved after pasting</li>
                <li>Some GHL UI updates may require selector updates</li>
              </ul>
              <p className="mt-3"><strong>CSS vs JavaScript embed?</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li><strong>CSS:</strong> Faster, but limited to colors & menu changes</li>
                <li><strong>JS Embed:</strong> Full features including login, loading, tours</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
