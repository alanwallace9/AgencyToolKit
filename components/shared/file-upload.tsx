'use client';

import { useState, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  placeholder?: string;
  showUrlInput?: boolean;
}

export function FileUpload({
  value,
  onChange,
  accept = 'image/gif,image/png,image/jpeg,image/webp',
  placeholder = 'Enter URL or upload file',
  showUrlInput = true,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Check if value is an uploaded file (Supabase URL)
  const isUploadedFile = value?.includes('supabase.co/storage');

  return (
    <div className="space-y-2">
      {/* URL Input - Show simplified view for uploaded files */}
      {showUrlInput && (
        <div className="flex gap-1">
          {isUploadedFile ? (
            <div className="h-8 flex-1 flex items-center px-3 text-xs bg-muted rounded-md text-muted-foreground">
              Image uploaded
            </div>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="h-8 text-xs flex-1 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* File Input - Stop all pointer/mouse events from bubbling to dnd-kit */}
      <div
        className="flex gap-2 items-center"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="h-8 w-full text-xs border rounded-md px-2 py-1 cursor-pointer file:mr-2 file:h-6 file:px-2 file:text-xs file:border-0 file:bg-primary file:text-primary-foreground file:rounded file:cursor-pointer"
        />
        {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      {/* Preview */}
      {value && (
        <div className="relative mt-2">
          <img
            src={value}
            alt="Preview"
            className="w-full h-20 object-cover rounded border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}
