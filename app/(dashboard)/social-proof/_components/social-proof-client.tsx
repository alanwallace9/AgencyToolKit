'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { WidgetCard } from './widget-card';
import { AddWidgetDialog } from './add-widget-dialog';
import { EmptyState } from './empty-state';
import type { SocialProofWidget } from '@/types/database';

interface SocialProofClientProps {
  widgets: Array<SocialProofWidget & { event_count: number; today_count: number }>;
  widgetLimit: number;
  plan: string;
}

export function SocialProofClient({
  widgets,
  widgetLimit,
  plan,
}: SocialProofClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter widgets by search query
  const filteredWidgets = widgets.filter((widget) =>
    widget.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = widgets.filter((w) => w.is_active).length;
  const pausedCount = widgets.filter((w) => !w.is_active).length;
  const isAtLimit = widgetLimit !== Infinity && widgets.length >= widgetLimit;

  if (widgets.length === 0) {
    return <EmptyState widgetLimit={widgetLimit} plan={plan} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {widgets.length} {widgetLimit === Infinity ? 'of unlimited' : `/ ${widgetLimit}`} widgets
          </Badge>
          {activeCount > 0 && (
            <Badge
              variant="outline"
              className="text-xs bg-green-50 text-green-700 border-green-200"
            >
              {activeCount} active
            </Badge>
          )}
          {pausedCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {pausedCount} paused
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <AddWidgetDialog
            widgetCount={widgets.length}
            widgetLimit={widgetLimit}
            plan={plan}
          />
        </div>
      </div>

      {/* Upgrade prompt when at limit */}
      {isAtLimit && plan !== 'pro' && (
        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Widget limit reached</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Upgrade to Pro for unlimited widgets and more features.
              </p>
            </div>
            <Badge variant="secondary" className="bg-violet-100 text-violet-700">
              Pro
            </Badge>
          </div>
        </div>
      )}

      {/* Widget Grid */}
      {filteredWidgets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWidgets.map((widget) => (
            <WidgetCard key={widget.id} widget={widget} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            No widgets match &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm text-blue-600 hover:underline mt-2"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
