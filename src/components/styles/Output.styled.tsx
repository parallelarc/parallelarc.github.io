import styled from "styled-components";

// 基础输出样式 - 供复用
const BaseOutputStyle = styled.div`
  padding-left: 2.4rem;
  position: relative;
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
  line-height: 1.5rem;
  color: ${({ theme }) => theme.colors?.text[200] || "rgba(203, 213, 225, 0.7)"};

  &::before {
    content: "⎿";
    position: absolute;
    left: 1.2rem;
    top: -0.35rem;
    color: ${({ theme }) => theme.colors?.text[400] || "rgba(255, 255, 255, 0.35)"};
    font-weight: 300;
  }
`;

export const OutputContainer = styled(BaseOutputStyle)``;

export const Wrapper = styled.div`
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
`;

export const UsageDiv = styled(BaseOutputStyle)``;

// 导出基础样式供其他文件复用
export { BaseOutputStyle };
