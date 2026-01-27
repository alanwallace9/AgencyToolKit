'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, GripVertical, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import type { ChecklistItem } from '@/types/database';

interface ChecklistItemsPanelProps {
  items: ChecklistItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onAddItem: () => void;
  onReorderItems: (items: ChecklistItem[]) => void;
}

export function ChecklistItemsPanel({
  items,
  selectedItemId,
  onSelectItem,
  onAddItem,
  onReorderItems,
}: ChecklistItemsPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index,
      }));

      onReorderItems(newItems);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          Items
        </h3>
        <span className="text-xs text-muted-foreground">{items.length} items</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                isSelected={item.id === selectedItemId}
                onSelect={() => onSelectItem(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        variant="outline"
        size="sm"
        className="w-full mt-4"
        onClick={onAddItem}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add item
      </Button>
    </div>
  );
}

interface SortableItemProps {
  item: ChecklistItem;
  isSelected: boolean;
  onSelect: () => void;
}

function SortableItem({ item, isSelected, onSelect }: SortableItemProps) {
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
        'flex items-center gap-2 p-2 rounded-lg border bg-background cursor-pointer transition-colors',
        isSelected && 'ring-2 ring-primary border-primary',
        isDragging && 'opacity-50'
      )}
      onClick={onSelect}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab hover:bg-muted rounded p-1 -ml-1"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex-shrink-0">
        <Checkbox
          checked={false}
          disabled
          className="pointer-events-none"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.title || 'Untitled item'}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        )}
      </div>

      <span className="text-xs text-muted-foreground flex-shrink-0">
        {item.completion_trigger.type === 'manual' && 'Click'}
        {item.completion_trigger.type === 'tour_complete' && 'Tour'}
        {item.completion_trigger.type === 'element_clicked' && 'Element'}
        {item.completion_trigger.type === 'url_visited' && 'URL'}
      </span>
    </div>
  );
}
