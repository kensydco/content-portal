import { z } from 'zod';

export const uploadSchema = z.object({
  uploaderName: z.string().min(2).max(100),
  uploaderEmail: z.string().email(),
  uploaderPhone: z.string().regex(/^(\+?1?\d{10,14})?$/).optional(),
  category: z.string().min(1).max(50),
  description: z.string().max(280).optional(),
  sourceQrId: z.string().max(50).optional(),
  waiverAgreed: z.literal('true'),
  waiverTimestamp: z.string().datetime(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const updateSubmissionSchema = z.object({
  status: z.enum(['New', 'Approved', 'Rejected']).optional(),
  adminStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adminEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adminNotes: z.string().max(1000).optional(),
  aiTags: z.array(z.string()).optional(),
  archiveFlag: z.boolean().optional(),
});

export const bulkActionSchema = z.object({
  submissionIds: z.array(z.string().uuid()).min(1).max(100),
  action: z.enum(['approve', 'reject', 'setDates', 'archive']),
  data: z.object({
    adminStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    adminEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

export const configSchema = z.object({
  driveFolderId: z.string().optional(),
  contentSheetId: z.string().optional(),
  auditSheetId: z.string().optional(),
  waiverUrl: z.string().url().optional(),
  defaultStartOffsetDays: z.number().int().min(0).max(365).optional(),
  defaultEndOffsetDays: z.number().int().min(0).max(365).optional(),
});

export const submissionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['New', 'Approved', 'Rejected']).optional(),
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['timestamp', 'adminStartDate', 'category']).default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const automationQuerySchema = z.object({
  status: z.literal('Approved'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
