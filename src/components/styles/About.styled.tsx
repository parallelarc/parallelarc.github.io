import styled from "styled-components";

export const AboutWrapper = styled.div`
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
  p {
    margin-top: 0.5rem;
    line-height: 1.5rem;
  }
`;

export const Divider = styled.div`
  margin: 0.75rem 0;
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.colors?.text[300]};
  opacity: 0.35;
`;

export const HighlightSpan = styled.span`
  font-weight: 700;
`;

export const HighlightAlt = styled.span`
  font-weight: 700;
`;

export const Link = styled.a`
  color: ${({ theme }) => theme.colors?.secondary};
  text-decoration: none;
  line-height: 1.5rem;
  white-space: nowrap;
  border-bottom: 2px dashed ${({ theme }) => theme.colors?.secondary};

  &:hover {
    border-bottom-style: solid;
  }
`;
