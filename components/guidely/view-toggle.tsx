'use client';

import { useEffect, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(storageKey) as ViewMode | null;
    if (stored && (stored === 'grid' || stored === 'table')) {
      setView(stored);
      onViewChange(stored);
    }
  }, [storageKey, onViewChange]);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem(storageKey, newView);
    onViewChange(newView);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex border rounded-md">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-r-none">
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-l-none border-l">
          <List className="h-4 w-4" />
        </Button>
      </div>
    );
  }

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
