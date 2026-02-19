import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.js';
import { AppError } from '../../middleware/error.js';

const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
});

function createMockReq(body: unknown): Request {
  return { body } as Request;
}

const mockRes = {} as Response;

describe('validate', () => {
  it('유효한 body일 때 next()를 호출한다', () => {
    const next = vi.fn();
    const middleware = validate(testSchema);
    middleware(createMockReq({ name: 'John', age: 25 }), mockRes, next);
    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it('유효한 body를 파싱된 값으로 대체한다', () => {
    const next = vi.fn();
    const middleware = validate(testSchema);
    const req = createMockReq({ name: 'John', age: 25, extra: 'ignored' });
    middleware(req, mockRes, next);
    expect(req.body).toEqual({ name: 'John', age: 25 });
    expect(req.body.extra).toBeUndefined();
  });

  it('무효한 body일 때 AppError를 던진다', () => {
    const next = vi.fn();
    const middleware = validate(testSchema);
    expect(() => {
      middleware(createMockReq({ name: '', age: -1 }), mockRes, next);
    }).toThrow(AppError);
    expect(next).not.toHaveBeenCalled();
  });

  it('AppError의 statusCode가 400이다', () => {
    const next = vi.fn();
    const middleware = validate(testSchema);
    try {
      middleware(createMockReq({ name: '' }), mockRes, next);
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).code).toBe('VALIDATION_ERROR');
    }
  });

  it('Zod 에러 메시지를 결합한다', () => {
    const next = vi.fn();
    const middleware = validate(testSchema);
    try {
      middleware(createMockReq({}), mockRes, next);
    } catch (err) {
      expect((err as AppError).message).toContain(',');
    }
  });
});
