// lib/storage/vercel-blob.ts
// Vercel Blob storage provider implementation

import { put, del } from '@vercel/blob';
import type { StorageProvider, UploadResult } from './types';

export class VercelBlobStorage implements StorageProvider {
  async upload(
    file: Buffer | Blob,
    pathname: string,
    contentType: string
  ): Promise<UploadResult> {
    // Calculate size before upload
    let size: number;
    if (Buffer.isBuffer(file)) {
      size = file.length;
    } else {
      size = file.size;
    }

    const blob = await put(pathname, file, {
      access: 'public',
      contentType,
      addRandomSuffix: false, // We handle uniqueness in pathname
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size,
    };
  }

  async delete(url: string): Promise<void> {
    await del(url);
  }

  async deleteMany(urls: string[]): Promise<void> {
    await del(urls);
  }
}

// Singleton instance
export const vercelBlobStorage = new VercelBlobStorage();
