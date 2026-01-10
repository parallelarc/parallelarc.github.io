import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

export function useTheme() {
  const { theme, themeLoaded, setMode, initTheme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    if (!themeLoaded) {
      initTheme();
    }
  }, [themeLoaded, initTheme]);

  return { theme, themeLoaded, setMode };
}
