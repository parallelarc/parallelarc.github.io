import React, { useContext } from "react";
import { OutputContainer, UsageDiv } from "./styles/Output.styled";
import { termContext } from "./Terminal";

// Import existing command components
import About from "../commands/about/index";
import Clear from "../commands/clear/index";
import Education from "../commands/education/index";
import Contact from "../commands/contact/index";
import Welcome from "../commands/welcome/index";
import Projects from "../commands/projects/index";
import Themes from "../commands/themes/index";
import Blog from "../commands/blog/index";

// Legacy command components mapping (will be replaced by registry in Phase 3)
const LEGACY_COMMAND_COMPONENTS = {
  about: About,
  clear: Clear,
  education: Education,
  contact: Contact,
  projects: Projects,
  themes: Themes,
  welcome: Welcome,
  blog: Blog,
} as const;

// Commands that accept arguments
const COMMANDS_WITH_ARGS = ["projects", "themes"] as const;

type Props = {
  index: number;
  cmd: string;
};

function Output({ index, cmd }: Props) {
  const { arg } = useContext(termContext);

  // Show usage message if command doesn't accept arguments
  if (arg.length > 0 && !COMMANDS_WITH_ARGS.includes(cmd as any)) {
    return <UsageDiv data-testid="usage-output">Usage: {cmd}</UsageDiv>;
  }

  const CommandComponent = LEGACY_COMMAND_COMPONENTS[cmd as keyof typeof LEGACY_COMMAND_COMPONENTS];

  return (
    <OutputContainer data-testid={index === 0 ? "latest-output" : undefined}>
      {CommandComponent && <CommandComponent />}
    </OutputContainer>
  );
}

// Memoize: only re-render when index or cmd changes
export default React.memo(Output, (prevProps, nextProps) => {
  return prevProps.index === nextProps.index && prevProps.cmd === nextProps.cmd;
});
