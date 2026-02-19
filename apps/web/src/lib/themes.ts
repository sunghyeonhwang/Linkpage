import { THEME_PRESETS, getThemePreset } from '@linkpage/shared';
import type { ThemeOverrides } from '@linkpage/shared';

export { THEME_PRESETS, getThemePreset };

export interface ResolvedTheme {
  bg: string;
  gradient?: string;
  text: string;
  btnBg: string;
  btnText: string;
  btnStyle: 'filled' | 'outlined';
  radius: string;
  font: string;
}

/** hex 색상의 상대 휘도를 계산하여 밝으면 true 반환 */
function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length < 6) return true;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  // W3C 상대 휘도 공식
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

/** 배경색 기반으로 대비가 좋은 텍스트 색상 반환 */
export function getContrastTextColor(bgColor: string): string {
  return isLightColor(bgColor) ? '#1A1A2E' : '#FFFFFF';
}

const RADIUS_MAP: Record<string, string> = {
  none: '0px',
  sm: '6px',
  md: '8px',
  full: '9999px',
};

export function resolveTheme(presetId: string, overrides?: ThemeOverrides | null): ResolvedTheme {
  const preset = getThemePreset(presetId) || THEME_PRESETS[0];

  return {
    bg: overrides?.bgColor || preset.bgColor,
    gradient: overrides?.bgGradient || preset.bgGradient,
    text: overrides?.textColor || preset.textColor,
    btnBg: overrides?.btnBgColor || preset.btnBgColor,
    btnText: overrides?.btnTextColor || preset.btnTextColor,
    btnStyle: overrides?.btnStyle || preset.btnStyle,
    radius: RADIUS_MAP[overrides?.btnRadius || preset.btnRadius] || '8px',
    font: overrides?.font || preset.font || 'Pretendard',
  };
}

export function getBackgroundStyle(
  presetId: string,
  overrides?: ThemeOverrides | null,
  backgroundImageUrl?: string | null,
): React.CSSProperties {
  const theme = resolveTheme(presetId, overrides);

  if (backgroundImageUrl) {
    return {
      backgroundImage: `url(${backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  if (theme.gradient) {
    return { background: theme.gradient };
  }
  return { backgroundColor: theme.bg };
}

/** Desktop outer frame background - slightly darker than the theme bg (Linktree pattern) */
export function getFrameBackgroundStyle(
  presetId: string,
  overrides?: ThemeOverrides | null,
  backgroundImageUrl?: string | null,
): React.CSSProperties {
  if (backgroundImageUrl) {
    return {
      backgroundImage: `url(${backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  const theme = resolveTheme(presetId, overrides);

  if (theme.gradient) {
    return { background: theme.gradient };
  }
  return { backgroundColor: `color-mix(in srgb, ${theme.bg} 0%, black 100%)` };
}
