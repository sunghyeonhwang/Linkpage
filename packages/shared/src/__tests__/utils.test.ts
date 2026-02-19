import { describe, it, expect } from 'vitest';
import { generateSlug, isValidUrl, sanitizeUrl, escapeHtml } from '../utils/index.js';

describe('generateSlug', () => {
  it('8자 길이의 문자열을 반환한다', () => {
    const slug = generateSlug();
    expect(slug).toHaveLength(8);
  });

  it('소문자 알파벳과 숫자로만 구성된다', () => {
    const slug = generateSlug();
    expect(slug).toMatch(/^[a-z0-9]{8}$/);
  });

  it('매 호출마다 고유한 값을 반환한다', () => {
    const slugs = new Set(Array.from({ length: 100 }, () => generateSlug()));
    expect(slugs.size).toBe(100);
  });
});

describe('isValidUrl', () => {
  it('http URL은 유효하다', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('https URL은 유효하다', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('ftp URL은 무효하다', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false);
  });

  it('프로토콜이 없으면 무효하다', () => {
    expect(isValidUrl('example.com')).toBe(false);
  });

  it('빈 문자열은 무효하다', () => {
    expect(isValidUrl('')).toBe(false);
  });

  it('잘못된 형식은 무효하다', () => {
    expect(isValidUrl('not a url')).toBe(false);
  });
});

describe('sanitizeUrl', () => {
  it('프로토콜이 없으면 https://를 추가한다', () => {
    expect(sanitizeUrl('example.com')).toBe('https://example.com');
  });

  it('http://가 있으면 그대로 반환한다', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('https://가 있으면 그대로 반환한다', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('앞뒤 공백을 제거한다', () => {
    expect(sanitizeUrl('  example.com  ')).toBe('https://example.com');
  });
});

describe('escapeHtml', () => {
  it('& 를 &amp;로 이스케이프한다', () => {
    expect(escapeHtml('a&b')).toBe('a&amp;b');
  });

  it('< 를 &lt;로 이스케이프한다', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
  });

  it('" 를 &quot;로 이스케이프한다', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it("' 를 &#039;로 이스케이프한다", () => {
    expect(escapeHtml("it's")).toBe("it&#039;s");
  });

  it('모든 특수문자를 한번에 이스케이프한다', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
  });

  it('특수문자가 없으면 그대로 반환한다', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});
