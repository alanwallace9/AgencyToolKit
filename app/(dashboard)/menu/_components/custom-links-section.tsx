'use client';

import { Link2, RefreshCw, Loader2, Eye, EyeOff, AlertCircle, ExternalLink, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { CustomMenuLink } from '@/types/database';

interface CustomLinksSectionProps {
  ghlDomain: string | null;
  customLinks: CustomMenuLink[];
  hiddenCustomLinks: string[];
  renamedCustomLinks: Record<string, string>;
  isScanning: boolean;
  scanError: string | null;
  onStartScan: () => void;
  onCancelScan: () => void;
  onToggleLink: (linkId: string) => void;
  onRenameLink: (linkId: string, newName: string) => void;
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function CustomLinksSection({
  ghlDomain,
  customLinks,
  hiddenCustomLinks,
  renamedCustomLinks,
  isScanning,
  scanError,
  onStartScan,
  onCancelScan,
  onToggleLink,
  onRenameLink,
}: CustomLinksSectionProps) {
  // No GHL domain configured
  if (!ghlDomain) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          Set up your GHL domain first
        </p>
        <Link
          href="/settings/ghl"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          Go to Settings
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  // Scanning state
  if (isScanning) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm font-medium">Scanning your GHL sidebar...</p>
          <p className="text-xs text-muted-foreground mt-1">
            A new tab has been opened. It will close automatically when done.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onCancelScan}
        >
          Cancel Scan
        </Button>
      </div>
    );
  }

  // Error state
  if (scanError) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Scan failed</p>
              <p className="text-xs text-muted-foreground mt-1">{scanError}</p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc pl-4">
                <li>Make sure the embed script is installed</li>
                <li>Check that your GHL domain is correct</li>
                <li>Allow popups for this site</li>
              </ul>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onStartScan}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // No custom links yet (never scanned or scan found nothing)
  if (customLinks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed p-6 text-center">
          <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Link2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">No custom links detected</p>
          <p className="text-xs text-muted-foreground">
            First, add custom links in GHL (Settings &rarr; Custom Menu Links).
            Then click Scan to detect them.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onStartScan}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Scan GHL Sidebar
        </Button>
      </div>
    );
  }

  // Custom links found — show toggle/rename controls
  const lastScanned = customLinks[0]?.scanned_at;

  return (
    <div className="space-y-3">
      {customLinks.map((link) => {
        const isHidden = hiddenCustomLinks.includes(link.id);
        const renamedValue = renamedCustomLinks[link.id] || '';

        return (
          <div
            key={link.id}
            className={`flex items-center gap-3 p-2 rounded-md border transition-colors ${
              isHidden ? 'opacity-50 bg-muted/30' : ''
            }`}
          >
            {/* Toggle */}
            <Switch
              checked={!isHidden}
              onCheckedChange={() => onToggleLink(link.id)}
              className="shrink-0"
            />

            {/* Label & Rename */}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs text-muted-foreground truncate">
                {link.original_label}
                {link.href && (
                  <span className="ml-1 opacity-60">({link.href})</span>
                )}
              </p>
              <Input
                value={renamedValue}
                onChange={(e) => onRenameLink(link.id, e.target.value)}
                placeholder={link.original_label}
                className="h-7 text-xs"
                disabled={isHidden}
              />
            </div>

            {/* Visibility icon */}
            {isHidden ? (
              <EyeOff className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </div>
        );
      })}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t">
        {lastScanned && (
          <p className="text-xs text-muted-foreground">
            Last scanned: {formatTimeAgo(lastScanned)}
          </p>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs ml-auto"
          onClick={onStartScan}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Re-scan
        </Button>
      </div>
    </div>
  );
}
