import { describe, it, expect } from 'vitest';
import { THEME_PRESETS, DEFAULT_THEME_ID, getThemePreset } from '../constants/themes.js';

describe('THEME_PRESETS', () => {
  it('8개의 프리셋이 정의되어 있다', () => {
    expect(THEME_PRESETS).toHaveLength(8);
  });

  it('모든 프리셋이 필수 필드를 가진다', () => {
    for (const preset of THEME_PRESETS) {
      expect(preset).toHaveProperty('id');
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('bgColor');
      expect(preset).toHaveProperty('textColor');
      expect(preset).toHaveProperty('btnBgColor');
      expect(preset).toHaveProperty('btnTextColor');
      expect(preset).toHaveProperty('btnStyle');
      expect(preset).toHaveProperty('btnRadius');
    }
  });

  it('btnStyle은 filled 또는 outlined이다', () => {
    for (const preset of THEME_PRESETS) {
      expect(['filled', 'outlined']).toContain(preset.btnStyle);
    }
  });

  it('btnRadius는 none, sm, md, full 중 하나이다', () => {
    for (const preset of THEME_PRESETS) {
      expect(['none', 'sm', 'md', 'full']).toContain(preset.btnRadius);
    }
  });

  it('모든 id가 고유하다', () => {
    const ids = THEME_PRESETS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('DEFAULT_THEME_ID', () => {
  it('clean-white이다', () => {
    expect(DEFAULT_THEME_ID).toBe('clean-white');
  });

  it('실제 프리셋에 존재하는 ID이다', () => {
    expect(THEME_PRESETS.some((t) => t.id === DEFAULT_THEME_ID)).toBe(true);
  });
});

describe('getThemePreset', () => {
  it('존재하는 ID로 프리셋을 반환한다', () => {
    const preset = getThemePreset('clean-white');
    expect(preset).toBeDefined();
    expect(preset!.id).toBe('clean-white');
    expect(preset!.name).toBe('Clean White');
  });

  it('각 프리셋 ID로 올바른 프리셋을 반환한다', () => {
    const expectedIds = [
      'clean-white', 'midnight-dark', 'ocean-breeze', 'sunset-glow',
      'forest-green', 'lavender-dream', 'neon-night', 'soft-coral',
    ];
    for (const id of expectedIds) {
      const preset = getThemePreset(id);
      expect(preset).toBeDefined();
      expect(preset!.id).toBe(id);
    }
  });

  it('존재하지 않는 ID로 undefined를 반환한다', () => {
    expect(getThemePreset('nonexistent')).toBeUndefined();
  });

  it('빈 문자열로 undefined를 반환한다', () => {
    expect(getThemePreset('')).toBeUndefined();
  });

  it('bgGradient이 있는 프리셋을 올바르게 반환한다', () => {
    const ocean = getThemePreset('ocean-breeze');
    expect(ocean).toBeDefined();
    expect(ocean!.bgGradient).toBeDefined();
    expect(ocean!.bgGradient).toContain('linear-gradient');
  });
});
