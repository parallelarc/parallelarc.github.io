import { User, WebsiteName, Wrapper } from "./styles/TerminalInfo.styled";

type TermInfoProps = {
	isChatMode?: boolean;
};

const TermInfo = ({ isChatMode }: TermInfoProps) => {
	return (
		<Wrapper>
			<User>visitor</User>@<WebsiteName>foxiv</WebsiteName>:
			{isChatMode ? "[llm]$" : "~$"}
		</Wrapper>
	);
};

export default TermInfo;
