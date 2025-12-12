import { Router, Request, Response } from 'express';
import { getSheetsClient } from '../utils/googleAuth';
import { getDriveClient } from '../utils/googleDrive';
import { env } from '../utils/env';
import { logger } from '../utils/logger';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
    },
    status: 'healthy',
  };

  try {
    // Test Google Sheets connection
    logger.info('Testing Google Sheets connection...');
    const sheets = await getSheetsClient();
    const spreadsheetId = env.SPREADSHEET_ID;

    if (!spreadsheetId) {
      checks.googleSheets = {
        status: 'error',
        error: 'SPREADSHEET_ID not configured',
      };
    } else {
      try {
        const response = await sheets.spreadsheets.get({
          spreadsheetId,
        });

        checks.googleSheets = {
          status: 'ok',
          spreadsheetId,
          title: response.data.properties?.title,
          sheets: response.data.sheets?.map(s => s.properties?.title),
        };
      } catch (error: any) {
        checks.googleSheets = {
          status: 'error',
          spreadsheetId,
          error: error.message,
          code: error.code,
        };
      }
    }

    // Test Google Drive connection
    logger.info('Testing Google Drive connection...');
    const drive = await getDriveClient();
    const folderId = env.DRIVE_FOLDER_ID;

    if (!folderId) {
      checks.googleDrive = {
        status: 'error',
        error: 'DRIVE_FOLDER_ID not configured',
      };
    } else {
      try {
        const response = await drive.files.get({
          fileId: folderId,
          fields: 'id, name, mimeType, permissions',
        });

        checks.googleDrive = {
          status: 'ok',
          folderId,
          folderName: response.data.name,
          mimeType: response.data.mimeType,
        };
      } catch (error: any) {
        checks.googleDrive = {
          status: 'error',
          folderId,
          error: error.message,
          code: error.code,
        };
      }
    }

    // Test environment variables
    checks.envVars = {
      GOOGLE_PROJECT_ID: env.GOOGLE_PROJECT_ID ? 'set' : 'missing',
      GOOGLE_CLIENT_EMAIL: env.GOOGLE_CLIENT_EMAIL ? 'set' : 'missing',
      GOOGLE_PRIVATE_KEY: env.GOOGLE_PRIVATE_KEY ? 'set (length: ' + env.GOOGLE_PRIVATE_KEY.length + ')' : 'missing',
      SPREADSHEET_ID: env.SPREADSHEET_ID ? 'set' : 'missing',
      DRIVE_FOLDER_ID: env.DRIVE_FOLDER_ID ? 'set' : 'missing',
      JWT_SECRET: env.JWT_SECRET ? 'set' : 'missing',
    };

    // Overall status
    const hasErrors = checks.googleSheets?.status === 'error' || checks.googleDrive?.status === 'error';
    checks.status = hasErrors ? 'degraded' : 'healthy';

    res.status(hasErrors ? 503 : 200).json(checks);
  } catch (error: any) {
    logger.error('Health check failed', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
