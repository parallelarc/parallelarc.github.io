import { useMemo } from "react";
import Output from "./Output";
import { termContext, commands } from "./Terminal";
import { Empty, MobileBr, MobileSpan, CommandBlock } from "./styles/Terminal.styled";
import { HistoryPrompt } from "./styles/TerminalInfo.styled";
import { OutputContainer } from "./styles/Output.styled";

type CommandHistoryItemProps = {
  cmdH: string;
  index: number;
  cmdHistory: string[];
  rerender: boolean;
  clearHistory?: () => void;
};

function CommandHistoryItem({
  cmdH,
  index,
  cmdHistory,
  rerender,
  clearHistory,
}: CommandHistoryItemProps) {
  const commandArray = cmdH.trim().split(" ");
  const normalizedCommand = commandArray[0].toLowerCase().replace(/^\//, "");
  const validCommand = commands.find(({ cmd }) => cmd === normalizedCommand);

  const contextValue = useMemo(
    () => ({
      arg: commandArray.slice(1),
      history: cmdHistory,
      rerender,
      index,
      clearHistory,
    }),
    [commandArray, cmdHistory, rerender, index, clearHistory]
  );

  return (
    <div>
      <CommandBlock>
        <HistoryPrompt>❯</HistoryPrompt>
        <MobileBr />
        <MobileSpan>&#62;</MobileSpan>
        <span data-testid="input-command">{cmdH}</span>
      </CommandBlock>
      {validCommand ? (
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
