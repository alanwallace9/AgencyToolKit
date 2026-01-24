'use client';

// Image upload zone with drag & drop and URL paste
// States: idle → hover → uploading → success/error

import { useState, useRef, useCallback } from 'react';
import { Upload, Link2, Loader2, CheckCircle2, AlertCircle, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface UploadedImage {
  url: string;
  width: number;
  height: number;
  size: number;
  contentType: string;
}

interface ImageUploadZoneProps {
  onUpload: (image: UploadedImage) => void;
  customerId?: string | null;
  className?: string;
  compact?: boolean; // For use in editor sidebar
}

type UploadState = 'idle' | 'hover' | 'uploading' | 'success' | 'error';

export function ImageUploadZone({
  onUpload,
  customerId,
  className,
  compact = false,
}: ImageUploadZoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state !== 'uploading') {
      setState('hover');
    }
  }, [state]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state !== 'uploading') {
      setState('idle');
    }
  }, [state]);

  const uploadFile = async (file: File) => {
    setState('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (customerId) {
        formData.append('customer_id', customerId);
      }

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setState('success');
      onUpload(data);

      // Reset to idle after showing success
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
      setTimeout(() => {
        setState('idle');
        setError(null);
      }, 3000);
    }
  };

  const fetchFromUrl = async (url: string) => {
    setState('uploading');
    setError(null);

    try {
      const response = await fetch('/api/images/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, customer_id: customerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fetch failed');
      }

      setState('success');
      setUrlInput('');
      setShowUrlInput(false);
      onUpload(data);

      // Reset to idle after showing success
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to fetch image');
      setTimeout(() => {
        setState('idle');
        setError(null);
      }, 3000);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [customerId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      fetchFromUrl(urlInput.trim());
    }
  };

  const getStateStyles = () => {
    switch (state) {
      case 'hover':
        return 'border-primary bg-primary/5 scale-[1.02]';
      case 'uploading':
        return 'border-primary/50 bg-muted/50';
      case 'success':
        return 'border-green-500 bg-green-500/10';
      case 'error':
        return 'border-destructive bg-destructive/10';
      default:
        return 'border-dashed border-muted-foreground/25 hover:border-muted-foreground/50';
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'uploading':
        return <Loader2 className="h-8 w-8 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-destructive" />;
      default:
        return <Upload className={cn("h-8 w-8", state === 'hover' ? 'text-primary' : 'text-muted-foreground')} />;
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'hover':
        return 'Drop to upload';
      case 'uploading':
        return 'Uploading...';
      case 'success':
        return 'Upload complete!';
      case 'error':
        return error || 'Upload failed';
      default:
        return 'Drag & drop your image here';
    }
  };

  if (compact) {
    // Compact version for editor sidebar
    return (
      <div className={cn('space-y-3', className)}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => state === 'idle' && fileInputRef.current?.click()}
          className={cn(
            'relative rounded-lg border-2 p-4 transition-all duration-200 cursor-pointer',
            getStateStyles()
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            {getStateIcon()}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getStateText()}</p>
              {state === 'idle' && (
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP • Max 3MB</p>
              )}
            </div>
          </div>
        </div>

        {/* URL Input Toggle */}
        {!showUrlInput ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setShowUrlInput(true)}
            disabled={state === 'uploading'}
          >
            <Link2 className="h-4 w-4 mr-2" />
            Or paste image URL
          </Button>
        ) : (
          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <Input
              type="url"
              placeholder="https://..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={state === 'uploading'}
              className="flex-1 text-sm"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!urlInput.trim() || state === 'uploading'}
            >
              {state === 'uploading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Fetch'
              )}
            </Button>
          </form>
        )}
      </div>
    );
  }

  // Full-size version for dialog/page
  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => state === 'idle' && fileInputRef.current?.click()}
        className={cn(
          'relative rounded-lg border-2 p-8 transition-all duration-200 cursor-pointer',
          getStateStyles()
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center gap-3">
          {getStateIcon()}
          <div>
            <p className="font-medium">{getStateText()}</p>
            {state === 'idle' && (
              <>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG, WebP • Max 3MB
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="image-url" className="text-sm font-medium flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Paste image URL
        </Label>
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <Input
            id="image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={state === 'uploading'}
          />
          <Button
            type="submit"
            disabled={!urlInput.trim() || state === 'uploading'}
          >
            {state === 'uploading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Fetch'
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Works with GHL Media Storage, Google Drive (public), or any public image URL
        </p>
      </div>
    </div>
  );
}
