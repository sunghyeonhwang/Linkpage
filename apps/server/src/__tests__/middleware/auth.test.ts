import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { signToken } from '../../utils/jwt.js';
import { AppError } from '../../middleware/error.js';

function createMockReq(authHeader?: string): Request {
  return {
    headers: {
      authorization: authHeader,
    },
  } as unknown as Request;
}

const mockRes = {} as Response;

describe('authMiddleware', () => {
  it('유효한 Bearer 토큰으로 userId와 userEmail을 설정한다', () => {
    const token = signToken({ userId: 'user-1', email: 'test@example.com' });
    const req = createMockReq(`Bearer ${token}`);
    const next = vi.fn();

    authMiddleware(req, mockRes, next);

    expect(req.userId).toBe('user-1');
    expect(req.userEmail).toBe('test@example.com');
    expect(next).toHaveBeenCalledOnce();
  });

  it('Authorization 헤더가 없으면 401 에러를 던진다', () => {
    const req = createMockReq(undefined);
    const next = vi.fn();

    expect(() => authMiddleware(req, mockRes, next)).toThrow(AppError);
    try {
      authMiddleware(req, mockRes, next);
    } catch (err) {
      expect((err as AppError).statusCode).toBe(401);
      expect((err as AppError).code).toBe('UNAUTHORIZED');
    }
  });

  it('Bearer 접두사가 없으면 401 에러를 던진다', () => {
    const req = createMockReq('Basic some-token');
    const next = vi.fn();

    expect(() => authMiddleware(req, mockRes, next)).toThrow(AppError);
  });

  it('잘못된 토큰이면 401 에러를 던진다', () => {
    const req = createMockReq('Bearer invalid-token');
    const next = vi.fn();

    expect(() => authMiddleware(req, mockRes, next)).toThrow(AppError);
    try {
      authMiddleware(req, mockRes, next);
    } catch (err) {
      expect((err as AppError).statusCode).toBe(401);
      expect((err as AppError).code).toBe('INVALID_TOKEN');
    }
  });

  it('빈 Bearer 토큰이면 401 에러를 던진다', () => {
    const req = createMockReq('Bearer ');
    const next = vi.fn();

    expect(() => authMiddleware(req, mockRes, next)).toThrow(AppError);
  });
});
