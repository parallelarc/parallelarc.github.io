import styled from "styled-components";

export const HelpWrapper = styled.div`
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
`;

export const CmdList = styled.div`
  margin-bottom: 0.25rem;
`;

export const Cmd = styled.span`
  color: ${({ theme }) => theme.colors?.primary};
`;

export const CmdLink = styled.a`
  color: ${({ theme }) => theme.colors?.secondary};
  text-decoration: none;
  line-height: 1.5rem;
  white-space: nowrap;
  border-bottom: 2px dashed ${({ theme }) => theme.colors?.secondary};
  font-weight: 600;

  &:hover,
  &:focus-visible {
    border-bottom-style: solid;
  }
`;

export const CmdDesc = styled.span`
  color: ${({ theme }) => theme.colors?.text[200]};
  margin-bottom: 0.75rem;

  @media (max-width: 550px) {
    display: block;
  }
`;

export const KeyContainer = styled.div`
  font-size: 0.875rem;
  margin-top: 1rem;

  @media (max-width: 550px) {
    display: none;
  }

  div {
    margin-top: 0.25rem;
  }
`;
