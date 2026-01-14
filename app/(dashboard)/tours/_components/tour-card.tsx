'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  BarChart3,
  Eye,
  CheckCircle,
  Archive,
  Play,
  Pause,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  deleteTour,
  duplicateTour,
  publishTour,
  unpublishTour,
  archiveTour,
} from '../_actions/tour-actions';
import type { TourWithStats } from '../_actions/tour-actions';
import type { TourStep } from '@/types/database';

interface TourCardProps {
  tour: TourWithStats;
}

const statusConfig = {
  draft: {
    label: 'Draft',
    variant: 'secondary' as const,
    icon: Pencil,
    color: 'text-yellow-600',
    dot: 'bg-yellow-500',
  },
  live: {
    label: 'Live',
    variant: 'default' as const,
    icon: Play,
    color: 'text-green-600',
    dot: 'bg-green-500',
  },
  archived: {
    label: 'Archived',
    variant: 'outline' as const,
    icon: Archive,
    color: 'text-gray-500',
    dot: 'bg-gray-400',
  },
};

export function TourCard({ tour }: TourCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const config = statusConfig[tour.status];
  const steps = tour.steps as TourStep[];
  const stepCount = steps?.length || 0;
  const completionRate =
    tour.stats.views > 0
      ? Math.round((tour.stats.completions / tour.stats.views) * 100)
      : 0;

  const handleEdit = () => {
    router.push(`/tours/${tour.id}`);
  };

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      const duplicate = await duplicateTour(tour.id);
      toast.success('Tour duplicated', {
        description: `Created "${duplicate.name}"`,
      });
      router.refresh();
    } catch (error) {
      toast.error('Failed to duplicate tour');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (stepCount === 0) {
      toast.error('Cannot publish empty tour', {
        description: 'Add at least one step before publishing',
      });
      return;
    }

    setIsLoading(true);
    try {
      await publishTour(tour.id);
      toast.success('Tour published', {
        description: 'Tour is now live for your users',
      });
      router.refresh();
    } catch (error) {
      toast.error('Failed to publish tour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setIsLoading(true);
    try {
      await unpublishTour(tour.id);
      toast.success('Tour unpublished', {
        description: 'Tour is now in draft mode',
      });
      router.refresh();
    } catch (error) {
      toast.error('Failed to unpublish tour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    setIsLoading(true);
    try {
      await archiveTour(tour.id);
      toast.success('Tour archived');
      router.refresh();
    } catch (error) {
      toast.error('Failed to archive tour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTour(tour.id);
      toast.success('Tour deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete tour');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base truncate">{tour.name}</h3>
                <Badge
                  variant={config.variant}
                  className="shrink-0 gap-1"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                  />
                  {config.label}
                </Badge>
              </div>
              {tour.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {tour.description}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate} disabled={isLoading}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {tour.status === 'draft' && (
                  <DropdownMenuItem onClick={handlePublish} disabled={isLoading}>
                    <Play className="h-4 w-4 mr-2" />
                    Publish
                  </DropdownMenuItem>
                )}
                {tour.status === 'live' && (
                  <DropdownMenuItem onClick={handleUnpublish} disabled={isLoading}>
                    <Pause className="h-4 w-4 mr-2" />
                    Unpublish
                  </DropdownMenuItem>
                )}
                {tour.status !== 'archived' && (
                  <DropdownMenuItem onClick={handleArchive} disabled={isLoading}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{stepCount} {stepCount === 1 ? 'step' : 'steps'}</span>
            {tour.customer && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {tour.customer.name}
                </span>
              </>
            )}
            <span>·</span>
            <span>
              Updated {formatDistanceToNow(new Date(tour.updated_at), { addSuffix: true })}
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{tour.stats.views}</span>
                <span className="text-muted-foreground">views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{completionRate}%</span>
                <span className="text-muted-foreground">completion</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                Edit
              </Button>
              {tour.stats.views > 0 && (
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <BarChart3 className="h-4 w-4" />
                  <span className="sr-only">View analytics</span>
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tour</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{tour.name}&quot;? This action cannot be undone.
              All analytics data for this tour will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
