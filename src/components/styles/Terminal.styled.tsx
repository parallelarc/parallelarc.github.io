import styled, { keyframes } from "styled-components";

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
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
`;

export const PromptBlock = styled.span`
  color: ${({ theme }) => theme.colors?.primary || "#3b82f6"};
`;

export const Input = styled.input`
  flex-grow: 1;

  &::placeholder {
    color: ${({ theme }) => theme.colors?.text[300]};
  }

  @media (max-width: 550px) {
    min-width: 85%;
  }
`;

export const InputHint = styled.div`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.text[300]};
`;

export const Hints = styled.span`
  margin-right: 0.875rem;
`;

const scanline = keyframes`
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.4;
  }
`;

const glitch = keyframes`
  0% {
    clip-path: inset(40% 0 61% 0);
    transform: skew(0.9deg);
  }
  20% {
    clip-path: inset(10% 0 35% 0);
    transform: skew(0.7deg);
  }
  40% {
    clip-path: inset(80% 0 5% 0);
    transform: skew(1deg);
  }
  60% {
    clip-path: inset(50% 0 30% 0);
    transform: skew(0.4deg);
  }
  80% {
    clip-path: inset(20% 0 50% 0);
    transform: skew(0.8deg);
  }
  100% {
    clip-path: inset(40% 0 61% 0);
    transform: skew(0.9deg);
  }
`;

export const CrashWrapper = styled.div`
  min-height: calc(100vh - 2rem);
  width: 100%;
  padding: clamp(2rem, 6vw, 4rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
  position: relative;
  overflow: hidden;
  background: radial-gradient(
      circle at 20% 20%,
      rgba(255, 0, 128, 0.25),
      transparent 45%
    ),
    radial-gradient(
      circle at 80% 0%,
      rgba(0, 255, 199, 0.2),
      transparent 30%
    ),
    ${({ theme }) => theme.colors?.body};
  color: ${({ theme }) => theme.colors?.text[100]};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      rgba(255, 255, 255, 0.02) 0%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(255, 255, 255, 0.02) 100%
    );
    mix-blend-mode: overlay;
    animation: ${scanline} 3s ease-in-out infinite;
    pointer-events: none;
  }
`;

export const CrashBadge = styled.span`
  letter-spacing: 0.4em;
  font-size: 0.75rem;
  text-transform: uppercase;
  padding: 0.35rem 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors?.text[300]};
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(6px);
`;

export const CrashTitle = styled.h2`
  font-size: clamp(2.25rem, 7vw, 3.75rem);
  text-transform: uppercase;
  letter-spacing: 0.35rem;
  margin: 0;
  position: relative;

  &::after {
    content: attr(data-glitch);
    position: absolute;
    inset: 0;
    left: 2px;
    text-shadow: -2px 0 ${({ theme }) => theme.colors?.primary};
    color: ${({ theme }) => theme.colors?.text[300]};
    mix-blend-mode: difference;
    animation: ${glitch} 2.5s infinite;
    pointer-events: none;
  }
`;

export const CrashMessage = styled.p`
  margin: 0;
  max-width: 36rem;
  line-height: 1.6;
  font-size: 1rem;
`;

export const CrashHint = styled.p`
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors?.text[300]};
`;

export const CrashButton = styled.button`
  margin-top: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors?.text[200]};
  color: ${({ theme }) => theme.colors?.text[100]};
  background: transparent;
  padding: 0.65rem 1.5rem;
  font-size: 0.95rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors?.primary};
    color: ${({ theme }) => theme.colors?.body};
  }
`;
