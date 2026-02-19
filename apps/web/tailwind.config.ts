import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--theme-bg)',
          text: 'var(--theme-text)',
          'btn-bg': 'var(--theme-btn-bg)',
          'btn-text': 'var(--theme-btn-text)',
          accent: 'var(--theme-accent)',
        },
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--theme-font, Pretendard)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        theme: 'var(--theme-radius)',
      },
      maxWidth: {
        mobile: '580px',
      },
    },
  },
  plugins: [],
};

export default config;
