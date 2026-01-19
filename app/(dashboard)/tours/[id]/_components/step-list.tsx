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
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TourStep } from '@/types/database';
import type { ValidationResult } from './element-validator';

interface StepListProps {
  steps: TourStep[];
  selectedStepId: string | null;
  validationResults?: ValidationResult[];
  onSelectStep: (id: string) => void;
  onAddStep: (type?: TourStep['type']) => void;
  onDuplicateStep: (id: string) => void;
  onDeleteStep: (id: string) => void;
  onReorderSteps: (steps: TourStep[]) => void;
}

const stepTypeConfig = {
  modal: { icon: MessageSquare, label: 'Modal', color: 'text-blue-500' },
  tooltip: { icon: Pointer, label: 'Tooltip', color: 'text-purple-500' },
  slideout: { icon: PanelRightOpen, label: 'Slideout', color: 'text-orange-500' },
  hotspot: { icon: CircleDot, label: 'Hotspot', color: 'text-pink-500' },
  banner: { icon: Megaphone, label: 'Banner', color: 'text-green-500' },
};

export function StepList({
  steps,
  selectedStepId,
  validationResults,
  onSelectStep,
  onAddStep,
  onDuplicateStep,
  onDeleteStep,
  onReorderSteps,
}: StepListProps) {
  const [collapsedSteps, setCollapsedSteps] = useState<Set<string>>(new Set());

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

  const toggleCollapse = (stepId: string) => {
    setCollapsedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Steps</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onAddStep('modal')}>
              <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
              Modal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddStep('tooltip')}>
              <Pointer className="h-4 w-4 mr-2 text-purple-500" />
              Tooltip
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddStep('banner')}>
              <Megaphone className="h-4 w-4 mr-2 text-green-500" />
              Banner
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddStep('hotspot')}>
              <CircleDot className="h-4 w-4 mr-2 text-pink-500" />
              Hotspot
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddStep('slideout')}>
              <PanelRightOpen className="h-4 w-4 mr-2 text-orange-500" />
              Slideout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
                  isCollapsed={collapsedSteps.has(step.id)}
                  validationResult={validationResults?.find((r) => r.stepId === step.id)}
                  onSelect={() => onSelectStep(step.id)}
                  onDuplicate={() => onDuplicateStep(step.id)}
                  onDelete={() => onDeleteStep(step.id)}
                  onToggleCollapse={() => toggleCollapse(step.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Keyboard hint */}
      <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
        <p>Alt + ↑↓ to navigate</p>
        <p>Cmd/Ctrl + N to add step</p>
      </div>
    </div>
  );
}

interface SortableStepItemProps {
  step: TourStep;
  index: number;
  isSelected: boolean;
  isCollapsed: boolean;
  validationResult?: ValidationResult;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleCollapse: () => void;
}

function SortableStepItem({
  step,
  index,
  isSelected,
  isCollapsed,
  validationResult,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleCollapse,
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
    ? step.content.replace(/<[^>]*>/g, '').slice(0, 50)
    : '';

  return (
    <TooltipProvider delayDuration={500}>
      <Tooltip>
        <TooltipTrigger asChild>
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

              {/* Collapse toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse();
                }}
                className="p-0.5 -m-0.5 text-muted-foreground hover:text-foreground"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>

              {/* Step number */}
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>

              {/* Step type icon */}
              <Icon className={cn('h-4 w-4', config.color)} />

              {/* Step title */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate flex items-center gap-1.5">
                  {truncatedTitle}
                  {/* Validation status badge */}
                  {validationResult && validationResult.status !== 'pending' && validationResult.status !== 'no_selector' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex-shrink-0">
                          {validationResult.status === 'found' && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          )}
                          {validationResult.status === 'not_found' && (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          )}
                          {validationResult.status === 'error' && (
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        {validationResult.status === 'found' && 'Element found on page'}
                        {validationResult.status === 'not_found' && 'Element not found on page'}
                        {validationResult.status === 'error' && 'Validation error - try again'}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

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

            {/* Expanded content preview */}
            {!isCollapsed && truncatedContent && (
              <div className="px-2 pb-2 pl-[68px]">
                <p className="text-xs text-muted-foreground truncate">
                  {truncatedContent}
                </p>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="font-medium">{truncatedTitle}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {config.label}
          </div>
          {truncatedContent && (
            <div className="text-xs mt-1 line-clamp-3">{truncatedContent}</div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
