'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, ExternalLink, ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { createTemplateFromPhoto } from '@/app/(dashboard)/images/_actions/image-actions';
import type { CustomerPhoto } from '@/types/database';

interface CustomerPhotoGalleryProps {
  photos: CustomerPhoto[];
  customerName: string;
}

export function CustomerPhotoGallery({ photos: initialPhotos, customerName }: CustomerPhotoGalleryProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerPhoto | null>(null);

  const handleCreateTemplate = async (photoId: string) => {
    setCreatingTemplateId(photoId);
    try {
      const result = await createTemplateFromPhoto(photoId);
      if (result.success) {
        toast.success('Template created — opening editor');
        router.push(`/images/${result.templateId}`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    } finally {
      setCreatingTemplateId(null);
    }
  };

  const handleDelete = async (photoId: string) => {
    setDeletingId(photoId);
    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setSelectedPhoto(null);
      toast.success('Photo deleted');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    } finally {
      setDeletingId(null);
    }
  };

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <Card id="photos">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Uploaded Photos
          </CardTitle>
          <CardDescription>
            Photos uploaded by {customerName} during onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                className="group relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => setSelectedPhoto(photo)}
              >
                <Image
                  src={photo.blob_url}
                  alt={photo.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Hover overlay with name/date */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                  <p className="text-white text-sm font-medium text-center line-clamp-2">
                    {photo.name}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    {formatDistanceToNow(new Date(photo.created_at), { addSuffix: true })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPhoto.name}</DialogTitle>
                <DialogDescription>
                  Uploaded {formatDistanceToNow(new Date(selectedPhoto.created_at), { addSuffix: true })}
                  {selectedPhoto.width && selectedPhoto.height && (
                    <> &middot; {selectedPhoto.width} &times; {selectedPhoto.height}</>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                <Image
                  src={selectedPhoto.blob_url}
                  alt={selectedPhoto.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, 512px"
                />
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedPhoto.blob_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Original
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={deletingId === selectedPhoto.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{selectedPhoto.name}&quot;? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(selectedPhoto.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  size="sm"
                  onClick={() => handleCreateTemplate(selectedPhoto.id)}
                  disabled={creatingTemplateId === selectedPhoto.id}
                >
                  {creatingTemplateId === selectedPhoto.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Open in Image Editor
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
