import React, { useMemo } from "react";
import _ from "lodash";
import Output from "./Output";
import TermInfo from "./TermInfo";
import { termContext, commands } from "./Terminal";
import { CmdNotFound, Empty, MobileBr, MobileSpan } from "./styles/Terminal.styled";

type CommandHistoryItemProps = {
  cmdH: string;
  index: number;
  cmdHistory: string[];
  rerender: boolean;
};

const CommandHistoryItem: React.FC<CommandHistoryItemProps> = ({
  cmdH,
  index,
  cmdHistory,
  rerender,
}) => {
  const commandArray = useMemo(() => _.split(_.trim(cmdH), " "), [cmdH]);
  const normalizedCommand = useMemo(
    () => _.toLower(commandArray[0]),
    [commandArray]
  );
  const validCommand = useMemo(
    () => _.find(commands, { cmd: normalizedCommand }),
    [normalizedCommand]
  );

  const contextValue = useMemo(
    () => ({
      arg: _.drop(commandArray),
      history: cmdHistory,
      rerender,
      index,
    }),
    [commandArray, cmdHistory, rerender, index]
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
};

// 使用React.memo优化，只有当props改变时才重新渲染
export default React.memo(CommandHistoryItem, (prevProps, nextProps) => {
  return (
    prevProps.cmdH === nextProps.cmdH &&
    prevProps.index === nextProps.index &&
    prevProps.rerender === nextProps.rerender &&
    prevProps.cmdHistory === nextProps.cmdHistory
  );
});

