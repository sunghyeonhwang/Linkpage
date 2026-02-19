import { describe, it, expect } from 'vitest';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,
  slugSchema,
  linkCreateSchema,
  linkUpdateSchema,
  linkReorderSchema,
} from '../constants/validation.js';

describe('signupSchema', () => {
  it('유효한 이메일과 비밀번호를 통과시킨다', () => {
    const result = signupSchema.safeParse({ email: 'test@example.com', password: '12345678' });
    expect(result.success).toBe(true);
  });

  it('잘못된 이메일을 거부한다', () => {
    const result = signupSchema.safeParse({ email: 'invalid', password: '12345678' });
    expect(result.success).toBe(false);
  });

  it('8자 미만 비밀번호를 거부한다', () => {
    const result = signupSchema.safeParse({ email: 'test@example.com', password: '1234567' });
    expect(result.success).toBe(false);
  });

  it('100자 초과 비밀번호를 거부한다', () => {
    const result = signupSchema.safeParse({ email: 'test@example.com', password: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('이메일이 없으면 거부한다', () => {
    const result = signupSchema.safeParse({ password: '12345678' });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('유효한 이메일과 비밀번호를 통과시킨다', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'any' });
    expect(result.success).toBe(true);
  });

  it('빈 비밀번호를 거부한다', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('유효한 이메일을 통과시킨다', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('잘못된 이메일을 거부한다', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'not-email' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('유효한 토큰과 비밀번호를 통과시킨다', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', password: '12345678' });
    expect(result.success).toBe(true);
  });

  it('빈 토큰을 거부한다', () => {
    const result = resetPasswordSchema.safeParse({ token: '', password: '12345678' });
    expect(result.success).toBe(false);
  });

  it('짧은 비밀번호를 거부한다', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc', password: '1234' });
    expect(result.success).toBe(false);
  });
});

describe('profileUpdateSchema', () => {
  it('모든 필드 선택적으로 통과시킨다', () => {
    const result = profileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('display_name만 있어도 통과시킨다', () => {
    const result = profileUpdateSchema.safeParse({ display_name: 'Test User' });
    expect(result.success).toBe(true);
  });

  it('50자 초과 display_name을 거부한다', () => {
    const result = profileUpdateSchema.safeParse({ display_name: 'a'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('200자 초과 bio를 거부한다', () => {
    const result = profileUpdateSchema.safeParse({ bio: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('null bio를 허용한다', () => {
    const result = profileUpdateSchema.safeParse({ bio: null });
    expect(result.success).toBe(true);
  });

  it('유효한 social_links를 통과시킨다', () => {
    const result = profileUpdateSchema.safeParse({
      social_links: [{ type: 'instagram', url: 'https://instagram.com/test' }],
    });
    expect(result.success).toBe(true);
  });

  it('잘못된 social_links URL을 거부한다', () => {
    const result = profileUpdateSchema.safeParse({
      social_links: [{ type: 'instagram', url: 'not-a-url' }],
    });
    expect(result.success).toBe(false);
  });

  it('theme_overrides를 통과시킨다', () => {
    const result = profileUpdateSchema.safeParse({
      theme_overrides: { bgColor: '#FF0000', btnStyle: 'filled', btnRadius: 'md' },
    });
    expect(result.success).toBe(true);
  });

  it('잘못된 btnStyle을 거부한다', () => {
    const result = profileUpdateSchema.safeParse({
      theme_overrides: { btnStyle: 'invalid' },
    });
    expect(result.success).toBe(false);
  });

  it('잘못된 btnRadius를 거부한다', () => {
    const result = profileUpdateSchema.safeParse({
      theme_overrides: { btnRadius: 'xl' },
    });
    expect(result.success).toBe(false);
  });
});

describe('slugSchema', () => {
  it('유효한 슬러그를 통과시킨다', () => {
    expect(slugSchema.safeParse({ slug: 'my-page' }).success).toBe(true);
    expect(slugSchema.safeParse({ slug: 'abc' }).success).toBe(true);
    expect(slugSchema.safeParse({ slug: 'test123' }).success).toBe(true);
  });

  it('3자 미만 슬러그를 거부한다', () => {
    expect(slugSchema.safeParse({ slug: 'ab' }).success).toBe(false);
  });

  it('30자 초과 슬러그를 거부한다', () => {
    expect(slugSchema.safeParse({ slug: 'a'.repeat(31) }).success).toBe(false);
  });

  it('대문자를 거부한다', () => {
    expect(slugSchema.safeParse({ slug: 'MyPage' }).success).toBe(false);
  });

  it('특수문자를 거부한다', () => {
    expect(slugSchema.safeParse({ slug: 'my_page' }).success).toBe(false);
    expect(slugSchema.safeParse({ slug: 'my page' }).success).toBe(false);
  });

  it('하이픈으로 시작하는 슬러그를 거부한다', () => {
    expect(slugSchema.safeParse({ slug: '-mypage' }).success).toBe(false);
  });

  it('하이픈으로 끝나는 슬러그를 거부한다', () => {
    expect(slugSchema.safeParse({ slug: 'mypage-' }).success).toBe(false);
  });
});

describe('linkCreateSchema', () => {
  it('유효한 링크를 통과시킨다', () => {
    const result = linkCreateSchema.safeParse({
      label: 'My Blog',
      url: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('빈 라벨을 거부한다', () => {
    const result = linkCreateSchema.safeParse({ label: '', url: 'https://example.com' });
    expect(result.success).toBe(false);
  });

  it('100자 초과 라벨을 거부한다', () => {
    const result = linkCreateSchema.safeParse({ label: 'a'.repeat(101), url: 'https://example.com' });
    expect(result.success).toBe(false);
  });

  it('잘못된 URL을 거부한다', () => {
    const result = linkCreateSchema.safeParse({ label: 'Test', url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('is_active 기본값은 true이다', () => {
    const result = linkCreateSchema.safeParse({ label: 'Test', url: 'https://example.com' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_active).toBe(true);
    }
  });

  it('선택적 필드를 허용한다', () => {
    const result = linkCreateSchema.safeParse({
      label: 'Test',
      url: 'https://example.com',
      description: 'A description',
      icon: 'globe',
      is_active: false,
    });
    expect(result.success).toBe(true);
  });
});

describe('linkUpdateSchema', () => {
  it('모든 필드가 선택적이다', () => {
    const result = linkUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('일부 필드만 업데이트할 수 있다', () => {
    const result = linkUpdateSchema.safeParse({ label: 'Updated' });
    expect(result.success).toBe(true);
  });
});

describe('linkReorderSchema', () => {
  it('유효한 재정렬 배열을 통과시킨다', () => {
    const result = linkReorderSchema.safeParse({
      links: [
        { id: '550e8400-e29b-41d4-a716-446655440000', sort_order: 0 },
        { id: '550e8400-e29b-41d4-a716-446655440001', sort_order: 1 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('UUID가 아닌 id를 거부한다', () => {
    const result = linkReorderSchema.safeParse({
      links: [{ id: 'not-uuid', sort_order: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('음수 sort_order를 거부한다', () => {
    const result = linkReorderSchema.safeParse({
      links: [{ id: '550e8400-e29b-41d4-a716-446655440000', sort_order: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it('소수 sort_order를 거부한다', () => {
    const result = linkReorderSchema.safeParse({
      links: [{ id: '550e8400-e29b-41d4-a716-446655440000', sort_order: 1.5 }],
    });
    expect(result.success).toBe(false);
  });

  it('빈 배열을 허용한다', () => {
    const result = linkReorderSchema.safeParse({ links: [] });
    expect(result.success).toBe(true);
  });
});
