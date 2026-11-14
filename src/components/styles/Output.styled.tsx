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

export const AiResponseText = styled.div`
  margin: 0;
  font-family: inherit;
  font-size: 0.95rem;
  white-space: normal;
  word-break: break-word;
  color: ${({ theme }) => theme.colors?.text[100] || "#d7dde5"};

  p {
    margin: 0.12rem 0 0.42rem;
    line-height: 1.55;
  }

  p:first-child {
    margin-top: 0;
  }

  p:last-child {
    margin-bottom: 0;
  }

  strong {
    color: ${({ theme }) => theme.colors?.text[100] || "#f1f5f9"};
    font-weight: 700;
  }

  em {
    font-style: italic;
  }

  code {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.88em;
    background: rgba(148, 163, 184, 0.15);
    border-radius: 0.2rem;
    padding: 0.08rem 0.25rem;
  }

  pre {
    margin: 0.2rem 0 0.5rem;
    padding: 0.5rem 0.65rem;
    border-radius: 0.35rem;
    background: rgba(2, 6, 23, 0.5);
    overflow-x: auto;
  }

  pre code {
    background: transparent;
    padding: 0;
  }

  ul,
  ol {
    margin: 0.2rem 0 0.5rem;
    padding-left: 1.25rem;
  }

  li {
    margin: 0.14rem 0;
  }

  blockquote {
    margin: 0.2rem 0 0.5rem;
    padding-left: 0.75rem;
    border-left: 2px solid ${({ theme }) => theme.colors?.text[300] || "rgba(255, 255, 255, 0.25)"};
    color: ${({ theme }) => theme.colors?.text[200] || "rgba(203, 213, 225, 0.75)"};
  }

  a {
    color: ${({ theme }) => theme.colors?.secondary || "#f59e0b"};
    text-decoration: underline;
    text-decoration-style: dashed;
  }

  table {
    border-collapse: collapse;
    margin: 0.2rem 0 0.55rem;
    width: 100%;
    font-size: 0.9em;
  }

  th,
  td {
    border: 1px solid ${({ theme }) => theme.colors?.text[300] || "rgba(255, 255, 255, 0.22)"};
    padding: 0.25rem 0.45rem;
    text-align: left;
    vertical-align: top;
  }

  th {
    color: ${({ theme }) => theme.colors?.text[100] || "#f1f5f9"};
    background: rgba(148, 163, 184, 0.11);
  }

  input[type="checkbox"] {
    margin-right: 0.35rem;
    accent-color: ${({ theme }) => theme.colors?.primary || "#05ce91"};
  }
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
