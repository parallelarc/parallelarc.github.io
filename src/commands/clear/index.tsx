import { useContext, useEffect } from "react";
import { UsageDiv } from "../../components/styles/Output.styled";
import { termContext } from "../../components/Terminal";

function Clear() {
  const { arg, clearHistory } = useContext(termContext);

  useEffect(() => {
    if (arg.length < 1) clearHistory?.();
  }, [arg, clearHistory]);

  return arg.length > 0 ? <UsageDiv>Usage: clear</UsageDiv> : <></>;
}

export default Clear;
