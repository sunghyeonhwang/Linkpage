import crypto from 'crypto';
import { userRepository } from '../repositories/userRepository.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import { AppError } from '../middleware/error.js';
import type { AuthResponse } from '@linkpage/shared';

export const authService = {
  async signup(email: string, password: string): Promise<AuthResponse> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError(409, '이미 등록된 이메일입니다', 'EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(password);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const user = await userRepository.create(email, passwordHash, verifyToken);

    await sendVerificationEmail(email, verifyToken);

    const token = signToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_verified,
      },
    };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(401, '이메일 또는 비밀번호가 올바르지 않습니다', 'INVALID_CREDENTIALS');
    }

    const valid = await comparePassword(password, user.password_hash!);
    if (!valid) {
      throw new AppError(401, '이메일 또는 비밀번호가 올바르지 않습니다', 'INVALID_CREDENTIALS');
    }

    const token = signToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_verified,
      },
    };
  },

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, '사용자를 찾을 수 없습니다', 'USER_NOT_FOUND');
    }
    return {
      id: user.id,
      email: user.email,
      email_verified: user.email_verified,
    };
  },

  async verifyEmail(token: string) {
    const user = await userRepository.verifyEmail(token);
    if (!user) {
      throw new AppError(400, '유효하지 않은 인증 토큰입니다', 'INVALID_TOKEN');
    }
    return { message: '이메일이 인증되었습니다' };
  },

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    // Don't reveal whether the email exists
    if (!user) return { message: '비밀번호 재설정 이메일을 발송했습니다' };

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await userRepository.setPasswordResetToken(email, token, expires);
    await sendPasswordResetEmail(email, token);

    return { message: '비밀번호 재설정 이메일을 발송했습니다' };
  },

  async resetPassword(token: string, password: string) {
    const passwordHash = await hashPassword(password);
    const user = await userRepository.resetPassword(token, passwordHash);
    if (!user) {
      throw new AppError(400, '유효하지 않거나 만료된 토큰입니다', 'INVALID_TOKEN');
    }
    return { message: '비밀번호가 재설정되었습니다' };
  },
};
