// Enums
export type SubmissionStatus = 'New' | 'Approved' | 'Rejected';
export type AdminRole = 'SuperAdmin' | 'Editor' | 'Viewer';
export type UploadDevice = 'iOS' | 'Android' | 'Desktop' | 'Unknown';

// Core Types
export interface Submission {
  submissionId: string;
  timestamp: string;
  uploaderName: string;
  uploaderEmail: string;
  uploaderPhone: string | null;
  fileDriveUrl: string;
  fileId: string;
  fileSizeMb: number;
  uploadDevice: UploadDevice;
  studio: string;
  category: string;
  description: string | null;
  sourceQrId: string | null;
  waiverAgreed: boolean;
  waiverTimestamp: string;
  aiTags: string[];
  duplicateDetected: boolean;
  adminStartDate: string | null;
  adminEndDate: string | null;
  status: SubmissionStatus;
  adminNotes: string | null;
  archiveFlag: boolean;
  thumbnailUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Studio {
  studioId: string;
  name: string;
  city: string;
  state: string;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  isActive: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
}

export interface Config {
  driveFolderId: string;
  contentSheetId: string;
  auditSheetId: string;
  waiverUrl: string;
  defaultStartOffsetDays: number;
  defaultEndOffsetDays: number;
  maxFileSizeMb: number;
  allowedFileTypes: string[];
  rateLimitUploadsPerHour: number;
}

export interface PublicConfig {
  waiverUrl: string;
  maxFileSizeMb: number;
  allowedFileTypes: string[];
}

// Request/Response Types
export interface UploadRequest {
  file: File;
  uploaderName: string;
  uploaderEmail: string;
  uploaderPhone?: string;
  studio: string;
  category: string;
  description?: string;
  sourceQrId?: string;
  waiverAgreed: boolean;
  waiverTimestamp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: AdminUser;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  resetToken: string;
  message: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubmissionFilters {
  status?: SubmissionStatus;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'timestamp' | 'adminStartDate' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface BulkActionRequest {
  submissionIds: string[];
  action: 'approve' | 'reject' | 'setDates' | 'archive';
  data?: {
    adminStartDate?: string;
    adminEndDate?: string;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
