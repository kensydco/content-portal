import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  // Server
  PORT: process.env.PORT || '8080',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Google Cloud
  GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID || '',
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL || '',
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',

  // Google Sheets
  SPREADSHEET_ID: process.env.SPREADSHEET_ID || '',
  CONTENT_SHEET_NAME: process.env.CONTENT_SHEET_NAME || 'Content_Log',
  AUDIT_SHEET_NAME: process.env.AUDIT_SHEET_NAME || 'Admin_Audit_Log',
  CATEGORIES_SHEET_NAME: process.env.CATEGORIES_SHEET_NAME || 'Categories',
  CONFIG_SHEET_NAME: process.env.CONFIG_SHEET_NAME || 'Configuration',
  ADMINS_SHEET_NAME: process.env.ADMINS_SHEET_NAME || 'Admins',

  // Google Drive
  DRIVE_FOLDER_ID: process.env.DRIVE_FOLDER_ID || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'),

  // Automation
  AUTOMATION_API_KEY: process.env.AUTOMATION_API_KEY || '',

  // Application
  APP_NAME: process.env.APP_NAME || 'Content Ingest Portal',
  WAIVER_URL: process.env.WAIVER_URL || 'https://example.com/waiver',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '500'),
};

// Validation
export function validateEnv(): void {
  const required = [
    'GOOGLE_PROJECT_ID',
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'SPREADSHEET_ID',
    'DRIVE_FOLDER_ID',
  ];

  const missing = required.filter((key) => !env[key as keyof typeof env]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file.'
    );
  }

  if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'dev-secret-change-in-production') {
    throw new Error('JWT_SECRET must be changed in production!');
  }
}
