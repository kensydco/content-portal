import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AppError } from './errorHandler';
import { AuthRequest } from '../types';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = authService.verifyToken(token);

    if (!payload) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token');
    }

    // Attach user info to request
    (req as AuthRequest).user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      // Try Bearer token as fallback
      authenticate(req, res, next);
      return;
    }

    // For automation endpoint, check API key
    const { env } = require('../utils/env');
    if (apiKey !== env.AUTOMATION_API_KEY) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid API key');
    }

    next();
  } catch (error) {
    next(error);
  }
}
