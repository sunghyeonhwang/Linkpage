import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { signToken, verifyToken } from '../../utils/jwt.js';

describe('signToken', () => {
  it('유효한 JWT 문자열을 반환한다', () => {
    const token = signToken({ userId: 'user-1', email: 'test@example.com' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('페이로드에 userId와 email을 포함한다', () => {
    const token = signToken({ userId: 'user-1', email: 'test@example.com' });
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded.userId).toBe('user-1');
    expect(decoded.email).toBe('test@example.com');
  });

  it('exp 클레임이 포함된다', () => {
    const token = signToken({ userId: 'user-1', email: 'test@example.com' });
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded.exp).toBeDefined();
  });
});

describe('verifyToken', () => {
  it('유효한 토큰의 페이로드를 반환한다', () => {
    const token = signToken({ userId: 'user-1', email: 'test@example.com' });
    const payload = verifyToken(token);
    expect(payload.userId).toBe('user-1');
    expect(payload.email).toBe('test@example.com');
  });

  it('변조된 토큰에 대해 에러를 던진다', () => {
    const token = signToken({ userId: 'user-1', email: 'test@example.com' });
    const tampered = token.slice(0, -5) + 'xxxxx';
    expect(() => verifyToken(tampered)).toThrow();
  });

  it('잘못된 형식의 토큰에 대해 에러를 던진다', () => {
    expect(() => verifyToken('not-a-jwt')).toThrow();
  });

  it('다른 시크릿으로 서명된 토큰을 거부한다', () => {
    const token = jwt.sign({ userId: 'user-1', email: 'test@example.com' }, 'wrong-secret');
    expect(() => verifyToken(token)).toThrow();
  });
});
