import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { driveService } from '../services/driveService';
import { sheetsService } from '../services/sheetsService';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Submission, UploadDevice } from '../types';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'video/mp4',
  'video/quicktime',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.mp4', '.mov'];

function detectDevice(userAgent: string): UploadDevice {
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('mobile')) return 'Android'; // Generic mobile
  return 'Desktop';
}

export async function uploadContent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'No files uploaded');
    }

    if (files.length > 5) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Maximum 5 files allowed per upload');
    }

    // Calculate total file size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 500 * 1024 * 1024;
    if (totalSize > maxTotalSize) {
      throw new AppError(400, 'FILE_TOO_LARGE', 'Total file size exceeds 500MB limit');
    }

    // Validate each file type and individual size
    for (const file of files) {
      const fileExt = '.' + file.originalname.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExt) && !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new AppError(
          400,
          'INVALID_FILE_TYPE',
          `File type not allowed for ${file.originalname}. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
        );
      }
    }

    const {
      uploaderName,
      uploaderEmail,
      uploaderPhone,
      studio,
      category,
      description,
      adminStartDate,
      adminEndDate,
      sourceQrId,
      waiverAgreed,
      waiverTimestamp,
    } = req.body;

    // Validate waiver
    if (waiverAgreed !== 'true') {
      throw new AppError(400, 'MISSING_WAIVER', 'Waiver agreement is required');
    }

    // Verify category exists
    const categories = await sheetsService.getCategories();
    const activeCategories = categories.filter((c) => c.isActive);
    const categoryExists = activeCategories.some((c) => c.name === category);

    if (!categoryExists) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid category selected');
    }

    // Detect device
    const uploadDevice = detectDevice(req.headers['user-agent'] || '');

    // Process each file
    const uploadResults = [];

    for (const file of files) {
      const submissionId = uuidv4();
      const fileName = `${submissionId}_${file.originalname}`;

      // Upload to Cloud Storage
      logger.info('Uploading file to Cloud Storage', { submissionId, fileName });
      const driveResult = await driveService.uploadFile(file.buffer, fileName, file.mimetype);

      // Get thumbnail if available
      const thumbnailUrl = await driveService.getFileThumbnail(driveResult.fileId);

      // Create submission record
      const submission: Submission = {
        submissionId,
        timestamp: new Date().toISOString(),
        uploaderName,
        uploaderEmail,
        uploaderPhone: uploaderPhone || null,
        fileDriveUrl: driveResult.webViewLink,
        fileId: driveResult.fileId,
        fileSizeMb: parseFloat((driveResult.size / (1024 * 1024)).toFixed(2)),
        uploadDevice,
        studio,
        category,
        description: description || null,
        sourceQrId: sourceQrId || null,
        waiverAgreed: true,
        waiverTimestamp,
        aiTags: [], // Can be populated by future AI processing
        duplicateDetected: false, // Can be implemented with hash checking
        adminStartDate: adminStartDate || null,
        adminEndDate: adminEndDate || null,
        status: 'New',
        adminNotes: null,
        archiveFlag: false,
        thumbnailUrl: thumbnailUrl || undefined,
      };

      // Save to Sheets
      logger.info('Saving submission to Sheets', { submissionId });
      await sheetsService.appendSubmission(submission);

      uploadResults.push({
        submissionId,
        fileUrl: driveResult.webViewLink,
        fileName: file.originalname,
      });
    }

    logger.info('All uploads completed successfully', { count: uploadResults.length });

    res.status(201).json({
      success: true,
      data: {
        uploads: uploadResults,
        message: `${uploadResults.length} file(s) uploaded successfully`,
      },
    });
  } catch (error) {
    next(error);
  }
}
