'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AVATAR_RECOMMENDED_SIZE } from '@/lib/guidely-theme-defaults';

interface AvatarUploaderProps {
  themeId: string;
  currentUrl: string | null;
  avatarShape: 'circle' | 'rounded' | 'square';
  avatarSize: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function AvatarUploader({
  themeId,
  currentUrl,
  avatarShape,
  avatarSize,
  onUpload,
  onRemove,
  disabled = false,
}: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('theme_id', themeId);

        const response = await fetch('/api/themes/avatar', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        onUpload(data.url);
        toast.success('Avatar uploaded');
      } catch (error) {
        toast.error('Upload failed', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [themeId, onUpload]
  );

  const handleRemove = useCallback(async () => {
    setIsRemoving(true);

    try {
      const response = await fetch('/api/themes/avatar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme_id: themeId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove avatar');
      }

      onRemove();
      toast.success('Avatar removed');
    } catch (error) {
      toast.error('Failed to remove avatar', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsRemoving(false);
    }
  }, [themeId, onRemove]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        // Validate file size
        if (file.size > AVATAR_RECOMMENDED_SIZE.maxFileSize) {
          toast.error('File too large', {
            description: 'Avatar must be under 500KB',
          });
          return;
        }
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: disabled || isUploading,
  });

  const borderRadius =
    avatarShape === 'circle' ? '50%' : avatarShape === 'rounded' ? '12px' : '0';

  return (
    <div className="space-y-3">
      <Label className="text-sm">Default Avatar</Label>

      {/* Preview / Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          {currentUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUrl}
                alt="Avatar preview"
                className="object-cover"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius,
                }}
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div
              className="flex items-center justify-center bg-muted"
              style={{
                width: '80px',
                height: '80px',
                borderRadius,
              }}
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          )}

          <div className="text-center">
            {isUploading ? (
              <p className="text-sm text-muted-foreground">Uploading...</p>
            ) : isDragActive ? (
              <p className="text-sm text-primary">Drop image here</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  <span className="text-primary font-medium">Click to upload</span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WebP up to 500KB
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Size recommendation */}
      <p className="text-xs text-muted-foreground">
        {AVATAR_RECOMMENDED_SIZE.displayNote}
      </p>
    </div>
  );
}
