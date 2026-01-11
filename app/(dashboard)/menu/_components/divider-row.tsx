'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Minus, Type } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MenuItemType } from '@/lib/constants';

export interface DividerConfig {
  id: string;
  type: MenuItemType;
  label: string;
  visible: boolean;
  dividerText?: string;
}

interface DividerRowProps {
  item: DividerConfig;
  onToggleVisibility: () => void;
  onUpdateText: (text: string) => void;
  onDelete: () => void;
}

export function DividerRow({
  item,
  onToggleVisibility,
  onUpdateText,
  onDelete,
}: DividerRowProps) {
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

  const isLabeled = item.type === 'divider_labeled';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-background',
        'border-dashed border-muted-foreground/30',
        isDragging && 'opacity-50 shadow-lg',
        !item.visible && 'opacity-50'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab hover:bg-muted rounded p-1 -ml-1 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Toggle */}
      <Switch
        checked={item.visible}
        onCheckedChange={onToggleVisibility}
        aria-label={`Toggle divider visibility`}
      />

      {/* Divider Type Icon */}
      <div className="flex items-center gap-2 text-muted-foreground">
        {isLabeled ? (
          <Type className="h-4 w-4" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </div>

      {/* Label or Input */}
      {isLabeled ? (
        <Input
          placeholder="Section label..."
          value={item.dividerText || ''}
          onChange={(e) => onUpdateText(e.target.value)}
          className={cn(
            'h-8 text-sm flex-1 font-medium tracking-wide uppercase',
            'bg-muted/50 border-muted'
          )}
          disabled={!item.visible}
        />
      ) : (
        <span
          className={cn(
            'flex-1 text-sm text-muted-foreground font-mono tracking-widest',
            !item.visible && 'line-through'
          )}
        >
          ────────────────
        </span>
      )}

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={onDelete}
        aria-label="Remove divider"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
