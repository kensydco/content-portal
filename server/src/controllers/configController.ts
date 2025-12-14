import { Request, Response, NextFunction } from 'express';
import { sheetsService } from '../services/sheetsService';
import { auditService } from '../services/auditService';
import { AuthRequest, PublicConfig } from '../types';

export async function getPublicConfig(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const config = await sheetsService.getConfig();

    // Ensure all essential file types are included
    const essentialTypes = ['.jpg', '.jpeg', '.png', '.heic', '.mp4', '.mov'];
    const allTypes = [...new Set([...config.allowedFileTypes, ...essentialTypes])];

    const publicConfig: PublicConfig = {
      waiverUrl: config.waiverUrl,
      maxFileSizeMb: config.maxFileSizeMb,
      allowedFileTypes: allTypes,
    };

    res.status(200).json({
      success: true,
      data: publicConfig,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicCategories(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await sheetsService.getCategories();
    const activeCategories = categories.filter((c) => c.isActive);

    res.status(200).json({
      success: true,
      data: { categories: activeCategories },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicStudios(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studios = await sheetsService.getStudios();
    const activeStudios = studios
      .filter((s) => s.isActive)
      .map((s) => ({
        id: s.studioId,
        name: s.name,
        city: s.city,
        state: s.state,
      }));

    res.status(200).json({
      success: true,
      data: { studios: activeStudios },
    });
  } catch (error) {
    next(error);
  }
}

export async function getFullConfig(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const config = await sheetsService.getConfig();

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateConfig(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const updates = req.body;
    const user = (req as AuthRequest).user!;

    const currentConfig = await sheetsService.getConfig();

    // Update each config value
    for (const [key, value] of Object.entries(updates)) {
      const configKey = key
        .replace(/([A-Z])/g, '_$1')
        .toUpperCase()
        .replace(/^_/, '');

      const oldValue = (currentConfig as any)[key];
      await sheetsService.updateConfig(configKey, String(value));
      await auditService.logConfigUpdate(user.email, key, oldValue, value);
    }

    const updatedConfig = await sheetsService.getConfig();

    res.status(200).json({
      success: true,
      data: updatedConfig,
    });
  } catch (error) {
    next(error);
  }
}
