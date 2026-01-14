'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Map, SlidersHorizontal, X } from 'lucide-react';
import { TourCard } from './tour-card';
import { AddTourDialog } from './add-tour-dialog';
import type { TourWithStats } from '../_actions/tour-actions';
import type { Customer, TourStatus } from '@/types/database';

interface ToursClientProps {
  tours: TourWithStats[];
  customers: Customer[];
}

type SortField = 'created_at' | 'updated_at' | 'name' | 'views' | 'completion';
type SortOrder = 'asc' | 'desc';

export function ToursClient({ tours, customers }: ToursClientProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TourStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort tours
  const filteredTours = useMemo(() => {
    let result = [...tours];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (tour) =>
          tour.name.toLowerCase().includes(searchLower) ||
          tour.description?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((tour) => tour.status === statusFilter);
    }

    // Sort
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
          const aRate =
            a.stats.views > 0
              ? a.stats.completions / a.stats.views
              : 0;
          const bRate =
            b.stats.views > 0
              ? b.stats.completions / b.stats.views
              : 0;
          comparison = aRate - bRate;
          break;
        case 'updated_at':
          comparison =
            new Date(a.updated_at).getTime() -
            new Date(b.updated_at).getTime();
          break;
        case 'created_at':
        default:
          comparison =
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [tours, search, statusFilter, sortField, sortOrder]);

  // Count by status
  const statusCounts = useMemo(() => {
    return {
      all: tours.length,
      draft: tours.filter((t) => t.status === 'draft').length,
      live: tours.filter((t) => t.status === 'live').length,
      archived: tours.filter((t) => t.status === 'archived').length,
    };
  }, [tours]);

  const hasActiveFilters = search || statusFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Search and filters row */}
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
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as TourStatus | 'all')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({statusCounts.all})</SelectItem>
              <SelectItem value="live">
                Live ({statusCounts.live})
              </SelectItem>
              <SelectItem value="draft">
                Draft ({statusCounts.draft})
              </SelectItem>
              <SelectItem value="archived">
                Archived ({statusCounts.archived})
              </SelectItem>
            </SelectContent>
          </Select>

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
            <Select
              value={sortField}
              onValueChange={(v) => setSortField(v as SortField)}
            >
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
            <Select
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as SortOrder)}
            >
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
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredTours.length} of {tours.length} tours
        </p>
      )}

      {/* Tours grid */}
      {filteredTours.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      ) : tours.length === 0 ? (
        <EmptyState customers={customers} />
      ) : (
        <NoResults onClear={clearFilters} />
      )}
    </div>
  );
}

function EmptyState({ customers }: { customers: Customer[] }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Map className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-1">No tours yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Create interactive guided tours to help your users navigate the platform
          and discover key features.
        </p>
        <AddTourDialog customers={customers} />
      </CardContent>
    </Card>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-1">No tours found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          No tours match your current filters. Try adjusting your search or filters.
        </p>
        <Button variant="outline" onClick={onClear}>
          Clear filters
        </Button>
      </CardContent>
    </Card>
  );
}
