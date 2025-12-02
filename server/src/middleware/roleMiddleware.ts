import { Request, Response, NextFunction } from 'express';
import { AdminRole, AuthRequest } from '../types';
import { AppError } from './errorHandler';

const roleHierarchy: Record<AdminRole, number> = {
  Viewer: 1,
  Editor: 2,
  SuperAdmin: 3,
};

export function requireRole(minimumRole: AdminRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthRequest).user;

      if (!user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const userLevel = roleHierarchy[user.role];
      const requiredLevel = roleHierarchy[minimumRole];

      if (userLevel < requiredLevel) {
        throw new AppError(
          403,
          'FORBIDDEN',
          `This action requires ${minimumRole} role or higher`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Convenience middlewares
export const requireViewer = requireRole('Viewer');
export const requireEditor = requireRole('Editor');
export const requireSuperAdmin = requireRole('SuperAdmin');
