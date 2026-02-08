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
import { Search, Megaphone, Plus, Eye, MousePointerClick, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ItemActionsMenu } from '@/components/guidely/item-actions-menu';
import { ViewToggle, ViewMode } from '@/components/guidely/view-toggle';
import { GuidelyDataTable, DateCell, NumberCell, PercentCell } from '@/components/guidely/guidely-data-table';
import {
  createBanner,
  createBannerFromTemplate,
  updateBanner,
  duplicateBanner,
  archiveBanner,
  deleteBanner,
  type BannerWithStats,
} from '@/app/(dashboard)/tours/_actions/banner-actions';
import { assignTagToBanner } from '@/app/(dashboard)/tours/_actions/tag-actions';
import { type GuidelyTag, TAG_COLORS } from '@/app/(dashboard)/tours/_lib/tag-constants';
import { BANNER_TEMPLATES } from '@/app/(dashboard)/tours/_lib/banner-defaults';
import type { TourTheme } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

interface BannersListClientProps {
  banners: BannerWithStats[];
  themes: TourTheme[];
  tags: GuidelyTag[];
}

type BannerStatus = 'draft' | 'live' | 'archived';

const statusConfig: Record<BannerStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  live: { label: 'Live', className: 'bg-green-500/10 text-green-600' },
  archived: { label: 'Archived', className: 'bg-zinc-500/10 text-zinc-500' },
};

export function BannersListClient({ banners, themes, tags }: BannersListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BannerStatus | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBannerName, setNewBannerName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleViewChange = useCallback((view: ViewMode) => {
    setViewMode(view);
  }, []);

  const filteredBanners = useMemo(() => {
    let result = [...banners];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (banner) =>
          banner.name.toLowerCase().includes(searchLower) ||
          banner.content?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((banner) => banner.status === statusFilter);
    }

    if (tagFilter !== 'all') {
      if (tagFilter === 'untagged') {
        result = result.filter((banner) => !banner.tag_id);
      } else {
        result = result.filter((banner) => banner.tag_id === tagFilter);
      }
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [banners, search, statusFilter, tagFilter]);

  const statusCounts = useMemo(() => ({
    all: banners.length,
    draft: banners.filter((b) => b.status === 'draft').length,
    live: banners.filter((b) => b.status === 'live').length,
    archived: banners.filter((b) => b.status === 'archived').length,
  }), [banners]);

  const handleCreate = async () => {
    if (!newBannerName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setIsCreating(true);
    try {
      let banner;
      if (selectedTemplate) {
        banner = await createBannerFromTemplate(selectedTemplate);
      } else {
        banner = await createBanner({ name: newBannerName });
      }
      toast.success('Banner created');
      setShowCreateDialog(false);
      setNewBannerName('');
      setSelectedTemplate(null);
      router.push(`/g/banners/${banner.id}`);
    } catch (error) {
      toast.error('Failed to create banner');
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
      render: (banner: BannerWithStats) => banner.name,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '100px',
      render: (banner: BannerWithStats) => banner.status,
    },
    {
      key: 'views',
      label: 'Views',
      sortable: true,
      width: '80px',
      render: (banner: BannerWithStats) => <NumberCell value={banner.view_count || 0} icon={Eye} />,
    },
    {
      key: 'clicks',
      label: 'Clicks',
      sortable: true,
      width: '80px',
      render: (banner: BannerWithStats) => <NumberCell value={banner.click_count || 0} icon={MousePointerClick} />,
    },
    {
      key: 'ctr',
      label: 'CTR',
      sortable: true,
      width: '80px',
      render: (banner: BannerWithStats) => {
        const ctr = banner.view_count && banner.view_count > 0
          ? Math.round((banner.click_count || 0) / banner.view_count * 100)
          : 0;
        return <PercentCell value={ctr} />;
      },
    },
    {
      key: 'updated_at',
      label: 'Updated',
      sortable: true,
      width: '120px',
      render: (banner: BannerWithStats) => <DateCell date={banner.updated_at} />,
    },
  ], []);

  const getTagForBanner = (banner: BannerWithStats) => {
    return tags.find((t) => t.id === banner.tag_id) || null;
  };

  return (
    <div className="space-y-6">
      {/* Search, filters, and add button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search banners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <ViewToggle
            storageKey="guidely-banners-view"
            onViewChange={handleViewChange}
          />

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as BannerStatus | 'all')}
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
            New Banner
          </Button>
        </div>
      </div>

      {/* Banners display */}
      {filteredBanners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Megaphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">
              {hasActiveFilters ? 'No banners found' : 'No banners yet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'Create your first banner to announce features or promotions'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <GuidelyDataTable
          items={filteredBanners}
          columns={tableColumns}
          itemType="banner"
          basePath="/g/banners"
          tags={tags}
          getItemId={(banner) => banner.id}
          getItemName={(banner) => banner.name}
          getItemStatus={(banner) => banner.status}
          getItemTagId={(banner) => banner.tag_id || null}
          onRename={async (id, name) => { await updateBanner(id, { name }); }}
          onChangeTag={async (id, tagId) => { await assignTagToBanner(id, tagId); }}
          onDuplicate={async (id) => { await duplicateBanner(id); }}
          onArchive={async (id) => { await archiveBanner(id); }}
          onDelete={async (id) => { await deleteBanner(id); }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBanners.map((banner) => {
            const status = statusConfig[banner.status as BannerStatus];
            const tag = getTagForBanner(banner);

            return (
              <Link key={banner.id} href={`/g/banners/${banner.id}`}>
                <Card className={cn(
                  "hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full group overflow-hidden",
                  tag && "border-t-2",
                  tag && TAG_COLORS[tag.color].stripe.replace('bg-', 'border-t-')
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{banner.name}</CardTitle>
                        {banner.content && (
                          <CardDescription className="line-clamp-2 text-xs">
                            {banner.content}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <ItemActionsMenu
                          item={{ id: banner.id, name: banner.name, status: banner.status, tag_id: banner.tag_id }}
                          type="banner"
                          tags={tags}
                          onRename={async (id, name) => { await updateBanner(id, { name }); }}
                          onChangeTag={async (id, tagId) => { await assignTagToBanner(id, tagId); }}
                          onDuplicate={async (id) => { await duplicateBanner(id); }}
                          onArchive={async (id) => { await archiveBanner(id); }}
                          onDelete={async (id) => { await deleteBanner(id); }}
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
                        <Eye className="h-3.5 w-3.5" />
                        <span>{banner.view_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointerClick className="h-3.5 w-3.5" />
                        <span>{banner.click_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <X className="h-3.5 w-3.5" />
                        <span>{banner.dismiss_count || 0}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(banner.updated_at), { addSuffix: true })}
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
            <DialogTitle>Create Banner</DialogTitle>
            <DialogDescription>
              Create a new banner to announce features or promotions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="New Feature Announcement"
                value={newBannerName}
                onChange={(e) => setNewBannerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Start from template (optional)</Label>
              <div className="grid gap-2">
                {BANNER_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      if (!newBannerName) setNewBannerName(template.name);
                    }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Megaphone className="h-5 w-5 mt-0.5 text-muted-foreground" />
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
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
