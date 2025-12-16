import { useContext } from "react";
import {
  HiContainer,
  ChatLine,
  RoleTag,
  MessageText,
  StatusText,
  LoadingDots,
} from "../styles/Commands.styled";
import { termContext } from "../Terminal";

const Hi: React.FC = () => {
  const {
    chat: { messages, loading, error },
  } = useContext(termContext);

  return (
    <HiContainer data-testid="hi-command">
      {messages.map((message, index) => {
        const isFirstAssistantBanner =
          index === 0 && message.role === "assistant";
        return (
          <ChatLine key={`${message.role}-${index}`} $role={message.role}>
            {!isFirstAssistantBanner && message.role === "user" && (
              <RoleTag role={message.role}>› YOU</RoleTag>
            )}
            <MessageText $role={message.role}>{message.content}</MessageText>
          </ChatLine>
        );
      })}

      {loading && (
        <StatusText $variant="muted">
          <LoadingDots>...</LoadingDots>
        </StatusText>
      )}
      {error && (
        <StatusText $variant="error" role="alert">
          {error}
        </StatusText>
      )}
    </HiContainer>
  );
};

export default Hi;
