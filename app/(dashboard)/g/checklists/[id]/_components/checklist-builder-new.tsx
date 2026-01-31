'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Settings2,
  Play,
  Pause,
  MoreHorizontal,
  Copy,
  Trash2,
  Archive,
  Check,
  Loader2,
  X,
  Undo,
  Redo,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  updateChecklist,
  publishChecklist,
  unpublishChecklist,
  archiveChecklist,
  duplicateChecklist,
  deleteChecklist,
} from '@/app/(dashboard)/tours/_actions/checklist-actions';
import { createDefaultItem } from '@/app/(dashboard)/tours/_lib/checklist-defaults';
import { ChecklistItemsPanelNew } from './checklist-items-panel-new';
import { ChecklistItemEditor } from './checklist-item-editor';
import { ChecklistPreviewPanel } from './checklist-preview-panel';
import { ChecklistSettingsPanel } from '@/app/(dashboard)/tours/checklists/[id]/_components/checklist-settings-panel';
import type { Checklist, ChecklistItem, TourTheme, Customer } from '@/types/database';
import type { TourWithStats } from '@/app/(dashboard)/tours/_actions/tour-actions';

interface ChecklistBuilderNewProps {
  checklist: Checklist;
  themes: TourTheme[];
  tours: TourWithStats[];
  customers: Customer[];
  backHref?: string;
}

export function ChecklistBuilderNew({
  checklist: initialChecklist,
  themes,
  tours,
  customers,
  backHref = '/g/checklists',
}: ChecklistBuilderNewProps) {
  const router = useRouter();
  const [checklist, setChecklist] = useState<Checklist>(initialChecklist);
  const [items, setItems] = useState<ChecklistItem[]>(initialChecklist.items || []);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    items[0]?.id || null
  );
  const [showItemEditor, setShowItemEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Undo/Redo history
  const [history, setHistory] = useState<ChecklistItem[][]>([items]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedo = useRef(false);

  // Track last saved state
  const lastSavedRef = useRef({
    name: initialChecklist.name,
    items: JSON.stringify(items),
    title: initialChecklist.title,
    description: initialChecklist.description,
    widget: JSON.stringify(initialChecklist.widget),
    on_complete: JSON.stringify(initialChecklist.on_complete),
    targeting: JSON.stringify(initialChecklist.targeting),
    theme_id: initialChecklist.theme_id,
  });

  const selectedItem = items.find((i) => i.id === selectedItemId) || null;
  const selectedTheme = themes.find((t) => t.id === checklist.theme_id) || themes.find((t) => t.is_default);

  // Push to history (for undo/redo)
  const pushHistory = useCallback((newItems: ChecklistItem[]) => {
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newItems);
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedo.current = true;
      setHistoryIndex((prev) => prev - 1);
      setItems(history[historyIndex - 1]);
      setHasChanges(true);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true;
      setHistoryIndex((prev) => prev + 1);
      setItems(history[historyIndex + 1]);
      setHasChanges(true);
    }
  }, [history, historyIndex]);

  // Auto-save with debounce
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateChecklist(checklist.id, {
          name: checklist.name,
          title: checklist.title,
          description: checklist.description,
          items,
          widget: checklist.widget,
          on_complete: checklist.on_complete,
          targeting: checklist.targeting,
          theme_id: checklist.theme_id,
        });
        lastSavedRef.current = {
          name: checklist.name,
          items: JSON.stringify(items),
          title: checklist.title,
          description: checklist.description,
          widget: JSON.stringify(checklist.widget),
          on_complete: JSON.stringify(checklist.on_complete),
          targeting: JSON.stringify(checklist.targeting),
          theme_id: checklist.theme_id,
        };
        setHasChanges(false);
      } catch (error) {
        toast.error('Failed to save changes');
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [checklist, items, hasChanges]);

  // Mark as unsaved when data changes
  useEffect(() => {
    const currentItems = JSON.stringify(items);
    const currentWidget = JSON.stringify(checklist.widget);
    const currentOnComplete = JSON.stringify(checklist.on_complete);
    const currentTargeting = JSON.stringify(checklist.targeting);

    const changed =
      checklist.name !== lastSavedRef.current.name ||
      currentItems !== lastSavedRef.current.items ||
      checklist.title !== lastSavedRef.current.title ||
      checklist.description !== lastSavedRef.current.description ||
      currentWidget !== lastSavedRef.current.widget ||
      currentOnComplete !== lastSavedRef.current.on_complete ||
      currentTargeting !== lastSavedRef.current.targeting ||
      checklist.theme_id !== lastSavedRef.current.theme_id;

    if (changed && !hasChanges) {
      setHasChanges(true);
    }
  }, [checklist, items, hasChanges]);

  // Update checklist fields (except items)
  const updateLocalChecklist = useCallback((updates: Partial<Checklist>) => {
    setChecklist((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  // Item management
  const handleAddItem = () => {
    const newItem = createDefaultItem(items.length);
    const newItems = [...items, newItem];
    setItems(newItems);
    pushHistory(newItems);
    setSelectedItemId(newItem.id);
    setShowItemEditor(true);
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleOpenItemEditor = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowItemEditor(true);
  };

  const handleUpdateItem = (itemId: string, updates: Partial<ChecklistItem>) => {
    const newItems = items.map((i) =>
      i.id === itemId ? { ...i, ...updates } : i
    );
    setItems(newItems);
    pushHistory(newItems);
  };

  const handleDeleteItem = (itemId: string) => {
    const newItems = items
      .filter((i) => i.id !== itemId)
      .map((i, idx) => ({ ...i, order: idx }));
    setItems(newItems);
    pushHistory(newItems);
    if (selectedItemId === itemId) {
      setSelectedItemId(newItems[0]?.id || null);
      setShowItemEditor(false);
    }
  };

  const handleDuplicateItem = (itemId: string) => {
    const itemToDupe = items.find((i) => i.id === itemId);
    if (!itemToDupe) return;

    const newItem: ChecklistItem = {
      ...itemToDupe,
      id: crypto.randomUUID(),
      title: `${itemToDupe.title} (copy)`,
      order: items.length,
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    pushHistory(newItems);
    setSelectedItemId(newItem.id);
    toast.success('Item duplicated');
  };

  const handleReorderItems = (newItems: ChecklistItem[]) => {
    const reordered = newItems.map((i, idx) => ({ ...i, order: idx }));
    setItems(reordered);
    pushHistory(reordered);
  };

  // Publish/Unpublish
  const handlePublish = async () => {
    setIsUpdatingStatus(true);
    try {
      // Save first
      await updateChecklist(checklist.id, {
        name: checklist.name,
        items,
        widget: checklist.widget,
        on_complete: checklist.on_complete,
        targeting: checklist.targeting,
      });
      const updated = await publishChecklist(checklist.id);
      setChecklist(updated);
      toast.success('Checklist is now live!');
    } catch (error) {
      toast.error('Failed to publish');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUnpublish = async () => {
    setIsUpdatingStatus(true);
    try {
      const updated = await unpublishChecklist(checklist.id);
      setChecklist(updated);
      toast.success('Checklist unpublished');
    } catch (error) {
      toast.error('Failed to unpublish');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleArchive = async () => {
    setIsUpdatingStatus(true);
    try {
      await archiveChecklist(checklist.id);
      toast.success('Checklist archived');
      router.push(backHref);
    } catch (error) {
      toast.error('Failed to archive');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const newChecklist = await duplicateChecklist(checklist.id);
      toast.success('Checklist duplicated');
      router.push(`${backHref}/${newChecklist.id}`);
    } catch (error) {
      toast.error('Failed to duplicate');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteChecklist(checklist.id);
      toast.success('Checklist deleted');
      router.push(backHref);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getStatusBadge = () => {
    switch (checklist.status) {
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
            value={checklist.name}
            onChange={(e) => updateLocalChecklist({ name: e.target.value })}
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

          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>

          {/* Settings button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings2 className="h-4 w-4 mr-1" />
            Settings
          </Button>

          {/* Publish/Unpublish */}
          {checklist.status === 'draft' ? (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isUpdatingStatus || items.length === 0}
            >
              <Play className="h-4 w-4 mr-1" />
              Publish
            </Button>
          ) : checklist.status === 'live' ? (
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
              {checklist.status !== 'archived' && (
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
        {/* Left panel - Items list */}
        <div className="w-72 border-r bg-muted/30 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            <ChecklistItemsPanelNew
              items={items}
              selectedItemId={selectedItemId}
              onSelectItem={handleSelectItem}
              onOpenItemEditor={handleOpenItemEditor}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onDuplicateItem={handleDuplicateItem}
              onReorderItems={handleReorderItems}
            />
          </div>
        </div>

        {/* Center panel - Item Editor (slides out) */}
        {showItemEditor && selectedItem && (
          <div className="w-80 border-r flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b bg-muted/30 shrink-0">
              <h3 className="font-medium text-sm">
                Item {items.findIndex((i) => i.id === selectedItemId) + 1} Settings
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowItemEditor(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <ChecklistItemEditor
                item={selectedItem}
                tours={tours}
                onUpdateItem={(updates) => handleUpdateItem(selectedItem.id, updates)}
                onDeleteItem={() => handleDeleteItem(selectedItem.id)}
              />
            </div>
          </div>
        )}

        {/* Right panel - Preview (always visible) */}
        <div className="flex-1 bg-muted/30 min-h-0 overflow-hidden">
          <ChecklistPreviewPanel
            checklist={{ ...checklist, items }}
            theme={selectedTheme}
          />
        </div>
      </div>

      {/* Settings Panel (Sheet) */}
      <ChecklistSettingsPanel
        open={showSettings}
        onOpenChange={setShowSettings}
        checklist={checklist}
        themes={themes}
        customers={customers}
        onUpdate={updateLocalChecklist}
      />
    </div>
  );
}
