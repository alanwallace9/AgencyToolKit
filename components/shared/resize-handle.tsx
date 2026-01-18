'use client';

import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  onDragStart: (clientX: number) => void;
  className?: string;
}

export function ResizeHandle({ onDragStart, className }: ResizeHandleProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onDragStart(e.clientX);
  };

  return (
    <div
      className={cn(
        'group relative flex items-center justify-center w-2 cursor-col-resize',
        'hover:bg-primary/10 transition-colors',
        className
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Visual indicator - subtle grip icon */}
      <div className="absolute inset-y-0 flex items-center justify-center w-4 -mx-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground/50" />
      </div>

      {/* Active drag line */}
      <div className="absolute inset-y-4 w-[2px] bg-transparent group-hover:bg-primary/30 rounded-full transition-colors" />
    </div>
  );
}
