'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MenuItemConfig {
  id: string;
  label: string;
  visible: boolean;
  rename: string;
}

interface MenuItemRowProps {
  item: MenuItemConfig;
  onToggleVisibility: () => void;
  onRename: (rename: string) => void;
}

export function MenuItemRow({
  item,
  onToggleVisibility,
  onRename,
}: MenuItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-background',
        isDragging && 'opacity-50 shadow-lg',
        !item.visible && 'opacity-60'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab hover:bg-muted rounded p-1 -ml-1"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Toggle */}
      <Switch
        checked={item.visible}
        onCheckedChange={onToggleVisibility}
        aria-label={`Toggle ${item.label} visibility`}
      />

      {/* Label */}
      <span
        className={cn(
          'font-medium text-sm flex-shrink-0 w-32',
          !item.visible && 'text-muted-foreground line-through'
        )}
      >
        {item.label}
      </span>

      {/* Rename Input */}
      <Input
        placeholder="Rename to..."
        value={item.rename}
        onChange={(e) => onRename(e.target.value)}
        className="h-8 text-sm"
        disabled={!item.visible}
      />
    </div>
  );
}
