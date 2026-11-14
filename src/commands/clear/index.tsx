import { useEffect } from "react";
import { useTerminalStore } from "../../stores/terminalStore";

export default function Clear() {
  const clearHistory = useTerminalStore(s => s.clearHistory);
  useEffect(() => clearHistory(), [clearHistory]);
  return null;
}
