'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  /** Whether the section is currently saving */
  isSaving?: boolean;
  /** Last saved timestamp (ISO string) */
  lastSaved?: string | null;
  /** Additional content to render on the right side */
  actions?: React.ReactNode;
}

export function SectionHeader({
  title,
  isSaving = false,
  lastSaved,
  actions,
}: SectionHeaderProps) {
  // Force re-render every 30s to keep relative time fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const savedTimeAgo = lastSaved
    ? formatDistanceToNow(new Date(lastSaved), { addSuffix: true })
    : null;

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>

      <div className="flex items-center gap-3">
        {/* Save status */}
        {isSaving ? (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Saving...</span>
          </div>
        ) : savedTimeAgo ? (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-green-500" />
            <span>Saved {savedTimeAgo}</span>
          </div>
        ) : null}

        {actions}
      </div>
    </div>
  );
}
