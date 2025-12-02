import { Readable } from 'stream';
import { getDriveClient } from '../utils/googleAuth';
import { env } from '../utils/env';
import { logger } from '../utils/logger';

export class DriveService {
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<{ fileId: string; webViewLink: string; size: number }> {
    try {
      const drive = await getDriveClient();

      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [env.DRIVE_FOLDER_ID],
        },
        media: {
          mimeType,
          body: Readable.from(fileBuffer),
        },
        fields: 'id, webViewLink, size',
      });

      const { id, webViewLink, size } = response.data;

      if (!id || !webViewLink) {
        throw new Error('Drive upload failed: Missing file ID or web view link');
      }

      // Make file accessible to anyone with the link
      await drive.permissions.create({
        fileId: id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      logger.info('File uploaded to Drive', { fileId: id, fileName });

      return {
        fileId: id,
        webViewLink,
        size: parseInt(size || '0'),
      };
    } catch (error) {
      logger.error('Drive upload failed', error);
      throw new Error('Failed to upload file to Google Drive');
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const drive = await getDriveClient();
      await drive.files.delete({ fileId });
      logger.info('File deleted from Drive', { fileId });
    } catch (error) {
      logger.error('Drive delete failed', error);
      throw new Error('Failed to delete file from Google Drive');
    }
  }

  async getFileThumbnail(fileId: string): Promise<string | null> {
    try {
      const drive = await getDriveClient();
      const response = await drive.files.get({
        fileId,
        fields: 'thumbnailLink',
      });

      return response.data.thumbnailLink || null;
    } catch (error) {
      logger.warn('Failed to get thumbnail', { fileId });
      return null;
    }
  }
}

export const driveService = new DriveService();
