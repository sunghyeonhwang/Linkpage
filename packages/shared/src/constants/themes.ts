import type { ThemePreset } from '../types/index.js';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'clean-white',
    name: 'Clean White',
    bgColor: '#FFFFFF',
    textColor: '#1A1A2E',
    btnBgColor: '#1A1A2E',
    btnTextColor: '#FFFFFF',
    btnStyle: 'filled',
    btnRadius: 'md',
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Dark',
    bgColor: '#0F172A',
    textColor: '#F1F5F9',
    btnBgColor: '#1E293B',
    btnTextColor: '#F1F5F9',
    btnStyle: 'filled',
    btnRadius: 'md',
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    bgColor: '#1E3A5F',
    bgGradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    textColor: '#FFFFFF',
    btnBgColor: 'rgba(255,255,255,0.15)',
    btnTextColor: '#FFFFFF',
    btnStyle: 'filled',
    btnRadius: 'full',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    bgColor: '#FF6B35',
    bgGradient: 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
    textColor: '#FFFFFF',
    btnBgColor: 'rgba(255,255,255,0.2)',
    btnTextColor: '#FFFFFF',
    btnStyle: 'filled',
    btnRadius: 'full',
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    bgColor: '#F0FDF4',
    textColor: '#14532D',
    btnBgColor: '#16A34A',
    btnTextColor: '#FFFFFF',
    btnStyle: 'filled',
    btnRadius: 'sm',
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    bgColor: '#F5F3FF',
    textColor: '#4C1D95',
    btnBgColor: '#FFFFFF',
    btnTextColor: '#4C1D95',
    btnStyle: 'outlined',
    btnRadius: 'md',
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    bgColor: '#0A0A0A',
    textColor: '#D4FF00',
    btnBgColor: 'transparent',
    btnTextColor: '#D4FF00',
    btnStyle: 'outlined',
    btnRadius: 'none',
  },
  {
    id: 'soft-coral',
    name: 'Soft Coral',
    bgColor: '#FFF1F2',
    textColor: '#881337',
    btnBgColor: '#FB7185',
    btnTextColor: '#FFFFFF',
    btnStyle: 'filled',
    btnRadius: 'full',
  },
];

export const DEFAULT_THEME_ID = 'clean-white';

export function getThemePreset(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((t) => t.id === id);
}
