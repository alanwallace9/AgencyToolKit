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
import { Search, CheckSquare, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ItemActionsMenu } from '@/components/guidely/item-actions-menu';
import { ViewToggle, ViewMode } from '@/components/guidely/view-toggle';
import { GuidelyDataTable, DateCell, NumberCell } from '@/components/guidely/guidely-data-table';
import {
  createChecklist,
  createChecklistFromTemplate,
  updateChecklist,
  duplicateChecklist,
  archiveChecklist,
  deleteChecklist,
  type ChecklistWithStats,
} from '@/app/(dashboard)/tours/_actions/checklist-actions';
import { assignTagToChecklist } from '@/app/(dashboard)/tours/_actions/tag-actions';
import { type GuidelyTag, TAG_COLORS } from '@/app/(dashboard)/tours/_lib/tag-constants';
import { CHECKLIST_TEMPLATES } from '@/app/(dashboard)/tours/_lib/checklist-defaults';
import type { TourTheme } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

interface ChecklistsListClientProps {
  checklists: ChecklistWithStats[];
  themes: TourTheme[];
  tags: GuidelyTag[];
}

type ChecklistStatus = 'draft' | 'live' | 'archived';

const statusConfig: Record<ChecklistStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  live: { label: 'Live', className: 'bg-green-500/10 text-green-600' },
  archived: { label: 'Archived', className: 'bg-zinc-500/10 text-zinc-500' },
};

export function ChecklistsListClient({ checklists, themes, tags }: ChecklistsListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChecklistStatus | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleViewChange = useCallback((view: ViewMode) => {
    setViewMode(view);
  }, []);

  const filteredChecklists = useMemo(() => {
    let result = [...checklists];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (checklist) =>
          checklist.name.toLowerCase().includes(searchLower) ||
          checklist.title?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((checklist) => checklist.status === statusFilter);
    }

    if (tagFilter !== 'all') {
      if (tagFilter === 'untagged') {
        result = result.filter((checklist) => !checklist.tag_id);
      } else {
        result = result.filter((checklist) => checklist.tag_id === tagFilter);
      }
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [checklists, search, statusFilter, tagFilter]);

  const statusCounts = useMemo(() => ({
    all: checklists.length,
    draft: checklists.filter((c) => c.status === 'draft').length,
    live: checklists.filter((c) => c.status === 'live').length,
    archived: checklists.filter((c) => c.status === 'archived').length,
  }), [checklists]);

  const handleCreate = async () => {
    if (!newChecklistName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setIsCreating(true);
    try {
      let checklist;
      if (selectedTemplate) {
        checklist = await createChecklistFromTemplate(selectedTemplate);
      } else {
        checklist = await createChecklist({ name: newChecklistName, title: newChecklistName });
      }
      toast.success('Checklist created');
      setShowCreateDialog(false);
      setNewChecklistName('');
      setSelectedTemplate(null);
      router.push(`/g/checklists/${checklist.id}`);
    } catch (error) {
      toast.error('Failed to create checklist');
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
      render: (checklist: ChecklistWithStats) => checklist.name,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '100px',
      render: (checklist: ChecklistWithStats) => checklist.status,
    },
    {
      key: 'items',
      label: 'Items',
      sortable: true,
      width: '80px',
      render: (checklist: ChecklistWithStats) => (
        <NumberCell value={checklist.items?.length || 0} icon={CheckSquare} />
      ),
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      sortable: true,
      width: '100px',
      render: (checklist: ChecklistWithStats) => (
        <NumberCell value={checklist.stats?.in_progress || 0} icon={Users} />
      ),
    },
    {
      key: 'completed',
      label: 'Completed',
      sortable: true,
      width: '100px',
      render: (checklist: ChecklistWithStats) => (
        <span className="text-sm text-muted-foreground">{checklist.stats?.completed || 0}</span>
      ),
    },
    {
      key: 'updated_at',
      label: 'Updated',
      sortable: true,
      width: '120px',
      render: (checklist: ChecklistWithStats) => <DateCell date={checklist.updated_at} />,
    },
  ], []);

  const getTagForChecklist = (checklist: ChecklistWithStats) => {
    return tags.find((t) => t.id === checklist.tag_id) || null;
  };

  return (
    <div className="space-y-6">
      {/* Search, filters, and add button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search checklists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <ViewToggle
            storageKey="guidely-checklists-view"
            onViewChange={handleViewChange}
          />

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ChecklistStatus | 'all')}
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

          <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Checklist
          </Button>
        </div>
      </div>

      {/* Checklists display */}
      {filteredChecklists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CheckSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">
              {hasActiveFilters ? 'No checklists found' : 'No checklists yet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'Create your first checklist to track customer progress'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <GuidelyDataTable
          items={filteredChecklists}
          columns={tableColumns}
          itemType="checklist"
          basePath="/g/checklists"
          tags={tags}
          getItemId={(checklist) => checklist.id}
          getItemName={(checklist) => checklist.name}
          getItemStatus={(checklist) => checklist.status}
          getItemTagId={(checklist) => checklist.tag_id || null}
          onRename={async (id, name) => { await updateChecklist(id, { name }); }}
          onChangeTag={async (id, tagId) => { await assignTagToChecklist(id, tagId); }}
          onDuplicate={async (id) => { await duplicateChecklist(id); }}
          onArchive={async (id) => { await archiveChecklist(id); }}
          onDelete={async (id) => { await deleteChecklist(id); }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredChecklists.map((checklist) => {
            const status = statusConfig[checklist.status as ChecklistStatus];
            const tag = getTagForChecklist(checklist);
            const itemCount = checklist.items?.length || 0;

            return (
              <Link key={checklist.id} href={`/g/checklists/${checklist.id}`}>
                <Card className={cn(
                  "hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full group overflow-hidden",
                  tag && "border-t-2",
                  tag && TAG_COLORS[tag.color].stripe.replace('bg-', 'border-t-')
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{checklist.name}</CardTitle>
                        {checklist.title && checklist.title !== checklist.name && (
                          <CardDescription className="line-clamp-1 text-xs">
                            {checklist.title}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <ItemActionsMenu
                          item={{ id: checklist.id, name: checklist.name, status: checklist.status, tag_id: checklist.tag_id }}
                          type="checklist"
                          tags={tags}
                          onRename={async (id, name) => { await updateChecklist(id, { name }); }}
                          onChangeTag={async (id, tagId) => { await assignTagToChecklist(id, tagId); }}
                          onDuplicate={async (id) => { await duplicateChecklist(id); }}
                          onArchive={async (id) => { await archiveChecklist(id); }}
                          onDelete={async (id) => { await deleteChecklist(id); }}
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
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>{itemCount} items</span>
                      </div>
                      {checklist.stats && (
                        <>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{checklist.stats.in_progress || 0} in progress</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(checklist.updated_at), { addSuffix: true })}
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
            <DialogTitle>Create Checklist</DialogTitle>
            <DialogDescription>
              Create a new checklist to track customer progress.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Getting Started"
                value={newChecklistName}
                onChange={(e) => setNewChecklistName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Start from template (optional)</Label>
              <div className="grid gap-2">
                {CHECKLIST_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      if (!newChecklistName) setNewChecklistName(template.name);
                    }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <CheckSquare className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isCreating ? 'Creating...' : 'Create Checklist'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
