'use client';

import { useState, useMemo, useCallback } from 'react';
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
import { Search, Map, SlidersHorizontal, X, Eye, CheckCircle2, HelpCircle } from 'lucide-react';
import { AddTourDialog } from '@/app/(dashboard)/tours/_components/add-tour-dialog';
import { ItemActionsMenu } from '@/components/guidely/item-actions-menu';
import { ViewToggle, ViewMode } from '@/components/guidely/view-toggle';
import { GuidelyDataTable, DateCell, NumberCell, PercentCell } from '@/components/guidely/guidely-data-table';
import { cn } from '@/lib/utils';
import {
  updateTour,
  duplicateTour,
  archiveTour,
  deleteTour,
} from '@/app/(dashboard)/tours/_actions/tour-actions';
import { assignTagToTour } from '@/app/(dashboard)/tours/_actions/tag-actions';
import { type GuidelyTag, TAG_COLORS } from '@/app/(dashboard)/tours/_lib/tag-constants';
import type { TourWithStats } from '@/app/(dashboard)/tours/_actions/tour-actions';
import type { Customer, TourStatus, TourTheme } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: 'system' | 'custom';
  steps_count?: number;
}

interface ToursListClientProps {
  tours: TourWithStats[];
  templates: Template[];
  themes: TourTheme[];
  tags: GuidelyTag[];
  customers: Customer[];
}

type SortField = 'created_at' | 'updated_at' | 'name' | 'views' | 'completion';
type SortOrder = 'asc' | 'desc';

const statusConfig: Record<TourStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  live: { label: 'Live', className: 'bg-green-500/10 text-green-600' },
  archived: { label: 'Archived', className: 'bg-zinc-500/10 text-zinc-500' },
};

export function ToursListClient({ tours, templates, themes, tags, customers }: ToursListClientProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TourStatus | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleViewChange = useCallback((view: ViewMode) => {
    setViewMode(view);
  }, []);

  // Filter and sort tours
  const filteredTours = useMemo(() => {
    let result = [...tours];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (tour) =>
          tour.name.toLowerCase().includes(searchLower) ||
          tour.description?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((tour) => tour.status === statusFilter);
    }

    if (tagFilter !== 'all') {
      if (tagFilter === 'untagged') {
        result = result.filter((tour) => !tour.tag_id);
      } else {
        result = result.filter((tour) => tour.tag_id === tagFilter);
      }
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'views':
          comparison = a.stats.views - b.stats.views;
          break;
        case 'completion':
          const aRate = a.stats.views > 0 ? a.stats.completions / a.stats.views : 0;
          const bRate = b.stats.views > 0 ? b.stats.completions / b.stats.views : 0;
          comparison = aRate - bRate;
          break;
        case 'updated_at':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [tours, search, statusFilter, tagFilter, sortField, sortOrder]);

  const statusCounts = useMemo(() => ({
    all: tours.length,
    draft: tours.filter((t) => t.status === 'draft').length,
    live: tours.filter((t) => t.status === 'live').length,
    archived: tours.filter((t) => t.status === 'archived').length,
  }), [tours]);

  const hasActiveFilters = search || statusFilter !== 'all' || tagFilter !== 'all';

  // Table columns configuration
  const tableColumns = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (tour: TourWithStats) => tour.name,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '100px',
      render: (tour: TourWithStats) => tour.status,
    },
    {
      key: 'views',
      label: 'Views',
      sortable: true,
      width: '80px',
      render: (tour: TourWithStats) => <NumberCell value={tour.stats.views} icon={Eye} />,
    },
    {
      key: 'completion',
      label: 'Completion',
      sortable: true,
      width: '100px',
      render: (tour: TourWithStats) => {
        const rate = tour.stats.views > 0
          ? Math.round((tour.stats.completions / tour.stats.views) * 100)
          : 0;
        return <PercentCell value={rate} />;
      },
    },
    {
      key: 'steps',
      label: 'Steps',
      width: '70px',
      render: (tour: TourWithStats) => (
        <span className="text-sm text-muted-foreground">{tour.steps?.length || 0}</span>
      ),
    },
    {
      key: 'updated_at',
      label: 'Updated',
      sortable: true,
      width: '120px',
      render: (tour: TourWithStats) => <DateCell date={tour.updated_at} />,
    },
  ], []);

  const getTagForTour = (tour: TourWithStats) => {
    return tags.find((t) => t.id === tour.tag_id) || null;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Search, filters, and add button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearch('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <ViewToggle
            storageKey="guidely-tours-view"
            onViewChange={handleViewChange}
          />

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as TourStatus | 'all')}
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

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-accent' : ''}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>

          <AddTourDialog customers={customers} />
        </div>
      </div>

      {/* Extended filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="updated_at">Last Updated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="completion">Completion Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Order:</span>
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter('all'); setTagFilter('all'); }}>
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Tours display */}
      {filteredTours.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Map className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">
              {hasActiveFilters ? 'No tours found' : 'No tours yet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'Create your first tour to guide your customers through the platform'}
            </p>
            {!hasActiveFilters && (
              <Link
                href="/help/guidely/first-tour"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-3"
              >
                <HelpCircle className="h-3 w-3" />
                Learn how to create tours
              </Link>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <GuidelyDataTable
          items={filteredTours}
          columns={tableColumns}
          itemType="tour"
          basePath="/g/tours"
          tags={tags}
          getItemId={(tour) => tour.id}
          getItemName={(tour) => tour.name}
          getItemStatus={(tour) => tour.status}
          getItemTagId={(tour) => tour.tag_id || null}
          onRename={async (id, name) => { await updateTour(id, { name }); }}
          onChangeTag={async (id, tagId) => { await assignTagToTour(id, tagId); }}
          onDuplicate={async (id) => { await duplicateTour(id); }}
          onArchive={async (id) => { await archiveTour(id); }}
          onDelete={async (id) => { await deleteTour(id); }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTours.map((tour) => {
            const status = statusConfig[tour.status];
            const tag = getTagForTour(tour);
            const completionRate = tour.stats.views > 0
              ? Math.round((tour.stats.completions / tour.stats.views) * 100)
              : 0;

            return (
              <Link key={tour.id} href={`/g/tours/${tour.id}`}>
                <Card className={cn(
                  "hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full group overflow-hidden",
                  tag && "border-t-2",
                  tag && TAG_COLORS[tag.color].stripe.replace('bg-', 'border-t-')
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{tour.name}</CardTitle>
                        {tour.description && (
                          <CardDescription className="line-clamp-2 text-xs">
                            {tour.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <ItemActionsMenu
                          item={{ id: tour.id, name: tour.name, status: tour.status, tag_id: tour.tag_id }}
                          type="tour"
                          tags={tags}
                          onRename={async (id, name) => { await updateTour(id, { name }); }}
                          onChangeTag={async (id, tagId) => { await assignTagToTour(id, tagId); }}
                          onDuplicate={async (id) => { await duplicateTour(id); }}
                          onArchive={async (id) => { await archiveTour(id); }}
                          onDelete={async (id) => { await deleteTour(id); }}
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
                        <span>{tour.stats.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{completionRate}%</span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-xs">
                          {formatDistanceToNow(new Date(tour.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {tour.steps?.length || 0} steps
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
