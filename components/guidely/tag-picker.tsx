'use client';

import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, Plus, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createTag } from '@/app/(dashboard)/tours/_actions/tag-actions';
import { type GuidelyTag, type TagColor, TAG_COLORS } from '@/app/(dashboard)/tours/_lib/tag-constants';
import { toast } from 'sonner';

interface TagPickerProps {
  tags: GuidelyTag[];
  selectedTagId: string | null;
  onSelect: (tagId: string | null) => Promise<void>;
  trigger?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

const COLOR_OPTIONS: TagColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'];

export function TagPicker({ tags, selectedTagId, onSelect, trigger, align = 'end' }: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<TagColor>('blue');
  const [isCreating, setIsCreating] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const selectedTag = tags.find((t) => t.id === selectedTagId);

  const handleSelect = async (tagId: string | null) => {
    if (isSelecting) return;
    setIsSelecting(true);
    try {
      await onSelect(tagId);
      setOpen(false);
    } catch (error) {
      toast.error('Failed to update tag');
    } finally {
      setIsSelecting(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Please enter a tag name');
      return;
    }

    setIsCreating(true);
    try {
      const tag = await createTag({ name: newTagName, color: newTagColor });
      toast.success('Tag created');
      setNewTagName('');
      setShowNewTagForm(false);
      // Select the newly created tag
      await handleSelect(tag.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create tag');
    } finally {
      setIsCreating(false);
    }
  };

  // Reset form when popover closes
  useEffect(() => {
    if (!open) {
      setShowNewTagForm(false);
      setNewTagName('');
      setNewTagColor('blue');
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            {selectedTag ? (
              <span className="flex items-center gap-1.5">
                <span
                  className={cn('h-2 w-2 rounded-full', TAG_COLORS[selectedTag.color].stripe)}
                />
                {selectedTag.name}
              </span>
            ) : (
              'Add Tag'
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align={align}>
        {showNewTagForm ? (
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Create New Tag</Label>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowNewTagForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateTag();
              }}
              autoFocus
            />
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={cn(
                      'h-6 w-6 rounded-full transition-all',
                      TAG_COLORS[color].stripe,
                      newTagColor === color
                        ? 'ring-2 ring-offset-2 ring-primary'
                        : 'hover:scale-110'
                    )}
                  />
                ))}
              </div>
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={handleCreateTag}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Tag'}
            </Button>
          </div>
        ) : (
          <div className="py-1">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Select a tag
            </div>
            <div className="max-h-48 overflow-y-auto">
              {/* Clear tag option */}
              {selectedTagId && (
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                  disabled={isSelecting}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Remove tag</span>
                </button>
              )}
              {tags.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No tags yet
                </div>
              ) : (
                tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleSelect(tag.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted transition-colors',
                      selectedTagId === tag.id && 'bg-muted'
                    )}
                    disabled={isSelecting}
                  >
                    <span
                      className={cn('h-3 w-3 rounded-full', TAG_COLORS[tag.color].stripe)}
                    />
                    <span className="flex-1 text-left">{tag.name}</span>
                    {selectedTagId === tag.id && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
            <div className="border-t mt-1 pt-1">
              <button
                type="button"
                onClick={() => setShowNewTagForm(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted transition-colors text-primary"
              >
                <Plus className="h-3.5 w-3.5" />
                Create new tag
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Simple tag badge display component
export function TagBadge({ tag, size = 'default' }: { tag: GuidelyTag | null; size?: 'sm' | 'default' }) {
  if (!tag) return null;

  const colors = TAG_COLORS[tag.color];
  const sizeClasses = size === 'sm' ? 'h-5 text-xs px-1.5' : 'h-6 text-xs px-2';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        colors.bg,
        colors.text,
        sizeClasses
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', colors.stripe)} />
      {tag.name}
    </span>
  );
}

// Color dot indicator for table view
export function TagDot({ tag }: { tag: GuidelyTag | null }) {
  if (!tag) return <span className="h-3 w-3" />;

  return (
    <span
      className={cn('h-3 w-3 rounded-full', TAG_COLORS[tag.color].stripe)}
      title={tag.name}
    />
  );
}
