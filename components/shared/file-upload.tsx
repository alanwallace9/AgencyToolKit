'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2 } from 'lucide-react';
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

  return (
    <div className="space-y-2">
      {/* URL Input */}
      {showUrlInput && (
        <div className="flex gap-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-8 text-xs flex-1"
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="sr-only"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-3 w-3 mr-1" />
              Upload File
            </>
          )}
        </Button>
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
