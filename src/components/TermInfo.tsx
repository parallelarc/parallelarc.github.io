import { ClaudePrompt } from "./styles/TerminalInfo.styled";

type TermInfoProps = {
	isChatMode?: boolean;
};

const TermInfo = ({ isChatMode }: TermInfoProps) => {
	// Claude Code 风格的提示符
	return <ClaudePrompt>❯</ClaudePrompt>;
};

export default TermInfo;
