'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MessageSquare,
  Plus,
  MoreHorizontal,
  Copy,
  Trash2,
  Play,
  Pause,
  Archive,
  Eye,
  MousePointerClick,
  X,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  createBanner,
  duplicateBanner,
  deleteBanner,
  publishBanner,
  unpublishBanner,
  archiveBanner,
  createBannerFromTemplate,
  type BannerWithStats,
} from '../_actions/banner-actions';
import { BANNER_TEMPLATES } from '../_lib/banner-defaults';
import type { Banner } from '@/types/database';
import { format } from 'date-fns';

interface BannersCardProps {
  banners: BannerWithStats[];
}

export function BannersCard({ banners }: BannersCardProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBannerName, setNewBannerName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newBannerName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setIsCreating(true);
    try {
      let banner: Banner;
      if (selectedTemplate) {
        banner = await createBannerFromTemplate(selectedTemplate);
      } else {
        banner = await createBanner({ name: newBannerName });
      }
      toast.success('Banner created');
      setShowCreateDialog(false);
      setNewBannerName('');
      setSelectedTemplate(null);
      router.push(`/tours/banners/${banner.id}`);
    } catch (error) {
      toast.error('Failed to create banner', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setIsDuplicating(id);
    try {
      const banner = await duplicateBanner(id);
      toast.success('Banner duplicated');
      router.push(`/tours/banners/${banner.id}`);
    } catch (error) {
      toast.error('Failed to duplicate banner', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteBanner(id);
      toast.success('Banner deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete banner', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handlePublish = async (id: string) => {
    setIsUpdatingStatus(id);
    try {
      await publishBanner(id);
      toast.success('Banner is now live');
      router.refresh();
    } catch (error) {
      toast.error('Failed to publish banner', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleUnpublish = async (id: string) => {
    setIsUpdatingStatus(id);
    try {
      await unpublishBanner(id);
      toast.success('Banner unpublished');
      router.refresh();
    } catch (error) {
      toast.error('Failed to unpublish banner', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleArchive = async (id: string) => {
    setIsUpdatingStatus(id);
    try {
      await archiveBanner(id);
      toast.success('Banner archived');
      router.refresh();
    } catch (error) {
      toast.error('Failed to archive banner', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/tours/banners/${id}`);
  };

  const getStatusBadge = (banner: BannerWithStats) => {
    switch (banner.status) {
      case 'live':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Live</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Scheduled</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-muted-foreground">Archived</Badge>;
      default:
        return null;
    }
  };

  const getStylePresetColor = (preset: string) => {
    switch (preset) {
      case 'info': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-primary';
    }
  };

  const getScheduleText = (banner: BannerWithStats) => {
    if (banner.schedule.mode === 'always') return null;
    if (!banner.schedule.start_date) return null;

    const start = new Date(banner.schedule.start_date);
    const end = banner.schedule.end_date ? new Date(banner.schedule.end_date) : null;

    if (end) {
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;
    }
    return `From ${format(start, 'MMM d')}`;
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Banners
            </CardTitle>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <div className="text-center py-6">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No banners yet. Create one to announce updates to users.
              </p>
              <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Create banner
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {banners.slice(0, 5).map((banner) => (
                <div
                  key={banner.id}
                  className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleEdit(banner.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {/* Style color indicator */}
                      <div className={cn(
                        'w-2 h-2 rounded-full flex-shrink-0',
                        getStylePresetColor(banner.style_preset)
                      )} />
                      <span className="font-medium text-sm truncate">{banner.name}</span>
                      {getStatusBadge(banner)}
                      {banner.banner_type === 'trial_expiration' && (
                        <Badge variant="outline" className="text-xs">Trial</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="capitalize">{banner.position}</span>
                      <span className="capitalize">{banner.style_preset}</span>
                      {getScheduleText(banner) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {getScheduleText(banner)}
                        </span>
                      )}
                    </div>
                    {/* Analytics */}
                    {banner.view_count > 0 && (
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {banner.view_count} views
                        </span>
                        {banner.click_count > 0 && (
                          <span className="flex items-center gap-1">
                            <MousePointerClick className="h-3 w-3" />
                            {banner.click_count} clicks
                          </span>
                        )}
                        {banner.dismiss_count > 0 && (
                          <span className="flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {banner.dismiss_count} dismissed
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {banner.status === 'draft' && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublish(banner.id);
                          }}
                          disabled={isUpdatingStatus === banner.id}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      {(banner.status === 'live' || banner.status === 'scheduled') && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnpublish(banner.id);
                          }}
                          disabled={isUpdatingStatus === banner.id}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Unpublish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(banner.id);
                        }}
                        disabled={isDuplicating === banner.id}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {banner.status !== 'archived' && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(banner.id);
                          }}
                          disabled={isUpdatingStatus === banner.id}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(banner.id);
                        }}
                        disabled={isDeleting === banner.id}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}

              {banners.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  + {banners.length - 5} more banners
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Banner</DialogTitle>
            <DialogDescription>
              Create a new banner to communicate with your users.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Holiday Promotion"
                value={newBannerName}
                onChange={(e) => setNewBannerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Start from template (optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                {BANNER_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      if (!newBannerName) {
                        setNewBannerName(template.name);
                      }
                    }}
                    className={cn(
                      'flex flex-col items-start p-3 rounded-lg border text-left transition-colors',
                      selectedTemplate === template.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-accent/50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        template.style_preset === 'info' ? 'bg-blue-500' :
                        template.style_preset === 'success' ? 'bg-green-500' :
                        template.style_preset === 'warning' ? 'bg-amber-500' :
                        template.style_preset === 'error' ? 'bg-red-500' : 'bg-primary'
                      )} />
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {template.description}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed transition-colors',
                    selectedTemplate === null
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  )}
                >
                  <Plus className="h-4 w-4 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Blank</span>
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !newBannerName.trim()}>
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
