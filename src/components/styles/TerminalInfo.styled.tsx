import styled from "styled-components";

export const Wrapper = styled.span`
  display: inline-block;
  margin-right: 0.75rem;
`;

export const WebsiteName = styled.span`
  color: ${({ theme }) => theme.colors?.primary};
`;

export const User = styled.span`
  color: ${({ theme }) => theme.colors?.secondary};
`;

// Claude Code 风格的输入容器
export const ClaudeInputContainer = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 0.8rem;
  padding-top: 0.35rem;
  background:
    linear-gradient(
      to top,
      ${({ theme }) => theme.colors?.body || "#0f172a"} 68%,
      rgba(0, 0, 0, 0)
    );
  backdrop-filter: blur(2px);
`;

// 上横线
export const ClaudeTopLine = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors?.text[300] || "rgba(255, 255, 255, 0.3)"};
  margin-bottom: -0.05rem;
`;

// 输入区域
export const ClaudeInputArea = styled.div`
  display: flex;
  align-items: center;
  padding: 0.42rem 0;
`;

// Claude Code 风格的提示符
export const ClaudePrompt = styled.span`
  color: ${({ theme }) => theme.colors?.primary || "#3b82f6"};
  font-weight: 500;
  user-select: none;
  margin-right: 0.5rem;
`;

// 历史命令中的提示符 - 暗淡的绿色
export const HistoryPrompt = styled.span`
  color: ${({ theme }) => theme.colors?.primary || "rgba(5, 206, 145, 0.8)"};
  font-weight: 450;
  user-select: none;
  margin-right: 0.4rem;
`;

// 下横线
export const ClaudeBottomLine = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors?.text[300] || "rgba(255, 255, 255, 0.3)"};
  margin-top: 0;
`;
