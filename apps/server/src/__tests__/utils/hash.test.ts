import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../utils/hash.js';

describe('hashPassword', () => {
  it('해시된 문자열을 반환한다', async () => {
    const hash = await hashPassword('password123');
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe('password123');
  });

  it('bcrypt 형식의 해시를 반환한다', async () => {
    const hash = await hashPassword('password123');
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it('같은 비밀번호라도 다른 해시를 생성한다', async () => {
    const hash1 = await hashPassword('password123');
    const hash2 = await hashPassword('password123');
    expect(hash1).not.toBe(hash2);
  });
});

describe('comparePassword', () => {
  it('일치하는 비밀번호에 true를 반환한다', async () => {
    const hash = await hashPassword('password123');
    const result = await comparePassword('password123', hash);
    expect(result).toBe(true);
  });

  it('불일치하는 비밀번호에 false를 반환한다', async () => {
    const hash = await hashPassword('password123');
    const result = await comparePassword('wrong-password', hash);
    expect(result).toBe(false);
  });
});
