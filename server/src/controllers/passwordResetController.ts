import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { authService } from '../services/authService';
import { sheetsService } from '../services/sheetsService';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Token expires in 1 hour
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function requestPasswordReset(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body;

    // Check if admin exists
    const admin = await sheetsService.getAdminByEmail(email);

    if (!admin) {
      // Don't reveal if email exists or not (security best practice)
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset token has been generated.',
      });
      return;
    }

    if (!admin.isActive) {
      throw new AppError(403, 'ACCOUNT_INACTIVE', 'This account is inactive');
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS).toISOString();

    // Store token in database
    await sheetsService.setPasswordResetToken(email, resetToken, expiresAt);

    logger.info('Password reset token generated', { email });

    // In production, you would send this via email
    // For now, return it in the response
    res.status(200).json({
      success: true,
      data: {
        resetToken,
        message: 'Reset token generated. In production, this would be emailed to you.',
        expiresIn: '1 hour',
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { resetToken, newPassword } = req.body;

    // Validate password strength
    if (newPassword.length < 8) {
      throw new AppError(400, 'WEAK_PASSWORD', 'Password must be at least 8 characters');
    }

    // Find admin with this reset token
    const admin = await sheetsService.getAdminByResetToken(resetToken);

    if (!admin) {
      throw new AppError(400, 'INVALID_TOKEN', 'Invalid or expired reset token');
    }

    // Hash new password
    const newPasswordHash = await authService.hashPassword(newPassword);

    // Update password and clear reset token
    await sheetsService.updateAdminPassword(admin.email, newPasswordHash);
    await sheetsService.clearPasswordResetToken(admin.email);

    logger.info('Password reset successful', { email: admin.email });

    res.status(200).json({
      success: true,
      data: {
        message: 'Password has been reset successfully. You can now login with your new password.',
      },
    });
  } catch (error) {
    next(error);
  }
}
