import { useState, useEffect, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'linkpage-landing-theme';

export function useLandingTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as ThemeMode) || 'system';
  });

  const isDark = useIsDark(mode);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    return () => {
      root.classList.remove('dark');
    };
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  return { isDark, mode, toggle };
}

function useIsDark(mode: ThemeMode): boolean {
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return systemDark;
}
