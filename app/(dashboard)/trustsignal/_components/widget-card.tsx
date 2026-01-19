'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
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
  Pause,
  Play,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteWidget, duplicateWidget, updateWidget } from '../_actions/social-proof-actions';
import type { SocialProofWidget } from '@/types/database';

interface WidgetCardProps {
  widget: SocialProofWidget & {
    event_count: number;
    today_count: number;
  };
}

export function WidgetCard({ widget }: WidgetCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleActive = async () => {
    setIsUpdating(true);
    try {
      await updateWidget(widget.id, { is_active: !widget.is_active });
      toast.success(widget.is_active ? 'Widget paused' : 'Widget activated');
      router.refresh();
    } catch {
      toast.error('Failed to update widget');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const newWidget = await duplicateWidget(widget.id);
      toast.success('Widget duplicated');
      router.push(`/trustsignal/${newWidget.id}`);
    } catch {
      toast.error('Failed to duplicate widget');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteWidget(widget.id);
      toast.success('Widget deleted');
      setShowDeleteDialog(false);
      router.refresh();
    } catch {
      toast.error('Failed to delete widget');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0" onClick={() => router.push(`/trustsignal/${widget.id}`)}>
              <CardTitle className="text-sm font-medium truncate">
                {widget.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={widget.is_active ? 'default' : 'secondary'}
                  className={
                    widget.is_active
                      ? 'bg-green-100 text-green-700 hover:bg-green-100'
                      : ''
                  }
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                      widget.is_active ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  {widget.is_active ? 'Active' : 'Paused'}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {widget.theme}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/trustsignal/${widget.id}`)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleActive} disabled={isUpdating}>
                  {widget.is_active ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent
          className="pb-3"
          onClick={() => router.push(`/trustsignal/${widget.id}`)}
        >
          {/* Theme Preview */}
          <div className="mb-3">
            <NotificationPreviewMini
              theme={widget.theme}
              position={widget.position}
              customColors={widget.custom_colors}
            />
          </div>
        </CardContent>

        <CardFooter
          className="border-t pt-3 text-xs text-muted-foreground"
          onClick={() => router.push(`/trustsignal/${widget.id}`)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{widget.event_count} events</span>
              </div>
              {widget.today_count > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{widget.today_count} today</span>
                </div>
              )}
            </div>
            <span>
              {formatDistanceToNow(new Date(widget.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Widget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{widget.name}&quot;? This will also
              delete all captured events. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Mini notification preview for card
function NotificationPreviewMini({
  theme,
  position,
  customColors,
}: {
  theme: string;
  position: string;
  customColors: { background: string; text: string; accent: string; border: string };
}) {
  const getThemeStyles = () => {
    switch (theme) {
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        };
      case 'custom':
        return {
          background: customColors.background,
          border: `1px solid ${customColors.border}`,
        };
      default: // minimal
        return {
          background: '#ffffff',
          border: '1px solid #e5e7eb',
        };
    }
  };

  const getTextColor = () => {
    if (theme === 'custom') return customColors.text;
    return '#1f2937';
  };

  const getPositionStyles = () => {
    const base = 'absolute';
    switch (position) {
      case 'bottom-right':
        return `${base} bottom-1 right-1`;
      case 'top-left':
        return `${base} top-1 left-1`;
      case 'top-right':
        return `${base} top-1 right-1`;
      default: // bottom-left
        return `${base} bottom-1 left-1`;
    }
  };

  return (
    <div className="relative h-16 bg-muted/50 rounded-md overflow-hidden">
      <div
        className={`${getPositionStyles()} p-1.5 rounded shadow-sm text-[8px] max-w-[70%]`}
        style={getThemeStyles()}
      >
        <div className="font-medium truncate" style={{ color: getTextColor() }}>
          John from Austin
        </div>
        <div className="text-muted-foreground truncate" style={{ fontSize: '7px' }}>
          just signed up
        </div>
      </div>
    </div>
  );
}
