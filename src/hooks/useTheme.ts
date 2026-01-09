import { useEffect, useState } from "react";
import themes from "../components/styles/themes";
import { setToLS, getFromLS } from "../utils/storage";
import { DefaultTheme } from "styled-components";

export function useTheme() {
  const [theme, setTheme] = useState<DefaultTheme>(themes.dark);
  const [themeLoaded, setThemeLoaded] = useState(false);

  function setMode(mode: DefaultTheme): void {
    setToLS("tsn-theme", mode.name);
    setTheme(mode);
  }

  useEffect(() => {
    const localThemeName = getFromLS("tsn-theme");
    if (localThemeName && themes[localThemeName]) {
      setTheme(themes[localThemeName]);
    }
    setThemeLoaded(true);
  }, []);

  return { theme, themeLoaded, setMode };
}
