import { Wrapper } from "../styles/Output.styled";
import { getFromLS } from "../../utils/storage";

const Env: React.FC = () => {
  const apiKey = getFromLS("OPENAI_API_KEY") || import.meta.env.OPENAI_API_KEY || "";
  const baseUrl =
    getFromLS("OPENAI_BASE_URL") ||
    (import.meta.env.OPENAI_BASE_URL as string | undefined) ||
    "https://api.openai.com/v1";
  const model =
    getFromLS("OPENAI_MODEL") ||
    (import.meta.env.OPENAI_MODEL as string | undefined) ||
    "gpt-4o-mini";
  const systemPrompt =
    (import.meta.env.OPENAI_SYSTEM_PROMPT as string | undefined) ||
    "You are an enthusiastic yet concise AI concierge for Foxiv's interactive terminal portfolio. Keep answers grounded in Foxiv's work and experience.";

  const maskedApiKey = apiKey
    ? apiKey.length <= 8
      ? "*".repeat(apiKey.length)
      : `${"*".repeat(apiKey.length - 4)}${apiKey.slice(-4)}`
    : "<not set>";

  return (
    <Wrapper data-testid="env">
      <div>OPENAI_API_KEY={maskedApiKey}</div>
      <div>OPENAI_BASE_URL={baseUrl}</div>
      <div>OPENAI_MODEL={model}</div>
    </Wrapper>
  );
};

export default Env;
