'use client';

import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Banner, TourTheme } from '@/types/database';

interface BannerPreviewPanelProps {
  banner: Banner;
  theme?: TourTheme;
}

const STYLE_COLORS: Record<string, { bg: string; text: string; button: string }> = {
  info: { bg: '#3B82F6', text: '#ffffff', button: '#1E40AF' },
  success: { bg: '#10B981', text: '#ffffff', button: '#047857' },
  warning: { bg: '#F59E0B', text: '#1F2937', button: '#B45309' },
  error: { bg: '#EF4444', text: '#ffffff', button: '#B91C1C' },
};

export function BannerPreviewPanel({ banner, theme }: BannerPreviewPanelProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const getColors = () => {
    if (banner.style_preset === 'custom' && banner.custom_colors) {
      return {
        bg: banner.custom_colors.background,
        text: banner.custom_colors.text,
        button: banner.custom_colors.button_bg || banner.custom_colors.background,
        buttonText: banner.custom_colors.button_text || '#ffffff',
      };
    }
    if (banner.style_preset === 'custom' && theme) {
      return {
        bg: theme.colors?.primary || '#3b82f6',
        text: theme.colors?.text || '#ffffff',
        button: theme.colors?.primary || '#3b82f6',
        buttonText: theme.colors?.text || '#ffffff',
      };
    }
    const preset = STYLE_COLORS[banner.style_preset] || STYLE_COLORS.info;
    return {
      bg: preset.bg,
      text: preset.text,
      button: preset.button,
      buttonText: '#ffffff',
    };
  };

  const colors = getColors();

  // Replace template variables with example values
  const previewContent = banner.content
    .replace(/\{\{days\}\}/g, '3')
    .replace(/\{\{customer_name\}\}/g, 'Acme Corp')
    .replace(/\{\{agency_name\}\}/g, 'Your Agency');

  const reset = () => setIsDismissed(false);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background shrink-0">
        <h3 className="font-semibold text-sm">Live Preview</h3>
        <div className="flex items-center gap-2">
          {isDismissed && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
          <span className="text-xs text-muted-foreground">Interactive</span>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 p-6 overflow-hidden">
        <div
          className="relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden h-full min-h-[400px]"
        >
          {/* Banner - Top position */}
          {banner.position === 'top' && !isDismissed && (
            <div
              className={cn(
                'flex items-center justify-center gap-4 px-6 py-4 text-sm',
                banner.display_mode === 'float' && 'm-3 rounded-lg shadow-lg'
              )}
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
              }}
            >
              <span className="flex-1 text-center font-medium">
                {previewContent || 'Your banner text here...'}
              </span>

              {banner.action.enabled && (
                <button
                  className="px-4 py-2 text-sm font-medium rounded whitespace-nowrap transition-colors"
                  style={{
                    backgroundColor: colors.button,
                    color: colors.buttonText,
                  }}
                >
                  {banner.action.label || 'Learn More'}
                </button>
              )}

              {banner.dismissible && (
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors"
                  style={{ color: colors.text }}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Fake page content */}
          <div
            className={cn(
              'p-6 space-y-4',
              banner.position === 'top' && banner.display_mode === 'inline' && !isDismissed && 'pt-4'
            )}
          >
            {/* Fake header bar */}
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center px-4 gap-3">
              <div className="h-4 w-4 bg-slate-300 dark:bg-slate-600 rounded" />
              <div className="h-3 w-32 bg-slate-300 dark:bg-slate-600 rounded" />
              <div className="flex-1" />
              <div className="h-3 w-16 bg-slate-300 dark:bg-slate-600 rounded" />
              <div className="h-3 w-16 bg-slate-300 dark:bg-slate-600 rounded" />
            </div>

            {/* Fake content */}
            <div className="space-y-3">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
            </div>

            {/* Fake cards */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>

            {/* More fake content */}
            <div className="space-y-2 mt-6">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            </div>
          </div>

          {/* Banner - Bottom position */}
          {banner.position === 'bottom' && !isDismissed && (
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 px-6 py-4 text-sm',
                banner.display_mode === 'float' && 'm-3 rounded-lg shadow-lg left-3 right-3 bottom-3'
              )}
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
              }}
            >
              <span className="flex-1 text-center font-medium">
                {previewContent || 'Your banner text here...'}
              </span>

              {banner.action.enabled && (
                <button
                  className="px-4 py-2 text-sm font-medium rounded whitespace-nowrap transition-colors"
                  style={{
                    backgroundColor: colors.button,
                    color: colors.buttonText,
                  }}
                >
                  {banner.action.label || 'Learn More'}
                </button>
              )}

              {banner.dismissible && (
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-1.5 hover:bg-white/20 rounded transition-colors"
                  style={{ color: colors.text }}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t bg-background shrink-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isDismissed ? 'Banner dismissed - click Reset to show again' : 'Click X to test dismiss behavior'}
          </span>
          <span>
            {banner.display_mode === 'inline'
              ? `Inline - pushes content ${banner.position === 'top' ? 'down' : 'up'}`
              : 'Float - overlays content with shadow'}
          </span>
        </div>
      </div>
    </div>
  );
}
