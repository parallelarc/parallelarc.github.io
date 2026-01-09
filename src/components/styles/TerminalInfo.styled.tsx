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
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 1rem;
`;

// 上横线
export const ClaudeTopLine = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors?.text[300] || "rgba(255, 255, 255, 0.3)"};
  margin-bottom: -0.1rem;
`;

// 输入区域
export const ClaudeInputArea = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
`;

// Claude Code 风格的提示符
export const ClaudePrompt = styled.span`
  color: ${({ theme }) => theme.colors?.primary || "#3b82f6"};
  font-weight: 500;
  user-select: none;
  margin-right: 0.5rem;
`;

// 下横线
export const ClaudeBottomLine = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors?.text[300] || "rgba(255, 255, 255, 0.3)"};
  margin-top: 0.rem;
`;
