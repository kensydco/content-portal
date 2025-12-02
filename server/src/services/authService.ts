import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sheetsService } from './sheetsService';
import { env } from '../utils/env';
import { logger } from '../utils/logger';
import { AdminRole } from '../types';

export interface TokenPayload {
  id: string;
  email: string;
  role: AdminRole;
}

export class AuthService {
  async validateCredentials(email: string, password: string): Promise<TokenPayload | null> {
    try {
      const admin = await sheetsService.getAdminByEmail(email);

      if (!admin || !admin.isActive) {
        logger.warn('Login attempt for inactive or non-existent user', { email });
        return null;
      }

      const passwordHash = await sheetsService.getAdminPasswordHash(email);

      if (!passwordHash) {
        logger.warn('No password hash found for user', { email });
        return null;
      }

      const isValid = await bcrypt.compare(password, passwordHash);

      if (!isValid) {
        logger.warn('Invalid password attempt', { email });
        return null;
      }

      // Update last login
      await sheetsService.updateAdminLastLogin(email);

      logger.info('Successful login', { email, role: admin.role });

      return {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      };
    } catch (error) {
      logger.error('Error validating credentials', error);
      return null;
    }
  }

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      logger.warn('Invalid token', { error: (error as Error).message });
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}

export const authService = new AuthService();
