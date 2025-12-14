import { Storage } from '@google-cloud/storage';
import { env } from '../utils/env';
import { logger } from '../utils/logger';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: env.GOOGLE_CLIENT_EMAIL,
    private_key: env.GOOGLE_PRIVATE_KEY,
  },
});

export class DriveService {
  private bucketName = 'content-portal-uploads';

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<{ fileId: string; webViewLink: string; size: number }> {
    try {
      const bucket = storage.bucket(this.bucketName);
      const blob = bucket.file(fileName);

      // Upload the file
      await blob.save(fileBuffer, {
        metadata: {
          contentType: mimeType,
          cacheControl: 'public, max-age=31536000',
        },
      });

      // Make the file publicly accessible
      await blob.makePublic();

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;

      logger.info('File uploaded to Cloud Storage', { fileName, url: publicUrl });

      return {
        fileId: fileName,
        webViewLink: publicUrl,
        size: fileBuffer.length,
      };
    } catch (error) {
      logger.error('Cloud Storage upload failed', error);
      throw new Error('Failed to upload file to Cloud Storage');
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const bucket = storage.bucket(this.bucketName);
      await bucket.file(fileId).delete();
      logger.info('File deleted from Cloud Storage', { fileId });
    } catch (error) {
      logger.error('Cloud Storage delete failed', error);
      throw new Error('Failed to delete file from Cloud Storage');
    }
  }

  async getFileThumbnail(fileId: string): Promise<string | null> {
    try {
      // For Cloud Storage, return the public URL
      // Thumbnails would need to be generated separately
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileId}`;
      return publicUrl;
    } catch (error) {
      logger.warn('Failed to get file URL', { fileId });
      return null;
    }
  }
}

export const driveService = new DriveService();
