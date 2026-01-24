// lib/storage/types.ts
// Storage provider interface for easy swapping between Vercel Blob and R2

export interface UploadResult {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
}

export interface StorageProvider {
  /**
   * Upload a file to storage
   * @param file - File buffer or Blob
   * @param pathname - Path including filename (e.g., "agency-123/customer-456/image.jpg")
   * @param contentType - MIME type (e.g., "image/jpeg")
   */
  upload(
    file: Buffer | Blob,
    pathname: string,
    contentType: string
  ): Promise<UploadResult>;

  /**
   * Delete a file from storage
   * @param url - The full URL of the file to delete
   */
  delete(url: string): Promise<void>;

  /**
   * Delete multiple files from storage
   * @param urls - Array of full URLs to delete
   */
  deleteMany(urls: string[]): Promise<void>;
}
