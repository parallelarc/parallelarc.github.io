import { useContext, useEffect } from "react";
import { themeContext } from "../../App";
import { Wrapper } from "../../components/styles/Output.styled";
import { ThemeSpan, ThemesWrapper } from "../../components/styles/Commands.styled";
import {
  checkThemeSwitch,
  getCurrentCmdArry,
  isArgInvalid,
} from "../../utils/funcs";
import { termContext } from "../../components/Terminal";
import theme from "../../components/styles/themes";
import Usage from "../../components/Usage";

const myThemes = Object.keys(theme) as string[];

function Themes() {
  const { arg, history, rerender } = useContext(termContext);
  const themeSwitcher = useContext(themeContext);

  const currentCommand = getCurrentCmdArry(history);

  useEffect(() => {
    if (checkThemeSwitch(rerender, currentCommand, myThemes)) {
      themeSwitcher?.(theme[currentCommand[2]]);
    }
  }, [arg, rerender, currentCommand, themeSwitcher]);

  if (arg.length > 0) {
    return isArgInvalid(arg, "set", myThemes) ? <Usage /> : null;
  }

  return (
    <Wrapper data-testid="themes">
      <ThemesWrapper>
        {myThemes.map((myTheme) => (
          <ThemeSpan key={myTheme}>{myTheme}</ThemeSpan>
        ))}
      </ThemesWrapper>
      <Usage marginY />
    </Wrapper>
  );
}

export default Themes;
