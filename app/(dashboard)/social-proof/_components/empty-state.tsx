'use client';

import { Bell } from 'lucide-react';
import { AddWidgetDialog } from './add-widget-dialog';

interface EmptyStateProps {
  widgetLimit: number;
}

export function EmptyState({ widgetLimit }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">No widgets yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Create your first social proof widget to start showing real-time notifications
        on your website. Capture leads automatically and build trust with visitors.
      </p>
      <AddWidgetDialog widgetCount={0} widgetLimit={widgetLimit} />
    </div>
  );
}
