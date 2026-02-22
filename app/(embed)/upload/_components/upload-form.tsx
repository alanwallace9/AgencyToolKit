'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle2, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UploadFormProps {
  agencyToken: string;
  locationId: string;
  agencyName: string;
  existingCustomerName: string | null;
}

interface PhotoFile {
  file: File;
  name: string;
  preview: string;
}

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function UploadForm({ agencyToken, locationId, agencyName, existingCustomerName }: UploadFormProps) {
  const [businessName, setBusinessName] = useState(existingCustomerName || '');
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`${file.name} is not a supported format. Use JPEG, PNG, or WebP.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }
    }

    setPhotos((prev) => {
      const remaining = MAX_PHOTOS - prev.length;
      if (remaining <= 0) {
        setError(`Maximum ${MAX_PHOTOS} photos allowed.`);
        return prev;
      }
      const toAdd = fileArray.slice(0, remaining);
      return [
        ...prev,
        ...toAdd.map((file) => ({
          file,
          name: file.name.replace(/\.[^/.]+$/, ''),
          preview: URL.createObjectURL(file),
        })),
      ];
    });
  }, []);

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updatePhotoName = (index: number, name: string) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, name } : p)));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || photos.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('key', agencyToken);
      formData.append('location_id', locationId);
      formData.append('business_name', businessName.trim());
      formData.append('photo_names', JSON.stringify(photos.map((p) => p.name)));
      for (const photo of photos) {
        formData.append('photos', photo.file);
      }

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Clean up previews
      for (const photo of photos) {
        URL.revokeObjectURL(photo.preview);
      }

      setIsComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  if (isComplete) {
    return (
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <div className="text-center space-y-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-semibold">Photos Uploaded!</h2>
            <p className="text-muted-foreground">
              Your photos have been submitted successfully. You can close this page.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Upload Photos</CardTitle>
        <CardDescription>
          Upload your business photos for {agencyName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="business_name">
              Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="business_name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your business name"
              required
              disabled={isUploading}
            />
          </div>

          {/* Drop Zone */}
          {photos.length < MAX_PHOTOS && (
            <div
              className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">
                Drag & drop photos here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or{' '}
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                JPEG, PNG, or WebP. Max 5MB each. Up to {MAX_PHOTOS - photos.length} more.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>
          )}

          {/* Photo List */}
          {photos.length > 0 && (
            <div className="space-y-3">
              <Label>Photos ({photos.length}/{MAX_PHOTOS})</Label>
              {photos.map((photo, index) => (
                <div
                  key={photo.preview}
                  className="flex items-center gap-3 rounded-lg border p-2"
                >
                  <div className="relative h-12 w-12 shrink-0 rounded overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.preview}
                      alt={photo.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Input
                    value={photo.name}
                    onChange={(e) => updatePhotoName(index, e.target.value)}
                    className="h-9 text-sm"
                    placeholder="Photo name"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removePhoto(index)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isUploading || !businessName.trim() || photos.length === 0}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                Upload {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
