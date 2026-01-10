import { create } from 'zustand';
import { DefaultTheme } from 'styled-components';
import { getFromLS, setToLS } from '../utils/storage';

// Import themes - will be moved to config later
import themes from '../components/styles/themes';

type ThemeName = keyof typeof themes;

type SetState<T> = (
  partial:
    | Partial<T>
    | ((state: T) => Partial<T>),
  replace?: boolean
) => void;

interface ThemeState {
  theme: DefaultTheme;
  themeLoaded: boolean;
  setMode: (mode: DefaultTheme) => void;
  setThemeByName: (name: ThemeName) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set: SetState<ThemeState>) => ({
  theme: themes.dark,
  themeLoaded: false,

  setMode: (mode: DefaultTheme) => {
    setToLS('tsn-theme', mode.name);
    set({ theme: mode });
  },

  setThemeByName: (name: ThemeName) => {
    const theme = themes[name];
    if (theme) {
      setToLS('tsn-theme', name as string);
      set({ theme });
    }
  },

  initTheme: () => {
    const localThemeName = getFromLS('tsn-theme') as ThemeName;
    if (localThemeName && themes[localThemeName]) {
      set({ theme: themes[localThemeName] });
    }
    set({ themeLoaded: true });
  },
}));
