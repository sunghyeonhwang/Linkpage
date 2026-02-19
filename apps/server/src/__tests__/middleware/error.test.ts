import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler } from '../../middleware/error.js';

function createMockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

const mockReq = {} as Request;
const mockNext = vi.fn() as NextFunction;

describe('AppError', () => {
  it('statusCode, message, code를 가진다', () => {
    const err = new AppError(400, 'Bad request', 'BAD_REQUEST');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad request');
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.name).toBe('AppError');
  });

  it('Error를 상속한다', () => {
    const err = new AppError(500, 'Server error');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('code는 선택적이다', () => {
    const err = new AppError(404, 'Not found');
    expect(err.code).toBeUndefined();
  });
});

describe('errorHandler', () => {
  it('AppError를 구조화된 JSON으로 응답한다', () => {
    const res = createMockRes();
    const err = new AppError(400, 'Invalid input', 'VALIDATION_ERROR');

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Invalid input', code: 'VALIDATION_ERROR' },
    });
  });

  it('401 에러를 올바르게 처리한다', () => {
    const res = createMockRes();
    const err = new AppError(401, '인증이 필요합니다', 'UNAUTHORIZED');

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: '인증이 필요합니다', code: 'UNAUTHORIZED' },
    });
  });

  it('일반 Error를 500으로 응답한다', () => {
    const res = createMockRes();
    const err = new Error('Something broke');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
    });

    consoleSpy.mockRestore();
  });

  it('일반 Error를 콘솔에 로깅한다', () => {
    const res = createMockRes();
    const err = new Error('Unexpected');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, mockReq, res, mockNext);

    expect(consoleSpy).toHaveBeenCalledWith('Unhandled error:', err);
    consoleSpy.mockRestore();
  });
});
