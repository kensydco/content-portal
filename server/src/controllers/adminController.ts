import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sheetsService } from '../services/sheetsService';
import { auditService } from '../services/auditService';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, SubmissionFilters, BulkActionRequest } from '../types';
import { logger } from '../utils/logger';

export async function getSubmissions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      startDate,
      endDate,
      search,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = req.query as any;

    const filters: SubmissionFilters = {
      status,
      category,
      startDate,
      endDate,
      search,
    };

    let submissions = await sheetsService.getSubmissions(filters);

    // Sorting
    submissions.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortBy) {
        case 'adminStartDate':
          aVal = a.adminStartDate || '';
          bVal = b.adminStartDate || '';
          break;
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        default: // timestamp
          aVal = a.timestamp;
          bVal = b.timestamp;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Pagination
    const total = submissions.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubmissions = submissions.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        submissions: paginatedSubmissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getSubmissionById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const submission = await sheetsService.getSubmissionById(id);

    if (!submission) {
      throw new AppError(404, 'NOT_FOUND', 'Submission not found');
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSubmission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = (req as AuthRequest).user!;

    const current = await sheetsService.getSubmissionById(id);

    if (!current) {
      throw new AppError(404, 'NOT_FOUND', 'Submission not found');
    }

    const updated = await sheetsService.updateSubmission(id, updates);

    // Audit logging
    if (updates.status && updates.status !== current.status) {
      await auditService.logStatusChange(user.email, id, current.status, updates.status);
    }

    if (updates.adminStartDate || updates.adminEndDate) {
      await auditService.logDateChange(
        user.email,
        id,
        {
          startDate: current.adminStartDate || undefined,
          endDate: current.adminEndDate || undefined,
        },
        {
          startDate: updates.adminStartDate || current.adminStartDate || undefined,
          endDate: updates.adminEndDate || current.adminEndDate || undefined,
        }
      );
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function bulkUpdateSubmissions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { submissionIds, action, data } = req.body as BulkActionRequest;
    const user = (req as AuthRequest).user!;

    const results: Array<{ submissionId: string; success: boolean; error?: string }> = [];
    let processed = 0;
    let failed = 0;

    for (const submissionId of submissionIds) {
      try {
        let updates: any = {};

        switch (action) {
          case 'approve':
            updates.status = 'Approved';
            break;
          case 'reject':
            updates.status = 'Rejected';
            break;
          case 'setDates':
            if (data?.adminStartDate) updates.adminStartDate = data.adminStartDate;
            if (data?.adminEndDate) updates.adminEndDate = data.adminEndDate;
            break;
          case 'archive':
            updates.archiveFlag = true;
            break;
        }

        await sheetsService.updateSubmission(submissionId, updates);
        results.push({ submissionId, success: true });
        processed++;
      } catch (error) {
        results.push({
          submissionId,
          success: false,
          error: (error as Error).message,
        });
        failed++;
      }
    }

    // Audit log
    await auditService.logBulkAction(user.email, action, submissionIds, data);

    logger.info('Bulk action completed', { action, processed, failed });

    res.status(200).json({
      success: true,
      data: {
        processed,
        failed,
        results,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await sheetsService.getCategories();

    res.status(200).json({
      success: true,
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, description } = req.body;
    const user = (req as AuthRequest).user!;

    // Check for duplicate name
    const existingCategories = await sheetsService.getCategories();
    const duplicate = existingCategories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      throw new AppError(409, 'DUPLICATE_NAME', 'Category name already exists');
    }

    const category = {
      id: uuidv4(),
      name,
      description: description || null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await sheetsService.appendCategory(category);
    await auditService.logCategoryCreate(user.email, category.id, name);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = (req as AuthRequest).user!;

    const categories = await sheetsService.getCategories();
    const current = categories.find((c) => c.id === id);

    if (!current) {
      throw new AppError(404, 'NOT_FOUND', 'Category not found');
    }

    // Check for duplicate name if name is being updated
    if (updates.name && updates.name !== current.name) {
      const duplicate = categories.find(
        (c) => c.name.toLowerCase() === updates.name.toLowerCase() && c.id !== id
      );

      if (duplicate) {
        throw new AppError(409, 'DUPLICATE_NAME', 'Category name already exists');
      }
    }

    const updated = await sheetsService.updateCategory(id, updates);
    await auditService.logCategoryUpdate(user.email, id, current, updates);

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const user = (req as AuthRequest).user!;

    // Soft delete by setting isActive to false
    await sheetsService.updateCategory(id, { isActive: false });
    await auditService.logCategoryUpdate(user.email, id, { isActive: true }, { isActive: false });

    res.status(200).json({
      success: true,
      data: {
        message: 'Category deactivated',
      },
    });
  } catch (error) {
    next(error);
  }
}
