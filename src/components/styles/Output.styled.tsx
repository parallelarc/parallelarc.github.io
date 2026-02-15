import styled from "styled-components";

// 基础输出样式 - 供复用
const BaseOutputStyle = styled.div`
  margin-left: 1.2rem;
  padding: 0.08rem 0 0.08rem 0.9rem;
  position: relative;
  margin-top: 0.16rem;
  margin-bottom: 0.7rem;
  line-height: 1.5rem;
  color: ${({ theme }) => theme.colors?.text[200] || "rgba(203, 213, 225, 0.7)"};
  border-left: 1px solid ${({ theme }) => theme.colors?.text[300] || "rgba(255, 255, 255, 0.18)"};
`;

export const OutputContainer = styled(BaseOutputStyle)``;

export const Wrapper = styled.div`
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
`;

export const UsageDiv = styled(BaseOutputStyle)<{ marginY?: boolean }>`
  ${({ marginY }) =>
    marginY &&
    `
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  `}
`;

export const AiResponseText = styled.pre`
  margin: 0;
  font-family: inherit;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: ${({ theme }) => theme.colors?.text[100] || "#d7dde5"};
`;

export const AiMeta = styled.div`
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.text[300] || "rgba(255, 255, 255, 0.45)"};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

// 导出基础样式供其他文件复用
export { BaseOutputStyle };
