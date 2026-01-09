import React from "react";
import About from "./commands/About";
import Clear from "./commands/Clear";
import Education from "./commands/Education";
import Contact from "./commands/Contact";
import Welcome from "./commands/Welcome";
import Projects from "./commands/Projects";
import Themes from "./commands/Themes";
import Blog from "./commands/Blog";
import { OutputContainer, UsageDiv } from "./styles/Output.styled";
import { termContext } from "./Terminal";
import { useContext } from "react";

type Props = {
  index: number;
  cmd: string;
};

const Output: React.FC<Props> = ({ index, cmd }) => {
  const { arg } = useContext(termContext);
  const commandsWithArgsAllowed = ["/projects", "/themes"];

  // return 'Usage: <cmd>' if the command should not receive arguments
  if (arg.length > 0 && !commandsWithArgsAllowed.includes(cmd)) {
    return <UsageDiv data-testid="usage-output">Usage: {cmd}</UsageDiv>;
  }

  return (
    <OutputContainer data-testid={index === 0 ? "latest-output" : null}>
      {
        {
          "/about": <About />,
          "/clear": <Clear />,
          "/education": <Education />,
          "/contact": <Contact />,
          "/projects": <Projects />,
          "/themes": <Themes />,
          "/welcome": <Welcome />,
          "/blog": <Blog />,
        }[cmd]
      }
    </OutputContainer>
  );
};

// 使用React.memo优化，只有当index或cmd改变时才重新渲染
export default React.memo(Output, (prevProps, nextProps) => {
  return prevProps.index === nextProps.index && prevProps.cmd === nextProps.cmd;
});
