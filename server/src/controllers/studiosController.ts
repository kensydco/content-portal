import { Request, Response, NextFunction } from 'express';
import { sheetsService } from '../services/sheetsService';
import { auditService } from '../services/auditService';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export async function getPublicStudios(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studios = await sheetsService.getStudios();
    const activeStudios = studios.filter((s) => s.isActive);

    res.status(200).json({
      success: true,
      data: {
        studios: activeStudios.map((s) => ({
          id: s.studioId,
          name: s.name,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudios(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studios = await sheetsService.getStudios();

    res.status(200).json({
      success: true,
      data: {
        studios,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createStudio(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { studioId, name, city, state, instagram, facebook, tiktok } = req.body;
    const user = (req as AuthRequest).user!;

    // Check for duplicate ID
    const existingStudios = await sheetsService.getStudios();
    const duplicate = existingStudios.find((s) => s.studioId === studioId);

    if (duplicate) {
      throw new AppError(409, 'DUPLICATE_ID', 'Studio ID already exists');
    }

    const studio = {
      studioId,
      name,
      city,
      state,
      instagram: instagram || null,
      facebook: facebook || null,
      tiktok: tiktok || null,
      isActive: true,
    };

    await sheetsService.appendStudio(studio);
    await auditService.log(
      user.email,
      'CATEGORY_CREATE',
      studioId,
      null,
      { name, city, state }
    );

    res.status(201).json({
      success: true,
      data: studio,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStudio(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = (req as AuthRequest).user!;

    const studios = await sheetsService.getStudios();
    const current = studios.find((s) => s.studioId === id);

    if (!current) {
      throw new AppError(404, 'NOT_FOUND', 'Studio not found');
    }

    const updated = await sheetsService.updateStudio(id, updates);
    await auditService.log(user.email, 'CATEGORY_UPDATE', id, current, updates);

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
