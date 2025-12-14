import styled from "styled-components";

export const Wrapper = styled.div`
  position: relative;
  padding: 1.25rem;
  padding-top: 0.75rem;

  display: flex;
  flex-direction: column-reverse;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
`;

export const CopyToast = styled.div`
  position: fixed;
  top: 0.85rem;
  right: clamp(1rem, 4vw, 2.5rem);
  z-index: 20;
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors?.primary};
  color: ${({ theme }) => theme.colors?.text[100]};
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  animation: fadeSlide 2.6s ease forwards;

  @media (max-width: 640px) {
    left: 1rem;
    right: 1rem;
    justify-content: center;
  }

  @keyframes fadeSlide {
    0% {
      opacity: 0;
      transform: translateY(-6px);
    }
    8% {
      opacity: 1;
      transform: translateY(0);
    }
    92% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-6px);
    }
  }
`;

export const CmdNotFound = styled.div`
  margin-top: 0.25rem;
  margin-bottom: 1rem;
`;

export const Empty = styled.div`
  margin-bottom: 0.25rem;
`;

export const MobileSpan = styled.span`
  line-height: 1.5rem;
  margin-right: 0.75rem;

  @media (min-width: 550px) {
    display: none;
  }
`;

export const MobileBr = styled.br`
  @media (min-width: 550px) {
    display: none;
  }
`;

export const Form = styled.form`
  @media (min-width: 550px) {
    display: flex;
  }
`;

export const Input = styled.input`
  flex-grow: 1;

  @media (max-width: 550px) {
    min-width: 85%;
  }
`;

export const Hints = styled.span`
  margin-right: 0.875rem;
`;
