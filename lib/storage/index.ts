// lib/storage/index.ts
// Storage abstraction layer
// Currently uses Vercel Blob, can be swapped to R2 later

import { vercelBlobStorage } from './vercel-blob';
import type { StorageProvider, UploadResult } from './types';

// Export the current storage provider
// To switch to R2: import { r2Storage } from './r2' and change this line
export const storage: StorageProvider = vercelBlobStorage;

// Re-export types
export type { StorageProvider, UploadResult };

// Helper to generate storage paths
export function generateImagePath(
  agencyId: string,
  customerId: string | null,
  filename: string
): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');

  if (customerId) {
    return `images/${agencyId}/${customerId}/${timestamp}-${sanitizedFilename}`;
  }
  return `images/${agencyId}/${timestamp}-${sanitizedFilename}`;
}

// Allowed image types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

// Max upload size (3MB - typical phone photo)
export const MAX_UPLOAD_SIZE = 3 * 1024 * 1024;

// Validate image file
export function validateImageFile(
  file: { type: string; size: number },
  maxSize: number = MAX_UPLOAD_SIZE
): { valid: true } | { valid: false; error: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: JPG, PNG, WebP`,
    };
  }

  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024);
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxMB}MB`,
    };
  }

  return { valid: true };
}
