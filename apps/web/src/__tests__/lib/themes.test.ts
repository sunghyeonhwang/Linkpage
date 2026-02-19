import { describe, it, expect } from 'vitest';
import { resolveTheme, getBackgroundStyle } from '../../lib/themes';

describe('resolveTheme', () => {
  it('프리셋 ID로 테마를 해석한다', () => {
    const theme = resolveTheme('clean-white');
    expect(theme.bg).toBe('#FFFFFF');
    expect(theme.text).toBe('#1A1A2E');
    expect(theme.btnStyle).toBe('filled');
    expect(theme.radius).toBe('8px'); // md
    expect(theme.font).toBe('Pretendard');
  });

  it('그라디언트가 있는 프리셋을 해석한다', () => {
    const theme = resolveTheme('ocean-breeze');
    expect(theme.gradient).toContain('linear-gradient');
    expect(theme.radius).toBe('9999px'); // full
  });

  it('오버라이드가 프리셋을 덮어쓴다', () => {
    const theme = resolveTheme('clean-white', {
      bgColor: '#FF0000',
      textColor: '#00FF00',
      btnStyle: 'outlined',
      btnRadius: 'full',
    });
    expect(theme.bg).toBe('#FF0000');
    expect(theme.text).toBe('#00FF00');
    expect(theme.btnStyle).toBe('outlined');
    expect(theme.radius).toBe('9999px');
  });

  it('오버라이드가 없는 필드는 프리셋 값을 사용한다', () => {
    const theme = resolveTheme('clean-white', { bgColor: '#FF0000' });
    expect(theme.bg).toBe('#FF0000');
    expect(theme.text).toBe('#1A1A2E'); // 프리셋 원래 값
  });

  it('미존재 프리셋 ID는 첫 번째 프리셋으로 폴백한다', () => {
    const theme = resolveTheme('nonexistent');
    expect(theme.bg).toBe('#FFFFFF'); // clean-white (첫 번째)
  });

  it('null 오버라이드를 허용한다', () => {
    const theme = resolveTheme('clean-white', null);
    expect(theme.bg).toBe('#FFFFFF');
  });
});

describe('getBackgroundStyle', () => {
  it('그라디언트가 있으면 background 속성을 반환한다', () => {
    const style = getBackgroundStyle('ocean-breeze');
    expect(style).toHaveProperty('background');
    expect(style).not.toHaveProperty('backgroundColor');
  });

  it('그라디언트가 없으면 backgroundColor를 반환한다', () => {
    const style = getBackgroundStyle('clean-white');
    expect(style).toHaveProperty('backgroundColor');
    expect(style).not.toHaveProperty('background');
  });
});
