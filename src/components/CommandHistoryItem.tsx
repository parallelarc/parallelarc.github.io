import { useMemo } from "react";
import { commandRegistry } from "../core/CommandRegistry";
import Output from "./Output";
import { termContext } from "./Terminal";
import { Empty, MobileBr, MobileSpan, CommandBlock } from "./styles/Terminal.styled";
import { HistoryPrompt } from "./styles/TerminalInfo.styled";
import { OutputContainer } from "./styles/Output.styled";
import type { CommandHistoryEntry } from "../stores/terminalStore";

type CommandHistoryItemProps = {
  cmdH: string;
  displayCommand?: string;
  entryId?: string;
  index: number;
  cmdHistory: CommandHistoryEntry[];
  rerender: boolean;
  clearHistory?: () => void;
  removeFromHistory?: (index: number) => void;
  setDismissMessage?: (index: number, message: string) => void;
  dismissMessage?: string;
};

function CommandHistoryItem({
  cmdH,
  displayCommand,
  entryId,
  index,
  cmdHistory,
  rerender,
  clearHistory,
  removeFromHistory,
  setDismissMessage,
  dismissMessage,
}: CommandHistoryItemProps) {
  const commandArray = cmdH.trim().split(" ");
  const normalizedCommand = commandArray[0].toLowerCase().replace(/^\//, "");
  const validCommand = commandRegistry.get(normalizedCommand);

  const contextValue = useMemo(
    () => ({
      arg: commandArray.slice(1),
      history: cmdHistory.map(e => e.command),
      rerender,
      index,
      entryId,
      isLatest: index === 0,
      clearHistory,
      removeFromHistory,
      setDismissMessage,
    }),
    [commandArray, cmdHistory, rerender, index, entryId, clearHistory, removeFromHistory, setDismissMessage]
  );

  return (
    <div>
      <CommandBlock>
        <HistoryPrompt>❯</HistoryPrompt>
        <MobileBr />
        <MobileSpan>&#62;</MobileSpan>
        <span data-testid="input-command">{displayCommand ?? cmdH}</span>
      </CommandBlock>
      {dismissMessage ? (
        <OutputContainer>{dismissMessage}</OutputContainer>
      ) : validCommand ? (
        <termContext.Provider value={contextValue}>
          <Output index={index} cmd={normalizedCommand} />
        </termContext.Provider>
      ) : cmdH === "" ? (
        <Empty />
      ) : (
        <OutputContainer data-testid={`not-found-${index}`}>
          command not found: {cmdH}
        </OutputContainer>
      )}
    </div>
  );
}

export default CommandHistoryItem;
