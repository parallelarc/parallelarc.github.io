import { create } from "zustand";
import { DefaultTheme } from "styled-components";
import { getFromLS } from "../utils/storage";

import themes from "../components/styles/themes";

type ThemeName = keyof typeof themes;

interface ThemeState {
  theme: DefaultTheme;
  themeLoaded: boolean;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>(set => ({
  theme: themes.dark,
  themeLoaded: false,

  initTheme: () => {
    const localThemeName = getFromLS("tsn-theme") as ThemeName;
    if (localThemeName && themes[localThemeName]) {
      set({ theme: themes[localThemeName] });
    }
    set({ themeLoaded: true });
  },
}));
