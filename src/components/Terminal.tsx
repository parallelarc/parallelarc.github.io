import { useRef } from "react";
import { useTerminalStore } from "../stores/terminalStore";
import { useGlobalFocus } from "../hooks/useGlobalFocus";
import CommandHistoryItem from "./CommandHistoryItem";
import TerminalComposer from "./TerminalComposer";
import { Wrapper } from "./styles/Terminal.styled";

function Terminal({
  embedded = false,
  touchMode = false,
}: {
  embedded?: boolean;
  touchMode?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const cmdHistory = useTerminalStore(s => s.history);
  const interactiveMode = useTerminalStore(s => s.interactiveMode);

  useGlobalFocus({ containerRef, inputRef });

  return (
    <Wrapper
      $embedded={embedded}
      data-testid="terminal-wrapper"
      ref={containerRef}
    >
      {!interactiveMode.active && (
        <TerminalComposer inputRef={inputRef} touchMode={touchMode} />
      )}

      {cmdHistory.map((entry, index) => (
        <CommandHistoryItem
          key={entry.id}
          cmdH={entry.command}
          mode={entry.mode}
          entryId={entry.id}
          index={index}
          dismissMessage={entry.dismissMessage}
        />
      ))}
    </Wrapper>
  );
}

export default Terminal;
