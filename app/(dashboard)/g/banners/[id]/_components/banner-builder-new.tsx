'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Settings,
  Play,
  Pause,
  MoreHorizontal,
  Copy,
  Trash2,
  Archive,
  Check,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  updateBanner,
  publishBanner,
  unpublishBanner,
  archiveBanner,
  duplicateBanner,
  deleteBanner,
} from '@/app/(dashboard)/tours/_actions/banner-actions';
import { BannerElementsPanel } from './banner-elements-panel';
import { BannerStyleSettings } from './banner-style-settings';
import { BannerPreviewPanel } from './banner-preview-panel';
import { BannerSchedulePopover } from './banner-schedule-popover';
import { BannerFullSettings } from '@/app/(dashboard)/tours/banners/[id]/_components/banner-full-settings';
import type { Banner, TourTheme, Checklist } from '@/types/database';
import type { TourWithStats } from '@/app/(dashboard)/tours/_actions/tour-actions';

interface BannerBuilderNewProps {
  banner: Banner;
  themes: TourTheme[];
  tours: TourWithStats[];
  checklists: Checklist[];
  backHref?: string;
}

export function BannerBuilderNew({
  banner: initialBanner,
  themes,
  tours,
  checklists,
  backHref = '/g/banners',
}: BannerBuilderNewProps) {
  const router = useRouter();
  const [banner, setBanner] = useState<Banner>(initialBanner);
  const [showStyleSettings, setShowStyleSettings] = useState(false);
  const [showFullSettings, setShowFullSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Auto-save with debounce
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateBanner(banner.id, {
          name: banner.name,
          banner_type: banner.banner_type,
          content: banner.content,
          action: banner.action,
          position: banner.position,
          display_mode: banner.display_mode,
          style_preset: banner.style_preset,
          custom_colors: banner.custom_colors,
          theme_id: banner.theme_id,
          dismissible: banner.dismissible,
          dismiss_duration: banner.dismiss_duration,
          priority: banner.priority,
          exclusive: banner.exclusive,
          targeting: banner.targeting,
          schedule: banner.schedule,
          trial_triggers: banner.trial_triggers,
        });
        setHasChanges(false);
      } catch (error) {
        toast.error('Failed to save changes');
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [banner, hasChanges]);

  const updateLocalBanner = useCallback((updates: Partial<Banner>) => {
    setBanner(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  const handlePublish = async () => {
    setIsUpdatingStatus(true);
    try {
      const updated = await publishBanner(banner.id);
      setBanner(updated);
      toast.success('Banner is now live');
    } catch (error) {
      toast.error('Failed to publish');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUnpublish = async () => {
    setIsUpdatingStatus(true);
    try {
      const updated = await unpublishBanner(banner.id);
      setBanner(updated);
      toast.success('Banner unpublished');
    } catch (error) {
      toast.error('Failed to unpublish');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleArchive = async () => {
    setIsUpdatingStatus(true);
    try {
      await archiveBanner(banner.id);
      toast.success('Banner archived');
      router.push(backHref);
    } catch (error) {
      toast.error('Failed to archive');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const newBanner = await duplicateBanner(banner.id);
      toast.success('Banner duplicated');
      router.push(`${backHref}/${newBanner.id}`);
    } catch (error) {
      toast.error('Failed to duplicate');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBanner(banner.id);
      toast.success('Banner deleted');
      router.push(backHref);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const selectedTheme = themes.find(t => t.id === banner.theme_id) || themes.find(t => t.is_default);

  const getStatusBadge = () => {
    switch (banner.status) {
      case 'live':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            Live
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            Scheduled
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Archived
          </Badge>
        );
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Input
            value={banner.name}
            onChange={(e) => updateLocalBanner({ name: e.target.value })}
            className="font-semibold text-lg border-none shadow-none px-2 h-auto py-1 w-64 focus-visible:ring-1"
          />
          {getStatusBadge()}
          {banner.banner_type === 'trial_expiration' && (
            <Badge variant="outline" className="text-xs">Trial</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          <span className="text-xs text-muted-foreground mr-2">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            ) : hasChanges ? (
              'Unsaved changes'
            ) : (
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                All changes saved
              </span>
            )}
          </span>

          {/* Schedule button */}
          <BannerSchedulePopover
            schedule={banner.schedule}
            onUpdate={(schedule) => updateLocalBanner({ schedule })}
          />

          {/* Settings button (targeting, priority) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullSettings(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>

          {/* Publish/Unpublish */}
          {banner.status === 'draft' ? (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isUpdatingStatus || !banner.content.trim()}
            >
              <Play className="h-4 w-4 mr-1" />
              Publish
            </Button>
          ) : (banner.status === 'live' || banner.status === 'scheduled') ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnpublish}
              disabled={isUpdatingStatus}
            >
              <Pause className="h-4 w-4 mr-1" />
              Unpublish
            </Button>
          ) : null}

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {banner.status !== 'archived' && (
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content - 3 panel layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left panel - Elements (always visible) */}
        <div className="w-80 border-r bg-muted/30 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            <BannerElementsPanel
              banner={banner}
              tours={tours}
              checklists={checklists}
              onUpdate={updateLocalBanner}
              onOpenStyleSettings={() => setShowStyleSettings(true)}
            />
          </div>
        </div>

        {/* Center panel - Style Settings (slides out) */}
        {showStyleSettings && (
          <div className="w-80 border-r flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b bg-muted/30 shrink-0">
              <h3 className="font-medium">Style Settings</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowStyleSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <BannerStyleSettings
                banner={banner}
                themes={themes}
                onUpdate={updateLocalBanner}
              />
            </div>
          </div>
        )}

        {/* Right panel - Preview (flexible width) */}
        <div className="flex-1 bg-muted/30 min-h-0 overflow-hidden">
          <BannerPreviewPanel
            banner={banner}
            theme={selectedTheme}
          />
        </div>
      </div>

      {/* Full Settings Sheet (targeting, scheduling) */}
      <BannerFullSettings
        open={showFullSettings}
        onOpenChange={setShowFullSettings}
        banner={banner}
        onUpdate={updateLocalBanner}
      />
    </div>
  );
}
