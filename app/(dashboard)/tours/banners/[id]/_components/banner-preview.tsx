'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Banner, TourTheme } from '@/types/database';

interface BannerPreviewProps {
  banner: Banner;
  theme?: TourTheme;
}

const STYLE_COLORS: Record<string, { bg: string; text: string }> = {
  info: { bg: '#3B82F6', text: '#ffffff' },
  success: { bg: '#10B981', text: '#ffffff' },
  warning: { bg: '#F59E0B', text: '#1F2937' },
  error: { bg: '#EF4444', text: '#ffffff' },
};

export function BannerPreview({ banner, theme }: BannerPreviewProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const getColors = () => {
    if (banner.style_preset === 'custom' && theme) {
      return {
        bg: theme.colors?.primary || '#3b82f6',
        text: theme.colors?.text || '#ffffff',
      };
    }
    return STYLE_COLORS[banner.style_preset] || STYLE_COLORS.info;
  };

  const colors = getColors();

  // Replace {{days}} with example value for preview
  const previewContent = banner.content
    .replace(/\{\{days\}\}/g, '3')
    .replace(/\{\{customer_name\}\}/g, 'Acme Corp')
    .replace(/\{\{agency_name\}\}/g, 'Your Agency');

  const reset = () => setIsDismissed(false);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Live Preview</h3>
        <span className="text-xs text-muted-foreground">Interactive</span>
      </div>

      {/* Preview container */}
      <div
        className="relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden"
        style={{ height: '400px' }}
      >
        {/* Banner - Top position */}
        {banner.position === 'top' && !isDismissed && (
          <div
            className={cn(
              'flex items-center justify-center gap-3 px-4 py-3 text-sm',
              banner.display_mode === 'float' && 'm-2 rounded-lg shadow-lg'
            )}
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
            }}
          >
            <span className="flex-1 text-center">{previewContent || 'Your banner text here...'}</span>

            {banner.action.enabled && (
              <button
                className="px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                {banner.action.label || 'Learn More'}
              </button>
            )}

            {banner.dismissible && (
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Fake page content */}
        <div
          className={cn(
            'p-4 space-y-3',
            banner.position === 'top' && banner.display_mode === 'inline' && !isDismissed && 'pt-2'
          )}
        >
          {/* Fake header */}
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center px-3">
            <div className="h-3 w-24 bg-slate-300 dark:bg-slate-600 rounded" />
          </div>

          {/* Fake content */}
          <div className="space-y-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
          </div>

          {/* Fake cards */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>

          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </div>

        {/* Banner - Bottom position */}
        {banner.position === 'bottom' && !isDismissed && (
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 px-4 py-3 text-sm',
              banner.display_mode === 'float' && 'm-2 rounded-lg shadow-lg left-2 right-2 bottom-2'
            )}
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
            }}
          >
            <span className="flex-1 text-center">{previewContent || 'Your banner text here...'}</span>

            {banner.action.enabled && (
              <button
                className="px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                {banner.action.label || 'Learn More'}
              </button>
            )}

            {banner.dismissible && (
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Preview controls */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {isDismissed ? 'Banner dismissed' : 'Click X to test dismiss'}
        </span>
        {isDismissed && (
          <button
            onClick={reset}
            className="text-primary hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Display mode indicator */}
      <div className="mt-3 p-2 bg-muted rounded text-xs text-muted-foreground">
        <span className="font-medium">Mode:</span>{' '}
        {banner.display_mode === 'inline' ? (
          <>Inline - banner pushes content {banner.position === 'top' ? 'down' : 'up'}</>
        ) : (
          <>Float - banner floats over content with shadow</>
        )}
      </div>
    </div>
  );
}
