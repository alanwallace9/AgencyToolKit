'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { deleteImageTemplate } from '../_actions/image-actions';
import { toast } from 'sonner';
import type { ImageTemplate } from '@/types/database';

interface DeleteTemplateDialogProps {
  template: ImageTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteTemplateDialog({
  template,
  open,
  onOpenChange,
  onDeleted,
}: DeleteTemplateDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!template) return;

    setIsDeleting(true);
    const result = await deleteImageTemplate(template.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success('Template deleted');
      onOpenChange(false);
      onDeleted();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Template
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{template?.name}</strong>?
            This will also delete the stored image and cannot be undone.
            {template && template.render_count > 0 && (
              <span className="block mt-2 text-amber-600">
                This template has been rendered {template.render_count} times.
                Existing emails/workflows using this URL will show a broken image.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Template'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
