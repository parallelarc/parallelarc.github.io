import { useMemo } from "react";
import Output from "./Output";
import TermInfo from "./TermInfo";
import { termContext, commands } from "./Terminal";
import { CmdNotFound, Empty, MobileBr, MobileSpan } from "./styles/Terminal.styled";

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
      <div>
        <TermInfo />
        <MobileBr />
        <MobileSpan>&#62;</MobileSpan>
        <span data-testid="input-command">{cmdH}</span>
      </div>
      {validCommand ? (
        <termContext.Provider value={contextValue}>
          <Output index={index} cmd={normalizedCommand} />
        </termContext.Provider>
      ) : cmdH === "" ? (
        <Empty />
      ) : (
        <CmdNotFound data-testid={`not-found-${index}`}>
          command not found: {cmdH}
        </CmdNotFound>
      )}
    </div>
  );
}

export default CommandHistoryItem;
