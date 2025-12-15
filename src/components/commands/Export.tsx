import { useContext, useEffect, useState } from "react";
import { UsageDiv } from "../styles/Output.styled";
import { termContext } from "../Terminal";
import { setToLS } from "../../utils/storage";

const ExportCmd: React.FC = () => {
  const { arg, setEnv } = useContext(termContext);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    setMessage("");

    if (!setEnv) {
      setMessage("export is not available in this context.");
      return;
    }

    if (arg.length === 0) {
      setMessage(
        "Usage: export OPENAI_API_KEY=<value> | OPENAI_BASE_URL=<url> | OPENAI_MODEL=<model>"
      );
      return;
    }

    let name: string | undefined;
    let value: string | undefined;

    if (arg.length === 1 && arg[0].includes("=")) {
      const [k, ...rest] = arg[0].split("=");
      name = k;
      value = rest.join("=");
    } else {
      name = arg[0];
      value = arg.slice(1).join(" ");
    }

    if (!name || !value) {
      setMessage("Usage: export VAR=value");
      return;
    }

    const upper = name.toUpperCase();

    if (upper === "OPENAI_SYSTEM_PROMPT") {
      setMessage("OPENAI_SYSTEM_PROMPT cannot be modified from this terminal.");
      return;
    }

    const supported = ["OPENAI_API_KEY", "OPENAI_BASE_URL", "OPENAI_MODEL"];

    if (!supported.includes(upper)) {
      setMessage(
        `Unsupported variable: ${name}. Supported: ${supported.join(", ")}`
      );
      return;
    }

    setEnv(upper, value);
    setToLS(upper, value);
  }, [arg, setEnv]);

  if (!message) return null;

  return (
    <UsageDiv data-testid="export">
      {message}
    </UsageDiv>
  );
};

export default ExportCmd;
