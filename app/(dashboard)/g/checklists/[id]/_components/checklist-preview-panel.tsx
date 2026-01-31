'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, X, ChevronUp, RefreshCcw, FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Checklist, TourTheme } from '@/types/database';

interface ChecklistPreviewPanelProps {
  checklist: Checklist;
  theme?: TourTheme | null;
}

const defaultColors = {
  primary: '#3b82f6',
  secondary: '#64748b',
  background: '#ffffff',
  text: '#1f2937',
  text_secondary: '#6b7280',
  border: '#e5e7eb',
};

export function ChecklistPreviewPanel({ checklist, theme }: ChecklistPreviewPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const items = checklist.items || [];
  const completedCount = completedItems.length;
  const totalCount = items.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Theme colors with fallbacks
  const colors = {
    primary: (theme?.colors as typeof defaultColors)?.primary || defaultColors.primary,
    background: (theme?.colors as typeof defaultColors)?.background || defaultColors.background,
    text: (theme?.colors as typeof defaultColors)?.text || defaultColors.text,
    text_secondary: (theme?.colors as typeof defaultColors)?.text_secondary || defaultColors.text_secondary,
  };
  const borderRadius = (theme?.borders as { radius?: string })?.radius || '12px';

  const toggleItem = (itemId: string) => {
    setCompletedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const resetItems = () => {
    setCompletedItems([]);
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <FileQuestion className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">No items to preview</p>
        <p className="text-xs mt-1">Add an item to see the preview</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background/50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Preview</span>
          <span className="text-xs text-muted-foreground">
            {percent}% complete
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={resetItems}
        >
          <RefreshCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Preview area */}
      <div className="flex-1 relative overflow-auto bg-slate-100 p-4">
        {/* Fake page content - skeleton */}
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-32 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-24 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>

        {/* Checklist Widget */}
        <div
          className={cn(
            'fixed bottom-4 transition-all duration-300 z-10',
            checklist.widget?.position === 'bottom-left' ? 'left-4' : 'right-4'
          )}
          style={{ width: '320px', maxWidth: 'calc(100% - 2rem)' }}
        >
          {/* Minimized Tab */}
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium text-sm text-white transition-transform hover:-translate-y-0.5"
              style={{
                backgroundColor: colors.primary,
                borderRadius: `${borderRadius} ${borderRadius} 0 0`,
              }}
            >
              <span>{checklist.widget?.minimized_text || 'Get started'}</span>
              <ChevronUp className="h-4 w-4" />
            </button>
          )}

          {/* Expanded Widget */}
          {isExpanded && (
            <div
              className="shadow-xl"
              style={{
                backgroundColor: colors.background,
                borderRadius,
                color: colors.text,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-3 text-white"
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: `${borderRadius} ${borderRadius} 0 0`,
                }}
              >
                <span className="font-semibold text-sm">
                  {checklist.title || 'Getting Started'}
                </span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="hover:bg-white/20 rounded p-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="px-4 pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color: colors.text }}>
                    Your progress
                  </span>
                  <span className="text-xs font-semibold" style={{ color: colors.primary }}>
                    {percent}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: colors.primary,
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              {checklist.description && (
                <p
                  className="px-4 pt-2 text-xs"
                  style={{ color: colors.text_secondary }}
                >
                  {checklist.description}
                </p>
              )}

              {/* Items */}
              <div className="p-3 space-y-1 max-h-[280px] overflow-y-auto">
                {items.map((item) => {
                  const isCompleted = completedItems.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="w-full flex items-start gap-3 text-left hover:bg-slate-50 rounded-lg p-2.5 -mx-1 transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle2
                          className="h-5 w-5 flex-shrink-0 mt-0.5"
                          style={{ color: colors.primary }}
                        />
                      ) : (
                        <Circle
                          className="h-5 w-5 flex-shrink-0 mt-0.5"
                          style={{ color: colors.text_secondary }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            'text-sm font-medium block',
                            isCompleted && 'line-through opacity-60'
                          )}
                          style={{ color: colors.text }}
                        >
                          {item.title}
                        </span>
                        {item.description && (
                          <span
                            className="text-xs block mt-0.5"
                            style={{ color: colors.text_secondary }}
                          >
                            {item.description}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-3 border-t space-y-2">
                <button
                  className="text-xs hover:underline block mx-auto"
                  style={{ color: colors.text_secondary }}
                >
                  Dismiss onboarding
                </button>
                {checklist.widget?.cta_text && (
                  <button
                    className="w-full py-2.5 px-4 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {checklist.widget.cta_text}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between p-3 border-t bg-background/50 shrink-0 text-xs text-muted-foreground">
        <span>Click items to toggle completion</span>
        <span>
          Position: {checklist.widget?.position === 'bottom-left' ? 'Bottom Left' : 'Bottom Right'}
        </span>
      </div>
    </div>
  );
}
