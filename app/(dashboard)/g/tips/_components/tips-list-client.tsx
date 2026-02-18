'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Lightbulb, Plus, MousePointer, Hand, Focus, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ItemActionsMenu } from '@/components/guidely/item-actions-menu';
import { ViewToggle, ViewMode } from '@/components/guidely/view-toggle';
import { GuidelyDataTable, DateCell } from '@/components/guidely/guidely-data-table';
import {
  createSmartTip,
  updateSmartTip,
  duplicateSmartTip,
  archiveSmartTip,
  deleteSmartTip,
} from '@/app/(dashboard)/tours/_actions/smart-tip-actions';
import { assignTagToSmartTip } from '@/app/(dashboard)/tours/_actions/tag-actions';
import { type GuidelyTag, TAG_COLORS } from '@/app/(dashboard)/tours/_lib/tag-constants';
import type { TourTheme, SmartTipTrigger, SmartTip } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

interface TipsListClientProps {
  tips: SmartTip[];
  themes: TourTheme[];
  tags: GuidelyTag[];
}

type TipStatus = 'draft' | 'live' | 'archived';

const statusConfig: Record<TipStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  live: { label: 'Live', className: 'bg-green-500/10 text-green-600' },
  archived: { label: 'Archived', className: 'bg-zinc-500/10 text-zinc-500' },
};

const triggerIcons: Record<SmartTipTrigger, { icon: typeof MousePointer; label: string }> = {
  hover: { icon: MousePointer, label: 'Hover' },
  click: { icon: Hand, label: 'Click' },
  focus: { icon: Focus, label: 'Focus' },
  delay: { icon: Timer, label: 'Delay' },
};

export function TipsListClient({ tips, themes, tags }: TipsListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TipStatus | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTipName, setNewTipName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const handleViewChange = useCallback((view: ViewMode) => {
    setViewMode(view);
  }, []);

  const filteredTips = useMemo(() => {
    let result = [...tips];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (tip) =>
          tip.name.toLowerCase().includes(searchLower) ||
          tip.content?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((tip) => tip.status === statusFilter);
    }

    if (tagFilter !== 'all') {
      if (tagFilter === 'untagged') {
        result = result.filter((tip) => !tip.tag_id);
      } else {
        result = result.filter((tip) => tip.tag_id === tagFilter);
      }
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [tips, search, statusFilter, tagFilter]);

  const statusCounts = useMemo(() => ({
    all: tips.length,
    draft: tips.filter((t) => t.status === 'draft').length,
    live: tips.filter((t) => t.status === 'live').length,
    archived: tips.filter((t) => t.status === 'archived').length,
  }), [tips]);

  const handleCreate = async () => {
    if (!newTipName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setIsCreating(true);
    try {
      const tip = await createSmartTip({ name: newTipName });
      toast.success('Smart tip created');
      setShowCreateDialog(false);
      setNewTipName('');
      router.push(`/g/tips/${tip.id}`);
    } catch (error) {
      toast.error('Failed to create smart tip');
    } finally {
      setIsCreating(false);
    }
  };

  const hasActiveFilters = search || statusFilter !== 'all' || tagFilter !== 'all';

  // Table columns configuration
  const tableColumns = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (tip: SmartTip) => tip.name,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '100px',
      render: (tip: SmartTip) => tip.status,
    },
    {
      key: 'trigger',
      label: 'Trigger',
      sortable: true,
      width: '100px',
      render: (tip: SmartTip) => {
        const trigger = triggerIcons[tip.trigger as SmartTipTrigger] || triggerIcons.hover;
        const TriggerIcon = trigger.icon;
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TriggerIcon className="h-3.5 w-3.5" />
            <span>{trigger.label}</span>
          </div>
        );
      },
    },
    {
      key: 'element',
      label: 'Element',
      width: '180px',
      render: (tip: SmartTip) => tip.element?.selector ? (
        <code className="text-xs bg-muted px-1 py-0.5 rounded truncate block max-w-[160px]">
          {tip.element.selector}
        </code>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
    },
    {
      key: 'updated_at',
      label: 'Updated',
      sortable: true,
      width: '120px',
      render: (tip: SmartTip) => <DateCell date={tip.updated_at} />,
    },
  ], []);

  const getTagForTip = (tip: SmartTip) => {
    return tags.find((t) => t.id === tip.tag_id) || null;
  };

  return (
    <div className="space-y-6">
      {/* Search, filters, and add button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <ViewToggle
            storageKey="guidely-tips-view"
            onViewChange={handleViewChange}
          />

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as TipStatus | 'all')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({statusCounts.all})</SelectItem>
              <SelectItem value="live">Live ({statusCounts.live})</SelectItem>
              <SelectItem value="draft">Draft ({statusCounts.draft})</SelectItem>
              <SelectItem value="archived">Archived ({statusCounts.archived})</SelectItem>
            </SelectContent>
          </Select>

          {tags.length > 0 && (
            <Select
              value={tagFilter}
              onValueChange={setTagFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                <SelectItem value="untagged">Untagged</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <span className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full', TAG_COLORS[tag.color].stripe)} />
                      {tag.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Tip
          </Button>
        </div>
      </div>

      {/* Tips display */}
      {filteredTips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Lightbulb className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">
              {hasActiveFilters ? 'No tips found' : 'No smart tips yet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'Create your first smart tip to help customers understand your interface'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <GuidelyDataTable
          items={filteredTips}
          columns={tableColumns}
          itemType="tip"
          basePath="/g/tips"
          tags={tags}
          getItemId={(tip) => tip.id}
          getItemName={(tip) => tip.name}
          getItemStatus={(tip) => tip.status}
          getItemTagId={(tip) => tip.tag_id || null}
          onRename={async (id, name) => { await updateSmartTip(id, { name }); }}
          onChangeTag={async (id, tagId) => { await assignTagToSmartTip(id, tagId); }}
          onDuplicate={async (id) => { await duplicateSmartTip(id); }}
          onArchive={async (id) => { await archiveSmartTip(id); }}
          onDelete={async (id) => { await deleteSmartTip(id); }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTips.map((tip) => {
            const status = statusConfig[tip.status as TipStatus];
            const tag = getTagForTip(tip);
            const trigger = triggerIcons[tip.trigger as SmartTipTrigger] || triggerIcons.hover;
            const TriggerIcon = trigger.icon;

            return (
              <Link key={tip.id} href={`/g/tips/${tip.id}`}>
                <Card className={cn(
                  "hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full group overflow-hidden",
                  tag && "border-t-2",
                  tag && TAG_COLORS[tag.color].stripe.replace('bg-', 'border-t-')
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{tip.name}</CardTitle>
                        {tip.content && (
                          <CardDescription className="line-clamp-2 text-xs">
                            {tip.content}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <ItemActionsMenu
                          item={{ id: tip.id, name: tip.name, status: tip.status, tag_id: tip.tag_id }}
                          type="tip"
                          tags={tags}
                          onRename={async (id, name) => { await updateSmartTip(id, { name }); }}
                          onChangeTag={async (id, tagId) => { await assignTagToSmartTip(id, tagId); }}
                          onDuplicate={async (id) => { await duplicateSmartTip(id); }}
                          onArchive={async (id) => { await archiveSmartTip(id); }}
                          onDelete={async (id) => { await deleteSmartTip(id); }}
                        />
                        <Badge variant="secondary" className={status.className}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TriggerIcon className="h-3.5 w-3.5" />
                        <span>{trigger.label}</span>
                      </div>
                      {tip.element?.selector && (
                        <div className="flex items-center gap-1 truncate flex-1">
                          <code className="text-xs bg-muted px-1 py-0.5 rounded truncate">
                            {tip.element.selector}
                          </code>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(tip.updated_at), { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Smart Tip</DialogTitle>
            <DialogDescription>
              Create a new tooltip to help customers understand your interface.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Save Button Tip"
                value={newTipName}
                onChange={(e) => setNewTipName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Tip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
