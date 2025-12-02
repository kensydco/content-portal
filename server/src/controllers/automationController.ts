import { Request, Response, NextFunction } from 'express';
import { sheetsService } from '../services/sheetsService';
import { logger } from '../utils/logger';

export async function getApprovedContent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { startDate, endDate, category, limit = 50 } = req.query as any;

    // Get all approved submissions
    const submissions = await sheetsService.getSubmissions({ status: 'Approved' });

    let filtered = submissions;

    // Filter by date range (adminStartDate/adminEndDate)
    if (startDate) {
      filtered = filtered.filter(
        (s) => s.adminStartDate && s.adminStartDate >= startDate
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (s) => s.adminEndDate && s.adminEndDate <= endDate
      );
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter((s) => s.category === category);
    }

    // Exclude archived
    filtered = filtered.filter((s) => !s.archiveFlag);

    // Apply limit
    const limited = filtered.slice(0, parseInt(limit));

    // Map to automation-friendly format
    const content = limited.map((s) => ({
      submissionId: s.submissionId,
      fileId: s.fileId,
      fileDriveUrl: s.fileDriveUrl,
      category: s.category,
      description: s.description,
      aiTags: s.aiTags,
      adminStartDate: s.adminStartDate,
      adminEndDate: s.adminEndDate,
    }));

    logger.info('Automation content fetched', { count: content.length });

    res.status(200).json({
      success: true,
      data: {
        content,
        count: content.length,
      },
    });
  } catch (error) {
    next(error);
  }
}
