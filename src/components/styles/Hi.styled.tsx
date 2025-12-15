import styled from "styled-components";

export const HiContainer = styled.div`
  margin: 0.25rem 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

export const ChatLine = styled.div<{ $role: "assistant" | "user" }>`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: ${({ $role }) =>
    $role === "assistant" ? "rgba(255, 255, 255, 0.02)" : "transparent"};
  border-left: 2px solid
    ${({ $role, theme }) =>
      $role === "user"
        ? theme.colors?.primary || theme.colors?.text[100]
        : theme.colors?.text[300]};
`;

export const RoleTag = styled.span<{ role: "assistant" | "user" }>`
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ role, theme }) =>
    role === "user"
      ? theme.colors?.primary || theme.colors?.text[100]
      : theme.colors?.text[300]};
`;

export const MessageText = styled.p<{ $role: "assistant" | "user" }>`
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
  color: ${({ $role, theme }) =>
    $role === "user" ? theme.colors?.text[100] : theme.colors?.text[200]};
`;

export const StatusText = styled.p<{ $variant?: "error" | "muted" }>`
  font-size: 0.85rem;
  margin: 0;
  color: ${({ $variant, theme }) => {
    if ($variant === "error") return "#ff8ba7";
    if ($variant === "muted") return theme.colors.text[300];
    return theme.colors.text[200];
  }};
`;

export const LoadingDots = styled.span`
  display: inline-block;
  animation: pulse 1s ease-in-out infinite;

  @keyframes pulse {
    0% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.4;
    }
  }
`;
