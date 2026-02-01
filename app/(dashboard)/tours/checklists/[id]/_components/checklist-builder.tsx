'use client';

import { useState, useCallback, useEffect } from 'react';
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
  Settings,
  Play,
  Pause,
  MoreHorizontal,
  Copy,
  Trash2,
  Archive,
  Check,
  Loader2,
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
} from '../../../_actions/checklist-actions';
import { createDefaultItem } from '../../../_lib/checklist-defaults';
import { ChecklistItemsPanel } from './checklist-items-panel';
import { ChecklistItemSettings } from './checklist-item-settings';
import { ChecklistSettingsPanel } from './checklist-settings-panel';
import { ChecklistPreview } from './checklist-preview';
import type { Checklist, ChecklistItem, TourTheme } from '@/types/database';
import type { TourWithStats } from '../../../_actions/tour-actions';

interface ChecklistBuilderProps {
  checklist: Checklist;
  themes: TourTheme[];
  tours: TourWithStats[];
  backHref?: string;
}

export function ChecklistBuilder({ checklist: initialChecklist, themes, tours, backHref = '/tours' }: ChecklistBuilderProps) {
  const router = useRouter();
  const [checklist, setChecklist] = useState<Checklist>(initialChecklist);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    initialChecklist.items.length > 0 ? initialChecklist.items[0].id : null
  );
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const selectedItem = checklist.items.find(item => item.id === selectedItemId) || null;

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
          items: checklist.items,
          widget: checklist.widget,
          on_complete: checklist.on_complete,
          targeting: checklist.targeting,
          theme_id: checklist.theme_id,
        });
        setHasChanges(false);
      } catch (error) {
        toast.error('Failed to save changes');
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [checklist, hasChanges]);

  const updateLocalChecklist = useCallback((updates: Partial<Checklist>) => {
    setChecklist(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  const updateItem = useCallback((itemId: string, updates: Partial<ChecklistItem>) => {
    setChecklist(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
    setHasChanges(true);
  }, []);

  const addItem = useCallback(() => {
    const newItem = createDefaultItem(checklist.items.length);
    setChecklist(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setSelectedItemId(newItem.id);
    setHasChanges(true);
  }, [checklist.items.length]);

  const deleteItem = useCallback((itemId: string) => {
    setChecklist(prev => {
      const newItems = prev.items.filter(item => item.id !== itemId);
      // Reorder remaining items
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));
      return { ...prev, items: reorderedItems };
    });
    if (selectedItemId === itemId) {
      setSelectedItemId(checklist.items.length > 1 ? checklist.items[0].id : null);
    }
    setHasChanges(true);
  }, [selectedItemId, checklist.items]);

  const reorderItems = useCallback((newItems: ChecklistItem[]) => {
    setChecklist(prev => ({ ...prev, items: newItems }));
    setHasChanges(true);
  }, []);

  const handlePublish = async () => {
    setIsUpdatingStatus(true);
    try {
      const updated = await publishChecklist(checklist.id);
      setChecklist(updated);
      toast.success('Checklist is now live');
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
      router.push('/tours');
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
      router.push(`/tours/checklists/${newChecklist.id}`);
    } catch (error) {
      toast.error('Failed to duplicate');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteChecklist(checklist.id);
      toast.success('Checklist deleted');
      router.push('/tours');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const selectedTheme = themes.find(t => t.id === checklist.theme_id) || themes.find(t => t.is_default);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
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
          <Badge
            variant={checklist.status === 'live' ? 'default' : 'secondary'}
            className={cn(
              checklist.status === 'live' && 'bg-green-500/10 text-green-600 border-green-500/20'
            )}
          >
            {checklist.status}
          </Badge>
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
                All changes saved
              </span>
            )}
          </span>

          {/* Settings button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>

          {/* Publish/Unpublish */}
          {checklist.status === 'draft' ? (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isUpdatingStatus || checklist.items.length === 0}
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Items list */}
        <div className="w-72 border-r bg-muted/30 overflow-y-auto">
          <ChecklistItemsPanel
            items={checklist.items}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
            onAddItem={addItem}
            onReorderItems={reorderItems}
          />
        </div>

        {/* Center panel - Item settings */}
        <div className="flex-1 overflow-y-auto border-r">
          {selectedItem ? (
            <ChecklistItemSettings
              item={selectedItem}
              tours={tours}
              onUpdate={(updates) => updateItem(selectedItem.id, updates)}
              onDelete={() => deleteItem(selectedItem.id)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Select an item to edit or add a new one</p>
            </div>
          )}
        </div>

        {/* Right panel - Preview */}
        <div className="w-80 bg-muted/30 overflow-y-auto">
          <ChecklistPreview
            checklist={checklist}
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
        onUpdate={updateLocalChecklist}
      />
    </div>
  );
}
