'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Map, SlidersHorizontal, X, Sparkles, ArrowRight, FileText, MessageSquare, Megaphone, ListChecks } from 'lucide-react';
import { toast } from 'sonner';
import { TourCard } from './tour-card';
import { AddTourDialog } from './add-tour-dialog';
import { createTour } from '../_actions/tour-actions';
import type { TourWithStats } from '../_actions/tour-actions';
import type { Customer, TourStatus } from '@/types/database';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: 'system' | 'custom';
}

interface ToursClientProps {
  tours: TourWithStats[];
  templates: Template[];
  customers: Customer[];
}

type SortField = 'created_at' | 'updated_at' | 'name' | 'views' | 'completion';
type SortOrder = 'asc' | 'desc';

export function ToursClient({ tours, templates, customers }: ToursClientProps) {
  const router = useRouter();
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

  const [creatingFromTemplate, setCreatingFromTemplate] = useState<string | null>(null);

  const handleUseTemplate = async (template: Template) => {
    setCreatingFromTemplate(template.id);
    try {
      const tour = await createTour({
        name: template.name,
        template_id: template.id,
      });
      toast.success('Tour created from template');
      router.push(`/tours/${tour.id}`);
    } catch (error) {
      toast.error('Failed to create tour', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setCreatingFromTemplate(null);
    }
  };

  // Template icons based on name
  const getTemplateIcon = (name: string) => {
    if (name.toLowerCase().includes('welcome')) return MessageSquare;
    if (name.toLowerCase().includes('feature') || name.toLowerCase().includes('highlight')) return Sparkles;
    if (name.toLowerCase().includes('checklist') || name.toLowerCase().includes('getting started')) return ListChecks;
    if (name.toLowerCase().includes('announcement') || name.toLowerCase().includes('banner')) return Megaphone;
    return FileText;
  };

  return (
    <div className="space-y-6">
      {/* Templates Section */}
      {templates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {templates.map((template) => {
                const Icon = getTemplateIcon(template.name);
                const isCreating = creatingFromTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleUseTemplate(template)}
                    disabled={isCreating}
                    className="flex flex-col items-start p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    {template.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-primary mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      {isCreating ? 'Creating...' : 'Use template'}
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Your Tours heading */}
      {tours.length > 0 && (
        <h3 className="text-lg font-semibold">Your Tours</h3>
      )}

      {/* Tours grid */}
      {filteredTours.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      ) : tours.length === 0 ? (
        <EmptyState customers={customers} templates={templates} onUseTemplate={handleUseTemplate} creatingFromTemplate={creatingFromTemplate} />
      ) : (
        <NoResults onClear={clearFilters} />
      )}
    </div>
  );
}

function EmptyState({
  customers,
  templates,
  onUseTemplate,
  creatingFromTemplate
}: {
  customers: Customer[];
  templates: Template[];
  onUseTemplate: (template: Template) => void;
  creatingFromTemplate: string | null;
}) {
  // Template icons based on name
  const getTemplateIcon = (name: string) => {
    if (name.toLowerCase().includes('welcome')) return MessageSquare;
    if (name.toLowerCase().includes('feature') || name.toLowerCase().includes('highlight')) return Sparkles;
    if (name.toLowerCase().includes('checklist') || name.toLowerCase().includes('getting started')) return ListChecks;
    if (name.toLowerCase().includes('announcement') || name.toLowerCase().includes('banner')) return Megaphone;
    return FileText;
  };

  return (
    <div className="space-y-6">
      {/* Templates in empty state */}
      {templates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Start with a Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {templates.map((template) => {
                const Icon = getTemplateIcon(template.name);
                const isCreating = creatingFromTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => onUseTemplate(template)}
                    disabled={isCreating}
                    className="flex flex-col items-start p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    {template.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-primary mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      {isCreating ? 'Creating...' : 'Use template'}
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Or start from scratch */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Map className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Or start from scratch</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Create a custom guided tour to help your users navigate the platform
            and discover key features.
          </p>
          <AddTourDialog customers={customers} />
        </CardContent>
      </Card>
    </div>
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
