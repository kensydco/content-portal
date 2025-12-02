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

    const publicConfig: PublicConfig = {
      waiverUrl: config.waiverUrl,
      maxFileSizeMb: config.maxFileSizeMb,
      allowedFileTypes: config.allowedFileTypes,
    };

    res.status(200).json({
      success: true,
      data: publicConfig,
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
