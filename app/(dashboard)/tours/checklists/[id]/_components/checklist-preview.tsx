'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, X, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Checklist, TourTheme } from '@/types/database';

interface ChecklistPreviewProps {
  checklist: Checklist;
  theme?: TourTheme;
}

export function ChecklistPreview({ checklist, theme }: ChecklistPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const completedCount = completedItems.length;
  const totalCount = checklist.items.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Theme colors
  const primaryColor = theme?.colors?.primary || '#3b82f6';
  const backgroundColor = theme?.colors?.background || '#ffffff';
  const textColor = theme?.colors?.text || '#1f2937';
  const textSecondary = theme?.colors?.text_secondary || '#6b7280';
  const borderRadius = theme?.borders?.radius || '12px';

  const toggleItem = (itemId: string) => {
    setCompletedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Live Preview</h3>
        <span className="text-xs text-muted-foreground">Interactive</span>
      </div>

      {/* Preview container - simulates bottom of page */}
      <div
        className="relative bg-slate-100 rounded-lg overflow-hidden"
        style={{ height: '500px' }}
      >
        {/* Fake page content */}
        <div className="p-4 space-y-3">
          <div className="h-8 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-24 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
        </div>

        {/* Checklist Widget */}
        <div
          className={cn(
            'absolute bottom-0 transition-all duration-300',
            checklist.widget.position === 'bottom-right' ? 'right-3' : 'left-3'
          )}
          style={{ width: '280px' }}
        >
          {/* Minimized Tab */}
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium text-sm text-white transition-transform hover:-translate-y-0.5"
              style={{
                backgroundColor: primaryColor,
                borderRadius: `${borderRadius} ${borderRadius} 0 0`,
              }}
            >
              <span>{checklist.widget.minimized_text}</span>
              <ChevronUp className="h-4 w-4" />
            </button>
          )}

          {/* Expanded Widget */}
          {isExpanded && (
            <div
              className="shadow-lg"
              style={{
                backgroundColor,
                borderRadius,
                color: textColor,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-3 rounded-t-xl text-white"
                style={{
                  backgroundColor: primaryColor,
                  borderRadius: `${borderRadius} ${borderRadius} 0 0`,
                }}
              >
                <span className="font-semibold text-sm">{checklist.title}</span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="hover:bg-white/20 rounded p-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="px-3 pt-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{percent}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: primaryColor,
                    }}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="p-3 space-y-2 max-h-[200px] overflow-y-auto">
                {checklist.items.map((item) => {
                  const isCompleted = completedItems.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className="w-full flex items-start gap-2 text-left hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle2
                          className="h-5 w-5 flex-shrink-0 mt-0.5"
                          style={{ color: primaryColor }}
                        />
                      ) : (
                        <Circle
                          className="h-5 w-5 flex-shrink-0 mt-0.5"
                          style={{ color: textSecondary }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            'text-sm font-medium block',
                            isCompleted && 'line-through opacity-60'
                          )}
                          style={{ color: textColor }}
                        >
                          {item.title}
                        </span>
                        {item.description && (
                          <span
                            className="text-xs block mt-0.5"
                            style={{ color: textSecondary }}
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
                  style={{ color: textSecondary }}
                >
                  Dismiss onboarding
                </button>
                <button
                  className="w-full py-2 px-4 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  {checklist.widget.cta_text}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview controls */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Click items to toggle completion
        </span>
        <button
          onClick={() => setCompletedItems([])}
          className="text-primary hover:underline"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
