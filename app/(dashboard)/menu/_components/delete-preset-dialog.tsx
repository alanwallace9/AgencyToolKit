'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { MenuPreset } from '@/types/database';
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
import { deleteMenuPreset } from '../_actions/menu-actions';

interface DeletePresetDialogProps {
  preset: MenuPreset | null;
  onClose: () => void;
}

export function DeletePresetDialog({ preset, onClose }: DeletePresetDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!preset) return;

    setIsLoading(true);
    try {
      const result = await deleteMenuPreset(preset.id);

      if (result.success) {
        toast.success('Preset deleted successfully');
        onClose();
      } else {
        toast.error(result.error || 'Failed to delete preset');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={!!preset} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Preset</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{preset?.name}</strong>? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
