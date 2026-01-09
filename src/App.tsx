import { createContext, useCallback, useEffect, useState } from "react";
import type { DefaultTheme } from "styled-components";
import { ThemeProvider } from "styled-components";
import { useTheme } from "./hooks/useTheme";
import GlobalStyle from "./components/styles/GlobalStyle";
import Terminal from "./components/Terminal";

type ThemeSwitcher = (theme: DefaultTheme) => void;

export const themeContext = createContext<ThemeSwitcher | null>(null);

function App() {
  const { theme, themeLoaded, setMode } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  // Prevent default arrow key scrolling
  useEffect(() => {
    const handleArrowKeys = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp" || e.code === "ArrowDown") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleArrowKeys, false);
    return () => window.removeEventListener("keydown", handleArrowKeys);
  }, []);

  // Sync theme when loaded
  useEffect(() => {
    setSelectedTheme(theme);
  }, [themeLoaded, theme]);

  // Update meta tag colors when theme changes
  useEffect(() => {
    const themeColor = theme.colors?.body;
    if (!themeColor) return;

    document
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", themeColor);
    document
      .querySelector("meta[name='msapplication-TileColor']")
      ?.setAttribute("content", themeColor);
    document
      .querySelector("link[rel='mask-icon']")
      ?.setAttribute("color", themeColor);
  }, [selectedTheme, theme]);

  const themeSwitcher = useCallback<ThemeSwitcher>(
    (newTheme) => {
      setSelectedTheme(newTheme);
      setMode(newTheme);
    },
    [setMode]
  );

  return (
    <>
      <h1 className="sr-only">Foxiv&apos;s terminal portfolio</h1>
      {themeLoaded && (
        <ThemeProvider theme={selectedTheme}>
          <GlobalStyle />
          <themeContext.Provider value={themeSwitcher}>
            <Terminal />
          </themeContext.Provider>
        </ThemeProvider>
      )}
    </>
  );
}

export default App;
