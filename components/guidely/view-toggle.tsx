'use client';

import { useEffect, useRef, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'table';

interface ViewToggleProps {
  storageKey: string;
  defaultView?: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ storageKey, defaultView = 'table', onViewChange }: ViewToggleProps) {
  const [view, setView] = useState<ViewMode>(defaultView);
  const initializedRef = useRef(false);

  // On mount, read localStorage and notify parent. setState is intentionally
  // deferred via requestAnimationFrame to avoid the synchronous-setState-in-effect rule.
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const stored = localStorage.getItem(storageKey) as ViewMode | null;
    if (stored && (stored === 'grid' || stored === 'table') && stored !== view) {
      requestAnimationFrame(() => {
        setView(stored);
        onViewChange(stored);
      });
    }
  }, [storageKey, onViewChange, view]);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem(storageKey, newView);
    onViewChange(newView);
  };

  return (
    <div className="flex border rounded-md">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-9 w-9 rounded-r-none',
          view === 'grid' && 'bg-muted'
        )}
        onClick={() => handleViewChange('grid')}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-9 w-9 rounded-l-none border-l',
          view === 'table' && 'bg-muted'
        )}
        onClick={() => handleViewChange('table')}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">Table view</span>
      </Button>
    </div>
  );
}
