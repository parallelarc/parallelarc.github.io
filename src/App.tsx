import { useEffect } from "react";
import { ThemeProvider } from "styled-components";
import { useTheme } from "./hooks/useTheme";
import GlobalStyle from "./components/styles/GlobalStyle";
import Portfolio from "./components/Portfolio";

function App() {
  const { theme, themeLoaded } = useTheme();

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
  }, [theme]);

  return (
    <>
      <h1 className="sr-only">Foxiv&apos;s terminal portfolio</h1>
      {themeLoaded && (
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <Portfolio />
        </ThemeProvider>
      )}
    </>
  );
}

export default App;
