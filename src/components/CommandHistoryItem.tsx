import { commandRegistry } from "../core/CommandRegistry";
import Output from "./Output";
import { termContext } from "../contexts/TerminalContext";
import { Empty, CommandBlock } from "./styles/Terminal.styled";
import { HistoryPrompt } from "./styles/TerminalInfo.styled";
import { OutputContainer } from "./styles/Output.styled";

type CommandHistoryItemProps = {
  cmdH: string;
  mode?: "command" | "ai";
  entryId?: string;
  index: number;
  dismissMessage?: string;
};

function CommandHistoryItem({
  cmdH,
  mode,
  entryId,
  index,
  dismissMessage,
}: CommandHistoryItemProps) {
  const resolved = commandRegistry.resolveInput(cmdH);
  const normalizedCommand = mode === "ai" ? "ai" : resolved.commandName;
  const args = mode === "ai" ? [cmdH] : resolved.args;
  const validCommand = commandRegistry.get(normalizedCommand);

  const contextValue = { arg: args, index, entryId, isLatest: index === 0 };

  return (
    <div>
      <CommandBlock>
        <HistoryPrompt>❯</HistoryPrompt>
        <span data-testid="input-command">{cmdH}</span>
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
