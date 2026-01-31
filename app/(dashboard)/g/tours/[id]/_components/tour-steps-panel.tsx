'use client';

import { useState } from 'react';
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
  MessageSquare,
  Pointer,
  PanelRightOpen,
  CircleDot,
  Megaphone,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TourStep } from '@/types/database';

interface TourStepsPanelProps {
  steps: TourStep[];
  selectedStepId: string | null;
  onSelectStep: (id: string) => void;
  onOpenStepEditor: (id: string) => void;
  onAddStep: () => void;
  onDeleteStep: (id: string) => void;
  onDuplicateStep: (id: string) => void;
  onReorderSteps: (steps: TourStep[]) => void;
}

const stepTypeConfig = {
  modal: { icon: MessageSquare, label: 'Modal', color: 'text-blue-500' },
  tooltip: { icon: Pointer, label: 'Tooltip', color: 'text-purple-500' },
  slideout: { icon: PanelRightOpen, label: 'Slideout', color: 'text-orange-500' },
  hotspot: { icon: CircleDot, label: 'Hotspot', color: 'text-pink-500' },
  banner: { icon: Megaphone, label: 'Banner', color: 'text-green-500' },
};

export function TourStepsPanel({
  steps,
  selectedStepId,
  onSelectStep,
  onOpenStepEditor,
  onAddStep,
  onDeleteStep,
  onDuplicateStep,
  onReorderSteps,
}: TourStepsPanelProps) {
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
      const oldIndex = steps.findIndex((s) => s.id === active.id);
      const newIndex = steps.findIndex((s) => s.id === over.id);
      onReorderSteps(arrayMove(steps, oldIndex, newIndex));
    }
  };

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Steps</h3>
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onAddStep}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Empty state */}
      {steps.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <p>No steps yet.</p>
          <p className="text-xs mt-1">Click "Add" to create your first step.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={steps.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {steps.map((step, index) => (
                <SortableStepItem
                  key={step.id}
                  step={step}
                  index={index}
                  isSelected={step.id === selectedStepId}
                  onSelect={() => onSelectStep(step.id)}
                  onOpenEditor={() => onOpenStepEditor(step.id)}
                  onDuplicate={() => onDuplicateStep(step.id)}
                  onDelete={() => onDeleteStep(step.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

interface SortableStepItemProps {
  step: TourStep;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onOpenEditor: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function SortableStepItem({
  step,
  index,
  isSelected,
  onSelect,
  onOpenEditor,
  onDuplicate,
  onDelete,
}: SortableStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = stepTypeConfig[step.type] || stepTypeConfig.modal;
  const Icon = config.icon;

  const truncatedTitle = step.title || `Step ${index + 1}`;
  const truncatedContent = step.content
    ? step.content.replace(/<[^>]*>/g, '').slice(0, 40)
    : '';

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

          {/* Step number */}
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
            {index + 1}
          </div>

          {/* Step type icon */}
          <Icon className={cn('h-4 w-4 shrink-0', config.color)} />

          {/* Step title */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {truncatedTitle}
            </div>
            {truncatedContent && (
              <p className="text-xs text-muted-foreground truncate">
                {truncatedContent}
              </p>
            )}
          </div>

          {/* Settings2 button - opens step editor */}
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
              Edit step settings
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
