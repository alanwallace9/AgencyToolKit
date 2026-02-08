'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Pencil, Copy, Archive, Trash2, Tag, X, Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createTag } from '@/app/(dashboard)/tours/_actions/tag-actions';
import { type GuidelyTag, type TagColor, TAG_COLORS } from '@/app/(dashboard)/tours/_lib/tag-constants';

export type ItemType = 'tour' | 'checklist' | 'tip' | 'banner';

interface ItemActionsMenuProps {
  item: {
    id: string;
    name: string;
    status?: string;
    tag_id?: string | null;
  };
  type: ItemType;
  tags?: GuidelyTag[];
  onRename: (id: string, newName: string) => Promise<void>;
  onChangeTag?: (id: string, tagId: string | null) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const typeLabels: Record<ItemType, string> = {
  tour: 'tour',
  checklist: 'checklist',
  tip: 'smart tip',
  banner: 'banner',
};

const COLOR_OPTIONS: TagColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'];

export function ItemActionsMenu({
  item,
  type,
  tags = [],
  onRename,
  onChangeTag,
  onDuplicate,
  onArchive,
  onDelete,
}: ItemActionsMenuProps) {
  const router = useRouter();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isNewTagOpen, setIsNewTagOpen] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<TagColor>('blue');
  const [isLoading, setIsLoading] = useState(false);

  const label = typeLabels[type];
  const isArchived = item.status === 'archived';
  const currentTag = tags.find((t) => t.id === item.tag_id);

  const handleRename = async () => {
    if (!newName.trim() || newName === item.name) {
      setIsRenameOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await onRename(item.id, newName.trim());
      toast.success(`${label.charAt(0).toUpperCase() + label.slice(1)} renamed`);
      setIsRenameOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(`Failed to rename ${label}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeTag = async (tagId: string | null) => {
    if (!onChangeTag) return;
    setIsLoading(true);
    try {
      await onChangeTag(item.id, tagId);
      toast.success(tagId ? 'Tag updated' : 'Tag removed');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAndAssignTag = async () => {
    if (!newTagName.trim() || !onChangeTag) {
      setIsNewTagOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const tag = await createTag({ name: newTagName, color: newTagColor });
      await onChangeTag(item.id, tag.id);
      toast.success('Tag created and assigned');
      setIsNewTagOpen(false);
      setNewTagName('');
      setNewTagColor('blue');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      await onDuplicate(item.id);
      toast.success(`${label.charAt(0).toUpperCase() + label.slice(1)} duplicated`);
      router.refresh();
    } catch (error) {
      toast.error(`Failed to duplicate ${label}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      await onArchive(item.id);
      toast.success(isArchived ? `${label.charAt(0).toUpperCase() + label.slice(1)} restored` : `${label.charAt(0).toUpperCase() + label.slice(1)} archived`);
      router.refresh();
    } catch (error) {
      toast.error(`Failed to ${isArchived ? 'restore' : 'archive'} ${label}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(item.id);
      toast.success(`${label.charAt(0).toUpperCase() + label.slice(1)} deleted`);
      setIsDeleteOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(`Failed to delete ${label}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setNewName(item.name);
              setIsRenameOpen(true);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>

          {/* Change Tag submenu */}
          {onChangeTag && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Tag className="h-4 w-4 mr-2" />
                <span className="flex-1">Change Tag</span>
                {currentTag && (
                  <span
                    className={cn('h-2 w-2 rounded-full ml-2', TAG_COLORS[currentTag.color].stripe)}
                  />
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="min-w-[180px]">
                  {/* Remove tag option */}
                  {item.tag_id && (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleChangeTag(null);
                        }}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2 text-muted-foreground" />
                        Remove tag
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Tag list */}
                  {tags.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                      No tags yet
                    </div>
                  ) : (
                    tags.map((tag) => (
                      <DropdownMenuItem
                        key={tag.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleChangeTag(tag.id);
                        }}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <span
                          className={cn('h-3 w-3 rounded-full', TAG_COLORS[tag.color].stripe)}
                        />
                        <span className="flex-1">{tag.name}</span>
                        {item.tag_id === tag.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsNewTagOpen(true);
                    }}
                    className="text-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create new tag
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDuplicate} disabled={isLoading}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleArchive} disabled={isLoading}>
            <Archive className="h-4 w-4 mr-2" />
            {isArchived ? 'Restore' : 'Archive'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDeleteOpen(true);
            }}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename {label}</DialogTitle>
            <DialogDescription>
              Enter a new name for this {label}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name" className="sr-only">
              Name
            </Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`${label.charAt(0).toUpperCase() + label.slice(1)} name`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isLoading || !newName.trim()}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Tag Dialog */}
      <Dialog open={isNewTagOpen} onOpenChange={setIsNewTagOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Create a new tag and assign it to this {label}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g., Onboarding, Sales, Support"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateAndAssignTag();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={cn(
                      'h-8 w-8 rounded-full transition-all',
                      TAG_COLORS[color].stripe,
                      newTagColor === color
                        ? 'ring-2 ring-offset-2 ring-primary scale-110'
                        : 'hover:scale-110'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTagOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAndAssignTag}
              disabled={isLoading || !newTagName.trim()}
            >
              {isLoading ? 'Creating...' : 'Create & Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{item.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
