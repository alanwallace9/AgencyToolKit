'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Settings,
  Play,
  Pause,
  MoreHorizontal,
  Copy,
  Trash2,
  Archive,
  Check,
  Loader2,
  Plus,
  Settings2,
  X,
  GripVertical,
  MousePointer,
  Hand,
  Focus,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  updateSmartTip,
  publishSmartTip,
  unpublishSmartTip,
  archiveSmartTip,
  duplicateSmartTip,
  deleteSmartTip,
  createSmartTip,
  reorderSmartTips,
} from '@/app/(dashboard)/tours/_actions/smart-tip-actions';
import { TipSettingsPanel } from './tip-settings-panel';
import { TipPreview } from './tip-preview';
import { TipGlobalSettings } from './tip-global-settings';
import { useSoftGate } from '@/hooks/use-soft-gate';
import { UpgradeModal } from '@/components/shared/upgrade-modal';
import type { SmartTip, TourTheme } from '@/types/database';

interface SmartTipsBuilderProps {
  tip: SmartTip;
  allTips: SmartTip[];
  themes: TourTheme[];
  ghlDomain: string | null;
  builderAutoClose: boolean;
  backHref?: string;
  plan: string;
}

const triggerIcons = {
  hover: MousePointer,
  click: Hand,
  focus: Focus,
  delay: Timer,
};

// Sortable tip item component
interface SortableTipItemProps {
  tipItem: SmartTip;
  isSelected: boolean;
  showSettingsPanel: boolean;
  backHref: string;
  onToggleSettings: () => void;
  onNavigate: () => void;
}

function SortableTipItem({
  tipItem,
  isSelected,
  showSettingsPanel,
  backHref,
  onToggleSettings,
  onNavigate,
}: SortableTipItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tipItem.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const TriggerIcon = triggerIcons[tipItem.trigger as keyof typeof triggerIcons] || MousePointer;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 rounded-md transition-colors",
        isSelected
          ? "bg-primary/10"
          : "hover:bg-muted"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="p-1.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <Link
        href={`${backHref}/${tipItem.id}`}
        className={cn(
          "flex-1 py-2 pr-2 min-w-0",
          isSelected && "pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn(
            "truncate text-sm",
            isSelected ? "font-medium text-primary" : "text-foreground"
          )}>
            {tipItem.name}
          </span>
          {tipItem.status === 'live' && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <TriggerIcon className="h-3 w-3" />
          <span className="capitalize">{tipItem.trigger}</span>
        </div>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 shrink-0 mr-1",
          isSelected && showSettingsPanel
            ? "text-primary"
            : "opacity-0 group-hover:opacity-100"
        )}
        onClick={() => {
          if (isSelected) {
            onToggleSettings();
          } else {
            onNavigate();
          }
        }}
      >
        <Settings2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function SmartTipsBuilder({
  tip: initialTip,
  allTips: initialAllTips,
  themes,
  ghlDomain,
  builderAutoClose,
  backHref = '/g/tips',
  plan,
}: SmartTipsBuilderProps) {
  const router = useRouter();
  const { showUpgradeModal, setShowUpgradeModal, gatedAction } = useSoftGate({
    plan,
    feature: 'guidely',
  });
  const [tip, setTip] = useState<SmartTip>(initialTip);
  const [allTips, setAllTips] = useState<SmartTip[]>(initialAllTips);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Drag and drop sensors
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

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = allTips.findIndex((t) => t.id === active.id);
      const newIndex = allTips.findIndex((t) => t.id === over.id);

      const newOrder = arrayMove(allTips, oldIndex, newIndex);
      setAllTips(newOrder);

      // Save the new order to the database
      try {
        await reorderSmartTips(newOrder.map((t) => t.id));
      } catch (error) {
        // Revert on error
        setAllTips(allTips);
        toast.error('Failed to reorder tips');
      }
    }
  };

  // Auto-save with debounce
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateSmartTip(tip.id, {
          name: tip.name,
          content: tip.content,
          trigger: tip.trigger,
          delay_seconds: tip.delay_seconds,
          position: tip.position,
          size: tip.size,
          beacon: tip.beacon,
          element: tip.element,
          targeting: tip.targeting,
          theme_id: tip.theme_id,
        });
        setHasChanges(false);
        // Update tip in allTips list
        setAllTips(prev => prev.map(t => t.id === tip.id ? tip : t));
      } catch (error) {
        toast.error('Failed to save changes');
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [tip, hasChanges]);

  const updateLocalTip = useCallback((updates: Partial<SmartTip>) => {
    setTip(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  const handleCreateTip = async () => {
    setIsCreating(true);
    try {
      const newTip = await createSmartTip({ name: 'New Tip' });
      toast.success('Tip created');
      router.push(`${backHref}/${newTip.id}`);
    } catch (error) {
      toast.error('Failed to create tip');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePublish = async () => {
    // Soft gate: check if Pro before publishing
    await gatedAction(async () => {
      setIsUpdatingStatus(true);
      try {
        const updated = await publishSmartTip(tip.id);
        setTip(updated);
        setAllTips(prev => prev.map(t => t.id === tip.id ? updated : t));
        toast.success('Smart tip is now live');
      } catch (error) {
        toast.error('Failed to publish');
      } finally {
        setIsUpdatingStatus(false);
      }
    });
  };

  const handleUnpublish = async () => {
    setIsUpdatingStatus(true);
    try {
      const updated = await unpublishSmartTip(tip.id);
      setTip(updated);
      setAllTips(prev => prev.map(t => t.id === tip.id ? updated : t));
      toast.success('Smart tip unpublished');
    } catch (error) {
      toast.error('Failed to unpublish');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleArchive = async () => {
    setIsUpdatingStatus(true);
    try {
      await archiveSmartTip(tip.id);
      toast.success('Smart tip archived');
      router.push(backHref);
    } catch (error) {
      toast.error('Failed to archive');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const newTip = await duplicateSmartTip(tip.id);
      toast.success('Smart tip duplicated');
      router.push(`${backHref}/${newTip.id}`);
    } catch (error) {
      toast.error('Failed to duplicate');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSmartTip(tip.id);
      toast.success('Smart tip deleted');
      router.push(backHref);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const selectedTheme = themes.find(t => t.id === tip.theme_id) || themes.find(t => t.is_default);

  const getStatusBadge = () => {
    switch (tip.status) {
      case 'live':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            Live
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Archived
          </Badge>
        );
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  // Check if tip can be published (needs selector and content)
  const canPublish = tip.element?.selector && tip.content?.trim();

  // Filter tips to show (exclude archived unless current tip is archived)
  const visibleTips = allTips.filter(t => t.status !== 'archived' || t.id === tip.id);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Input
            value={tip.name}
            onChange={(e) => updateLocalTip({ name: e.target.value })}
            className="font-semibold text-lg border-none shadow-none px-2 h-auto py-1 w-64 focus-visible:ring-1"
          />
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          <span className="text-xs text-muted-foreground mr-2">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            ) : hasChanges ? (
              'Unsaved changes'
            ) : (
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                Saved
              </span>
            )}
          </span>

          {/* Global Settings button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGlobalSettings(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>

          {/* Publish/Unpublish */}
          {tip.status === 'draft' ? (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isUpdatingStatus || !canPublish}
              title={!canPublish ? 'Add a target element and content to publish' : undefined}
            >
              <Play className="h-4 w-4 mr-1" />
              Publish
            </Button>
          ) : tip.status === 'live' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnpublish}
              disabled={isUpdatingStatus}
            >
              <Pause className="h-4 w-4 mr-1" />
              Unpublish
            </Button>
          ) : null}

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {tip.status !== 'archived' && (
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content - 3 panel layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left panel - Tips List (scrolls only when many tips) */}
        <div className="w-64 border-r bg-muted/30 flex flex-col min-h-0">
          <div className="p-3 border-b shrink-0">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Tips</h3>
          </div>

          <div className="flex-1 p-2 space-y-1 overflow-y-auto min-h-0">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleTips.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {visibleTips.map((t) => (
                  <SortableTipItem
                    key={t.id}
                    tipItem={t}
                    isSelected={t.id === tip.id}
                    showSettingsPanel={showSettingsPanel}
                    backHref={backHref}
                    onToggleSettings={() => setShowSettingsPanel(!showSettingsPanel)}
                    onNavigate={() => router.push(`${backHref}/${t.id}`)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* Add Tip Button - always visible at bottom */}
          <div className="p-2 border-t shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleCreateTip}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Tip
            </Button>
          </div>
        </div>

        {/* Center panel - Settings (scrollable) */}
        {showSettingsPanel && (
          <div className="w-96 border-r flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b bg-muted/30 shrink-0">
              <h3 className="font-medium">Tip Settings</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowSettingsPanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <TipSettingsPanel
                tip={tip}
                onUpdate={updateLocalTip}
                ghlDomain={ghlDomain}
                builderAutoClose={builderAutoClose}
              />
            </div>
          </div>
        )}

        {/* Right panel - Preview (fixed, no scroll) */}
        <div className="flex-1 bg-muted/30">
          <TipPreview
            tip={tip}
            theme={selectedTheme}
            expanded={!showSettingsPanel}
          />
        </div>
      </div>

      {/* Global Settings Sheet */}
      <TipGlobalSettings
        open={showGlobalSettings}
        onOpenChange={setShowGlobalSettings}
        tip={tip}
        themes={themes}
        onUpdate={updateLocalTip}
      />

      {/* Upgrade Modal for soft-gated actions */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="guidely"
      />
    </div>
  );
}
