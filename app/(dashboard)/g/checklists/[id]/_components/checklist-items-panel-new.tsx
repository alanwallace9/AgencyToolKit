'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  GripVertical,
  MoreHorizontal,
  Copy,
  Trash2,
  Settings2,
  MousePointer,
  Route,
  Link2,
  Globe,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChecklistItem } from '@/types/database';

interface ChecklistItemsPanelNewProps {
  items: ChecklistItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onOpenItemEditor: (id: string) => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem: (id: string) => void;
  onReorderItems: (items: ChecklistItem[]) => void;
}

const triggerTypeConfig = {
  manual: { icon: MousePointer, label: 'Click', color: 'text-slate-500' },
  tour_complete: { icon: Route, label: 'Tour', color: 'text-blue-500' },
  element_clicked: { icon: Link2, label: 'Element', color: 'text-purple-500' },
  url_visited: { icon: Globe, label: 'URL', color: 'text-green-500' },
  js_event: { icon: Code, label: 'Event', color: 'text-orange-500' },
};

export function ChecklistItemsPanelNew({
  items,
  selectedItemId,
  onSelectItem,
  onOpenItemEditor,
  onAddItem,
  onDeleteItem,
  onDuplicateItem,
  onReorderItems,
}: ChecklistItemsPanelNewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      onReorderItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Items</h3>
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onAddItem}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <p>No items yet.</p>
          <p className="text-xs mt-1">Click "Add" to create your first item.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {items.map((item, index) => (
                <SortableItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  isSelected={item.id === selectedItemId}
                  onSelect={() => onSelectItem(item.id)}
                  onOpenEditor={() => onOpenItemEditor(item.id)}
                  onDuplicate={() => onDuplicateItem(item.id)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

interface SortableItemRowProps {
  item: ChecklistItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onOpenEditor: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function SortableItemRow({
  item,
  index,
  isSelected,
  onSelect,
  onOpenEditor,
  onDuplicate,
  onDelete,
}: SortableItemRowProps) {
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

  const triggerType = item.completion_trigger?.type || 'manual';
  const config = triggerTypeConfig[triggerType] || triggerTypeConfig.manual;
  const TriggerIcon = config.icon;

  return (
    <TooltipProvider delayDuration={500}>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group rounded-lg border bg-card transition-all',
          isSelected && 'border-primary ring-1 ring-primary',
          isDragging && 'opacity-50 shadow-lg',
          !isSelected && 'hover:border-muted-foreground/30'
        )}
      >
        <div
          className="flex items-center gap-2 p-2 cursor-pointer"
          onClick={onSelect}
        >
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -m-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Item number */}
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
            {index + 1}
          </div>

          {/* Checkbox (visual only) */}
          <Checkbox
            checked={false}
            disabled
            className="pointer-events-none shrink-0"
          />

          {/* Item title */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {item.title || 'Untitled item'}
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground truncate">
                {item.description}
              </p>
            )}
          </div>

          {/* Completion trigger badge */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn('shrink-0', config.color)}>
                <TriggerIcon className="h-3.5 w-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Completes on: {config.label}
            </TooltipContent>
          </Tooltip>

          {/* Settings2 button - opens item editor */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditor();
                }}
                className={cn(
                  'p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all',
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )}
              >
                <Settings2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Edit item settings
            </TooltipContent>
          </Tooltip>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 -m-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onOpenEditor}>
                <Settings2 className="h-4 w-4 mr-2" />
                Edit Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
}
