import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await authService.validateCredentials(email, password);

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = authService.generateToken(user);

    // Token expires in 8 hours by default
    const expiresIn = 8 * 60 * 60; // seconds

    res.status(200).json({
      success: true,
      data: {
        token,
        expiresIn,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Since we're using JWT, logout is handled client-side by removing the token
    // This endpoint exists for consistency and future extensions (e.g., token blacklisting)

    res.status(200).json({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = (req as AuthRequest).user;

    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}
