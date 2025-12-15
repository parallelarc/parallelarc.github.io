import About from "./commands/About";
import Clear from "./commands/Clear";
import Echo from "./commands/Echo";
import Education from "./commands/Education";
import Contact from "./commands/Contact";
import Help from "./commands/Help";
import Welcome from "./commands/Welcome";
import History from "./commands/History";
import Projects from "./commands/Projects";
import Themes from "./commands/Themes";
import Hi from "./commands/Hi";
import ExportCmd from "./commands/Export";
import Env from "./commands/Env";
import { OutputContainer, UsageDiv } from "./styles/Output.styled";
import { termContext } from "./Terminal";
import { useContext } from "react";

type Props = {
  index: number;
  cmd: string;
};

const Output: React.FC<Props> = ({ index, cmd }) => {
  const { arg } = useContext(termContext);

  const specialCmds = ["projects", "themes", "echo", "hi", "hello", "export"];

  // return 'Usage: <cmd>' if command arg is not valid
  // eg: about tt
  if (!specialCmds.includes(cmd) && arg.length > 0)
    return <UsageDiv data-testid="usage-output">Usage: {cmd}</UsageDiv>;

  if ((cmd === "hi" || cmd === "hello") && arg.length > 0)
    return <UsageDiv data-testid="usage-output">Usage: {cmd}</UsageDiv>;

  return (
    <OutputContainer data-testid={index === 0 ? "latest-output" : null}>
      {
        {
          about: <About />,
          clear: <Clear />,
          echo: <Echo />,
          education: <Education />,
          contact: <Contact />,
          help: <Help />,
          history: <History />,
          projects: <Projects />,
          themes: <Themes />,
          hi: <Hi />,
          hello: <Hi />,
          export: <ExportCmd />,
          env: <Env />,
          welcome: <Welcome />,
        }[cmd]
      }
    </OutputContainer>
  );
};

export default Output;
