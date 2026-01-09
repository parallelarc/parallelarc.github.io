import { useContext, useEffect } from "react";
import { UsageDiv } from "../styles/Output.styled";
import { termContext } from "../Terminal";

function Clear() {
  const { arg, clearHistory } = useContext(termContext);

  useEffect(() => {
    if (arg.length < 1) clearHistory?.();
  }, [arg, clearHistory]);

  return arg.length > 0 ? <UsageDiv>Usage: clear</UsageDiv> : <></>;
}

export default Clear;
