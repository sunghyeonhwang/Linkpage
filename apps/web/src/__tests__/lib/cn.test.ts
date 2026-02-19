import { describe, it, expect } from 'vitest';
import { cn } from '../../lib/cn';

describe('cn', () => {
  it('여러 클래스를 결합한다', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('조건부 클래스를 처리한다', () => {
    expect(cn('base', true && 'active', false && 'hidden')).toBe('base active');
  });

  it('Tailwind 충돌을 해결한다', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('undefined와 null을 무시한다', () => {
    expect(cn('base', undefined, null)).toBe('base');
  });
});
