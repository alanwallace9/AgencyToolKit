'use client';

import { useState, useMemo } from 'react';
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
import {
  createBanner,
  createBannerFromTemplate,
  type BannerWithStats,
} from '@/app/(dashboard)/tours/_actions/banner-actions';
import { BANNER_TEMPLATES } from '@/app/(dashboard)/tours/_lib/banner-defaults';
import type { TourTheme } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

interface BannersListClientProps {
  banners: BannerWithStats[];
  themes: TourTheme[];
}

type BannerStatus = 'draft' | 'live' | 'archived';

const statusConfig: Record<BannerStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  live: { label: 'Live', className: 'bg-green-500/10 text-green-600' },
  archived: { label: 'Archived', className: 'bg-zinc-500/10 text-zinc-500' },
};

export function BannersListClient({ banners, themes }: BannersListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BannerStatus | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBannerName, setNewBannerName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [banners, search, statusFilter]);

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

          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Banner
          </Button>
        </div>
      </div>

      {/* Banners grid */}
      {filteredBanners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Megaphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">
              {search || statusFilter !== 'all' ? 'No banners found' : 'No banners yet'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first banner to announce features or promotions'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBanners.map((banner) => {
            const status = statusConfig[banner.status as BannerStatus];

            return (
              <Link key={banner.id} href={`/g/banners/${banner.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{banner.name}</CardTitle>
                        {banner.content && (
                          <CardDescription className="line-clamp-2 text-xs">
                            {banner.content}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary" className={status.className}>
                        {status.label}
                      </Badge>
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
