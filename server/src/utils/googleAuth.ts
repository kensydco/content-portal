import { google } from 'googleapis';
import { env } from './env';
import { logger } from './logger';

export function getGoogleAuth() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: env.GOOGLE_CLIENT_EMAIL,
        private_key: env.GOOGLE_PRIVATE_KEY,
        project_id: env.GOOGLE_PROJECT_ID,
      },
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    return auth;
  } catch (error) {
    logger.error('Failed to initialize Google Auth', error);
    throw new Error('Google authentication configuration error');
  }
}

export async function getDriveClient() {
  const auth = getGoogleAuth();
  return google.drive({ version: 'v3', auth });
}

export async function getSheetsClient() {
  const auth = getGoogleAuth();
  return google.sheets({ version: 'v4', auth });
}
