import { useContext } from "react";
import { commandRegistry } from "../core/CommandRegistry";
import { OutputContainer, UsageDiv } from "./styles/Output.styled";
import { termContext } from "../contexts/TerminalContext";

type Props = {
  index: number;
  cmd: string;
};

function Output({ index, cmd }: Props) {
  const { arg } = useContext(termContext);

  // Get command from registry first to check if it accepts arguments
  const command = commandRegistry.get(cmd);

  // Show usage message if command doesn't accept arguments
  if (arg.length > 0 && !command?.acceptsArgs) {
    return <UsageDiv data-testid="usage-output">Usage: {cmd}</UsageDiv>;
  }

  if (!command) {
    return (
      <OutputContainer data-testid={`not-found-${index}`}>
        command not found: {cmd}
      </OutputContainer>
    );
  }

  const CommandComponent = command.component;

  return (
    <OutputContainer data-testid={index === 0 ? "latest-output" : undefined}>
      <CommandComponent />
    </OutputContainer>
  );
}

export default Output;
