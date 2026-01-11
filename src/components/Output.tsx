import React, { useContext, lazy, Suspense, useMemo } from "react";
import { commandRegistry } from "../core/CommandRegistry";
import { OutputContainer, UsageDiv } from "./styles/Output.styled";
import { termContext } from "./Terminal";

// Loading fallback for lazy-loaded components
const LoadingOutput = () => (
  <OutputContainer data-testid="loading-output">Loading...</OutputContainer>
);

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

  // Memoize lazy component to avoid recreating on every render
  // This prevents Suspense from showing fallback unnecessarily
  const CommandComponent = useMemo(
    () => lazy(command.component),
    [command]
  );

  return (
    <OutputContainer data-testid={index === 0 ? "latest-output" : undefined}>
      <Suspense fallback={<LoadingOutput />}>
        <CommandComponent />
      </Suspense>
    </OutputContainer>
  );
}

// Memoize: only re-render when index or cmd changes
export default React.memo(Output, (prevProps, nextProps) => {
  return prevProps.index === nextProps.index && prevProps.cmd === nextProps.cmd;
});
