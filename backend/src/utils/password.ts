import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { logger } from '@/utils/logger';

/**
 * Password utility for hashing and validation
 */
export class PasswordUtil {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hash password with bcryptjs
   */
  static async hash(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, this.SALT_ROUNDS);
      logger.debug('✓ Password hashed');
      return hash;
    } catch (error) {
      logger.error('Failed to hash password', { error });
      throw error;
    }
  }

  /**
   * Compare password with hash
   */
  static async compare(password: string, hash: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      logger.debug(`Password comparison result: ${isMatch ? 'match' : 'no match'}`);
      return isMatch;
    } catch (error) {
      logger.error('Failed to compare password', { error });
      throw error;
    }
  }

  /**
   * Validate password strength
   * Requires:
   * - Minimum 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character
   */
  static validateStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate random password
   */
  static generateRandom(length: number = 16): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';

    // Ensure password has required character types
    const charTypes = [
      'abcdefghijklmnopqrstuvwxyz', // lowercase
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // uppercase
      '0123456789', // number
      '!@#$%^&*()_+-=[]{}|;:,.<>?', // special
    ];

    // Add one character from each required type
    for (const charType of charTypes) {
      password += charType.charAt(Math.floor(Math.random() * charType.length));
    }

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Shuffle password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Generate password reset token
   */
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash reset token (for storing in DB)
   */
  static hashResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Compare reset token with hash
   */
  static compareResetToken(token: string, hash: string): boolean {
    return this.hashResetToken(token) === hash;
  }

  /**
   * Generate OTP (One-Time Password) for 2FA
   */
  static generateOTP(length: number = 6): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }

  /**
   * Check if password needs to be reset (e.g., after password breach)
   */
  static shouldResetPassword(lastResetDate: Date | null): boolean {
    if (!lastResetDate) {
      return true;
    }

    // Force reset every 90 days
    const daysSinceReset = Math.floor(
      (Date.now() - new Date(lastResetDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceReset > 90;
  }
}

export default PasswordUtil;
