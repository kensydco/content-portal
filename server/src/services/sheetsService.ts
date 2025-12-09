import { getSheetsClient } from '../utils/googleAuth';
import { env } from '../utils/env';
import { logger } from '../utils/logger';
import {
  Submission,
  Category,
  Studio,
  AdminUser,
  AuditLogEntry,
  Config,
  SubmissionStatus,
  AdminRole,
} from '../types';

export class SheetsService {
  private async getSheet(sheetName: string) {
    const sheets = await getSheetsClient();
    return { sheets, spreadsheetId: env.SPREADSHEET_ID, sheetName };
  }

  // Content Log Operations
  async appendSubmission(submission: Submission): Promise<void> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.CONTENT_SHEET_NAME);

      const row = [
        submission.submissionId,
        submission.timestamp,
        submission.uploaderName,
        submission.uploaderEmail,
        submission.uploaderPhone || '',
        submission.fileDriveUrl,
        submission.fileId,
        submission.fileSizeMb,
        submission.uploadDevice,
        submission.studio,
        submission.category,
        submission.description || '',
        submission.sourceQrId || '',
        submission.waiverAgreed,
        submission.waiverTimestamp,
        JSON.stringify(submission.aiTags),
        submission.duplicateDetected,
        submission.adminStartDate || '',
        submission.adminEndDate || '',
        submission.status,
        submission.adminNotes || '',
        submission.archiveFlag,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:V`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row],
        },
      });

      logger.info('Submission appended to sheet', { submissionId: submission.submissionId });
    } catch (error) {
      logger.error('Failed to append submission', error);
      throw new Error('Failed to save submission to database');
    }
  }

  async getSubmissions(filters?: {
    status?: SubmissionStatus;
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<Submission[]> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.CONTENT_SHEET_NAME);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:V`,
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return []; // No data rows

      // Skip header row
      const dataRows = rows.slice(1);

      let submissions = dataRows.map((row): Submission => ({
        submissionId: row[0] || '',
        timestamp: row[1] || '',
        uploaderName: row[2] || '',
        uploaderEmail: row[3] || '',
        uploaderPhone: row[4] || null,
        fileDriveUrl: row[5] || '',
        fileId: row[6] || '',
        fileSizeMb: parseFloat(row[7] || '0'),
        uploadDevice: (row[8] || 'Unknown') as any,
        studio: row[9] || '',
        category: row[10] || '',
        description: row[11] || null,
        sourceQrId: row[12] || null,
        waiverAgreed: row[13] === 'TRUE' || row[13] === true,
        waiverTimestamp: row[14] || '',
        aiTags: this.parseJsonArray(row[15]),
        duplicateDetected: row[16] === 'TRUE' || row[16] === true,
        adminStartDate: row[17] || null,
        adminEndDate: row[18] || null,
        status: (row[19] || 'New') as SubmissionStatus,
        adminNotes: row[20] || null,
        archiveFlag: row[21] === 'TRUE' || row[21] === true,
      }));

      // Apply filters
      if (filters?.status) {
        submissions = submissions.filter((s) => s.status === filters.status);
      }
      if (filters?.category) {
        submissions = submissions.filter((s) => s.category === filters.category);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        submissions = submissions.filter(
          (s) =>
            s.uploaderName.toLowerCase().includes(searchLower) ||
            s.uploaderEmail.toLowerCase().includes(searchLower)
        );
      }
      if (filters?.startDate) {
        submissions = submissions.filter((s) => s.timestamp >= filters.startDate!);
      }
      if (filters?.endDate) {
        submissions = submissions.filter((s) => s.timestamp <= filters.endDate!);
      }

      return submissions;
    } catch (error) {
      logger.error('Failed to get submissions', error);
      throw new Error('Failed to retrieve submissions from database');
    }
  }

  async getSubmissionById(submissionId: string): Promise<Submission | null> {
    const submissions = await this.getSubmissions();
    return submissions.find((s) => s.submissionId === submissionId) || null;
  }

  async updateSubmission(
    submissionId: string,
    updates: Partial<Submission>
  ): Promise<Submission> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.CONTENT_SHEET_NAME);

      // Find the row
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:V`,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[0] === submissionId);

      if (rowIndex === -1) {
        throw new Error('Submission not found');
      }

      const currentRow = rows[rowIndex];
      const current: Submission = {
        submissionId: currentRow[0] || '',
        timestamp: currentRow[1] || '',
        uploaderName: currentRow[2] || '',
        uploaderEmail: currentRow[3] || '',
        uploaderPhone: currentRow[4] || null,
        fileDriveUrl: currentRow[5] || '',
        fileId: currentRow[6] || '',
        fileSizeMb: parseFloat(currentRow[7] || '0'),
        uploadDevice: (currentRow[8] || 'Unknown') as any,
        studio: currentRow[9] || '',
        category: currentRow[10] || '',
        description: currentRow[11] || null,
        sourceQrId: currentRow[12] || null,
        waiverAgreed: currentRow[13] === 'TRUE',
        waiverTimestamp: currentRow[14] || '',
        aiTags: this.parseJsonArray(currentRow[15]),
        duplicateDetected: currentRow[16] === 'TRUE',
        adminStartDate: currentRow[17] || null,
        adminEndDate: currentRow[18] || null,
        status: (currentRow[19] || 'New') as SubmissionStatus,
        adminNotes: currentRow[20] || null,
        archiveFlag: currentRow[21] === 'TRUE',
      };

      const updated = { ...current, ...updates };

      const updatedRow = [
        updated.submissionId,
        updated.timestamp,
        updated.uploaderName,
        updated.uploaderEmail,
        updated.uploaderPhone || '',
        updated.fileDriveUrl,
        updated.fileId,
        updated.fileSizeMb,
        updated.uploadDevice,
        updated.studio,
        updated.category,
        updated.description || '',
        updated.sourceQrId || '',
        updated.waiverAgreed,
        updated.waiverTimestamp,
        JSON.stringify(updated.aiTags),
        updated.duplicateDetected,
        updated.adminStartDate || '',
        updated.adminEndDate || '',
        updated.status,
        updated.adminNotes || '',
        updated.archiveFlag,
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex + 1}:V${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [updatedRow],
        },
      });

      logger.info('Submission updated', { submissionId });
      return updated;
    } catch (error) {
      logger.error('Failed to update submission', error);
      throw new Error('Failed to update submission');
    }
  }

  // Categories Operations
  async getCategories(): Promise<Category[]> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.CATEGORIES_SHEET_NAME);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:E`,
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return [];

      return rows.slice(1).map((row): Category => ({
        id: row[0] || '',
        name: row[1] || '',
        description: row[2] || null,
        isActive: row[3] === 'TRUE' || row[3] === true,
        createdAt: row[4] || '',
      }));
    } catch (error) {
      logger.error('Failed to get categories', error);
      throw new Error('Failed to retrieve categories');
    }
  }

  async appendCategory(category: Category): Promise<void> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.CATEGORIES_SHEET_NAME);

      const row = [
        category.id,
        category.name,
        category.description || '',
        category.isActive,
        category.createdAt,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:E`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row],
        },
      });

      logger.info('Category created', { categoryId: category.id });
    } catch (error) {
      logger.error('Failed to append category', error);
      throw new Error('Failed to create category');
    }
  }

  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<Category> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.CATEGORIES_SHEET_NAME);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:E`,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[0] === categoryId);

      if (rowIndex === -1) {
        throw new Error('Category not found');
      }

      const currentRow = rows[rowIndex];
      const current: Category = {
        id: currentRow[0],
        name: currentRow[1],
        description: currentRow[2] || null,
        isActive: currentRow[3] === 'TRUE',
        createdAt: currentRow[4],
      };

      const updated = { ...current, ...updates };

      const updatedRow = [
        updated.id,
        updated.name,
        updated.description || '',
        updated.isActive,
        updated.createdAt,
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex + 1}:E${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [updatedRow],
        },
      });

      logger.info('Category updated', { categoryId });
      return updated;
    } catch (error) {
      logger.error('Failed to update category', error);
      throw new Error('Failed to update category');
    }
  }

  // Admin User Operations
  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.ADMINS_SHEET_NAME);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:G`,
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return null;

      const adminRow = rows.slice(1).find((row) => row[1] === email);
      if (!adminRow) return null;

      return {
        id: adminRow[0],
        email: adminRow[1],
        role: adminRow[3] as AdminRole,
        isActive: adminRow[4] === 'TRUE' || adminRow[4] === true,
        createdAt: adminRow[5] || '',
        lastLogin: adminRow[6] || null,
      };
    } catch (error) {
      logger.error('Failed to get admin by email', error);
      return null;
    }
  }

  async getAdminPasswordHash(email: string): Promise<string | null> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.ADMINS_SHEET_NAME);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:C`,
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return null;

      const adminRow = rows.slice(1).find((row) => row[1] === email);
      if (!adminRow) return null;

      return adminRow[2] || null; // Password hash column
    } catch (error) {
      logger.error('Failed to get admin password hash', error);
      return null;
    }
  }

  async updateAdminLastLogin(email: string): Promise<void> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.ADMINS_SHEET_NAME);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:G`,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[1] === email);

      if (rowIndex === -1) return;

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!G${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[new Date().toISOString()]],
        },
      });

      logger.info('Admin last login updated', { email });
    } catch (error) {
      logger.error('Failed to update admin last login', error);
    }
  }

  async setPasswordResetToken(email: string, resetToken: string, expiresAt: string): Promise<void> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.ADMINS_SHEET_NAME);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:I`,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[1] === email);

      if (rowIndex === -1) {
        throw new Error('Admin not found');
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!H${rowIndex + 1}:I${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[resetToken, expiresAt]],
        },
      });

      logger.info('Password reset token set', { email });
    } catch (error) {
      logger.error('Failed to set password reset token', error);
      throw new Error('Failed to set password reset token');
    }
  }

  async getAdminByResetToken(resetToken: string): Promise<AdminUser | null> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.ADMINS_SHEET_NAME);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:I`,
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return null;

      const adminRow = rows.slice(1).find((row) => {
        const token = row[7]; // Column H (Reset_Token)
        const expiry = row[8]; // Column I (Token_Expiry)

        if (!token || token !== resetToken) return false;
        if (!expiry) return false;

        // Check if token is expired
        const expiryDate = new Date(expiry);
        const now = new Date();
        return expiryDate > now;
      });

      if (!adminRow) return null;

      return {
        id: adminRow[0],
        email: adminRow[1],
        role: adminRow[3] as AdminRole,
        isActive: adminRow[4] === 'TRUE' || adminRow[4] === true,
        createdAt: adminRow[5] || '',
        lastLogin: adminRow[6] || null,
      };
    } catch (error) {
      logger.error('Failed to get admin by reset token', error);
      return null;
    }
  }

  async clearPasswordResetToken(email: string): Promise<void> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.ADMINS_SHEET_NAME);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:I`,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[1] === email);

      if (rowIndex === -1) return;

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!H${rowIndex + 1}:I${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['', '']],
        },
      });

      logger.info('Password reset token cleared', { email });
    } catch (error) {
      logger.error('Failed to clear password reset token', error);
    }
  }

  async updateAdminPassword(email: string, newPasswordHash: string): Promise<void> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.ADMINS_SHEET_NAME);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:I`,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[1] === email);

      if (rowIndex === -1) {
        throw new Error('Admin not found');
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!C${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[newPasswordHash]],
        },
      });

      logger.info('Admin password updated', { email });
    } catch (error) {
      logger.error('Failed to update admin password', error);
      throw new Error('Failed to update admin password');
    }
  }

  // Audit Log Operations
  async appendAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.AUDIT_SHEET_NAME);

      const row = [
        entry.auditId,
        entry.timestamp,
        entry.adminEmail,
        entry.actionType,
        entry.targetId,
        entry.oldValue || '',
        entry.newValue || '',
        entry.notes || '',
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:H`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row],
        },
      });

      logger.debug('Audit log entry created', { auditId: entry.auditId });
    } catch (error) {
      logger.error('Failed to append audit log', error);
    }
  }

  // Configuration Operations
  async getConfig(): Promise<Config> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.CONFIG_SHEET_NAME);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:B`,
      });

      const rows = response.data.values || [];
      const configMap = new Map<string, string>();

      rows.slice(1).forEach((row) => {
        if (row[0] && row[1]) {
          configMap.set(row[0], row[1]);
        }
      });

      return {
        driveFolderId: configMap.get('DRIVE_FOLDER_ID') || env.DRIVE_FOLDER_ID,
        contentSheetId: configMap.get('CONTENT_SHEET_ID') || env.SPREADSHEET_ID,
        auditSheetId: configMap.get('AUDIT_SHEET_ID') || env.SPREADSHEET_ID,
        categoriesSheetId: configMap.get('CATEGORIES_SHEET_ID') || env.SPREADSHEET_ID,
        adminsSheetId: configMap.get('ADMINS_SHEET_ID') || env.SPREADSHEET_ID,
        waiverUrl: configMap.get('WAIVER_URL') || env.WAIVER_URL,
        defaultStartOffsetDays: parseInt(configMap.get('DEFAULT_START_OFFSET_DAYS') || '2'),
        defaultEndOffsetDays: parseInt(configMap.get('DEFAULT_END_OFFSET_DAYS') || '30'),
        maxFileSizeMb: parseInt(configMap.get('MAX_FILE_SIZE_MB') || '500'),
        allowedFileTypes: JSON.parse(
          configMap.get('ALLOWED_FILE_TYPES') || '["jpg","jpeg","png","heic","mp4","mov"]'
        ),
        rateLimitUploadsPerHour: parseInt(configMap.get('RATE_LIMIT_UPLOADS_PER_HOUR') || '5'),
        automationApiKey: configMap.get('AUTOMATION_API_KEY') || env.AUTOMATION_API_KEY,
      };
    } catch (error) {
      logger.error('Failed to get config', error);
      // Return defaults from env
      return {
        driveFolderId: env.DRIVE_FOLDER_ID,
        contentSheetId: env.SPREADSHEET_ID,
        auditSheetId: env.SPREADSHEET_ID,
        categoriesSheetId: env.SPREADSHEET_ID,
        adminsSheetId: env.SPREADSHEET_ID,
        waiverUrl: env.WAIVER_URL,
        defaultStartOffsetDays: 2,
        defaultEndOffsetDays: 30,
        maxFileSizeMb: 500,
        allowedFileTypes: ['.jpg', '.jpeg', '.png', '.heic', '.mp4', '.mov'],
        rateLimitUploadsPerHour: 5,
        automationApiKey: env.AUTOMATION_API_KEY,
      };
    }
  }

  async updateConfig(key: string, value: string): Promise<void> {
    try {
      const { sheets, spreadsheetId, sheetName } = await this.getSheet(env.CONFIG_SHEET_NAME);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:B`,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[0] === key);

      if (rowIndex === -1) {
        // Append new config entry
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${sheetName}!A:B`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[key, value]],
          },
        });
      } else {
        // Update existing config entry
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!B${rowIndex + 1}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[value]],
          },
        });
      }

      logger.info('Config updated', { key });
    } catch (error) {
      logger.error('Failed to update config', error);
      throw new Error('Failed to update configuration');
    }
  }

  // Studios Operations
  async getStudios(): Promise<Studio[]> {
    try {
      const { sheets, spreadsheetId } = await this.getSheet('Studios');

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Studios!A:H',
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) return [];

      return rows.slice(1).map((row): Studio => ({
        studioId: row[0] || '',
        name: row[1] || '',
        city: row[2] || '',
        state: row[3] || '',
        instagram: row[4] || null,
        facebook: row[5] || null,
        tiktok: row[6] || null,
        isActive: row[7] === 'TRUE' || row[7] === true,
      }));
    } catch (error) {
      logger.error('Failed to get studios', error);
      throw new Error('Failed to retrieve studios');
    }
  }

  async appendStudio(studio: Studio): Promise<void> {
    try {
      const { sheets, spreadsheetId } = await this.getSheet('Studios');

      const row = [
        studio.studioId,
        studio.name,
        studio.city,
        studio.state,
        studio.instagram || '',
        studio.facebook || '',
        studio.tiktok || '',
        studio.isActive,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Studios!A:H',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row],
        },
      });

      logger.info('Studio created', { studioId: studio.studioId });
    } catch (error) {
      logger.error('Failed to append studio', error);
      throw new Error('Failed to create studio');
    }
  }

  async updateStudio(studioId: string, updates: Partial<Studio>): Promise<Studio> {
    try {
      const { sheets, spreadsheetId } = await this.getSheet('Studios');

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Studios!A:H',
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[0] === studioId);

      if (rowIndex === -1) {
        throw new Error('Studio not found');
      }

      const currentRow = rows[rowIndex];
      const current: Studio = {
        studioId: currentRow[0],
        name: currentRow[1],
        city: currentRow[2],
        state: currentRow[3],
        instagram: currentRow[4] || null,
        facebook: currentRow[5] || null,
        tiktok: currentRow[6] || null,
        isActive: currentRow[7] === 'TRUE',
      };

      const updated = { ...current, ...updates };

      const updatedRow = [
        updated.studioId,
        updated.name,
        updated.city,
        updated.state,
        updated.instagram || '',
        updated.facebook || '',
        updated.tiktok || '',
        updated.isActive,
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Studios!A${rowIndex + 1}:H${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [updatedRow],
        },
      });

      logger.info('Studio updated', { studioId });
      return updated;
    } catch (error) {
      logger.error('Failed to update studio', error);
      throw new Error('Failed to update studio');
    }
  }

  private parseJsonArray(value: string): string[] {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

export const sheetsService = new SheetsService();
