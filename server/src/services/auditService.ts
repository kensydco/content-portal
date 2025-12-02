import { v4 as uuidv4 } from 'uuid';
import { sheetsService } from './sheetsService';
import { AuditLogEntry, ActionType } from '../types';
import { logger } from '../utils/logger';

export class AuditService {
  async log(
    adminEmail: string,
    actionType: ActionType,
    targetId: string,
    oldValue?: unknown,
    newValue?: unknown,
    notes?: string
  ): Promise<void> {
    try {
      const entry: AuditLogEntry = {
        auditId: uuidv4(),
        timestamp: new Date().toISOString(),
        adminEmail,
        actionType,
        targetId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        notes: notes || null,
      };

      await sheetsService.appendAuditLog(entry);
    } catch (error) {
      logger.error('Failed to create audit log', error);
      // Don't throw - audit logging should not break the main operation
    }
  }

  async logStatusChange(
    adminEmail: string,
    submissionId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    await this.log(
      adminEmail,
      'STATUS_CHANGE',
      submissionId,
      { status: oldStatus },
      { status: newStatus }
    );
  }

  async logDateChange(
    adminEmail: string,
    submissionId: string,
    oldDates: { startDate?: string; endDate?: string },
    newDates: { startDate?: string; endDate?: string }
  ): Promise<void> {
    await this.log(adminEmail, 'DATE_CHANGE', submissionId, oldDates, newDates);
  }

  async logConfigUpdate(
    adminEmail: string,
    configKey: string,
    oldValue: unknown,
    newValue: unknown
  ): Promise<void> {
    await this.log(adminEmail, 'CONFIG_UPDATE', `CONFIG:${configKey}`, oldValue, newValue);
  }

  async logCategoryCreate(adminEmail: string, categoryId: string, categoryName: string): Promise<void> {
    await this.log(
      adminEmail,
      'CATEGORY_CREATE',
      categoryId,
      null,
      { name: categoryName }
    );
  }

  async logCategoryUpdate(
    adminEmail: string,
    categoryId: string,
    oldValue: unknown,
    newValue: unknown
  ): Promise<void> {
    await this.log(adminEmail, 'CATEGORY_UPDATE', categoryId, oldValue, newValue);
  }

  async logBulkAction(
    adminEmail: string,
    action: string,
    submissionIds: string[],
    details?: unknown
  ): Promise<void> {
    await this.log(
      adminEmail,
      'BULK_ACTION',
      'BULK',
      { action, count: submissionIds.length },
      { submissionIds, details }
    );
  }
}

export const auditService = new AuditService();
