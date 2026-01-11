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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { MenuItemRow } from './menu-item-row';
import { DividerRow } from '../../_components/divider-row';
import type { MenuItemType } from '@/lib/constants';

export interface MenuItemConfig {
  id: string;
  label: string;
  visible: boolean;
  rename: string;
  type?: MenuItemType;
  dividerText?: string;
}

interface MenuSortableListProps {
  items: MenuItemConfig[];
  onToggleVisibility: (id: string) => void;
  onRename: (id: string, rename: string) => void;
  onReorder: (items: MenuItemConfig[]) => void;
  onUpdateDividerText?: (id: string, text: string) => void;
  onDeleteDivider?: (id: string) => void;
}

export function MenuSortableList({
  items,
  onToggleVisibility,
  onRename,
  onReorder,
  onUpdateDividerText,
  onDeleteDivider,
}: MenuSortableListProps) {
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
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  const isDivider = (item: MenuItemConfig) =>
    item.type === 'divider_plain' || item.type === 'divider_labeled';

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item) =>
            isDivider(item) ? (
              <DividerRow
                key={item.id}
                item={{
                  id: item.id,
                  type: item.type!,
                  label: item.label,
                  visible: item.visible,
                  dividerText: item.dividerText,
                }}
                onToggleVisibility={() => onToggleVisibility(item.id)}
                onUpdateText={(text) => onUpdateDividerText?.(item.id, text)}
                onDelete={() => onDeleteDivider?.(item.id)}
              />
            ) : (
              <MenuItemRow
                key={item.id}
                item={item}
                onToggleVisibility={() => onToggleVisibility(item.id)}
                onRename={(rename) => onRename(item.id, rename)}
              />
            )
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
